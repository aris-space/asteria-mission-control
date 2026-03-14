use std::collections::HashMap;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RemoteComputerConfig {
    pub state_machine: StateMachineConfig,
}

#[derive(Deserialize)]
pub struct StateMachineConfig {
    pub initial_state: String,
    pub states: HashMap<String, StateMachineStateConfig>,
}

#[derive(Deserialize)]
pub struct StateMachineStateConfig {
    #[serde(default)]
    pub manual_transitions: Vec<StateMachineTransition>,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum StateMachineTransition {
    Default(String),
    Full { target: String },
}

impl StateMachineTransition {
    pub fn target(&self) -> &String {
        match self {
            StateMachineTransition::Default(target) | StateMachineTransition::Full { target, .. } => target,
        }
    }
}
