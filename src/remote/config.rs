//! This module is used to parse remote computer configs for the mission control purposes.
//! It's only a partial representation of a remote computer config.
//! The full remote computer config specification can be found here:
//! <https://github.com/aris-space/asteria-remote-computers/>

use serde::Deserialize;
use std::{collections::HashMap, path::PathBuf};

#[derive(Deserialize)]
pub struct RemoteComputerConfig {
    pub state_machine: StateMachineConfig,
}

#[derive(Deserialize)]
pub struct StateMachineConfig {
    pub diagram_path: PathBuf,
    pub initial_state: String,
    pub states: HashMap<String, StateMachineStateConfig>,
}

#[derive(Deserialize)]
pub struct StateMachineStateConfig {
    #[serde(default)]
    pub manual_transitions: Vec<StateMachineTransition>,
    #[serde(default)]
    pub allowed_actuators: Vec<String>,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum StateMachineTransition {
    Default(String),
    Full {
        target: String,
        #[serde(default)]
        abort: bool,
    },
}

impl StateMachineTransition {
    pub fn target(&self) -> &String {
        match self {
            StateMachineTransition::Default(target) | StateMachineTransition::Full { target, .. } => target,
        }
    }

    pub fn is_abort(&self) -> bool {
        matches!(self, StateMachineTransition::Full { abort: true, .. })
    }
}
