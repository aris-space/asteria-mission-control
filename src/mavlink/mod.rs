use crate::{NamedPssDatapointValue, config::Config, mavlink::transport::AsyncTransportStream, web::broadcast::Broadcast};
use actix_web_lab::sse::{Data, Event};
use asteria_datapoint_information::datapoint::DatapointHolder;
use asteria_messages::Message;
use futures::stream::FuturesUnordered;
use mavio::{
    AsyncReceiver, AsyncSender, Endpoint,
    io::{TokioReader, TokioWriter},
    prelude::V2,
};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
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

type MavlinkSender = AsyncSender<tokio::io::Error, TokioWriter<AsyncTransportStream>, V2>;

pub struct Mavlink {
    sender: RwLock<Option<MavlinkSender>>,
    broadcast: Arc<Broadcast>,
    config: Arc<Config>,
    endpoint: Endpoint<V2>,
    recv_errors: Mutex<u32>,
}

impl Mavlink {
    pub fn new(config: Arc<Config>, broadcast: Arc<Broadcast>) -> Arc<Self> {
        let endpoint = Endpoint::v2(mavio::MavLinkId { system: config.mavlink.system_id, component: 0 });
        let instance = Self { sender: RwLock::new(None), config, broadcast, endpoint, recv_errors: Mutex::new(0) };
        Arc::new(instance)
    }

    /// Listen to incoming messages and broadcast them using [`Broadcast::broadcast`] to all
    /// subscribed clients.
    ///
    /// **Important**: This method only returns when an error during the receiving process of a message occurs.
    pub async fn run_message_proxy(&self) -> Result<(), MavlinkError> {
        let transport = AsyncTransportStream::new(&self.config.mavlink.address).await.map_err(MavlinkError::Connection)?;
        let reader = TokioReader::new(transport);
        let mut receiver = AsyncReceiver::versioned(reader, V2);

        loop {
            let frame = match receiver.recv().await {
                Ok(frame) => frame,
                Err(mavio::Error::Io(io_error)) => {
                    // When we have IO errors we stop receiving as the connection
                    // is most likely broken.
                    let mut error_count = self.recv_errors.lock().await;
                    if *error_count == MAX_RECV_ERROR_COUNT {
                        return Err(MavlinkError::Mavio(mavio::Error::Io(io_error)));
                    } else {
                        *error_count += 1;
                    }
                    log::warn!("Unable to receive mavlink message due to I/O error: {}", mavio::Error::Io(io_error));
                    continue;
                }
                Err(err) => {
                    log::warn!("Unable to receive mavlink message: {err}");
                    continue;
                }
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

    /// Send a mavlink message out.
    ///
    /// If no sender already exists, this lazily initializes a new sender.
    pub async fn send(&self, message: Message) -> Result<usize, MavlinkError> {
        let frame = self.endpoint.next_frame(&message).map_err(MavlinkError::Mavio)?;
        let mut sender_guard = self.sender.write().await;

        if let Some(sender) = sender_guard.as_mut() {
            // There is an already initialized sender which we can use.
            let bytes = sender.send(&frame).await.map_err(MavlinkError::Mavio)?;
            Ok(bytes)
        } else {
            // We need to initialize a new sender and then store it for later reuse.
            let transport =
                AsyncTransportStream::new(&self.config.mavlink.address).await.map_err(MavlinkError::Connection)?;
            let writer = TokioWriter::new(transport);
            let mut sender = AsyncSender::versioned(writer, V2);
            let bytes = sender.send(&frame).await.map_err(MavlinkError::Mavio)?;
            *sender_guard = Some(sender);

            Ok(bytes)
        }
    }
}
