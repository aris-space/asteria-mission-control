use asteria_messages::Message;
use asteria_messages::datapoints::dp_flight_computer::Message as FcMessage;
use asteria_messages::datapoints::dp_rfs_computer::Message as RfscMessage;
use async_trait::async_trait;
use mavlink_lib::MavlinkMessage;

use crate::intercept::Interceptor;
use crate::web::state::StateInstance;

/// Interceptor looking for [`FcMessage::StateMachineState`] or [`RfscMessage::StateMachineState`]
/// messages to update the current state and path index in the [`StateInstance`].
pub struct StateMachineStateInterceptor {
    state: StateInstance,
}

impl StateMachineStateInterceptor {
    pub fn new(state: StateInstance) -> Self {
        Self { state }
    }
}

#[async_trait]
impl Interceptor for StateMachineStateInterceptor {
    async fn on_message(&self, MavlinkMessage { message, .. }: &MavlinkMessage) {
        let state_machine_state = match message {
            Message::FlightComputer(FcMessage::StateMachineState(state)) => state,
            Message::RfsComputer(RfscMessage::StateMachineState(state)) => state,
            _ => return,
        };

        let state_name = String::from_utf8_lossy(&state_machine_state.state);
        let mut state = self.state.write().await;
        // We trim the zero bytes at the end to allow comparing the "fixed size C-string" with
        // a "dynamic sized Rust-string".
        state.set_state_machine_state(state_name.trim_end_matches('\0').to_string(), state_machine_state.path_index);
    }
}
