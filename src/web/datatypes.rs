use crate::config::{RemoteComputerKind, TileKind};

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
pub struct RecoveryPoint {
    /// Name of the GNC configuration the point is taken from.
    pub name: String,
    /// Latitude in degrees (WGS84).
    pub latitude: f64,
    /// Longitude in degrees (WGS84).
    pub longitude: f64,
    /// Height above mean sea level in meters.
    pub altitude: f64,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct TileServer {
    /// Description about the tile server.
    pub description: String,
    /// The kind of tiles the server provides.
    #[serde(flatten)]
    pub tile_kind: TileKind,
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
