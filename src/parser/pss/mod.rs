use std::{collections::HashMap, fs};

use crate::{
    config::PssConfig,
    parser::{cut_diagram_xml, parse_diagram_xml},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, thiserror::Error)]
pub enum PssError {
    #[error("Error whilst reading PSS diagram: {0}")]
    DiagramRead(std::io::Error),
    #[error("Error whilst parsing PSS diagram: {0}")]
    DiagramParse(quick_xml::de::DeError),
}

/// Optional additional data for diagram vertices.
#[derive(Deserialize, Debug)]
struct PssVertexData {
    /// Optional name of the PSS datapoint by which this
    /// cell should be replaced.
    #[serde(rename(deserialize = "@datapoint"))]
    datapoint: Option<String>,
}

/// Representation of a PSS diagram.
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Pss {
    /// PSS diagram SVG without the drawio XML content.
    pub diagram: String,
    /// List of all datapoints defined in the diagram together with the
    /// cell id they're mapped to.
    pub datapoint_nodes: HashMap<String, String>,
}

impl TryFrom<&PssConfig> for Pss {
    type Error = PssError;

    fn try_from(value: &PssConfig) -> Result<Self, Self::Error> {
        let diagram_str = fs::read_to_string(&value.diagram_path).map_err(PssError::DiagramRead)?;

        let (xml, svg) = cut_diagram_xml(&diagram_str).map_err(PssError::DiagramParse)?;
        let diagram = parse_diagram_xml::<PssVertexData>(&xml).map_err(PssError::DiagramParse)?;

        // Map of all datapoints to the cell id they should replace.
        let datapoint_nodes = diagram
            .cells
            .into_iter()
            .filter_map(|cell| cell.data.map(|data| (data, cell.id)))
            .filter_map(|(data, id)| data.datapoint.map(|name| (name, id)))
            .collect::<HashMap<_, _>>();

        // TODO: This should be the datapoint information returned from the PSS macro.
        #[expect(unused)]
        let datapoint_infos = Vec::<()>::new();

        // TODO: What should we do with datapoints
        // - Which are defined in the diagram but not available through the macro? Meaning they will never arise.
        // - Which are not defined in the diagram but are available through the macro? Meaning they could arise and we wouldn't be able to display them.
        // Should both be fatal?

        // TODO: Ensure that the datapoints referenced in the diagram are valid (to the definition above).

        Ok(Self { diagram: svg, datapoint_nodes })
    }
}
