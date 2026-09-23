use std::collections::BTreeMap;

use crate::PssDiagrams;
use crate::config::{Config, Polygon, RemoteComputerKind, TilesConfig};
use crate::parser::pss::Pss;
use crate::parser::statemachine::StateMachine;
use crate::web::datatypes::*;
use crate::web::event::Event;
use crate::web::state::StateInstance;

use actix_web::web::{Data, Json};
use actix_web::{Responder, delete, error, get, put, web};
use asteria_datatypes::status::ManualStateTransition;
use asteria_messages::Message;
use asteria_messages::datapoints::dp_flight_computer::Message as FcMessage;
use asteria_messages::datapoints::dp_rfs_computer::Message as RfscMessage;
use broadcast::Broadcast;

pub mod broadcast;
pub mod datatypes;
pub mod event;
pub mod state;

/// Get general information about the running API server.
#[utoipa::path(responses((status = OK, body = ServerInfo)))]
#[get("/")]
pub async fn info() -> actix_web::Result<Json<ServerInfo>> {
    Ok(Json(ServerInfo { version: env!("GIT_VERSION").to_string() }))
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
/// - `REMOTE` with body containing `null`.
/// - `STATE_MACHINE` with body containing `null`.
#[utoipa::path(responses((status = OK, body = ()), (status = BAD_REQUEST, body = String)))]
#[delete("/remotes/active")]
pub async fn deactivate_active_remote(
    state: Data<StateInstance>,
    broadcast: Data<Broadcast>,
) -> actix_web::Result<Json<()>> {
    let mut state = state.write().await;
    state.remove_active_remote().await.map_err(error::ErrorBadRequest)?;

    broadcast.broadcast(Event::Remote(None)).await;
    broadcast.broadcast(Event::StateMachine(OptionalResult::None)).await;
    Ok(Json(()))
}

/// Change the active remote computer.
///
/// **Events**:
/// - `REMOTE` with body containing the name of the newly activated remote.
/// - `MAVLINK_MESSAGE` with body containing JSON-serialized MavLink [`Message`].
/// - `STATE_MACHINE` with body containing the JSON-serialized [`StateMachine`].
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
    state.set_active_remote(&name).await.map_err(error::ErrorBadRequest)?;

    broadcast.broadcast(Event::Remote(Some(name.clone()))).await;

    // Because [`StateInstance`] contains an [`Remotes`] instance which holds the same
    // remotes as in the [`Config`], we use the remote from the config to not compete
    // on the remote computer lock.
    let remote = config.remotes.get(&name).expect("Remote should exist");
    Ok(Json(RemoteComputerInfo { name, description: remote.description.clone(), kind: remote.kind.clone() }))
}

/// Get the state machine of the active remote.
///
/// Since the active remote transmits the used configuration asynchronously, it could
/// be that this endpoint returns [`OptionalResult::None`] despite there being an active remote
/// with a state machine. In that case, just retry calling the endpoint a bit later.
#[utoipa::path(responses((status = OK, body = OptionalResult<StateMachine>)))]
#[get("/state-machine")]
pub async fn state_machine(state: Data<StateInstance>) -> actix_web::Result<Json<OptionalResult<StateMachine>>> {
    let state = state.read().await;

    // Ensure that we have an active remote.
    state.get_active_remote().map_err(error::ErrorBadRequest)?;

    Ok(Json(state.get_state_machine().clone()))
}

/// Get the PSS diagram for the rocket.
#[utoipa::path(responses((status = OK, body = Pss)))]
#[get("/pss/rocket")]
pub async fn rocket_pss(pss_diagrams: Data<PssDiagrams>) -> actix_web::Result<Json<Pss>> {
    let (rocket_diagram, _) = &**pss_diagrams.as_ref();
    Ok(Json(rocket_diagram.clone()))
}

/// Get the PSS diagram for the RFS.
#[utoipa::path(responses((status = OK, body = Pss)))]
#[get("/pss/rfs")]
pub async fn rfs_pss(pss_diagrams: Data<PssDiagrams>) -> actix_web::Result<Json<Pss>> {
    let (_, rfs_diagram) = &**pss_diagrams.as_ref();
    Ok(Json(rfs_diagram.clone()))
}

/// Send JSON-serialized MavLink message to the active remote computer.
#[utoipa::path(responses((status = OK, body = ()), (status = BAD_REQUEST, body = String), (status = INTERNAL_SERVER_ERROR, body = String)))]
#[put("/message")]
pub async fn send_message(message: Json<Message>, state: Data<StateInstance>) -> actix_web::Result<()> {
    let state = state.read().await;

    let (_, remote) = state
        .get_active_remote()
        .map_err(|err| error::ErrorBadRequest(format!("Unable to transmit MavLink message: {err}")))?;
    let remote = remote.read().await;

    remote
        .send_mavlink_message(message.into_inner())
        .await
        .map_err(|err| {
            log::error!("Error whilst sending MavLink message: {err}");
            error::ErrorInternalServerError(format!("Error whilst sending MavLink message: {err}"))
        })
        .map(|_| ())
}

/// Transition into the next abort state from the current state of the active state machine.
/// When the transition message is successfully sent, the name of the target abort state is
/// returned.
#[utoipa::path(responses((status = OK, body = String), (status = BAD_REQUEST, body = String), (status = INTERNAL_SERVER_ERROR, body = String)))]
#[put("/abort")]
pub async fn abort(state: Data<StateInstance>, config: Data<Config>) -> actix_web::Result<String> {
    let state = state.read().await;

    let (remote_name, remote) = state
        .get_active_remote()
        .map_err(|err| error::ErrorBadRequest(format!("Unable to transition into next abort state: {err}")))?;

    let OptionalResult::Some(active_machine) = state.get_state_machine() else {
        Err(error::ErrorBadRequest(String::from("Missing state machine for active remote")))?
    };

    let Some((state_name, _path_index)) = state.get_state_machine_state() else {
        Err(error::ErrorInternalServerError(String::from("Current state machine state is not known")))?
    };

    let Some(manual_transitions) = active_machine.manual_transitions.get(state_name) else {
        Err(error::ErrorBadRequest(format!("State '{state_name}' has no manual transitions")))?
    };

    let Some((abort_state_name, _)) = manual_transitions.iter().find(|(_, is_abort)| *is_abort) else {
        Err(error::ErrorBadRequest(format!("State '{state_name}' cannot transition into an abort state")))?
    };

    // Abort transitions work with a transition index of zero.
    let mut transition = ManualStateTransition { transition_index: 0, ..Default::default() };
    let len = abort_state_name.len().min(transition.state.len());
    transition.state[..len].copy_from_slice(&abort_state_name.as_bytes()[..len]);

    let message = match config.remotes[remote_name].kind {
        RemoteComputerKind::FlightComputer => Message::FlightComputer(FcMessage::ManualStateTransition(transition)),
        RemoteComputerKind::RfsComputer => Message::RfsComputer(RfscMessage::ManualStateTransition(transition)),
    };

    let remote = remote.read().await;

    remote
        .send_mavlink_message(message)
        .await
        .map_err(|err| {
            log::error!("Unable to transition into next abort state: Error whilst sending MavLink message: {err}");
            error::ErrorInternalServerError(format!("Error whilst sending MavLink message: {err}"))
        })
        .map(|_| abort_state_name.clone())
}

/// Get the configured tile servers for the map on the mission control.
#[utoipa::path(responses((status = OK, body = BTreeMap<String, TileServer>)))]
#[get("/map/tile-servers")]
pub async fn tile_servers(config: Data<Config>) -> actix_web::Result<Json<BTreeMap<String, TileServer>>> {
    let servers = config
        .map
        .tiles
        .iter()
        .map(|(name, TilesConfig { description, tile_kind })| {
            (name.clone(), TileServer { description: description.clone(), tile_kind: tile_kind.clone() })
        })
        .collect::<BTreeMap<_, _>>();

    Ok(Json(servers))
}

/// Get the configured polygon for the map on the mission control.
#[utoipa::path(responses((status = OK, body = Polygon)))]
#[get("/map/polygon")]
pub async fn polygon(config: Data<Config>) -> actix_web::Result<Json<Polygon>> {
    Ok(Json(config.map.polygon.clone()))
}
