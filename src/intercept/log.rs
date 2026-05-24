use crate::intercept::Interceptor;
use async_trait::async_trait;
use chrono::Utc;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

/// Interceptor used to write all MavLink messages into a logfile in a JSONL
/// serialized format.
pub struct LogInterceptor {
    file: Mutex<File>,
}

impl LogInterceptor {
    pub fn new(file: File) -> Self {
        Self { file: Mutex::new(file) }
    }
}

#[async_trait]
impl Interceptor for LogInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let mut message_value =
            serde_json::to_value(message).expect("Every message should be convertible to a serde_json Value");

        // Insert a `timestamp` field which is the current UNIX timestamp. This enables replaying the messages.
        if let serde_json::Value::Object(ref mut map) = message_value {
            map.insert(String::from("timestamp"), serde_json::Value::from(Utc::now().timestamp_millis()));
        }

        if let Err(err) = self.file.lock().await.write_all(format!("{message_value}\r\n").as_bytes()).await {
            log::warn!("Unable to write MavLink log: {err}");
        }
    }
}
