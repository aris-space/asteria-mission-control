use crate::parser::{cut_diagram_xml, parse_diagram_xml, statemachine::config::RemoteComputerConfig};
use html_parser::Dom;
use serde::Serialize;
use std::{
    collections::{HashMap, HashSet},
    fs,
};
use utoipa::ToSchema;

pub mod config;

#[derive(Debug, thiserror::Error)]
pub enum StateMachineError {
    #[error("Error whilst reading state machine config: {0}")]
    ConfigRead(std::io::Error),
    #[error("Error whilst deserializing state machine config: {0}")]
    ConfigParse(toml::de::Error),
    #[error("Error whilst reading state machine diagram: {0}")]
    DiagramRead(std::io::Error),
    #[error("State machine config references the following undefined states: {0:?}")]
    ConfigMissingStates(Vec<String>),
    #[error("Error whilst parsing state machine diagram: {0}")]
    DiagramParse(quick_xml::de::DeError),
    #[error("Error whilst parsing state machine diagram nodes: {0}")]
    DiagramNodeParse(html_parser::Error),
    #[expect(unused)]
    #[error("State machine diagram contains duplicate state definitions for the following states: {0:?}")]
    DiagramDuplicateStates(Vec<String>),
    #[expect(unused)]
    #[error("State machine diagram config references the following states which are missing in the diagram: {0:?}")]
    DiagramMissingStates(Vec<String>),
}

/// Representation of a state machine diagram.
#[derive(Debug, Serialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StateMachine {
    /// State machine diagram SVG without the drawio XML content.
    pub diagram: String,
    /// Allowed manual transitions for every state.
    pub manual_transitions: HashMap<String, Vec<String>>,
    /// Initial state of the state machine.
    pub initial_state: String,
    /// Mapping of state names to diagram cell ids.
    pub state_nodes: HashMap<String, String>,
}

impl TryFrom<&crate::config::StateMachineConfig> for StateMachine {
    type Error = StateMachineError;

    fn try_from(value: &crate::config::StateMachineConfig) -> Result<Self, Self::Error> {
        let config_str = fs::read_to_string(&value.config_path).map_err(StateMachineError::ConfigRead)?;
        let diagram_str = fs::read_to_string(&value.diagram_path).map_err(StateMachineError::DiagramRead)?;

        let config = toml::from_str::<RemoteComputerConfig>(&config_str).map_err(StateMachineError::ConfigParse)?;
        // Read the state machine config and ensure that all manual transitions are valid.
        // This means that the source and the target of a transition need to be defined in
        // the config.
        let (missing_states, manual_transitions) = config.state_machine.states.iter().fold(
            (Vec::new(), HashMap::new()),
            |(mut missing, mut manual), (state, state_config)| {
                let mut transitions = Vec::new();
                state_config.manual_transitions.iter().for_each(|transition| {
                    if !config.state_machine.states.contains_key(transition.target()) {
                        missing.push(transition.target().clone());
                    } else {
                        transitions.push(transition.target().clone());
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

        #[expect(unused_mut)]
        // All unique labels we have in the diagram. Note that we always use the first
        // string of a cell's value as it's state name.
        let mut unique_state_labels = HashSet::<String>::from_iter(state_node_labels.iter().cloned());

        // Check whether there are duplicate labels in the diagram.
        // We can only check for duplicate labels which are also defined in the state machine
        // config since we match all text boxes as possible state boxes and text boxes
        // are allowed to have duplicate string values.
        if unique_state_labels.len() < state_node_labels.len() {
            // TODO: Enable this once we have a state machine diagram which does not contain any duplicate states
            // let mut duplicates = Vec::new();
            // state_node_labels.iter().for_each(|label| {
            // if !unique_state_labels.remove(label) && config.state_machine.states.contains_key(label) {
            // duplicates.push(label.clone());
            // }
            // });
            // Err(StateMachineError::DiagramDuplicateStates(duplicates))?;
        }

        let mut state_nodes = HashMap::from_iter(state_node_labels.into_iter().zip(state_node_ids));

        // States from the config which are not defined in the diagram.
        let missing_states = config
            .state_machine
            .states
            .keys()
            .filter(|&key| !unique_state_labels.contains(key))
            .cloned()
            .collect::<Vec<_>>();

        // Check whether there are any states which are defined in the config but not
        // available in the diagram.
        if !missing_states.is_empty() {
            // TODO: Enable this once we have a config which only specifies states which are
            //       also part of the state machine
            // Err(StateMachineError::DiagramMissingStates(missing_states))?;
        }

        // Only keep all nodes which are declared in config
        // this is needed as we also treat text boxes as possible nodes.
        state_nodes.retain(|label, _| config.state_machine.states.contains_key(label));

        Ok(Self { diagram: svg, manual_transitions, initial_state: config.state_machine.initial_state, state_nodes })
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
