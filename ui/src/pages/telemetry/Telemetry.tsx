import {
  Alert,
  ActionIcon,
  Card,
  Flex,
  SimpleGrid,
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
  VelocityData,
} from "@asteria/mission-control-client";
import { useMavlinkMessage } from "../../hooks/EventContext";

function fmt(value: number | undefined, decimals = 2): string {
  if (value === undefined) return "--";
  return value.toFixed(decimals);
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" ff="monospace" fw={500}>
        {value}
      </Text>
    </Flex>
  );
}

function MetricCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} size="sm" mb="xs" c="dimmed" tt="uppercase">
        {title}
      </Text>
      <Flex direction="column" gap={4}>
        {children}
      </Flex>
    </Card>
  );
}

function Telemetry() {
  const navigate = useNavigate();

  const posMsg = useMavlinkMessage("SensorCarrier", "PositionData");
  const velMsg = useMavlinkMessage("SensorCarrier", "VelocityData");
  const imuMsg = useMavlinkMessage("SensorCarrier", "ImuData");
  const envMsg = useMavlinkMessage("SensorCarrier", "EnvironmentalData");

  const pos = (posMsg?.message as { content: PositionData } | undefined)
    ?.content;
  const vel = (velMsg?.message as { content: VelocityData } | undefined)
    ?.content;
  const imu = (imuMsg?.message as { content: ImuData } | undefined)?.content;
  const env = (envMsg?.message as { content: EnvironmentalData } | undefined)
    ?.content;

  const noData = !posMsg && !velMsg && !imuMsg && !envMsg;

  return (
    <Flex direction="column" p="md" gap="md">
      <Flex align="center" gap="sm">
        <Tooltip label="Back to Views">
          <ActionIcon variant="subtle" onClick={() => navigate("/")}>
            <IconArrowLeft />
          </ActionIcon>
        </Tooltip>
        <Title order={3}>Telemetry</Title>
      </Flex>

      {noData && (
        <Alert variant="light" color="yellow" title="No telemetry data">
          No messages received yet. Check that the backend is connected.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <MetricCard title="Altitude">
          <Text size="xl" fw={700} ff="monospace">
            {fmt(pos?.locationHamsl)} m
          </Text>
          <MetricRow
            label="Vertical accuracy"
            value={`±${fmt(pos?.verticalAccuracy)} m`}
          />
        </MetricCard>

        <MetricCard title="Position">
          <MetricRow label="Latitude" value={`${fmt(pos?.locationLatitude, 6)}°`} />
          <MetricRow
            label="Longitude"
            value={`${fmt(pos?.locationLongitude, 6)}°`}
          />
          <MetricRow
            label="Horiz. accuracy"
            value={`±${fmt(pos?.horizontalAccuracy)} m`}
          />
        </MetricCard>

        <MetricCard title="Velocity (NED)">
          <MetricRow label="North" value={`${fmt(vel?.velocityNorth)} m/s`} />
          <MetricRow label="East" value={`${fmt(vel?.velocityEast)} m/s`} />
          <MetricRow label="Down" value={`${fmt(vel?.velocityDown)} m/s`} />
        </MetricCard>

        <MetricCard title="Velocity (Body)">
          <MetricRow label="X (forward)" value={`${fmt(vel?.velocityX)} m/s`} />
          <MetricRow label="Y (right)" value={`${fmt(vel?.velocityY)} m/s`} />
          <MetricRow label="Z (down)" value={`${fmt(vel?.velocityZ)} m/s`} />
        </MetricCard>

        <MetricCard title="Acceleration (Body)">
          <MetricRow
            label="X (forward)"
            value={`${fmt(imu?.accelerationX)} m/s²`}
          />
          <MetricRow
            label="Y (right)"
            value={`${fmt(imu?.accelerationY)} m/s²`}
          />
          <MetricRow
            label="Z (down)"
            value={`${fmt(imu?.accelerationZ)} m/s²`}
          />
        </MetricCard>

        <MetricCard title="Angular Velocity (Body)">
          <MetricRow
            label="X"
            value={`${fmt(imu?.angularVelocityX)} °/s`}
          />
          <MetricRow
            label="Y"
            value={`${fmt(imu?.angularVelocityY)} °/s`}
          />
          <MetricRow
            label="Z"
            value={`${fmt(imu?.angularVelocityZ)} °/s`}
          />
        </MetricCard>

        <MetricCard title="Environmental">
          <MetricRow label="Temperature" value={`${fmt(env?.temperature)} °C`} />
          <MetricRow label="Humidity" value={`${fmt(env?.humidity)} %`} />
          <MetricRow label="Pressure" value={`${fmt(env?.pressure)} hPa`} />
        </MetricCard>
      </SimpleGrid>
    </Flex>
  );
}

export default Telemetry;
