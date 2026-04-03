import { useMavlinkMessage } from "@asteria/hooks/EventContext";
import { CodeHighlight } from "@mantine/code-highlight";
import { Alert, Box, Card, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

function Health() {
  const theme = useMantineTheme();

  const engineControlBoardStatus = useMavlinkMessage(
    "EngineControlBoard",
    "BoardStatus",
  );
  const fuelControlBoardStatus = useMavlinkMessage(
    "FuelControlBoard",
    "BoardStatus",
  );
  const oxidizerControlBoardStatus = useMavlinkMessage(
    "OxidizerControlBoard",
    "BoardStatus",
  );
  const recoveryBoardStatus = useMavlinkMessage("RecoveryBoard", "BoardStatus");
  const sensorCarrierStatus = useMavlinkMessage("SensorCarrier", "BoardStatus");

  return (
    <Box
      p="lg"
      h="fit-content"
      w="100%"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: theme.spacing.sm,
      }}
    >
      <DatapointHealth
        name="Engine Control Board"
        health={engineControlBoardStatus?.message?.content}
      />
      <DatapointHealth
        name="Fuel Control Board"
        health={fuelControlBoardStatus?.message?.content}
      />
      <DatapointHealth
        name="Oxidizer Control Board"
        health={oxidizerControlBoardStatus?.message?.content}
      />
      <DatapointHealth
        name="Recovery Board"
        health={recoveryBoardStatus?.message?.content}
      />
      <DatapointHealth
        name="Sensor Carrier"
        health={sensorCarrierStatus?.message?.content}
      />
    </Box>
  );
}

interface DatapointHealthProps {
  name: string;
  health?: object;
}

function DatapointHealth({ name, health }: DatapointHealthProps) {
  const theme = useMantineTheme();

  return (
    <Card withBorder padding="xs" radius="md">
      <Stack h="100%" align="flex-start">
        <Text size="sm" fw={600} style={{ minWidth: 120 }}>
          {name}
        </Text>
        {health ? (
          <Box bdrs={"md"} bg={theme.colors.gray[0]} w="100%" h="100%">
            <CodeHighlight
              background="transparent"
              withCopyButton={false}
              h="100%"
              w="100%"
              language="json"
              style={{ fontSize: 11, whiteSpace: "pre-wrap" }}
              code={JSON.stringify(health, null, 2) ?? "{}"}
            />
          </Box>
        ) : (
          <Alert
            w="100%"
            title="No status message received"
            color="yellow"
            variant="light"
            icon={<IconAlertTriangle />}
          />
        )}
      </Stack>
    </Card>
  );
}

export default Health;
