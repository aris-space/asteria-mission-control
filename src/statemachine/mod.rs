use std::{fs, path::Path};

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::statemachine::parser::Cell;

mod parser;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
/// Representation of a state machine diagram
pub struct StateMachine {
    /// Cells of the state machine diagram
    pub cells: Vec<Cell>,
    /// Relative width of the state machine diagram
    pub width: u32,
    /// Relative height of the state machine diagram
    pub height: u32,
    /// State machine diagram source svg+xml
    pub diagram: String,
}

impl StateMachine {
    /// Parse the state machine from a file path to a drawio svg+xml file
    pub fn parse_from(state_machine_path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let state_machine_str = fs::read_to_string(state_machine_path)?;

        let diagram_xml = parser::extract_diagram_xml(&state_machine_str)?;
        let (cells, (width, height)) = parser::parse_state_machine_xml(&diagram_xml)?;

        Ok(Self { cells, width, height, diagram: state_machine_str })
    }
}
