use asteria_datapoint_information::influx;
use async_trait::async_trait;

use crate::intercept::Interceptor;

pub struct InfluxInterceptor {}

impl InfluxInterceptor {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl Interceptor for InfluxInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let _datapoint = match influx::to_datapoint(message) {
            Ok(datapoint) => datapoint,
            // FIXME: The debug print should be replaced with a display print once `thiserror` is
            // derived in the influx datapoint information module.
            Err(err) => return log::warn!("Unable to log message to influx database: {err:?}"),
        };

        // TODO: Upload the `datapoint` to the InfluxDB.
    }
}
