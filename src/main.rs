use crate::cli::Cli;
use crate::config::Config;
use crate::intercept::*;
use crate::parser::pss::Pss;
use crate::parser::statemachine::StateMachine;
use crate::remote::{RemoteComputer, Remotes};
use crate::web::broadcast::Broadcast;
use crate::web::datatypes::TelemetryStats;
use crate::web::event::EventKind;
use crate::web::state::{State, StateInstance};

use actix_cors::Cors;
use actix_web::web::Data;
use actix_web::{App, HttpServer, middleware};
use asteria_datapoint_information::datapoint::NamedDatapointValue;
use chrono::Utc;
use clap::Parser;
use env_logger::Env;
use std::io;
use std::path::{Path, PathBuf};
use std::process::exit;
use std::sync::{Arc, OnceLock};
use std::time::Duration;
use tokio::fs::{self, File};
use tokio::sync::RwLock;
use utoipa::OpenApi;
use utoipa_actix_web::AppExt;
use utoipa_actix_web::service_config::ServiceConfig;
use utoipa_rapidoc::RapiDoc;

mod cli;
mod config;
mod intercept;
mod parser;
mod remote;
mod web;

/// Global variable containing the path where the config file is located.
pub static CONFIG_PATH: OnceLock<PathBuf> = OnceLock::new();

/// Tuple containing the rocket and the RFS PSS diagrams.
pub type PssDiagrams = Arc<(Pss, Pss)>;

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
        // Manually add those types to the OpenAPI schema because they not directly
        // exposed through endpoints.
        schemas(EventKind, NamedDatapointValue, StateMachine, Pss, TelemetryStats)
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    // Since this is at the beginning of our main function, we can be sure
    // that the OnceLock hasn't been initialized yet.
    CONFIG_PATH.set(Path::new(&cli.config_path).to_path_buf()).unwrap();

    let config = match Config::parse(Path::new(&cli.config_path)) {
        Ok(config) => {
            log::debug!("Using config: {config:?}");
            config
        }
        Err(err) => {
            log::error!("Error whilst parsing config: {err}");
            exit(1);
        }
    };

    let mavlink_logfile_path = config.mavlink.logs_path.join(format!("mavlink-logs-{}.jsonl", Utc::now().to_rfc3339()));
    let mavlink_logfile =
        create_and_get_logfile(&config.mavlink.logs_path, &mavlink_logfile_path).await.unwrap_or_else(|err| {
            log::error!("Unable to create log file at '{}': {err}", mavlink_logfile_path.display());
            exit(1)
        });

    if let Ok(path) = mavlink_logfile_path.canonicalize() {
        log::info!("Logging MavLink messages to '{}'", path.display());
    }

    let pss_diagrams = match (Pss::new(&config.pss.rocket_diagram_path), Pss::new(&config.pss.rfs_diagram_path)) {
        (Ok(rocket), Ok(rfs)) => Arc::new((rocket, rfs)),
        (rocket_result, rfs_result) => {
            if let Err(err) = rocket_result {
                log::error!("Unable to parse rocket PSS diagram: {err}")
            };
            if let Err(err) = rfs_result {
                log::error!("Unable to parse RFS PSS diagram: {err}")
            };
            exit(1)
        }
    };

    let repository = gix::open(&config.configs_repository_path).unwrap_or_else(|err| {
        log::error!("Unable to open configs repository at {}: {err}", config.configs_repository_path.display());
        exit(1)
    });

    let (incoming_msg_tx, incoming_msg_rx) = tokio::sync::mpsc::unbounded_channel();
    let (outgoing_msg_tx, outgoing_msg_rx) = tokio::sync::mpsc::unbounded_channel();

    let remotes = config
        .remotes
        .iter()
        .map(|(key, rc_config)| {
            let rc = Arc::new(RwLock::new(RemoteComputer::new(
                rc_config.clone(),
                config.clone(),
                incoming_msg_tx.clone(),
                outgoing_msg_tx.clone(),
            )));
            (key.clone(), rc)
        })
        .collect::<Remotes>();
    let remotes = Arc::new(remotes);

    let state = State::new(remotes.clone());
    let broadcast = Broadcast::new(state.clone());

    let interceptors = Interceptors::builder()
        .with(SseInterceptor::new(broadcast.clone()))
        .with(PssInterceptor::new(broadcast.clone()))
        .with(LogInterceptor::new(mavlink_logfile))
        .with(ConfigInterceptor::new(repository, config.configs_repository_path.clone(), state.clone(), broadcast.clone()))
        .with(StateMachineStateInterceptor::new(state.clone()))
        .with(TelemetryInterceptor::new(broadcast.clone()))
        .with(InfluxInterceptor::new(
            &config.influx.address,
            &config.influx.organization,
            &cli.influx_token,
            config.influx.bucket.clone(),
            state.clone(),
            config.clone(),
        ))
        .finish();

    tokio::spawn(async move { interceptors.execute_with_receiver(incoming_msg_rx, outgoing_msg_rx).await });

    start_heartbeat(state.clone());

    HttpServer::new(move || {
        let app = App::new()
            .wrap(Cors::permissive())
            .wrap(middleware::Logger::default().log_level(log::Level::Debug))
            .app_data(Data::from(broadcast.clone()))
            .app_data(Data::from(config.clone()))
            .app_data(Data::from(remotes.clone()))
            .app_data(Data::new(pss_diagrams.clone()))
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

/// Create a new log file and return a handle to it.
async fn create_and_get_logfile(directory: &PathBuf, path: &PathBuf) -> io::Result<File> {
    if !directory.exists() {
        fs::create_dir_all(directory).await?
    }
    File::create(path).await
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
        .service(web::rocket_pss)
        .service(web::rfs_pss)
        .service(web::send_message)
        .service(web::abort)
        .service(web::tile_servers)
        .service(web::ground_station)
        .service(web::recovery_point)
        .service(web::polygon);
}

/// Start the heartbeat thread which periodically sends a MavLink heartbeat message
/// to the active remote, if one is currently active.
fn start_heartbeat(state: StateInstance) {
    tokio::spawn(async move {
        loop {
            let state_guard = state.read().await;
            if let Ok((name, remote_computer)) = state_guard.get_active_remote().map(|(name, rc)| (name.clone(), rc)) {
                drop(state_guard);
                let rc_guard = remote_computer.read().await;
                if let Err(err) = rc_guard.send_heartbeat_message().await {
                    log::warn!("Unable to send heartbeat message to remote '{name}': {err}")
                }
            } else {
                log::trace!("No active remote, skipping heartbeat!");
            }

            // We don't use a tokio interval here because we don't want to queue
            // up heartbeats if one couldn't be sent.
            tokio::time::sleep(HEARTBEAT_INTERVAL).await
        }
    });
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
