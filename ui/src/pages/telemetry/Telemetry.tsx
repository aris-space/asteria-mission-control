import { useState, type ReactNode } from "react";
import { ActionIcon, Box, Flex, SimpleGrid, Text } from "@mantine/core";
import { IconArrowBarToDown, IconRestore } from "@tabler/icons-react";
import type {
  ActivePowerSource,
  DeploymentState,
  EngineControlBoardStatus,
  EnvironmentalData,
  FuelControlBoardStatus,
  ImuData,
  OrientationData,
  OxidizerControlBoardStatus,
  PositionData,
  RailStatus,
  SteeringPositions,
  VelocityData,
} from "@asteria/mission-control-client";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";

type Num = number | undefined;

const POWER_SOURCE_LABEL: Record<ActivePowerSource, string> = {
  external: "EXT",
  battery: "BAT",
  none: "?",
};

const DEPLOYMENT_STATE_LABEL: Record<DeploymentState, string> = {
  unarmed: "Unarmed",
  notYetDeployed: "Not yet",
  deployed: "Deployed",
};

const RAD2DEG = 180 / Math.PI;

function fmt(value: Num, decimals = 2): string {
  return value == null ? "--" : value.toFixed(decimals);
}

/** Euclidean norm; undefined if any component is missing. */
function magnitude(...v: Num[]): Num {
  if (v.some((x) => x == null)) return undefined;
  return Math.sqrt(v.reduce((s, x) => s + x! * x!, 0));
}

function Dim({ children }: { children: ReactNode }) {
  return (
    <Text span c="dimmed" inherit>
      {children}
    </Text>
  );
}

/** Value with a dimmed unit, e.g. <Val v="1.20" unit=" m/s" /> */
function Val({ v, unit }: { v: string; unit: string }) {
  return (
    <>
      {v}
      <Dim>{unit}</Dim>
    </>
  );
}

/** Row of [value, dimmed suffix] fields with a gap between them, plus an optional dimmed trailing unit. */
function Fields({ fields, unit }: { fields: [string, string][]; unit?: string }) {
  return (
    <Flex gap="0.9em" justify="center" wrap="wrap">
      {fields.map(([v, suffix], i) => (
        <span key={i}>
          <Val v={v} unit={suffix} />
        </span>
      ))}
      {unit && <Dim>{unit}</Dim>}
    </Flex>
  );
}

/** Inline-labelled vector, e.g. vec([1, 2, 3], "NED", "m/s") -> 1.00N 2.00E 3.00D m/s */
function vec(values: Num[], labels: ArrayLike<string>, unit?: string, decimals = 2) {
  return <Fields fields={values.map((v, i) => [fmt(v, decimals), labels[i]])} unit={unit} />;
}

/** Quaternion (NED -> body) to roll/pitch/yaw in degrees (aerospace ZYX). */
function quatToRpy(q?: OrientationData): [Num, Num, Num] {
  if (!q) return [undefined, undefined, undefined];
  const { orientationW: w, orientationX: x, orientationY: y, orientationZ: z } = q;
  const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x))));
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return [roll * RAD2DEG, pitch * RAD2DEG, yaw * RAD2DEG];
}

function coord(value: Num, pos: string, neg: string): [string, string] {
  if (value == null) return ["--", ""];
  return [`${Math.abs(value).toFixed(6)}°`, value >= 0 ? pos : neg];
}

/** Content of a message, as delivered by useMavlinkMessage. */
function content<T>(msg: unknown): T | undefined {
  return (msg as { message?: { content: T } } | undefined)?.message?.content;
}

function SteeringBar({
  label,
  side,
  actual,
  target,
}: {
  label: string;
  side: "left" | "right";
  actual?: number;
  target?: number;
}) {
  // Invert the conversion done by convert_gnc_output function in the FC
  // 
  // The formula (for the right motor just replace each occurence of 'left' with 'right'):
  // ((left_motor_steps / 4096) - revolution_interval_mapping_left.0) / (revolution_interval_mapping_left.1 - revolution_interval_mapping.0)
  //
  // side indicates if it's the left or right motor
  const toFrac = (steps: number, side: "left" | "right") =>
    side === "left"
      ? Math.max(0, Math.min(1, ((steps / 4096) + 3.36) / 4.95))
      : Math.max(0, Math.min(1, ((steps / 4096) + 2.273) / 4.95));

  const actualFrac = actual != null ? toFrac(actual, side) : 0.5;
  const targetFrac = target != null ? toFrac(target, side) : null;

  const indicatorH = 12; // percent
  // Map frac in [0, 1] to a top offset that keeps the whole indicator inside the bar:
  // frac = 1 -> top edge flush with the top, frac = 0 -> bottom edge flush with the bottom.
  const indicatorTop = (frac: number) => `${(1 - frac) * (100 - indicatorH)}%`;

  return (
    <Flex
      direction="column"
      align="center"
      gap={4}
      style={{ flexShrink: 0, width: 28, minWidth: 20 }}
    >
      <Text size="sm" c="dimmed" fw={600} tt="uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: 1 }}>
        {label}
      </Text>
      <Box
        style={{
          width: "100%",
          flex: 1,
          border: "2px solid #333",
          borderRadius: 3,
          position: "relative",
          backgroundColor: "transparent",
        }}
      >
        {/* Center reference line */}
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "#aaa",
          }}
        />

        {/* Target marker (outline) */}
        {targetFrac != null && (
          <Box
            style={{
              position: "absolute",
              top: indicatorTop(targetFrac),
              left: 2,
              right: 2,
              height: `${indicatorH}%`,
              border: "2px solid #6c8ebf",
              borderRadius: 2,
              opacity: 0.8,
            }}
          />
        )}

        {/* Actual position (solid) */}
        <Box
          style={{
            position: "absolute",
            top: indicatorTop(actualFrac),
            left: 2,
            right: 2,
            height: `${indicatorH}%`,
            backgroundColor: "#6c8ebf",
            borderRadius: 2,
          }}
        />
      </Box>
      <Text size="md" ff="monospace">
        {actual != null ? actualFrac.toFixed(2) : "--"}
      </Text>
    </Flex>
  );
}

/** One telemetry block: small caption, large primary value, optional detail line. */
function Section({
  label,
  main,
  detail,
  action,
}: {
  label: string;
  main?: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Flex direction="column" align="center" gap={2}>
      <Text size="sm" fw={600} tt="uppercase" c="dimmed">
        {label}
      </Text>
      {main != null && (
        <Flex align="center" gap="xs">
          <Text fw={700} ff="monospace" lh={1.1} fz="2.25rem">
            {main}
          </Text>
          {action}
        </Flex>
      )}
      {detail != null && (
        <Text component="div" ff="monospace" fz="1.25rem">
          {detail}
        </Text>
      )}
    </Flex>
  );
}

function Telemetry() {
  // AMSL altitude captured by "Zero ground"; altitude is shown as AGL while set.
  const [groundAmsl, setGroundAmsl] = useState<number>();
  const pos = content<PositionData>(useMavlinkMessage("SensorCarrier", "PositionData"));
  const vel = content<VelocityData>(useMavlinkMessage("SensorCarrier", "VelocityData"));
  const imu = content<ImuData>(useMavlinkMessage("SensorCarrier", "ImuData"));
  const ori = content<OrientationData>(useMavlinkMessage("SensorCarrier", "OrientationData"));
  const env = content<EnvironmentalData>(useMavlinkMessage("SensorCarrier", "EnvironmentalData"));
  const rail5v = content<RailStatus>(useMavlinkMessage("Backplane", "RailStatus5V"));
  const powerSource = content<ActivePowerSource>(useMavlinkMessage("Backplane", "ActivePowerSource"));
  const rail24v = content<RailStatus>(useMavlinkMessage("Backplane", "RailStatus24V"));
  const steeringActual = content<SteeringPositions>(
    useMavlinkMessage("RecoveryBoard", "SteeringActualPositions"),
  );
  const steeringTarget = content<SteeringPositions>(
    useMavlinkMessage("RecoveryBoard", "SteeringTargetPositions"),
  );

  const fuelBoard = content<FuelControlBoardStatus>(useMavlinkMessage("FuelControlBoard", "BoardStatus"));
  const oxidizerBoard = content<OxidizerControlBoardStatus>(
    useMavlinkMessage("OxidizerControlBoard", "BoardStatus"),
  );
  const engineBoard = content<EngineControlBoardStatus>(useMavlinkMessage("EngineControlBoard", "BoardStatus"));
  const catsSeparation = content<DeploymentState>(useMavlinkMessage("RecoveryBoard", "CATSSeparationState"));
  const catsDeployment = content<DeploymentState>(useMavlinkMessage("RecoveryBoard", "CATSDeploymentState"));

  const altitude = pos?.locationHamsl == null ? undefined : pos.locationHamsl - (groundAmsl ?? 0);

  const rail = (r?: RailStatus) => (
    <Fields fields={[[fmt(r?.voltage), " V"], [fmt(r?.current), " A"], [fmt(r?.power), " W"]]} />
  );

  const location = (
    <Flex gap="0.9em" justify="center" align="baseline" wrap="wrap">
      <Fields fields={[coord(pos?.locationLatitude, "N", "S"), coord(pos?.locationLongitude, "E", "W")]} />
      {pos?.horizontalAccuracy != null && (
        <Text span c="dimmed" fz="sm">
          ±{fmt(pos.horizontalAccuracy)} m
        </Text>
      )}
    </Flex>
  );

  return (
    <Flex direction="column" p="md" style={{ width: "100%", overflow: "auto", boxSizing: "border-box" }}>
      <Flex gap="md" align="stretch" style={{ width: "100%" }}>
        <SteeringBar
          label="L"
          side="left"
          actual={steeringActual?.leftPos}
          target={steeringTarget?.leftPos}
        />

        <Flex direction="column" align="center" gap="lg" style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <Section
            label={groundAmsl == null ? "Altitude AMSL" : "Altitude AGL"}
            main={
              <>
                <Val v={fmt(altitude, 1)} unit=" m" />
                {pos?.verticalAccuracy != null && (
                  <Text span c="dimmed" fz="sm" ml={6}>
                    ±{fmt(pos.verticalAccuracy)} m
                  </Text>
                )}
              </>
            }
            detail={location}
            action={
              <ActionIcon
                size="sm"
                variant="light"
                title={groundAmsl == null ? "Zero ground" : "Reset to AMSL"}
                disabled={groundAmsl == null && pos?.locationHamsl == null}
                onClick={() => setGroundAmsl(groundAmsl == null ? pos?.locationHamsl : undefined)}
              >
                {groundAmsl == null ? <IconArrowBarToDown size={14} /> : <IconRestore size={14} />}
              </ActionIcon>
            }
          />
          <Section
            label="Velocity"
            main={<Val v={fmt(magnitude(vel?.velocityNorth, vel?.velocityEast, vel?.velocityDown))} unit=" m/s" />}
            detail={vec([vel?.velocityNorth, vel?.velocityEast, vel?.velocityDown], "NED", "m/s")}
          />
          <Section
            label="Acceleration"
            main={<Val v={fmt(magnitude(imu?.accelerationNorth, imu?.accelerationEast, imu?.accelerationDown))} unit=" m/s²" />}
            detail={vec([imu?.accelerationX, imu?.accelerationY, imu?.accelerationZ], "XYZ", "m/s²")}
          />

          <Box style={{ width: "80%", height: 1, backgroundColor: "#ccc" }} />
          <SimpleGrid cols={2} spacing="lg" verticalSpacing="lg" style={{ width: "100%" }}>
            <Section
              label="Orientation"
              detail={vec(quatToRpy(ori), "RPY", "°", 1)}
            />
            <Section
              label="Angular velocity"
              detail={vec([imu?.angularVelocityX, imu?.angularVelocityY, imu?.angularVelocityZ], "XYZ", "°/s")}
            />
            <Section
              label="Stack Environment"
              detail={
                <Fields
                  fields={[
                    [fmt(env?.temperature, 1), " °C"],
                    [fmt(env?.humidity, 1), " %"],
                    [fmt(env?.pressure, 0), " hPa"],
                  ]}
                />
              }
            />
            <Section
              label="Bay temperatures"
              detail={
                <Fields
                  fields={[
                    [fmt(fuelBoard?.temperature, 1), " F"],
                    [fmt(oxidizerBoard?.temperature, 1), " O"],
                    [fmt(engineBoard?.temperature, 1), " E"],
                  ]}
                  unit="°C"
                />
              }
            />
            <Section label="Rail 5V" detail={rail(rail5v)} />
            <Section label={`Rail 24V${powerSource ? ` · ${POWER_SOURCE_LABEL[powerSource]}` : ""}`} detail={rail(rail24v)} />
            <Section
              label="CATS"
              detail={
                <Fields
                  fields={[
                    [catsSeparation ? DEPLOYMENT_STATE_LABEL[catsSeparation] : "--", " sep"],
                    [catsDeployment ? DEPLOYMENT_STATE_LABEL[catsDeployment] : "--", " dep"],
                  ]}
                />
              }
            />
          </SimpleGrid>
        </Flex>

        <SteeringBar
          label="R"
          side="right"
          actual={steeringActual?.rightPos}
          target={steeringTarget?.rightPos}
        />
      </Flex>
    </Flex>
  );
}

export default Telemetry;
