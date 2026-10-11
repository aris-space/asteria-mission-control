/**
 * Enum representing the active power source.
 */
export type ActivePowerSource =
  (typeof ActivePowerSource)[keyof typeof ActivePowerSource];

export const ActivePowerSource = {
  battery: "battery",
  external: "external",
  none: "none",
} as const;

export type ActuatorKind =
  | {
      default_enabled: boolean;
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

export type ActuatorValue =
  | {
      kind: "digital";
      value: {
        /** Whether this actuator is in some logical On state.
  (ie. Open for valves, On for outputs) */
        enabled: boolean;
      };
    }
  | {
      kind: "dpr";
      value: {
        /** Whether the DPR is running the control logic */
        enabled: boolean;
        /** The setpoint in barg for the control logic */
        setpoint: number;
      };
    }
  | {
      kind: "fractional";
      value: {
        /** Openness in range [0, 1]. */
        fraction: number;
      };
    };

export type Alignment = (typeof Alignment)[keyof typeof Alignment];

export const Alignment = {
  left: "left",
  right: "right",
  hidden: "hidden",
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

export type BackplaneMessage =
  | {
      /** ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `Backplane`
  - **Received by:** `unspecified`

  ## Purpose
  Allows version tracking and verification of the backplane firmware.

  ## Reaction
  Receivers may log or display the firmware version and build metadata. */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `Backplane`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the backplane.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: StatusCommonMessage;
      type: "BoardStatus";
    }
  | {
      /** ## Type
  - Periodic @ 10Hz

  ## Direction
  - **Emitted by:** `Backplane`
  - **Received by:** unspecified

  ## Purpose
  Reports the measured voltage, current, and power on the 5V power rail.

  ## Reaction
  Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range. */
      content: RailStatus;
      type: "RailStatus5V";
    }
  | {
      /** ## Type
  - Periodic @ 10Hz

  ## Direction
  - **Emitted by:** `Backplane`
  - **Received by:** unspecified

  ## Purpose
  Reports the measured voltage, current, and power on the 24V power rail.

  ## Reaction
  Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range. */
      content: RailStatus;
      type: "RailStatus24V";
    }
  | {
      /** ## Type
  - Periodic @ 1 Hz

  ## Direction
  - **Emitted by:** `Backplane`
  - **Received by:** unspecified

  ## Purpose
  Reports which power source is currently active.

  ## Reaction
  Receivers may log, display, or track this value. They may trigger warnings if the power source is not valid. */
      content: ActivePowerSource;
      type: "ActivePowerSource";
    };

/**
 * A pressure in bar relative to atmospheric pressure (`barg`).

Is `NAN` by default.
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
  backplane: "backplane",
  recoveryBoard: "recoveryBoard",
  fuelControlBoard: "fuelControlBoard",
  oxidizerControlBoard: "oxidizerControlBoard",
} as const;

/**
 * A temperature in degrees Celsius.

Is `NAN` by default.
 */
export type Celsius = number;

/**
 * First 5 hex characters of the config file Git Object Hash
 */
export interface ConfigHash {
  hash: number[];
}

/**
 * Enum representing the status of a sensor.
 */
export type SensorStatus = (typeof SensorStatus)[keyof typeof SensorStatus];

export const SensorStatus = {
  offline: "offline",
  online: "online",
} as const;

/**
 * Status of the Controllino
 */
export interface ControllinoStatus {
  /** `Online` if connection exists, `Offline` otherwise. */
  online: SensorStatus;
}

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
      unit: string;
    }
  | {
      default_enabled: boolean;
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

export type SensorValue =
  | {
      kind: "analog";
      value: {
        value: number;
      };
    }
  | {
      kind: "digital";
      value: {
        enabled: boolean;
      };
    };

export type DatapointValue =
  | (ActuatorValue & {
      component: "actuator";
    })
  | (SensorValue & {
      component: "sensor";
    });

/**
 * A digital input, mostly for proximity sensors.
 */
export type DigitalIn = (typeof DigitalIn)[keyof typeof DigitalIn];

export const DigitalIn = {
  off: "off",
  on: "on",
} as const;

/**
 * The state of a digital out.
This is a [`Settable`] with the value being 0.0 for off and 1.0 for on.
 */
export type DigitalOut = (typeof DigitalOut)[keyof typeof DigitalOut];

export const DigitalOut = {
  off: "off",
  on: "on",
} as const;

/**
 * Telemetry statistics for a downlink.
 */
export interface DownlinkTelemetryStats {
  /**
   * The total number of bytes sent.
   * @minimum 0
   */
  numBytesSent: number;
  /**
   * The total number of messages sent.
   * @minimum 0
   */
  numMessagesSent: number;
}

/**
 * Struct representing the gains of the dpr controller
 */
export interface DprGainInfo {
  /** The DPR derivative gain */
  d: number;
  /** The DPR integral gain */
  i: number;
  /** The DPR max opening time in ms */
  maxMs: number;
  /** The DPR min opening time in ms */
  minMs: number;
  /** The DPR proportional gain */
  p: number;
}

/**
 * Enum representing the state of a dpr loop.
 */
export type DprLoopInfo = (typeof DprLoopInfo)[keyof typeof DprLoopInfo];

export const DprLoopInfo = {
  activeNominal: "activeNominal",
  activeOverPressure: "activeOverPressure",
  passive: "passive",
} as const;

export interface EngineControlBoardStatus {
  /** `Armed` if the engine is armed and the main valves receive power, ie engine arming Pin is pulled */
  armed: ArmingState;
  common: StatusCommonMessage;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
}

/**
 * The state of a valve that is normally closed.
 */
export type NormallyClosedValve =
  (typeof NormallyClosedValve)[keyof typeof NormallyClosedValve];

export const NormallyClosedValve = {
  open: "open",
  closed: "closed",
} as const;

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
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Fuel Main Valve State.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: NormallyClosedValve;
      type: "FuelMainValveState";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Oxidizer Main Valve State.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: NormallyClosedValve;
      type: "OxidizerMainValveState";
    }
  | {
      /** # `EngineChamberPressure`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the Combustion Chamber Pressure.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from analog Trafag pressure sensors installed on the engine. They range from 0 to 60 barg
  The value will be `NaN` if reading the sensor fails. */
      content: BarG;
      type: "ChamberPressure";
    }
  | {
      /** # `InjectorFuelPressure`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the Injector Fuel Pressure.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from analog Trafag pressure sensors installed on the engine. They range from 0 to 60 barg
  The value will be `NaN` if reading the sensor fails. */
      content: BarG;
      type: "InjectorFuelPressure";
    }
  | {
      /** # `InjectorOxidizerPressure`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the Injector Oxidizer Pressure.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from analog Trafag pressure sensors installed on the engine. They range from 0 to 60 barg
  The value will be `NaN` if reading the sensor fails. */
      content: BarG;
      type: "InjectorOxidizerPressure";
    }
  | {
      /** # `InjectorFuelTemperature`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 10 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the Injector Fuel Temperature.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from high precision ADCs which read the differential thermocouple voltage together with a thermistor from which the temperature is calculated.
  Thermocouples installed can be either Type K or Type T.
  If the value read in firmware is outside the specific temperature range of [-200.0, 200.0] °C,
  the value will be set to `NaN`. */
      content: Celsius;
      type: "InjectorFuelTemperature";
    }
  | {
      /** # `OxidizerTankTemperature`
  Periodic telemetry message emitted by the Engine Control Board.

  ## Type
  - `Periodic @ 10 Hz`

  ## Direction
  - **Emitted by:** `EngineControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the Oxidizer Tank Bottom Temperature.

  ## Reaction
  No action required.

  ## Data Origin
  Data originates from high precision ADCs which read the differential thermocouple voltage together with a thermistor from which the temperature is calculated.
  Thermocouples installed can be either Type K or Type T.
  If the value read in firmware is outside the specific temperature range of [-200.0, 200.0] °C,
  the value will be set to `NaN`. */
      content: Celsius;
      type: "OxidizerTankTemperature";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Oxidizer Main valve to a certain state.

  ## Reaction
  The Engine Control Board shall change the Oxidizer Main Valve position accordingly */
      content: NormallyClosedValve;
      type: "OxidizerMainValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Oxidizer Main valve to a certain state.

  ## Reaction
  The Engine Control Board shall change the Oxidizer Main Valve position accordingly */
      content: NormallyClosedValve;
      type: "OxidizerMainValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Fuel Main valve to a certain state.

  ## Reaction
  The Engine Control Board shall change the Fuel Main Valve position accordingly. */
      content: NormallyClosedValve;
      type: "FuelMainValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `EngineControlBoard`

  ## Purpose
  Sets the Fuel Main valve to a certain state.

  ## Reaction
  The Engine Control Board shall change the Fuel Main Valve position accordingly. */
      content: NormallyClosedValve;
      type: "FuelMainValveControlRFS";
    };

/**
 * Atmospheric pressure in hPa.

Is `NAN` by default.
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

export type EventKind = (typeof EventKind)[keyof typeof EventKind];

export const EventKind = {
  REMOTE: "REMOTE",
  STATE_MACHINE: "STATE_MACHINE",
  PSS_DATA: "PSS_DATA",
  PING: "PING",
  MAVLINK_MESSAGE: "MAVLINK_MESSAGE",
  POLYGON: "POLYGON",
} as const;

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
 * UTC timestamp given in microseconds since the Unix epoch (`1970-01-01T00:00:00Z`).
 * @minimum 0
 */
export type InstantUs = number;

/**
 * Telemetry health statistics for an uplink.
 */
export interface UplinkTelemetryHealth {
  /**
   * The number of message that were inferred to have been lost by the sequence number.
   * @minimum 0
   */
  numMsgLost: number;
  /**
   * The number of the messages received that have been understood and processed successfully.
   * @minimum 0
   */
  numMsgProcessed: number;
  /**
   * The total number of the messages received, including malformed ones.
   * @minimum 0
   */
  numMsgReceived: number;
  /** The timestamp of the last message received, including malformed ones. */
  timeOfLastMsg: InstantUs;
  /** The timestamp of the last message that has been understood and processed successfully. */
  timeOfLastProcessedMsg: InstantUs;
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
      /** # `FlightComputerConfigHash`
  First 5 hex characters of the config file Git Object Hash currently
  loaded by the Flight Computer.

  ## Type
  - `Periodic @ 0.2 Hz`

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `unspecified`

  ## Purpose
  Allows Flight Computer config file tracking.

  ## Reaction
  Receivers may log or display the config hash. */
      content: ConfigHash;
      type: "ConfigHash";
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
      /** Statistics about the health of the telemetry uplink received by the Flight Computer.

  Emitted periodically by the flight computer.
  Can be used to calculate the throughput and loss rate. */
      content: UplinkTelemetryHealth;
      type: "UplinkTelemetryHealth";
    }
  | {
      /** Statistics about the telemetry downlink sent by the Flight Computer.

  Emitted periodically by the flight computer.
  Can be used to calculate the throughput and loss rate. */
      content: DownlinkTelemetryStats;
      type: "DownlinkTelemetryStats";
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
  /** State of the DPR Control Gain */
  dprGainInfo: DprGainInfo;
  /** State of the DPR Control Loop */
  dprLoopInfo: DprLoopInfo;
  /** State of the Keller BUS used to read pressure, indicates whether a single sensor is online or not. */
  pressureBus: SensorStatus;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
}

/**
 * The state of a valve that is normally open.
 */
export type NormallyOpenValve =
  (typeof NormallyOpenValve)[keyof typeof NormallyOpenValve];

export const NormallyOpenValve = {
  open: "open",
  closed: "closed",
} as const;

export type FueldControlBoardMessage =
  | {
      /** ## Type
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
      /** ## Type
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
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the pressure of the Pressurization Line (COPV).
   */
      content: BarG;
      type: "PressurizationLinePressure";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports Fuel Tank Pressure Sensor 1.
  This is mainly used as an input to the Control Loop running on the Fuel Control Board.
   */
      content: BarG;
      type: "FuelTankPressureSensor1";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports Fuel Tank Pressure Sensor 2.
  This is mainly used as an input to the Control Loop running on the Fuel Control Board.
   */
      content: BarG;
      type: "FuelTankPressureSensor2";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the filtered Fuel Tank pressure used as DPR control loop input.
   */
      content: BarG;
      type: "FuelTankPressureFiltered";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the DPR Valve State including setpoint.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: DPRValve;
      type: "FuelDprValveState";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Pressurization Valve State
  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: NormallyOpenValve;
      type: "PressurizationVentValveState";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `FuelControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Fuel Vent Valve State

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: NormallyOpenValve;
      type: "FuelVentValveState";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Set ETH Pressure Regulator configuration

  ## Reaction
  The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "FuelDprValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the N2 Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust N2 Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "PressurizationVentValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the Fuel Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "FuelVentValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Set ETH Pressure Regulator configuration

  ## Reaction
  The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "FuelDprValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the N2 Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust N2 Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "PressurizationVentValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the Fuel Vent Valve to a certain state.

  ## Reaction
  The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "FuelVentValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the proportional Fuel DPR Gain

  ## Reaction
  The Fuel Control Board shall adjust the proportional DPR gain accordingly */
      content: number;
      type: "FuelDprGainP";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the integral Fuel DPR Gain

  ## Reaction
  The Fuel Control Board shall adjust the integral DPR gain accordingly */
      content: number;
      type: "FuelDprGainI";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the derivative Fuel DPR Gain

  ## Reaction
  The Fuel Control Board shall adjust the derivative DPR gain accordingly */
      content: number;
      type: "FuelDprGainD";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the minimum opening time ms of the DPR

  ## Reaction
  The Fuel Control Board shall adjust the derivative DPR minimum opening time accordingly */
      content: number;
      type: "FuelDprMinOpeningTime";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `FuelControlBoard`

  ## Purpose
  Sets the maximum opening time ms of the DPR

  ## Reaction
  The Fuel Control Board shall adjust the derivative DPR maximum opening time accordingly */
      content: number;
      type: "FuelDprMaxOpeningTime";
    };

export interface GncPolygonInner {
  /** Points which span the polygon.
  Every point is a tuple of distances in meters to the north- and east
  of the origin. */
  points: number[][];
}

/**
 * Utoipa does not support `rename_all(serialize = "...")`. But since Utoipa
is anyways only concerned with the serialized version, we can just explicitly
rename it for both operations in the schema.
 */
export interface GncPolygon {
  /** Due to architectural reasons, the bounding box is nested one deeper */
  inner: GncPolygonInner;
  /** Latitude of the origin of the bounding polygon. */
  originLat: number;
  /** Longitude of the origin of the bounding polygon. */
  originLng: number;
}

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

/**
 * The state of an inverted digital out.
This is a [`Settable`] with the value being 0.0 for off and 1.0 for on.
 */
export type InvertedDigitalOut =
  (typeof InvertedDigitalOut)[keyof typeof InvertedDigitalOut];

export const InvertedDigitalOut = {
  off: "off",
  on: "on",
} as const;

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
  controllino: ControllinoStatus;
  /** `Armed` if the remote filling station is in a `Armed` state for ignition
  This is a software arming state of the RFS state machine that is part of the RFS hardware arming */
  isIgnitionArmed: ArmingState;
}

/**
 * The state of a throttleable valve.
This is a [`Settable`] with the value being 0.0 for fully closed up to 1.0 for fully open.

Note that the default behaviour is a bit weird here, as the valves don't reset on powerloss,
but they start closed (`Default` gives a closed state).
 */
export interface ThrottleableValve {
  /**
   * The openness in percent (0 being fully closed, 100 being fully open)
   * @minimum 0
   */
  openness_percent: number;
}

export type RfsComputerMessage =
  | {
      /** Software build metadata periodically emitted by the RFS Computer.

  # CAN
  - **Kind**: Debug message
  - **Sent by**: RFS Computer */
      content: BuildInformationCommon;
      type: "BuildInfo";
    }
  | {
      /** First 5 hex characters of the config file Git Object Hash currently
  loaded by the Rfs Computer.

  This is used to auto-select the state machine in the mission control */
      content: ConfigHash;
      type: "ConfigHash";
    }
  | {
      /** Periodic status message emitted by the RFS Computer.

  Contains runtime health of the RFS Computer.
  It is also used to only ignite if the RFS is armed.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: RfsComputerStatus;
      type: "Status";
    }
  | {
      /** The current state of the rfs computer state machine. */
      content: StateMachineState;
      type: "StateMachineState";
    }
  | {
      /** Statistics about the health of the telemetry uplink received by the Rfs Computer.

  Emitted periodically by the rfs computer.
  Can be used to calculate the throughput and loss rate. */
      content: UplinkTelemetryHealth;
      type: "UplinkTelemetryHealth";
    }
  | {
      /** Statistics about the telemetry downlink sent by the Rfs Computer.

  Emitted periodically by the Rfs computer.
  Can be used to calculate the throughput and loss rate. */
      content: DownlinkTelemetryStats;
      type: "DownlinkTelemetryStats";
    }
  | {
      /** The current active state of the normally off spark plug.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: DigitalOut;
      type: "IgniterSparkPlugState";
    }
  | {
      /** The current active state of the normally closed GOX igniter valve.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: NormallyClosedValve;
      type: "GoxIgniterValveState";
    }
  | {
      /** The current active state of the normally closed H2 igniter valve.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: NormallyClosedValve;
      type: "H2IgniterValveState";
    }
  | {
      /** The current active state of the normally closed GOX purge valve.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: NormallyClosedValve;
      type: "GoxPurgeValveState";
    }
  | {
      /** The current active state of the normally closed H2 purge valve.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: NormallyClosedValve;
      type: "H2PurgeValveState";
    }
  | {
      /** The current active state of the normally open N2 bleed valve. */
      content: NormallyOpenValve;
      type: "N2BleedValveState";
    }
  | {
      /** The current active state of the normally closed LOX purge valve. */
      content: NormallyClosedValve;
      type: "LoxPurgeValveState";
    }
  | {
      /** The current active state of the normally open GOX bleed valve. */
      content: NormallyOpenValve;
      type: "GoxBleedValveState";
    }
  | {
      /** The current active state of the normally closed N2 purge valve. */
      content: NormallyClosedValve;
      type: "N2PurgeValveState";
    }
  | {
      /** The current active state of the normally closed N2 fill valve. */
      content: NormallyClosedValve;
      type: "N2FillValveState";
    }
  | {
      /** The current active state of the normally open H2 bleed valve. */
      content: NormallyOpenValve;
      type: "H2BleedValveState";
    }
  | {
      /** The current active state of the normally closed LOX bleed valve. */
      content: NormallyClosedValve;
      type: "LoxBleedValveState";
    }
  | {
      /** The current active state of the normally closed pneumatic booster valve. */
      content: NormallyClosedValve;
      type: "BoosterValveState";
    }
  | {
      /** The current active state of the normally closed LOX decoupler extend valve. */
      content: NormallyClosedValve;
      type: "LoxDecouplerExtendValveState";
    }
  | {
      /** The current active state of the normally closed LOX decoupler retract valve. */
      content: NormallyClosedValve;
      type: "LoxDecouplerRetractValveState";
    }
  | {
      /** The current active state of the normally closed N2 decoupler extend valve. */
      content: NormallyClosedValve;
      type: "N2DecouplerExtendValveState";
    }
  | {
      /** The current active state of the normally closed N2 decoupler retract valve. */
      content: NormallyClosedValve;
      type: "N2DecouplerRetractValveState";
    }
  | {
      /** The current active state of the normally closed N2 shower valves. */
      content: NormallyClosedValve;
      type: "N2ShowerValvesState";
    }
  | {
      /** The current active state of the normally closed N2 engine purge valve valve.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: NormallyClosedValve;
      type: "N2RocketPurgeValveState";
    }
  | {
      /** The current active state of the rocket power output. */
      content: InvertedDigitalOut;
      type: "RocketPowerState";
    }
  | {
      /** The current active state of the Maxon board power output. */
      content: InvertedDigitalOut;
      type: "MaxonBoardPowerState";
    }
  | {
      /** The current active state of the rocket heating output. */
      content: DigitalOut;
      type: "RocketHeatingState";
    }
  | {
      /** The current active state of the custom output 1. */
      content: DigitalOut;
      type: "Custom1State";
    }
  | {
      /** The current active state of the custom output 2. */
      content: DigitalOut;
      type: "Custom2State";
    }
  | {
      /** The current active state of the custom output 3. */
      content: DigitalOut;
      type: "Custom3State";
    }
  | {
      /** The current openness state of the LOX fill valve */
      content: ThrottleableValve;
      type: "LoxFillValveState";
    }
  | {
      /** The temperature of the LOx line. */
      content: Celsius;
      type: "LoxTemperature";
    }
  | {
      /** The temperature of the igniter.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: Celsius;
      type: "IgniterTemperature";
    }
  | {
      /** The temperature inside the DACS cabinet. */
      content: Celsius;
      type: "CabinetTemperature";
    }
  | {
      /** The ambient temperature. */
      content: Celsius;
      type: "AmbientTemperature";
    }
  | {
      /** The temperature inside the SMART box. */
      content: Celsius;
      type: "SmartBoxTemperature";
    }
  | {
      /** A unused thermocouple on the RFS. */
      content: Celsius;
      type: "CustomT1";
    }
  | {
      /** Whether the LOx decoupler is in its retracted state, from the proximity sensor. */
      content: DigitalIn;
      type: "LoxDecouplerProximity";
    }
  | {
      /** Whether the N2 decoupler is in its retracted state, from the proximity sensor. */
      content: DigitalIn;
      type: "N2DecouplerProximity";
    }
  | {
      /** Whether the valves are receiving power (arming relay state). */
      content: DigitalIn;
      type: "ValvesArmed";
    }
  | {
      /** Whether the spark plug is receiving power (arming relay state). */
      content: DigitalIn;
      type: "IgniterArmed";
    }
  | {
      /** Whether the valves of the smart box are receiving power (arming relay state). */
      content: ArmingState;
      type: "ValvesArmedSmartBox";
    }
  | {
      /** Whether the rocket is given power and is connected. */
      content: DigitalIn;
      type: "RocketConnected";
    }
  | {
      /** The pressure from the igniter block.

  # CAN
  - **Kind**: Status message
  - **Sent by**: RFS Computer */
      content: BarG;
      type: "IgniterPressure";
    }
  | {
      /** Pressure of the N2 pre-booster line. */
      content: BarG;
      type: "N2PreBoosterPressure";
    }
  | {
      /** Pressure of the H2 purge line. */
      content: BarG;
      type: "H2PurgePressure";
    }
  | {
      /** Pressure of the N2 post-booster line. */
      content: BarG;
      type: "N2PostBoosterPressure";
    }
  | {
      /** Pressure of the LOX line. */
      content: BarG;
      type: "LoxPressure";
    }
  | {
      /** Pressure of the purge line. */
      content: BarG;
      type: "PurgePressure";
    }
  | {
      /** Pressure of the pneumatic line. */
      content: BarG;
      type: "PneumaticPressure";
    }
  | {
      /** Pressure of the GOX igniter line. */
      content: BarG;
      type: "GoxPressure";
    }
  | {
      /** Pressure of the H2 igniter line. */
      content: BarG;
      type: "H2Pressure";
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
    }
  | {
      /** Controls the GOX igniter valve on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the igniter
  and thus needs to open and close valves.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: NormallyClosedValve;
      type: "GoxIgniterValveControl";
    }
  | {
      /** Controls the H2 igniter valve on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the igniter
  and thus needs to open and close valves.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: NormallyClosedValve;
      type: "H2IgniterValveControl";
    }
  | {
      /** Controls the igniter spark plug on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the igniter
  and thus needs to activate the spark plug.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: DigitalOut;
      type: "IgniterSparkPlugControl";
    }
  | {
      /** Controls the H2 purge valve on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the ignition
  and thus needs to purge.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: NormallyClosedValve;
      type: "H2IgniterPurgeControl";
    }
  | {
      /** Controls the GOX purge valve on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the ignition
  and thus needs to purge.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: NormallyClosedValve;
      type: "GoxIgniterPurgeControl";
    }
  | {
      /** Controls the N2 engine purge valve on the RFS from the FC.

  This is needed during the ignition sequence where the flight computer controls the
  ignition and thus needs to purge the engine.

  # CAN
  - **Kind**: Event message
  - **Sent by**: Flight Computer */
      content: NormallyClosedValve;
      type: "N2RocketPurgeValveControl";
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
  startup position (0). Positive values mean pulling. */
  leftPos: number;
  /** Current position of the right steering motor in steps (4096 steps = 1 revolution) from the
  startup position (0). Positive values mean pulling. */
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
  /** State of the DPR Control Gain */
  dprGainInfo: DprGainInfo;
  /** State of the DPR Control Loop */
  dprLoopInfo: DprLoopInfo;
  /** State of the Keller BUS used to read pressure, indicates whether a single sensor is online or not. */
  pressureBus: SensorStatus;
  /** State of the ADS1120 device used to read thermocouples */
  thermocoupleStatus: SensorStatus;
}

export type OxidizerControlBoardMessage =
  | {
      /** ## Type
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
      /** ## Type
  - `Periodic @ 1 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the runtime health of the Oxidizer Control Board, including sensor status.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: OxidizerControlBoardStatus;
      type: "BoardStatus";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports Oxidizer Tank Pressure Sensor 1.
  This is mainly used as an input to the Control Loop running on the Oxidizer Control Board.
   */
      content: BarG;
      type: "OxidizerTankPressureSensor1";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports Oxidizer Tank Pressure Sensor 2.
  This is mainly used as an input to the Control Loop running on the Oxidizer Control Board.
   */
      content: BarG;
      type: "OxidizerTankPressureSensor2";
    }
  | {
      /** ## Type
  - `Periodic @ 20 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Reports the absolute valued Oxidizer Tank differential pressure.
   */
      content: BarG;
      type: "OxidizerTankDifferentialPressure";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the DPR Valve State including setpoint.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: DPRValve;
      type: "OxidizerDprValveState";
    }
  | {
      /** ## Type
  - `Periodic @ 5 Hz`

  ## Direction
  - **Emitted by:** `OxidizerControlBoard`
  - **Received by:** `unspecified`

  ## Purpose
  Communicates the Oxidizer Vent Valve State.

  ## Reaction
  Receivers may log the data or use it for diagnostics and system health checks. */
      content: NormallyOpenValve;
      type: "OxidizerVentValveState";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Set OXD Pressure Regulator configuration

  ## Reaction
  The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "OxidizerDprValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the Oxidizer Vent Valve to a certain state.

  ## Reaction
  The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "OxidizerVentValveControlFC";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Set OXD Pressure Regulator configuration

  ## Reaction
  The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly */
      content: DPRValve;
      type: "OxidizerDprValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the RFS

  ## Direction
  - **Emitted by:** `RemoteFillingStation`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the Oxidizer Vent Valve to a certain state.

  ## Reaction
  The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly */
      content: NormallyOpenValve;
      type: "OxidizerVentValveControlRFS";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the proportional Oxidizer DPR Gain

  ## Reaction
  The Oxidizer Control Board shall adjust the proportional DPR gain accordingly */
      content: number;
      type: "OxidizerDprGainP";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the integral Oxidizer DPR Gain

  ## Reaction
  The Oxidizer Control Board shall adjust the integral DPR gain accordingly */
      content: number;
      type: "OxidizerDprGainI";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the derivative Oxidizer DPR Gain

  ## Reaction
  The Oxidizer Control Board shall adjust the derivative DPR gain accordingly */
      content: number;
      type: "OxidizerDprGainD";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the minimum opening time ms of the DPR

  ## Reaction
  The Oxidizer Control Board shall adjust the derivative DPR minimum opening time accordingly */
      content: number;
      type: "OxidizerDprMinOpeningTime";
    }
  | {
      /** ## Type
  - `Event`: sent by the FC

  ## Direction
  - **Emitted by:** `FlightComputer`
  - **Received by:** `OxidizerControlBoard`

  ## Purpose
  Sets the maximum opening time ms of the DPR

  ## Reaction
  The Oxidizer Control Board shall adjust the derivative DPR maximum opening time accordingly */
      content: number;
      type: "OxidizerDprMaxOpeningTime";
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
      board: "Backplane";
      message: BackplaneMessage;
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

export interface NamedDatapointValue {
  /** Unique name of the datapoint */
  name: string;
  /** Value of the datapoint */
  value: DatapointValue;
}

export type OptionalResultStateMachine =
  | {
      kind: "some";
      /** Representation of a state machine diagram. */
      value: {
        /** Allowed actuators for every state. */
        allowedActuators: { [key: string]: string[] };
        /** State machine diagram SVG without the drawio XML content. */
        diagram: string;
        /** Initial state of the state machine. */
        initialState: string;
        /** Allowed manual transitions for every state and whether they
  are an abort transition. */
        manualTransitions: { [key: string]: [string, boolean][] };
        /** Mapping of state names to diagram cell ids. */
        stateNodes: { [key: string]: string };
      };
    }
  | {
      kind: "error";
      value: string;
    }
  | {
      kind: "none";
    };

/**
 * Map of all datapoints defined in the diagram together with information
collected at compile time and from the diagram about the datapoint.
 */
export type PssDatapointInfo = { [key: string]: ExtendedDatapointInformation };

/**
 * Representation of a PSS diagram.
 */
export interface Pss {
  /** Map of all datapoints defined in the diagram together with information
  collected at compile time and from the diagram about the datapoint. */
  datapointInfo: PssDatapointInfo;
  /** PSS diagram SVG without the drawio XML content. */
  diagram: string;
}

export type RemoteComputerKind =
  (typeof RemoteComputerKind)[keyof typeof RemoteComputerKind];

export const RemoteComputerKind = {
  flight_computer: "flight computer",
  rfs_computer: "rfs computer",
} as const;

export interface RemoteComputerInfo {
  /** Description about the remote. */
  description: string;
  /** What kind of remote computer this is. */
  kind: RemoteComputerKind;
  /** Name of the remote.
  This is used as the identifier. */
  name: string;
}

export interface ServerInfo {
  /** Git version of the mission control server. */
  version: string;
}

/**
 * Allowed actuators for every state.
 */
export type StateMachineAllowedActuators = { [key: string]: string[] };

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
  /** Allowed actuators for every state. */
  allowedActuators: StateMachineAllowedActuators;
  /** State machine diagram SVG without the drawio XML content. */
  diagram: string;
  /** Initial state of the state machine. */
  initialState: string;
  /** Allowed manual transitions for every state and whether they
  are an abort transition. */
  manualTransitions: StateMachineManualTransitions;
  /** Mapping of state names to diagram cell ids. */
  stateNodes: StateMachineStateNodes;
}

export type TileKind =
  | {
      type: "raster";
      /** Template URL for fetching a raster tile (e.g., https://tile.openstreetmap.org/{z}/{x}/{y}.png). */
      url: string;
    }
  | {
      /** Absolute URL to the location where the fonts for the vector layers are served (e.g., http://localhost:8888/fonts) */
      fonts: string;
      /** Absolute URL to the location where the sprites for the vector layers are served (e.g., http://localhost:8888/sprites) */
      sprites: string;
      type: "vector";
      /** Absolute URL to the location where the vector tiles are served (e.g., http://localhost:8888/data/test.pmtiles) */
      url: string;
    };

export type TileServer = TileKind & {
  /** Description about the tile server. */
  description: string;
};

export type TileServers200 = { [key: string]: TileServer };
