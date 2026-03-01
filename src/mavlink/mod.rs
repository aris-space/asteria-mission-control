use std::sync::Arc;

use crate::{config::Config, mavlink::transport::AsyncTransportStream, web::broadcast::Broadcast};
use actix_web_lab::sse::{Data, Event};
use mavio::{
    AsyncReceiver, AsyncSender, Endpoint,
    io::{TokioReader, TokioWriter},
    prelude::V2,
};
use tokio::sync::RwLock;

#[derive(Debug, thiserror::Error)]
pub enum MavlinkError {
    #[error("Connection error: {0}")]
    Connection(tokio::io::Error),
    #[error("Mavio error: {0}")]
    Mavio(mavio::Error),
}

mod transport;

use asteria_messages::Message;

type MavlinkSender = AsyncSender<tokio::io::Error, TokioWriter<AsyncTransportStream>, V2>;

pub struct Mavlink {
    sender: RwLock<Option<MavlinkSender>>,
    broadcast: Arc<Broadcast>,
    config: Arc<Config>,
    endpoint: Endpoint<V2>,
}

impl Mavlink {
    pub fn new(config: Arc<Config>, broadcast: Arc<Broadcast>) -> Arc<Self> {
        let endpoint = Endpoint::v2(mavio::MavLinkId { system: config.mavlink.system_id, component: 0 });
        let instance = Self { sender: RwLock::new(None), config, broadcast, endpoint };
        Arc::new(instance)
    }

    /// Listen to incoming messages and broadcast them using [`Broadcast::broadcast`] to all
    /// subscribed clients
    ///
    /// **Important**: This method only returns when an error during the receiving process of a message occurs.
    pub async fn run_message_proxy(&self) -> Result<(), MavlinkError> {
        let transport = AsyncTransportStream::new(&self.config.mavlink.address).await.map_err(MavlinkError::Connection)?;
        let reader = TokioReader::new(transport);
        let mut receiver = AsyncReceiver::versionless(reader);

        loop {
            let frame = match receiver.recv().await {
                Ok(frame) => frame,
                Err(mavio::Error::Io(io_error)) => {
                    // when we have IO errors we stop receiving as the connection
                    // is most likely broken
                    return Err(MavlinkError::Mavio(mavio::Error::Io(io_error)));
                }
                Err(err) => {
                    log::warn!("Unable to receive mavlink message: {err}");
                    continue;
                }
            };

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

    /// Send a mavlink message out
    pub async fn send(&self, message: Message) -> Result<usize, MavlinkError> {
        let frame = self.endpoint.next_frame(&message).map_err(MavlinkError::Mavio)?;
        let mut sender_guard = self.sender.write().await;

        if let Some(sender) = sender_guard.as_mut() {
            let bytes = sender.send(&frame).await.map_err(MavlinkError::Mavio)?;
            Ok(bytes)
        } else {
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
