use crate::parser::{cut_diagram_xml, parse_diagram_xml};

use asteria_datapoint_information::datapoint::{DatapointHolder, DatapointInformation};
use asteria_messages::Message;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use utoipa::ToSchema;

#[derive(Debug, thiserror::Error)]
#[expect(clippy::enum_variant_names)]
pub enum PssError {
    #[error("Error whilst reading PSS diagram: {0}")]
    DiagramRead(std::io::Error),
    #[error("Error whilst parsing PSS diagram: {0}")]
    DiagramParse(quick_xml::de::DeError),
    #[error("PSS diagram references the following datapoints which aren't produced by any message: {0:#?}")]
    DiagramUnknownStates(Vec<String>),
}

#[derive(Deserialize, Serialize, Debug, Default, ToSchema, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Alignment {
    #[default]
    Left,
    Right,
    Hidden,
}

/// Optional additional data for diagram vertices.
#[derive(Deserialize, Debug)]
struct PssVertexData {
    /// Optional name of the PSS datapoint by which this
    /// cell should be replaced.
    #[serde(rename(deserialize = "@datapoint"))]
    datapoint: Option<String>,
    /// Side to which the replacement HTML element should be aligned.
    ///
    /// For example, when set to [`Alignment::Left`], the leftmost border
    /// of the replacement element is at the position of the SVG cell and
    /// the label of the datapoint is right of the replacement element.
    #[serde(rename(deserialize = "@align"))]
    align: Option<Alignment>,
}

#[derive(Serialize, ToSchema, Clone, Debug)]
pub struct ExtendedDatapointInformation {
    #[serde(flatten)]
    info: DatapointInformation,
    /// Alignment of the replacement element.
    align: Alignment,
    /// Id of the diagram cell which should be replaced by the
    /// replacement element.
    cell: String,
}

/// Representation of a PSS diagram.
#[derive(Debug, Serialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Pss {
    /// PSS diagram SVG without the drawio XML content.
    pub diagram: String,
    /// Map of all datapoints defined in the diagram together with information
    /// collected at compile time and from the diagram about the datapoint.
    pub datapoint_info: HashMap<String, ExtendedDatapointInformation>,
}

impl Pss {
    pub fn new(diagram_path: &PathBuf) -> Result<Self, PssError> {
        let diagram_str = fs::read_to_string(diagram_path).map_err(PssError::DiagramRead)?;

        let (xml, svg) = cut_diagram_xml(&diagram_str).map_err(PssError::DiagramParse)?;
        let diagram = parse_diagram_xml::<PssVertexData>(&xml).map_err(PssError::DiagramParse)?;

        // Map of all datapoints to the cell id they should replace and the alignment
        // of the replacement element.
        let datapoint_nodes = diagram
            .cells
            .into_iter()
            .filter_map(|cell| cell.data.map(|data| (data, cell.id)))
            .filter_map(|(data, id)| {
                data.datapoint.map(|name| {
                    let align = data.align.unwrap_or_else(|| {
                        log::warn!("Datapoint {name} doesn't have an alignment set, using default!");
                        Alignment::default()
                    });

                    (name, (id, align))
                })
            })
            .collect::<HashMap<_, _>>();

        // List of all datapoint names which are defined in the diagram but aren't present
        // in the [`Message::DATAPOINTS`].
        let diagram_extra_datapoints = datapoint_nodes
            .keys()
            .filter(|name| Message::DATAPOINTS.iter().find(|dp| dp.name == name.as_str()).is_none())
            .cloned()
            .collect::<Vec<_>>();

        if !diagram_extra_datapoints.is_empty() {
            return Err(PssError::DiagramUnknownStates(diagram_extra_datapoints));
        }

        // We don't check whether the diagram covers all produced datapoints, as the RFS PSS diagram
        // doesn't contain all the datapoints of the rocket PSS and vice-versa.

        // Final information which is returned about every datapoint. This includes the type of datapoint, to which side its replacement
        // element should be aligned, its name and label, and the cell which should be replaced by the datapoint value in the diagram.
        let datapoint_info = HashMap::from_iter(Message::DATAPOINTS.iter().filter_map(|datapoint| {
            let (cell, align) = datapoint_nodes.get(datapoint.name)?.clone();
            let info = ExtendedDatapointInformation { info: *datapoint, align, cell };
            Some((datapoint.name.to_string(), info))
        }));

        Ok(Self { diagram: svg, datapoint_info })
    }
}
