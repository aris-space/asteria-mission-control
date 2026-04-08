import { Card, Flex, SimpleGrid, Text, Title } from "@mantine/core";
import { IconChartLine, IconSitemap } from "@tabler/icons-react";
import { useNavigate } from "react-router";

interface ViewCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const views: ViewCard[] = [
  {
    title: "State Machine",
    description: "Visualize and interact with state machines",
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
    title: "Map",
    description: "Map view from 3 perspectives: top, side, front",
    icon: <IconChartLine size="2rem" />,
    path: "/map",
  },
];

function Views() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" align="center" p="xl" gap="xl">
      <Title order={2}>Asteria Mission Control</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" w="100%" maw={600}>
        {views.map((view) => (
          <Card
            key={view.path}
            withBorder
            radius="md"
            p="lg"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(view.path)}
          >
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
        ))}
      </SimpleGrid>
    </Flex>
  );
}

export default Views;
