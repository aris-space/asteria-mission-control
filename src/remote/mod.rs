use crate::config::{Config, MavlinkAddress, RemoteComputerConfig};

use asteria_messages::{
    Message,
    datapoints::dp_system_management::{self, Heartbeat, MavAutopilot, MavState, MavType},
};
use mavio::Dialect;
use mavlink_lib::{MavlinkError, MavlinkSender};
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::sync::{RwLock, mpsc::UnboundedSender};
use tokio_util::sync::CancellationToken;

pub mod config;

pub type Remotes = HashMap<String, Arc<RwLock<RemoteComputer>>>;

/// Duration after which a restart of the MavLink
/// message proxy should be attempted.
pub const MAVLINK_PROXY_RESTART_TIMEOUT: Duration = Duration::from_millis(2500);

/// Amount of times a MavLink message should be sent
/// to the remote computer to "compensate" for unreliable
/// communication.
/// This does not apply to heartbeat messages, those are never
/// sent multiple times!
pub const MAVLINK_RESEND_ATTEMPTS: usize = 3;

/// Duration to wait between every message resend attempt.
pub const MAVLINK_RESEND_TIMEOUT: Duration = Duration::from_millis(50);

#[derive(Debug, thiserror::Error)]
pub enum RemoteComputerError {
    #[error("The remote computer is already active")]
    AlreadyActive,
    #[error("The remote computer is not active")]
    NotActive,
    #[error("The remote computer got deactivated")]
    Deactivated,
    #[error(transparent)]
    MavLink(MavlinkError),
}

pub struct RemoteComputer {
    mavlink_address: MavlinkAddress,
    mavlink_system_id: u8,
    mavlink_sender: Option<Arc<MavlinkSender>>,
    token: Option<CancellationToken>,
    msg_tx: UnboundedSender<Message>,
}

impl RemoteComputer {
    pub fn new(rc_config: RemoteComputerConfig, config: Arc<Config>, msg_tx: UnboundedSender<Message>) -> Self {
        Self {
            mavlink_address: rc_config.mavlink_address,
            mavlink_system_id: config.mavlink.system_id,
            mavlink_sender: None,
            token: None,
            msg_tx,
        }
    }

    /// Activate the remote computer.
    ///
    /// After activation, MavLink messages from the remote computer are forwarded into the
    /// global message channel. Additionally, we send periodical heartbeat messages to the
    /// remote computer.
    pub fn activate(&mut self) -> Result<CancellationToken, RemoteComputerError> {
        if self.token.is_some() {
            return Err(RemoteComputerError::AlreadyActive);
        }

        let token = CancellationToken::new();
        self.token = Some(token.clone());

        let (mavlink_sender, mavlink_receiver) =
            mavlink_lib::tx_rx(self.mavlink_system_id, self.mavlink_address.clone().into());
        let mavlink_sender = Arc::new(mavlink_sender);

        let msg_tx = self.msg_tx.clone();
        let token_clone = token.clone();
        // Start the thread which forwards the incoming MavLink messages until the remote computer gets deactivated.
        tokio::spawn(async move {
            loop {
                let err = tokio::select! {
                    result = mavlink_receiver.forward(&msg_tx) => match result {
                        // The receiving end of the message channel closed.
                        Ok(_) => return,
                        Err(err) => err,
                    },
                    // A stop signal was received because the remote computer got deactivated.
                    _ = token_clone.cancelled() => return
                };

                log::error!("Error whilst running mavlink message forwarding: {err}");

                tokio::select! {
                    // Await restart timeout and then attempt restart in next iteration.
                    _ = tokio::time::sleep(MAVLINK_PROXY_RESTART_TIMEOUT) => continue,
                    // A stop signal was received because the remote computer got deactivated.
                    _ = token_clone.cancelled() => return,
                }
            }
        });

        self.mavlink_sender = Some(mavlink_sender);

        Ok(token)
    }

    /// Deactivate the remote computer.
    pub fn deactivate(&mut self) -> Result<(), RemoteComputerError> {
        let token = self.token.take().ok_or(RemoteComputerError::NotActive)?;
        let _ = self.mavlink_sender.take().ok_or(RemoteComputerError::NotActive)?;
        // Maybe the remote computer hasn't yet been canceled using the token returned from [`activate`].
        token.cancel();
        Ok(())
    }

    /// Send a MavLink message to the remote computer.
    ///
    /// Internally uses [`MavlinkSender::send`].
    pub async fn send_mavlink_message(&self, message: Message) -> Result<(), RemoteComputerError> {
        let token = self.token.as_ref().ok_or(RemoteComputerError::NotActive)?.clone();
        let mavlink_tx = self.mavlink_sender.as_ref().ok_or(RemoteComputerError::NotActive)?.clone();

        // Don't attempt to send heartbeat messages multiple times.
        let should_resend = !matches!(message, Message::SystemManagement(dp_system_management::Message::Heartbeat(..)));

        tokio::spawn(async move {
            let mut attempts = 0;
            while attempts < MAVLINK_RESEND_ATTEMPTS {
                attempts += 1;
                let result = tokio::select! {
                    result = mavlink_tx.send(&message) => result.map_err(RemoteComputerError::MavLink),
                    // A stop signal was received because the remote computer got deactivated.
                    _ = token.cancelled() => Err(RemoteComputerError::Deactivated)
                };

                if let Err(err) = result {
                    log::error!("Unable to transmit MavLink message: {err}")
                };

                if !should_resend {
                    // Exit after first iteration if we shouldn't resend the message.
                    break;
                }

                tokio::time::sleep(MAVLINK_RESEND_TIMEOUT).await
            }
        });

        Ok(())
    }

    /// Shorthand function for sending a MavLink heartbeat message to the remote computer.
    ///
    /// It internally calls [`send_mavlink_message`] with a message containing a [`Heartbeat`].
    pub async fn send_heartbeat_message(&self) -> Result<(), RemoteComputerError> {
        let heartbeat_message = Message::SystemManagement(dp_system_management::Message::Heartbeat(Heartbeat {
            type_: MavType::Gcs,
            mavlink_version: Message::version().unwrap_or_default(),
            system_status: MavState::Active,
            autopilot: MavAutopilot::Invalid,
            base_mode: 0,
            custom_mode: 0,
        }));
        self.send_mavlink_message(heartbeat_message).await
    }
}
