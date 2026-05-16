import { useEffect, useState, type PropsWithChildren } from "react";
import { useBackendLatency } from "@asteria/hooks/EventContext";
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
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  useChangeActiveRemote,
  useDeactivateActiveRemote,
  useInfo,
} from "@asteria/mission-control-client";
import {
  IconAlertCircle,
  IconAlertTriangle,
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
          <SimpleGrid py={"xs"} px={"sm"} cols={2}>
            <Flex align={"center"} justify={"start"} gap={"lg"}>
              <Image src={"/logo.png"} h={"3rem"} mt={"-0.25rem"} w={"3rem"} />
              <ActiveRemoteComputer
                onDialogOpen={() => setRemoteComputerDialogVisible(true)}
              />
              {errors.length > 0 && (
                <Errors
                  errors={errors}
                  onDialogOpen={() => setErrorsVisible(true)}
                />
              )}
            </Flex>
            <Flex align={"center"} justify={"end"}>
              <Flex gap={"md"}>
                <MavlinkTelemetryHealth />
                <BackendLatency />
                <BackendVersion />
              </Flex>
            </Flex>
          </SimpleGrid>
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
        {info?.version ?? "v?.?.?"}
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
          {hasLatency && latency + "ms"}
        </Flex>
      </Badge>
    </Tooltip>
  );
}

function MavlinkTelemetryHealth() {
  const { getLastMessageTimestamp } = useMavlinkTelemetryHealth();

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
          <UplinkHealth />
          <DownlinkStats />
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
          {isTelemetryActive &&
            timeSinceLastMessage.toString().padStart(3, "0") + "ms"}
        </Flex>
      </Badge>
    </Tooltip>
  );
}

function UplinkHealth() {
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
        Uplink Statistics
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

function DownlinkStats() {
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
        Downlink Statistics
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
