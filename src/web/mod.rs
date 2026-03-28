use crate::parser::pss::Pss;
use crate::{config::Config, mavlink::Mavlink, parser::statemachine::StateMachine, state::StateInstance};
use actix_web::{
    Responder,
    error::{ErrorBadRequest, ErrorInternalServerError, ErrorNotFound},
    get, put,
    web::{self, Data, Json},
};
use actix_web_lab::sse::{Data as SseData, Event as SseEvent};
use asteria_messages::Message;
use broadcast::Broadcast;
use serde::Serialize;

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
    /// Git version of the mission control server.
    version: String,
    /// Default scenario from current configuration file.
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
    /// Identifier of the scenario.
    id: String,
    /// Display name of the scenario.
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

#[utoipa::path(
    responses((status = OK, body = StateMachine), (status = NOT_FOUND, body = String)),
    description = "Get a specific state machine for a scenario"
)]
#[get("/statemachine/scenario/{scenario_id}/{state_machine_id}")]
pub async fn state_machine(ids: web::Path<(String, String)>, config: Data<Config>) -> actix_web::Result<Json<StateMachine>> {
    let (scenario_id, state_machine_id) = ids.into_inner();
    config
        .scenarios
        .get(&scenario_id)
        .ok_or(ErrorNotFound(format!("Scenario '{scenario_id}' not found")))
        .and_then(|scenario| {
            scenario
                .state_machines
                .get(&state_machine_id)
                .cloned()
                .ok_or(ErrorNotFound(format!("State machine '{state_machine_id}' not found on scenario '{scenario_id}'")))
        })
        .map(Json)
}

#[derive(Serialize, utoipa::ToSchema)]
struct StateMachineInfo {
    /// Identifier of the state machine.
    id: String,
    /// Display name of the state machine.
    name: String,
}

#[utoipa::path(
    responses((status = OK, body = Vec<StateMachineInfo>), (status = NOT_FOUND, body = String)),
    description = "Get all available state machines of a specific scenario"
)]
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
                .map(|(id, machine)| StateMachineInfo { id: id.clone(), name: machine.name.clone() })
                .collect::<Vec<_>>()
        })
        .map(Json)
}

#[utoipa::path(
    responses((status = OK, body = Pss), (status = NOT_FOUND, body = String)),
    description = "Get a specific PSS information for a scenario"
)]
#[get("/pss/scenario/{scenario_id}/{pss_id}")]
pub async fn pss_information(ids: web::Path<(String, String)>, config: Data<Config>) -> actix_web::Result<Json<Pss>> {
    let (scenario_id, pss_id) = ids.into_inner();
    config
        .scenarios
        .get(&scenario_id)
        .ok_or(ErrorNotFound(format!("Scenario '{scenario_id}' not found")))
        .and_then(|scenario| {
            scenario
                .pss
                .get(&pss_id)
                .cloned()
                .ok_or(ErrorNotFound(format!("PSS information '{pss_id}' not found on scenario '{scenario_id}'")))
        })
        .map(Json)
}

#[derive(Serialize, utoipa::ToSchema)]
struct PssInfo {
    /// Identifier of the PSS information.
    id: String,
    /// Display name of the PSS information.
    name: String,
}

#[utoipa::path(
    responses((status = OK, body = Vec<PssInfo>), (status = NOT_FOUND, body = String)),
    description = "Get all available PSS infos of a specific scenario"
)]
#[get("/pss/scenario/{scenario_id}")]
pub async fn all_pss_infos(scenario_id: web::Path<String>, config: Data<Config>) -> actix_web::Result<Json<Vec<PssInfo>>> {
    let scenario_id = scenario_id.into_inner();

    config
        .scenarios
        .get(&scenario_id)
        .ok_or(ErrorNotFound(format!("Scenario '{scenario_id}' not found")))
        .map(|scenario| {
            scenario.pss.iter().map(|(id, pss)| PssInfo { id: id.clone(), name: pss.name.clone() }).collect::<Vec<_>>()
        })
        .map(Json)
}

#[utoipa::path(
    responses((status = OK, body = ())),
    description = "Send a message which will be proxied by the backend as a mavlink message")
]
#[put("/message")]
pub async fn send_message(message: Json<Message>, mavlink: Data<Mavlink>) -> actix_web::Result<()> {
    mavlink
        .send(message.into_inner())
        .await
        .map_err(|err| {
            log::error!("Error whilst sending mavlink message: {err}");
            ErrorInternalServerError("Error whilst sending mavlink message")
        })
        .map(|_| ())
}
