use intermediate::{MxFile, RootChild};
use quick_xml::{
    Reader, Writer,
    events::{BytesStart, Event},
};
use std::io::Cursor;

mod intermediate;

// allow unused fields for the time until the validity check in `mod.rs` is implemented
#[allow(unused)]
#[derive(Debug)]
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
}

fn parse_svg_root<'a>(start: &BytesStart<'a>) -> Result<(Option<String>, BytesStart<'a>), quick_xml::DeError> {
    let mut attributes = Vec::new();
    let mut content = None;
    for attr in start.attributes().flatten() {
        if attr.key.as_ref() == b"content" {
            let value = attr.unescape_value()?;
            content = Some(value.to_string());
        } else {
            attributes.push(attr);
        }
    }

    let copy = BytesStart::new("svg").with_attributes(attributes);
    Ok((content, copy))
}

/// Extract the drawio diagram xml definition from the state machine drawio svg+xml string
///
/// Returns a tuple containing the extracted drawio diagram xml definition and the state machine
/// svg diagram without the drawio diagram xml definition
pub fn extract_diagram_xml(diagram_str: &str) -> Result<(String, String), quick_xml::DeError> {
    let mut reader = Reader::from_str(diagram_str);
    let mut writer = Writer::new(Cursor::new(Vec::new()));
    let mut buf = Vec::new();

    let mut content = None;

    loop {
        match reader.read_event_into(&mut buf)? {
            Event::Empty(e) if e.name().as_ref() == b"svg" => {
                let (ctnt, copy) = parse_svg_root(&e)?;
                content = content.or(ctnt);
                writer.write_event(Event::Empty(copy)).expect("should be valid since we basically repeat what we read")
            }
            Event::Start(e) if e.name().as_ref() == b"svg" => {
                let (ctnt, copy) = parse_svg_root(&e)?;
                content = content.or(ctnt);
                writer.write_event(Event::Start(copy)).expect("should be valid since we basically repeat what we read");
            }
            Event::Eof => break,
            e => writer.write_event(e).expect("should be valid since we repeat what we read"),
        }
        buf.clear();
    }

    match content {
        None => Err(quick_xml::DeError::Custom(String::from("No svg element with `content` attribute found")))?,
        Some(content) => {
            let diagram_bytes = writer.into_inner().into_inner();
            let diagram = String::from_utf8(diagram_bytes)
                .map_err(|err| quick_xml::DeError::Custom(format!("Diagram copy is not a valid string: {err}")))?;
            Ok((content, diagram))
        }
    }
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
                source: o.cell.source,
                target: o.cell.target,
            }),
        })
        .collect::<Vec<_>>();

    Ok((cells, (file.diagram.model.width, file.diagram.model.height)))
}
