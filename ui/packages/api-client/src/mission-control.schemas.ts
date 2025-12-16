export interface Info {
  /** Default scenario from current configuration file */
  default_scenario: string;
  /** Git version of the mission control server */
  version: string;
}

export interface ScenarioInfo {
  /** Identifier of the scenario */
  id: string;
  /** Displayname of the scenario */
  name: string;
}

/**
 * Allowed manual transitions for every state
 */
export type StateMachineManualTransitions = { [key: string]: string[] };

/**
 * Mapping of state names to diagram cell ids
 */
export type StateMachineStateNodes = { [key: string]: string };

/**
 * Representation of a state machine diagram
 */
export interface StateMachine {
  /** State machine diagram svg without the drawio xml content */
  diagram: string;
  /** Initial state of the state machine */
  initialState: string;
  /** Allowed manual transitions for every state */
  manualTransitions: StateMachineManualTransitions;
  /** Mapping of state names to diagram cell ids */
  stateNodes: StateMachineStateNodes;
}

export interface StateMachineInfo {
  /** Identifier of the state machine */
  id: string;
  /** Displayname of the state machine */
  name: string;
}
