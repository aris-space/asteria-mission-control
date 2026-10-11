use crate::parser::statemachine::*;
use crate::remote::config::GncPolygon;
use crate::remote::{RemoteComputer, Remotes};
use crate::web::datatypes::OptionalResult;

use std::sync::Arc;
use tokio::sync::RwLock;
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

pub struct State {
    /// The name of the active remote together with a cancellation token to
    /// stop the active remote. [`None`] if no remote is currently active.
    active_remote: Option<(String, CancellationToken)>,
    /// The state machine of the active remote. [`None`] if no remote is currently
    /// active, or the config of the active remote hasn't been received.
    state_machine: OptionalResult<StateMachine>,
    /// Tuple containing the name of the current state of the state machine and the
    /// path index of the state machine. [`None`] if no remote is currently active, or
    /// the current state of the active remote's state machine hasn't been received.
    state_machine_state: Option<(String, u32)>,
    /// GNC polygon of the active remote computer. [`None`] if no remote is currently
    /// active, or the current state of the active remote's polygon hasn't been received,
    /// or the active remote doesn't have a polygon configured.
    gnc_polygon: Option<GncPolygon>,

    remotes: Arc<Remotes>,
}

impl State {
    pub fn new(remotes: Arc<Remotes>) -> StateInstance {
        let instance = Self {
            remotes,
            active_remote: None,
            state_machine: OptionalResult::None,
            state_machine_state: None,
            gnc_polygon: None,
        };
        Arc::new(RwLock::new(instance))
    }

    /// Get the name of the active remote together with a reference to its lock.
    pub fn get_active_remote(&self) -> Result<(&String, Arc<RwLock<RemoteComputer>>), StateError> {
        let (active_remote_name, _) = self.active_remote.as_ref().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(active_remote_name).expect("Active remote name should exist").clone();
        Ok((active_remote_name, remote))
    }

    /// Change the active remote to the specified remote.
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

    /// Deactivate the active remote.
    pub async fn remove_active_remote(&mut self) -> Result<(), StateError> {
        let (old_active, token) = self.active_remote.take().ok_or(StateError::NoActiveRemote)?;
        let remote = self.remotes.get(&old_active).expect("Active remote name should exist");

        log::info!("Deactivating remote '{old_active}'");
        // Cancel all tasks belonging to the remote computer. This is needed because
        // otherwise some tasks might hold the lock for the remote computer and thus the
        // deactivation can take quite some time.
        token.cancel();
        remote.write().await.deactivate().expect("Remote should be active");

        self.set_state_machine(OptionalResult::None).await;

        Ok(())
    }

    /// Set the active state machine. Returns whether the new state machine is different from
    /// the previous state machine ([`true`]) or not ([`false`]).
    pub async fn set_state_machine(&mut self, state_machine: impl Into<OptionalResult<StateMachine>>) -> bool {
        let new_state_machine = state_machine.into();

        // We only update the state machine if it is different from the
        // currently active one.
        if self.state_machine != new_state_machine {
            self.state_machine = new_state_machine;

            if matches!(self.state_machine, OptionalResult::None | OptionalResult::Error(..)) {
                // We no longer have an active state machine. We thus need to clear
                // the stored current state.
                self.state_machine_state = None;
            }

            true
        } else {
            false
        }
    }

    pub fn set_state_machine_state(&mut self, state_name: String, path_index: u32) {
        self.state_machine_state = Some((state_name, path_index))
    }

    pub fn set_gnc_polygon(&mut self, polygon: Option<GncPolygon>) {
        self.gnc_polygon = polygon
    }

    pub fn get_state_machine(&self) -> &OptionalResult<StateMachine> {
        &self.state_machine
    }

    pub fn get_state_machine_state(&self) -> &Option<(String, u32)> {
        &self.state_machine_state
    }

    pub fn get_gnc_polygon(&self) -> &Option<GncPolygon> {
        &self.gnc_polygon
    }
}
