use crate::intercept::widgets::{Widget, WidgetCastFn};
use actix_web_lab::sse::Event;
use facet::Facet as _;
use maud::Markup;
use std::collections::HashMap;

// modules which give related widgets. REGISTER THEM down below!

mod sensors;
mod valves;

/// Collects all supported types to display via datastar
pub fn register_widgets() -> HashMap<&'static facet::Shape, WidgetCastFn> {
    macro_rules! widget_list {
        ($($t:ty,)+) => {[$(
            (<$t>::SHAPE, { let cast: WidgetCastFn = |p| p.get::<$t>().ok().map(|v| v as &dyn Widget); cast })
        ),+]}
    }
    HashMap::from(widget_list![valves::NormallyClosedValve, valves::NormallyOpenValve, sensors::BarG, sensors::Celsius,])
}

/// Helper to wrap html into a datastar Patch Elements SSE event
fn make_event(html: Markup) -> Event {
    let evt = datastar::patch_elements::PatchElements::new(html).into_datastar_event();
    // Sadly, the constants of datastar are private...
    Event::Data(actix_web_lab::sse::Data::new(evt.data.join("\n")).event("datastar-patch-elements"))
}
