//! This module contains all the [`Interceptor`]s which need to do some logic
//! for every [`Message`] from the incoming MavLink message channel.
//!
//! The [`Interceptor`]s are managed through the [`Interceptors`] struct which
//! calls [`Interceptor::on_message`] on every registered [`Interceptor`] for
//! every incoming [`Message`].

use asteria_messages::Message;
use async_trait::async_trait;
use futures::stream::FuturesUnordered;
use tokio::sync::mpsc::UnboundedReceiver;
use tokio_stream::StreamExt;

pub mod config;
pub mod log;
pub mod pss;
pub mod sse;

/// Trait which can be implemented by different MavLink message
/// consumers.
#[async_trait]
pub trait Interceptor: Send + Sync {
    /// This method gets called for every incoming MavLink [`Message`].
    async fn on_message(&self, message: &Message);
}

pub struct Interceptors {
    interceptors: Vec<Box<dyn Interceptor>>,
}

impl Interceptors {
    /// Create a new [`InterceptorsBuilder`] which can be used
    /// to construct a new [`Interceptors`] instance.
    pub fn builder() -> InterceptorsBuilder {
        InterceptorsBuilder { interceptors: Vec::new() }
    }

    /// Read all incoming [`Message`]s from `msg_rx` and provide it to all registered
    /// [`Interceptor`]s.
    /// The order in which the interceptors are completed is not deterministic.
    pub async fn execute_with_receiver(self, mut msg_rx: UnboundedReceiver<Message>) {
        while let Some(message) = msg_rx.recv().await {
            FuturesUnordered::from_iter(self.interceptors.iter().map(|interceptor| interceptor.on_message(&message)))
                .collect::<Vec<_>>()
                .await;
        }
    }
}

pub struct InterceptorsBuilder {
    interceptors: Vec<Box<dyn Interceptor>>,
}

impl InterceptorsBuilder {
    /// Add a new [`Interceptor`].
    pub fn with(mut self, interceptor: impl Interceptor + 'static) -> Self {
        self.interceptors.push(Box::new(interceptor));
        Self { interceptors: self.interceptors }
    }

    /// Convert the [`InterceptorsBuilder`] instance into a finalized
    /// [`Interceptors`] instance.
    pub fn finish(self) -> Interceptors {
        Interceptors { interceptors: self.interceptors }
    }
}
