use actix_web::{
    Responder,
    error::{ErrorBadRequest, ErrorInternalServerError, ErrorNotFound},
    get, put,
    web::{self, Data, Json},
};
use actix_web_lab::sse::{Data as SseData, Event as SseEvent};
use serde::Serialize;

use broadcast::Broadcast;

use crate::{config::Config, state::StateInstance, statemachine::StateMachine};

pub mod broadcast;

pub enum Event {
    /// The scenario on the backend changed. The event contains the id of the new scenario.
    ScenarioChange(String),
}

impl From<Event> for SseEvent {
    fn from(event: Event) -> Self {
        match event {
            Event::ScenarioChange(id) => Self::Data(SseData::new(id).event("scenario-change")),
        }
    }
}

#[derive(Serialize, utoipa::ToSchema)]
struct Info {
    /// Git version of the mission control server
    version: String,
    /// Default scenario from current configuration file
    default_scenario: String,
}

#[utoipa::path(responses((status = OK, body = Info)), description = "Get basic information about the running API server")]
#[get("/")]
pub async fn info(config: Data<Config>) -> actix_web::Result<Json<Info>> {
    Ok(Json(Info { version: env!("GIT_VERSION").to_string(), default_scenario: config.default_scenario.clone() }))
}

#[utoipa::path(responses((status = OK, content_type = "application/json")), description = "Get the TOML schema for the config")]
#[get("/config/schema")]
pub async fn config_schema() -> actix_web::Result<Json<serde_json::Value>> {
    let schema = schemars::schema_for!(Config);
    Ok(Json(schema.into()))
}

#[utoipa::path(responses((status = OK, content_type = "text/event-stream")), description = "Subscribe to API event stream using SSE")]
#[get("/events")]
pub async fn subscribe_events(broadcast: Data<Broadcast>) -> actix_web::Result<impl Responder> {
    broadcast.subscribe().await
}

#[derive(Serialize, utoipa::ToSchema)]
struct ScenarioInfo {
    /// Identifier of the scenario
    id: String,
    /// Displayname of the scenario
    name: String,
}

#[utoipa::path(responses((status = OK, body = ScenarioInfo)), description = "Get the active scenario")]
#[get("/scenario")]
pub async fn active_scenario(state: Data<StateInstance>) -> actix_web::Result<Json<ScenarioInfo>> {
    let state = state.read().await;
    Ok(Json(ScenarioInfo { id: state.get_scenario_id().clone(), name: state.get_scenario().name.clone() }))
}

#[utoipa::path(responses((status = OK, body = Vec<ScenarioInfo>)), description = "Get all available scenarios")]
#[get("/scenario/all")]
pub async fn all_scenarios(config: Data<Config>) -> actix_web::Result<Json<Vec<ScenarioInfo>>> {
    let scenarios = config
        .scenarios
        .iter()
        .map(|(id, scenario)| ScenarioInfo { id: id.clone(), name: scenario.name.clone() })
        .collect::<Vec<_>>();
    Ok(Json(scenarios))
}

#[utoipa::path(
    responses(
        (status = OK, body = String),
        (status = BAD_REQUEST, body = String)
    ),
    description = "Change the active scenario. Emits a `scenario-change` event with the id of the new scenario to all clients"
)]
#[put("/scenario/{scenario_id}")]
pub async fn change_scenario(
    scenario_id: web::Path<String>,
    state: Data<StateInstance>,
    broadcast: Data<Broadcast>,
) -> actix_web::Result<String> {
    let scenario_id = scenario_id.into_inner();
    let mut state = state.write().await;
    match state.set_scenario(scenario_id.clone()) {
        Ok(_) => {
            broadcast.broadcast(Event::ScenarioChange(scenario_id.clone())).await;
            Ok(scenario_id)
        }
        Err(err) => {
            log::debug!("Error whilst changing scenario: {err}");
            Err(ErrorBadRequest(err))
        }
    }
}

#[utoipa::path(responses((status = OK, body = StateMachine), (status = NOT_FOUND, body = String)), description = "Get a specific state machine")]
#[get("/statemachine/{statemachine_id}")]
pub async fn state_machine(ids: web::Path<String>, config: Data<Config>) -> actix_web::Result<Json<StateMachine>> {
    let state_machine_id = ids.into_inner();

    config
        .state_machines
        .get(&state_machine_id)
        .ok_or(ErrorNotFound(format!("State machine '{state_machine_id}' not found")))
        .and_then(|state_machine| {
            StateMachine::parse_from(&state_machine.path)
                .map_err(|err| {
                    log::error!("Error whilst parsing state machine file: {err}");
                    ErrorInternalServerError("Error whilst parsing state machine file")
                })
                .map(Json)
        })
}

#[derive(Serialize, utoipa::ToSchema)]
struct StateMachineInfo {
    /// Identifier of the state machine
    id: String,
    /// Displayname of the state machine
    name: String,
}

#[utoipa::path(responses((status = OK, body = Vec<StateMachineInfo>)), description = "Get all available state machines of a specific scenario scenario")]
#[get("/statemachine/scenario/{scenario_id}")]
pub async fn all_state_machines(
    scenario_id: web::Path<String>,
    config: Data<Config>,
) -> actix_web::Result<Json<Vec<StateMachineInfo>>> {
    let scenario_id = scenario_id.into_inner();

    config
        .scenarios
        .get(&scenario_id)
        .ok_or(ErrorNotFound(format!("Scenario '{scenario_id}' not found")))
        .map(|scenario| {
            scenario
                .state_machines
                .iter()
                .filter_map(|id| {
                    config
                        .state_machines
                        .get(id)
                        .map(|machine| StateMachineInfo { id: id.clone(), name: machine.name.clone() })
                })
                .collect::<Vec<_>>()
        })
        .map(Json)
}
