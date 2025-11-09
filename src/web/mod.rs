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
