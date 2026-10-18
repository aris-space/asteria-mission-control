use std::sync::Arc;

use async_trait::async_trait;
use mavlink_lib::MavlinkMessage;

use crate::intercept::Interceptor;
use crate::web::broadcast::Broadcast;
use crate::web::event::Event;

/// MavLink message interceptor which broadcasts the message
/// in form of a [`Event::MavlinkMessage`] to all connected
/// SSE clients.
pub struct SseInterceptor {
    broadcast: Arc<Broadcast>,
}

impl SseInterceptor {
    pub fn new(broadcast: Arc<Broadcast>) -> Self {
        Self { broadcast }
    }
}

#[async_trait]
impl Interceptor for SseInterceptor {
    async fn on_incoming_message(&self, MavlinkMessage { message, .. }: &MavlinkMessage) {
        self.broadcast.broadcast(Event::MavlinkMessage(message.clone())).await
    }
}
