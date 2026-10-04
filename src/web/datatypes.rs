use crate::config::RemoteComputerKind;

use serde::Serialize;

#[derive(Serialize, utoipa::ToSchema)]
pub struct ServerInfo {
    /// Git version of the mission control server.
    pub version: String,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct RemoteComputerInfo {
    /// Name of the remote.
    /// This is used as the identifier.
    pub name: String,
    /// Description about the remote.
    pub description: String,
    /// What kind of remote computer this is.
    pub kind: RemoteComputerKind,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct TelemetryStats {
    /// Amount of incoming messages on the MC during the sliding window.
    pub incoming_msgs: usize,
    /// Total size of all incoming messages on the MC during the sliding window.
    pub incoming_bytes: usize,
    /// Amount of messages sent from the RC during the sliding window.
    pub rc_dowlink_msgs: usize,

    /// Amount of outgoing messages on the MC during the sliding window.
    pub outgoing_msgs: usize,
    /// Total size of all outgoing messages on the MC during the sliding window.
    pub outgoing_bytes: usize,
    /// Amount of messages received by the RC during the sliding window.
    pub rc_uplink_msgs: usize,

    /// The length of the sliding window in seconds.
    pub window_length: usize,
}

#[derive(Serialize, Clone, utoipa::ToSchema, Default, PartialEq)]
#[serde(tag = "kind", content = "value", rename_all = "camelCase")]
pub enum OptionalResult<T: Clone + Serialize + utoipa::ToSchema> {
    Some(T),
    Error(String),
    #[default]
    None,
}

impl<T> From<Option<Result<T, String>>> for OptionalResult<T>
where
    T: Serialize + Clone + utoipa::ToSchema,
{
    fn from(result: Option<Result<T, String>>) -> Self {
        match result {
            Some(Ok(value)) => OptionalResult::Some(value),
            Some(Err(err)) => OptionalResult::Error(err.to_string()),
            None => OptionalResult::None,
        }
    }
}
