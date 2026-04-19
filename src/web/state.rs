use crate::{
    parser::{
        pss::{Pss, PssError},
        statemachine::{StateMachine, StateMachineError},
    },
    remote::{RemoteComputer, Remotes},
    web::{self, broadcast::Broadcast},
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

pub type RemoteStateMachine = Result<StateMachine, StateMachineError>;
pub type RemotePss = HashMap<String, Result<Pss, PssError>>;

pub struct State {
    remotes: Arc<Remotes>,
    active_remote: Option<String>,
    pub state_machine: Option<RemoteStateMachine>,
    pub pss: Option<RemotePss>,
    broadcast: Arc<Broadcast>,
}

impl State {
    pub fn new(remotes: Arc<Remotes>, broadcast: Arc<Broadcast>) -> StateInstance {
        let instance = Self { remotes, active_remote: None, state_machine: None, pss: None, broadcast };
        Arc::new(RwLock::new(instance))
    }

    pub fn get_active_remote(&self) -> Result<(&String, Arc<RwLock<RemoteComputer>>), StateError> {
        let active_remote_name = self.active_remote.as_ref().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(active_remote_name).expect("Active remote name should exist").clone();
        Ok((active_remote_name, remote))
    }

    pub async fn set_active_remote(&mut self, name: &String) -> Result<Arc<RwLock<RemoteComputer>>, StateError> {
        if !self.remotes.contains_key(name) {
            return Err(StateError::RemoteNotFound);
        }
        if self.active_remote.as_ref().is_some_and(|active_name| active_name == name) {
            return Err(StateError::RemoteAlreadyActive);
        };

        if let Some(old_active) = &self.active_remote {
            let remote = self.remotes.get(old_active).expect("Active remote name should exist");
            log::info!("Deactivating remote '{old_active}'");
            remote.write().await.deactivate().expect("Remote should be active");

            // Clear the active state machine and the active PSS because we're
            // changing the active remote.
            self.set_state_machine(None).await;
            self.set_pss(None).await;
        }

        // We ensured that the remote exists at function entry. Since we never add/remove any remotes
        // during runtime, we can expect that this remote still exists here.
        let remote = self.remotes.get(name).expect("Remotes should not change").clone();
        let mut remote_guard = remote.write().await;
        log::info!("Activating remote '{name}'");
        remote_guard.activate().expect("Remote should not already be active");

        self.active_remote = Some(name.clone());

        // This code is only temporary as the state machine and PSS stuff gets read from the
        // RC config. For this we need the config hash from the RC.
        // TODO: `state-machine-change` and `pss-change` events are never emitted.
        // self.state_machine = Some(StateMachine::new(&remote_guard.config_path));
        // if let Some(Ok(state_machine)) = &self.state_machine {
        // self.broadcast.broadcast(web::Event::StateMachineChange(Some(state_machine.clone()))).await;
        // }
        // self.pss = Some(HashMap::new());

        drop(remote_guard);

        Ok(remote)
    }

    pub async fn remove_active_remote(&mut self) -> Result<(), StateError> {
        let old_active = self.active_remote.take().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(&old_active).expect("Active remote name should exist");
        log::info!("Deactivating remote '{old_active}'");
        remote.write().await.deactivate().expect("Remote should be active");
        self.set_state_machine(None).await;
        self.pss = None;
        self.broadcast.broadcast(web::Event::PssChange(None)).await;

        Ok(())
    }

    pub async fn set_state_machine(&mut self, state_machine: Option<RemoteStateMachine>) {
        self.state_machine = state_machine;
        match &self.state_machine {
            Some(Ok(state_machine)) => self.broadcast.broadcast(web::Event::StateMachineChange(Some(state_machine.clone()))),
            Some(Err(err)) => {
                log::error!("state machine err = {err}");
                todo!("broadcast state errors")
            }
            None => self.broadcast.broadcast(web::Event::StateMachineChange(None)),
        }
        .await;
    }

    pub async fn set_pss(&mut self, pss: Option<RemotePss>) {
        self.pss = pss;
        let Some(pss) = &self.pss else { return self.broadcast.broadcast(web::Event::PssChange(None)).await };

        let mut errors = Vec::new();
        let valid_pss = pss
            .iter()
            .filter_map(|(key, pss)| match pss {
                Ok(pss) => Some((key.clone(), pss.clone())),
                Err(err) => {
                    errors.push(err);
                    None
                }
            })
            .collect::<HashMap<_, _>>();
        // TODO: Handle error broadcasting
        self.broadcast.broadcast(web::Event::PssChange(Some(valid_pss))).await
    }
}
