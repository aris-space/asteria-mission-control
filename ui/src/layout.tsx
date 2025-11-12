import React, { type PropsWithChildren } from "react";
import { useEvent } from "./hooks/EventContext";
import { AppShell } from "@mantine/core";
import { useInfo } from "@asteria/mission-control-client";

export function Layout(props: PropsWithChildren) {
  const { latency } = useEvent();
  const { data } = useInfo();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 0,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <React.Fragment>latency: {latency}ms</React.Fragment>
      </AppShell.Header>
      <AppShell.Main>{props.children}</AppShell.Main>
      <AppShell.Footer>
        <div>version: {data?.version}</div>
      </AppShell.Footer>
    </AppShell>
  );
}
