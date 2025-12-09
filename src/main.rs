// enable the unstable `try_collect` feature which allows us to
// collect iterators of results into a single result
#![feature(iterator_try_collect)]

use std::{collections::HashMap, path::Path, process::exit, sync::Arc};

use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use clap::Parser;
use env_logger::Env;
use tokio::sync::RwLock;
use utoipa::OpenApi;
use utoipa_actix_web::{AppExt, service_config::ServiceConfig};
use utoipa_rapidoc::RapiDoc;

use crate::{
    cli::Cli,
    config::Config,
    state::State,
    statemachine::{StateMachine, StateMachineError},
    web::broadcast::Broadcast,
};

mod cli;
mod config;
mod state;
mod statemachine;
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

    let config = match Config::parse(Path::new(&cli.config_path)) {
        Ok(config) => Arc::new(config),
        Err(err) => {
            log::error!("Error whilst parsing config: {err}");
            exit(1);
        }
    };
    log::debug!("Using config: {config:?}");

    let state_machines = match config
        .state_machines
        .iter()
        .map(|(name, config)| Result::<_, StateMachineError>::Ok((name.clone(), StateMachine::try_from(config)?)))
        .try_collect::<HashMap<_, _>>()
    {
        Ok(state_machines) => Arc::new(state_machines),
        Err(err) => {
            log::error!("Error whilst parsing state machines: {err}");
            exit(1);
        }
    };
    log::info!("Successfully loaded {} state machines", state_machines.len());

    let state = Arc::new(RwLock::new(State::new(config.clone())));
    let broadcast = Broadcast::new();

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_header().allow_any_method().allow_any_origin();
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(Data::from(broadcast.clone()))
            .app_data(Data::from(config.clone()))
            .app_data(Data::from(state_machines.clone()))
            .app_data(Data::new(state.clone()))
            .into_utoipa_app()
            .openapi(ApiDoc::openapi())
            .service(utoipa_actix_web::scope("/api").configure(apply_endpoints))
            .openapi_service(|api| RapiDoc::with_openapi("/docs/openapi.json", api).path("/docs/ui"))
            .into_app()
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
        .service(web::all_state_machines);
}
