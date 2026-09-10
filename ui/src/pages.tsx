import {
  IconChartLine,
  IconGasStation,
  IconHeartRateMonitor,
  IconRocket,
  IconSitemap,
} from "@tabler/icons-react";
import React from "react";
import StateMachine from "./pages/statemachine/StateMachine";
import Telemetry from "./pages/telemetry/Telemetry";
import Health from "./pages/health/Health";
import PSS from "./pages/pss/PSS";

interface Page {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  page: React.ReactNode;
}

export const pages: Page[] = [
  {
    path: "/statemachine",
    title: "State Machine",
    description:
      "Visualize and interact with the state machine of the active remote",
    icon: <IconSitemap size="2rem" />,
    page: <StateMachine />,
  },
  {
    title: "Telemetry",
    description: "Real-time data: altitude, position, velocity etc.",
    icon: <IconChartLine size="2rem" />,
    path: "/telemetry",
    page: <Telemetry />,
  },
  {
    title: "Health",
    description:
      "Visualize the last received message of different message kinds",
    icon: <IconHeartRateMonitor size="2rem" />,
    path: "/health",
    page: <Health />,
  },
  {
    title: "Rocket PSS",
    description:
      "Visualize and interact with the rocket PSS datapoints of the active remote",
    icon: <IconRocket size="2rem" />,
    path: "/pss/rocket",
    page: <PSS kind="rocket" />,
  },
  {
    title: "RFS PSS",
    description:
      "Visualize and interact with the RFS PSS datapoints of the active remote",
    icon: <IconGasStation size="2rem" />,
    path: "/pss/rfs",
    page: <PSS kind="rfs" />,
  },
];
