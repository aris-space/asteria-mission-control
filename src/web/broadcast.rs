use actix_web_lab::sse::{Data, Event, Sse};
use actix_web_lab::util::InfallibleStream;
use chrono::Utc;
use futures::future::join_all;
use serde::Serialize;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tokio_stream::wrappers::ReceiverStream;

/// Interval in seconds at which all subscriptions should be pinged.
const PING_INTERVAL: u64 = 10;

pub struct Broadcast {
    subscriptions: Mutex<Vec<tokio::sync::mpsc::Sender<Event>>>,
}

impl Broadcast {
    pub fn new() -> Arc<Self> {
        let broadcast = Arc::new(Self { subscriptions: Mutex::new(Vec::new()) });
        Broadcast::spawn_ping(broadcast.clone());
        broadcast
    }

    /// Ping all connected clients and remove clients which are no longer connected
    /// to the broadcast.
    fn spawn_ping(this: Arc<Self>) {
        tokio::task::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(PING_INTERVAL));
            loop {
                interval.tick().await;
                this.remove_stale_connections().await;
            }
        });
    }

    /// Remove all connections for which the ping broadcast fails to avoid
    /// unnecessary broadcasts.
    async fn remove_stale_connections(&self) {
        let mut subscriptions = self.subscriptions.lock().await;

        *subscriptions = join_all(
            subscriptions
                .iter()
                .map(|recv| async { recv.send(BroadcastEvent::Ping.into()).await.ok().map(|_| recv.clone()) }),
        )
        .await
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();
    }

    /// Subscribe to all events.
    pub async fn subscribe(&self) -> actix_web::Result<Sse<InfallibleStream<ReceiverStream<Event>>>> {
        let (tx, rx) = tokio::sync::mpsc::channel::<Event>(10);
        let mut subscriptions = self.subscriptions.lock().await;
        if let Err(err) = tx.send(BroadcastEvent::Ping.into()).await {
            log::warn!("Unable to send initial ping to new subscription: {err}");
        }
        subscriptions.push(tx.clone());

        Ok(Sse::from_infallible_receiver(rx))
    }

    /// Notify all subscriptions with a specific event.
    pub async fn broadcast(&self, event: impl Into<Event>) {
        // Clone such that lock is dropped immediately.
        let subscriptions = self.subscriptions.lock().await.clone();

        log::trace!("Notifying {} receivers of new event", subscriptions.len());

        let sse_event: Event = event.into();
        for receiver in subscriptions {
            // We can ignore errors since the stale client gets removed in next cleanup
            // anyways.
            receiver.send(sse_event.clone()).await.ok();
        }
    }
}

#[derive(Serialize)]
/// Internal events which are needed by the broadcast.
enum BroadcastEvent {
    /// Empty event used to check connectivity to clients.
    Ping,
}

impl From<BroadcastEvent> for Event {
    fn from(value: BroadcastEvent) -> Self {
        match value {
            // The data of the ping event contains the current UTC timestamp in milliseconds such that
            // the client can display some sort of latency to the server.
            BroadcastEvent::Ping => Event::Data(Data::new(Utc::now().timestamp_millis().to_string()).event("ping")),
        }
    }
}
