import {
  Alert,
  ActionIcon,
  Box,
  Flex,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import type {
  EnvironmentalData,
  ImuData,
  PositionData,
  RailStatus,
  SteeringPositions,
  VelocityData,
} from "@asteria/mission-control-client";
import { useMavlinkMessage } from "../../hooks/EventContext";

function fmt(value: number | undefined, decimals = 2): string {
  if (value == undefined || value == null) return "--";
  return value.toFixed(decimals);
}

function fmt1(value: number | undefined): string {
  return fmt(value, 1);
}

function speedMagnitude(
  n?: number,
  e?: number,
  d?: number,
): number | undefined {
  if (n == null || e == null || d == null) return undefined;
  return Math.sqrt(n * n + e * e + d * d);
}

function accelMagnitude(
  x?: number,
  y?: number,
  z?: number,
): number | undefined {
  if (x == null || y == null || z == null) return undefined;
  return Math.sqrt(x * x + y * y + z * z);
}

const STEERING_MAX_STEPS = 1000;

/**
 * Vertical steering bar. Center = 0 steps (neutral).
 * Actual position shown as a solid block; target shown as an outline marker.
 * Positive steps → block moves up; negative → moves down.
 */
function SteeringBar({
  label,
  actual,
  target,
  width = 32,
}: {
  label: string;
  actual?: number;
  target?: number;
  width?: number;
}) {
  // Convert steps to a 0–1 fraction where 0.5 = neutral
  const toFrac = (steps: number) =>
    Math.max(0, Math.min(1, 0.5 + steps / (2 * STEERING_MAX_STEPS)));

  const actualFrac = actual != null ? toFrac(actual) : 0.5;
  const targetFrac = target != null ? toFrac(target) : null;

  // Indicator block height as % of bar
  const indicatorH = 12; // percent

  return (
    <Flex direction="column" align="center" gap={4} style={{ flexShrink: 0 }}>
      <Text size="10px" c="dimmed" fw={600} tt="uppercase">
        {label}
      </Text>
      <Box
        style={{
          width,
          flex: 1,
          border: "2px solid #333",
          borderRadius: 3,
          position: "relative",
          backgroundColor: "transparent",
          minHeight: 200,
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
              // center the block at targetFrac
              top: `calc(${(1 - targetFrac) * 100}% - ${indicatorH / 2}%)`,
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
            top: `calc(${(1 - actualFrac) * 100}% - ${indicatorH / 2}%)`,
            left: 2,
            right: 2,
            height: `${indicatorH}%`,
            backgroundColor: "#6c8ebf",
            borderRadius: 2,
          }}
        />
      </Box>
      <Text size="10px" ff="monospace" c="dimmed">
        {actual != null ? `${actual > 0 ? "+" : ""}${actual}` : "--"}
      </Text>
    </Flex>
  );
}

function Telemetry() {
  const navigate = useNavigate();

  const posMsg = useMavlinkMessage("SensorCarrier", "PositionData");
  const velMsg = useMavlinkMessage("SensorCarrier", "VelocityData");
  const imuMsg = useMavlinkMessage("SensorCarrier", "ImuData");
  const envMsg = useMavlinkMessage("SensorCarrier", "EnvironmentalData");
  const rail5vMsg = useMavlinkMessage("PowerBoard", "RailStatus5V");
  const rail24vMsg = useMavlinkMessage("PowerBoard", "RailStatus24V");
  const steeringActualMsg = useMavlinkMessage(
    "RecoveryBoard",
    "SteeringActualPositions",
  );
  const steeringTargetMsg = useMavlinkMessage(
    "RecoveryBoard",
    "SteeringTargetPositions",
  );

  const pos = (posMsg?.message as { content: PositionData } | undefined)
    ?.content;
  const vel = (velMsg?.message as { content: VelocityData } | undefined)
    ?.content;
  const imu = (imuMsg?.message as { content: ImuData } | undefined)?.content;
  const env = (envMsg?.message as { content: EnvironmentalData } | undefined)
    ?.content;
  const rail5v = (rail5vMsg?.message as { content: RailStatus } | undefined)
    ?.content;
  const rail24v = (rail24vMsg?.message as { content: RailStatus } | undefined)
    ?.content;
  const steeringActual = (
    steeringActualMsg?.message as { content: SteeringPositions } | undefined
  )?.content;
  const steeringTarget = (
    steeringTargetMsg?.message as { content: SteeringPositions } | undefined
  )?.content;

  const noData = !posMsg && !velMsg && !imuMsg && !envMsg;

  const altitude = pos?.locationHamsl;
  const vertAcc = pos?.verticalAccuracy;
  const horizAcc = pos?.horizontalAccuracy;
  const speed = speedMagnitude(
    vel?.velocityNorth,
    vel?.velocityEast,
    vel?.velocityDown,
  );
  const accel = accelMagnitude(
    imu?.accelerationX,
    imu?.accelerationY,
    imu?.accelerationZ,
  );

  const lat = pos?.locationLatitude;
  const lon = pos?.locationLongitude;
  const latStr =
    lat != null ? `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? "N" : "S"}` : "--";
  const lonStr =
    lon != null ? `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}` : "--";

  return (
    <Flex direction="column" p="md" gap="md" align="center">
      <Flex align="center" gap="sm" style={{ alignSelf: "flex-start" }}>
        <Tooltip label="Back to Views">
          <ActionIcon variant="subtle" onClick={() => navigate("/")}>
            <IconArrowLeft />
          </ActionIcon>
        </Tooltip>
        <Title order={3}>Telemetry</Title>
      </Flex>

      {noData && (
        <Alert
          variant="light"
          color="yellow"
          title="No telemetry data"
          style={{ width: "100%", maxWidth: 600 }}
        >
          No messages received yet. Check that the backend is connected.
        </Alert>
      )}

      {/* Flight Altitude View panel */}
      <Box
        style={{
          border: "2px solid #333",
          borderRadius: 6,
          width: "100%",
          maxWidth: 600,
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <Box
          style={{
            borderBottom: "1px solid #333",
            padding: "6px 12px",
            textAlign: "center",
          }}
        >
          <Text fw={600} size="sm">
            Flight Altitude View
          </Text>
        </Box>

        {/* Body: left steering bar | content | right steering bar */}
        <Flex gap="md" p="md" align="stretch">
          {/* Left bar — left steering */}
          <SteeringBar
            label="Steering L"
            actual={steeringActual?.leftPos}
            target={steeringTarget?.leftPos}
          />

          {/* Center content */}
          <Flex
            direction="column"
            align="center"
            gap={4}
            style={{ flex: 1, textAlign: "center" }}
          >
            {/* Altitude — primary */}
            <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
              Altitude
            </Text>
            <Flex align="baseline" gap={6}>
              <Text size="36px" fw={700} ff="monospace" lh={1.1}>
                {fmt1(altitude)} m
              </Text>
              {vertAcc != null && (
                <Text size="sm" c="dimmed">
                  ±{fmt1(vertAcc)}m
                </Text>
              )}
            </Flex>

            {/* Speed */}
            <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
              Velocity
            </Text>
            <Text size="28px" fw={700} ff="monospace" lh={1.1}>
              {fmt1(speed)} m/s
            </Text>

            {/* NED velocity components */}
            <Text size="xs" c="dimmed" ff="monospace">
              N {fmt1(vel?.velocityNorth)} E {fmt1(vel?.velocityEast)} D{" "}
              {fmt1(vel?.velocityDown)}
            </Text>

            {/* Acceleration magnitude */}
            <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
              Acceleration
            </Text>
            <Text size="28px" fw={700} ff="monospace" lh={1.2}>
              {fmt1(accel)} m/s²
            </Text>

            {/* Accel components */}
            <Text size="xs" c="dimmed" ff="monospace">
              x {fmt1(imu?.accelerationX)} y {fmt1(imu?.accelerationY)} z{" "}
              {fmt1(imu?.accelerationZ)}
            </Text>

            {/* Divider */}
            <Box
              style={{
                width: "80%",
                height: 1,
                backgroundColor: "#ccc",
                margin: "6px 0",
              }}
            />

            {/* Angular velocity */}
            <Text size="xs" ff="monospace">
              Angl accel: x {fmt1(imu?.angularVelocityX)} y{" "}
              {fmt1(imu?.angularVelocityY)} z {fmt1(imu?.angularVelocityZ)} °/s
            </Text>

            {/* Power rails */}
            <Text size="xs" ff="monospace">
              Rail 5V: {fmt(rail5v?.voltage)}v, {fmt(rail5v?.current)}A,{" "}
              {fmt(rail5v?.power, 0)}W
            </Text>
            <Text size="xs" ff="monospace">
              Rail 24V: {fmt(rail24v?.voltage)}v, {fmt(rail24v?.current)}A,{" "}
              {fmt(rail24v?.power, 0)}W
            </Text>

            {/* Environmental */}
            <Text size="xs" ff="monospace">
              Stack: {fmt1(env?.temperature)}°, {fmt1(env?.humidity)}%,{" "}
              {fmt(env?.pressure, 0)}hPa
            </Text>

            {/* Location */}
            <Text size="xs" ff="monospace">
              Location: {latStr}, {lonStr}
              {horizAcc != null ? ` ±${fmt1(horizAcc)}m` : ""}
            </Text>

            {/* Steering (compact) */}
            {(steeringActual || steeringTarget) && (
              <Text size="xs" ff="monospace" c="dimmed">
                Steering — Actual L:{steeringActual?.leftPos ?? "--"} R:
                {steeringActual?.rightPos ?? "--"} | Target L:
                {steeringTarget?.leftPos ?? "--"} R:
                {steeringTarget?.rightPos ?? "--"}
              </Text>
            )}
          </Flex>

          {/* Right bar — right steering */}
          <SteeringBar
            label="Steering R"
            actual={steeringActual?.rightPos}
            target={steeringTarget?.rightPos}
          />
        </Flex>
      </Box>
    </Flex>
  );
}

export default Telemetry;
