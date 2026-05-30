use asteria_datapoint_information::influx::{self, FieldValue};
use async_trait::async_trait;
use influxdb2::Client;
use influxdb2::models::DataPoint;
use tokio::sync::Mutex;

use crate::intercept::Interceptor;

/// The size of the datapoints buffer. Meaning, we store up to this amount
/// of datapoints and only then attempt a buffered write to save on bandwidth.
const DATAPOINT_BUFFER_SIZE: usize = 128;

pub struct InfluxInterceptor {
    client: Client,
    bucket: String,
    buffer: Mutex<Vec<influxdb2::models::DataPoint>>,
}

impl InfluxInterceptor {
    pub fn new(address: &String, organization: &String, token: &String, bucket: String) -> Self {
        let client = Client::new(address, organization, token);
        Self { client, buffer: Mutex::new(Vec::with_capacity(DATAPOINT_BUFFER_SIZE)), bucket }
    }
}

#[async_trait]
impl Interceptor for InfluxInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let datapoint = match influx::to_datapoint(message) {
            Ok(datapoint) => datapoint,
            // FIXME: The debug print should be replaced with a display print once `thiserror` is
            // derived in the influx datapoint information module.
            Err(err) => {
                log::warn!("Unable to log message to influx database: {err:?}");
                return log::debug!("The problematic message was: {message:?}");
            }
        };

        let mut builder = DataPoint::builder(datapoint.measurement.clone());
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

        // The buffer is now full and we can try writing the datapoints to the database.

        if let Err(err) = self.client.write(&self.bucket, futures::stream::iter(buffer.clone())).await {
            // Because we cloned the buffer before, we don't loose any data and just repeat when the next
            // datapoint message comes in.
            return log::error!("Unable to upload datapoints to influx database: {err}");
        }

        // The upload worked so we now need to clear the buffer.
        buffer.clear();
    }
}
