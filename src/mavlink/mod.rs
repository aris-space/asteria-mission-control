use crate::{
    NamedPssDatapointValue, config::MavlinkAddress, mavlink::transport::AsyncTransportStream, web::broadcast::Broadcast,
};
use actix_web_lab::sse::{Data, Event};
use asteria_datapoint_information::datapoint::DatapointHolder;
use asteria_messages::{
    Message,
    datapoints::dp_system_management::{self, Heartbeat, MavAutopilot, MavState, MavType},
};
use futures::stream::FuturesUnordered;
use mavio::{
    AsyncReceiver, AsyncSender, Dialect, Endpoint,
    io::{TokioReader, TokioWriter},
    prelude::V2,
};
use std::sync::Arc;
use tokio::{
    select,
    sync::{Mutex, RwLock, broadcast::Receiver},
};
use tokio_stream::StreamExt;

mod transport;

/// Amount of receive-errors we tolerate before aborting the
/// reception of messages.
///
/// When a fatal receive-error occurs, the error count raises
/// quickly and thus it should be safe to not already exit
/// on the I/O error.
const MAX_RECV_ERROR_COUNT: u32 = 16;

#[derive(Debug, thiserror::Error)]
pub enum MavlinkError {
    #[error("Connection error: {0}")]
    Connection(tokio::io::Error),
    #[error("Mavio error: {0}")]
    Mavio(mavio::Error),
}

/// Get a new MavLink sender and receiver for a given MavLink address.
pub fn tx_rx(system_id: u8, address: MavlinkAddress, broadcast: Arc<Broadcast>) -> (MavlinkSender, MavlinkReceiver) {
    let sender = MavlinkSender {
        address: address.clone(),
        endpoint: Endpoint::v2(mavio::MavLinkId { system: system_id, component: 0 }),
        sender: RwLock::new(None),
    };

    let receiver = MavlinkReceiver { address, broadcast, errors: Mutex::new(0) };

    (sender, receiver)
}

pub struct MavlinkSender {
    address: MavlinkAddress,
    endpoint: Endpoint<V2>,
    sender: RwLock<Option<AsyncSender<tokio::io::Error, TokioWriter<AsyncTransportStream>, V2>>>,
}

impl MavlinkSender {
    /// Send a mavlink message out.
    ///
    /// If no sender already exists, this lazily initializes a new sender.
    pub async fn send(&self, message: Message) -> Result<usize, MavlinkError> {
        let frame = self.endpoint.next_frame(&message).map_err(MavlinkError::Mavio)?;
        let mut sender_guard = self.sender.write().await;

        if let Some(sender) = sender_guard.as_mut() {
            // There is an already initialized sender which we can use.
            let bytes = match sender.send(&frame).await {
                Ok(bytes) => bytes,
                Err(err) => {
                    // Remove the sender instance as it's most likely broken.
                    *sender_guard = None;
                    Err(MavlinkError::Mavio(err))?
                }
            };
            Ok(bytes)
        } else {
            // We need to initialize a new sender and then store it for later reuse.
            let transport = AsyncTransportStream::new(&self.address).await.map_err(MavlinkError::Connection)?;
            let writer = TokioWriter::new(transport);
            let mut sender = AsyncSender::versioned(writer, V2);
            let bytes = sender.send(&frame).await.map_err(MavlinkError::Mavio)?;
            *sender_guard = Some(sender);

            Ok(bytes)
        }
    }

    /// Shorthand function for sending a MavLink heartbeat message out.
    ///
    /// It internally calls [`MavlinkSender::send`] with a message containing a [`Heartbeat`].
    pub async fn send_heartbeat(&self) -> Result<usize, MavlinkError> {
        let heartbeat_message = Message::SystemManagement(dp_system_management::Message::Heartbeat(Heartbeat {
            type_: MavType::Gcs,
            mavlink_version: Message::version().unwrap_or_default(),
            system_status: MavState::Active,
            autopilot: MavAutopilot::Invalid,
            base_mode: 0,
            custom_mode: 0,
        }));
        self.send(heartbeat_message).await
    }
}

pub struct MavlinkReceiver {
    address: MavlinkAddress,
    broadcast: Arc<Broadcast>,
    errors: Mutex<u32>,
}

impl MavlinkReceiver {
    /// Listen to incoming messages and broadcast them using [`Broadcast::broadcast`] to all
    /// subscribed clients.
    ///
    /// **Important**: This method only returns when an error during the receiving process of a message occurs.
    pub async fn run_message_proxy(&self, stop_rx: &mut Receiver<()>) -> Result<(), MavlinkError> {
        let transport = AsyncTransportStream::new(&self.address).await.map_err(MavlinkError::Connection)?;
        let reader = TokioReader::new(transport);
        let mut receiver = AsyncReceiver::versioned(reader, V2);

        log::info!("Successfully connected to mavlink broadcast");

        loop {
            let frame = select! {
                // A frame was received.
                frame = receiver.recv() => match frame {
                    Ok(frame) => frame,
                    Err(mavio::Error::Io(io_error)) => {
                        // When we have IO errors we stop receiving as the connection
                        // is most likely broken.
                        let mut recv_error_count = self.errors.lock().await;
                        if *recv_error_count == MAX_RECV_ERROR_COUNT {
                            return Err(MavlinkError::Mavio(mavio::Error::Io(io_error)));
                        } else {
                            *recv_error_count += 1;
                        }
                        log::warn!("Unable to receive mavlink message due to I/O error: {}", mavio::Error::Io(io_error));
                        continue;
                    }
                    Err(err) => {
                        log::warn!("Unable to receive mavlink message: {err}");
                        continue;
                    }
                },
                // Stop signal is received, the message proxy should stop.
                _ = stop_rx.recv() => return Ok(())
            };

            log::trace!("received mavlink frame: {frame:?}");

            if let Err(err) = frame.validate_checksum::<Message>() {
                log::warn!("Received mavlink message with invalid checksum: {err}");
                continue;
            };

            let message = match frame.decode::<Message>() {
                Ok(message) => message,
                Err(err) => {
                    log::warn!("Unable to decode mavlink message: {err}");
                    continue;
                }
            };

            let datapoint_result = message
                .get_datapoint_values()
                .into_iter()
                .map(|value| {
                    let data = Data::new_json(NamedPssDatapointValue::from(value))?;
                    let event = Event::Data(data.event("pss-data"));
                    Ok(self.broadcast.broadcast(event))
                })
                .collect::<Result<Vec<_>, serde_json::Error>>();
            match datapoint_result {
                Ok(futures) => {
                    // Wait until all pss-data events are sent.
                    FuturesUnordered::from_iter(futures).collect::<Vec<_>>().await;
                }
                Err(err) => {
                    log::warn!("Unable to serialize at least one PSS datapoint value: {err}")
                    // We don't continue here to also try broadcasting the MavLink message.
                }
            }

            match Data::new_json(message) {
                Ok(data) => {
                    let event = Event::Data(data.event("mavlink-message"));
                    self.broadcast.broadcast(event).await
                }
                Err(err) => {
                    log::warn!("Unable to serialize mavlink message to json: {err}");
                    continue;
                }
            };
        }
    }
}
