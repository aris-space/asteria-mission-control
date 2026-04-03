export type ActuatorKind =
  | {
      kind: "digital";
    }
  | {
      kind: "dpr";
    }
  | {
      kind: "fractional";
    };

/**
 * Represents the current state of an actuator as detected by a board.

## Notes
Detection of actuator presence is only possible before power is applied to the actuator.
Once powered, actuator detection is no longer possible.
 */
export type ActuatorStatus =
  (typeof ActuatorStatus)[keyof typeof ActuatorStatus];

export const ActuatorStatus = {
  notConnected: "notConnected",
  connected: "connected",
  powerOn: "powerOn",
} as const;

export type Alignment = (typeof Alignment)[keyof typeof Alignment];

export const Alignment = {
  left: "left",
  right: "right",
} as const;

/**
 * Represents the current arming state of the subsystem
 */
export type ArmingState = (typeof ArmingState)[keyof typeof ArmingState];

export const ArmingState = {
  safe: "safe",
  armed: "armed",
} as const;

/**
 *
Is `NAN` by default.
A pressure in bar relative to atmospheric pressure (`barg`).
 */
export type BarG = number;

/**
 * The ID of a board in the rocket.
 */
export type BoardId = (typeof BoardId)[keyof typeof BoardId];

export const BoardId = {
  flightComputer: "flightComputer",
  rfsComputer: "rfsComputer",
  sensorCarrier: "sensorCarrier",
  communicationBoard: "communicationBoard",
  engineControlBoard: "engineControlBoard",
  powerBoard: "powerBoard",
  recoveryBoard: "recoveryBoard",
  fuelControlBoard: "fuelControlBoard",
  oxidizerControlBoard: "oxidizerControlBoard",
} as const;

/**
 * Shared firmware build information used by all boards.
 */
export interface BuildInformationCommon {
  /** Initials of the person who compiled the firmware, or `\0\0` if not set. */
  authorInitials: number[];
  /** CAN library version information (major, minor, patch). */
  canSemver: number[];
  /** Firmware version information. */
  commitHash: number[];
  /** Whether the build includes debugging defmt over RTT. */
  debugDefmtRtt: boolean;
  /** Indicates if the git repository was dirty at build time. */
  isGitDirty: boolean;
  /** Whether the build is a release build. */
  isRelease: boolean;
  /**
     * Unix timestamp when the build was compiled, provided in seconds since
  the Unix epoch `(1970-01-01 00:00:00 UTC)`. While this is a 32-bit integer,
  overflow is not a concern as we don't intend to use this code up to 2038.
     * @minimum 0
     */
  unixTimestamp: number;
}

export interface CameraPowerStatus {
  /** Whether the livestream camera(s) should be powered on (true=on, false=off). */
  livePwrEnabled: boolean;
  /** Whether the recording camera(s) should be powered on (true=on, false=off). */
  recordingPwrEnabled: boolean;
}

/**
 *
Is `NAN` by default.
A temperature in degrees Celsius.
 */
export type Celsius = number;

export type DPRValve =
  | {
      /** Enabled with pressure setpoint in Barg. 0-60. */
      enabled: {
        /** 0-60 barg */
        setpoint: number;
      };
    }
  | "disabled";

export type SensorKind =
  | {
      kind: "analog";
      value: {
        unit: string;
      };
    }
  | {
      kind: "digital";
    };

export type DatapointKind =
  | (ActuatorKind & {
      component: "actuator";
    })
  | (SensorKind & {
      component: "sensor";
    });

/**
 * Compile time information about a PSS datapoint
 */
export interface DatapointInformation {
  /** Kind of the datapoint (e.g. DPR actuator, digital sensor, ...) */
  kind: DatapointKind;
  /** User-facing label of the datapoint */
  label: string;
  /** Unique name of the datapoint */
  name: string;
}

export interface EngineBayTemperature {
  /** Oxidizer Runline temperature in °C. */
  ossRnlT: Celsius;
  /** Oxidizer Tank Bottom temperature in °C. */
  ossTnkT: Celsius;
}

export interface StatusCommonMessage {
  /**
   * Number of errors encountered since startup.
   * @minimum 0
   */
  errors: number;
  /**
   * Number of microseconds since the last board restart.
   * @minimum 0
   */
  microsSinceRestart: number;
}

/**
 * Enum representing the status of a sensor.
 */
export type SensorStatus = (typeof SensorStatus)[keyof typeof SensorStatus];

export const SensorStatus = {
  offline: "offline",
  online: "online",
} as const;

export interface EngineControlBoardStatus {
  /** `Armed` if the engine is armed and the main valves receive power, ie engine arming Pin is pulled */
  armed: ArmingState;
  common: StatusCommonMessage;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
  /**
   * Hash of the Thrust Curve used for this flight. Defined by
   * @minimum 0
   */
  thrustCurveHash: number;
}

/**
 * Enum representing the state of a valve.
 */
export type ValveState = (typeof ValveState)[keyof typeof ValveState];

export const ValveState = {
  active: "active",
  inactive: "inactive",
} as const;

export interface EngineControlBoardValveStates {
  /** Fuel Main Valve state */
  fssMnlVlv: ValveState;
  /** Oxidizer Main Valve state */
  ossMnlVlv: ValveState;
}

export interface EnginePressure {
  /** Engine Chamber pressure in barg. */
  engCcP: BarG;
  /** Injector Fuel pressure in barg. */
  fssInjP: BarG;
  /** Injector Oxidizer pressure in barg. */
  ossInjP: BarG;
}

export type EngineControlBoardMessage =
  | {
      /** # `EngineControlBoardBuildInfo`
  Firmware build metadata emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Engine Control Board firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `EngineControlBoardStatus`
  Periodic status message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Engine Control Board.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: EngineControlBoardStatus;
      type: "BoardStatus";
    }
  | {
      /** # `EngineControlBoardValveStates`
  Periodic status message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Valve State of all Valves controlled by the Engine Control Board.
  This includes the Oxidizer Main and Fuel Main Valve.
  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: EngineControlBoardValveStates;
      type: "ValveStates";
    }
  | {
      /** # `EnginePressure`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports various Pressures from the Engine.
  This includes the Combustion Chamber Pressure, Injector Fuel Pressure and Injector Oxidizer Pressure.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from analog Trafag pressure sensors installed on the engine. They range from 0 to 60 barg
  The value will be `NaN` if reading the sensor fails. */
      content: EnginePressure;
      type: "EnginePressure";
    }
  | {
      /** # `EngineBayTemperature`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 10 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports various Data from Thermocouples in the Engine Bay.
  This includes the OSS Runline Temperature and the OSS Tank Bottom Temperature.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from high precision ADCs which read the differential thermocouple voltage together with a thermistor from which the temperature is calculated.
  Thermocouples installed can be either Type K or Type T.
  If the value read in firmware is outside the specific temperature range of [-200.0, 200.0] °C,
  the value will be set to `NaN`. */
      content: EngineBayTemperature;
      type: "EngineBayTemperature";
    }
  | {
      type: "FiringAborted";
    }
  | {
      type: "FiringCompleted";
    }
  | {
      type: "FiringInitiated";
    }
  | {
      type: "IgnitionDetected";
    }
  | {
      type: "CombustionDetected";
    }
  | {
      type: "FiringAbortInitiation";
    }
  | {
      type: "FiringInitiation";
    }
  | {
      /** # `OxidizerMainControlFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to control the Oxidizer Main Valve

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Oxidizer Main valve to be active or inactive.

  ## Reaction
  The Engine Control Board shall change the Oxidizer Main Valve position accordingly
  ## Note
  The Engine Control Board might also change the valve position without input from this message, during the firing sequence
  The Valve is Normally Closed */
      content: ValveState;
      type: "OxidizerMainControlFC";
    }
  | {
      /** # `OxidizerMainControlRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS to control the Oxidizer Main Valve

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Oxidizer Main valve to be active or inactive.

  ## Reaction
  The Engine Control Board shall change the Oxidizer Main Valve position accordingly
  ## Note
  The Engine Control Board might also change the valve position without input from this message, during the firing sequence
  The Valve is Normally Closed */
      content: ValveState;
      type: "OxidizerMainControlRFS";
    }
  | {
      /** # `FuelMainControlFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to control the Fuel Main Valve

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Fuel Main valve to be active or inactive.

  ## Reaction
  The Engine Control Board shall change the Fuel Main Valve position accordingly.
  ## Note
  The Engine Control Board might also change the valve position without input from this message, during the firing sequence
  The Valve is Normally Closed */
      content: ValveState;
      type: "FuelMainControlFC";
    }
  | {
      /** # `FuelMainControlRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS to control the Fuel Main Valve

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Fuel Main valve to be active or inactive.

  ## Reaction
  The Engine Control Board shall change the Fuel Main Valve position accordingly.
  ## Note
  The Engine Control Board might also change the valve position without input from this message, during the firing sequence
  The Valve is Normally Closed */
      content: ValveState;
      type: "FuelMainControlRFS";
    };

/**
 *
Is `NAN` by default.
Atmospheric pressure in hPa.
 */
export type HPa = number;

export interface EnvironmentalData {
  /** Relative humidity in percent (0–100%). */
  humidity: number;
  /** Atmospheric pressure in hPa.

  **Note:** This data may differ from the `PressureData` message, which reports data
  at a much higher rate and with less filtering to improve timeliness.
  This data point should only be used for low-frequency applications. */
  pressure: HPa;
  /** Temperature in Celsius. */
  temperature: Celsius;
}

export type ExtendedDatapointInformation = DatapointInformation & {
  /** Alignment of the replacement element. */
  align: Alignment;
  /** Id of the diagram cell which should be replaced by the
  replacement element. */
  cell: string;
};

export interface FlightComputerStatus {
  common: StatusCommonMessage;
  /** `true` if the flight computer asserts control over the PSS valves via CAN.
  In other words, if passive mode is disabled. */
  hasPssControl: boolean;
  /** `Armed` if the flight computer is in the `Armed` state for launch,
  which enables REC actuator power and allows an ignition command. */
  isSoftwareArmed: ArmingState;
}

/**
 * Shared state machine state used by the FC and RFSC.
 */
export interface StateMachineState {
  /**
     * The index in the state path where we are currently at.
  This equals the number of transitions that have occured.
     * @minimum 0
     */
  pathIndex: number;
  /** The name of the current state in zero-padded utf-8. */
  state: number[];
}

/**
 * Shared manual state transition used by the FC and RFSC.
 */
export interface ManualStateTransition {
  /** The name of the state to which the state machine should transition. */
  state: number[];
  /**
   * The index in the state path where the new state should end up at.
   * @minimum 0
   */
  transitionIndex: number;
}

/**
 * Shared manual actuator change used by the FC and RFSC.
 */
export interface ManualActuatorChange {
  /** The name of the actuator whose value should be changed. */
  actuator: number[];
  /**
     * The index in the state path where the current state is.
  For the initial state this is 0 and increments with every transition.
     * @minimum 0
     */
  pathIndex: number;
  /** The target value of the actuator.
  This depends on the actuator type, for valves 0.0 is fully closed
  and 1.0 is fully open. */
  value: number;
}

export type FlightComputerMessage =
  | {
      /** # `FlightComputerBuildInfo`
  Firmware build metadata emitted by the Flight Computer.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Flight Computer firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `FlightComputerStatus`
  Periodic status message emitted by the Flight Computer.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health and status of the Flight Computer.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks.
  It is also used to only arm the RFS if the FC is armed and ensure exclusive PSS control. */
      content: FlightComputerStatus;
      type: "Status";
    }
  | {
      /** The current state of the flight computer state machine. */
      content: StateMachineState;
      type: "StateMachineState";
    }
  | {
      /** Command a manual state transition on the FC.
  The state machine will perform the state transition and emit a state change event. */
      content: ManualStateTransition;
      type: "ManualStateTransition";
    }
  | {
      /** Command a specific actuator to move to a specific target position.
  The actuator name and the semantics of the value are defined using
  an `#[pss(name = "...", kind  = "...")]` attribute from the [`data_core::pss::Data`]
  macro.

  Upon change, an "actuator states" message will be emitted. */
      content: ManualActuatorChange;
      type: "ManualActuatorChange";
    };

export interface FuelControlBoardStatus {
  common: StatusCommonMessage;
  /** State of the Keller BUS used to read pressure, indicates whether a single sensor is online or not. */
  pressureBus: SensorStatus;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
}

export interface FuelControlBoardValveStates {
  /** Fuel DPR Control loop state */
  fssDpr: DPRValve;
  /** Fuel Vent Valve state */
  fssVntVlv: ValveState;
  /** Pressurization Valve state */
  przVntVlv: ValveState;
}

/**
 * Pressurization Proportional Gain in [barg/ms]
opening_time = kp * (target_pressure - current_pressure), in milliseconds
 */
export type PressurizationGain = number;

export type FueldControlBoardMessage =
  | {
      /** # `FuelControlBoardBuildInfo`
  Firmware build metadata emitted by the Fuel Control Board.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Fuel Control Board firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `FuelControlBoardStatus`
  Periodic status message emitted by the Fuel Control Board.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Fuel Control Board, including sensor.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: FuelControlBoardStatus;
      type: "BoardStatus";
    }
  | {
      /** # `FuelControlBoardValveStates`
  Periodic status message emitted by the Fuel Control Board.

  ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Valve State of all Valves controlled by the Fuel Control Board, including the DPR control loop state and setpoint.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: FuelControlBoardValveStates;
      type: "ValveStates";
    }
  | {
      type: "FuelPressurizationCompleted";
    }
  | {
      /** # `FuelPressurization`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to initiate pressurization on the FuelControlBoard

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Pressurize the Fuel Tank to a desired setpoint

  ## Reaction
   */
      content: BarG;
      type: "FuelPressurization";
    }
  | {
      /** # `FuelPressurizationGain`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to configure the pressurization gain on the FuelControlBoard

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Configure the Fuel Pressurization Gain

  ## Reaction
   */
      content: PressurizationGain;
      type: "FuelPressurizationGain";
    }
  | {
      type: "FuelPressurizationAbort";
    }
  | {
      /** # `FuelDprConfigFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Set ETH Pressure Regulator configuration
  Configures whether the control loop should be active, and what reference point (setpoint) it should assume.

  ## Reaction
  The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "FuelDprConfigFC";
    }
  | {
      /** # `PressurizationVentControlFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the N2 Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust N2 Vent Valve state accordingly */
      content: ValveState;
      type: "PressurizationVentControlFC";
    }
  | {
      /** # `FuelVentControlFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the Fuel Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly */
      content: ValveState;
      type: "FuelVentControlFC";
    }
  | {
      /** # `FuelDprConfigECU`
  Event message sent by the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Set ETH Pressure Regulator configuration
  Configures whether the control loop should be active, and what reference point (setpoint) it should assume.

  ## Reaction
  The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "FuelDprConfigECU";
    }
  | {
      /** # `PressurizationVentControlECU`
  Event message sent by the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the N2 Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust N2 Vent Valve state accordingly */
      content: ValveState;
      type: "PressurizationVentControlECU";
    }
  | {
      /** # `FuelVentControlECU`
  Event message sent by the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the Fuel Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly */
      content: ValveState;
      type: "FuelVentControlECU";
    }
  | {
      /** # `FuelDprConfigRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Set ETH Pressure Regulator configuration

  ## Reaction
  The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "FuelDprConfigRFS";
    }
  | {
      /** # `PressurizationVentControlRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the N2 Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust N2 Vent Valve state accordingly */
      content: ValveState;
      type: "PressurizationVentControlRFS";
    }
  | {
      /** # `FuelVentControlRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the Fuel Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly */
      content: ValveState;
      type: "FuelVentControlRFS";
    };

/**
 * MAVLink enum `MAV_AUTOPILOT` for `minimal` dialect.

Micro air vehicle / autopilot classes. This identifies the individual model.
 */
export type MavAutopilot = (typeof MavAutopilot)[keyof typeof MavAutopilot];

export const MavAutopilot = {
  generic: "generic",
  reserved: "reserved",
  slugs: "slugs",
  ardupilotmega: "ardupilotmega",
  openpilot: "openpilot",
  genericWaypointsOnly: "genericWaypointsOnly",
  genericWaypointsAndSimpleNavigationOnly:
    "genericWaypointsAndSimpleNavigationOnly",
  genericMissionFull: "genericMissionFull",
  invalid: "invalid",
  ppz: "ppz",
  udb: "udb",
  fp: "fp",
  px4: "px4",
  smaccmpilot: "smaccmpilot",
  autoquad: "autoquad",
  armazila: "armazila",
  aerob: "aerob",
  asluav: "asluav",
  smartap: "smartap",
  airrails: "airrails",
  reflex: "reflex",
} as const;

/**
 * MAVLink enum `MAV_STATE` for `minimal` dialect.
 */
export type MavState = (typeof MavState)[keyof typeof MavState];

export const MavState = {
  uninit: "uninit",
  boot: "boot",
  calibrating: "calibrating",
  standby: "standby",
  active: "active",
  critical: "critical",
  emergency: "emergency",
  poweroff: "poweroff",
  flightTermination: "flightTermination",
} as const;

/**
 * MAVLink enum `MAV_TYPE` for `minimal` dialect.

MAVLINK component type reported in HEARTBEAT message. Flight controllers must report
the type of the vehicle on which they are mounted (e.g. MAV_TYPE_OCTOROTOR). All
other components must report a value appropriate for their type (e.g. a camera must
use MAV_TYPE_CAMERA).
 */
export type MavType = (typeof MavType)[keyof typeof MavType];

export const MavType = {
  generic: "generic",
  fixedWing: "fixedWing",
  quadrotor: "quadrotor",
  coaxial: "coaxial",
  helicopter: "helicopter",
  antennaTracker: "antennaTracker",
  gcs: "gcs",
  airship: "airship",
  freeBalloon: "freeBalloon",
  rocket: "rocket",
  groundRover: "groundRover",
  surfaceBoat: "surfaceBoat",
  submarine: "submarine",
  hexarotor: "hexarotor",
  octorotor: "octorotor",
  tricopter: "tricopter",
  flappingWing: "flappingWing",
  kite: "kite",
  onboardController: "onboardController",
  vtolTailsitterDuorotor: "vtolTailsitterDuorotor",
  vtolTailsitterQuadrotor: "vtolTailsitterQuadrotor",
  vtolTiltrotor: "vtolTiltrotor",
  vtolFixedrotor: "vtolFixedrotor",
  vtolTailsitter: "vtolTailsitter",
  vtolTiltwing: "vtolTiltwing",
  vtolReserved5: "vtolReserved5",
  gimbal: "gimbal",
  adsb: "adsb",
  parafoil: "parafoil",
  dodecarotor: "dodecarotor",
  camera: "camera",
  chargingStation: "chargingStation",
  flarm: "flarm",
  servo: "servo",
  odid: "odid",
  decarotor: "decarotor",
  battery: "battery",
  parachute: "parachute",
  log: "log",
  osd: "osd",
  imu: "imu",
  gps: "gps",
  winch: "winch",
  genericMultirotor: "genericMultirotor",
  illuminator: "illuminator",
  spacecraftOrbiter: "spacecraftOrbiter",
  groundQuadruped: "groundQuadruped",
  vtolGyrodyne: "vtolGyrodyne",
} as const;

/**
 * Heartbeat payload of mavlink minimal.
 */
export interface Heartbeat {
  /** MAVLink field `autopilot`.

  Autopilot type / class. Use MAV_AUTOPILOT_INVALID for components that are not flight
  controllers. */
  autopilot: MavAutopilot;
  /**
     * MAVLink field `base_mode`.

  System mode bitmap.
     * @minimum 0
     */
  baseMode: number;
  /**
     * MAVLink field `custom_mode`.

  A bitfield for use for autopilot-specific flags
     * @minimum 0
     */
  customMode: number;
  /**
     * MAVLink field `mavlink_version`.

  MAVLink version, not writable by user, gets added by protocol because of magic data
  type: uint8_t_mavlink_version
     * @minimum 0
     */
  mavlinkVersion: number;
  /** MAVLink field `system_status`.

  System status flag. */
  systemStatus: MavState;
  /** MAVLink field `type`.

  Vehicle or component type. For a flight controller component the vehicle type (quadrotor,
  helicopter, etc.). For other components the component type (e.g. camera, gimbal,
  etc.). This should be used in preference to component id for identifying the component
  type. */
  type: MavType;
}

export interface ImuData {
  /** Acceleration along Down axis in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationDown: number;
  /** Acceleration along East axis in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationEast: number;
  /** Acceleration along North axis in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationNorth: number;
  /** Acceleration along body X-axis (forward) in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationX: number;
  /** Acceleration along body Y-axis (right) in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationY: number;
  /** Acceleration along body Z-axis (down) in m/s². Range: ±78.48 m/s² (±8g) */
  accelerationZ: number;
  /** Angular velocity around Down axis in °/s. Range: ±2000 °/s */
  angularVelocityDown: number;
  /** Angular velocity around East axis in °/s. Range: ±2000 °/s */
  angularVelocityEast: number;
  /** Angular velocity around North axis in °/s. Range: ±2000 °/s */
  angularVelocityNorth: number;
  /** Angular velocity around body X-axis in °/s. Range: ±2000 °/s */
  angularVelocityX: number;
  /** Angular velocity around body Y-axis in °/s. Range: ±2000 °/s */
  angularVelocityY: number;
  /** Angular velocity around body Z-axis in °/s. Range: ±2000 °/s */
  angularVelocityZ: number;
}

export interface Info {
  /** Default scenario from current configuration file. */
  default_scenario: string;
  /** Git version of the mission control server. */
  version: string;
}

/**
 * UTC timestamp given in microseconds since the Unix epoch (`1970-01-01T00:00:00Z`).
 * @minimum 0
 */
export type InstantUs = number;

export interface MagnetometerData {
  /** Magnetic field along Down axis in μT. Range: ±4915.2 μT */
  magneticFieldDown: number;
  /** Magnetic field along East axis in μT. Range: ±4915.2 μT */
  magneticFieldEast: number;
  /** Magnetic field along North axis in μT. Range: ±4915.2 μT */
  magneticFieldNorth: number;
  /** Magnetic field along body X-axis (forward) in μT. Range: ±4915.2 μT */
  magneticFieldX: number;
  /** Magnetic field along body Y-axis (right) in μT. Range: ±4915.2 μT */
  magneticFieldY: number;
  /** Magnetic field along body Z-axis (down) in μT. Range: ±4915.2 μT */
  magneticFieldZ: number;
}

export interface RfsComputerStatus {
  common: StatusCommonMessage;
  /** `true` if the remote filling station asserts control over the PSS valves via CAN.
  In other words, if passive mode is disabled. */
  hasPssControl: boolean;
  /** `Armed` if the remote filling station is in a `Armed` state for ignition
  This is a software arming state of the RFS state machine that is part of the RFS hardware arming */
  isIgnitionArmed: ArmingState;
}

export interface RfsComputerValveStates {
  /** The current active state of the normally closed GOX igniter valve. */
  goxIgnVlv: ValveState;
  /** The current active state of the normally closed GOX purge valve. */
  goxPrgVlv: ValveState;
  /** The current active state of the normally closed H2 igniter valve. */
  h2IgnVlv: ValveState;
  /** The current active state of the normally closed H2 purge valve. */
  h2PrgVlv: ValveState;
  /** The current active state of the normally off spark plug. */
  ignSpkPlg: ValveState;
}

export type RfsComputerMessage =
  | {
      /** # `RfsComputerBuildInfo`
  Firmware build metadata emitted by the RFS Computer.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `RfsComputer`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the RFS Computer firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `RfsComputerStatus`
  Periodic status message emitted by the RFS Computer.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `RfsComputer`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health and status of the RFS Computer.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks.
  It is also used to only ingite if the RFS is armed and ensure exclusive PSS control. */
      content: RfsComputerStatus;
      type: "Status";
    }
  | {
      /** # `RfsComputerValveStates`
  Periodic status message emitted by the Remote Filling Station Computer.

  ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `RfsComputer`
  - **Received by:** `EngineControlBoard` (mainly)

  ## Purpose
  Communicates the actuator state of the actuators in the Remote Filling Station controllable via CAN.
  This includes the ingiter valves and the spark plug.
  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: RfsComputerValveStates;
      type: "ValveStates";
    }
  | {
      /** # `GoxIgniterValveControl`
  Controls the GOX igniter valve on the RFS from the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `RemoteFillingStation`

  ## Purpose
  This is needed during the ignition sequence where the engine control board controls the igniter
  and thus needs to open and close valves.

  ## Reaction
  The remote filling station shall adjust the GOX igniter valve state accordingly. */
      content: ValveState;
      type: "GoxIgniterValveControl";
    }
  | {
      /** # `H2IgniterValveControl`
  Controls the H2 igniter valve on the RFS from the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `RemoteFillingStation`

  ## Purpose
  This is needed during the ignition sequence where the engine control board controls the igniter
  and thus needs to open and close valves.

  ## Reaction
  The remote filling station shall adjust the H2 igniter valve state accordingly. */
      content: ValveState;
      type: "H2IgniterValveControl";
    }
  | {
      /** # `IgniterSparkPlugControl`
  Controls the igniter spark plug on the RFS from the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `RemoteFillingStation`

  ## Purpose
  This is needed during the ignition sequence where the engine control board controls the igniter
  and thus needs to open and close valves and activate the spark plug.

  ## Reaction
  The remote filling station shall adjust spark plug state accordingly. */
      content: ValveState;
      type: "IgniterSparkPlugControl";
    }
  | {
      /** # `IgniterPurgeControl`
  Controls the GOX and H2 purge valves on the RFS from the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `RemoteFillingStation`

  ## Purpose
  This is needed during the ignition sequence where the engine control board controls the ignition
  and thus needs to open and close valves.

  ## Reaction
  The remote filling station shall adjust the GOX and H2 purge valve state accordingly. */
      content: ValveState;
      type: "IgniterPurgeControl";
    }
  | {
      /** Command a manual state transition on the RFSC.
  The state machine will perform the state transition and emit a state change event. */
      content: ManualStateTransition;
      type: "ManualStateTransition";
    }
  | {
      /** Command a specific actuator to move to a specific target position.
  The actuator name and the semantics of the value are defined using
  an `#[pss(name = "...", kind  = "...")]` attribute from the [`data_core::pss::Data`]
  macro.

  Upon change, an "actuator states" message will be emitted. */
      content: ManualActuatorChange;
      type: "ManualActuatorChange";
    };

export type SystemManagementMessage =
  | {
      /** Sends a mavlink compatible Heartbeat message. */
      content: Heartbeat;
      type: "Heartbeat";
    }
  | {
      /** # `UTCTimeUpdate`
  Synchronizes system time using GPS-derived UTC.

  This value is derived from the GPS time sensors and is therefore highly accurate.

  ## Type
  - `Periodic @ 10 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `All nodes`

  ## Purpose
  Ensures consistent timekeeping across all nodes using GPS as a source of truth.

  ## Reaction
  Boards shall update their internal time reference used for logging and
  time-sensitive operations *once at startup*. While this value could in theory
  be used to correct for drift, this may result in non-monotonic timekeeping
  and is therefore discouraged. */
      content: InstantUs;
      type: "UTCTimeUpdate";
    }
  | {
      /** # `ResetSpecific`
  Instructs a specific board to reset.

  ## Type
  - `Event`: triggered by user command or fault condition

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** All nodes except `FlightComputer` and `RfsComputer`

  ## Purpose
  Allows targeted recovery or restart of a malfunctioning board.

  ## Reaction
  The addressed board performs an immediate reset. Others shall ignore the message. */
      content: BoardId;
      type: "ResetSpecific";
    }
  | {
      type: "ResetAll";
    };

/**
 * Represents the current state of a watchdog timer.
 */
export type WatchdogState = (typeof WatchdogState)[keyof typeof WatchdogState];

export const WatchdogState = {
  disabled: "disabled",
  active: "active",
  expired: "expired",
} as const;

export interface RecoveryBoardStatus {
  /** `Armed` if the Recovery board is armed and the recovery actuators receive power, ie recovery arming Pin is pulled */
  armingState: ArmingState;
  common: StatusCommonMessage;
  /** Detected state of deployment actuator 1. */
  depl1Status: ActuatorStatus;
  /** Detected state of deployment actuator 2. */
  depl2Status: ActuatorStatus;
  /** Detected state of separation actuator 1. */
  sep1Status: ActuatorStatus;
  /** Detected state of separation actuator 2. */
  sep2Status: ActuatorStatus;
  /** General steering actuator state as observed from detection circuitry. */
  steeringGeneral: ActuatorStatus;
  /** True if left steering motor has correctly responded to ping.
  Will be false until the steering servos have power */
  steeringLeftConnected: boolean;
  /** True if right steering motor has correctly responded to ping.
  Will be false until the steering servos have power */
  steeringRightConnected: boolean;
  /** Current state of the steering watchdog. */
  steeringWatchdogStatus: WatchdogState;
}

export interface SteeringPositions {
  /** Current position of the left steering motor in steps (4096 steps = 1 revolution) from the
  startup position (0). */
  leftPos: number;
  /** Current position of the right steering motor in steps (4096 steps = 1 revolution) from the
  startup position (0). */
  rightPos: number;
}

export interface RecoveryPowerConfig {
  /** Whether power to the deployment actuators should be enabled. Physically,
  actuator power is only provided after hardware electrical arming of the system. */
  deploymentEnabled: boolean;
  /** Whether power to the separation actuators should be enabled. Physically,
  actuator power is only provided after hardware electrical arming of the system. */
  separationEnabled: boolean;
  /** Whether power to the steering actuators should be enabled.
  Steering power is not affected by arming. */
  steeringEnabled: boolean;
}

export type RecoveryBoardMessage =
  | {
      /** # `RecoveryBoardBuildInfo`
  Firmware build metadata emitted by the Recovery Board.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `RecoveryBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Recovery Board firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `RecoveryBoardStatus`
  Periodic status message emitted by the Recovery Board.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `RecoveryBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Recovery Board, including actuator and steering diagnostics.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: RecoveryBoardStatus;
      type: "BoardStatus";
    }
  | {
      /** # `SteeringActualPositions`
  Periodic event message emitted by the Recovery Board.

  ## Type
  - `Periodic @ 10 Hz`, but only during active steering phase

  ## Direction
  - **Emitted by:** `RecoveryBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Returns the actual motor positions of the left and right steering actuators for monitoring or logging.

  ## Reaction
  No action required. */
      content: SteeringPositions;
      type: "SteeringActualPositions";
    }
  | {
      type: "SeparationOccurred";
    }
  | {
      type: "DeploymentOccurred";
    }
  | {
      /** # `SteeringTargetPositions`
  Periodic event message emitted by the Flight Computer.

  ## Type
  - `Periodic @ 10 Hz`, but only during active steering phase

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `RecoveryBoard`

  ## Purpose
  Sets motor target positions for the steering servos.

  ## Reaction
  The first received message starts the `RecoveryBoard` watchdog, which expects frequent
  steering target position messages until deactivation.

  When this message is received, the `RecoveryBoard` shall set the target positions for the left and
  right steering motors to the values indicated by `left_pos` and `right_pos` respectively. */
      content: SteeringPositions;
      type: "SteeringTargetPositions";
    }
  | {
      /** # `RecoveryPowerConfig`
  Event message sent by the Flight Computer.

  ## Type
  - `Event`: sent by the Flight Computer to change the actuator power state

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `RecoveryBoard`

  ## Purpose
  Configures the power state for all Recovery Board actuators.

  ## Reaction
  The Recovery Board shall switch power to the actuators as specified in the message. */
      content: RecoveryPowerConfig;
      type: "RecoveryPowerConfig";
    }
  | {
      type: "SeparationTrigger";
    }
  | {
      type: "DeploymentTrigger";
    };

/**
 * Shared rail status structure for both 5V and 24V power rails.
 */
export interface RailStatus {
  /** Current in amps. */
  current: number;
  /** Power in watts. */
  power: number;
  /** Voltage in volts. */
  voltage: number;
}

export type PowerBoardMessage =
  | {
      /** # `PowerBoardBuildInfo`
  Firmware build metadata emitted by the Power Board.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `PowerBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Power Board firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `PowerBoardStatus`
  Periodic status message emitted by the Power Board.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `PowerBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Power Board.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: StatusCommonMessage;
      type: "BoardStatus";
    }
  | {
      /** # `RailStatus5V`
  Periodic telemetry message reporting the 5V rail parameters.

  ## Type
  - Periodic @ 10Hz

  ## Direction
  - **Emitted by:** `PowerBoard`
  - **Received by:** unspecified

  ## Purpose
  Reports the measured voltage, current, and power on the 5V power rail.

  ## Reaction
  Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range. */
      content: RailStatus;
      type: "RailStatus5V";
    }
  | {
      /** # `RailStatus24V`
  Periodic telemetry message reporting the 24V rail parameters.

  ## Type
  - Periodic @ 10Hz

  ## Direction
  - **Emitted by:** `PowerBoard`
  - **Received by:** unspecified

  ## Purpose
  Reports the measured voltage, current, and power on the 24V power rail.

  ## Reaction
  Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range. */
      content: RailStatus;
      type: "RailStatus24V";
    }
  | {
      /** # `CameraPowerControl`
  Controls the camera power lines.

  ## Type
  - `Event`: triggered to toggle camera power outputs

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `PowerBoard`

  ## Purpose
  Allows remote enabling/disabling of camera recording and live feed.

  ## Reaction
  The Power Board sets the respective output pins according to the fields. */
      content: CameraPowerStatus;
      type: "CameraPowerControl";
    }
  | {
      /** # `CameraPowerStatus`
  Periodic camera power status message emitted by the Power Board.

  ## Type
  - `Periodic @ 5 Hz`, and instantly when the status changes.

  ## Direction
  - **Emitted by:** `PowerBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates what the power state of the cameras should be as set by the power board.

  ## Reaction
  No action required. */
      content: CameraPowerStatus;
      type: "CameraPowerStatus";
    };

/**
 * Represents the online/offline status of all sensors on the Sensor Carrier board.
Each field corresponds to a specific sensor instance.
 */
export interface SensorsHealth {
  /** Status of barometer on I2C2 (bus 1: PA9 = SCL, PA8 = SDA) */
  barometerBus1: SensorStatus;
  /** Status of barometer on I2C3 (bus 2: PC8 = SCL, PC9 = SDA) */
  barometerBus2: SensorStatus;
  /** Status of `SHT4x` temperature/humidity sensor on I2C2 (bus 1) */
  dhtBus1: SensorStatus;
  /** Status of `SHT4x` temperature/humidity sensor on I2C3 (bus 2) */
  dhtBus2: SensorStatus;
  /** Status of GPS module on USART1 (PC5 = TX, PC4 = RX) */
  gps1: SensorStatus;
  /** Status of GPS module on USART3 (PC11 = TX, PC10 = RX) */
  gps2: SensorStatus;
  /** Status of IMU (LSM6DSO32) on SPI3 (PB3–PB6, INT on PC13) */
  imu1: SensorStatus;
  /** Status of IMU (LSM6DSO32) on SPI1 (PA4–PA7, INT on PC14) */
  imu2: SensorStatus;
  /** Status of magnetometer on I2C2 (bus 1), INT on PA0 */
  magnetometerBus1: SensorStatus;
  /** Status of magnetometer on I2C3 (bus 2), INT on PA1 */
  magnetometerBus2: SensorStatus;
}

export interface SensorCarrierStatus {
  common: StatusCommonMessage;
  sensorHealth: SensorsHealth;
}

export interface PositionData {
  /** Estimated horizontal position uncertainty (1-sigma) in meters. */
  horizontalAccuracy: number;
  /** Height above mean sea level in meters. */
  locationHamsl: number;
  /** Latitude in degrees (WGS84). Range: -90.0° to +90.0° */
  locationLatitude: number;
  /** Longitude in degrees (WGS84). Range: -180.0° to +180.0° */
  locationLongitude: number;
  /** Estimated vertical position uncertainty (1-sigma) in meters. */
  verticalAccuracy: number;
}

export interface VelocityData {
  /** Velocity along Down axis in m/s. Range: ±500 m/s */
  velocityDown: number;
  /** Velocity along East axis in m/s. Range: ±500 m/s */
  velocityEast: number;
  /** Velocity along North axis in m/s. Range: ±500 m/s */
  velocityNorth: number;
  /** Velocity along body X-axis (forward) in m/s. Range: ±500 m/s */
  velocityX: number;
  /** Velocity along body Y-axis (right) in m/s. Range: ±500 m/s */
  velocityY: number;
  /** Velocity along body Z-axis (down) in m/s. Range: ±500 m/s */
  velocityZ: number;
}

export interface OrientationData {
  /** Normalised quaternion scalar component of the rotation from inertial NED to body-fixed frame. */
  orientationW: number;
  /** Normalised quaternion x component of the rotation from inertial NED to body-fixed frame. */
  orientationX: number;
  /** Normalised quaternion y component of the rotation from inertial NED to body-fixed frame. */
  orientationY: number;
  /** Normalised quaternion z component of the rotation from inertial NED to body-fixed frame. */
  orientationZ: number;
}

export type SensorCarrierMessage =
  | {
      /** # `SensorCarrierBuildInfo`
  Firmware build metadata emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Sensor Carrier firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `SensorCarrierStatus`
  Periodic status message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Sensor Carrier.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: SensorCarrierStatus;
      type: "BoardStatus";
    }
  | {
      /** # `PositionData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Provides fused and filtered position data in the WGS84 geodetic frame.

  ## Reaction
  No action required.

  ## Data Origin & Quality
  This data is produced by an extended Kalman filter that fuses:
  - Two GNSS receivers (single-antenna each)
  - Two IMUs (accelerometer + gyroscope)
  - Two barometric pressure sensors

  The system estimates position in the WGS84 geodetic frame, using:
  - GNSS as the primary position reference
  - IMU and barometric data for dead-reckoning and short-term vertical stability

  GNSS data provides reliable long-term accuracy but is subject to multipath and signal dropout.
  Short-term dynamics are improved by inertial fusion, and barometric height assists with
  vertical resolution. If GNSS data becomes unreliable, the filter will tend to dead-reckoning using
  IMU and barometric data, which is subject to drift over time.

  Accuracy estimates (`horizontal_accuracy` and `vertical_accuracy`) represent **1-sigma**
  standard deviations from the Kalman filter covariance and take into account the GNSS
  hdop and vdop values.

  During GNSS dropout, position will degrade based on IMU drift and model assumptions.
  Barometer-based altitude is relative to the initialization pressure and is sensitive to weather.
  GNSS height is referred to mean sea level (HAMSL). */
      content: PositionData;
      type: "PositionData";
    }
  | {
      /** # `ImuData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 40 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`

  ## Purpose
  Provides fused and filtered acceleration and angular velocity in both the body-fixed
  and inertial NED frames.

  ## Reaction
  No action required.

  ## Data Origin & Quality
  This data is derived from two IMUs (each an accelerometer + gyroscope pair), mounted
  closely together and aligned in the same direction.

  The body-fixed frame is the sensor-native reference frame, and all acceleration and angular
  velocity data in this frame is directly measured and highly reliable.

  The inertial NED frame is computed by rotating the body-frame data using the estimated
  orientation quaternion. This transformation introduces small errors due to attitude estimation
  uncertainty. Roll and pitch are generally accurate. Yaw, while observed by a magnetometer,
  is more prone to environmental noise and remains a larger source of error than roll and pitch.

  Coordinate frame conversion therefore introduces small errors in the inertial NED frame data for:
  - `angular_velocity_north`
  - `angular_velocity_east`
  - `acceleration_north`
  - `acceleration_east`

  Note that `acceleration_down` and `angular_velocity_down` are not affected by errors in
  inertial yaw. */
      content: ImuData;
      type: "ImuData";
    }
  | {
      /** # `VelocityData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Reports linear velocity in both the body-fixed and inertial NED frames.

  ## Reaction
  No action required.

  ## Data Origin & Quality
  Velocity is estimated by a Kalman filter fusing:
  - Two GNSS receivers
  - Two IMUs (accelerometer + gyroscope)

  The **inertial NED frame** (North, East, Down) is the **native reference frame** for this data.
  Velocity is provided directly by GNSS and is globally referenced and stable. GNSS velocity is
  typically accurate to within ±0.1 m/s and valid up to ±500 m/s under normal conditions.

  If GNSS data becomes unreliable, the filter will tend to dead-reckoning using inertial data.

  The **body-fixed frame** (X forward, Y right, Z down) velocity is computed by rotating the
  inertial velocity into the body frame using the estimated orientation quaternion. Since the
  orientation estimate (especially yaw) is subject to small errors, this transformation introduces
  small errors in the corresponding body-frame velocity components. This primarily affects the
  horizontal components:
  - `velocity_x`
  - `velocity_y`

  The vertical component (`velocity_z`) is not affected by errors in inertial yaw. */
      content: VelocityData;
      type: "VelocityData";
    }
  | {
      /** # `OrientationData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 40 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Reports orientation as a quaternion rotating from the inertial NED zero attitude
  to the body-fixed frame.

  ## Reaction
  No action required.

  ## Data Origin & Quality
  The orientation estimate is derived from two IMUs (accelerometer + gyroscope), fused with two
  magnetometers and corrected for local magnetic declination to yield a stable yaw reference.

  The quaternion describes a passive rotation from the **inertial NED frame** (North-East-Down)
  to the **body-fixed frame** (X forward, Y right, Z down). This follows a right-handed,
  3-2-1 (ZYX) intrinsic rotation convention:
  - Positive roll (X): Right canopy wingtip moves down
  - Positive pitch (Y): Leading canopy edge moves up
  - Positive yaw (Z): Heading turns right (clockwise when viewed from above)

  The zero orientation is represented by the identity quaternion `(1, 0, 0, 0)`, where the body
  frame is aligned with the NED frame. That is, the body X-axis points (True) North, Y-axis points
  East, and Z-axis points down.

  - **Roll** and **pitch** are well-constrained using the gravity vector, which can be directly
  observed by the accelerometers.
  - **Yaw** is initialized to zero at system startup. Yaw is observed by the magnetometers
  and corrected by the gyroscopes. Under stable magnetic conditions, the yaw will converge
  to true north over time. As soon as the yaw estimate has converged, it is expected to
  remain stable.

  The emitted quaternion is always **normalised**. */
      content: OrientationData;
      type: "OrientationData";
    }
  | {
      /** # `EnvironmentalData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Provides low-rate environmental data in the form of temperature, humidity, and
  smoothed pressure values.

  ## Reaction
  No action required. */
      content: EnvironmentalData;
      type: "EnvironmentalData";
    }
  | {
      /** # `MagnetometerData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 10 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Provides fused and filtered magnetic field strength in both the body-fixed
  and inertial NED frames.

  ## Reaction
  No action required.

  ## Data Origin & Quality
  This data is derived from two magnetometers mounted closely and aligned in the same direction.

  Hard and soft iron correction **has** been applied to this data to compensate for the
  vehicle's own magnetic distortions.

  The body-fixed frame values represent this corrected field. The inertial NED frame is
  rotated from the body-fixed frame using the orientation quaternion. This transformation
  introduces small conversion errors due to minor inaccuracies in the attitude estimate.

  Small errors in the attitude estimate will primarily affect the horizontal components:
  - `magnetic_field_north`
  - `magnetic_field_east`

  Note that `magnetic_field_down` is not affected by errors in inertial yaw. */
      content: MagnetometerData;
      type: "MagnetometerData";
    }
  | {
      /** # `PressureData`
  Periodic telemetry message emitted by the Sensor Carrier.

  ## Type
  - `Periodic @ 40 Hz`

  ## Direction
  - **Emitted by:** `SensorCarrier`
  - **Received by:** `unspecified`

  ## Purpose
  Reports filtered atmospheric pressure (scalar) for altitude estimation.

  ## Reaction
  No action required.

  ## Note
  This differs from `EnvironmentalData`, which is lower-rate and smoothed. */
      content: HPa;
      type: "PressureData";
    };

export interface OxidizerControlBoardStatus {
  common: StatusCommonMessage;
  /** State of the Keller BUS used to read pressure, indicates whether a single sensor is online or not. */
  pressureBus: SensorStatus;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
}

export interface OxidizerControlBoardValveStates {
  /** Oxidizer DPR Control loop state */
  ossDpr: DPRValve;
  /** Oxidizer Vent Valve state */
  ossVntVlv: ValveState;
}

export type OxidizerControlBoardMessage =
  | {
      /** # `OxidizerControlBoardBuildInfo`
  Firmware build metadata emitted by the Oxidizer Control Board.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the Oxidizer Control Board firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** # `OxidizerControlBoardStatus`
  Periodic status message emitted by the Oxidizer Control Board.

  ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Oxidizer Control Board, including sensor.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: OxidizerControlBoardStatus;
      type: "BoardStatus";
    }
  | {
      /** # `OxidizerControlBoardValveStates`
  Periodic status message emitted by the Oxidizer Control Board.

  ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Valve State of all Valves controlled by the Oxidizer Control Board, including the DPR control loop state and setpoint.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: OxidizerControlBoardValveStates;
      type: "ValveStates";
    }
  | {
      type: "OxidizerPressurizationCompleted";
    }
  | {
      /** # `OxidizerPressurization`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to initiate pressurization on the OxidizerControlBoard

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Pressurize the Oxidizer Tank to a desired setpoint

  ## Reaction
   */
      content: BarG;
      type: "OxidizerPressurization";
    }
  | {
      /** # `OxidizerPressurizationGain`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC to configure the pressurization gain on the OxidizerControlBoard

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Configure the Oxidizer Pressurization Gain

  ## Reaction
   */
      content: PressurizationGain;
      type: "OxidizerPressurizationGain";
    }
  | {
      type: "OxidizerPressurizationAbort";
    }
  | {
      /** # `OxidizerDprConfigFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Set OXD Pressure Regulator configuration
  Configures whether the control loop should be active, and what reference point (setpoint) it should assume.

  ## Reaction
  The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "OxidizerDprConfigFC";
    }
  | {
      /** # `OxidizerVentControlFC`
  Event message sent by the FC.

  ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the Oxidizer Vent Valve to a certain state.

  ## Reaction
  The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly */
      content: ValveState;
      type: "OxidizerVentControlFC";
    }
  | {
      /** # `OxidizerDprConfigECU`
  Event message sent by the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Set OXD Pressure Regulator configuration
  Configures whether the control loop should be active, and what reference point (setpoint) it should assume.

  ## Reaction
  The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "OxidizerDprConfigECU";
    }
  | {
      /** # `OxidizerVentControlECU`
  Event message sent by the ECU.

  ## Type
  - `Event`: sent by the ECU

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the Oxidizer Vent Valve to a certain state.

  ## Reaction
  The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly */
      content: ValveState;
      type: "OxidizerVentControlECU";
    }
  | {
      /** # `OxidizerDprConfigRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Set OXD Pressure Regulator configuration

  ## Reaction
  The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "OxidizerDprConfigRFS";
    }
  | {
      /** # `OxidizerVentControlRFS`
  Event message sent by the RFS.

  ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the Oxidizer Vent Valve to a certain state.

  ## Reaction
  The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly */
      content: ValveState;
      type: "OxidizerVentControlRFS";
    };

/**
 * All messages in the full system
 */
export type Message =
  | {
      board: "FlightComputer";
      message: FlightComputerMessage;
    }
  | {
      board: "RfsComputer";
      message: RfsComputerMessage;
    }
  | {
      board: "SystemManagement";
      message: SystemManagementMessage;
    }
  | {
      board: "RecoveryBoard";
      message: RecoveryBoardMessage;
    }
  | {
      board: "PowerBoard";
      message: PowerBoardMessage;
    }
  | {
      board: "SensorCarrier";
      message: SensorCarrierMessage;
    }
  | {
      board: "FuelControlBoard";
      message: FueldControlBoardMessage;
    }
  | {
      board: "OxidizerControlBoard";
      message: OxidizerControlBoardMessage;
    }
  | {
      board: "EngineControlBoard";
      message: EngineControlBoardMessage;
    };

export interface NamedPssDatapointValue {
  /** Unique name of the datapoint */
  name: string;
  /** Value of the datapoint */
  value: number;
}

/**
 * Map of all datapoints defined in the diagram together with information
collected at compile time and from the diagram about the datapoint.
 */
export type PssDatapointInfo = { [key: string]: ExtendedDatapointInformation };

export type RemoteComputerKind =
  (typeof RemoteComputerKind)[keyof typeof RemoteComputerKind];

export const RemoteComputerKind = {
  fc: "fc",
  rfs: "rfs",
} as const;

/**
 * Representation of a PSS diagram.
 */
export interface Pss {
  /** Map of all datapoints defined in the diagram together with information
  collected at compile time and from the diagram about the datapoint. */
  datapointInfo: PssDatapointInfo;
  /** PSS diagram SVG without the drawio XML content. */
  diagram: string;
  /** Kind of remote computer this PSS infomration is for. */
  kind: RemoteComputerKind;
  /** Display name of the PSS information. */
  name: string;
}

export interface PssInfo {
  /** Identifier of the PSS information. */
  id: string;
  /** Display name of the PSS information. */
  name: string;
}

export interface ScenarioInfo {
  /** Identifier of the scenario. */
  id: string;
  /** Display name of the scenario. */
  name: string;
}

/**
 * Allowed manual transitions for every state and whether they
are an abort transition.
 */
export type StateMachineManualTransitions = {
  [key: string]: [string, boolean][];
};

/**
 * Mapping of state names to diagram cell ids.
 */
export type StateMachineStateNodes = { [key: string]: string };

/**
 * Representation of a state machine diagram.
 */
export interface StateMachine {
  /** State machine diagram SVG without the drawio XML content. */
  diagram: string;
  /** Initial state of the state machine. */
  initialState: string;
  /** Kind of remote computer this state machine diagram is for. */
  kind: RemoteComputerKind;
  /** Allowed manual transitions for every state and whether they
  are an abort transition. */
  manualTransitions: StateMachineManualTransitions;
  /** Display name of the state machine. */
  name: string;
  /** Mapping of state names to diagram cell ids. */
  stateNodes: StateMachineStateNodes;
}

export interface StateMachineInfo {
  /** Identifier of the state machine. */
  id: string;
  /** Display name of the state machine. */
  name: string;
}
