use actix_web::{Responder, get, web::Json};
use serde::Serialize;

#[derive(Serialize)]
struct Info {
    version: String,
}

#[get("/")]
pub async fn info() -> actix_web::Result<impl Responder> {
    Ok(Json(Info { version: env!("GIT_VERSION").to_string() }))
}
