//! This module is used to parse remote computer configs for the mission control purposes.
//! It's only a partial representation of a remote computer config.
//! The full remote computer config specification can be found here:
//! <https://github.com/aris-space/asteria-remote-computers/>

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// The name of the state machine state which contains the GNC polygon definition.
/// This is a very dirty "solution" to read the GNC polygon from the remote computer
/// config but since this state name _should_ not change, this will hopefully be fine.
pub const GNC_POLYGON_STATE_NAME: &str = "Control Loop";

#[derive(Deserialize)]
pub struct RemoteComputerConfig {
    pub state_machine: StateMachineConfig,
    #[serde(default)]
    pub telemetry: TelemetryConfig,
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
    #[serde(default)]
    pub gnc_config: Option<GncConfig>,
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

// For all of those GNC-related structs we have to do heavy renaming because their
// field names aren't really what we want. Especially, because [`GncPolygon`] should
// be serializable, we want to have a nicer structure than what they use in the
// remote computer config.

#[derive(Deserialize)]
pub struct GncConfig {
    #[serde(rename = "gnc")]
    pub polygon: Option<GncPolygon>,
}

#[derive(Debug, Deserialize, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all(serialize = "camelCase"))]
/// Utoipa does not support `rename_all(serialize = "...")`. But since Utoipa
/// is anyways only concerned with the serialized version, we can just explicitly
/// rename it for both operations in the schema.
#[schema(rename_all = "camelCase")]
pub struct GncPolygon {
    /// Latitude of the origin of the bounding polygon.
    #[serde(rename(deserialize = "ned_origin_lat"))]
    pub origin_lat: f64,
    /// Longitude of the origin of the bounding polygon.
    #[serde(rename(deserialize = "ned_origin_lng"))]
    pub origin_lng: f64,
    #[serde(flatten)]
    pub inner: GncPolygonInner,
}

#[derive(Debug, Deserialize, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct GncPolygonInner {
    /// Points which span the polygon.
    /// Every point is a tuple of distances in meters to the north- and east
    /// of the origin.
    #[serde(rename(deserialize = "bounding_polygon"))]
    pub points: Vec<[f64; 2]>,
}
