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
      type: "IgniterSparkPlugState",
      hasContent: true,
    },
    {
      type: "GoxIgniterValveState",
      hasContent: true,
    },
    {
      type: "H2IgniterValveState",
      hasContent: true,
    },
    {
      type: "GoxPurgeValveState",
      hasContent: true,
    },
    {
      type: "H2PurgeValveState",
      hasContent: true,
    },
    {
      type: "N2BleedValveState",
      hasContent: true,
    },
    {
      type: "LoxPurgeValveState",
      hasContent: true,
    },
    {
      type: "GoxBleedValveState",
      hasContent: true,
    },
    {
      type: "N2PurgeValveState",
      hasContent: true,
    },
    {
      type: "N2FillValveState",
      hasContent: true,
    },
    {
      type: "H2BleedValveState",
      hasContent: true,
    },
    {
      type: "LoxBleedValveState",
      hasContent: true,
    },
    {
      type: "BoosterValveState",
      hasContent: true,
    },
    {
      type: "LoxDecouplerExtendValveState",
      hasContent: true,
    },
    {
      type: "LoxDecouplerRetractValveState",
      hasContent: true,
    },
    {
      type: "N2DecouplerExtendValveState",
      hasContent: true,
    },
    {
      type: "N2DecouplerRetractValveState",
      hasContent: true,
    },
    {
      type: "N2ShowerValvesState",
      hasContent: true,
    },
    {
      type: "N2RocketPurgeValveState",
      hasContent: true,
    },
    {
      type: "RocketPowerState",
      hasContent: true,
    },
    {
      type: "MaxonBoardPowerState",
      hasContent: true,
    },
    {
      type: "RocketHeatingState",
      hasContent: true,
    },
    {
      type: "Custom1State",
      hasContent: true,
    },
    {
      type: "Custom2State",
      hasContent: true,
    },
    {
      type: "Custom3State",
      hasContent: true,
    },
    {
      type: "LoxFillValveState",
      hasContent: true,
    },
    {
      type: "LoxTemperature",
      hasContent: true,
    },
    {
      type: "IgniterTemperature",
      hasContent: true,
    },
    {
      type: "CabinetTemperature",
      hasContent: true,
    },
    {
      type: "AmbientTemperature",
      hasContent: true,
    },
    {
      type: "SmartBoxTemperature",
      hasContent: true,
    },
    {
      type: "CustomT1",
      hasContent: true,
    },
    {
      type: "LoxDecouplerProximity",
      hasContent: true,
    },
    {
      type: "N2DecouplerProximity",
      hasContent: true,
    },
    {
      type: "ValvesArmed",
      hasContent: true,
    },
    {
      type: "IgniterArmed",
      hasContent: true,
    },
    {
      type: "ValvesArmedSmartBox",
      hasContent: true,
    },
    {
      type: "RocketConnected",
      hasContent: true,
    },
    {
      type: "IgniterPressure",
      hasContent: true,
    },
    {
      type: "N2PreBoosterPressure",
      hasContent: true,
    },
    {
      type: "H2PurgePressure",
      hasContent: true,
    },
    {
      type: "N2PostBoosterPressure",
      hasContent: true,
    },
    {
      type: "LoxPressure",
      hasContent: true,
    },
    {
      type: "PurgePressure",
      hasContent: true,
    },
    {
      type: "PneumaticPressure",
      hasContent: true,
    },
    {
      type: "GoxPressure",
      hasContent: true,
    },
    {
      type: "H2Pressure",
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
      type: "H2IgniterPurgeControl",
      hasContent: true,
    },
    {
      type: "GoxIgniterPurgeControl",
      hasContent: true,
    },
    {
      type: "N2RocketPurgeValveControl",
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
  Backplane: [
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
      type: "ActivePowerSource",
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
      type: "FuelTankPressureSensor1",
      hasContent: true,
    },
    {
      type: "FuelTankPressureSensor2",
      hasContent: true,
    },
    {
      type: "FuelTankPressureFiltered",
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
    {
      type: "FuelDprGainP",
      hasContent: true,
    },
    {
      type: "FuelDprGainI",
      hasContent: true,
    },
    {
      type: "FuelDprGainD",
      hasContent: true,
    },
    {
      type: "FuelDprMinOpeningTime",
      hasContent: true,
    },
    {
      type: "FuelDprMaxOpeningTime",
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
      type: "OxidizerTankPressureSensor1",
      hasContent: true,
    },
    {
      type: "OxidizerTankPressureSensor2",
      hasContent: true,
    },
    {
      type: "OxidizerTankDifferentialPressure",
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
    {
      type: "OxidizerDprGainP",
      hasContent: true,
    },
    {
      type: "OxidizerDprGainI",
      hasContent: true,
    },
    {
      type: "OxidizerDprGainD",
      hasContent: true,
    },
    {
      type: "OxidizerDprMinOpeningTime",
      hasContent: true,
    },
    {
      type: "OxidizerDprMaxOpeningTime",
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
      type: "ChamberPressure",
      hasContent: true,
    },
    {
      type: "InjectorFuelPressure",
      hasContent: true,
    },
    {
      type: "InjectorOxidizerPressure",
      hasContent: true,
    },
    {
      type: "InjectorFuelTemperature",
      hasContent: true,
    },
    {
      type: "OxidizerTankTemperature",
      hasContent: true,
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
