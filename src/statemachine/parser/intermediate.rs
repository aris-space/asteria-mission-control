use serde::{Deserialize, Deserializer, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize)]
#[serde(rename(deserialize = "mxfile"))]
pub struct MxFile {
    #[serde(rename(deserialize = "diagram"))]
    pub diagram: Diagram,
}

#[derive(Debug, Deserialize)]
pub struct Diagram {
    #[serde(rename(deserialize = "mxGraphModel"))]
    pub model: MxGraphModel,
}

#[derive(Debug, Deserialize)]
pub struct MxGraphModel {
    #[serde(rename(deserialize = "@dx"))]
    pub width: u32,
    #[serde(rename(deserialize = "@dy"))]
    pub height: u32,
    pub root: Root,
}

#[derive(Debug, Deserialize)]
pub struct Root {
    #[serde(rename(deserialize = "$value"))]
    pub children: Vec<RootChild>,
}

#[derive(Debug, Deserialize)]
pub enum RootChild {
    #[serde(rename(deserialize = "mxCell"))]
    Cell(MxCell),
    #[serde(rename(deserialize = "object"))]
    Object(Object),
}

#[derive(Debug, Deserialize)]
pub struct Object {
    #[serde(rename(deserialize = "@id"))]
    pub id: String,
    #[serde(rename(deserialize = "@label"))]
    pub label: String,
    #[serde(rename(deserialize = "@state"))]
    pub state: String,
    #[serde(rename(deserialize = "@state-kind"), default)]
    pub state_kind: super::StateKind,
    #[serde(rename(deserialize = "mxCell"))]
    pub cell: MxCell,
}

#[derive(Debug, Deserialize, PartialEq, Clone)]
pub struct MxCell {
    #[serde(rename(deserialize = "@id"))]
    pub id: Option<String>,
    #[serde(rename(deserialize = "@parent"), deserialize_with = "non_empty_str", default)]
    pub parent: Option<String>,
    #[serde(rename(deserialize = "@value"), deserialize_with = "non_empty_str", default)]
    pub value: Option<String>,
    #[serde(rename(deserialize = "@target"), deserialize_with = "non_empty_str", default)]
    pub target: Option<String>,
    #[serde(rename(deserialize = "@source"), deserialize_with = "non_empty_str", default)]
    pub source: Option<String>,
    #[serde(rename(deserialize = "@edge"), default)]
    pub edge: bool,
    #[serde(rename(deserialize = "@vertex"), default)]
    pub vertex: bool,
    #[serde(rename(deserialize = "mxGeometry"))]
    pub geometry: Option<MxGeometry>,
}

#[derive(Debug, Deserialize, PartialEq, Clone, Serialize, ToSchema)]
pub struct MxGeometry {
    #[serde(rename(deserialize = "@x"))]
    pub x: Option<f32>,
    #[serde(rename(deserialize = "@y"))]
    pub y: Option<f32>,
    #[serde(rename(deserialize = "@width"))]
    pub width: Option<f32>,
    #[serde(rename(deserialize = "@height"))]
    pub height: Option<f32>,
}

/// Function used to treat empty strings ("") as `None` with serde
fn non_empty_str<'de, D: Deserializer<'de>>(d: D) -> Result<Option<String>, D::Error> {
    use serde::Deserialize;
    let o: Option<String> = Option::deserialize(d)?;
    Ok(o.filter(|s| !s.is_empty()))
}
