import { Box, Card, Flex, Text, useMantineTheme } from "@mantine/core";
import {
  IconChartLine,
  IconGasStation,
  IconHeartRateMonitor,
  IconRocket,
  IconSitemap,
} from "@tabler/icons-react";
import React from "react";
import { Link } from "react-router";

interface ViewCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const views: ViewCard[] = [
  {
    title: "State Machine",
    description:
      "Visualize and interact with the state machine of the active remote",
    icon: <IconSitemap size="2rem" />,
    path: "/statemachine",
  },
  {
    title: "Telemetry",
    description: "Real-time data: altitude, position, velocity etc.",
    icon: <IconChartLine size="2rem" />,
    path: "/telemetry",
  },
  {
    title: "Health",
    description:
      "Visualize the last received message of different message kinds",
    icon: <IconHeartRateMonitor size="2rem" />,
    path: "/health",
  },
  {
    title: "Rocket PSS",
    description:
      "Visualize and interact with the rocket PSS datapoints of the active remote",
    icon: <IconRocket size="2rem" />,
    path: "/pss/rocket",
  },
  {
    title: "RFS PSS",
    description:
      "Visualize and interact with the RFS PSS datapoints of the active remote",
    icon: <IconGasStation size="2rem" />,
    path: "/pss/rfs",
  },
];

function Views() {
  const theme = useMantineTheme();

  return (
    <Box
      p="lg"
      h="fit-content"
      w="100%"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: theme.spacing.sm,
      }}
    >
      {views.map((view) => (
        <Link
          key={view.path}
          to={view.path}
          style={{
            textDecoration: "none",
          }}
        >
          <Card withBorder radius="md" p="lg" style={{ cursor: "pointer" }}>
            <Flex direction="column" gap="sm">
              {view.icon}
              <Text fw={600} size="lg">
                {view.title}
              </Text>
              <Text c="dimmed" size="sm">
                {view.description}
              </Text>
            </Flex>
          </Card>
        </Link>
      ))}
    </Box>
  );
}

export default Views;
