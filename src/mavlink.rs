use std::{sync::Arc, time::Duration};

use crate::{config::Config, web::broadcast::Broadcast};
use actix_web_lab::sse::{Data, Event};
use mavlink_core::{MavConnection, MavHeader};
use tokio::sync::{Mutex, RwLock};

pub use hermes_mavlink::MavMessage as HermesMavMessage;

/// Mavlink system ID of the mission control
const MISSION_CONTROL_SYSTEM_ID: u8 = 111;

#[derive(Debug, thiserror::Error)]
pub enum MavlinkError {
    #[error("Error whilst connecting to mavlink broadcast: {0}")]
    ConnectionFailed(std::io::Error),
    #[error("Error whilst sending mavlink message: {0}")]
    SendFailed(mavlink_core::error::MessageWriteError),
}

type MavlinkConnection = Box<dyn MavConnection<HermesMavMessage> + Send + Sync>;

struct MavlinkData {
    header: MavHeader,
    message: HermesMavMessage,
}

pub struct Mavlink {
    connection: RwLock<Option<Arc<MavlinkConnection>>>,
    broadcast: Arc<Broadcast>,
    address: String,
    sequence: Mutex<u8>,
}

impl Mavlink {
    pub fn new(config: Arc<Config>, broadcast: Arc<Broadcast>) -> Arc<Self> {
        let instance = Self {
            connection: RwLock::new(None),
            address: config.mavlink_address.clone(),
            broadcast,
            sequence: Mutex::new(0),
        };
        Arc::new(instance)
    }

    /// Start listening to incoming messages and broadcast them using [`Broadcast::broadcast`] to all
    /// subscribed clients
    ///
    /// **Important**: This method only returns when an error during the receiving process of a message occurs.
    pub async fn start_message_proxy(&self) -> Result<(), MavlinkError> {
        let connection = self.get_or_setup_connection().await?;
        loop {
            let data = match connection.recv() {
                Ok((header, message)) => MavlinkData { header, message },
                // the message is not yet ready, therefore we can just ignore this error and continue until either the message is
                // ready or a "real" error occurs
                Err(mavlink_core::error::MessageReadError::Io(err)) if err.kind() == std::io::ErrorKind::WouldBlock => {
                    // FIXME: The current version of mavlink-core used by hermes-mavlink (and therefore also by this crate) doesn't
                    // support non-blocking mode using tokio. Once we drop hermes-mavlink, we should update mavlink-core or use
                    // another crate such that we can use async/await when receiving messages.
                    // At the moment, we just need to add this sleep in order to prevent constant polling :/
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    continue;
                }
                Err(err) => {
                    log::warn!("Unable to receive mavlink message: {err}");
                    // close the connection in case something went wrong with the connection
                    //
                    // since we have a lazily initialized connection, it will attemt a reconnect upon next usage
                    self.close_connection().await;
                    return Ok(());
                }
            };

            log::debug!("Received mavlink message from system {}: {:?}", data.header.system_id, data.message);

            match Event::try_from(data) {
                Ok(event) => self.broadcast.broadcast(event).await,
                Err(err) => {
                    log::warn!("Unable to transform mavlink message to event: {err}");
                    continue;
                }
            }
        }
    }

    /// Send a mavlink message out
    pub async fn send(&self, message: HermesMavMessage) -> Result<usize, MavlinkError> {
        let connection = self.get_or_setup_connection().await?;
        let mut sequence = self.sequence.lock().await;
        let header = MavHeader { system_id: MISSION_CONTROL_SYSTEM_ID, sequence: *sequence, ..Default::default() };
        *sequence = sequence.wrapping_add(1);
        drop(sequence);
        connection.send(&header, &message).map_err(MavlinkError::SendFailed)
    }

    /// Get or setup the mavlink connection should it not already exist.
    ///
    /// This setup allows us to lazily initialize the mavlink connection upon first usage. This way,
    /// the setup time of the mavlink connection does not impact the startup time of the total system.
    /// Additionally, we're able to close the connection and reconnect upon receiving a potential
    /// connection error.
    async fn get_or_setup_connection(&self) -> Result<Arc<MavlinkConnection>, MavlinkError> {
        let connection = self.connection.read().await;

        if let Some(connection) = connection.as_ref() {
            Ok(connection.clone())
        } else {
            // drop the read-handle of the lock as RwLock is not upgradable
            drop(connection);
            log::debug!("No mavlink connection found. Attempting to connect to {}...", self.address);
            let new_connection = mavlink_core::connect::<HermesMavMessage>(&self.address)
                .map(Arc::new)
                .map_err(MavlinkError::ConnectionFailed)?;
            log::debug!("Successfully established mavlink connection");
            let created_connection = new_connection.clone();
            let mut connection = self.connection.write().await;
            *connection = Some(new_connection);
            Ok(created_connection)
        }
    }

    /// Close the current mavlink connection
    async fn close_connection(&self) {
        let mut connection = self.connection.write().await;
        *connection = None;
        log::debug!("Successfully closed mavlink connection");
    }
}

impl TryFrom<MavlinkData> for Event {
    type Error = serde_json::Error;

    fn try_from(data: MavlinkData) -> Result<Event, Self::Error> {
        let event = Event::Data(Data::new_json(&data.message)?.event("mavlink-message"));
        Ok(event)
    }
}
