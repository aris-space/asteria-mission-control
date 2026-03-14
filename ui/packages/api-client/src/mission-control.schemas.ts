/**
 * Represents the current state of an actuator as detected by a board.

## Notes
Detection of actuator presence is only possible before power is applied to the actuator.
Once powered, actuator detection is no longer possible.
 */
export type ActuatorStatus =
  (typeof ActuatorStatus)[keyof typeof ActuatorStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ActuatorStatus = {
  notConnected: "notConnected",
  connected: "connected",
  powerOn: "powerOn",
} as const;

/**
 * Represents the current arming state of the subsystem
 */
export type ArmingState = (typeof ArmingState)[keyof typeof ArmingState];

// eslint-disable-next-line @typescript-eslint/no-redeclare
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
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

/**
 * Enabled with pressure setpoint in Barg. 0-60.
 */
export type DPRValveOneOfEnabled = {
  /** 0-60 barg */
  setpoint: number;
};

/**
 * Enabled with pressure setpoint in Barg. 0-60.
 */
export type DPRValveOneOf = {
  /** Enabled with pressure setpoint in Barg. 0-60. */
  enabled: DPRValveOneOfEnabled;
};

export type DPRValve = DPRValveOneOf | "disabled";

export interface EngineBayTemperature {
  /** Oxidizer Runline temperature in °C. */
  ossRnlT: Celsius;
  /** Oxidizer Tank Bottom temperature in °C. */
  ossTnkT: Celsius;
}

export type EngineControlBoardMessageOneOfType =
  (typeof EngineControlBoardMessageOneOfType)[keyof typeof EngineControlBoardMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `EngineControlBoardBuildInfo`
Firmware build metadata emitted by the Engine Control Board.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Engine Control Board firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type EngineControlBoardMessageOneOf = {
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
  type: EngineControlBoardMessageOneOfType;
};

export type EngineControlBoardMessageOneOfThreeType =
  (typeof EngineControlBoardMessageOneOfThreeType)[keyof typeof EngineControlBoardMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `EngineControlBoardStatus`
Periodic status message emitted by the Engine Control Board.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Engine Control Board.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type EngineControlBoardMessageOneOfThree = {
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
  type: EngineControlBoardMessageOneOfThreeType;
};

export type EngineControlBoardMessageOneOfFiveType =
  (typeof EngineControlBoardMessageOneOfFiveType)[keyof typeof EngineControlBoardMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfFiveType = {
  ValveStates: "ValveStates",
} as const;

/**
 * # `EngineControlBoardValveStates`
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
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type EngineControlBoardMessageOneOfFive = {
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
  type: EngineControlBoardMessageOneOfFiveType;
};

export type EngineControlBoardMessageOneOfSevenType =
  (typeof EngineControlBoardMessageOneOfSevenType)[keyof typeof EngineControlBoardMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfSevenType = {
  EnginePressure: "EnginePressure",
} as const;

/**
 * # `EnginePressure`
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
The value will be `NaN` if reading the sensor fails.
 */
export type EngineControlBoardMessageOneOfSeven = {
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
  type: EngineControlBoardMessageOneOfSevenType;
};

export type EngineControlBoardMessageOneOfNineType =
  (typeof EngineControlBoardMessageOneOfNineType)[keyof typeof EngineControlBoardMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfNineType = {
  EngineBayTemperature: "EngineBayTemperature",
} as const;

/**
 * # `EngineBayTemperature`
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
the value will be set to `NaN`.
 */
export type EngineControlBoardMessageOneOfNine = {
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
  type: EngineControlBoardMessageOneOfNineType;
};

export type EngineControlBoardMessageOneOfOneoneType =
  (typeof EngineControlBoardMessageOneOfOneoneType)[keyof typeof EngineControlBoardMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfOneoneType = {
  FiringAborted: "FiringAborted",
} as const;

/**
 * # `FiringAborted`
Event message sent by the ECU.

## Type
- `Event`: sent by the ECU to signalize an abort has occurred during the firing sequence

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `FlightComputer`

## Purpose
Signaling Firing aborts

## Reaction

 */
export type EngineControlBoardMessageOneOfOneone = {
  type: EngineControlBoardMessageOneOfOneoneType;
};

export type EngineControlBoardMessageOneOfOnethreeType =
  (typeof EngineControlBoardMessageOneOfOnethreeType)[keyof typeof EngineControlBoardMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfOnethreeType = {
  FiringCompleted: "FiringCompleted",
} as const;

/**
 * # `FiringCompleted`
Event message sent by the ECU.

## Type
- `Event`: sent by the ECU to signalize the firing sequence has successfully been completed

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Signaling completion of firing sequence

## Reaction

 */
export type EngineControlBoardMessageOneOfOnethree = {
  type: EngineControlBoardMessageOneOfOnethreeType;
};

export type EngineControlBoardMessageOneOfOnefiveType =
  (typeof EngineControlBoardMessageOneOfOnefiveType)[keyof typeof EngineControlBoardMessageOneOfOnefiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfOnefiveType = {
  FiringInitiated: "FiringInitiated",
} as const;

/**
 * # `FiringInitiated`
Event message sent by the EngineControlBoard.

## Type
- `Event`: sent by the ECU to signal firing initiation

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Signal initiation of firing sequence

## Reaction

 */
export type EngineControlBoardMessageOneOfOnefive = {
  type: EngineControlBoardMessageOneOfOnefiveType;
};

export type EngineControlBoardMessageOneOfOnesevenType =
  (typeof EngineControlBoardMessageOneOfOnesevenType)[keyof typeof EngineControlBoardMessageOneOfOnesevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfOnesevenType = {
  IgnitionDetected: "IgnitionDetected",
} as const;

/**
 * # `IgnitionDetected`
Event message sent by the EngineControlBoard.

## Type
- `Event`: sent by the ECU to signal successful igniter ignition

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Signal successful igniter ignition

## Reaction

 */
export type EngineControlBoardMessageOneOfOneseven = {
  type: EngineControlBoardMessageOneOfOnesevenType;
};

export type EngineControlBoardMessageOneOfOnenineType =
  (typeof EngineControlBoardMessageOneOfOnenineType)[keyof typeof EngineControlBoardMessageOneOfOnenineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfOnenineType = {
  CombustionDetected: "CombustionDetected",
} as const;

/**
 * # `CombustionDetected`
Event message sent by the EngineControlBoard.

## Type
- `Event`: sent by the ECU to signal successful engine combustion

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `unspecified`

## Purpose
Signal successful engine combustion

## Reaction

 */
export type EngineControlBoardMessageOneOfOnenine = {
  type: EngineControlBoardMessageOneOfOnenineType;
};

export type EngineControlBoardMessageOneOfTwooneType =
  (typeof EngineControlBoardMessageOneOfTwooneType)[keyof typeof EngineControlBoardMessageOneOfTwooneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfTwooneType = {
  ThrustCurveConfig: "ThrustCurveConfig",
} as const;

/**
 * # `ThrustCurveConfig`
Event message sent by the FC.

## Type
- `Event`: sent by the FC configure the Launch Thrust Curve

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `EngineControlBoard`

## Purpose
Transmit the flight thrust curve to the Engine Control Board.

## Reaction

 */
export type EngineControlBoardMessageOneOfTwoone = {
  /** # `ThrustCurveConfig`
Event message sent by the FC.

## Type
- `Event`: sent by the FC configure the Launch Thrust Curve

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `EngineControlBoard`

## Purpose
Transmit the flight thrust curve to the Engine Control Board.

## Reaction
 */
  content: ThrustCurveConfig;
  type: EngineControlBoardMessageOneOfTwooneType;
};

export type EngineControlBoardMessageOneOfTwothreeType =
  (typeof EngineControlBoardMessageOneOfTwothreeType)[keyof typeof EngineControlBoardMessageOneOfTwothreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfTwothreeType = {
  FiringAbortInitiation: "FiringAbortInitiation",
} as const;

/**
 *  # `FiringAbortInitiation`
 Event message sent by the FC.

 ## Type
 - `Event`: sent by the FC to initialize a firing abort

 ## Direction
 - **Emitted by:** `FlightComputer`
 - **Received by:** `EngineControlBoard`
datapoints/dp-flight-computer/src
 ## Purpose
 Initiate abortion of firing sequence

 ## Reaction
 The ECU should properly abort the firing
 */
export type EngineControlBoardMessageOneOfTwothree = {
  type: EngineControlBoardMessageOneOfTwothreeType;
};

export type EngineControlBoardMessageOneOfTwofiveType =
  (typeof EngineControlBoardMessageOneOfTwofiveType)[keyof typeof EngineControlBoardMessageOneOfTwofiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfTwofiveType = {
  FiringInitiation: "FiringInitiation",
} as const;

/**
 * # `FiringInitiation`
Event message sent by the FC.

## Type
- `Event`: sent by the FC to initiate firing sequence

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `EngineControlBoard`

## Purpose
Initiate firing sequence

## Reaction
The Engine Control Board shall initiate the firing sequence upon receiving this command
 */
export type EngineControlBoardMessageOneOfTwofive = {
  type: EngineControlBoardMessageOneOfTwofiveType;
};

export type EngineControlBoardMessageOneOfTwosevenType =
  (typeof EngineControlBoardMessageOneOfTwosevenType)[keyof typeof EngineControlBoardMessageOneOfTwosevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfTwosevenType = {
  OxidizerMainControlFC: "OxidizerMainControlFC",
} as const;

/**
 * # `OxidizerMainControlFC`
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
The Valve is Normally Closed
 */
export type EngineControlBoardMessageOneOfTwoseven = {
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
  type: EngineControlBoardMessageOneOfTwosevenType;
};

export type EngineControlBoardMessageOneOfTwonineType =
  (typeof EngineControlBoardMessageOneOfTwonineType)[keyof typeof EngineControlBoardMessageOneOfTwonineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfTwonineType = {
  OxidizerMainControlRFS: "OxidizerMainControlRFS",
} as const;

/**
 * # `OxidizerMainControlRFS`
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
The Valve is Normally Closed
 */
export type EngineControlBoardMessageOneOfTwonine = {
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
  type: EngineControlBoardMessageOneOfTwonineType;
};

export type EngineControlBoardMessageOneOfThreeoneType =
  (typeof EngineControlBoardMessageOneOfThreeoneType)[keyof typeof EngineControlBoardMessageOneOfThreeoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfThreeoneType = {
  FuelMainControlFC: "FuelMainControlFC",
} as const;

/**
 * # `FuelMainControlFC`
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
The Valve is Normally Closed
 */
export type EngineControlBoardMessageOneOfThreeone = {
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
  type: EngineControlBoardMessageOneOfThreeoneType;
};

export type EngineControlBoardMessageOneOfThreethreeType =
  (typeof EngineControlBoardMessageOneOfThreethreeType)[keyof typeof EngineControlBoardMessageOneOfThreethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EngineControlBoardMessageOneOfThreethreeType = {
  FuelMainControlRFS: "FuelMainControlRFS",
} as const;

/**
 * # `FuelMainControlRFS`
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
The Valve is Normally Closed
 */
export type EngineControlBoardMessageOneOfThreethree = {
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
  type: EngineControlBoardMessageOneOfThreethreeType;
};

export type EngineControlBoardMessage =
  | EngineControlBoardMessageOneOf
  | EngineControlBoardMessageOneOfThree
  | EngineControlBoardMessageOneOfFive
  | EngineControlBoardMessageOneOfSeven
  | EngineControlBoardMessageOneOfNine
  | EngineControlBoardMessageOneOfOneone
  | EngineControlBoardMessageOneOfOnethree
  | EngineControlBoardMessageOneOfOnefive
  | EngineControlBoardMessageOneOfOneseven
  | EngineControlBoardMessageOneOfOnenine
  | EngineControlBoardMessageOneOfTwoone
  | EngineControlBoardMessageOneOfTwothree
  | EngineControlBoardMessageOneOfTwofive
  | EngineControlBoardMessageOneOfTwoseven
  | EngineControlBoardMessageOneOfTwonine
  | EngineControlBoardMessageOneOfThreeone
  | EngineControlBoardMessageOneOfThreethree;

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

export type FlightComputerMessageOneOfType =
  (typeof FlightComputerMessageOneOfType)[keyof typeof FlightComputerMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FlightComputerMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `FlightComputerBuildInfo`
Firmware build metadata emitted by the Flight Computer.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Flight Computer firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type FlightComputerMessageOneOf = {
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
  type: FlightComputerMessageOneOfType;
};

export type FlightComputerMessageOneOfThreeType =
  (typeof FlightComputerMessageOneOfThreeType)[keyof typeof FlightComputerMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FlightComputerMessageOneOfThreeType = {
  Status: "Status",
} as const;

/**
 * # `FlightComputerStatus`
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
It is also used to only arm the RFS if the FC is armed and ensure exclusive PSS control.
 */
export type FlightComputerMessageOneOfThree = {
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
  type: FlightComputerMessageOneOfThreeType;
};

export type FlightComputerMessage =
  | FlightComputerMessageOneOf
  | FlightComputerMessageOneOfThree;

export interface FlightComputerStatus {
  common: StatusCommonMessage;
  /** `true` if the flight computer asserts control over the PSS valves via CAN.
In other words, if passive mode is disabled. */
  hasPssControl: boolean;
  /** `Armed` if the flight computer is in the `Armed` state for launch,
which enables REC actuator power and allows an ignition command. */
  isSoftwareArmed: ArmingState;
}

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

export type FueldControlBoardMessageOneOfType =
  (typeof FueldControlBoardMessageOneOfType)[keyof typeof FueldControlBoardMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `FuelControlBoardBuildInfo`
Firmware build metadata emitted by the Fuel Control Board.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `FuelControlBoard`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Fuel Control Board firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type FueldControlBoardMessageOneOf = {
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
  type: FueldControlBoardMessageOneOfType;
};

export type FueldControlBoardMessageOneOfThreeType =
  (typeof FueldControlBoardMessageOneOfThreeType)[keyof typeof FueldControlBoardMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `FuelControlBoardStatus`
Periodic status message emitted by the Fuel Control Board.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `FuelControlBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Fuel Control Board, including sensor.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type FueldControlBoardMessageOneOfThree = {
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
  type: FueldControlBoardMessageOneOfThreeType;
};

export type FueldControlBoardMessageOneOfFiveType =
  (typeof FueldControlBoardMessageOneOfFiveType)[keyof typeof FueldControlBoardMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfFiveType = {
  ValveStates: "ValveStates",
} as const;

/**
 * # `FuelControlBoardValveStates`
Periodic status message emitted by the Fuel Control Board.

## Type
- `Periodic @ 5 Hz`

## Direction
- **Emitted by:** `FuelControlBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the Valve State of all Valves controlled by the Fuel Control Board, including the DPR control loop state and setpoint.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type FueldControlBoardMessageOneOfFive = {
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
  type: FueldControlBoardMessageOneOfFiveType;
};

export type FueldControlBoardMessageOneOfSevenType =
  (typeof FueldControlBoardMessageOneOfSevenType)[keyof typeof FueldControlBoardMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfSevenType = {
  FuelPressurizationCompleted: "FuelPressurizationCompleted",
} as const;

/**
 * # `FuelPressurizationCompleted`
Event message sent by the FuelControlBoard.

## Type
- `Event`: sent by the FCB to signal completed pressurization on the FuelControlBoard

## Direction
- **Emitted by:** `FuelControlBoard`
- **Received by:** `FlightComputer`

## Purpose
Signal completion of Fuel Tank pressurization

## Reaction

 */
export type FueldControlBoardMessageOneOfSeven = {
  type: FueldControlBoardMessageOneOfSevenType;
};

export type FueldControlBoardMessageOneOfNineType =
  (typeof FueldControlBoardMessageOneOfNineType)[keyof typeof FueldControlBoardMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfNineType = {
  FuelPressurization: "FuelPressurization",
} as const;

/**
 * # `FuelPressurization`
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
export type FueldControlBoardMessageOneOfNine = {
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
  type: FueldControlBoardMessageOneOfNineType;
};

export type FueldControlBoardMessageOneOfOneoneType =
  (typeof FueldControlBoardMessageOneOfOneoneType)[keyof typeof FueldControlBoardMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfOneoneType = {
  FuelPressurizationGain: "FuelPressurizationGain",
} as const;

/**
 * # `FuelPressurizationGain`
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
export type FueldControlBoardMessageOneOfOneone = {
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
  type: FueldControlBoardMessageOneOfOneoneType;
};

export type FueldControlBoardMessageOneOfOnethreeType =
  (typeof FueldControlBoardMessageOneOfOnethreeType)[keyof typeof FueldControlBoardMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfOnethreeType = {
  FuelPressurizationAbort: "FuelPressurizationAbort",
} as const;

/**
 * # `FuelPressurizationAbort`
Event message sent by the FC.

## Type
- `Event`: sent by the FC to abort pressurization on the FuelControlBoard

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `FuelControlBoard`

## Purpose
Abort Fuel Tank pressurization

## Reaction

 */
export type FueldControlBoardMessageOneOfOnethree = {
  type: FueldControlBoardMessageOneOfOnethreeType;
};

export type FueldControlBoardMessageOneOfOnefiveType =
  (typeof FueldControlBoardMessageOneOfOnefiveType)[keyof typeof FueldControlBoardMessageOneOfOnefiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfOnefiveType = {
  FuelDprConfigFC: "FuelDprConfigFC",
} as const;

/**
 * # `FuelDprConfigFC`
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
The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly
 */
export type FueldControlBoardMessageOneOfOnefive = {
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
  type: FueldControlBoardMessageOneOfOnefiveType;
};

export type FueldControlBoardMessageOneOfOnesevenType =
  (typeof FueldControlBoardMessageOneOfOnesevenType)[keyof typeof FueldControlBoardMessageOneOfOnesevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfOnesevenType = {
  PressurizationVentControlFC: "PressurizationVentControlFC",
} as const;

/**
 * # `PressurizationVentControlFC`
Event message sent by the FC.

## Type
- `Event`: sent by the FC

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the N2 Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust N2 Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfOneseven = {
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
  type: FueldControlBoardMessageOneOfOnesevenType;
};

export type FueldControlBoardMessageOneOfOnenineType =
  (typeof FueldControlBoardMessageOneOfOnenineType)[keyof typeof FueldControlBoardMessageOneOfOnenineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfOnenineType = {
  FuelVentControlFC: "FuelVentControlFC",
} as const;

/**
 * # `FuelVentControlFC`
Event message sent by the FC.

## Type
- `Event`: sent by the FC

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the Fuel Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfOnenine = {
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
  type: FueldControlBoardMessageOneOfOnenineType;
};

export type FueldControlBoardMessageOneOfTwooneType =
  (typeof FueldControlBoardMessageOneOfTwooneType)[keyof typeof FueldControlBoardMessageOneOfTwooneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfTwooneType = {
  FuelDprConfigECU: "FuelDprConfigECU",
} as const;

/**
 * # `FuelDprConfigECU`
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
The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly
 */
export type FueldControlBoardMessageOneOfTwoone = {
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
  type: FueldControlBoardMessageOneOfTwooneType;
};

export type FueldControlBoardMessageOneOfTwothreeType =
  (typeof FueldControlBoardMessageOneOfTwothreeType)[keyof typeof FueldControlBoardMessageOneOfTwothreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfTwothreeType = {
  PressurizationVentControlECU: "PressurizationVentControlECU",
} as const;

/**
 * # `PressurizationVentControlECU`
Event message sent by the ECU.

## Type
- `Event`: sent by the ECU

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the N2 Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust N2 Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfTwothree = {
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
  type: FueldControlBoardMessageOneOfTwothreeType;
};

export type FueldControlBoardMessageOneOfTwofiveType =
  (typeof FueldControlBoardMessageOneOfTwofiveType)[keyof typeof FueldControlBoardMessageOneOfTwofiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfTwofiveType = {
  FuelVentControlECU: "FuelVentControlECU",
} as const;

/**
 * # `FuelVentControlECU`
Event message sent by the ECU.

## Type
- `Event`: sent by the ECU

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the Fuel Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfTwofive = {
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
  type: FueldControlBoardMessageOneOfTwofiveType;
};

export type FueldControlBoardMessageOneOfTwosevenType =
  (typeof FueldControlBoardMessageOneOfTwosevenType)[keyof typeof FueldControlBoardMessageOneOfTwosevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfTwosevenType = {
  FuelDprConfigRFS: "FuelDprConfigRFS",
} as const;

/**
 * # `FuelDprConfigRFS`
Event message sent by the RFS.

## Type
- `Event`: sent by the RFS

## Direction
- **Emitted by:** `RemoteFillingStation`
- **Received by:** `FuelControlBoard`

## Purpose
Set ETH Pressure Regulator configuration

## Reaction
The Fuel Control Board shall adjust the FUE DPR setpoint and enable/disable the controller accordingly
 */
export type FueldControlBoardMessageOneOfTwoseven = {
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
  type: FueldControlBoardMessageOneOfTwosevenType;
};

export type FueldControlBoardMessageOneOfTwonineType =
  (typeof FueldControlBoardMessageOneOfTwonineType)[keyof typeof FueldControlBoardMessageOneOfTwonineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfTwonineType = {
  PressurizationVentControlRFS: "PressurizationVentControlRFS",
} as const;

/**
 * # `PressurizationVentControlRFS`
Event message sent by the RFS.

## Type
- `Event`: sent by the RFS

## Direction
- **Emitted by:** `RemoteFillingStation`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the N2 Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust N2 Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfTwonine = {
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
  type: FueldControlBoardMessageOneOfTwonineType;
};

export type FueldControlBoardMessageOneOfThreeoneType =
  (typeof FueldControlBoardMessageOneOfThreeoneType)[keyof typeof FueldControlBoardMessageOneOfThreeoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FueldControlBoardMessageOneOfThreeoneType = {
  FuelVentControlRFS: "FuelVentControlRFS",
} as const;

/**
 * # `FuelVentControlRFS`
Event message sent by the RFS.

## Type
- `Event`: sent by the RFS

## Direction
- **Emitted by:** `RemoteFillingStation`
- **Received by:** `FuelControlBoard`

## Purpose
Sets the Fuel Vent Valve to a certain state.

## Reaction
The Fuel Control Board shall adjust the Fuel Vent Valve state accordingly
 */
export type FueldControlBoardMessageOneOfThreeone = {
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
  type: FueldControlBoardMessageOneOfThreeoneType;
};

export type FueldControlBoardMessage =
  | FueldControlBoardMessageOneOf
  | FueldControlBoardMessageOneOfThree
  | FueldControlBoardMessageOneOfFive
  | FueldControlBoardMessageOneOfSeven
  | FueldControlBoardMessageOneOfNine
  | FueldControlBoardMessageOneOfOneone
  | FueldControlBoardMessageOneOfOnethree
  | FueldControlBoardMessageOneOfOnefive
  | FueldControlBoardMessageOneOfOneseven
  | FueldControlBoardMessageOneOfOnenine
  | FueldControlBoardMessageOneOfTwoone
  | FueldControlBoardMessageOneOfTwothree
  | FueldControlBoardMessageOneOfTwofive
  | FueldControlBoardMessageOneOfTwoseven
  | FueldControlBoardMessageOneOfTwonine
  | FueldControlBoardMessageOneOfThreeone;

/**
 * 
Is `NAN` by default.
Atmospheric pressure in hPa.
 */
export type HPa = number;

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
  /** Default scenario from current configuration file */
  default_scenario: string;
  /** Git version of the mission control server */
  version: string;
}

/**
 * UTC timestamp given in microseconds since the Unix epoch (`1970-01-01T00:00:00Z`).

This value is derived from the GPS time sensors and is therefore highly accurate.
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

export type MessageOneOfBoard =
  (typeof MessageOneOfBoard)[keyof typeof MessageOneOfBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfBoard = {
  FlightComputer: "FlightComputer",
} as const;

export type MessageOneOf = {
  board: MessageOneOfBoard;
  message: FlightComputerMessage;
};

export type MessageOneOfThreeBoard =
  (typeof MessageOneOfThreeBoard)[keyof typeof MessageOneOfThreeBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfThreeBoard = {
  RfsComputer: "RfsComputer",
} as const;

export type MessageOneOfThree = {
  board: MessageOneOfThreeBoard;
  message: RfsComputerMessage;
};

export type MessageOneOfFiveBoard =
  (typeof MessageOneOfFiveBoard)[keyof typeof MessageOneOfFiveBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfFiveBoard = {
  SystemManagement: "SystemManagement",
} as const;

export type MessageOneOfFive = {
  board: MessageOneOfFiveBoard;
  message: SystemManagementMessage;
};

export type MessageOneOfSevenBoard =
  (typeof MessageOneOfSevenBoard)[keyof typeof MessageOneOfSevenBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfSevenBoard = {
  RecoveryBoard: "RecoveryBoard",
} as const;

export type MessageOneOfSeven = {
  board: MessageOneOfSevenBoard;
  message: RecoveryBoardMessage;
};

export type MessageOneOfNineBoard =
  (typeof MessageOneOfNineBoard)[keyof typeof MessageOneOfNineBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfNineBoard = {
  PowerBoard: "PowerBoard",
} as const;

export type MessageOneOfNine = {
  board: MessageOneOfNineBoard;
  message: PowerBoardMessage;
};

export type MessageOneOfOneoneBoard =
  (typeof MessageOneOfOneoneBoard)[keyof typeof MessageOneOfOneoneBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfOneoneBoard = {
  SensorCarrier: "SensorCarrier",
} as const;

export type MessageOneOfOneone = {
  board: MessageOneOfOneoneBoard;
  message: SensorCarrierMessage;
};

export type MessageOneOfOnethreeBoard =
  (typeof MessageOneOfOnethreeBoard)[keyof typeof MessageOneOfOnethreeBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfOnethreeBoard = {
  FuelControlBoard: "FuelControlBoard",
} as const;

export type MessageOneOfOnethree = {
  board: MessageOneOfOnethreeBoard;
  message: FueldControlBoardMessage;
};

export type MessageOneOfOnefiveBoard =
  (typeof MessageOneOfOnefiveBoard)[keyof typeof MessageOneOfOnefiveBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfOnefiveBoard = {
  OxidizerControlBoard: "OxidizerControlBoard",
} as const;

export type MessageOneOfOnefive = {
  board: MessageOneOfOnefiveBoard;
  message: OxidizerControlBoardMessage;
};

export type MessageOneOfOnesevenBoard =
  (typeof MessageOneOfOnesevenBoard)[keyof typeof MessageOneOfOnesevenBoard];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MessageOneOfOnesevenBoard = {
  EngineControlBoard: "EngineControlBoard",
} as const;

export type MessageOneOfOneseven = {
  board: MessageOneOfOnesevenBoard;
  message: EngineControlBoardMessage;
};

/**
 * All messages in the full system
 */
export type Message =
  | MessageOneOf
  | MessageOneOfThree
  | MessageOneOfFive
  | MessageOneOfSeven
  | MessageOneOfNine
  | MessageOneOfOneone
  | MessageOneOfOnethree
  | MessageOneOfOnefive
  | MessageOneOfOneseven;

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

export type OxidizerControlBoardMessageOneOfType =
  (typeof OxidizerControlBoardMessageOneOfType)[keyof typeof OxidizerControlBoardMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `OxidizerControlBoardBuildInfo`
Firmware build metadata emitted by the Oxidizer Control Board.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `OxidizerControlBoard`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Oxidizer Control Board firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type OxidizerControlBoardMessageOneOf = {
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
  type: OxidizerControlBoardMessageOneOfType;
};

export type OxidizerControlBoardMessageOneOfThreeType =
  (typeof OxidizerControlBoardMessageOneOfThreeType)[keyof typeof OxidizerControlBoardMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `OxidizerControlBoardStatus`
Periodic status message emitted by the Oxidizer Control Board.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `OxidizerControlBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Oxidizer Control Board, including sensor.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type OxidizerControlBoardMessageOneOfThree = {
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
  type: OxidizerControlBoardMessageOneOfThreeType;
};

export type OxidizerControlBoardMessageOneOfFiveType =
  (typeof OxidizerControlBoardMessageOneOfFiveType)[keyof typeof OxidizerControlBoardMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfFiveType = {
  ValveStates: "ValveStates",
} as const;

/**
 * # `OxidizerControlBoardValveStates`
Periodic status message emitted by the Oxidizer Control Board.

## Type
- `Periodic @ 5 Hz`

## Direction
- **Emitted by:** `OxidizerControlBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the Valve State of all Valves controlled by the Oxidizer Control Board, including the DPR control loop state and setpoint.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type OxidizerControlBoardMessageOneOfFive = {
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
  type: OxidizerControlBoardMessageOneOfFiveType;
};

export type OxidizerControlBoardMessageOneOfSevenType =
  (typeof OxidizerControlBoardMessageOneOfSevenType)[keyof typeof OxidizerControlBoardMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfSevenType = {
  OxidizerPressurizationCompleted: "OxidizerPressurizationCompleted",
} as const;

/**
 * # `OxidizerPressurizationCompleted`
Event message sent by the OxidizerControlBoard

## Type
- `Event`: sent by the OCB to signal completed pressurization on the OxidizerControlBoard

## Direction
- **Emitted by:** `OxidizerControlBoard`
- **Received by:** `FlightComputer`

## Purpose
Signal completion of Oxidizer Tank pressurization

## Reaction

 */
export type OxidizerControlBoardMessageOneOfSeven = {
  type: OxidizerControlBoardMessageOneOfSevenType;
};

export type OxidizerControlBoardMessageOneOfNineType =
  (typeof OxidizerControlBoardMessageOneOfNineType)[keyof typeof OxidizerControlBoardMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfNineType = {
  OxidizerPressurization: "OxidizerPressurization",
} as const;

/**
 * # `OxidizerPressurization`
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
export type OxidizerControlBoardMessageOneOfNine = {
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
  type: OxidizerControlBoardMessageOneOfNineType;
};

export type OxidizerControlBoardMessageOneOfOneoneType =
  (typeof OxidizerControlBoardMessageOneOfOneoneType)[keyof typeof OxidizerControlBoardMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfOneoneType = {
  OxidizerPressurizationGain: "OxidizerPressurizationGain",
} as const;

/**
 * # `OxidizerPressurizationGain`
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
export type OxidizerControlBoardMessageOneOfOneone = {
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
  type: OxidizerControlBoardMessageOneOfOneoneType;
};

export type OxidizerControlBoardMessageOneOfOnethreeType =
  (typeof OxidizerControlBoardMessageOneOfOnethreeType)[keyof typeof OxidizerControlBoardMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfOnethreeType = {
  OxidizerPressurizationAbort: "OxidizerPressurizationAbort",
} as const;

/**
 * # `OxidizerPressurizationAbort`
Event message sent by the FC.

## Type
- `Event`: sent by the FC to abort pressurization on the OxidizerControlBoard

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `OxidizerControlBoard`

## Purpose
Abort Oxidizer Tank pressurization

## Reaction

 */
export type OxidizerControlBoardMessageOneOfOnethree = {
  type: OxidizerControlBoardMessageOneOfOnethreeType;
};

export type OxidizerControlBoardMessageOneOfOnefiveType =
  (typeof OxidizerControlBoardMessageOneOfOnefiveType)[keyof typeof OxidizerControlBoardMessageOneOfOnefiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfOnefiveType = {
  OxidizerDprConfigFC: "OxidizerDprConfigFC",
} as const;

/**
 * # `OxidizerDprConfigFC`
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
The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly
 */
export type OxidizerControlBoardMessageOneOfOnefive = {
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
  type: OxidizerControlBoardMessageOneOfOnefiveType;
};

export type OxidizerControlBoardMessageOneOfOnesevenType =
  (typeof OxidizerControlBoardMessageOneOfOnesevenType)[keyof typeof OxidizerControlBoardMessageOneOfOnesevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfOnesevenType = {
  OxidizerVentControlFC: "OxidizerVentControlFC",
} as const;

/**
 * # `OxidizerVentControlFC`
Event message sent by the FC.

## Type
- `Event`: sent by the FC

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `OxidizerControlBoard`

## Purpose
Sets the Oxidizer Vent Valve to a certain state.

## Reaction
The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly
 */
export type OxidizerControlBoardMessageOneOfOneseven = {
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
  type: OxidizerControlBoardMessageOneOfOnesevenType;
};

export type OxidizerControlBoardMessageOneOfOnenineType =
  (typeof OxidizerControlBoardMessageOneOfOnenineType)[keyof typeof OxidizerControlBoardMessageOneOfOnenineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfOnenineType = {
  OxidizerDprConfigECU: "OxidizerDprConfigECU",
} as const;

/**
 * # `OxidizerDprConfigECU`
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
The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly
 */
export type OxidizerControlBoardMessageOneOfOnenine = {
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
  type: OxidizerControlBoardMessageOneOfOnenineType;
};

export type OxidizerControlBoardMessageOneOfTwooneType =
  (typeof OxidizerControlBoardMessageOneOfTwooneType)[keyof typeof OxidizerControlBoardMessageOneOfTwooneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfTwooneType = {
  OxidizerVentControlECU: "OxidizerVentControlECU",
} as const;

/**
 * # `OxidizerVentControlECU`
Event message sent by the ECU.

## Type
- `Event`: sent by the ECU

## Direction
- **Emitted by:** `EngineControlBoard`
- **Received by:** `OxidizerControlBoard`

## Purpose
Sets the Oxidizer Vent Valve to a certain state.

## Reaction
The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly
 */
export type OxidizerControlBoardMessageOneOfTwoone = {
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
  type: OxidizerControlBoardMessageOneOfTwooneType;
};

export type OxidizerControlBoardMessageOneOfTwothreeType =
  (typeof OxidizerControlBoardMessageOneOfTwothreeType)[keyof typeof OxidizerControlBoardMessageOneOfTwothreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfTwothreeType = {
  OxidizerDprConfigRFS: "OxidizerDprConfigRFS",
} as const;

/**
 * # `OxidizerDprConfigRFS`
Event message sent by the RFS.

## Type
- `Event`: sent by the RFS

## Direction
- **Emitted by:** `RemoteFillingStation`
- **Received by:** `OxidizerControlBoard`

## Purpose
Set OXD Pressure Regulator configuration

## Reaction
The Oxidizer Control Board shall adjust the OXD DPR setpoint and enable/disable the controller accordingly
 */
export type OxidizerControlBoardMessageOneOfTwothree = {
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
  type: OxidizerControlBoardMessageOneOfTwothreeType;
};

export type OxidizerControlBoardMessageOneOfTwofiveType =
  (typeof OxidizerControlBoardMessageOneOfTwofiveType)[keyof typeof OxidizerControlBoardMessageOneOfTwofiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OxidizerControlBoardMessageOneOfTwofiveType = {
  OxidizerVentControlRFS: "OxidizerVentControlRFS",
} as const;

/**
 * # `OxidizerVentControlRFS`
Event message sent by the RFS.

## Type
- `Event`: sent by the RFS

## Direction
- **Emitted by:** `RemoteFillingStation`
- **Received by:** `OxidizerControlBoard`

## Purpose
Sets the Oxidizer Vent Valve to a certain state.

## Reaction
The Oxidizer Control Board shall adjust the Oxidizer Vent Valve state accordingly
 */
export type OxidizerControlBoardMessageOneOfTwofive = {
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
  type: OxidizerControlBoardMessageOneOfTwofiveType;
};

export type OxidizerControlBoardMessage =
  | OxidizerControlBoardMessageOneOf
  | OxidizerControlBoardMessageOneOfThree
  | OxidizerControlBoardMessageOneOfFive
  | OxidizerControlBoardMessageOneOfSeven
  | OxidizerControlBoardMessageOneOfNine
  | OxidizerControlBoardMessageOneOfOneone
  | OxidizerControlBoardMessageOneOfOnethree
  | OxidizerControlBoardMessageOneOfOnefive
  | OxidizerControlBoardMessageOneOfOneseven
  | OxidizerControlBoardMessageOneOfOnenine
  | OxidizerControlBoardMessageOneOfTwoone
  | OxidizerControlBoardMessageOneOfTwothree
  | OxidizerControlBoardMessageOneOfTwofive;

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

export type PowerBoardMessageOneOfType =
  (typeof PowerBoardMessageOneOfType)[keyof typeof PowerBoardMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `PowerBoardBuildInfo`
Firmware build metadata emitted by the Power Board.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `PowerBoard`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Power Board firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type PowerBoardMessageOneOf = {
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
  type: PowerBoardMessageOneOfType;
};

export type PowerBoardMessageOneOfThreeType =
  (typeof PowerBoardMessageOneOfThreeType)[keyof typeof PowerBoardMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `PowerBoardStatus`
Periodic status message emitted by the Power Board.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `PowerBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Power Board.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type PowerBoardMessageOneOfThree = {
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
  type: PowerBoardMessageOneOfThreeType;
};

export type PowerBoardMessageOneOfFiveType =
  (typeof PowerBoardMessageOneOfFiveType)[keyof typeof PowerBoardMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfFiveType = {
  RailStatus5V: "RailStatus5V",
} as const;

/**
 * # `RailStatus5V`
Periodic telemetry message reporting the 5V rail parameters.

## Type
- Periodic @ 10Hz

## Direction
- **Emitted by:** `PowerBoard`
- **Received by:** unspecified

## Purpose
Reports the measured voltage, current, and power on the 5V power rail.

## Reaction
Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range.
 */
export type PowerBoardMessageOneOfFive = {
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
  type: PowerBoardMessageOneOfFiveType;
};

export type PowerBoardMessageOneOfSevenType =
  (typeof PowerBoardMessageOneOfSevenType)[keyof typeof PowerBoardMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfSevenType = {
  RailStatus24V: "RailStatus24V",
} as const;

/**
 * # `RailStatus24V`
Periodic telemetry message reporting the 24V rail parameters.

## Type
- Periodic @ 10Hz

## Direction
- **Emitted by:** `PowerBoard`
- **Received by:** unspecified

## Purpose
Reports the measured voltage, current, and power on the 24V power rail.

## Reaction
Receivers may log, display, or track these values. They may trigger warnings if any measurement is out of nominal range.
 */
export type PowerBoardMessageOneOfSeven = {
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
  type: PowerBoardMessageOneOfSevenType;
};

export type PowerBoardMessageOneOfNineType =
  (typeof PowerBoardMessageOneOfNineType)[keyof typeof PowerBoardMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfNineType = {
  CameraPowerControl: "CameraPowerControl",
} as const;

/**
 * # `CameraPowerControl`
Controls the camera power lines.

## Type
- `Event`: triggered to toggle camera power outputs

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `PowerBoard`

## Purpose
Allows remote enabling/disabling of camera recording and live feed.

## Reaction
The Power Board sets the respective output pins according to the fields.
 */
export type PowerBoardMessageOneOfNine = {
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
  type: PowerBoardMessageOneOfNineType;
};

export type PowerBoardMessageOneOfOneoneType =
  (typeof PowerBoardMessageOneOfOneoneType)[keyof typeof PowerBoardMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PowerBoardMessageOneOfOneoneType = {
  CameraPowerStatus: "CameraPowerStatus",
} as const;

/**
 * # `CameraPowerStatus`
Periodic camera power status message emitted by the Power Board.

## Type
- `Periodic @ 5 Hz`, and instantly when the status changes.

## Direction
- **Emitted by:** `PowerBoard`
- **Received by:** `unspecified`

## Purpose
Communicates what the power state of the cameras should be as set by the power board.

## Reaction
No action required.
 */
export type PowerBoardMessageOneOfOneone = {
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
  type: PowerBoardMessageOneOfOneoneType;
};

export type PowerBoardMessage =
  | PowerBoardMessageOneOf
  | PowerBoardMessageOneOfThree
  | PowerBoardMessageOneOfFive
  | PowerBoardMessageOneOfSeven
  | PowerBoardMessageOneOfNine
  | PowerBoardMessageOneOfOneone;

/**
 * Pressurization Proportional Gain in [barg/ms]
opening_time = kp * (target_pressure - current_pressure), in milliseconds
 */
export type PressurizationGain = number;

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

export type RecoveryBoardMessageOneOfType =
  (typeof RecoveryBoardMessageOneOfType)[keyof typeof RecoveryBoardMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `RecoveryBoardBuildInfo`
Firmware build metadata emitted by the Recovery Board.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `RecoveryBoard`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Recovery Board firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type RecoveryBoardMessageOneOf = {
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
  type: RecoveryBoardMessageOneOfType;
};

export type RecoveryBoardMessageOneOfThreeType =
  (typeof RecoveryBoardMessageOneOfThreeType)[keyof typeof RecoveryBoardMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `RecoveryBoardStatus`
Periodic status message emitted by the Recovery Board.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `RecoveryBoard`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Recovery Board, including actuator and steering diagnostics.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type RecoveryBoardMessageOneOfThree = {
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
  type: RecoveryBoardMessageOneOfThreeType;
};

export type RecoveryBoardMessageOneOfFiveType =
  (typeof RecoveryBoardMessageOneOfFiveType)[keyof typeof RecoveryBoardMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfFiveType = {
  SteeringActualPositions: "SteeringActualPositions",
} as const;

/**
 * # `SteeringActualPositions`
Periodic event message emitted by the Recovery Board.

## Type
- `Periodic @ 10 Hz`, but only during active steering phase

## Direction
- **Emitted by:** `RecoveryBoard`
- **Received by:** `unspecified`

## Purpose
Returns the actual motor positions of the left and right steering actuators for monitoring or logging.

## Reaction
No action required.
 */
export type RecoveryBoardMessageOneOfFive = {
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
  type: RecoveryBoardMessageOneOfFiveType;
};

export type RecoveryBoardMessageOneOfSevenType =
  (typeof RecoveryBoardMessageOneOfSevenType)[keyof typeof RecoveryBoardMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfSevenType = {
  SeparationOccurred: "SeparationOccurred",
} as const;

/**
 * # `SeparationOccurred`
Event message indicating that separation has been triggered.

## Type
- `Event`: sent after separation is triggered

## Direction
- **Emitted by:** `RecoveryBoard`
- **Received by:** `unspecified`

## Purpose
Confirms that the Recovery Board has triggered the separation actuators.
Intended for logging, telemetry and other troubleshooting.

## Reaction
No action required.
 */
export type RecoveryBoardMessageOneOfSeven = {
  type: RecoveryBoardMessageOneOfSevenType;
};

export type RecoveryBoardMessageOneOfNineType =
  (typeof RecoveryBoardMessageOneOfNineType)[keyof typeof RecoveryBoardMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfNineType = {
  DeploymentOccurred: "DeploymentOccurred",
} as const;

/**
 * # `DeploymentOccurred`
Event message indicating that deployment has been triggered.

## Type
- `Event`: sent after triggering deployment

## Direction
- **Emitted by:** `RecoveryBoard`
- **Received by:** `unspecified`

## Purpose
Confirms that the Recovery Board has triggered the deployment actuators.
Intended for logging, telemetry and other troubleshooting.

## Reaction
No action required.
 */
export type RecoveryBoardMessageOneOfNine = {
  type: RecoveryBoardMessageOneOfNineType;
};

export type RecoveryBoardMessageOneOfOneoneType =
  (typeof RecoveryBoardMessageOneOfOneoneType)[keyof typeof RecoveryBoardMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfOneoneType = {
  SteeringTargetPositions: "SteeringTargetPositions",
} as const;

/**
 * # `SteeringTargetPositions`
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
right steering motors to the values indicated by `left_pos` and `right_pos` respectively.
 */
export type RecoveryBoardMessageOneOfOneone = {
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
  type: RecoveryBoardMessageOneOfOneoneType;
};

export type RecoveryBoardMessageOneOfOnethreeType =
  (typeof RecoveryBoardMessageOneOfOnethreeType)[keyof typeof RecoveryBoardMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfOnethreeType = {
  RecoveryPowerConfig: "RecoveryPowerConfig",
} as const;

/**
 * # `RecoveryPowerConfig`
Event message sent by the Flight Computer.

## Type
- `Event`: sent by the Flight Computer to change the actuator power state

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `RecoveryBoard`

## Purpose
Configures the power state for all Recovery Board actuators.

## Reaction
The Recovery Board shall switch power to the actuators as specified in the message.
 */
export type RecoveryBoardMessageOneOfOnethree = {
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
  type: RecoveryBoardMessageOneOfOnethreeType;
};

export type RecoveryBoardMessageOneOfOnefiveType =
  (typeof RecoveryBoardMessageOneOfOnefiveType)[keyof typeof RecoveryBoardMessageOneOfOnefiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfOnefiveType = {
  SeparationTrigger: "SeparationTrigger",
} as const;

/**
 * # `SeparationTrigger`
Event message indicating that separation shall be initiated.

## Type
- `Event`: sent when separation is triggered

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `RecoveryBoard`

## Purpose
Informs the Recovery Board that separation has occurred and that
it should trigger the separation actuators.

## Reaction
The Recovery Board shall immediately trigger the separation actuators.
 */
export type RecoveryBoardMessageOneOfOnefive = {
  type: RecoveryBoardMessageOneOfOnefiveType;
};

export type RecoveryBoardMessageOneOfOnesevenType =
  (typeof RecoveryBoardMessageOneOfOnesevenType)[keyof typeof RecoveryBoardMessageOneOfOnesevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecoveryBoardMessageOneOfOnesevenType = {
  DeploymentTrigger: "DeploymentTrigger",
} as const;

/**
 * # `DeploymentTrigger`
Event message indicating that deployment shall be initiated.

## Type
- `Event`: sent when main chute deployment is triggered

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** `RecoveryBoard`

## Purpose
Informs the Recovery Board that main chute deployment has been triggered
and that it should activate the deployment actuators.

## Reaction
The Recovery Board shall immediately trigger the deployment actuators.
 */
export type RecoveryBoardMessageOneOfOneseven = {
  type: RecoveryBoardMessageOneOfOnesevenType;
};

export type RecoveryBoardMessage =
  | RecoveryBoardMessageOneOf
  | RecoveryBoardMessageOneOfThree
  | RecoveryBoardMessageOneOfFive
  | RecoveryBoardMessageOneOfSeven
  | RecoveryBoardMessageOneOfNine
  | RecoveryBoardMessageOneOfOneone
  | RecoveryBoardMessageOneOfOnethree
  | RecoveryBoardMessageOneOfOnefive
  | RecoveryBoardMessageOneOfOneseven;

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

export type RfsComputerMessageOneOfType =
  (typeof RfsComputerMessageOneOfType)[keyof typeof RfsComputerMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `RfsComputerBuildInfo`
Firmware build metadata emitted by the RFS Computer.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `RfsComputer`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the RFS Computer firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type RfsComputerMessageOneOf = {
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
  type: RfsComputerMessageOneOfType;
};

export type RfsComputerMessageOneOfThreeType =
  (typeof RfsComputerMessageOneOfThreeType)[keyof typeof RfsComputerMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfThreeType = {
  Status: "Status",
} as const;

/**
 * # `RfsComputerStatus`
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
It is also used to only ingite if the RFS is armed and ensure exclusive PSS control.
 */
export type RfsComputerMessageOneOfThree = {
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
  type: RfsComputerMessageOneOfThreeType;
};

export type RfsComputerMessageOneOfFiveType =
  (typeof RfsComputerMessageOneOfFiveType)[keyof typeof RfsComputerMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfFiveType = {
  ValveStates: "ValveStates",
} as const;

/**
 * # `RfsComputerValveStates`
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
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type RfsComputerMessageOneOfFive = {
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
  type: RfsComputerMessageOneOfFiveType;
};

export type RfsComputerMessageOneOfSevenType =
  (typeof RfsComputerMessageOneOfSevenType)[keyof typeof RfsComputerMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfSevenType = {
  GoxIgniterValveControl: "GoxIgniterValveControl",
} as const;

/**
 * # `GoxIgniterValveControl`
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
The remote filling station shall adjust the GOX igniter valve state accordingly.
 */
export type RfsComputerMessageOneOfSeven = {
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
  type: RfsComputerMessageOneOfSevenType;
};

export type RfsComputerMessageOneOfNineType =
  (typeof RfsComputerMessageOneOfNineType)[keyof typeof RfsComputerMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfNineType = {
  H2IgniterValveControl: "H2IgniterValveControl",
} as const;

/**
 * # `H2IgniterValveControl`
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
The remote filling station shall adjust the H2 igniter valve state accordingly.
 */
export type RfsComputerMessageOneOfNine = {
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
  type: RfsComputerMessageOneOfNineType;
};

export type RfsComputerMessageOneOfOneoneType =
  (typeof RfsComputerMessageOneOfOneoneType)[keyof typeof RfsComputerMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfOneoneType = {
  IgniterSparkPlugControl: "IgniterSparkPlugControl",
} as const;

/**
 * # `IgniterSparkPlugControl`
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
The remote filling station shall adjust spark plug state accordingly.
 */
export type RfsComputerMessageOneOfOneone = {
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
  type: RfsComputerMessageOneOfOneoneType;
};

export type RfsComputerMessageOneOfOnethreeType =
  (typeof RfsComputerMessageOneOfOnethreeType)[keyof typeof RfsComputerMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RfsComputerMessageOneOfOnethreeType = {
  IgniterPurgeControl: "IgniterPurgeControl",
} as const;

/**
 * # `IgniterPurgeControl`
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
The remote filling station shall adjust the GOX and H2 purge valve state accordingly.
 */
export type RfsComputerMessageOneOfOnethree = {
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
  type: RfsComputerMessageOneOfOnethreeType;
};

export type RfsComputerMessage =
  | RfsComputerMessageOneOf
  | RfsComputerMessageOneOfThree
  | RfsComputerMessageOneOfFive
  | RfsComputerMessageOneOfSeven
  | RfsComputerMessageOneOfNine
  | RfsComputerMessageOneOfOneone
  | RfsComputerMessageOneOfOnethree;

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

export interface ScenarioInfo {
  /** Identifier of the scenario */
  id: string;
  /** Displayname of the scenario */
  name: string;
}

export type SensorCarrierMessageOneOfType =
  (typeof SensorCarrierMessageOneOfType)[keyof typeof SensorCarrierMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfType = {
  BuildInfo: "BuildInfo",
} as const;

/**
 * # `SensorCarrierBuildInfo`
Firmware build metadata emitted by the Sensor Carrier.

## Type
- `Periodic @ 0.2 Hz`

## Direction
- **Emitted by:** `SensorCarrier`
- **Received by:** `unspecified`

## Purpose
Allows version tracking and verification of the Sensor Carrier firmware.

## Reaction
Receivers may log or display the firmware version and build metadata.
 */
export type SensorCarrierMessageOneOf = {
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
  type: SensorCarrierMessageOneOfType;
};

export type SensorCarrierMessageOneOfThreeType =
  (typeof SensorCarrierMessageOneOfThreeType)[keyof typeof SensorCarrierMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfThreeType = {
  BoardStatus: "BoardStatus",
} as const;

/**
 * # `SensorCarrierStatus`
Periodic status message emitted by the Sensor Carrier.

## Type
- `Periodic @ 1 Hz`

## Direction
- **Emitted by:** `SensorCarrier`
- **Received by:** `unspecified`

## Purpose
Communicates the runtime health of the Sensor Carrier.

## Reaction
Receivers may log the data or use it for diagnostics and system health checks.
 */
export type SensorCarrierMessageOneOfThree = {
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
  type: SensorCarrierMessageOneOfThreeType;
};

export type SensorCarrierMessageOneOfFiveType =
  (typeof SensorCarrierMessageOneOfFiveType)[keyof typeof SensorCarrierMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfFiveType = {
  PositionData: "PositionData",
} as const;

/**
 * # `PositionData`
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
GNSS height is referred to mean sea level (HAMSL).
 */
export type SensorCarrierMessageOneOfFive = {
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
  type: SensorCarrierMessageOneOfFiveType;
};

export type SensorCarrierMessageOneOfSevenType =
  (typeof SensorCarrierMessageOneOfSevenType)[keyof typeof SensorCarrierMessageOneOfSevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfSevenType = {
  ImuData: "ImuData",
} as const;

/**
 * # `ImuData`
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
inertial yaw.
 */
export type SensorCarrierMessageOneOfSeven = {
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
  type: SensorCarrierMessageOneOfSevenType;
};

export type SensorCarrierMessageOneOfNineType =
  (typeof SensorCarrierMessageOneOfNineType)[keyof typeof SensorCarrierMessageOneOfNineType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfNineType = {
  VelocityData: "VelocityData",
} as const;

/**
 * # `VelocityData`
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

The vertical component (`velocity_z`) is not affected by errors in inertial yaw.
 */
export type SensorCarrierMessageOneOfNine = {
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
  type: SensorCarrierMessageOneOfNineType;
};

export type SensorCarrierMessageOneOfOneoneType =
  (typeof SensorCarrierMessageOneOfOneoneType)[keyof typeof SensorCarrierMessageOneOfOneoneType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfOneoneType = {
  OrientationData: "OrientationData",
} as const;

/**
 * # `OrientationData`
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

The emitted quaternion is always **normalised**.
 */
export type SensorCarrierMessageOneOfOneone = {
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
  type: SensorCarrierMessageOneOfOneoneType;
};

export type SensorCarrierMessageOneOfOnethreeType =
  (typeof SensorCarrierMessageOneOfOnethreeType)[keyof typeof SensorCarrierMessageOneOfOnethreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfOnethreeType = {
  EnvironmentalData: "EnvironmentalData",
} as const;

/**
 * # `EnvironmentalData`
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
No action required.
 */
export type SensorCarrierMessageOneOfOnethree = {
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
  type: SensorCarrierMessageOneOfOnethreeType;
};

export type SensorCarrierMessageOneOfOnefiveType =
  (typeof SensorCarrierMessageOneOfOnefiveType)[keyof typeof SensorCarrierMessageOneOfOnefiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfOnefiveType = {
  MagnetometerData: "MagnetometerData",
} as const;

/**
 * # `MagnetometerData`
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

Note that `magnetic_field_down` is not affected by errors in inertial yaw.
 */
export type SensorCarrierMessageOneOfOnefive = {
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
  type: SensorCarrierMessageOneOfOnefiveType;
};

export type SensorCarrierMessageOneOfOnesevenType =
  (typeof SensorCarrierMessageOneOfOnesevenType)[keyof typeof SensorCarrierMessageOneOfOnesevenType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorCarrierMessageOneOfOnesevenType = {
  PressureData: "PressureData",
} as const;

/**
 * # `PressureData`
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
This differs from `EnvironmentalData`, which is lower-rate and smoothed.
 */
export type SensorCarrierMessageOneOfOneseven = {
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
  type: SensorCarrierMessageOneOfOnesevenType;
};

export type SensorCarrierMessage =
  | SensorCarrierMessageOneOf
  | SensorCarrierMessageOneOfThree
  | SensorCarrierMessageOneOfFive
  | SensorCarrierMessageOneOfSeven
  | SensorCarrierMessageOneOfNine
  | SensorCarrierMessageOneOfOneone
  | SensorCarrierMessageOneOfOnethree
  | SensorCarrierMessageOneOfOnefive
  | SensorCarrierMessageOneOfOneseven;

export interface SensorCarrierStatus {
  common: StatusCommonMessage;
  sensorHealth: SensorsHealth;
}

/**
 * Enum representing the status of a sensor.
 */
export type SensorStatus = (typeof SensorStatus)[keyof typeof SensorStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SensorStatus = {
  offline: "offline",
  online: "online",
} as const;

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

export interface SteeringPositions {
  /** Current position of the left steering motor in steps (4096 steps = 1 revolution) from the
startup position (0). */
  leftPos: number;
  /** Current position of the right steering motor in steps (4096 steps = 1 revolution) from the
startup position (0). */
  rightPos: number;
}

export type SystemManagementMessageOneOfType =
  (typeof SystemManagementMessageOneOfType)[keyof typeof SystemManagementMessageOneOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SystemManagementMessageOneOfType = {
  UTCTimeUpdate: "UTCTimeUpdate",
} as const;

/**
 * # `UTCTimeUpdate`
Synchronizes system time using GPS-derived UTC.

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
and is therefore discouraged.
 */
export type SystemManagementMessageOneOf = {
  /** # `UTCTimeUpdate`
Synchronizes system time using GPS-derived UTC.

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
  type: SystemManagementMessageOneOfType;
};

export type SystemManagementMessageOneOfThreeType =
  (typeof SystemManagementMessageOneOfThreeType)[keyof typeof SystemManagementMessageOneOfThreeType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SystemManagementMessageOneOfThreeType = {
  ResetSpecific: "ResetSpecific",
} as const;

/**
 * # `ResetSpecific`
Instructs a specific board to reset.

## Type
- `Event`: triggered by user command or fault condition

## Direction
- **Emitted by:** `FlightComputer`
- **Received by:** All nodes except `FlightComputer` and `RfsComputer`

## Purpose
Allows targeted recovery or restart of a malfunctioning board.

## Reaction
The addressed board performs an immediate reset. Others shall ignore the message.
 */
export type SystemManagementMessageOneOfThree = {
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
  type: SystemManagementMessageOneOfThreeType;
};

export type SystemManagementMessageOneOfFiveType =
  (typeof SystemManagementMessageOneOfFiveType)[keyof typeof SystemManagementMessageOneOfFiveType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SystemManagementMessageOneOfFiveType = {
  ResetAll: "ResetAll",
} as const;

/**
 * # `ResetAll`
Initiates a system-wide reset on all nodes.

## Type
- `Event`: triggered by user command or fault condition

## Direction
- **Emitted by:** `FlightComputer`, `RfsComputer`
- **Received by:** All nodes except `FlightComputer` and `RfsComputer`

## Purpose
Forces an immediate reset of all boards for system recovery or coordination.

## Reaction
All boards perform a full software reset immediately on reception.
 */
export type SystemManagementMessageOneOfFive = {
  type: SystemManagementMessageOneOfFiveType;
};

export type SystemManagementMessage =
  | SystemManagementMessageOneOf
  | SystemManagementMessageOneOfThree
  | SystemManagementMessageOneOfFive;

export interface ThrustCurveConfig {
  /** The thrust curve, consisting of 25 points. */
  thrustCurve: ThrustPoint[];
  /**
   * The length of the thrust curve in points (0-25).
   * @minimum 0
   */
  thrustCurveLength: number;
}

export interface ThrustPoint {
  /**
   * Thrust level in percentage (0-100).
   * @minimum 0
   */
  thrust: number;
  /**
   * Time in 100ms steps after ignition when this thrust level should be reached.
   * @minimum 0
   */
  time: number;
}

/**
 * Enum representing the state of a valve.
 */
export type ValveState = (typeof ValveState)[keyof typeof ValveState];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ValveState = {
  active: "active",
  inactive: "inactive",
} as const;

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

/**
 * Represents the current state of a watchdog timer.
 */
export type WatchdogState = (typeof WatchdogState)[keyof typeof WatchdogState];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const WatchdogState = {
  disabled: "disabled",
  active: "active",
  expired: "expired",
} as const;
