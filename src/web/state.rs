use crate::{
    parser::{
        pss::{Pss, PssError},
        statemachine::{StateMachine, StateMachineError},
    },
    remote::{RemoteComputer, Remotes},
    web::{self, broadcast::Broadcast},
};
use futures::stream::FuturesUnordered;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;
use tokio_stream::StreamExt;
use tokio_util::sync::CancellationToken;

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
    active_remote: Option<(String, CancellationToken)>,
    state_machine: Option<RemoteStateMachine>,
    pss: Option<RemotePss>,
    broadcast: Arc<Broadcast>,
}

impl State {
    pub fn new(remotes: Arc<Remotes>, broadcast: Arc<Broadcast>) -> StateInstance {
        let instance = Self { remotes, active_remote: None, state_machine: None, pss: None, broadcast };
        Arc::new(RwLock::new(instance))
    }

    pub fn get_active_remote(&self) -> Result<(&String, Arc<RwLock<RemoteComputer>>), StateError> {
        let (active_remote_name, _) = self.active_remote.as_ref().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(active_remote_name).expect("Active remote name should exist").clone();
        Ok((active_remote_name, remote))
    }

    pub async fn set_active_remote(&mut self, name: &String) -> Result<Arc<RwLock<RemoteComputer>>, StateError> {
        if !self.remotes.contains_key(name) {
            return Err(StateError::RemoteNotFound);
        }
        if self.active_remote.as_ref().is_some_and(|(active_name, _)| active_name == name) {
            return Err(StateError::RemoteAlreadyActive);
        };

        if self.active_remote.is_some() {
            self.remove_active_remote().await?;
        }

        // We ensured that the remote exists at function entry. Since we never add/remove any remotes
        // during runtime, we can expect that this remote still exists here.
        let remote = self.remotes.get(name).expect("Remotes should not change").clone();
        log::info!("Activating remote '{name}'");
        let token = remote.write().await.activate().expect("Remote should not already be active");

        self.active_remote = Some((name.clone(), token));

        Ok(remote)
    }

    pub async fn remove_active_remote(&mut self) -> Result<(), StateError> {
        let (old_active, token) = self.active_remote.take().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(&old_active).expect("Active remote name should exist");

        log::info!("Deactivating remote '{old_active}'");
        // Cancel all tasks belonging to the remote computer. This is needed because
        // otherwise some tasks might hold the lock for the remote computer and thus the
        // deactivation can take quite some time.
        token.cancel();
        remote.write().await.deactivate().expect("Remote should be active");

        self.set_state_machine(None).await;
        self.set_pss(None).await;

        Ok(())
    }

    pub async fn set_state_machine(&mut self, state_machine: Option<RemoteStateMachine>) {
        self.state_machine = state_machine;
        match &self.state_machine {
            Some(Ok(state_machine)) => self.broadcast.broadcast(web::Event::StateMachineChange(Some(state_machine.clone()))),
            Some(Err(err)) => {
                self.broadcast.broadcast(web::Event::StateError(format!("Unable to parse state machine: {err}")))
            }
            None => self.broadcast.broadcast(web::Event::StateMachineChange(None)),
        }
        .await;
    }

    pub fn get_state_machine(&self) -> &Option<RemoteStateMachine> {
        &self.state_machine
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

        FuturesUnordered::from_iter(
            errors.iter().map(|err| self.broadcast.broadcast(web::Event::StateError(format!("Unable to parse PSS: {err}")))),
        )
        .collect::<Vec<_>>()
        .await;
        self.broadcast.broadcast(web::Event::PssChange(Some(valid_pss))).await
    }

    pub fn get_pss(&self) -> &Option<RemotePss> {
        &self.pss
    }
}
