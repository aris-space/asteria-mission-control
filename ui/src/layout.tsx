import { useState, type PropsWithChildren } from "react";
import { useBackendLatency } from "@asteria/hooks/EventContext";
import { useMavlinkTelemetryHealth } from "@asteria/hooks/MavlinkContext";
import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Modal,
  SimpleGrid,
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
  IconPlug,
  IconPlugX,
  IconRocket,
  IconRocketOff,
  IconSettings,
} from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";
import { useRemoteComputer } from "./hooks/RemoteComputerContext";

export function Layout(props: PropsWithChildren) {
  const [remoteComputerDialogVisible, setRemoteComputerDialogVisible] =
    useState<boolean>(false);
  return (
    <>
      <Modal
        size={"xl"}
        opened={remoteComputerDialogVisible}
        onClose={() => setRemoteComputerDialogVisible(false)}
        title="Available remote computers"
      >
        <RemoteComputersDialog />
      </Modal>
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

function RemoteComputersDialog() {
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
        isTelemetryActive
          ? `Received MavLink telemetry within last ${timeSinceLastMessage} milliseconds`
          : "No MavLink telemetry received within last second"
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
