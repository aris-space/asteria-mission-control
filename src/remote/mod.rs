use crate::config::{Config, MavlinkAddress, RemoteComputerConfig};

use asteria_messages::Message;
use asteria_messages::datapoints::dp_system_management::{self, Heartbeat, MavAutopilot, MavState, MavType};
use mavio::Dialect;
use mavlink_lib::{MavlinkSender, SendError};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::sync::mpsc::UnboundedSender;
use tokio_util::sync::CancellationToken;

pub mod config;

pub type Remotes = HashMap<String, Arc<RwLock<RemoteComputer>>>;

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
    #[error(transparent)]
    MavLink(SendError),
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

        let (mavlink_sender, mavlink_connection) =
            mavlink_lib::tx_rx(self.mavlink_system_id, self.mavlink_address.clone().into());
        let mavlink_sender = Arc::new(mavlink_sender);

        let msg_tx = self.msg_tx.clone();
        let token_clone = token.clone();
        // `run` reconnects on its own and never returns - this task's only job is to
        // stop driving it once the remote computer gets deactivated.
        tokio::spawn(async move {
            tokio::select! {
                _ = mavlink_connection.run(&msg_tx) => {}
                () = token_clone.cancelled() => {}
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
                if token.is_cancelled() {
                    break;
                }

                log::debug!("Transmitting mavlink message (attempt={attempts}): {message:?}");
                attempts += 1;

                if let Err(err) = mavlink_tx.send(message.clone()).map_err(RemoteComputerError::MavLink) {
                    log::error!("Unable to queue MavLink message for transmission: {err}");
                    // The connection is gone for good - further attempts won't fare any better.
                    break;
                }

                if !should_resend {
                    // Exit after first iteration if we shouldn't resend the message.
                    break;
                }

                tokio::select! {
                    () = tokio::time::sleep(MAVLINK_RESEND_TIMEOUT) => {}
                    () = token.cancelled() => break,
                }
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
