// *------------------------------------*
// This type declaration file only exists
// until the mavlink part of the data
// definitions crate is ready. Once it's
// ready, all the types should be annotated
// with #[utoipa::ToSchema] which allows
// us to automatically generate the type
// definitions for all mavlink messages
// *------------------------------------*

interface LocationMessage {
  type: "LOCATION";
  time_unix_ms: number;
  location_latitude: number;
  location_longitude: number;
  location_altitude: number;
  horizontal_accuracy: number;
  vertical_accuracy: number;
}

interface AccelerationMessage {
  type: "ACCELERATION";
  time_unix_ms: number;
  acceleration_north: number;
  acceleration_east: number;
  acceleration_down: number;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
}

interface RailStatus24vMessage {
  type: "RAIL_STATUS_24V";
  time_unix_ms: number;
  voltage: number;
  current: number;
  power: number;
}

interface PssLevelMessage {
  type: "PSS_LEVEL";
  time_unix_ms: number;
  oss_tnk_fraction: number;
}

interface SteeringActualPositionsMessage {
  type: "STEERING_ACTUAL_POSITIONS";
  time_unix_ms: number;
  left_pos: number;
  right_pos: number;
}

interface PssTemperatureMessage {
  type: "PSS_TEMPERATURE";
  time_unix_ms: number;
  fss_tnk_t: number;
  oss_rnl_t: number;
  oss_tnk_t: number;
}

interface CommandManualTransitionMessage {
  type: "COMMAND_MANUAL_TRANSITION";
  transition_index: number;
  target_system: number;
  state: number[];
}

interface RailStatus5vMessage {
  type: "RAIL_STATUS_5V";
  time_unix_ms: number;
  voltage: number;
  current: number;
  power: number;
}

interface RfsOutputsStatesMessage {
  type: "RFS_OUTPUTS_STATES";
  time_unix_ms: number;
  rocket_power: number;
  maxon_board_power: number;
  fss_heating: number;
  pressure_sensor_heating: number;
  eth_pump_power: number;
  custom1: number;
  custom2: number;
  custom3: number;
}

interface EnvironmentalDataMessage {
  type: "ENVIRONMENTAL_DATA";
  time_unix_ms: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

interface RfsTemperatureMessage {
  type: "RFS_TEMPERATURE";
  time_unix_ms: number;
  lox: number;
  igniter: number;
  cabinet: number;
  ambient: number;
}

interface ConfigInformationMessage {
  type: "CONFIG_INFORMATION";
  hash: [number, number, number, number, number, number, number];
}

interface PssPressureMessage {
  type: "PSS_PRESSURE";
  time_unix_ms: number;
  prz_mnl_p: number;
  oss_tnk_p: number;
  oss_tnk_p1: number;
  oss_tnk_p2: number;
  fss_tnk_p: number;
  fss_tnk_p1: number;
  fss_tnk_p2: number;
  eng_cc_p: number;
  fss_inj_p: number;
  oss_inj_p: number;
}

interface RfsPressureMessage {
  type: "RFS_PRESSURE";
  time_unix_ms: number;
  lox: number;
  n2_pre_booster: number;
  h2_purge: number;
  n2_post_booster: number;
  purge: number;
  pneumatic: number;
  h2: number;
  gox: number;
  igniter: number;
}

interface RfsActuatorsStatesMessage {
  type: "RFS_ACTUATORS_STATES";
  time_unix_ms: number;
  lox_fill_valve: number;
  gox_purge_valve: number;
  h2_purge_valve: number;
  n2_bleed_valve: number;
  lox_purge_valve: number;
  gox_bleed_valve: number;
  n2_purge_valve: number;
  n2_fill_valve: number;
  h2_bleed_valve: number;
  lox_bleed_valve: number;
  booster_valve: number;
  lox_decoupler_ret: number;
  lox_decoupler_ext: number;
  lox_decoupler_prox: number;
  n2_decoupler_ret: number;
  n2_decoupler_ext: number;
  n2_decoupler_prox: number;
  n2_release_valve: number;
  h2_igniter_valve: number;
  gox_igniter_valve: number;
  igniter_spark: number;
}

interface RfsStatusMessage {
  type: "RFS_STATUS";
  time_unix_ms: number;
  valves_armed: "ARMED" | "DISARMED";
  igniter_armed: "ARMED" | "DISARMED";
  software_armed: "ARMED" | "DISARMED";
  fc_armed: "ARMED" | "DISARMED";
  has_pss_control: number;
  fc_has_pss_control: number;
  time_since_fc_msg: number;
  time_since_fcb_msg: number;
  time_since_ocb_msg: number;
  time_since_ecb_msg: number;
}

interface FcStatusMessage {
  type: "FC_STATUS";
  time_unix_ms: number;
  time_since_rfs_msg: number;
  recovery_armed: "ARMED" | "DISARMED";
  ecu_armed: "ARMED" | "DISARMED";
  software_armed: "ARMED" | "DISARMED";
  rfs_armed: "ARMED" | "DISARMED";
  has_pss_control: number;
  rfs_has_pss_control: number;
  cats_sep_signal: number;
  cats_depl_signal: number;
  time_since_telemetry_msg: number;
  time_since_sc_msg: number;
  time_since_pwb_msg: number;
  time_since_rec_msg: number;
  time_since_fcb_msg: number;
  time_since_ocb_msg: number;
  time_since_ecb_msg: number;
  log: number[];
}

interface BuildInformationMessage {
  type: "BUILD_INFORMATION";
  commit_hash: [number, number, number, number, number, number, number];
  is_git_dirty: boolean;
  is_release: boolean;
  can_semver: [number, number, number];
  debug_defmt_rtt: number;
  author_initials: [number, number];
}

interface VelocityMessage {
  type: "VELOCITY";
  time_unix_ms: number;
  velocity_north: number;
  velocity_east: number;
  velocity_down: number;
}

interface OrientationMessage {
  type: "ORIENTATION";
  time_unix_ms: number;
  orientation_w: number;
  orientation_x: number;
  orientation_y: number;
  orientation_z: number;
}

interface CurrentStateMessage {
  type: "CURRENT_STATE";
  time_unix_ms: number;
  path_index: number;
  state: number[];
}

interface PssActuatorStatesMessage {
  type: "PSS_ACTUATOR_STATES";
  time_unix_ms: number;
  fss_prz_vlv: number;
  oss_prz_vlv: number;
  prz_vnt_vlv: number;
  fss_vnt_vlv: number;
  oss_vnt_vlv: number;
  fss_mnl_vlv: number;
  oss_mnl_vlv: number;
}

interface CommandManualActuatorMessage {
  type: "COMMAND_MANUAL_ACTUATOR";
  value: number;
  path_index: number;
  target_system: number;
  actuator_id: number[];
}

export type HermesMavMessage =
  | LocationMessage
  | AccelerationMessage
  | RailStatus24vMessage
  | PssLevelMessage
  | SteeringActualPositionsMessage
  | PssTemperatureMessage
  | CommandManualTransitionMessage
  | RailStatus5vMessage
  | RfsOutputsStatesMessage
  | EnvironmentalDataMessage
  | RfsTemperatureMessage
  | ConfigInformationMessage
  | PssPressureMessage
  | RfsPressureMessage
  | RfsActuatorsStatesMessage
  | RfsStatusMessage
  | FcStatusMessage
  | BuildInformationMessage
  | VelocityMessage
  | OrientationMessage
  | CurrentStateMessage
  | PssActuatorStatesMessage
  | CommandManualActuatorMessage;
