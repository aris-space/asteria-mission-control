use actix_web::{
    Responder, get,
    web::{Data, Json},
};
use serde::Serialize;

use broadcast::Broadcast;

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
#[utoipa::path(responses((status = OK, body = String, content_type = "image/svg+xml")), description = "Get the active state-machine")]
#[get("/state-machine")]
pub async fn get_state_machine() -> actix_web::Result<impl Responder> {
    Ok(String::from_utf8_lossy(include_bytes!("../../state-machine/flight-state-machine.drawio.svg")))
}
