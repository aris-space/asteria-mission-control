use std::path::PathBuf;

use asteria_datatypes::status::ConfigHash;
use asteria_messages::Message;
use asteria_messages::datapoints::dp_flight_computer::Message as FcMessage;
use asteria_messages::datapoints::dp_rfs_computer::Message as RfscMessage;
use async_trait::async_trait;
use gix::{Repository, ThreadSafeRepository};

use crate::intercept::Interceptor;
use crate::parser::statemachine::StateMachine;
use crate::remote::config::RemoteComputerConfig;
use crate::web::state::StateInstance;

/// Interceptor looking for [`FcMessage::ConfigHash`] or [`RfscMessage::ConfigHash`] messages
/// to update the [`StateMachine`] for the active remote computer in the [`StateInstance`].
pub struct ConfigInterceptor {
    state: StateInstance,
    repository: ThreadSafeRepository,
    configs_repository_path: PathBuf,
}

impl ConfigInterceptor {
    pub fn new(repository: Repository, configs_repository_path: PathBuf, state: StateInstance) -> Self {
        Self { state, repository: repository.into_sync(), configs_repository_path }
    }

    fn lookup_state_machine_config(&self, hash: &[u8; 5]) -> Result<StateMachine, String> {
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

        let rc_config = match toml::from_slice::<RemoteComputerConfig>(&bytes) {
            Ok(config) => config,
            Err(err) => return Err(format!("Remote computer config is not valid: {err}")),
        };

        let state_machine = StateMachine::new(&rc_config, &self.configs_repository_path);

        state_machine.map_err(|err| format!("Remote computer state machine is not valid: {err}"))
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

        let state_machine = self.lookup_state_machine_config(hash);
        // If the lookup failed we also log an error on the backend.
        if let Err(ref err) = state_machine {
            log::error!("State machine config lookup failed: {err}")
        }

        let mut guard = self.state.write().await;
        guard.set_state_machine(Some(state_machine)).await;
    }
}
