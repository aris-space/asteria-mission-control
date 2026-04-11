use crate::{
    parser::{
        pss::{Pss, PssError},
        statemachine::{StateMachine, StateMachineError},
    },
    remote::{RemoteComputer, Remotes},
};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

pub type StateInstance = Arc<RwLock<State>>;

#[derive(Debug, thiserror::Error)]
pub enum StateError {
    #[error("Remote computer is already active")]
    RemoteAlreadyActive,
    #[error("Remote computer does not exist")]
    RemoteNotFound,
    #[error("No remote is currently active")]
    NoActiveRemote,
}

pub struct State {
    remotes: Arc<Remotes>,
    active_remote: Option<String>,
    pub state_machine: Option<Result<StateMachine, StateMachineError>>,
    pub pss: Option<HashMap<String, Result<Pss, PssError>>>,
}

impl State {
    pub fn new(remotes: Arc<Remotes>) -> StateInstance {
        let instance = Self { remotes, active_remote: None, state_machine: None, pss: None };
        Arc::new(RwLock::new(instance))
    }

    pub fn get_active_remote(&self) -> Result<(&String, &RwLock<RemoteComputer>), StateError> {
        let active_remote_name = self.active_remote.as_ref().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(active_remote_name).expect("Active remote name should exist");
        Ok((active_remote_name, remote))
    }

    pub async fn set_active_remote(&mut self, name: &String) -> Result<&RwLock<RemoteComputer>, StateError> {
        let remote = self.remotes.get(name).ok_or(StateError::RemoteNotFound)?;
        if self.active_remote.as_ref().is_some_and(|active_name| active_name == name) {
            return Err(StateError::RemoteAlreadyActive);
        };

        if let Some(old_active) = &self.active_remote {
            let remote = self.remotes.get(old_active).expect("Active remote name should exist");
            log::info!("Deactivating remote '{old_active}'");
            remote.write().await.deactivate().expect("Remote should be active");
        }

        let mut remote_guard = remote.write().await;
        log::info!("Activating remote '{name}'");
        remote_guard.activate().expect("Remote should not already be active");

        self.active_remote = Some(name.clone());

        // This code is only temporary as the state machine and PSS stuff gets read from the
        // RC config. For this we need the config hash from the RC.
        // TODO: `state-machine-change` and `pss-change` events are never emitted.
        self.state_machine = Some(StateMachine::new(&remote_guard.diagram_path, &remote_guard.config_path));
        self.pss = Some(HashMap::new());

        Ok(remote)
    }

    pub async fn remove_active_remote(&mut self) -> Result<(), StateError> {
        let old_active = self.active_remote.take().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(&old_active).expect("Active remote name should exist");
        log::info!("Deactivating remote '{old_active}'");
        remote.write().await.deactivate().expect("Remote should be active");
        Ok(())
    }
}
