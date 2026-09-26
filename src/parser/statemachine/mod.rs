use crate::parser::{cut_diagram_xml, parse_diagram_xml};
use crate::remote::config::RemoteComputerConfig;

use asteria_datapoint_information::datapoint::DatapointHolder;
use asteria_messages::Message;
use html_parser::Dom;
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
use utoipa::ToSchema;

#[derive(Debug, thiserror::Error)]
pub enum StateMachineError {
    #[error("Error whilst reading state machine diagram at '{0}': {1}")]
    DiagramRead(String, std::io::Error),
    #[error("Remote computer config references the following undefined states: {0:?}")]
    ConfigMissingStates(Vec<String>),
    #[error("Remote computer config references the following undefined actuators: {0:?}")]
    ConfigInvalidActuators(Vec<String>),
    #[error("Error whilst parsing state machine diagram: {0}")]
    DiagramParse(quick_xml::de::DeError),
    #[error("Error whilst parsing state machine diagram nodes: {0}")]
    DiagramNodeParse(html_parser::Error),
    #[error("State machine diagram contains duplicate state definitions for the following states: {0:#?}")]
    DiagramDuplicateStates(Vec<String>),
    #[error("Remote computer config references the following states which are missing in the diagram: {0:#?}")]
    DiagramMissingStates(Vec<String>),
}

/// Representation of a state machine diagram.
#[derive(Debug, Serialize, ToSchema, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct StateMachine {
    /// State machine diagram SVG without the drawio XML content.
    pub diagram: String,
    /// Allowed manual transitions for every state and whether they
    /// are an abort transition.
    pub manual_transitions: HashMap<String, Vec<(String, bool)>>,
    /// Allowed actuators for every state.
    pub allowed_actuators: HashMap<String, Vec<String>>,
    /// Initial state of the state machine.
    pub initial_state: String,
    /// Mapping of state names to diagram cell ids.
    pub state_nodes: HashMap<String, String>,
}

impl StateMachine {
    pub fn new(rc_config: &RemoteComputerConfig, configs_repository_path: &Path) -> Result<Self, StateMachineError> {
        let raw_diagram_path = configs_repository_path.join(&rc_config.state_machine.diagram_path);
        let diagram_path = match fs::canonicalize(&raw_diagram_path) {
            Ok(path) => path,
            Err(err) => return Err(StateMachineError::DiagramRead(raw_diagram_path.display().to_string(), err)),
        };

        let diagram_str = fs::read_to_string(&diagram_path)
            .map_err(|err| StateMachineError::DiagramRead(diagram_path.display().to_string(), err))?;

        // Read the state machine config and ensure that all manual transitions are valid.
        // This means that the source and the target of a transition need to be defined in
        // the config.
        let (missing_states, manual_transitions) = rc_config.state_machine.states.iter().fold(
            (Vec::new(), HashMap::new()),
            |(mut missing, mut manual), (state, state_config)| {
                let mut transitions = Vec::new();
                state_config.manual_transitions.iter().for_each(|transition| {
                    if !rc_config.state_machine.states.contains_key(transition.target()) {
                        missing.push(transition.target().clone());
                    } else {
                        transitions.push((transition.target().clone(), transition.is_abort()));
                    }
                });
                manual.insert(state.clone(), transitions);
                (missing, manual)
            },
        );

        // Check whether any transitions reference undefined states.
        if !missing_states.is_empty() {
            Err(StateMachineError::ConfigMissingStates(missing_states))?;
        }

        let (xml, svg) = cut_diagram_xml(&diagram_str).map_err(StateMachineError::DiagramParse)?;
        let diagram = parse_diagram_xml::<()>(&xml).map_err(StateMachineError::DiagramParse)?;

        let (state_node_labels, state_node_ids) = diagram
            .cells
            .into_iter()
            .filter_map(|cell| cell.vertex.then_some(cell.value).flatten().map(|value| (cell.id, value)))
            .filter_map(|(id, value)| match Dom::parse(&value) {
                Ok(dom) => child_text(&dom.children).map(|label| Ok((label, id))),
                Err(err) => Some(Err(StateMachineError::DiagramNodeParse(err))),
            })
            .collect::<Result<(Vec<_>, Vec<_>), _>>()?;

        // All unique labels we have in the diagram. Note that we always use the first
        // string of a cell's value as it's state name.
        let unique_state_labels = HashSet::<String>::from_iter(state_node_labels.iter().cloned());
        log::debug!("Detected labels in state machine: {unique_state_labels:#?}");

        // Check whether there are duplicate labels in the diagram.
        // We can only check for duplicate labels which are also defined in the state machine
        // config since we match all text boxes as possible state boxes and text boxes
        // are allowed to have duplicate string values.
        if unique_state_labels.len() < state_node_labels.len() {
            let mut duplicates = Vec::new();
            let mut unique_state_labels_copy = unique_state_labels.clone();
            state_node_labels.iter().for_each(|label| {
                if !unique_state_labels_copy.remove(label) && rc_config.state_machine.states.contains_key(label) {
                    duplicates.push(label.clone());
                }
            });

            // Check that there was at least one duplicate state name. Since all cells which contain a
            // string are matched as possible states, it's very likely that we have duplicate names e.g.
            // as part of the diagram legend etc.
            if !duplicates.is_empty() {
                Err(StateMachineError::DiagramDuplicateStates(duplicates))?;
            }
        }

        let mut state_nodes = HashMap::from_iter(state_node_labels.into_iter().zip(state_node_ids));

        // States from the config which are not defined in the diagram.
        let missing_states = rc_config
            .state_machine
            .states
            .keys()
            .filter(|&state_name| {
                if unique_state_labels.contains(state_name) {
                    return false;
                }

                if state_name.ends_with(" - W") {
                    // It's okay to "miss" this state as long as the same state without
                    // postfix exists.
                    return !unique_state_labels.contains(&state_name[..state_name.len() - 4]);
                }

                let split = state_name.split(" ").collect::<Vec<_>>();
                match split.as_slice() {
                    [state_name @ .., postfix] if postfix.parse::<u32>().is_ok() => {
                        // State names with postfix (e.g. "Spiral 2") are okay to "miss" as long
                        // as the same state without postfix exists.
                        !unique_state_labels.contains(&state_name.join(" "))
                    }
                    // State does not exist and it doesn't have a postfix. This is a real miss.
                    _ => true,
                }
            })
            .cloned()
            .collect::<Vec<_>>();

        // Check whether there are any states which are defined in the config but not
        // available in the diagram.
        if !missing_states.is_empty() {
            Err(StateMachineError::DiagramMissingStates(missing_states))?;
        }

        // Only keep all nodes which are declared in config
        // this is needed as we also treat text boxes as possible nodes.
        state_nodes.retain(|label, _| rc_config.state_machine.states.contains_key(label));

        // Check whether the config references any invalid actuators in the `allowed_actuators`
        // field of any state, or in `always_allowed_actuators` from telemetry.
        let mut invalid_actuators = Vec::new();

        let invalid_always_allowed = rc_config
            .telemetry
            .always_allowed_actuators
            .iter()
            .filter(|actuator| !Message::DATAPOINTS.iter().any(|dp| dp.name == *actuator))
            .cloned()
            .collect::<Vec<_>>();
        invalid_actuators.extend(invalid_always_allowed);

        let allowed_actuators = rc_config
            .state_machine
            .states
            .iter()
            .filter_map(|(name, state)| {
                let invalid_state_actuators = state
                    .allowed_actuators
                    .iter()
                    .filter(|actuator| !Message::DATAPOINTS.iter().any(|dp| dp.name == *actuator))
                    .cloned()
                    .collect::<Vec<_>>();
                if !invalid_state_actuators.is_empty() {
                    invalid_actuators.extend(invalid_state_actuators);
                    return None;
                }
                // Merge per-state allowed actuators with the always_allowed ones.
                let mut merged = state.allowed_actuators.clone();
                for always in &rc_config.telemetry.always_allowed_actuators {
                    if !merged.contains(always) {
                        merged.push(always.clone());
                    }
                }
                Some((name.clone(), merged))
            })
            .collect::<HashMap<_, _>>();

        if !invalid_actuators.is_empty() {
            Err(StateMachineError::ConfigInvalidActuators(invalid_actuators))?
        }

        Ok(Self {
            diagram: svg,
            manual_transitions,
            initial_state: rc_config.state_machine.initial_state.clone(),
            state_nodes,
            allowed_actuators,
        })
    }
}

/// Recursive method used to find the first child node which has a text node as it's first child.
/// Returns [`None`] should no such child node exist.
fn child_text(children: &[html_parser::Node]) -> Option<String> {
    match children.first() {
        Some(html_parser::Node::Text(label)) => Some(label.clone()),
        Some(html_parser::Node::Element(element)) => child_text(&element.children),
        _ => None,
    }
}

#[cfg(test)]
mod validate_configs {
    use super::*;
    use std::path::PathBuf;

    /// Recursively collects every `*.toml` file under `dir`.
    fn collect_toml_files(dir: &Path, out: &mut Vec<PathBuf>) {
        let Ok(entries) = fs::read_dir(dir) else {
            return;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_toml_files(&path, out);
            } else if path.extension().is_some_and(|ext| ext == "toml") {
                if path.components().any(|c| c.as_os_str() == "manual_actions") {
                    // skip manual actions
                    continue;
                }
                out.push(path);
            }
        }
    }

    /// Validates every remote computer config in the `remote-computers` submodule which
    /// declares a `[state_machine]` section against the diagram it references, using the
    /// same [`StateMachine::new`] check that runs against live telemetry in
    /// `ConfigInterceptor::lookup_state_machine_config`.
    ///
    /// See the "Validating state machine configs" section of the README for context.
    #[test]
    fn all_state_machine_configs_match_their_diagram() {
        let configs_repository_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("remote-computers");

        let mut toml_files = Vec::new();
        for remote_computer in ["rfs-computer", "flight-computer"] {
            collect_toml_files(&configs_repository_path.join(remote_computer).join("configs"), &mut toml_files);
        }
        println!("checking {} files", toml_files.len());

        let mut failures = Vec::new();
        for path in toml_files {
            let contents = fs::read_to_string(&path).expect("failed to read config file");
            let value: toml::Value = toml::from_str(&contents).expect("failed to parse config file as TOML");

            let rc_config: RemoteComputerConfig = match value.try_into() {
                Ok(config) => config,
                Err(err) => {
                    failures.push(format!("{}: failed to parse as RemoteComputerConfig: {err}", path.display()));
                    continue;
                }
            };

            if let Err(err) = StateMachine::new(&rc_config, &configs_repository_path) {
                failures.push(format!("{}: {err}", path.display()));
            }
        }

        assert!(failures.is_empty(), "state machine validation failed:\n{}", failures.join("\n"));
    }
}
