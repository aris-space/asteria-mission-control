use std::array;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use asteria_messages::Message;
use asteria_messages::datapoints::dp_system_management::Message as SysMessage;
use async_trait::async_trait;
use chrono::{Timelike, Utc};
use mavlink_lib::MavlinkMessage;
use tokio::sync::Mutex;
use tokio::time::MissedTickBehavior;

use crate::intercept::Interceptor;

/// The received message of every second are stored in a bucket.
/// With 120 buckets we can represent the telemetry stats of the incoming
/// messages from the latest 120 seconds in a sliding-window style.
const TELEMETRY_BUCKETS: usize = 120;

#[derive(Default)]
struct IncomingTelemetryAggregate {
    messages: usize,
    bytes: usize,
}

/// Interceptor which aggregates telemetry stats about the incoming messages of the
/// last 120 seconds and compares it to the advertised telemetry stats from the RC.
pub struct TelemetryInterceptor {
    last_bucket: Arc<AtomicUsize>,
    buckets: Arc<Mutex<[IncomingTelemetryAggregate; TELEMETRY_BUCKETS]>>,
    window_total: Arc<Mutex<IncomingTelemetryAggregate>>,
}

impl TelemetryInterceptor {
    pub fn new() -> Self {
        let last_bucket = Arc::new(AtomicUsize::new(0));
        let buckets = Arc::new(Mutex::new(array::from_fn(|_| IncomingTelemetryAggregate::default())));
        let window_total = Arc::new(Mutex::new(IncomingTelemetryAggregate::default()));

        {
            let last_bucket = last_bucket.clone();
            let buckets = buckets.clone();
            let window_total = window_total.clone();
            // To ensure the sliding window advances even when no messages are received, we
            // have a separate tokio thread which ticks in an 1s interval.
            tokio::spawn(async move {
                let mut interval = tokio::time::interval(Duration::from_secs(1));
                interval.set_missed_tick_behavior(MissedTickBehavior::Burst);

                loop {
                    interval.tick().await;
                    Self::advance_sliding_window(&last_bucket, &buckets, &window_total).await;
                }
            });
        }

        Self { last_bucket: last_bucket.clone(), buckets: buckets.clone(), window_total: window_total.clone() }
    }

    /// Advance the sliding window if needed and return the index of the
    /// bucket which is currently written.
    async fn advance_sliding_window(
        last_bucket: &Arc<AtomicUsize>,
        buckets: &Arc<Mutex<[IncomingTelemetryAggregate; TELEMETRY_BUCKETS]>>,
        window_total: &Arc<Mutex<IncomingTelemetryAggregate>>,
    ) -> usize {
        let now = Utc::now();
        let bucket_idx = now.second() as usize % TELEMETRY_BUCKETS;
        let last_bucket_idx = last_bucket.swap(bucket_idx, Ordering::Relaxed);

        let mut buckets = buckets.lock().await;
        let mut window_total = window_total.lock().await;

        if last_bucket_idx != bucket_idx {
            let bucket = std::mem::take(&mut buckets[bucket_idx]);
            window_total.messages -= bucket.messages;
            window_total.bytes -= bucket.bytes;
        }

        bucket_idx
    }
}

#[async_trait]
impl Interceptor for TelemetryInterceptor {
    async fn on_incoming_message(&self, message: &MavlinkMessage) {
        if let Message::SystemManagement(SysMessage::Heartbeat(_)) = &message.message {
            // Heartbeat messages aren't included in telemetry.
            return;
        }

        let bucket_idx = Self::advance_sliding_window(&self.last_bucket, &self.buckets, &self.window_total).await;

        let bucket = &mut self.buckets.lock().await[bucket_idx];
        let mut window_total = self.window_total.lock().await;

        // Update bucket aggregate.
        bucket.bytes += message.size;
        bucket.messages += 1;

        // Update sliding window total to account for updated bucket.
        window_total.bytes += message.size;
        window_total.bytes += 1;
    }
}
