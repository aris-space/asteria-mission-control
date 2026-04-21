use crate::{config::MavlinkAddress, mavlink::transport::AsyncTransportStream};
use asteria_messages::Message;
use mavio::{
    AsyncReceiver, AsyncSender, Endpoint,
    io::{TokioReader, TokioWriter},
    prelude::V2,
};
use tokio::sync::{Mutex, RwLock, broadcast::Receiver, mpsc::UnboundedSender};

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
    #[error("Mavlink communication was stopped")]
    Stopped,
}

/// Get a new MavLink sender and receiver for a given MavLink address.
pub fn tx_rx(system_id: u8, address: MavlinkAddress) -> (MavlinkSender, MavlinkReceiver) {
    let sender = MavlinkSender {
        address: address.clone(),
        endpoint: Endpoint::v2(mavio::MavLinkId { system: system_id, component: 0 }),
        sender: RwLock::new(None),
    };

    let receiver = MavlinkReceiver { address, errors: Mutex::new(0) };

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
    ///
    /// Returns [`MavlinkError::Stopped`] when a stop signal was received.
    pub async fn send(&self, stop_rx: &mut Receiver<()>, message: Message) -> Result<usize, MavlinkError> {
        let frame = self.endpoint.next_frame(&message).map_err(MavlinkError::Mavio)?;
        let mut sender_guard = tokio::select! {
            guard = self.sender.write() => guard,
            _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
        };

        if let Some(sender) = sender_guard.as_mut() {
            // There is an already initialized sender which we can use.
            let bytes = tokio::select! {
                result = sender.send(&frame) => match result {
                    Ok(bytes) => bytes,
                    Err(err) => {
                        // Remove the sender instance as it's most likely broken.
                        *sender_guard = None;
                        return Err(MavlinkError::Mavio(err))
                    }
                },
                _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
            };
            Ok(bytes)
        } else {
            // We need to initialize a new sender and then store it for later reuse.
            let transport = tokio::select! {
                result = AsyncTransportStream::new(&self.address) => result.map_err(MavlinkError::Connection)?,
                _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
            };
            let writer = TokioWriter::new(transport);
            let mut sender = AsyncSender::versioned(writer, V2);
            let bytes = tokio::select! {
                result = sender.send(&frame) => result.map_err(MavlinkError::Mavio)?,
                _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
            };
            *sender_guard = Some(sender);

            Ok(bytes)
        }
    }
}

pub struct MavlinkReceiver {
    address: MavlinkAddress,
    errors: Mutex<u32>,
}

impl MavlinkReceiver {
    /// Listen to incoming messages and forward them into the channel where `tx` is a sender.
    ///
    /// Returns [`MavlinkError::Stopped`] when the receiving end of the message channel closed or a stop signal was received.
    pub async fn forward(&self, stop_rx: &mut Receiver<()>, msg_tx: &UnboundedSender<Message>) -> Result<(), MavlinkError> {
        let transport = tokio::select! {
            result = AsyncTransportStream::new(&self.address) => result.map_err(MavlinkError::Connection)?,
            _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
        };
        let reader = TokioReader::new(transport);
        let mut receiver = AsyncReceiver::versioned(reader, V2);

        log::info!("Successfully connected to mavlink broadcast");

        loop {
            let frame = tokio::select! {
                // A frame was received.
                frame = receiver.recv() => match frame {
                    Ok(frame) => frame,
                    Err(mavio::Error::Io(io_error)) => {
                        // When we have IO errors we stop receiving as the connection
                        // is most likely broken.
                        let mut recv_error_count = tokio::select! {
                            guard = self.errors.lock() => guard,
                            _ = stop_rx.recv() => return Err(MavlinkError::Stopped),
                        };
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
                _ = stop_rx.recv() => return Err(MavlinkError::Stopped)
            };

            log::trace!("Received mavlink frame: {frame:?}");

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

            if msg_tx.send(message).is_err() {
                log::warn!("Message receiver is closed, shutting down message proxy!");
                return Err(MavlinkError::Stopped);
            }
        }
    }
}
