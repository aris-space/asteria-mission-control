use crate::{
    config::{Config, MavlinkAddress, RemoteComputerConfig, RemoteComputerKind},
    mavlink::{MavlinkError, MavlinkSender},
};
use asteria_messages::{
    Message,
    datapoints::dp_system_management::{self, Heartbeat, MavAutopilot, MavState, MavType},
};
use mavio::Dialect;
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::sync::{RwLock, broadcast::{Sender, Receiver}, mpsc::{UnboundedSender}};

pub type Remotes = HashMap<String, Arc<RwLock<RemoteComputer>>>;

/// Duration after which a restart of the MavLink
/// message proxy should be attempted.
pub const MAVLINK_PROXY_RESTART_TIMEOUT: Duration = Duration::from_millis(2500);

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
    pub kind: RemoteComputerKind,
    pub description: String,
    mavlink_address: MavlinkAddress,
    mavlink_system_id: u8,
    mavlink_sender: Option<Arc<MavlinkSender>>,
    stop: Option<(Sender<()>, Receiver<()>)>,
    msg_tx: UnboundedSender<Message>,
}

impl RemoteComputer {
    pub fn new(rc_config: RemoteComputerConfig, config: Arc<Config>, msg_tx: UnboundedSender<Message>) -> Self {
        Self {
            kind: rc_config.kind,
            description: rc_config.description,
            mavlink_address: rc_config.mavlink_address,
            mavlink_system_id: config.mavlink.system_id,
            mavlink_sender: None,
            stop: None,
            msg_tx,
        }
    }

    /// Activate the remote computer.
    ///
    /// After activation, MavLink messages
    /// After activation, MavLink messages from the remote computers are proxied into the global [`Broadcast`]
    /// and MavLink heartbeat messages are sent to the remote computer.
    pub fn activate(&mut self) -> Result<(), RemoteComputerError> {
        if self.stop.is_some() {
            return Err(RemoteComputerError::AlreadyActive);
        }

        let (stop_tx, mut stop_rx) = tokio::sync::broadcast::channel(1);
        self.stop = Some((stop_tx, stop_rx.resubscribe()));

        let (mavlink_sender, mavlink_receiver) = crate::mavlink::tx_rx(self.mavlink_system_id, self.mavlink_address.clone());
        let mavlink_sender = Arc::new(mavlink_sender);

        let msg_tx = self.msg_tx.clone();
        // Start the thread which forwards the incoming MavLink messages until the remote computer gets deactivated.
        tokio::spawn(async move {
            loop {
                let Err(err) = mavlink_receiver.forward(&mut stop_rx, &msg_tx).await else {
                    // The remote computer got deactivated.
                    return;
                };

                log::error!("Error whilst starting mavlink message proxy: {err}");

                tokio::select! {
                    // Await restart timeout and then attempt restart in next iteration.
                    _ = tokio::time::sleep(MAVLINK_PROXY_RESTART_TIMEOUT) => continue,
                    // Stop because remote computer got deactivated.
                    _ = stop_rx.recv() => {
                        log::debug!("Stopped mavlink message proxy");
                        return
                    },
                }
            }
        });

        self.mavlink_sender = Some(mavlink_sender);

        Ok(())
    }

    /// Deactivate the remote computer.
    ///
    /// MavLink messages from the remote computer are no longer proxied into the global [`Broadcast`] and
    /// heartbeat messages are no longer sent to the remote computer.
    pub fn deactivate(&mut self) -> Result<(), RemoteComputerError> {
        let (stop_tx, _) = self.stop.take().ok_or(RemoteComputerError::NotActive)?;
        let _ = self.mavlink_sender.take().ok_or(RemoteComputerError::NotActive)?;

        stop_tx.send(()).expect("Receivers should never be dropped before the stop signal transmission");

        Ok(())
    }

    /// Send a MavLink message to the remote computer.
    ///
    /// Internally uses [`MavlinkSender::send`].
    pub async fn send_mavlink_message(&self, message: Message) -> Result<usize, RemoteComputerError> {
        let (_, stop_rx) = self.stop.as_ref().ok_or(RemoteComputerError::NotActive)?;
        let mut stop_rx = stop_rx.resubscribe();
        let mavlink_tx = self.mavlink_sender.as_ref().ok_or(RemoteComputerError::NotActive)?;

        tokio::select! {
            result = mavlink_tx.send(message) => result.map_err(RemoteComputerError::MavLink),
            _ = stop_rx.recv() => Err(RemoteComputerError::Deactivated)
        }

        // TODO: I think here would be the right place to do retransmission of the message
    }

    /// Shorthand function for sending a MavLink heartbeat message to the remote computer.
    ///
    /// It internally calls [`send_mavlink_message`] with a message containing a [`Heartbeat`].
    pub async fn send_heartbeat_message(&self) -> Result<usize, RemoteComputerError> {
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
