use actix_web::{
    Responder, get,
    web::{Data, Json},
};
use serde::Serialize;

use broadcast::Broadcast;

pub mod broadcast;


#[derive(Serialize)]
struct Info {
    version: String,
}

#[get("/")]
pub async fn info() -> actix_web::Result<impl Responder> {
    Ok(Json(Info { version: env!("GIT_VERSION").to_string() }))
}

#[get("/events")]
pub async fn subscribe_events(broadcast: Data<Broadcast>) -> actix_web::Result<impl Responder> {
    broadcast.subscribe().await
}
