use std::sync::Arc;

use tokio::sync::RwLock;

use crate::config::{Config, Scenario};

pub type StateInstance = Arc<RwLock<State>>;

#[derive(Debug, thiserror::Error)]
pub enum StateError {
    #[error("Scenario '{0}' is already active")]
    AlreadyActive(String),
    #[error("Scenario '{0}' does not exist")]
    NotFound(String),
}

pub struct State {
    config: Arc<Config>,
    scenario: String,
}

impl State {
    /// Create a new state instance from the config
    ///
    /// The state uses the default scenario of the config as it's active scenario on creation
    pub fn new(config: Arc<Config>) -> StateInstance {
        let instance = Self { scenario: config.default_scenario.clone(), config };
        Arc::new(RwLock::new(instance))
    }

    /// Get the active scenario
    pub fn get_scenario(&self) -> &Scenario {
        self.config.scenarios.get(&self.scenario).expect("State scenario should always exist")
    }

    /// Get the id of the active scenario
    pub fn get_scenario_id(&self) -> &String {
        &self.scenario
    }

    /// Set the active scenario
    pub fn set_scenario(&mut self, name: String) -> Result<&Scenario, StateError> {
        if self.scenario == name {
            return Err(StateError::AlreadyActive(name));
        }

        match self.config.scenarios.get(&name) {
            Some(scenario) => {
                self.scenario = name;
                Ok(scenario)
            }
            None => Err(StateError::NotFound(name)),
        }
    }
}
