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
      type: "ValveStates",
      hasContent: true,
    },
    {
      type: "FuelPressurizationCompleted",
      hasContent: false,
    },
    {
      type: "FuelPressurization",
      hasContent: true,
    },
    {
      type: "FuelPressurizationGain",
      hasContent: true,
    },
    {
      type: "FuelPressurizationAbort",
      hasContent: false,
    },
    {
      type: "FuelDprConfigFC",
      hasContent: true,
    },
    {
      type: "PressurizationVentControlFC",
      hasContent: true,
    },
    {
      type: "FuelVentControlFC",
      hasContent: true,
    },
    {
      type: "FuelDprConfigECU",
      hasContent: true,
    },
    {
      type: "PressurizationVentControlECU",
      hasContent: true,
    },
    {
      type: "FuelVentControlECU",
      hasContent: true,
    },
    {
      type: "FuelDprConfigRFS",
      hasContent: true,
    },
    {
      type: "PressurizationVentControlRFS",
      hasContent: true,
    },
    {
      type: "FuelVentControlRFS",
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
      type: "ValveStates",
      hasContent: true,
    },
    {
      type: "OxidizerPressurizationCompleted",
      hasContent: false,
    },
    {
      type: "OxidizerPressurization",
      hasContent: true,
    },
    {
      type: "OxidizerPressurizationGain",
      hasContent: true,
    },
    {
      type: "OxidizerPressurizationAbort",
      hasContent: false,
    },
    {
      type: "OxidizerDprConfigFC",
      hasContent: true,
    },
    {
      type: "OxidizerVentControlFC",
      hasContent: true,
    },
    {
      type: "OxidizerDprConfigECU",
      hasContent: true,
    },
    {
      type: "OxidizerVentControlECU",
      hasContent: true,
    },
    {
      type: "OxidizerDprConfigRFS",
      hasContent: true,
    },
    {
      type: "OxidizerVentControlRFS",
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
      type: "ValveStates",
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
      type: "OxidizerMainControlFC",
      hasContent: true,
    },
    {
      type: "OxidizerMainControlRFS",
      hasContent: true,
    },
    {
      type: "FuelMainControlFC",
      hasContent: true,
    },
    {
      type: "FuelMainControlRFS",
      hasContent: true,
    },
  ],
};
