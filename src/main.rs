use crate::cli::Cli;
use crate::config::Config;
use crate::parser::{pss::Pss, statemachine::StateMachine};
use crate::remote::{RemoteComputer, Remotes, config::RemoteComputerConfig};
use crate::web::event::Event;
use crate::web::{
    broadcast::Broadcast,
    event::EventKind,
    state::{State, StateInstance},
};

use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use asteria_datapoint_information::datapoint::{DatapointHolder, NamedDatapointValue};
use asteria_messages::{Message, datapoints::dp_flight_computer};
use chrono::Utc;
use clap::Parser;
use env_logger::Env;
use futures::{StreamExt, stream::FuturesUnordered};
use gix::ThreadSafeRepository as Repository;
use std::io;
use std::path::{Path, PathBuf};
use std::process::exit;
use std::sync::{Arc, OnceLock};
use std::time::Duration;
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;
use tokio::sync::{RwLock, mpsc::UnboundedReceiver};
use utoipa::OpenApi;
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

mod cli;
mod config;
mod mavlink;
mod parser;
mod remote;
mod web;

/// Global variable containing the path where the config file is located.
pub static CONFIG_PATH: OnceLock<PathBuf> = OnceLock::new();

pub static CONFIGS_REPOSITORY: OnceLock<Repository> = OnceLock::new();

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
        schemas(EventKind, NamedDatapointValue, StateMachine, Pss)
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
            config.remotes.keys().for_each(|name| log::info!("Found remote '{name}'"));
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
        log::info!("Using MavLink log file at '{}'", path.display());
    }

    let pss_diagrams = match (Pss::new(&config.pss.rocket_diagram_path), Pss::new(&config.pss.rfs_diagram_path)) {
        (Ok(rocket), Ok(rfs)) => Arc::new((rocket, rfs)),
        (rocket_result, rfs_result) => {
            if let Err(err) = rocket_result {
                log::error!("Unable to parse rocket PSS diagram: {err}");
            };
            if let Err(err) = rfs_result {
                log::error!("Unable to parse RFS PSS diagram: {err}")
            };
            exit(1)
        }
    };

    match gix::open(&config.configs_repository_path) {
        // We don't attempt to write to the OnceLock from anywhere else so we can be sure
        // that the OnceLock hasn't been initialized yet.
        Ok(repository) => CONFIGS_REPOSITORY.set(repository.into_sync()).unwrap(),
        Err(err) => {
            log::error!("Unable to open configs repository at {}: {err}", config.configs_repository_path.display());
            exit(1)
        }
    };

    let (msg_tx, msg_rx) = tokio::sync::mpsc::unbounded_channel();
    let broadcast = Broadcast::new();

    let remotes = config
        .remotes
        .iter()
        .map(|(key, rc_config)| {
            (key.clone(), Arc::new(RwLock::new(RemoteComputer::new(rc_config.clone(), config.clone(), msg_tx.clone()))))
        })
        .collect::<Remotes>();
    let remotes = Arc::new(remotes);

    let state = State::new(remotes.clone(), broadcast.clone());

    start_mavlink_message_handler(msg_rx, config.clone(), broadcast.clone(), state.clone(), mavlink_logfile);
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
        .service(web::send_message);
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

/// Start the thread which handles the incoming MavLink messages.
/// - Every message is proxied in JSON serialized form through SSE with the [`EventKind::MavlinkMessage`] event
/// - If the message contains any PSS datapoints, the datapoint values are broadcast in JSON serialized form
///   through SEE with the [`EventKind::PssData`] event.
/// - If the message contains a new config hash, the state machine and PSS are updated according to the new config.
fn start_mavlink_message_handler(
    mut msg_rx: UnboundedReceiver<Message>,
    config: Arc<Config>,
    broadcast: Arc<Broadcast>,
    state: StateInstance,
    mut log_file: File,
) {
    tokio::spawn(async move {
        while let Some(message) = msg_rx.recv().await {
            // Log message to MavLink log file.
            if let Ok(mut message_value) = serde_json::to_value(&message) {
                // Insert a `timestamp` field which is the current UNIX timestamp. This would enable
                // replaying the messages.
                if let serde_json::Value::Object(ref mut map) = message_value {
                    map.insert(String::from("timestamp"), serde_json::Value::from(Utc::now().timestamp_millis()));
                }
                if let Err(err) = log_file.write_all(format!("{message_value}\r\n").as_bytes()).await {
                    log::warn!("Unable to write MavLink log: {err}");
                }
            }

            if let Message::FlightComputer(dp_flight_computer::Message::ConfigHash(hash)) = &message {
                handle_config_hash_message(hash.hash, &config.configs_repository_path, &state).await;
            }

            let datapoint_events = message.get_datapoint_values().into_iter().map(Event::PssData).collect::<Vec<_>>();

            let mut events = vec![Event::MavlinkMessage(message)];
            events.extend(datapoint_events);

            if !events.is_empty() {
                FuturesUnordered::from_iter(events.into_iter().map(|event| broadcast.broadcast(event)))
                    .collect::<Vec<_>>()
                    .await;
            }
        }
    });
}

/// Look up the config file in the configs repository at `configs_repository_path` and update
/// the state machine and PSS in the [`StateInstance`] according to how they are defined in
/// the config file.
async fn handle_config_hash_message(hash: [u8; 5], configs_repository_path: &Path, state: &StateInstance) {
    let repository = CONFIGS_REPOSITORY.get().unwrap().to_thread_local();
    log::debug!("Looking up config file with hash {}", String::from_utf8_lossy(&hash));

    let bytes = {
        let Ok(object_id) = repository.rev_parse_single(&hash) else {
            return log::error!("Could not find object with hash {} in configs repository", String::from_utf8_lossy(&hash));
        };

        // We unwrap because we just got this object id from `rev_parse_single`
        // so we know it exists.
        let object = repository.find_object(object_id).unwrap();

        let Ok(blob) = object.try_into_blob() else { return log::error!("Object belongig to config hash is not a blob") };

        blob.data.clone()
    };

    let rc_config = match toml::from_slice::<RemoteComputerConfig>(&bytes) {
        Ok(config) => config,
        Err(err) => return log::error!("Remote computer config is not valid: {err}"),
    };

    let state_machine = StateMachine::new(&rc_config, configs_repository_path);
    // TODO: Also parse PSS configurations here once they are ready.

    let mut state_guard = state.write().await;
    state_guard.set_state_machine(Some(state_machine)).await;
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
