use std::{fs::read_to_string, path::Path};

use actix_web::{
    Responder, get,
    web::{Data, Json},
};
use serde::Serialize;

use broadcast::Broadcast;

use crate::{STATE_MACHINE_PATH, statemachine::StateMachine};

pub mod broadcast;

#[derive(Serialize, utoipa::ToSchema)]
struct Info {
    version: String,
}

#[utoipa::path(responses((status = OK, body = Info)), description = "Get basic information about the running API server")]
#[get("/")]
pub async fn info() -> actix_web::Result<impl Responder> {
    Ok(Json(Info { version: env!("GIT_VERSION").to_string() }))
}

#[utoipa::path(responses((status = OK, content_type = "text/event-stream")), description = "Subscribe to API event stream using SSE")]
#[get("/events")]
pub async fn subscribe_events(broadcast: Data<Broadcast>) -> actix_web::Result<impl Responder> {
    broadcast.subscribe().await
}

// TODO: It should be possible to retrieve different state machines without needing to recompile the backend
//       this is for testing/illustration purposes only
#[utoipa::path(responses((status = OK, body = StateMachine)), description = "Get the active state-machine")]
#[get("/state-machine")]
pub async fn get_state_machine() -> actix_web::Result<impl Responder> {
    let state_machine = StateMachine::parse_from(Path::new(STATE_MACHINE_PATH))?;
    Ok(Json(state_machine))
}
