use std::collections::HashMap;

use crate::intercept::Interceptor;
use actix_web_lab::sse::Event;
use asteria_datapoint_information::datapoint::{DatapointValue, IntoDatapointValue};
use asteria_datatypes::actuator::NormallyClosedValve;
use async_trait::async_trait;
use facet::Facet as _;
use facet_reflect::Peek;

type WidgetCastFn = for<'m, 'f> fn(facet_reflect::Peek<'m, 'f>) -> Option<&'m dyn Widget>;
lazy_static::lazy_static! {
    static ref WIDGETS: HashMap<&'static facet::Shape, WidgetCastFn> = {
        HashMap::from([(NormallyClosedValve::SHAPE, {
            let cast: WidgetCastFn = |p| p.get::<NormallyClosedValve>().ok().map(|v| v as &dyn Widget);
            cast
        })])
    };
}

trait Widget {
    fn foo(&self) -> u32;
}
impl Widget for NormallyClosedValve {
    fn foo(&self) -> u32 {
        42
    }
}

struct DatapointName {
    owner: &'static str,
    datapoint: &'static str,
    id: Option<&'static str>,
}

pub struct WidgetInterceptor {
    pub broadcast: tokio::sync::broadcast::Sender<Event>,
}

impl WidgetInterceptor {
    fn extract(message: &asteria_messages::Message) -> Option<(DatapointName, &dyn Widget)> {
        let peek = Peek::new(message);
        let peek = peek.into_enum().expect("we know `Message` is a enum");
        let outer_var = peek.active_variant().expect("shouldn't be able to fail");
        let board_peek =
            peek.field(0).expect("shouldn't be able to fail").expect("we know `Message` is a newtype-only enum");
        let board_peek = board_peek.into_enum().expect("we know all newtypes of `Message` are themselves enums");
        let inner_var = board_peek.active_variant().expect("shouldn't be able to fail");
        let data_peek =
            board_peek.field(0).expect("shouldn't be able to fail").expect("FIXME could also be unit, not newtype");

        let inner_shape = inner_var.data.fields.first().expect("FIXME could also be unit, not newtype").shape();

        let Some(dyn_cast) = WIDGETS.get(inner_shape) else {
            eprintln!("not a widget");
            return None;
        };
        let widget = dyn_cast(data_peek).expect("messed up reflection: type/peek mismatch");
        let name = DatapointName { owner: outer_var.effective_name(), datapoint: inner_var.name, id: inner_var.rename };
        Some((name, widget))
    }
}

#[async_trait]
impl Interceptor for WidgetInterceptor {
    async fn on_message(&self, message: &asteria_messages::Message) {}
}

#[test]
fn check_extraction() {
    use asteria_messages::datapoints::dp_rfs_computer::Message as RFSMessage;
    let (name, widget) = WidgetInterceptor::extract(&asteria_messages::Message::RfsComputer(
        RFSMessage::GoxPurgeValveState(NormallyClosedValve::Open),
    ))
    .expect("NC is a registered widget");

    assert_eq!(name.owner, "RfsComputer");
    assert_eq!(name.datapoint, "GoxPurgeValveState");
    assert_eq!(widget.foo(), 42);
}
