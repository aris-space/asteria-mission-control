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
pub struct TileServer {
    /// Description about the tile server.
    pub description: String,
    /// Tiles URL for the tile server.
    pub url: String,
    /// Whether the tiles URL is a pmtiles URL.
    pub pmtiles: bool,
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
