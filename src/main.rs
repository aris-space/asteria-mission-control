use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use clap::Parser;
use env_logger::Env;
use std::{collections::HashMap, path::Path, process::exit, sync::Arc, time::Duration};
use tokio::sync::RwLock;
use utoipa::OpenApi;
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

use crate::{
    cli::Cli,
    config::Config,
    mavlink::Mavlink,
    state::State,
    statemachine::{StateMachine, StateMachineError},
    web::broadcast::Broadcast,
};

mod cli;
mod config;
mod mavlink;
mod state;
mod statemachine;
mod web;

/// Duration in milliseconds after which a restart of the mavlink
/// message proxy should be attempted
const MAVLINK_PROXY_RESTART_TIMEOUT: u64 = 2500;

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

    let config = match Config::parse(Path::new(&cli.config_path)) {
        Ok(config) => config,
        Err(err) => {
            log::error!("Error whilst parsing config: {err}");
            exit(1);
        }
    };

    log::debug!("Using config: {config:?}");

    let state_machines = match config
        .state_machines
        .iter()
        .map(|(name, config)| Result::<_, (String, StateMachineError)>::Ok((name.clone(), StateMachine::try_from(config).map_err(|err| (name.clone(), err))?)))
        .collect::<Result<HashMap<_, _>, (String, StateMachineError)>>()
    {
        Ok(state_machines) => Arc::new(state_machines),
        Err((state_machine, err)) => {
            log::error!("Error whilst parsing state machine '{state_machine}': {err}");
            exit(1);
        }
    };
    log::info!("Successfully loaded {} state machines", state_machines.len());

    let state = Arc::new(RwLock::new(State::new(config.clone())));
    let broadcast = Broadcast::new();
    let mavlink = Mavlink::new(config.clone(), broadcast.clone());

    let mavlink_clone = mavlink.clone();
    tokio::spawn(async move {
        loop {
            // start mavlink receiver and proxy messages as SSE events
            if let Err(err) = mavlink_clone.start_message_proxy().await {
                log::error!("Error whilst starting mavlink message proxy: {err}");
            }
            // await restart timeout and then attempt restart in next iteration
            tokio::time::sleep(Duration::from_millis(MAVLINK_PROXY_RESTART_TIMEOUT)).await
        }
    });

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_header().allow_any_method().allow_any_origin();
        let app = App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(Data::from(broadcast.clone()))
            .app_data(Data::from(config.clone()))
            .app_data(Data::from(state_machines.clone()))
            .app_data(Data::from(mavlink.clone()))
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

/// Apply all endpoints to the main service config which is exposed under /api/
fn apply_endpoints(cfg: &mut ServiceConfig) {
    cfg.service(web::info)
        .service(web::config_schema)
        .service(web::subscribe_events)
        .service(web::state_machine)
        .service(web::active_scenario)
        .service(web::change_scenario)
        .service(web::all_scenarios)
        .service(web::state_machine)
        .service(web::all_state_machines)
        .service(web::send_message);
}

#[cfg(feature = "static-frontend")]
/// Service which serves a static frontend on the `/` directory
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
                if path_str.starts_with("api") {
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
