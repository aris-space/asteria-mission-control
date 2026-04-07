import React, { useEffect, type PropsWithChildren } from "react";
import {
  useBackendLatency,
  useIsTelemetryActive,
} from "./hooks/EventContext";
import {
  AppShell,
  Badge,
  Flex,
  Image,
  Loader,
  Select,
  SimpleGrid,
  Tooltip,
} from "@mantine/core";
import {
  useActiveScenario,
  useAllScenarios,
  useChangeScenario,
  useInfo,
} from "@asteria/mission-control-client";
import {
  IconPlug,
  IconPlugX,
  IconRocket,
  IconRocketOff,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export function Layout(props: PropsWithChildren) {
  return (
    <AppShell
      padding="0"
      header={{ height: "4rem" }}
      style={{ minHeight: "100vh" }}
    >
      <AppShell.Header>
        <SimpleGrid py={"xs"} px={"sm"} cols={2}>
          <Flex align={"center"} justify={"start"} gap={"lg"}>
            <Image src={"/logo.png"} h={"3rem"} mt={"-0.25rem"} w={"3rem"} />
            <ScenarioSelector />
          </Flex>
          <Flex align={"center"} justify={"end"}>
            <Flex gap={"md"}>
              <TelemetryHealth />
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
  );
}

function ScenarioSelector() {
  const { data: activeScenario, ...active } = useActiveScenario();
  const { data: allScenarios = [] } = useAllScenarios();
  const { mutate: changeScenario, ...change } = useChangeScenario();

  useEffect(() => {
    if (!change.isSuccess) return;
    const scenario = allScenarios.find(({ id }) => id == change.data);
    if (scenario) {
      notifications.show({
        title: "Scenario change",
        message: `Successfully changed to scenario "${scenario.name}"`,
        color: "green",
      });
      active.refetch();
    }
  }, [change.isSuccess]);

  const handleScenarioChange = (value: string | null) => {
    if (!value) return;
    changeScenario({ scenarioId: value });
  };

  const loading = change.isPending || active.isPending;

  return (
    <Select
      data={allScenarios.map(({ id, name }) => ({
        label: name,
        value: id,
      }))}
      disabled={loading}
      value={activeScenario?.id}
      onChange={handleScenarioChange}
      rightSection={loading ? <Loader size="xs" /> : <React.Fragment />}
      rightSectionWidth={40}
    />
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
          {hasLatency && <>{latency}ms</>}
        </Flex>
      </Badge>
    </Tooltip>
  );
}

function TelemetryHealth() {
  const isTelemetryActive = useIsTelemetryActive();

  return (
    <Tooltip
      label={
        isTelemetryActive
          ? `Received MavLink telemetry within last second`
          : "No MavLink telemetry received within last second"
      }
    >
      <Badge color={isTelemetryActive ? "green" : "red"} size="md">
        <Flex align={"center"} gap={"0.25rem"}>
          {isTelemetryActive ? (
            <IconRocket size="1rem" />
          ) : (
            <IconRocketOff size="1rem" />
          )}
          {isTelemetryActive ? "Active" : "Inactive"}
        </Flex>
      </Badge>
    </Tooltip>
  );
}
