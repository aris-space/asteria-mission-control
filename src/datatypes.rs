use asteria_datapoint_information::datapoint::NamedDatapointValue;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Serialize, ToSchema)]
pub struct NamedPssDatapointValue {
    /// Unique name of the datapoint
    pub name: &'static str,
    /// Value of the datapoint
    pub value: f32,
}

impl From<NamedDatapointValue> for NamedPssDatapointValue {
    fn from(NamedDatapointValue { name, value }: NamedDatapointValue) -> Self {
        NamedPssDatapointValue { name, value: value.into() }
    }
}
