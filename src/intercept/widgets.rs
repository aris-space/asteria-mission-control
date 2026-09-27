//! This module provides [`WidgetInterceptor`] which provides the backend functionality for datastar.

use crate::intercept::Interceptor;
use crate::web::broadcast::Broadcast;
use crate::web::widgets::register_widgets;
use actix_web_lab::sse::Event;
use async_trait::async_trait;
use facet_reflect::Peek;
use std::collections::HashMap;
use std::sync::Arc;

/// A type that carries contents for a widget.
pub trait Widget {
    /// Create a datastar SSE event that updates the widget content for the datapoint `name` with content `self`.
    fn make_update(&self, name: DatapointName) -> Event;
}

// Machinery to perform a dynamic cast to a trait object:
pub type WidgetCastFn = for<'m, 'f> fn(facet_reflect::Peek<'m, 'f>) -> Option<&'m dyn Widget>;
lazy_static::lazy_static! {
    /// All types which implement Widget, manually registered
    static ref WIDGETS: HashMap<&'static facet::Shape, WidgetCastFn> = register_widgets();
}

/// The name/identification of a datapoint.
/// It is either `Board::Message` or `renamed_id`, if `#[facet::rename]` is given on the inner message.
pub struct DatapointName {
    owner: &'static str,
    datapoint: &'static str,
    id: Option<&'static str>,
}

impl std::fmt::Display for DatapointName {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.id {
            Some(id) => write!(f, "{id}"),
            None => write!(f, "{}::{}", self.owner, self.datapoint),
        }
    }
}

/// Interceptor that turns messages into datastar SSE elements if the type supports it.
pub struct WidgetInterceptor {
    pub broadcast: Arc<Broadcast>,
}

impl WidgetInterceptor {
    /// Get the datapoint name and value from the message using reflection.
    fn extract(message: &asteria_messages::Message) -> Option<(DatapointName, &dyn Widget)> {
        // unwrap nested enum
        let peek = Peek::new(message);
        let peek = peek.into_enum().expect("we know `Message` is a enum");
        let board_peek =
            peek.field(0).expect("shouldn't be able to fail").expect("we know `Message` is a newtype-only enum");
        let board_peek = board_peek.into_enum().expect("we know all newtypes of `Message` are themselves enums");
        let inner_var = board_peek.active_variant().expect("shouldn't be able to fail");
        let inner_shape = inner_var.data.fields.first().expect("FIXME could also be unit, not newtype").shape();

        // see if the type is a Widget
        let dyn_cast = WIDGETS.get(inner_shape)?;

        let outer_var = peek.active_variant().expect("shouldn't be able to fail");
        let data_peek =
            board_peek.field(0).expect("shouldn't be able to fail").expect("FIXME could also be unit, not newtype");

        // then cast to widget and collect name
        let widget = dyn_cast(data_peek).expect("messed up reflection: type/peek mismatch");
        let name = DatapointName { owner: outer_var.effective_name(), datapoint: inner_var.name, id: inner_var.rename };
        Some((name, widget))
    }
}

#[async_trait]
impl Interceptor for WidgetInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {
        let Some((name, widget)) = Self::extract(message) else {
            return;
        };
        let event = widget.make_update(name);
        self.broadcast.broadcast(event).await;
    }
}

#[test]
fn check_extraction() {
    use asteria_datatypes::actuator::NormallyClosedValve;
    use asteria_messages::datapoints::dp_rfs_computer::Message as RFSMessage;

    let (name, widget) = WidgetInterceptor::extract(&asteria_messages::Message::RfsComputer(
        RFSMessage::GoxPurgeValveState(NormallyClosedValve::Open),
    ))
    .expect("NC is a registered widget");

    assert_eq!(name.owner, "RfsComputer");
    assert_eq!(name.datapoint, "GoxPurgeValveState");
    assert_eq!(name.to_string(), "RfsComputer::GoxPurgeValveState");
    eprint!("{:?}", widget.make_update(name));
}
