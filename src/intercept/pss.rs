use std::sync::Arc;

use asteria_datapoint_information::datapoint::DatapointHolder;
use async_trait::async_trait;
use futures::stream::FuturesUnordered;
use tokio_stream::StreamExt;

use crate::{
    intercept::Interceptor,
    web::{broadcast::Broadcast, event::Event},
};

/// MavLink message interceptor which broadcasts the PSS
/// datapoint values of the message in form of [`Event::PssData`]
/// to all connected SSE clients.
pub struct PssInterceptor {
    broadcast: Arc<Broadcast>,
}

impl PssInterceptor {
    pub fn new(broadcast: Arc<Broadcast>) -> Self {
        Self { broadcast }
    }
}

#[async_trait]
impl Interceptor for PssInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let datapoint_events = message.get_datapoint_values().into_iter().map(Event::PssData).collect::<Vec<_>>();
        FuturesUnordered::from_iter(datapoint_events.into_iter().map(|event| self.broadcast.broadcast(event)))
            .collect::<Vec<_>>()
            .await;
    }
}
