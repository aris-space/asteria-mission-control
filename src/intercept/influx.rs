use std::sync::Arc;

use asteria_datapoint_information::influx::{self, FieldValue};
use async_trait::async_trait;
use chrono::Utc;
use influxdb2::Client;
use influxdb2::models::DataPoint;
use tokio::signal::ctrl_c;
use tokio::sync::Mutex;

use crate::config::{Config, RemoteComputerKind};
use crate::intercept::Interceptor;
use crate::web::state::StateInstance;

/// The size of the datapoints buffer. Meaning, we store up to this amount
/// of datapoints and only then attempt a buffered write to save on bandwidth.
const DATAPOINT_BUFFER_SIZE: usize = 128;

/// Interceptor used to write all MavLink messages which can be converted into
/// a influx datapoint to the configured influx database.
pub struct InfluxInterceptor {
    client: Client,
    bucket: String,
    buffer: Arc<Mutex<Vec<influxdb2::models::DataPoint>>>,
    state: StateInstance,
    config: Arc<Config>,
}

impl InfluxInterceptor {
    pub fn new(
        address: &String,
        organization: &String,
        token: &String,
        bucket: String,
        state: StateInstance,
        config: Arc<Config>,
    ) -> Self {
        log::info!("Sending datapoint to InfluxDB at {address}");
        let client = Client::new(address, organization, token);
        let buffer = Arc::new(Mutex::new(Vec::with_capacity(DATAPOINT_BUFFER_SIZE)));

        {
            let client = client.clone();
            let buffer = buffer.clone();
            let bucket = bucket.clone();
            tokio::spawn(async move {
                // When we receive a CTRL-C we try to upload the remaining datapoints to the influx db.
                ctrl_c().await.expect("Should receive CTRL-C");

                let mut buffer = buffer.lock().await;
                let datapoints = std::mem::replace(buffer.as_mut(), Vec::with_capacity(DATAPOINT_BUFFER_SIZE));

                if let Err(err) = client.write(&bucket, futures::stream::iter(datapoints)).await {
                    log::error!("Unable to upload datapoints to influx database: {err}");
                }
            });
        }

        Self { client, buffer, bucket, state, config }
    }
}

#[async_trait]
impl Interceptor for InfluxInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let datapoint = match influx::to_datapoint(message) {
            Ok(datapoint) => datapoint,
            Err(err) => {
                log::warn!("Unable to convert message {message:?} to datapoint: {err}");
                return;
            }
        };

        let guard = self.state.read().await;
        let system = match guard.get_active_remote() {
            Ok((name, _)) => {
                let remote_config = self.config.remotes.get(name).expect("the remote should exist");
                match remote_config.kind {
                    RemoteComputerKind::FlightComputer => String::from("rocket-mc"),
                    RemoteComputerKind::RfsComputer => String::from("rfs-mc"),
                }
            }
            Err(_) => String::from("unknown-mc"),
        };

        let mut builder =
            DataPoint::builder(datapoint.measurement.clone()).timestamp(Utc::now().timestamp()).tag("system", system);
        for (name, value) in datapoint.fields.into_iter() {
            let value = match value {
                FieldValue::Bool(bool) => influxdb2::models::FieldValue::Bool(bool),
                FieldValue::I64(int) => influxdb2::models::FieldValue::I64(int),
                FieldValue::F64(float) => influxdb2::models::FieldValue::F64(float),
                FieldValue::String(cow) => influxdb2::models::FieldValue::String(cow.to_string()),
            };
            builder = builder.field(name, value)
        }
        for (name, value) in datapoint.tags.into_iter() {
            builder = builder.tag(name, value)
        }

        let datapoint = match builder.build() {
            Ok(datapoint) => datapoint,
            Err(err) => return log::warn!("Unable to convert datapoint to influx datapoint: {err}"),
        };

        let mut buffer = self.buffer.lock().await;
        buffer.push(datapoint);

        if buffer.len() < DATAPOINT_BUFFER_SIZE {
            // The buffer is not yet "full"; thus we don't write to the database
            // and just wait for further messages.
            return;
        }

        log::debug!("Uploading {} datapoints", buffer.len());

        // The buffer is now full and we can try writing the datapoints to the database.
        let datapoints = std::mem::replace(buffer.as_mut(), Vec::with_capacity(DATAPOINT_BUFFER_SIZE));
        drop(buffer);

        if let Err(err) = self.client.write(&self.bucket, futures::stream::iter(datapoints)).await {
            return log::error!("Unable to upload datapoints to influx database: {err}");
        }
    }
}
