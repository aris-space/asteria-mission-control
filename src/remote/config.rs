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

/// The polygon is either nested in a `gnc` table, or defined directly on the GNC
/// config (origin next to an `inner` table holding the `bounding_polygon`).
#[derive(Deserialize)]
#[serde(untagged)]
pub enum GncConfig {
    Nested {
        gnc: GncPolygon,
    },
    Flat(GncPolygon),
    /// Any config without a polygon definition.
    None {},
}

impl GncConfig {
    pub fn polygon(&self) -> Option<&GncPolygon> {
        match self {
            GncConfig::Nested { gnc: polygon } | GncConfig::Flat(polygon) => Some(polygon),
            GncConfig::None {} => None,
        }
    }
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
    #[serde(rename(deserialize = "ned_origin_lng"), alias = "ned_origin_lon")]
    pub origin_lng: f64,
    /// Due to architectural reasons, the bounding box is nested one deeper
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

#[cfg(test)]
mod tests {
    use super::*;

    const GUIDANCE_CONTROLLER_CONFIG: &str = r#"
[state_machine]
diagram_path = "diagram.drawio.svg"
initial_state = "Control Loop"

[state_machine.states."Control Loop".gnc_config]
controller_type = "LimitCycles"
# Dübendorf, from gnc_configurations::limit_cycle_hil_duebendorf
ned_origin_lat = 47.405072
ned_origin_lon = 8.63092
ned_origin_alt = 435.0
dt_hint = 0.01
[state_machine.states."Control Loop".gnc_config.inner]
bounding_polygon = [
    [427.7, 328.7],
    [304.1, 440.9],
    [-108.871476, -6.790393],
    [15.378971, -127.065187],
    [427.7, 328.7],
]
safety_spiral_timeout = 5.0
safety_spiral_deflection_left = 0.6
safety_spiral_deflection_right = 0.95
[state_machine.states."Control Loop".gnc_config.inner.inner_config.guidance_config]
emp = [46.7, 36.1]
ipi = [160.5, 232.4, 0.0]
# and more...
[state_machine.states."Control Loop".gnc_config.inner.inner_config.controller_config]
gain = 0.4
steady_state_braking = 0.5
"#;

    #[test]
    fn parses_nested_guidance_controller_config() {
        let config: RemoteComputerConfig = toml::from_str(GUIDANCE_CONTROLLER_CONFIG).expect("config should parse");

        let gnc_config =
            config.state_machine.states[GNC_POLYGON_STATE_NAME].gnc_config.as_ref().expect("gnc_config should be present");
        let polygon = gnc_config.polygon().expect("polygon should be extracted");

        assert_eq!(polygon.origin_lat, 47.405072);
        assert_eq!(polygon.origin_lng, 8.63092);
        assert_eq!(polygon.inner.points.len(), 5);
        assert_eq!(polygon.inner.points[0], [427.7, 328.7]);
        assert_eq!(polygon.inner.points[4], [427.7, 328.7]);
    }

    #[test]
    fn parses_hil_config() {
        let config: RemoteComputerConfig = toml::from_str(
            r#"
[state_machine]
diagram_path = "diagram.mmd"
initial_state = "Control Loop"

[state_machine.states."Control Loop"]
type = "ControlLoop"
loop_frequency_hz = 10.0
manual_transitions = [
    { target = "Safety Spiral", display = "Manual Safety Spiral", abort = true },
]
[state_machine.states."Control Loop".gnc_config]
initial_height = 2000
descent_per_tick = 0.6
controller_type = "LimitCyclesHIL"
[state_machine.states."Control Loop".gnc_config.gnc]
ned_origin_lat = 47.405072
ned_origin_lon = 8.63092
ned_origin_alt = 435.0
dt_hint = 0.01
[state_machine.states."Control Loop".gnc_config.gnc.inner]
bounding_polygon = [
    [427.7, 328.7],
    [304.1, 440.9],
    [-108.871476, -6.790393],
    [15.378971, -127.065187],
    [427.7, 328.7],
]
safety_spiral_timeout = 5.0
[state_machine.states."Control Loop".gnc_config.gnc.inner.inner_config.controller_config]
gain = 0.4
"#,
        )
        .expect("config should parse");

        let polygon = config.state_machine.states[GNC_POLYGON_STATE_NAME]
            .gnc_config
            .as_ref()
            .and_then(|c| c.polygon())
            .expect("polygon should be extracted");

        assert_eq!(polygon.origin_lat, 47.405072);
        assert_eq!(polygon.origin_lng, 8.63092);
        assert_eq!(polygon.inner.points.len(), 5);
        assert_eq!(polygon.inner.points[2], [-108.871476, -6.790393]);
    }

    #[test]
    fn parses_gnc_config_without_polygon() {
        let config: RemoteComputerConfig = toml::from_str(
            r#"
[state_machine]
diagram_path = "diagram.mmd"
initial_state = "Control Loop"

[state_machine.states."Control Loop".gnc_config]
controller_type = "LimitCycles"
dt_hint = 0.01
"#,
        )
        .expect("config should parse");

        let gnc_config =
            config.state_machine.states[GNC_POLYGON_STATE_NAME].gnc_config.as_ref().expect("gnc_config should be present");
        assert!(gnc_config.polygon().is_none());
    }
}
