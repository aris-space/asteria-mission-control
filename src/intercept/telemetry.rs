use std::array;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use asteria_messages::Message;
use asteria_messages::datapoints::dp_flight_computer::Message as FcMessage;
use asteria_messages::datapoints::dp_rfs_computer::Message as RfscMessage;
use asteria_messages::datapoints::dp_system_management::Message as SysMessage;
use async_trait::async_trait;
use chrono::{Timelike, Utc};
use mavlink_lib::MavlinkMessage;
use tokio::sync::Mutex;
use tokio::time::MissedTickBehavior;

use crate::intercept::Interceptor;
use crate::web::broadcast::Broadcast;
use crate::web::datatypes::TelemetryStats;
use crate::web::event::Event;

/// An aggregate of telemetry stats of the incoming and outgoing messages
/// of every second are stored in a bucket.
/// With a fixed amount of buckets we can represent the telemetry stats of the last
/// few seconds in a sliding-window style.
const TELEMETRY_BUCKETS: usize = 10;

#[derive(Default)]
pub struct TelemetryAggregate {
    /// Amount of incoming messages.
    messages: usize,
    /// Summed up size of all incoming messages.
    bytes: usize,
}

#[derive(Default)]
struct TelemetryAggregateBucket {
    /// Amount of incoming messages and their total size accumulated during the bucket's lifespan.
    incoming: TelemetryAggregate,
    /// Amount of outgoing messages and their total size accumulated during the bucket's lifespan.
    outgoing: TelemetryAggregate,
    /// Amount of processed uplink messages reported from the RC during the bucket's lifespan.
    uplink_msgs: usize,
    /// Amount of processed downlink messages reported from the RC during the bucket's lifespan.
    downlink_msgs: usize,
    /// Amount of processed uplink messages reported by the RC during the lifespan of the
    /// bucket before the current bucket. This is needed to calculate the difference in
    /// processed uplink messages during the bucket's lifespan.
    prev_uplink_msgs: usize,
    /// Amount of processed downlink messages reported by the RC during the lifespan of the
    /// bucket before the current bucket. This is needed to calculate the difference in
    /// processed downlink messages during the bucket's lifespan.
    prev_downlink_msgs: usize,
}

#[derive(Default)]
pub struct TelemetryAggregateWindow {
    /// Amount of incoming messages and their total size accumulated throughout the sliding window.
    incoming: TelemetryAggregate,
    /// Amount of outgoing messages and their total size accumulated throughout the sliding window.
    outgoing: TelemetryAggregate,
    /// Amount of processed uplink messages accumulated throughout the sliding window.
    uplink_msgs: usize,
    /// Amount of processed downlink messages accumulated throughout the sliding window.
    downlink_msgs: usize,
}

/// Interceptor which aggregates telemetry stats about the incoming and outgoing messages
/// of the last few seconds and compares it to the advertised telemetry stats from the RC.
#[derive(Clone)]
pub struct TelemetryInterceptor {
    last_bucket: Arc<AtomicUsize>,
    buckets: Arc<Mutex<[TelemetryAggregateBucket; TELEMETRY_BUCKETS]>>,
    window_total: Arc<Mutex<TelemetryAggregateWindow>>,
    broadcast: Arc<Broadcast>,
}

impl TelemetryInterceptor {
    pub fn new(broadcast: Arc<Broadcast>) -> Self {
        let last_bucket = Arc::new(AtomicUsize::new(0));
        let buckets = Arc::new(Mutex::new(array::from_fn(|_| TelemetryAggregateBucket::default())));
        let window_total = Arc::new(Mutex::new(TelemetryAggregateWindow::default()));
        let instance = TelemetryInterceptor { last_bucket, buckets, window_total, broadcast };
        {
            let instance = instance.clone();
            // To ensure the sliding window advances even when no messages are received, we
            // have a separate tokio thread which ticks in a 500ms interval.
            tokio::spawn(async move {
                let mut interval = tokio::time::interval(Duration::from_millis(500));
                interval.set_missed_tick_behavior(MissedTickBehavior::Burst);

                loop {
                    interval.tick().await;
                    instance.advance_sliding_window().await;

                    let window_total = instance.window_total.lock().await;
                    let stats = TelemetryStats {
                        incoming_msgs: window_total.incoming.messages,
                        incoming_bytes: window_total.incoming.bytes,
                        rc_dowlink_msgs: window_total.downlink_msgs,
                        outgoing_msgs: window_total.outgoing.messages,
                        outgoing_bytes: window_total.outgoing.bytes,
                        rc_uplink_msgs: window_total.uplink_msgs,
                        window_length: TELEMETRY_BUCKETS,
                    };
                    instance.broadcast.broadcast(Event::TelemetryStats(stats)).await;
                }
            });
        }

        instance
    }

    /// Advance the sliding window if needed and return the index of the
    /// bucket which is currently written.
    async fn advance_sliding_window(&self) -> usize {
        let now = Utc::now();
        let bucket_idx = now.second() as usize % TELEMETRY_BUCKETS;
        let last_bucket_idx = self.last_bucket.swap(bucket_idx, Ordering::Relaxed);

        let mut buckets = self.buckets.lock().await;
        let mut window_total = self.window_total.lock().await;

        if last_bucket_idx != bucket_idx {
            // Advance the sliding window by a second; we thus remove the the stats
            // of the "removed" bucket from the window stats.
            let bucket = std::mem::take(&mut buckets[bucket_idx]);

            // Remove values from the "previous instance" of the current bucket.
            window_total.incoming.messages -= bucket.incoming.messages;
            window_total.incoming.bytes -= bucket.incoming.bytes;
            window_total.outgoing.messages -= bucket.outgoing.messages;
            window_total.outgoing.bytes -= bucket.outgoing.bytes;
            window_total.downlink_msgs -= bucket.downlink_msgs.saturating_sub(bucket.prev_downlink_msgs);
            window_total.uplink_msgs -= bucket.uplink_msgs.saturating_sub(bucket.prev_uplink_msgs);

            // Set the uplink and downlink stats values from the previous bucket on the new bucket.
            buckets[bucket_idx].downlink_msgs = buckets[last_bucket_idx].downlink_msgs;
            buckets[bucket_idx].prev_downlink_msgs = buckets[last_bucket_idx].downlink_msgs;
            buckets[bucket_idx].uplink_msgs = buckets[last_bucket_idx].uplink_msgs;
            buckets[bucket_idx].prev_uplink_msgs = buckets[last_bucket_idx].uplink_msgs;
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

        let bucket_idx = self.advance_sliding_window().await;

        let bucket = &mut self.buckets.lock().await[bucket_idx];
        let mut window_total = self.window_total.lock().await;

        // Update bucket aggregate.
        bucket.incoming.bytes += message.size;
        bucket.incoming.messages += 1;

        // Update sliding window total to account for updated bucket.
        window_total.incoming.bytes += message.size;
        window_total.incoming.messages += 1;

        match &message.message {
            Message::FlightComputer(FcMessage::UplinkTelemetryHealth(health))
            | Message::RfsComputer(RfscMessage::UplinkTelemetryHealth(health)) => {
                let new_num_msg_processed = health.num_msg_processed as usize;

                // The delta this bucket has contributed so far.
                let old_delta = bucket.uplink_msgs.saturating_sub(bucket.prev_uplink_msgs);

                if new_num_msg_processed < bucket.prev_uplink_msgs {
                    // The remote computer changed; we start counting the deltas from zero again.
                    bucket.prev_uplink_msgs = 0;
                }

                // The new delta contributed from this bucket.
                let new_delta = new_num_msg_processed.saturating_sub(bucket.prev_uplink_msgs);

                // Re-evaluate the accumulated uplink messages in the sliding window.
                window_total.uplink_msgs = window_total.uplink_msgs - old_delta + new_delta;
                bucket.uplink_msgs = new_num_msg_processed;
            }
            Message::FlightComputer(FcMessage::DownlinkTelemetryStats(stats))
            | Message::RfsComputer(RfscMessage::DownlinkTelemetryStats(stats)) => {
                let new_num_msg_sent = stats.num_messages_sent as usize;

                // The delta this bucket has contributed so far.
                let old_delta = bucket.downlink_msgs.saturating_sub(bucket.prev_downlink_msgs);

                if new_num_msg_sent < bucket.prev_downlink_msgs {
                    // The remote computer changed; we start counting the deltas from zero again.
                    bucket.prev_downlink_msgs = 0;
                }

                // The new delta contributed from this bucket.
                let new_delta = new_num_msg_sent.saturating_sub(bucket.prev_downlink_msgs);

                // Re-evaluate the accumulated downlink messages in the sliding window.
                window_total.downlink_msgs = window_total.downlink_msgs - old_delta + new_delta;
                bucket.downlink_msgs = new_num_msg_sent;
            }
            _ => return,
        };
    }

    async fn on_outgoing_message(&self, message: &MavlinkMessage) {
        if let Message::SystemManagement(SysMessage::Heartbeat(_)) = &message.message {
            // Heartbeat messages aren't included in telemetry.
            return;
        }

        let bucket_idx = self.advance_sliding_window().await;

        let bucket = &mut self.buckets.lock().await[bucket_idx];
        let mut window_total = self.window_total.lock().await;

        // Update bucket aggregate.
        bucket.outgoing.bytes += message.size;
        bucket.outgoing.messages += 1;

        // Update sliding window total to account for updated bucket.
        window_total.outgoing.bytes += message.size;
        window_total.outgoing.messages += 1;
    }
}
