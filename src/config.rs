#![allow(clippy::result_large_err)]

use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::{
    CONFIG_PATH,
    scenario::{Scenario, ScenarioError},
};
use schemars::JsonSchema;
use serde::{Deserialize, Deserializer, Serialize};
use utoipa::ToSchema;

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Error whilst reading config: {0}")]
    Read(std::io::Error),
    #[error("Error whilst deserializing config: {0}")]
    Deserialize(toml::de::Error),
    #[error("The config needs at least one scenario")]
    NoScenarios,
    #[error("Default scenario '{0}' doesn't exist")]
    MissingDefaultScenario(String),
    #[error("Unable to create scenario '{0}': {1}")]
    InvalidScenario(String, ScenarioError),
}

#[derive(Debug, Deserialize, JsonSchema)]
#[serde(try_from = "RawConfig")]
pub struct Config {
    /// All scenarios available on the mission control.
    #[serde(skip)]
    pub scenarios: HashMap<String, Scenario>,
    /// Scenario which should be selected by default on startup.
    pub default_scenario: String,
    /// MavLink related configuration.
    pub mavlink: MavlinkConfig,
}

impl TryFrom<RawConfig> for Config {
    type Error = ConfigError;

    fn try_from(config: RawConfig) -> Result<Self, Self::Error> {
        // Ensure that at least one scenario is defined.
        if config.scenarios.is_empty() {
            return Err(ConfigError::NoScenarios);
        }
        // Ensure that the default scenario exists.
        if !config.scenarios.contains_key(&config.default_scenario) {
            return Err(ConfigError::MissingDefaultScenario(config.default_scenario));
        }

        let scenarios = config
            .scenarios
            .into_iter()
            .map(|(name, config)| {
                Scenario::try_from(config)
                    .map(|scenario| (name.clone(), scenario))
                    .map_err(|err| ConfigError::InvalidScenario(name, err))
            })
            .collect::<Result<HashMap<_, _>, _>>()?;

        Ok(Config { scenarios, default_scenario: config.default_scenario, mavlink: config.mavlink })
    }
}

impl Config {
    /// Parse the config at a given path
    pub fn parse(path: &Path) -> Result<Arc<Self>, ConfigError> {
        let config_str = fs::read_to_string(path).map_err(ConfigError::Read)?;
        let config = toml::from_str::<Config>(&config_str).map_err(ConfigError::Deserialize)?;
        Ok(Arc::new(config))
    }
}

#[derive(Debug, Deserialize, JsonSchema)]
#[serde(rename = "Config")]
struct RawConfig {
    /// All scenarios available on the mission control.
    ///
    /// To run the mission control successfully, at least one scenario needs
    /// to be specified.
    #[serde(rename = "scenario")]
    pub scenarios: HashMap<String, ScenarioConfig>,
    /// Scenario which should be selected by default on startup.
    pub default_scenario: String,
    /// MavLink related configuration.
    pub mavlink: MavlinkConfig,
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
    /// Address under which the mavlink broadcast is available
    pub address: MavlinkAddress,
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
                "The path '{}' cannot be canonicalized or does not exist",
                absolute_path.display()
            )));
        }
    };

    Ok(canonicalized_path)
}
