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
        (status = OK, body = ()),
        (status = BAD_REQUEST, body = String)
    ),
    description = "Change the active scenario. Emits a `scenario-change` event with the id of the new scenario to all clients"
)]
#[put("/scenario/{scenario_id}")]
pub async fn change_scenario(
    scenario_id: web::Path<String>,
    state: Data<StateInstance>,
    broadcast: Data<Broadcast>,
) -> actix_web::Result<()> {
    let scenario_id = scenario_id.into_inner();
    let mut state = state.write().await;
    match state.set_scenario(scenario_id.clone()) {
        Ok(_) => {
            broadcast.broadcast(Event::ScenarioChange(scenario_id)).await;
            Ok(())
        }
        Err(err) => {
            log::debug!("error whilst changing scenario: {err}");
            Err(ErrorBadRequest(err))
        }
    }
}

#[utoipa::path(responses((status = OK, body = StateMachine), (status = NOT_FOUND, body = String)), description = "Get a state machine of the current active scenario")]
#[get("/statemachine/{id}")]
pub async fn state_machine(id: web::Path<String>, state: Data<StateInstance>) -> actix_web::Result<Json<StateMachine>> {
    let id = id.into_inner();
    let state = state.read().await;
    match state.get_scenario().state_machines.get(&id) {
        Some(state_machine) => StateMachine::parse_from(&state_machine.path)
            .map_err(|err| {
                log::error!("error whilst parsing state machine file: {err}");
                ErrorInternalServerError("error whilst parsing state machine file")
            })
            .map(Json),
        None => Err(ErrorNotFound(format!("state machine '{id}' not found on current scenario"))),
    }
}

#[derive(Serialize, utoipa::ToSchema)]
struct StateMachineInfo {
    /// Identifier of the state machine
    id: String,
    /// Displayname of the state machine
    name: String,
}

#[utoipa::path(responses((status = OK, body = Vec<StateMachineInfo>)), description = "Get all available state machines from the active scenario")]
#[get("/statemachine")]
pub async fn all_state_machines(state: Data<StateInstance>) -> actix_web::Result<Json<Vec<StateMachineInfo>>> {
    let state = state.read().await;
    let state_machines = state
        .get_scenario()
        .state_machines
        .iter()
        .map(|(id, machine)| StateMachineInfo { id: id.clone(), name: machine.name.clone() })
        .collect::<Vec<_>>();

    Ok(Json(state_machines))
}
