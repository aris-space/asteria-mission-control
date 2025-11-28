use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
};

use serde::Deserialize;

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Error whilst reading config: {0}")]
    Read(std::io::Error),
    #[error("Error whilst deserializing config: {0}")]
    Deserialize(toml::de::Error),
    #[error("The config needs at least one scenario")]
    NoScenarios,
    #[error("Scenario with name '{0}' doesn't exist but is used as the default scenario")]
    MissingDefaultScenario(String),
    #[error("Error whilst canonicalizing state diagram for state machine '{0}' at path {1:?}: {2}")]
    MissingDiagram(String, PathBuf, std::io::Error),
}

#[derive(Debug, Deserialize)]
pub struct Config {
    /// All scenarios availalable on the mission control
    ///
    /// To run the mission control successfully, at least one scenario needs
    /// to be specified
    #[serde(rename = "scenario")]
    pub scenarios: HashMap<String, Scenario>,
    /// Scenario which should be selected by default on startup
    pub default_scenario: String,
}

impl Config {
    /// Parse the config at a given path
    pub fn parse(path: &Path) -> Result<Self, ConfigError> {
        let config_str = fs::read_to_string(path).map_err(ConfigError::Read)?;
        let mut config = toml::from_str::<Self>(&config_str).map_err(ConfigError::Deserialize)?;
        config.validate()?;

        // for all state machines join the state machine path onto the config path and try to canonicalize it
        config.scenarios.iter_mut().flat_map(|(_, scenario)| scenario.state_machines.iter_mut()).try_for_each(
            |(name, state_machine)| {
                let state_machine_path = path.parent().unwrap_or(Path::new("/")).join(&state_machine.path);
                state_machine_path
                    .canonicalize()
                    .map_err(|err| ConfigError::MissingDiagram(name.clone(), state_machine_path, err))
                    .map(|path| {
                        state_machine.path = path;
                    })
            },
        )?;

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

        Ok(())
    }
}

#[derive(Debug, Deserialize)]
pub struct Scenario {
    /// Displayname of the scenario
    pub name: String,

    /// State machines of the scenario
    ///
    /// Often those are just the flight computer and remote fueling station
    /// state machines
    #[serde(rename = "state_machine")]
    pub state_machines: HashMap<String, StateMachine>,
}

#[derive(Debug, Deserialize)]
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
