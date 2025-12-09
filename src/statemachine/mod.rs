use std::{collections::HashMap, fs};

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::statemachine::config::RemoteComputerConfig;

mod config;
mod parser;

#[derive(Debug, thiserror::Error)]
pub enum StateMachineError {
    #[error("Error whilst reading state machine config: {0}")]
    ConfigRead(std::io::Error),
    #[error("Error whilst deserializing state machine config: {0}")]
    ConfigParse(toml::de::Error),
    #[error("Error whilst reading state machine diagram: {0}")]
    DiagramRead(std::io::Error),
    #[error("Manual state transitions of state {0} reference unknown state {0}")]
    MissingConfigTransitionState(String, String),
    #[error("Error whilst parsing state machine diagram: {0}")]
    DiagramParse(quick_xml::de::DeError),
}

/// Representation of a state machine diagram
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct StateMachine {
    /// State machine diagram svg without the drawio xml content
    pub diagram: String,
    /// Allowed manual transitions for every state
    pub manual_transitions: HashMap<String, Vec<String>>,
    /// Initial state of the state machine
    pub initial_state: String,
}

impl TryFrom<&crate::config::StateMachine> for StateMachine {
    type Error = StateMachineError;

    fn try_from(value: &crate::config::StateMachine) -> Result<Self, Self::Error> {
        let config_str = fs::read_to_string(&value.config_path).map_err(StateMachineError::ConfigRead)?;
        let diagram_str = fs::read_to_string(&value.diagram_path).map_err(StateMachineError::DiagramRead)?;

        let config = toml::from_str::<RemoteComputerConfig>(&config_str).map_err(StateMachineError::ConfigParse)?;
        let mut manual_transitions = HashMap::new();

        for (state, state_config) in &config.state_machine.states {
            let mut transitions = Vec::new();
            for transition in &state_config.manual_transitions {
                if !config.state_machine.states.contains_key(transition.target()) {
                    Err(StateMachineError::MissingConfigTransitionState(state.clone(), transition.target().clone()))?
                } else {
                    transitions.push(transition.target().clone());
                }
            }
            manual_transitions.insert(state.clone(), transitions);
        }

        let (diagram_xml, diagram_svg) =
            parser::extract_diagram_xml(&diagram_str).map_err(StateMachineError::DiagramParse)?;
        let (_cells, (_width, _height)) =
            parser::parse_state_machine_xml(&diagram_xml).map_err(StateMachineError::DiagramParse)?;

        // TODO: Check here whether all states from the config are present in the diagram and also ensure
        //       that there are not multiple nodes representing the same state in the diagram
        //       => Those checks should probably only be added once we have an annotated state machine
        //          since otherwise it will be unusable locally
        //       => _cells can be used to do this check

        Ok(Self { diagram: diagram_svg, manual_transitions, initial_state: config.state_machine.initial_state })
    }
}
