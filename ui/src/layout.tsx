import { useEffect, useState, type PropsWithChildren } from "react";
import { useBackendLatency, useEvent } from "@asteria/hooks/EventContext";
import {
  useMavlinkMessage,
  useMavlinkTelemetryHealth,
} from "@asteria/hooks/MavlinkContext";
import {
  ActionIcon,
  Alert,
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Divider,
  Flex,
  Group,
  Image,
  Modal,
  ModalProps,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  RemoteComputerKind,
  EventKind,
  TelemetryStats,
  useChangeActiveRemote,
  useDeactivateActiveRemote,
  useInfo,
} from "@asteria/mission-control-client";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCloudDown,
  IconPlug,
  IconPlugX,
  IconRocket,
  IconRocketOff,
  IconSettings,
} from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";
import {
  useRemoteComputer,
  useRemoteComputerErrors,
} from "./hooks/RemoteComputerContext";
import { Link } from "react-router";

export function Layout(props: PropsWithChildren) {
  const [remoteComputerDialogVisible, setRemoteComputerDialogVisible] =
    useState<boolean>(false);
  const [errorsVisible, setErrorsVisible] = useState<boolean>(false);
  const { errors, dismissAllErrors, dismissError } = useRemoteComputerErrors();

  useEffect(() => {
    if (errors.length == 0) setErrorsVisible(false);
  }, [errors.length]);

  return (
    <>
      <RemoteComputersModal
        opened={remoteComputerDialogVisible}
        onClose={() => setRemoteComputerDialogVisible(false)}
      />
      <ErrorModal
        opened={errorsVisible}
        onClose={() => setErrorsVisible(false)}
        dismiss={dismissError}
        dismissAll={dismissAllErrors}
        errors={errors}
      />
      <AppShell
        padding="0"
        header={{ height: "4rem" }}
        style={{ minHeight: "100vh" }}
      >
        <AppShell.Header>
          <Flex gap={"1rem"} py={"xs"} px={"sm"} justify={"space-between"}>
            <Flex gap={"md"} align={"center"} justify={"start"}>
              <Link to={"/"}>
                <Image
                  src={"/logo.png"}
                  h={"3rem"}
                  mt={"-0.25rem"}
                  w={"3rem"}
                />
              </Link>
              <ActiveRemoteComputer
                onDialogOpen={() => setRemoteComputerDialogVisible(true)}
              />
              <ConfigHash />
              <RailStatus24V />
              <MissionControlLinkStats />
              <MavlinkTelemetryHealth />
              {errors.length > 0 && (
                <Errors
                  errors={errors}
                  onDialogOpen={() => setErrorsVisible(true)}
                />
              )}
            </Flex>
            <Flex align={"center"} justify={"end"}>
              <Flex gap={"md"}>
                <BackendLatency />
                <BackendVersion />
              </Flex>
            </Flex>
          </Flex>
        </AppShell.Header>
        <AppShell.Main style={{ display: "flex" }} w={"100%"} h={"100%"}>
          {props.children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

interface ActiveRemoteComputerProps {
  onDialogOpen: () => void;
}

function ActiveRemoteComputer({ onDialogOpen }: ActiveRemoteComputerProps) {
  const theme = useMantineTheme();
  const { remoteComputer } = useRemoteComputer();

  return (
    <Group
      gap={0}
      h={30}
      wrap="nowrap"
      bd="1px solid var(--mantine-color-default-border)"
      style={{ overflow: "hidden", borderRadius: theme.radius.md }}
    >
      <Tooltip
        label={
          remoteComputer
            ? `The '${remoteComputer.name}' remote computer is currently active`
            : "No remote computer is currently active"
        }
      >
        <Badge mx={"4px"} color={remoteComputer ? "blue" : "red"}>
          {remoteComputer?.name ?? "no remote"}
        </Badge>
      </Tooltip>

      <Divider orientation="vertical" h="100%" />

      <Tooltip label="Change active remote computer">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          h="100%"
          w={30}
          radius={0}
          onClick={() => onDialogOpen()}
        >
          <IconSettings size={18} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

interface ErrorsProps {
  errors: Array<string>;
  onDialogOpen: () => void;
}

function Errors({ onDialogOpen, errors }: ErrorsProps) {
  return (
    <Button size="xs" color="red" onClick={onDialogOpen}>
      <Group px={0} gap={"xs"}>
        {<IconAlertCircle size="1rem" />}
        {errors.length == 1 ? "Got an error" : `Got ${errors.length} errors`}
      </Group>
    </Button>
  );
}

interface ErrorModalProps extends ModalProps {
  errors: Array<string>;
  dismiss: (idx: number) => void;
  dismissAll: () => void;
}

function ErrorModal({
  opened,
  onClose,
  errors,
  dismiss,
  dismissAll,
}: ErrorModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Remote computer errors"
      size="xl"
    >
      <Stack>
        {errors.map((error, index) => (
          <Alert
            key={index}
            icon={<IconAlertCircle />}
            color="red"
            withCloseButton
            closeButtonLabel="Dismiss"
            onClose={() => dismiss(index)}
          >
            <Code bg={"transparent"}>{error}</Code>
          </Alert>
        ))}

        <Button color="red" variant="outline" onClick={dismissAll}>
          Dismiss all errors
        </Button>
      </Stack>
    </Modal>
  );
}

function RemoteComputersModal({ opened, onClose }: ModalProps) {
  const theme = useMantineTheme();
  const {
    availableRemoteComputers,
    remoteComputer: activeRemote,
    isRemoteComputerLoading,
  } = useRemoteComputer();

  const changeActive = useChangeActiveRemote();
  const deactivateActive = useDeactivateActiveRemote();

  const isLoading =
    isRemoteComputerLoading ||
    changeActive.isPending ||
    deactivateActive.isPending;

  return (
    <Modal
      size={"xl"}
      onClose={onClose}
      opened={opened}
      title="Available remote computers"
    >
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: theme.spacing.sm,
        }}
      >
        {availableRemoteComputers.map((remote) => {
          const isActive = remote.name == activeRemote?.name;
          const additionalProps = isActive
            ? {
                bd: "1px solid blue",
                bg: "blue.0",
              }
            : isLoading
              ? {
                  bg: "gray.0",
                }
              : {};

          const handleClick = () => {
            if (isActive) {
              deactivateActive.mutate();
            } else {
              changeActive.mutate({ name: remote.name });
            }
          };

          return (
            <Card
              key={remote.name}
              onClick={handleClick}
              withBorder
              style={{
                userSelect: "none",
                cursor: isLoading ? "default" : "pointer",
              }}
              {...additionalProps}
            >
              <Group mb="xs" justify="space-between">
                <Text fw={600}>{remote.name}</Text>
                <Badge variant="light" color={"gray"}>
                  {remote.kind}
                </Badge>
              </Group>

              <Text>{remote.description}</Text>
            </Card>
          );
        })}
      </Box>
    </Modal>
  );
}

function BackendVersion() {
  const { data: info } = useInfo();
  const hasVersion = !!info?.version;

  return (
    <Tooltip
      label={
        hasVersion
          ? `Using backend version ${info.version}`
          : "Unable to get backend version"
      }
    >
      <Badge color={hasVersion ? "blue" : "red"} size={"md"}>
        <code>
          <b>{info?.version ?? "v?.?.?"}</b>
        </code>
      </Badge>
    </Tooltip>
  );
}

function BackendLatency() {
  const latency = useBackendLatency();
  const hasLatency = isFinite(latency);

  return (
    <Tooltip
      label={
        hasLatency
          ? `Connection to backend has ${latency}ms latency`
          : "No connection to backend"
      }
    >
      <Badge color={hasLatency ? "blue" : "red"} size="md">
        <Flex align={"center"} gap={"0.25rem"}>
          {hasLatency ? (
            <IconPlug size={"1rem"} />
          ) : (
            <IconPlugX size={"1rem"} />
          )}
          <code>
            <b>{hasLatency && latency + "ms"}</b>
          </code>
        </Flex>
      </Badge>
    </Tooltip>
  );
}

function MavlinkTelemetryHealth() {
  const { getLastMessageTimestamp } = useMavlinkTelemetryHealth();
  const [telemetryStats, setTelemetryStats] = useState<TelemetryStats | null>(
    null,
  );

  useEvent<string>(EventKind.TELEMETRY_STATS, (stats) => {
    const telemetryStatsJson = JSON.parse(stats.data) as TelemetryStats;
    setTelemetryStats(telemetryStatsJson);
  });

  const [timeSinceLastMessage, setTimeSinceLastMessage] =
    useState<number>(Infinity);

  const isTelemetryActive = timeSinceLastMessage <= 1000;
  const telemetryCondition =
    timeSinceLastMessage < 250
      ? "green"
      : timeSinceLastMessage < 750
        ? "orange"
        : "red";

  useInterval(
    () => {
      const lastMessageTimestamp = getLastMessageTimestamp();
      const now = Date.now();
      setTimeSinceLastMessage(now - lastMessageTimestamp);
    },
    25,
    { autoInvoke: true },
  );

  return (
    <Tooltip
      label={
        <Stack gap={"xs"}>
          {isTelemetryActive
            ? `Received MavLink telemetry within last ${timeSinceLastMessage} milliseconds`
            : "No MavLink telemetry received within last second"}
          <Divider />
          <SlidingWindowTelemetryStats stats={telemetryStats} />
          <Divider />
          <AllTimeUplinkHealth />
          <Divider />
          <AllTimeDownlinkStats />
        </Stack>
      }
    >
      <Badge color={telemetryCondition} size="md">
        <Flex align={"center"} gap={"0.25rem"}>
          {isTelemetryActive ? (
            <IconRocket size="1rem" />
          ) : (
            <IconRocketOff size="1rem" />
          )}
          {isTelemetryActive && (
            <code>
              <b>{timeSinceLastMessage.toString().padStart(3, "0") + "ms"}</b>
            </code>
          )}
        </Flex>
      </Badge>
    </Tooltip>
  );
}

interface SlidingWindowTelemtryStatsProps {
  stats: TelemetryStats | null;
}

function SlidingWindowTelemetryStats({
  stats,
}: SlidingWindowTelemtryStatsProps) {
  const fmt = (intVal?: number) => intVal?.toLocaleString("de-CH") || "--";

  const downlinkLoss =
    stats &&
    stats.rc_dowlink_msgs != 0 &&
    fmt((1 - stats.incoming_msgs / stats.rc_dowlink_msgs) * 100);

  const uplinkLoss =
    stats &&
    stats.outgoing_msgs != 0 &&
    fmt((1 - stats.rc_uplink_msgs / stats.outgoing_msgs) * 100);

  return (
    <Flex direction={"column"} gap={"xs"}>
      <Text size="sm" fw={600}>
        Sliding Window Telemetry Statistics
      </Text>
      {stats ? (
        <>
          Sliding window spans {stats.window_length} seconds
          <Table withRowBorders={false}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={"40%"} fw={600} py={2} px={0}>
                  Remote Computer
                </Table.Th>
                <Table.Th w={"40%"} fw={600} py={2} px={4}>
                  Mission Control
                </Table.Th>
                <Table.Th w={"20%"} fw={600} py={2} px={0}>
                  Loss
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Th fw={"normal"} py={2} px={0}>
                  <code>{fmt(stats.rc_dowlink_msgs)}</code> messages sent
                </Table.Th>
                <Table.Th fw={"normal"} py={2} px={4}>
                  <code>{fmt(stats.incoming_msgs)}</code> messages received
                </Table.Th>
                <Table.Th fw={"normal"} py={2} px={0}>
                  {stats.rc_dowlink_msgs == 0 ? (
                    "N/A"
                  ) : (
                    <code>≈{downlinkLoss}%</code>
                  )}
                </Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th fw={"normal"} py={2} px={0}>
                  <code>{fmt(stats.rc_uplink_msgs)}</code> messages processed
                </Table.Th>
                <Table.Th fw={"normal"} py={2} px={4}>
                  <code>{fmt(stats.outgoing_msgs)}</code> messages sent
                </Table.Th>
                <Table.Th fw={"normal"} py={2} px={0}>
                  {stats.outgoing_bytes == 0 ? (
                    "N/A"
                  ) : (
                    <code>≈{uplinkLoss}%</code>
                  )}
                </Table.Th>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </>
      ) : (
        <Alert
          w="100%"
          title="No telemetry stats event has been received until now"
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle />}
        />
      )}
    </Flex>
  );
}

function AllTimeUplinkHealth() {
  const { remoteComputerBoard } = useRemoteComputer();
  const uplinkTelemetryHealthMessage = useMavlinkMessage(
    remoteComputerBoard as any,
    "UplinkTelemetryHealth",
  );

  const {
    numMsgLost,
    numMsgProcessed,
    numMsgReceived,
    timeOfLastMsg,
    timeOfLastProcessedMsg,
  } = uplinkTelemetryHealthMessage?.message.content || {};

  const fmt = (intVal?: number) => intVal?.toLocaleString("de-CH") || "--";
  const fmtTimestamp = (timestamp?: number) => {
    if (!timestamp) return "--.--";
    // JavaScript UNIX timestamps are in milliseconds; the `timestamp` is in microseconds.
    const timestampMs = timestamp / 1000;
    const duration = Date.now() - timestampMs;
    if (duration > 60000) return `${(duration / 60).toFixed(2)}m`;
    else if (duration > 1000) return `${(duration / 1000).toFixed(2)}s`;
    else return `${duration}ms`;
  };

  return (
    <Flex direction={"column"} gap={"xs"}>
      <Text size="sm" fw={600}>
        All-Time Remote Computer Uplink Statistics
      </Text>
      {remoteComputerBoard ? (
        <>
          <Group>
            <div>
              <code>{fmt(numMsgProcessed)}</code> messages processed
            </div>
            <div>
              <code>{fmt(numMsgReceived)}</code> messages received
            </div>
            <div>
              <code>{fmt(numMsgLost)}</code> messages lost
            </div>
          </Group>
          <div>
            <code>{fmtTimestamp(timeOfLastProcessedMsg)}</code> since last
            message was processed
          </div>
          <div>
            <code>{fmtTimestamp(timeOfLastMsg)}</code> since last message was
            received
          </div>
        </>
      ) : (
        <Alert
          w="100%"
          title="No active remote"
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle />}
        />
      )}
    </Flex>
  );
}

function AllTimeDownlinkStats() {
  const { remoteComputerBoard } = useRemoteComputer();
  const downlinkTelemetryStatsMessage = useMavlinkMessage(
    remoteComputerBoard as any,
    "DownlinkTelemetryStats",
  );

  const { numBytesSent, numMessagesSent } =
    downlinkTelemetryStatsMessage?.message.content || {};

  const fmt = (intVal?: number) => intVal?.toLocaleString("de-CH") || "--";

  return (
    <Flex direction={"column"} gap="xs">
      <Text size="sm" fw={600}>
        All-Time Remote Computer Downlink Statistics
      </Text>
      {remoteComputerBoard ? (
        <Group>
          <div>
            <code>{fmt(numBytesSent)}</code> bytes sent
          </div>
          <div>
            <code>{fmt(numMessagesSent)}</code> messages sent
          </div>
        </Group>
      ) : (
        <Alert
          w="100%"
          title="No active remote"
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle />}
        />
      )}
    </Flex>
  );
}

function MissionControlLinkStats() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);

  useEvent<string>(EventKind.TELEMETRY_STATS, (stats) => {
    const telemetryStatsJson = JSON.parse(stats.data) as TelemetryStats;
    setStats(telemetryStatsJson);
  });

  const fmt = (intVal?: number) =>
    intVal?.toLocaleString("de-CH", { maximumFractionDigits: 2 }) || "--";

  const downlinkLoss =
    stats &&
    stats.rc_dowlink_msgs != 0 &&
    fmt((1 - stats.incoming_msgs / stats.rc_dowlink_msgs) * 100);

  return (
    <>
      <Tooltip
        label={
          stats
            ? `Average utilization of the downlink from the RC to the MC over the last ${stats.window_length} seconds`
            : "Downlink utilization not known"
        }
      >
        <Badge color={stats ? "blue" : "red"}>
          {stats ? (
            <Flex gap={"0.25rem"} align={"center"}>
              <IconCloudDown size="1rem" />
              <code>
                {fmt(stats.incoming_bytes / stats.window_length / 1000)}kB/s
              </code>
            </Flex>
          ) : (
            "N/A"
          )}
        </Badge>
      </Tooltip>
      <Tooltip
        label={
          stats
            ? `Average loss on the downlink from the RC to the MC over the last ${stats.window_length} seconds`
            : "Downlink loss not known"
        }
      >
        <Badge
          color={
            stats
              ? (downlinkLoss as unknown as number) < 5
                ? "green"
                : (downlinkLoss as unknown as number) < 50
                  ? "orange"
                  : "red"
              : "red"
          }
        >
          {stats ? <code>{downlinkLoss || 0}%</code> : "N/A"}
        </Badge>
      </Tooltip>
    </>
  );
}

function ConfigHash() {
  const [configHash, setConfigHash] = useState<string | null>(null);
  const { remoteComputer, remoteComputerBoard } = useRemoteComputer();
  const configHashMessage = useMavlinkMessage(
    remoteComputerBoard as any,
    "ConfigHash",
  );

  useEffect(() => {
    if (!remoteComputer || !configHashMessage?.message.content)
      return setConfigHash(null);

    const decoder = new TextDecoder();
    const bytes = new Uint8Array(configHashMessage.message.content.hash);
    const hash = decoder.decode(bytes);
    setConfigHash(hash);
  }, [remoteComputer, configHashMessage]);

  return (
    <Badge color={configHash ? "blue" : "red"} size="md">
      <Tooltip
        label={
          configHash
            ? "The config hash of the active remote"
            : "No config hash message received for current remote"
        }
      >
        <code>
          <b>{configHash ? `H+${configHash}` : "N/A"}</b>
        </code>
      </Tooltip>
    </Badge>
  );
}

function RailStatus24V() {
  const { remoteComputer } = useRemoteComputer();
  const railStatusMessage = useMavlinkMessage("Backplane", "RailStatus24V");

  // We don't show the voltage on the RFS MC since it doesn't have a battery.
  if (remoteComputer?.kind == RemoteComputerKind.rfs_computer) return <></>;

  const voltage = remoteComputer
    ? railStatusMessage?.message.content.voltage
    : undefined;

  const color = voltage
    ? voltage > 25.1
      ? "green"
      : voltage > 21
        ? "orange"
        : "red"
    : "red";

  return (
    <Badge color={color} size="md">
      <Tooltip
        label={
          voltage != undefined
            ? "The voltage on the 24V rail"
            : "No 24V rail status message received for current remote"
        }
      >
        <code>
          <b>
            {voltage != undefined
              ? `${voltage.toLocaleString("de-CH", { maximumFractionDigits: 1 })}V`
              : "N/A"}
          </b>
        </code>
      </Tooltip>
    </Badge>
  );
}
