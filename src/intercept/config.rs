use std::path::PathBuf;
use std::sync::Arc;

use asteria_datatypes::status::ConfigHash;
use asteria_messages::Message;
use asteria_messages::datapoints::dp_flight_computer::Message as FcMessage;
use asteria_messages::datapoints::dp_rfs_computer::Message as RfscMessage;
use async_trait::async_trait;
use gix::{Repository, ThreadSafeRepository};

use crate::intercept::Interceptor;
use crate::parser::statemachine::StateMachine;
use crate::remote::config::RemoteComputerConfig;
use crate::web::broadcast::Broadcast;
use crate::web::datatypes::OptionalResult;
use crate::web::event::Event;
use crate::web::state::StateInstance;

/// Interceptor looking for [`FcMessage::ConfigHash`] or [`RfscMessage::ConfigHash`] messages
/// to update the [`StateMachine`] for the active remote computer in the [`StateInstance`].
///
/// When the state machine changes, an [`Event::StateMachine`] is broadcast to all connected
/// clients.
pub struct ConfigInterceptor {
    state: StateInstance,
    repository: ThreadSafeRepository,
    configs_repository_path: PathBuf,
    broadcast: Arc<Broadcast>,
}

impl ConfigInterceptor {
    pub fn new(
        repository: Repository,
        configs_repository_path: PathBuf,
        state: StateInstance,
        broadcast: Arc<Broadcast>,
    ) -> Self {
        Self { state, repository: repository.into_sync(), configs_repository_path, broadcast }
    }

    fn lookup_remote_computer_config(&self, hash: &[u8; 5]) -> Result<RemoteComputerConfig, String> {
        let hash_str = String::from_utf8_lossy(hash);
        let repository = self.repository.to_thread_local();

        log::debug!("Looking up config file with hash {hash_str}");

        let bytes = {
            let Ok(object_id) = repository.rev_parse_single(hash) else {
                return Err(format!("Could not find object with hash {hash_str} in configs repository",));
            };

            // We unwrap because we just got this object id from `rev_parse_single`
            // so we know it exists.
            let object = repository.find_object(object_id).unwrap();

            let Ok(blob) = object.try_into_blob() else {
                return Err("Object belongig to config hash is not a blob".to_string());
            };

            blob.data.clone()
        };

        toml::from_slice::<RemoteComputerConfig>(&bytes).map_err(|err| format!("Remote computer config is not valid: {err}"))
    }
}

#[async_trait]
impl Interceptor for ConfigInterceptor {
    async fn on_message(&self, message: &Message) {
        let hash = match message {
            Message::FlightComputer(FcMessage::ConfigHash(ConfigHash { hash })) => hash,
            Message::RfsComputer(RfscMessage::ConfigHash(ConfigHash { hash })) => hash,
            // We don't care about other message kinds.
            _ => return,
        };

        let (state_machine, gnc_polygon) = match self.lookup_remote_computer_config(hash) {
            Ok(config) => {
                let state_machine = StateMachine::new(&config, &self.configs_repository_path)
                    .map_err(|err| format!("Remote computer state machine is not valid: {err}"));
                if config.gnc_polygon.is_none() {
                    log::debug!("Remote computer config does not specify a GNC polygon")
                }
                (OptionalResult::from(Some(state_machine)), config.gnc_polygon)
            }
            Err(err) => {
                // If the lookup failed we also log an error on the backend.
                log::error!("Remote computer config lookup failed: {err}");
                (OptionalResult::Error(err), None)
            }
        };

        let mut guard = self.state.write().await;
        if guard.set_state_machine(state_machine.clone()).await {
            self.broadcast.broadcast(Event::StateMachine(state_machine)).await;
        };
        guard.set_gnc_polygon(gnc_polygon.clone());
        self.broadcast.broadcast(Event::Polygon(gnc_polygon)).await;
    }
}
