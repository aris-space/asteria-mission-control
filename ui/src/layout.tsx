import { type PropsWithChildren } from "react";
import { useLatency } from "./hooks/EventContext";
import { AppShell, Badge, Flex, SimpleGrid, Tooltip } from "@mantine/core";
import { useInfo } from "@asteria/mission-control-client";
import { IconPlug, IconPlugX } from "@tabler/icons-react";

export function Layout(props: PropsWithChildren) {
  const latency = useLatency();
  const { data } = useInfo();

  const hasLatency = isFinite(latency);
  const hasVersion = !!data?.version;

  return (
    <AppShell padding="xl" header={{ height: "3.5rem" }}>
      <AppShell.Header>
        <SimpleGrid p={"md"} cols={2}>
          <Flex align={"center"} justify={"start"}></Flex>
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
                    ? `Using backend version ${data.version}`
                    : "Unable to get backend version"
                }
              >
                <Badge color={hasVersion ? "blue" : "red"} size={"md"}>
                  {data?.version ?? "v?.?.?"}
                </Badge>
              </Tooltip>
            </Flex>
          </Flex>
        </SimpleGrid>
      </AppShell.Header>
      <AppShell.Main bg={"dark"}>{props.children}</AppShell.Main>
    </AppShell>
  );
}
