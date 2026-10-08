use crate::transport::AsyncTransportStream;

use asteria_messages::Message;
use mavio::io::{TokioReader, TokioWriter};
use mavio::prelude::V2;
use mavio::{AsyncReceiver, AsyncSender, Endpoint};
use std::convert::Infallible;
use std::time::Duration;
use tokio::sync::mpsc;
use tokio::sync::mpsc::UnboundedSender;

mod transport;

/// Amount of consecutive receive-errors tolerated on one connection before it's
/// considered dead and gets reconnected.
const MAX_RECV_ERROR_COUNT: u32 = 16;

/// Delay before retrying a failed connection attempt, to avoid hot-looping against an
/// endpoint that's genuinely unreachable.
const RECONNECT_BACKOFF: Duration = Duration::from_millis(2500);

#[derive(Debug, thiserror::Error)]
#[error("the mavlink connection has shut down for good")]
pub struct SendError;

pub struct MavlinkMessage {
    /// The size of the serialized MavLink message in bytes.
    pub size: usize,
    /// The deserialized [`Message`].
    pub message: Message,
}

#[derive(Debug, Clone)]
pub enum MavlinkAddress {
    /// IP address and port used for TCP communication
    Tcp { remote: String },
    /// Path to a serial device together with the baud rate used
    Serial { path: String, baud_rate: u32 },
}

/// Create a [`MavlinkSender`]/[`MavlinkConnection`] pair for `address`.
///
/// Nothing is dialed yet - [`MavlinkConnection::run`] must be spawned or awaited
/// somewhere for messages to actually go out or come in.
pub fn tx_rx(system_id: u8, address: MavlinkAddress) -> (MavlinkSender, MavlinkConnection) {
    let (outbox_tx, outbox_rx) = mpsc::unbounded_channel();

    let sender = MavlinkSender { outbox: outbox_tx };
    let connection = MavlinkConnection {
        address,
        endpoint: Endpoint::v2(mavio::MavLinkId { system: system_id, component: 0 }),
        outbox: outbox_rx,
    };

    (sender, connection)
}

/// Queues mavlink messages for [`MavlinkConnection::run`] to send.
///
/// Queuing never fails except once the connection is gone for good (every
/// [`MavlinkConnection`] handle dropped); actual delivery is best-effort, same as
/// MAVLink over any transport always is.
pub struct MavlinkSender {
    outbox: mpsc::UnboundedSender<Message>,
}

impl MavlinkSender {
    pub fn send(&self, message: Message) -> Result<(), SendError> {
        self.outbox.send(message).map_err(|_| SendError)
    }
}

/// Owns the mavlink connection to `address` and drives both directions of traffic.
///
/// A MAVLink transport (TCP to mavlink-router, or a serial link) is one physical
/// connection, not independent send/receive sockets. One owner driving both directions
/// from a single loop means a failure on either side is noticed and reconnected on
/// immediately, instead of one side quietly writing into a socket the other side
/// already knows is dead.
pub struct MavlinkConnection {
    address: MavlinkAddress,
    /// Assigns outgoing sequence numbers. Encoding happens right before a message is
    /// actually written out (not when it's queued), so sequence numbers stay in the
    /// order messages are truly transmitted in, even under concurrent senders.
    endpoint: Endpoint<V2>,
    outbox: mpsc::UnboundedReceiver<Message>,
}

impl MavlinkConnection {
    /// Run the connection until the caller cancels it (e.g. via `tokio::select!` or by
    /// dropping the future). The `Infallible` return type is a promise: this loop never
    /// stops on its own, so callers don't need to handle a "the connection died" case.
    pub async fn run(
        mut self,
        incoming_msg_tx: &UnboundedSender<MavlinkMessage>,
        outgoing_msg_tx: &UnboundedSender<MavlinkMessage>,
    ) -> Infallible {
        let mut outbox_closed = false;

        loop {
            let stream = match AsyncTransportStream::new(&self.address).await {
                Ok(stream) => stream,
                Err(err) => {
                    log::warn!("Unable to connect to mavlink endpoint: {err}");
                    tokio::time::sleep(RECONNECT_BACKOFF).await;
                    continue;
                }
            };
            log::info!("Successfully connected to mavlink stream: {stream:?}");

            let (read_half, write_half) = tokio::io::split(stream);
            let mut receiver = AsyncReceiver::versioned(TokioReader::new(read_half), V2);
            let mut sender = AsyncSender::versioned(TokioWriter::new(write_half), V2);
            let mut recv_errors = 0u32;

            let disconnect_reason = loop {
                tokio::select! {
                    frame = receiver.recv() => match frame {
                        Ok(frame) => {
                            recv_errors = 0;
                            handle_incoming(&frame, incoming_msg_tx);
                        }
                        Err(mavio::Error::Io(io_error)) => {
                            recv_errors += 1;
                            log::warn!(
                                "Unable to receive mavlink message due to I/O error ({recv_errors}/{MAX_RECV_ERROR_COUNT}): {}",
                                mavio::Error::Io(io_error)
                            );
                            if recv_errors >= MAX_RECV_ERROR_COUNT {
                                break "too many receive errors";
                            }
                        }
                        Err(err) => log::warn!("Unable to receive mavlink message: {err}"),
                    },
                    message = self.outbox.recv(), if !outbox_closed => match message {
                        Some(message) => match self.endpoint.next_frame(&message) {
                            Ok(frame) => {
                                match sender.send(&frame).await {
                                    Ok(bytes) => {
                                        if outgoing_msg_tx.send(MavlinkMessage { size: bytes, message }).is_err() {
                                            log::warn!("Outgoing message receiver is closed");
                                        }
                                    },
                                    Err(err) => {
                                        log::warn!("Unable to send mavlink message: {err}");
                                        break "send failed";
                                    }
                                }
                            }
                            Err(err) => log::warn!("Unable to encode mavlink message, dropping it: {err}"),
                        },
                        // Every `MavlinkSender` was dropped - nothing will ever be queued
                        // again, but we can keep receiving for as long as the caller wants.
                        None => outbox_closed = true,
                    },
                }
            };

            log::warn!("Mavlink connection lost ({disconnect_reason}), reconnecting...");
        }
    }
}

fn handle_incoming(frame: &mavio::Frame<V2>, incoming_msg_tx: &UnboundedSender<MavlinkMessage>) {
    log::trace!("Received mavlink frame: {frame:?}");

    if let Err(err) = frame.validate_checksum::<Message>() {
        log::warn!("Received mavlink message with invalid checksum: {err}");
        return;
    }

    let message = match frame.decode::<Message>() {
        Ok(message) => message,
        Err(err) => {
            log::warn!("Unable to decode mavlink message: {err}");
            return;
        }
    };

    if incoming_msg_tx.send(MavlinkMessage { size: frame.size(), message }).is_err() {
        log::warn!("Incoming message receiver is closed, dropping mavlink message");
    }
}
