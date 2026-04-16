import { Box, Flex, Text } from "@mantine/core";
import type {
  EnvironmentalData,
  ImuData,
  PositionData,
  RailStatus,
  SteeringPositions,
  VelocityData,
} from "@asteria/mission-control-client";
import { useMavlinkMessage } from "../../hooks/EventContext";

function fmt(value: number | undefined, decimals = 3): string {
  if (value == undefined || value == null) return "--";
  return value.toFixed(decimals);
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
  n?: number,
  e?: number,
  d?: number,
): number | undefined {
  if (n == null || e == null || d == null) return undefined;
  return Math.sqrt(n * n + e * e + d * d);
}

const STEERING_MAX_STEPS = 8000; // 4096 is one rotation

function SteeringBar({
  label,
  actual,
  target,
}: {
  label: string;
  actual?: number;
  target?: number;
}) {
  const toFrac = (steps: number) =>
    Math.max(0, Math.min(1, 0.5 + steps / (2 * STEERING_MAX_STEPS)));

  const actualFrac = actual != null ? toFrac(actual) : 0.5;
  const targetFrac = target != null ? toFrac(target) : null;

  const indicatorH = 12; // percent

  return (
    <Flex
      direction="column"
      align="center"
      gap={4}
      style={{ flexShrink: 0, width: 28, minWidth: 20 }}
    >
      <Text size="10px" c="dimmed" fw={600} tt="uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: 1 }}>
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

/** Table row — label left, value right — no fixed sizes so it scales with container */
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          paddingRight: 8,
          color: "var(--mantine-color-dimmed)",
          whiteSpace: "nowrap",
          fontSize: "clamp(10px, 1.2vw, 24px)",
        }}
      >
        {label}
      </td>
      <td
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(10px, 1.2vw, 24px)",
          textAlign: "left",
          paddingLeft: 4,
        }}
      >
        {value}
      </td>
    </tr>
  );
}

function Telemetry() {
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

  const altitude = pos?.locationHamsl;
  const vertAcc = pos?.verticalAccuracy;
  const horizAcc = pos?.horizontalAccuracy;

  const speed = speedMagnitude(
    vel?.velocityNorth,
    vel?.velocityEast,
    vel?.velocityDown,
  );
  const accel = accelMagnitude(
    imu?.accelerationNorth,
    imu?.accelerationEast,
    imu?.accelerationDown,
  );

  const lat = pos?.locationLatitude;
  const lon = pos?.locationLongitude;
  const latStr =
    lat != null
      ? `${Math.abs(lat).toFixed(6)}°${lat >= 0 ? "N" : "S"}`
      : "--";
  const lonStr =
    lon != null
      ? `${Math.abs(lon).toFixed(6)}°${lon >= 0 ? "E" : "W"}`
      : "--";

  return (
    <Flex
      direction="column"
      p="md"
      style={{
        width: "100%",
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Body: left steering bar | content | right steering bar */}
      <Flex gap="md" align="stretch" style={{ width: "100%" }}>
        {/* Left bar — left steering */}
        <SteeringBar
          label="Steer L"
          actual={steeringActual?.leftPos}
          target={steeringTarget?.leftPos}
        />

        {/* Center content */}
        <Flex
          direction="column"
          align="center"
          gap={4}
          style={{ flex: 1, minWidth: 0, textAlign: "center" }}
        >
          {/* Altitude */}
          <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
            Altitude
          </Text>
          <Flex align="baseline" gap={6}>
            <Text
              fw={700}
              ff="monospace"
              lh={1.1}
              style={{ fontSize: "clamp(1rem, 4vw, 2.25rem)" }}
            >
              {fmt(altitude, 1)} m
            </Text>
            {vertAcc != null && (
              <Text size="sm" c="dimmed">
                ±{fmt(vertAcc)}m
              </Text>
            )}
          </Flex>

          {/* Velocity */}
          <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
            Velocity
          </Text>
          <Text
            fw={700}
            ff="monospace"
            lh={1.1}
            style={{ fontSize: "clamp(0.85rem, 3vw, 1.75rem)" }}
          >
            {fmt(speed)} m/s
          </Text>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <DataRow
                label="N / E / D"
                value={`${fmt(vel?.velocityNorth)} / ${fmt(vel?.velocityEast)} / ${fmt(vel?.velocityDown)} m/s`}
              />
            </tbody>
          </table>

          {/* Acceleration */}
          <Text size="10px" fw={600} tt="uppercase" c="dimmed" mt={4}>
            Acceleration
          </Text>
          <Text
            fw={700}
            ff="monospace"
            lh={1.2}
            style={{ fontSize: "clamp(0.85rem, 3vw, 1.75rem)" }}
          >
            {fmt(accel)} m/s²
          </Text>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <DataRow
                label="N / E / D"
                value={`${fmt(imu?.accelerationNorth)} / ${fmt(imu?.accelerationEast)} / ${fmt(imu?.accelerationDown)} m/s²`}
              />
            </tbody>
          </table>

          {/* Divider */}
          <Box
            style={{
              width: "80%",
              height: 1,
              backgroundColor: "#ccc",
              margin: "6px 0",
            }}
          />

          {/* Secondary data */}
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <DataRow
                label="Ang vel N / E / D"
                value={`${fmt(imu?.angularVelocityNorth)} ${fmt(imu?.angularVelocityEast)} ${fmt(imu?.angularVelocityDown)}°/s`}
              />
              <DataRow
                label="Rail 5V"
                value={`${fmt(rail5v?.voltage)}v  ${fmt(rail5v?.current)}A  ${fmt(rail5v?.power, 0)}W`}
              />
              <DataRow
                label="Rail 24V"
                value={`${fmt(rail24v?.voltage)}v  ${fmt(rail24v?.current)}A  ${fmt(rail24v?.power, 0)}W`}
              />
              <DataRow
                label="Temp / Hum"
                value={`${fmt(env?.temperature)}°C  ${fmt(env?.humidity)}%`}
              />
              <DataRow
                label="Pressure"
                value={`${fmt(env?.pressure, 0)} hPa`}
              />
              <DataRow
                label="Location"
                value={`${latStr}  ${lonStr}${horizAcc != null ? `  ±${fmt(horizAcc)}m` : ""}`}
              />
            </tbody>
          </table>
        </Flex>

        {/* Right bar — right steering */}
        <SteeringBar
          label="Steer R"
          actual={steeringActual?.rightPos}
          target={steeringTarget?.rightPos}
        />
      </Flex>
    </Flex>
  );
}

export default Telemetry;
