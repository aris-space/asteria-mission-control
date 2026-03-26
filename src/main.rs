use crate::{cli::Cli, config::Config, mavlink::Mavlink, state::State, web::broadcast::Broadcast};
use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use asteria_datapoint_information::datapoint::NamedDatapointValue;
use clap::Parser;
use env_logger::Env;
use serde::Serialize;
use std::{
    path::{Path, PathBuf},
    process::exit,
    sync::OnceLock,
    time::Duration,
};
use utoipa::{OpenApi, ToSchema};
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

mod cli;
mod config;
mod mavlink;
mod parser;
mod scenario;
mod state;
mod web;

/// Global variable containing the path where the config file is located.
pub static CONFIG_PATH: OnceLock<PathBuf> = OnceLock::new();

/// Duration after which a restart of the MavLink
/// message proxy should be attempted.
const MAVLINK_PROXY_RESTART_TIMEOUT: Duration = Duration::from_millis(2500);

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

    config.scenarios.iter().for_each(|(name, scenario)| {
        log::info!(
            "Found scenario '{name}' with {} state machine(s) and {} PSS configuration(s)",
            scenario.state_machines.len(),
            scenario.pss.len()
        )
    });

    let state = State::new(config.clone());
    let broadcast = Broadcast::new();
    let mavlink = Mavlink::new(config.clone(), broadcast.clone());

    let mavlink_clone = mavlink.clone();
    tokio::spawn(async move {
        loop {
            // Start MavLink receiver and proxy messages as SSE events.
            if let Err(err) = mavlink_clone.run_message_proxy().await {
                log::error!("Error whilst starting mavlink message proxy: {err}");
            }
            // Await restart timeout and then attempt restart in next iteration.
            tokio::time::sleep(MAVLINK_PROXY_RESTART_TIMEOUT).await
        }
    });

    HttpServer::new(move || {
        let app = App::new()
            .wrap(Cors::permissive())
            .wrap(middleware::Logger::default())
            .app_data(Data::from(broadcast.clone()))
            .app_data(Data::from(config.clone()))
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

/// Apply all endpoints to the main service config which is exposed under `/api/`.
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
        .service(web::pss_information)
        .service(web::all_pss_infos)
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
