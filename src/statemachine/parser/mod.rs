use quick_xml::{Reader, events::Event};
use serde::{Deserialize, Serialize};

use intermediate::{MxFile, RootChild};
use utoipa::ToSchema;

mod intermediate;

#[derive(Serialize, Deserialize, Debug, Default, ToSchema)]
#[serde(rename_all = "lowercase")]
/// Representation of which type a state is
///
/// Every state in the state machine should be of some kind. If not specified explicitly, a state is
/// treated as a "normal" state.
pub enum StateKind {
    /// Every state which is of the failure kind represents a (possibly irrecoverable) failure state
    /// in the state machine
    Failure,
    #[default]
    Normal,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
/// A cell is a generic representation of a drawio diagram cell.
///
/// Every state (vertex) and transition (edge) is guaranteed to be a cell.
/// However, elements of the state machine diagram like the legend are also represented as a [`Cell`]
pub struct Cell {
    /// Identifier of the cell
    pub id: String,
    /// Optional identifier of the parent cell
    pub parent: Option<String>,
    /// Optional content of the cell.
    ///
    /// When available, the content is a html string.
    pub value: Option<String>,
    /// Optional source vertex of an edge. [`None`] if the cell is not a vertex.
    pub source: Option<String>,
    /// Optional target vertex of an edge. [`None`] if the cell is not a vertex.
    pub target: Option<String>,
    /// Boolean whether the cell is an edge between vertices
    pub edge: bool,
    /// Boolean whether the cell is a vertex
    pub vertex: bool,
    /// Optional geometry of the cell
    ///
    /// Theoretically, every vertex should have a geometry
    pub geometry: Option<intermediate::MxGeometry>,
    /// Optional name of the config state which a vertex is representing. [`None`] if the cell is not a vertex.
    ///
    /// The state is read from the `state` drawio data property
    pub state: Option<String>,
    /// State kind of the vertex. [`StateKind::Normal`] if the cell is not a vertex of when the property is not set.
    ///
    /// The state kind is read from the `state-kind` drawio data property
    pub state_kind: StateKind,
}

/// Extract the drawio diagram xml definition from the state machine drawio svg+xml string
pub fn extract_diagram_xml(state_machine_str: &str) -> Result<String, quick_xml::DeError> {
    let mut reader = Reader::from_str(state_machine_str);
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf)? {
            Event::Start(e) if e.name().as_ref() == b"svg" => {
                for attr in e.attributes().flatten() {
                    if attr.key.as_ref() == b"content" {
                        let value = attr.unescape_value()?;
                        return Ok(value.to_string());
                    }
                }
                break;
            }
            Event::Eof => break,
            _ => {}
        }
        buf.clear();
    }

    Err(quick_xml::DeError::Custom(String::from("toplevel svg content attribute not found")))
}

/// Parse a drawio svg+xml string and extract all cells which are of type [`Cell`] from the xml diagram definition
pub fn parse_state_machine_xml(state_machine_str: &str) -> Result<(Vec<Cell>, (u32, u32)), quick_xml::DeError> {
    let file: MxFile = quick_xml::de::from_str(state_machine_str)?;

    let cells = file
        .diagram
        .model
        .root
        .children
        .into_iter()
        .filter_map(|child| match child {
            RootChild::Cell(c) => c.id.map(|id| Cell {
                id,
                parent: c.parent,
                value: c.value,
                edge: c.edge,
                vertex: c.vertex,
                geometry: c.geometry,
                state: None,
                state_kind: StateKind::default(),
                source: c.source,
                target: c.target,
            }),
            RootChild::Object(o) => Some(Cell {
                id: o.id,
                parent: o.cell.parent,
                value: Some(o.label),
                edge: o.cell.edge,
                vertex: o.cell.vertex,
                geometry: o.cell.geometry,
                state: Some(o.state),
                state_kind: o.state_kind,
                source: o.cell.source,
                target: o.cell.target,
            }),
        })
        .collect::<Vec<_>>();

    Ok((cells, (file.diagram.model.width, file.diagram.model.height)))
}
