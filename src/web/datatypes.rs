use crate::config::RemoteComputerKind;
use crate::parser::pss::Pss;

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

#[derive(Serialize, Clone, utoipa::ToSchema, Default)]
pub struct PssDiagrams {
    /// The PSS of the rocket.
    pub rocket: OptionalResult<Pss>,
    /// The PSS of the remote filling station.
    pub rfs: OptionalResult<Pss>,
}

#[derive(Serialize, Clone, utoipa::ToSchema, Default, PartialEq)]
#[serde(tag = "kind", content = "value", rename_all = "camelCase")]
pub enum OptionalResult<T: Clone + Serialize + utoipa::ToSchema> {
    Some(T),
    Error(String),
    #[default]
    None,
}

impl<T, E> From<Option<Result<T, E>>> for OptionalResult<T>
where
    T: Serialize + Clone + utoipa::ToSchema,
    E: std::error::Error,
{
    fn from(result: Option<Result<T, E>>) -> Self {
        match result {
            Some(Ok(value)) => OptionalResult::Some(value),
            Some(Err(err)) => OptionalResult::Error(err.to_string()),
            None => OptionalResult::None,
        }
    }
}
