use std::collections::HashMap;

use crate::config::RemoteComputerKind;
use crate::parser::pss::Pss;
use crate::web::state::StateInstance;
use crate::{config::Config, parser::statemachine::StateMachine};
use actix_web::{
    Responder,
    error::{ErrorBadRequest, ErrorInternalServerError, ErrorNotFound},
    get, put,
    web::{Data, Json},
};
use actix_web::{delete, web};
use actix_web_lab::sse::{Data as SseData, Event as SseEvent};
use asteria_messages::Message;
use broadcast::Broadcast;
use serde::Serialize;

pub mod broadcast;
pub mod state;

pub enum Event {
    RemoteChange(Option<String>),
    StateMachineChange(Option<StateMachine>),
    PssChange(Option<HashMap<String, Pss>>),
    StateError(String),
}

impl From<Event> for SseEvent {
    fn from(event: Event) -> Self {
        match event {
            Event::RemoteChange(Some(name)) => Self::Data(SseData::new(name).event("remote-change")),
            Event::RemoteChange(None) => Self::Data(SseData::new("null").event("remote-change")),
            Event::StateMachineChange(state_machine_data) => Self::Data(
                SseData::new_json(&state_machine_data).expect("should be serializable").event("state-machine-change"),
            ),
            Event::PssChange(pss_data) => {
                Self::Data(SseData::new_json(&pss_data).expect("should be serializable").event("pss-change"))
            }
            Event::StateError(error_string) => Self::Data(SseData::new(error_string).event("state-error")),
        }
    }
}

#[derive(Serialize, utoipa::ToSchema)]
struct Info {
    /// Git version of the mission control server.
    version: String,
}

/// Get general information about the running API server.
#[utoipa::path(responses((status = OK, body = Info)))]
#[get("/")]
pub async fn info() -> actix_web::Result<Json<Info>> {
    Ok(Json(Info { version: env!("GIT_VERSION").to_string() }))
}

/// Get the TOML schema for the config file.
#[utoipa::path(responses((status = OK, content_type = "application/json")))]
#[get("/config/schema")]
pub async fn config_schema() -> actix_web::Result<Json<serde_json::Value>> {
    let schema = schemars::schema_for!(Config);
    Ok(Json(schema.into()))
}

/// Subscribe to API events using SSE.
///
/// Endpoints triggering SSE events specify which events are to be
/// expected as a consequence of calling the endpoint.
#[utoipa::path(responses((status = OK, content_type = "text/event-stream")))]
#[get("/events")]
pub async fn subscribe_events(broadcast: Data<Broadcast>) -> actix_web::Result<impl Responder> {
    broadcast.subscribe().await
}

#[derive(Serialize, utoipa::ToSchema)]
struct RemoteComputerInfo {
    /// Name of the remote.
    /// This is used as the identifier.
    name: String,
    /// Description about the remote.
    description: String,
    /// What kind of remote computer this is.
    kind: RemoteComputerKind,
}

/// Get all available remote computers.
#[utoipa::path(responses((status = OK, body = Vec<RemoteComputerInfo>)))]
#[get("/remotes")]
pub async fn remotes(config: Data<Config>) -> actix_web::Result<Json<Vec<RemoteComputerInfo>>> {
    let remotes = config
        .remotes
        .iter()
        .map(|(name, remote_config)| RemoteComputerInfo {
            name: name.clone(),
            description: remote_config.description.clone(),
            kind: remote_config.kind.clone(),
        })
        .collect::<Vec<_>>();
    Ok(Json(remotes))
}

/// Get the active remote computer, if one is currently active.
#[utoipa::path(responses((status = OK, body = Option<RemoteComputerInfo>)))]
#[get("/remotes/active")]
pub async fn active_remote(
    state: Data<StateInstance>,
    config: Data<Config>,
) -> actix_web::Result<Json<Option<RemoteComputerInfo>>> {
    let state = state.read().await;

    if let Ok((name, _)) = state.get_active_remote() {
        // Because [`StateInstance`] contains an [`Remotes`] instance which holds the same
        // remotes as in the [`Config`], we use the remote from the config to not compete
        // on the remote computer lock.
        let remote = config.remotes.get(name).expect("Remote should exist");
        Ok(Json(Some(RemoteComputerInfo {
            name: name.clone(),
            description: remote.description.clone(),
            kind: remote.kind.clone(),
        })))
    } else {
        Ok(Json(None))
    }
}

/// Deactivate the currently active remote computer.
///
/// **Events**:
/// - `remote-change` with body containing `null`.
/// - `state-machine-change` with body containing `null`.
/// - `pss-change` with body containing `null`.
#[utoipa::path(responses((status = OK, body = ()), (status = BAD_REQUEST, body = String)))]
#[delete("/remotes/active")]
pub async fn deactivate_active_remote(
    state: Data<StateInstance>,
    broadcast: Data<Broadcast>,
) -> actix_web::Result<Json<()>> {
    let mut state = state.write().await;
    state.remove_active_remote().await.map_err(ErrorBadRequest)?;

    broadcast.broadcast(Event::RemoteChange(None)).await;
    Ok(Json(()))
}

/// Change the active remote computer.
///
/// **Events**:
/// - `remote-change` with body containing the name of the newly activated remote.
/// - `mavlink-message` with body containing JSON-serialized MavLink [`Message`].
/// - `state-machine-change` with body containing the JSON-serialized [`StateMachine`].
/// - `pss-change` with body containing the JSON-serialized vector of [`Pss`].
/// - `state-error` with body containing error string from either state machine or PSS parsing.
#[utoipa::path(responses((status = OK, body = RemoteComputerInfo, status = BAD_REQUEST, body = String)))]
#[put("/remotes/active/{name}")]
pub async fn change_active_remote(
    name: web::Path<String>,
    state: Data<StateInstance>,
    config: Data<Config>,
    broadcast: Data<Broadcast>,
) -> actix_web::Result<Json<RemoteComputerInfo>> {
    let name = name.into_inner();
    let mut state = state.write().await;
    state.set_active_remote(&name).await.map_err(ErrorBadRequest)?;

    broadcast.broadcast(Event::RemoteChange(Some(name.clone()))).await;

    // Because [`StateInstance`] contains an [`Remotes`] instance which holds the same
    // remotes as in the [`Config`], we use the remote from the config to not compete
    // on the remote computer lock.
    let remote = config.remotes.get(&name).expect("Remote should exist");
    Ok(Json(RemoteComputerInfo { name, description: remote.description.clone(), kind: remote.kind.clone() }))
}

/// Get the state machine of the active remote.
///
/// Since the active remote transmits the used configuration asynchronously, it could
/// be that this endpoint returns [`ErrorNotFound`] despite there being an active remote. In
/// that case, just retry calling the endpoint a bit later.
///
/// If the endpoint returns [`ErrorInternalServerError`], the error body contains information about
/// why the state machine parsing failed.
#[utoipa::path(responses((status = OK, body = StateMachine), (status = NOT_FOUND, body = String), (status = INTERNAL_SERVER_ERROR, body = String)))]
#[get("/state-machine")]
pub async fn state_machine(state: Data<StateInstance>) -> actix_web::Result<Json<StateMachine>> {
    let state = state.read().await;

    // Ensure that we have an active remote.
    state.get_active_remote().map_err(ErrorBadRequest)?;

    match &state.state_machine {
        Some(Ok(state_machine)) => Ok(Json(state_machine.clone())),
        Some(Err(err)) => Err(ErrorInternalServerError(err.to_string())),
        None => Err(ErrorNotFound(String::from("There is no state machine for the active remote computer"))),
    }
}

/// Get the PSS configurations of the active remote.
///
/// Since the active remote transmits the used configuration asynchronously, it could
/// be that this endpoint returns [`ErrorNotFound`] despite there being an active remote. In
/// that case, just retry calling the endpoint a bit later.
///
/// If the endpoint returns [`ErrorInternalServerError`], the error body contains information about
/// why the PSS parsing failed.
#[utoipa::path(responses((status = OK, body = HashMap<String, Pss>), (status = NOT_FOUND, body = String), (status = INTERNAL_SERVER_ERROR, body = String)))]
#[get("/pss")]
pub async fn pss(state: Data<StateInstance>) -> actix_web::Result<Json<HashMap<String, Pss>>> {
    let state = state.read().await;

    // Ensure that we have an active remote.
    state.get_active_remote().map_err(ErrorBadRequest)?;

    let Some(pss) = &state.pss else {
        return Err(ErrorNotFound(String::from("There is no PSS configuration for the active remote computer")));
    };

    let has_errors = pss.values().any(|result| result.is_err());

    if has_errors {
        let response = pss
            .iter()
            .map(|(name, result)| match result {
                Ok(_) => format!("{name}: no errors"),
                Err(err) => format!("{name}: {err}"),
            })
            .collect::<Vec<_>>()
            .join("\n");
        return Err(ErrorInternalServerError(response));
    }

    let pss = pss.iter().map(|(name, result)| (name.clone(), result.as_ref().unwrap().clone())).collect::<HashMap<_, _>>();
    Ok(Json(pss))
}

/// Send JSON-serialized MavLink message to the active remote computer.
#[utoipa::path(responses((status = OK, body = ()), (status = BAD_REQUEST, body = String), (status = INTERNAL_SERVER_ERROR, body = String)))]
#[put("/message")]
pub async fn send_message(message: Json<Message>, state: Data<StateInstance>) -> actix_web::Result<()> {
    let state = state.read().await;

    let (_, remote) =
        state.get_active_remote().map_err(|err| ErrorBadRequest(format!("Unable to transmit MavLink message: {err}")))?;
    let remote = remote.read().await;

    remote
        .send_mavlink_message(message.into_inner())
        .await
        .map_err(|err| {
            log::error!("Error whilst sending MavLink message: {err}");
            ErrorInternalServerError(format!("Error whilst sending MavLink message: {err}"))
        })
        .map(|_| ())
}
