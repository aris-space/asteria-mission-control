use std::sync::Arc;

use async_trait::async_trait;

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
    async fn on_message(&self, message: &asteria_messages::Message) {
        self.broadcast.broadcast(Event::MavlinkMessage(message.clone())).await
    }
}
