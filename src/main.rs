use crate::{cli::Cli, config::Config, remote::RemoteComputer, state::State, web::broadcast::Broadcast};
use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use asteria_datapoint_information::datapoint::NamedDatapointValue;
use clap::Parser;
use env_logger::Env;
use serde::Serialize;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::exit,
    sync::{Arc, OnceLock},
    time::Duration,
};
use tokio::sync::RwLock;
use utoipa::{OpenApi, ToSchema};
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

mod cli;
mod config;
mod mavlink;
mod parser;
mod remote;
mod state;
mod web;

/// Global variable containing the path where the config file is located.
pub static CONFIG_PATH: OnceLock<PathBuf> = OnceLock::new();

/// Interval at which a MavLink heartbeat message should be sent to the active remote.
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(1);

#[derive(utoipa::OpenApi)]
#[openapi(
    info(
        title = "ASTERIA mission control",
        description = "Documentation for the ASTERIA mission control API",
        version = env!("GIT_VERSION")
    ),
    components(
        // Manually add this type to the OpenAPI schema since we have no endpoint
        // using/returning this type. It's only broadcast through SSE.
        schemas(NamedPssDatapointValue)
    )
)]
struct ApiDoc;

#[derive(Debug, Serialize, ToSchema)]
pub struct NamedPssDatapointValue {
    /// Unique name of the datapoint
    pub name: &'static str,
    /// Value of the datapoint
    pub value: f32,
}

impl From<NamedDatapointValue> for NamedPssDatapointValue {
    fn from(NamedDatapointValue { name, value }: NamedDatapointValue) -> Self {
        NamedPssDatapointValue { name, value: value.into() }
    }
}

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    // Since this is at the beginning of our main function, we can be sure
    // that the OnceLock hasn't been initialized yet.
    CONFIG_PATH.set(Path::new(&cli.config_path).to_path_buf()).unwrap();

    let config = match Config::parse(Path::new(&cli.config_path)) {
        Ok(config) => config,
        Err(err) => {
            log::error!("Error whilst parsing config: {err}");
            exit(1);
        }
    };

    log::debug!("Using config: {config:?}");

    config.remotes.keys().for_each(|name| log::info!("Found remote '{name}'"));

    let broadcast = Broadcast::new();

    let remotes = config
        .remotes
        .iter()
        .map(|(key, rc_config)| {
            (key.clone(), RwLock::new(RemoteComputer::new(rc_config.clone(), config.clone(), broadcast.clone())))
        })
        .collect::<HashMap<_, _>>();
    let remotes = Arc::new(remotes);

    let state = State::new(remotes.clone(), broadcast.clone());

    let heartbeat_state = state.clone();
    // Start the heartbeat thread which periodically sends a MavLink heartbeat message
    // to the active remote, if one is currently active.
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(HEARTBEAT_INTERVAL);
        loop {
            let state_guard = heartbeat_state.read().await;
            if let Ok((name, remote_computer)) = state_guard.get_active_remote() {
                let rc_guard = remote_computer.read().await;
                if let Err(err) = rc_guard.send_heartbeat_message().await {
                    log::warn!("Unable to send heartbeat message to remote '{name}': {err}")
                }
            } else {
                log::trace!("No active remote, skipping heartbeat!");
            }
            interval.tick().await;
        }
    });

    HttpServer::new(move || {
        let app = App::new()
            .wrap(Cors::permissive())
            .wrap(middleware::Logger::default().log_level(log::Level::Debug))
            .app_data(Data::from(broadcast.clone()))
            .app_data(Data::from(config.clone()))
            .app_data(Data::from(remotes.clone()))
            .app_data(Data::new(state.clone()))
            .into_utoipa_app()
            .openapi(ApiDoc::openapi())
            .service(utoipa_actix_web::scope("/api").configure(apply_endpoints))
            .openapi_service(|api| RapiDoc::with_openapi("/docs/openapi.json", api).path("/docs/ui"))
            .into_app();

        #[cfg(feature = "static-frontend")]
        return app.service(static_frontend_service(std::path::Path::new(&cli.frontend_path)));
        #[cfg(not(feature = "static-frontend"))]
        return app;
    })
    .bind((cli.address, cli.port))
    .expect("Should be able to bind to address and port")
    .run()
    .await
    .expect("Should start web server");
}

/// Apply all endpoints to the main service config which is exposed under `/api/`.
fn apply_endpoints(cfg: &mut ServiceConfig) {
    cfg.service(web::info)
        .service(web::config_schema)
        .service(web::subscribe_events)
        .service(web::remotes)
        .service(web::active_remote)
        .service(web::deactivate_active_remote)
        .service(web::change_active_remote)
        .service(web::state_machine)
        .service(web::pss)
        .service(web::send_message);
}

#[cfg(feature = "static-frontend")]
/// Service which serves a static frontend on the `/` directory.
fn static_frontend_service(frontend_path: &Path) -> actix_files::Files {
    let frontend_pathbuf = frontend_path.to_path_buf();
    actix_files::Files::new("/", frontend_path)
        .use_etag(true)
        .use_last_modified(true)
        .index_file("index.html")
        .default_handler(move |req: actix_web::dev::ServiceRequest| {
            let (http_req, _) = req.into_parts();
            let frontend_pathbuf = frontend_pathbuf.clone();

            async move {
                let path_str = &http_req.uri().path()[1..];
                if path_str.starts_with("api") || path_str.starts_with("docs") {
                    // this is an actual 404 error
                    // TODO: Create a default not-found handler
                    Err(actix_web::error::ErrorNotFound("there is no endpoint at this path :("))?
                } else {
                    // this path should be served by the UI
                    let response = match actix_files::NamedFile::open_async(frontend_pathbuf.join("index.html")).await {
                        Ok(file) => file.use_last_modified(true).use_etag(true).into_response(&http_req),
                        Err(err) => {
                            log::error!("Frontend index file not found: {err}");
                            Err(actix_web::error::ErrorNotFound(format!(
                                "UI index file not found at path {}",
                                frontend_pathbuf.join("index.html").to_string_lossy(),
                            )))?
                        }
                    };

                    Ok(actix_web::dev::ServiceResponse::new(http_req, response))
                }
            }
        })
}
