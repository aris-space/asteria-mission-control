use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
};

use schemars::JsonSchema;
use serde::Deserialize;

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Error whilst reading config: {0}")]
    Read(std::io::Error),
    #[error("Error whilst deserializing config: {0}")]
    Deserialize(toml::de::Error),
    #[error("The config needs at least one scenario")]
    NoScenarios,
    #[error("Scenario with id '{0}' doesn't exist but is used as the default scenario")]
    MissingDefaultScenario(String),
    #[error("Error whilst canonicalizing state diagram for state machine '{0}' at path {1:?}: {2}")]
    MissingDiagram(String, PathBuf, std::io::Error),
    #[error("Scenario with id '{0}' references a state machine with id '{1}' which does not exist")]
    MissingStateMachine(String, String),
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct Config {
    /// All scenarios availalable on the mission control
    ///
    /// To run the mission control successfully, at least one scenario needs
    /// to be specified
    #[serde(rename = "scenario")]
    pub scenarios: HashMap<String, Scenario>,
    /// Scenario which should be selected by default on startup
    pub default_scenario: String,
    /// All state machines available on the mission control
    #[serde(rename = "state_machine")]
    pub state_machines: HashMap<String, StateMachine>,
}

impl Config {
    /// Parse the config at a given path
    pub fn parse(path: &Path) -> Result<Self, ConfigError> {
        let config_str = fs::read_to_string(path).map_err(ConfigError::Read)?;
        let mut config = toml::from_str::<Self>(&config_str).map_err(ConfigError::Deserialize)?;
        config.validate()?;

        // for all state machines join the state machine path onto the config path and try to canonicalize it
        config.state_machines.iter_mut().try_for_each(|(id, state_machine)| {
            let state_machine_path = path.parent().unwrap_or(Path::new("/")).join(&state_machine.path);
            state_machine_path
                .canonicalize()
                .map_err(|err| ConfigError::MissingDiagram(id.clone(), state_machine_path, err))
                .map(|path| {
                    state_machine.path = path;
                })
        })?;

        Ok(config)
    }

    /// Validate whether the config satisfies all semantic constraints
    fn validate(&self) -> Result<(), ConfigError> {
        if self.scenarios.is_empty() {
            Err(ConfigError::NoScenarios)?
        }
        if !self.scenarios.contains_key(&self.default_scenario) {
            Err(ConfigError::MissingDefaultScenario(self.default_scenario.clone()))?
        }
        // ensure that all referenced state machines exist
        self.scenarios.iter().try_for_each(|(scenario_id, scenario)| {
            scenario.state_machines.iter().try_for_each(|id| {
                if !self.state_machines.contains_key(id) {
                    Err(ConfigError::MissingStateMachine(scenario_id.clone(), id.clone()))
                } else {
                    Ok(())
                }
            })
        })?;

        Ok(())
    }
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct Scenario {
    /// Displayname of the scenario
    pub name: String,

    /// Identifiers of the state machines of the scenario. All referenced state machines need to exist, otherwise the config
    /// will fail to parse.
    ///
    /// Often those are just the flight computer and remote fueling station
    /// state machines
    pub state_machines: Vec<String>,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct StateMachine {
    /// Displayname of the state machine on the UI
    pub name: String,
    /// Path to the drawio svg+xml file of the state machine
    ///
    /// **Important**: The path needs to be relative to the location of the config file
    ///                and will be joined and canonicalized after the path of the config
    ///                file after parsing
    pub path: PathBuf,
}
