use crate::{
    config::{Config, MavlinkAddress, RemoteComputerConfig, RemoteComputerKind},
    mavlink::{MavlinkError, MavlinkSender},
    web::broadcast::Broadcast,
};
use asteria_messages::Message;
use std::{collections::HashMap, path::PathBuf, sync::Arc, time::Duration};
use tokio::sync::{RwLock, broadcast::Sender};

pub type Remotes = HashMap<String, RwLock<RemoteComputer>>;

/// Duration after which a restart of the MavLink
/// message proxy should be attempted.
pub const MAVLINK_PROXY_RESTART_TIMEOUT: Duration = Duration::from_millis(2500);

#[derive(Debug, thiserror::Error)]
pub enum RemoteComputerError {
    #[error("The remote computer is already active")]
    AlreadyActive,
    #[error("The remote computer is not active")]
    NotActive,
    #[error(transparent)]
    MavLink(MavlinkError),
}

pub struct RemoteComputer {
    pub kind: RemoteComputerKind,
    pub description: String,
    mavlink_address: MavlinkAddress,
    mavlink_system_id: u8,
    broadcast: Arc<Broadcast>,
    mavlink_tx: Option<Arc<MavlinkSender>>,
    stop_tx: Option<Sender<()>>,

    pub diagram_path: PathBuf,
    pub config_path: PathBuf,
}

impl RemoteComputer {
    pub fn new(rc_config: RemoteComputerConfig, config: Arc<Config>, broadcast: Arc<Broadcast>) -> Self {
        Self {
            kind: rc_config.kind,
            description: rc_config.description,
            mavlink_address: rc_config.mavlink_address,
            mavlink_system_id: config.mavlink.system_id,
            broadcast,
            mavlink_tx: None,
            stop_tx: None,

            diagram_path: rc_config.diagram_path,
            config_path: rc_config.config_path,
        }
    }

    /// Activate the remote computer.
    ///
    /// After activation, MavLink messages from the remote computers are proxied into the global [`Broadcast`]
    /// and MavLink heartbeat messages are sent to the remote computer.
    pub fn activate(&mut self) -> Result<(), RemoteComputerError> {
        if self.stop_tx.is_some() {
            return Err(RemoteComputerError::AlreadyActive);
        }

        let (stop_tx, mut stop_rx) = tokio::sync::broadcast::channel(1);
        self.stop_tx = Some(stop_tx);

        let (mavlink_tx, mavlink_rx) =
            crate::mavlink::tx_rx(self.mavlink_system_id, self.mavlink_address.clone(), self.broadcast.clone());
        let mavlink_tx = Arc::new(mavlink_tx);

        let mut receive_stop_rx = stop_rx.resubscribe();
        tokio::spawn(async move {
            loop {
                let Err(err) = mavlink_rx.run_message_proxy(&mut receive_stop_rx).await else {
                    // The message proxy was stopped because the remote computer got deactivated.
                    return;
                };

                log::error!("Error whilst starting mavlink message proxy: {err}");

                tokio::select! {
                    // Await restart timeout and then attempt restart in next iteration.
                    _ = tokio::time::sleep(MAVLINK_PROXY_RESTART_TIMEOUT) => continue,
                    // Stop because remote computer got deactivated.
                    _ = receive_stop_rx.recv() => {
                        log::debug!("Stopped mavlink message proxy");
                        return
                    },
                }
            }
        });

        let heartbeat_tx = mavlink_tx.clone();
        tokio::spawn(async move {
            loop {
                // Send a heartbeat MavLink message to the MavLink router in a 1Hz interval.
                if let Err(err) = heartbeat_tx.send_heartbeat().await {
                    log::error!("Error whilst sending heartbeat mavlink message: {err}")
                };

                log::debug!("Successfully sent heartbeat message");

                tokio::select! {
                    // Sleep for a second.
                    _ = tokio::time::sleep(Duration::from_secs(1)) => continue,
                    // Stop because remote computer got deactivated.
                    _ = stop_rx.recv() => {
                        log::debug!("Stopped mavlink heartbeat");
                        return
                    },
                }
            }
        });

        self.mavlink_tx = Some(mavlink_tx);

        Ok(())
    }

    /// Deactivate the remote computer.
    ///
    /// MavLink messages from the remote computer are no longer proxied into the global [`Broadcast`] and
    /// heartbeat messages are no longer sent to the remote computer.
    pub fn deactivate(&mut self) -> Result<(), RemoteComputerError> {
        let stop_tx = self.stop_tx.take().ok_or(RemoteComputerError::NotActive)?;
        let _ = self.mavlink_tx.take().ok_or(RemoteComputerError::NotActive)?;

        stop_tx.send(()).expect("Receivers should never be dropped before the stop signal transmission");

        Ok(())
    }

    /// Send a MavLink message to the remote computer.
    ///
    /// Internally uses [`MavlinkSender::send`].
    pub async fn send_mavlink_message(&self, message: Message) -> Result<usize, RemoteComputerError> {
        let mavlink_tx = self.mavlink_tx.as_ref().ok_or(RemoteComputerError::NotActive)?;
        mavlink_tx.send(message).await.map_err(RemoteComputerError::MavLink)
        // TODO: I think here would be the right place to do retransmission of the message
    }
}
