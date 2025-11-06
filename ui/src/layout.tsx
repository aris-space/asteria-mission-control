import React from "react";
import { useEvent } from "./hooks/EventContext";

export function Layout() {
  const { latency } = useEvent();

  return <React.Fragment>latency: {latency}ms</React.Fragment>;
}
