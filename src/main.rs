use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use clap::Parser;
use env_logger::Env;
use utoipa::OpenApi;
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

use crate::{cli::Cli, web::broadcast::Broadcast};

mod cli;
mod web;

#[derive(utoipa::OpenApi)]
#[openapi(
    info(
        title = "ASTERIA mission control",
        description = "Documentation for the ASTERIA mission control API",
        version = env!("GIT_VERSION")
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    let broadcast = Broadcast::new();

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_header().allow_any_method().allow_any_origin();
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(Data::from(broadcast.clone()))
            .into_utoipa_app()
            .openapi(ApiDoc::openapi())
            .service(utoipa_actix_web::scope("/api").configure(apply_endpoints))
            .openapi_service(|api| RapiDoc::with_openapi("/docs/openapi.json", api).path("/docs/ui"))
            .into_app()
    })
    .bind((cli.address, cli.port))
    .expect("should be able to bind to address and port")
    .run()
    .await
    .expect("should start web server");
}

/// Apply all endpoints to the main service config which is exposed under /api/
fn apply_endpoints(cfg: &mut ServiceConfig) {
    cfg.service(web::info).service(web::subscribe_events).service(web::get_state_machine);
}
