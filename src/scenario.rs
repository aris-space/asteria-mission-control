use crate::{
    config::ScenarioConfig,
    parser::{
        pss::{Pss, PssError},
        statemachine::{StateMachine, StateMachineError},
    },
};
use std::collections::HashMap;

#[derive(thiserror::Error, Debug)]
pub enum ScenarioError {
    #[error("Unable to parse state machine '{0}': {1}")]
    StateMachineParse(String, StateMachineError),
    #[error("Unable to parse PSS '{0}': {1}")]
    PssParse(String, PssError),
}

#[derive(Debug)]
pub struct Scenario {
    /// Display name of the scenario.
    pub name: String,
    /// State machines of the scenario.
    pub state_machines: HashMap<String, StateMachine>,
    /// PSS configs of the scenario.
    pub pss: HashMap<String, Pss>,
}

impl TryFrom<ScenarioConfig> for Scenario {
    type Error = ScenarioError;

    fn try_from(config: ScenarioConfig) -> Result<Self, Self::Error> {
        let state_machines = config
            .state_machines
            .into_iter()
            .map(|(name, config)| {
                StateMachine::try_from(config)
                    .map(|state_machine| (name.clone(), state_machine))
                    .map_err(|err| ScenarioError::StateMachineParse(name.clone(), err))
            })
            .collect::<Result<HashMap<_, _>, _>>()?;

        let pss = config
            .pss
            .into_iter()
            .map(|(name, config)| {
                Pss::try_from(config)
                    .map(|pss| (name.clone(), pss))
                    .map_err(|err| ScenarioError::PssParse(name.clone(), err))
            })
            .collect::<Result<HashMap<_, _>, _>>()?;

        Ok(Scenario { name: config.name.clone(), state_machines, pss })
    }
}
