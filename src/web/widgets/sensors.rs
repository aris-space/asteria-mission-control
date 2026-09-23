//! Frontend code for sensors

use crate::intercept::widgets::DatapointName;
use crate::intercept::widgets::Widget;
use crate::web::widgets::make_event;
use actix_web_lab::sse::Event;
use asteria_datatypes::units::ValueWithUnit as _;
use maud::html;

pub use asteria_datatypes::units::{BarG, Celsius};

impl Widget for Celsius {
    fn make_update(&self, name: DatapointName) -> Event {
        let html = html!(
            p id=(name) {
                (format!("{:.1?}", self.value()))
            }
        );
        make_event(html)
    }
}

impl Widget for BarG {
    fn make_update(&self, name: DatapointName) -> Event {
        let html = html!(
            p id=(name) {
                (format!("{:.3?}", self.value()))
            }
        );
        make_event(html)
    }
}
