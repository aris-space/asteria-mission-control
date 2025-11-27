export type CellGeometry = null | MxGeometry;

/**
 * Optional identifier of the parent cell
 */
export type CellParent = string | null;

/**
 * Optional source vertex of an edge. [`None`] if the cell is not a vertex.
 */
export type CellSource = string | null;

/**
 * Optional name of the config state which a vertex is representing. [`None`] if the cell is not a vertex.

The state is read from the `state` drawio data property
 */
export type CellState = string | null;

/**
 * Optional target vertex of an edge. [`None`] if the cell is not a vertex.
 */
export type CellTarget = string | null;

/**
 * Optional content of the cell.

When available, the content is a html string.
 */
export type CellValue = string | null;

/**
 * A cell is a generic representation of a drawio diagram cell.

Every state (vertex) and transition (edge) is guaranteed to be a cell.
However, elements of the state machine diagram like the legend are also represented as a [`Cell`]
 */
export interface Cell {
  /** Boolean whether the cell is an edge between vertices */
  edge: boolean;
  geometry?: CellGeometry;
  /** Identifier of the cell */
  id: string;
  /** Optional identifier of the parent cell */
  parent?: CellParent;
  /** Optional source vertex of an edge. [`None`] if the cell is not a vertex. */
  source?: CellSource;
  /** Optional name of the config state which a vertex is representing. [`None`] if the cell is not a vertex.

The state is read from the `state` drawio data property */
  state?: CellState;
  /** State kind of the vertex. [`StateKind::Normal`] if the cell is not a vertex of when the property is not set.

The state kind is read from the `state-kind` drawio data property */
  state_kind: StateKind;
  /** Optional target vertex of an edge. [`None`] if the cell is not a vertex. */
  target?: CellTarget;
  /** Optional content of the cell.

When available, the content is a html string. */
  value?: CellValue;
  /** Boolean whether the cell is a vertex */
  vertex: boolean;
}

export interface Info {
  /** Default scenario from current configuration file */
  default_scenario: string;
  /** Git version of the mission control server */
  version: string;
}

export type MxGeometryHeight = number | null;

export type MxGeometryWidth = number | null;

export type MxGeometryX = number | null;

export type MxGeometryY = number | null;

export interface MxGeometry {
  height?: MxGeometryHeight;
  width?: MxGeometryWidth;
  x?: MxGeometryX;
  y?: MxGeometryY;
}

export interface ScenarioInfo {
  /** Identifier of the scenario */
  id: string;
  /** Displayname of the scenario */
  name: string;
}

/**
 * Representation of which type a state is

Every state in the state machine should be of some kind. If not specified explicitly, a state is
treated as a "normal" state.
 */
export type StateKind = (typeof StateKind)[keyof typeof StateKind];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const StateKind = {
  failure: "failure",
  normal: "normal",
} as const;

/**
 * Representation of a state machine diagram
 */
export interface StateMachine {
  /** Cells of the state machine diagram */
  cells: Cell[];
  /** State machine diagram source svg+xml */
  diagram: string;
  /**
   * Relative height of the state machine diagram
   * @minimum 0
   */
  height: number;
  /**
   * Relative width of the state machine diagram
   * @minimum 0
   */
  width: number;
}

export interface StateMachineInfo {
  /** Identifier of the state machine */
  id: string;
  /** Displayname of the state machine */
  name: string;
}
