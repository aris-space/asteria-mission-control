export const BOARD_MESSAGE_MAP = {
  FlightComputer: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "ConfigHash",
      hasContent: true,
    },
    {
      type: "Status",
      hasContent: true,
    },
    {
      type: "StateMachineState",
      hasContent: true,
    },
    {
      type: "UplinkTelemetryHealth",
      hasContent: true,
    },
    {
      type: "DownlinkTelemetryStats",
      hasContent: true,
    },
    {
      type: "ManualStateTransition",
      hasContent: true,
    },
    {
      type: "ManualActuatorChange",
      hasContent: true,
    },
  ],
  RfsComputer: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "Status",
      hasContent: true,
    },
    {
      type: "ValveStates",
      hasContent: true,
    },
    {
      type: "GoxIgniterValveControl",
      hasContent: true,
    },
    {
      type: "H2IgniterValveControl",
      hasContent: true,
    },
    {
      type: "IgniterSparkPlugControl",
      hasContent: true,
    },
    {
      type: "IgniterPurgeControl",
      hasContent: true,
    },
    {
      type: "ManualStateTransition",
      hasContent: true,
    },
    {
      type: "ManualActuatorChange",
      hasContent: true,
    },
  ],
  SystemManagement: [
    {
      type: "Heartbeat",
      hasContent: true,
    },
    {
      type: "UTCTimeUpdate",
      hasContent: true,
    },
    {
      type: "ResetSpecific",
      hasContent: true,
    },
    {
      type: "ResetAll",
      hasContent: false,
    },
  ],
  RecoveryBoard: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "SteeringActualPositions",
      hasContent: true,
    },
    {
      type: "SeparationOccurred",
      hasContent: false,
    },
    {
      type: "DeploymentOccurred",
      hasContent: false,
    },
    {
      type: "SteeringTargetPositions",
      hasContent: true,
    },
    {
      type: "RecoveryPowerConfig",
      hasContent: true,
    },
    {
      type: "SeparationTrigger",
      hasContent: false,
    },
    {
      type: "DeploymentTrigger",
      hasContent: false,
    },
  ],
  PowerBoard: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "RailStatus5V",
      hasContent: true,
    },
    {
      type: "RailStatus24V",
      hasContent: true,
    },
    {
      type: "CameraPowerControl",
      hasContent: true,
    },
    {
      type: "CameraPowerStatus",
      hasContent: true,
    },
  ],
  SensorCarrier: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "PositionData",
      hasContent: true,
    },
    {
      type: "ImuData",
      hasContent: true,
    },
    {
      type: "VelocityData",
      hasContent: true,
    },
    {
      type: "OrientationData",
      hasContent: true,
    },
    {
      type: "EnvironmentalData",
      hasContent: true,
    },
    {
      type: "MagnetometerData",
      hasContent: true,
    },
    {
      type: "PressureData",
      hasContent: true,
    },
  ],
  FuelControlBoard: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "PressurizationLinePressure",
      hasContent: true,
    },
    {
      type: "FuelTankPressure",
      hasContent: true,
    },
    {
      type: "FuelDprValveState",
      hasContent: true,
    },
    {
      type: "PressurizationVentValveState",
      hasContent: true,
    },
    {
      type: "FuelVentValveState",
      hasContent: true,
    },
    {
      type: "FuelDprValveControlFC",
      hasContent: true,
    },
    {
      type: "PressurizationVentValveControlFC",
      hasContent: true,
    },
    {
      type: "FuelVentValveControlFC",
      hasContent: true,
    },
    {
      type: "FuelDprValveControlRFS",
      hasContent: true,
    },
    {
      type: "PressurizationVentValveControlRFS",
      hasContent: true,
    },
    {
      type: "FuelVentValveControlRFS",
      hasContent: true,
    },
  ],
  OxidizerControlBoard: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "OxidizerTankPressure",
      hasContent: true,
    },
    {
      type: "OxidizerDprValveState",
      hasContent: true,
    },
    {
      type: "OxidizerVentValveState",
      hasContent: true,
    },
    {
      type: "OxidizerDprValveControlFC",
      hasContent: true,
    },
    {
      type: "OxidizerVentValveControlFC",
      hasContent: true,
    },
    {
      type: "OxidizerDprValveControlRFS",
      hasContent: true,
    },
    {
      type: "OxidizerVentValveControlRFS",
      hasContent: true,
    },
  ],
  EngineControlBoard: [
    {
      type: "BuildInfo",
      hasContent: true,
    },
    {
      type: "BoardStatus",
      hasContent: true,
    },
    {
      type: "FuelMainValveState",
      hasContent: true,
    },
    {
      type: "OxidizerMainValveState",
      hasContent: true,
    },
    {
      type: "EnginePressure",
      hasContent: true,
    },
    {
      type: "EngineBayTemperature",
      hasContent: true,
    },
    {
      type: "FiringAborted",
      hasContent: false,
    },
    {
      type: "FiringCompleted",
      hasContent: false,
    },
    {
      type: "FiringInitiated",
      hasContent: false,
    },
    {
      type: "IgnitionDetected",
      hasContent: false,
    },
    {
      type: "CombustionDetected",
      hasContent: false,
    },
    {
      type: "FiringAbortInitiation",
      hasContent: false,
    },
    {
      type: "FiringInitiation",
      hasContent: false,
    },
    {
      type: "OxidizerMainValveControlFC",
      hasContent: true,
    },
    {
      type: "OxidizerMainValveControlRFS",
      hasContent: true,
    },
    {
      type: "FuelMainValveControlFC",
      hasContent: true,
    },
    {
      type: "FuelMainValveControlRFS",
      hasContent: true,
    },
  ],
};
