//! Frontend code for valves

use crate::intercept::widgets::DatapointName;
use crate::intercept::widgets::Widget;
use crate::web::widgets::make_event;
use actix_web_lab::sse::Event;
use maud::html;

pub use asteria_datatypes::actuator::{NormallyClosedValve, NormallyOpenValve};

impl Widget for NormallyClosedValve {
    fn make_update(&self, name: DatapointName) -> Event {
        let html = html!(
            p id=(name) {
                (format!("{self:?}"))
            }
        );
        make_event(html)
    }
}

impl Widget for NormallyOpenValve {
    fn make_update(&self, name: DatapointName) -> Event {
        let html = html!(
            p id=(name) {
                (format!("{self:?}"))
            }
        );
        make_event(html)
    }
}
