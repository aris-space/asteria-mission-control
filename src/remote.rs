use crate::{
    NamedPssDatapointValue,
    config::{Config, MavlinkAddress, RemoteComputerConfig, RemoteComputerKind},
    mavlink::{MavlinkError, MavlinkSender},
    web::broadcast::Broadcast,
};
use actix_web_lab::sse::{Data, Event};
use asteria_datapoint_information::datapoint::DatapointHolder;
use asteria_messages::{
    Message,
    datapoints::{
        dp_flight_computer,
        dp_system_management::{self, Heartbeat, MavAutopilot, MavState, MavType},
    },
};
use futures::{StreamExt, stream::FuturesUnordered};
use mavio::Dialect;
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
    mavlink_tx: Option<Arc<MavlinkSender>>,
    stop_tx: Option<Sender<()>>,
    broadcast: Arc<Broadcast>,
    pub config_path: PathBuf,
}

impl RemoteComputer {
    pub fn new(rc_config: RemoteComputerConfig, config: Arc<Config>, broadcast: Arc<Broadcast>) -> Self {
        Self {
            kind: rc_config.kind,
            description: rc_config.description,
            mavlink_address: rc_config.mavlink_address,
            mavlink_system_id: config.mavlink.system_id,
            mavlink_tx: None,
            stop_tx: None,
            broadcast,
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

        let (msg_tx, mut msg_rx) = tokio::sync::mpsc::channel(10);
        let (mavlink_sender, mavlink_receiver) = crate::mavlink::tx_rx(self.mavlink_system_id, self.mavlink_address.clone());
        let mavlink_sender = Arc::new(mavlink_sender);

        let mut receive_stop_rx = stop_rx.resubscribe();
        // Start the thread which forwards the incoming MavLink messages until the remote computer gets deactivated.
        tokio::spawn(async move {
            loop {
                let Err(err) = mavlink_receiver.forward(&mut receive_stop_rx, msg_tx.clone()).await else {
                    // The remote computer got deactivated.
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

        let broadcast = self.broadcast.clone();
        // Start the thread which handles the incoming MavLink messages.
        // - Every message is proxied in JSON serialized form through SSE with the `mavlink-message` event
        // - If the message contains any PSS datapoints, the datapoint values are broadcast in JSON serialized form
        //   through SEE with the `pss-data` event.
        tokio::spawn(async move {
            loop {
                let message = tokio::select! {
                    Some(message) = msg_rx.recv() => message,
                    _ = stop_rx.recv() => {
                        log::debug!("Stopped mavlink message receiver");
                        return;
                    }
                };

                if let Message::FlightComputer(dp_flight_computer::Message::ConfigHash(git_hash)) = &message {}

                let mut events = Vec::new();

                let datapoint_events = message
                    .get_datapoint_values()
                    .into_iter()
                    .filter_map(|value| match Data::new_json(NamedPssDatapointValue::from(value)) {
                        Ok(data) => Some(Event::Data(data.event("pss-data"))),
                        Err(err) => {
                            log::warn!("Unable to serialize PSS datapoint value: {err}");
                            None
                        }
                    })
                    .collect::<Vec<_>>();
                events.extend(datapoint_events);

                match Data::new_json(message) {
                    Ok(data) => events.push(Event::Data(data.event("mavlink-message"))),
                    Err(err) => log::warn!("Unable to serialize mavlink message to json: {err}"),
                };

                if !events.is_empty() {
                    let broadcast = broadcast.clone();
                    tokio::spawn(async move {
                        FuturesUnordered::from_iter(events.into_iter().map(|event| broadcast.broadcast(event)))
                            .collect::<Vec<_>>()
                            .await
                    });
                }
            }
        });

        self.mavlink_tx = Some(mavlink_sender);

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
