#![allow(clippy::result_large_err)]

use crate::{CONFIG_PATH, scenario::Scenario};
use schemars::JsonSchema;
use serde::{Deserialize, Deserializer, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::{Arc, OnceLock},
};
use utoipa::ToSchema;

/// Static variable containing the optional name of the default scenario and
/// an optional list of available scenarios. This is needed to provide nice
/// errors from parsing. The idea is, that independently whether the
/// `default_scenario` or `scenarios` is deserialized first, the other always
/// either know the already defined default scenario or the list with available
/// scenarios and can thus return the corresponding error.
static DEFAULT_SCENARIO_OR_SCENARIOS: OnceLock<(Option<String>, Option<Vec<String>>)> = OnceLock::new();

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Error whilst reading config: {0}")]
    Read(std::io::Error),
    #[error("Error whilst deserializing config: {0}")]
    Deserialize(toml::de::Error),
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct Config {
    /// All scenarios available on the mission control.
    ///
    /// To run the mission control successfully, at least one scenario needs
    /// to be specified.
    #[serde(alias = "scenario", deserialize_with = "deserialize_scenarios")]
    #[schemars(with = "HashMap<String, ScenarioConfig>")]
    pub scenarios: HashMap<String, Scenario>,
    /// Scenario which should be selected by default on startup.
    #[serde(deserialize_with = "deserialize_default_scenario")]
    pub default_scenario: String,
    /// MavLink related configuration.
    pub mavlink: MavlinkConfig,
}

impl Config {
    /// Parse the config at a given path
    pub fn parse(path: &Path) -> Result<Arc<Self>, ConfigError> {
        let config_str = fs::read_to_string(path).map_err(ConfigError::Read)?;
        let config = toml::from_str::<Config>(&config_str).map_err(ConfigError::Deserialize)?;
        Ok(Arc::new(config))
    }
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, ToSchema, Clone)]
pub enum RemoteComputerKind {
    #[serde(rename = "fc")]
    FlightComputer,
    #[serde(rename = "rfs")]
    RemoteFillingStation,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct MavlinkConfig {
    /// Address from which the MavLink messages should be received.
    pub receiving_address: MavlinkAddress,
    /// Address to which the MavLink messages should be sent.
    pub sending_address: MavlinkAddress,
    /// System id which should be used by the backend when sending messages
    pub system_id: u8,
}

#[derive(Debug, Deserialize, JsonSchema)]
#[serde(tag = "protocol", rename_all = "lowercase")]
pub enum MavlinkAddress {
    /// IP address and port used for UDP communication
    Udp { local: String, remote: String },
    /// IP address and port used for TCP communication
    Tcp { remote: String },
    /// Path to a serial device together with the baud rate used
    Serial { path: String, baud_rate: u32 },
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct ScenarioConfig {
    /// Display name of the scenario.
    pub name: String,
    /// State machines of the scenario.
    #[serde(rename = "state_machine")]
    pub state_machines: HashMap<String, StateMachineConfig>,
    /// PSS configs of the scenario.
    pub pss: HashMap<String, PssConfig>,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct StateMachineConfig {
    /// Kind of remote computer the state machine represents.
    pub kind: RemoteComputerKind,
    /// Display name of the state machine on the UI.
    pub name: String,
    /// Path to the drawio SVG+XML file of the state machine.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(alias = "diagram", deserialize_with = "deserialize_relative_path")]
    pub diagram_path: PathBuf,
    /// Path to the remote computers config which specifies the valid
    /// state transitions of this state machine.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(alias = "config", deserialize_with = "deserialize_relative_path")]
    pub config_path: PathBuf,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct PssConfig {
    /// Kind of remote computer the PSS info belongs to.
    pub kind: RemoteComputerKind,
    /// Display name of the PSS info on the UI.
    pub name: String,
    /// Path to the drawio SVG+XML file of the PSS diagram.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(alias = "diagram", deserialize_with = "deserialize_relative_path")]
    pub diagram_path: PathBuf,
}

/// Deserialize a map of [`Scenario`] from a map of [`ScenarioConfig`] and validate
/// that at least one scenario is defined.
fn deserialize_scenarios<'de, D>(deserializer: D) -> Result<HashMap<String, Scenario>, D::Error>
where
    D: Deserializer<'de>,
{
    let scenario_configs = HashMap::<String, ScenarioConfig>::deserialize(deserializer)?;
    // Ensure that at least one scenario is defined.
    if scenario_configs.is_empty() {
        return Err(serde::de::Error::custom("At least one scenario needs to be defined"));
    }

    let scenarios = scenario_configs
        .into_iter()
        .map(|(name, config)| {
            Scenario::try_from(config)
                .map(|scenario| (name.clone(), scenario))
                .map_err(|err| serde::de::Error::custom(format!("Scenario '{name}' is invalid: {err}")))
        })
        .collect::<Result<HashMap<_, _>, _>>()?;

    let names = scenarios.keys().cloned().collect::<Vec<_>>();
    if let Some((Some(default_scenario), None)) = DEFAULT_SCENARIO_OR_SCENARIOS.get() {
        if !names.contains(default_scenario) {
            return Err(serde::de::Error::custom(format!(
                "Default scenario '{default_scenario}' does not exist. Available scenarios are: {}",
                names.iter().map(|scenario| format!("'{scenario}'")).collect::<Vec<_>>().join(", ")
            )));
        }
    } else {
        DEFAULT_SCENARIO_OR_SCENARIOS.set((None, Some(names))).expect("OnceLock shouldn't be initialized")
    }

    Ok(scenarios)
}

/// Deserialize the configured default scenario. This is only needed to store the value during deserialization
/// in the [`DEFAULT_SCENARIO_OR_SCENARIOS`] static variable to return the appropriate error when
/// [`deserialize_scenarios`] is called and the specified default scenario doesn't exist.
fn deserialize_default_scenario<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let default_scenario = String::deserialize(deserializer)?;
    if let Some((None, Some(scenarios))) = DEFAULT_SCENARIO_OR_SCENARIOS.get() {
        if !scenarios.contains(&default_scenario) {
            return Err(serde::de::Error::custom(format!(
                "Default scenario '{default_scenario}' does not exist. Available scenarios are: {}",
                scenarios.iter().map(|scenario| format!("'{scenario}'")).collect::<Vec<_>>().join(", ")
            )));
        }
    } else {
        DEFAULT_SCENARIO_OR_SCENARIOS
            .set((Some(default_scenario.clone()), None))
            .expect("OnceLock shouldn't be initialized");
    }

    Ok(default_scenario)
}

/// Deserialize a [`PathBuf`] and ensure that it's an absolute path or a valid relative
/// path to the config file.
fn deserialize_relative_path<'de, D>(deserializer: D) -> Result<PathBuf, D::Error>
where
    D: Deserializer<'de>,
{
    let relative_path = PathBuf::deserialize(deserializer)?;
    let config_path = CONFIG_PATH.get().expect("global config path should be initialized");
    let config_parent_path = config_path.parent().map(Path::to_path_buf).unwrap_or_default();

    let absolute_path = config_parent_path.join(&relative_path);

    let canonicalized_path = match absolute_path.canonicalize() {
        Ok(path) => path,
        Err(..) => {
            return Err(serde::de::Error::custom(format!(
                "Path '{}' cannot be canonicalized or does not exist",
                absolute_path.display()
            )));
        }
    };

    Ok(canonicalized_path)
}
