import React, { useEffect, type PropsWithChildren } from "react";
import { useLatency } from "./hooks/EventContext";
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
import { IconPlug, IconPlugX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export function Layout(props: PropsWithChildren) {
  const latency = useLatency();
  const { data: info } = useInfo();

  const hasLatency = isFinite(latency);
  const hasVersion = !!info?.version;

  return (
    <AppShell padding="0" header={{ height: "4rem" }}>
      <AppShell.Header>
        <SimpleGrid py={"xs"} px={"sm"} cols={2}>
          <Flex align={"center"} justify={"start"} gap={"lg"}>
            <Image src={"/logo.png"} h={"3rem"} mt={"-0.25rem"} w={"3rem"} />
            <ScenarioSelector />
          </Flex>
          <Flex align={"center"} justify={"end"}>
            <Flex gap={"md"}>
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
            </Flex>
          </Flex>
        </SimpleGrid>
      </AppShell.Header>
      <AppShell.Main>{props.children}</AppShell.Main>
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
