//! This module is used to parse remote computer configs for the mission control purposes.
//! It's only a partial representation of a remote computer config.
//! The full remote computer config specification can be found here:
//! <https://github.com/aris-space/asteria-remote-computers/>

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Deserialize)]
pub struct RemoteComputerConfig {
    pub state_machine: StateMachineConfig,
    #[serde(default)]
    pub telemetry: TelemetryConfig,
    pub gnc_polygon: Option<GncPolygon>,
}

#[derive(Debug, Deserialize, Serialize, Clone, utoipa::ToSchema)]
pub struct GncPolygon {
    /// Latitude-longitude pair of the origin of the bounding polygon.
    origin: [f64; 2],
    /// Points which span the polygon.
    /// Every point is a tuple of distances in meters to the north- and east
    /// of the origin.
    points: Vec<[f64; 2]>,
}

#[derive(Deserialize, Default)]
pub struct TelemetryConfig {
    #[serde(default)]
    pub always_allowed_actuators: Vec<String>,
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
