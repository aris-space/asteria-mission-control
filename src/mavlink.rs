use std::sync::Arc;

use crate::{config::Config, web::broadcast::Broadcast};
use actix_web_lab::sse::{Data, Event};
use hermes_mavlink::MavMessage as HermesMavMessage;
use mavlink_core::{MavConnection, MavHeader};
use tokio::sync::Mutex;

/// Mavlink system ID of the mission control
const MISSION_CONTROL_SYSTEM_ID: u8 = 111;

#[derive(Debug, thiserror::Error)]
pub enum MavlinkError {
    #[error("Error whilst connecting to mavlink broadcast: {0}")]
    ConnectionFailed(std::io::Error),
    #[error("Error whilst sending mavlink message: {0}")]
    SendFailed(mavlink_core::error::MessageWriteError),
}

struct MavlinkData { header: MavHeader, message: HermesMavMessage }

pub struct MavlinkRouter {
    connection: Box<dyn MavConnection<HermesMavMessage> + Send + Sync>,
    broadcast: Arc<Broadcast>,
    sequence: Mutex<u8>,
}

impl MavlinkRouter {
    pub fn new(config: Arc<Config>, broadcast: Arc<Broadcast>) -> Result<Arc<Self>, MavlinkError> {
        let connection = mavlink_core::connect::<HermesMavMessage>(&config.mavlink_address).map_err(MavlinkError::ConnectionFailed)?;
        let instance = Self { connection, broadcast, sequence: Mutex::new(0) };
        Ok(Arc::new(instance))
    }

    /// Start listening to incoming messages and broadcast them using [`Broadcast::broadcast`] to all
    /// subscribed clients
    pub async fn start_message_proxy(&self) {
        loop {
            let data = match self.connection.recv() {
                Ok((header, message)) => MavlinkData { header, message },
                Err(err) => {
                    log::warn!("Unable to receive mavlink message: {err}");
                    continue;
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

    pub async fn send(&self, message: HermesMavMessage) -> Result<usize, MavlinkError> {
        let mut sequence = self.sequence.lock().await;
        let header = MavHeader { system_id: MISSION_CONTROL_SYSTEM_ID, sequence: *sequence, ..Default::default() };
        *sequence = sequence.wrapping_add(1);
        drop(sequence);
        self.connection.send(&header, &message).map_err(MavlinkError::SendFailed)
    }
}

impl TryFrom<MavlinkData> for Event {
    type Error = serde_json::Error;

    fn try_from(data: MavlinkData) -> Result<Event, Self::Error> {
        let event = Event::Data(Data::new_json(&data.message)?.event("mavlink-message"));
        Ok(event)
    }
}
