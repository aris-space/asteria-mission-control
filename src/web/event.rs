use crate::{datatypes::NamedPssDatapointValue, parser::statemachine::StateMachine, web::datatypes::OptionalResult};

use actix_web_lab::sse::{Data as SseData, Event as SseEvent};
use asteria_messages::Message;
use serde::Serialize;
use std::fmt::Display;

#[derive(Serialize, utoipa::ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EventKind {
    Remote,
    StateMachine,
    PssData,
    Ping,
    MavlinkMessage,
}

impl Display for EventKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let value = serde_json::to_value(self).map_err(|_| std::fmt::Error)?;
        // Because it's an enum, we know that every variant is a valid string.
        write!(f, "{}", value.as_str().unwrap())
    }
}

pub enum Event {
    Remote(Option<String>),
    StateMachine(OptionalResult<StateMachine>),
    PssData(NamedPssDatapointValue),
    MavlinkMessage(Message),
}

impl From<Event> for SseEvent {
    fn from(event: Event) -> Self {
        match event {
            Event::Remote(name) => {
                Self::Data(SseData::new(name.unwrap_or(String::from("null"))).event(EventKind::Remote.to_string()))
            }
            Event::StateMachine(state_machine) => {
                Self::Data(SseData::new_json(&state_machine).unwrap().event(EventKind::StateMachine.to_string()))
            }
            Event::PssData(value) => Self::Data(SseData::new_json(value).unwrap().event(EventKind::PssData.to_string())),
            Event::MavlinkMessage(message) => {
                Self::Data(SseData::new_json(message).unwrap().event(EventKind::MavlinkMessage.to_string()))
            }
        }
    }
}
