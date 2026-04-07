import { useMavlinkMessage } from "@asteria/hooks/EventContext";
import { CodeHighlight } from "@mantine/code-highlight";
import {
  ActionIcon,
  Affix,
  Alert,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Message, BOARD_MESSAGE_MAP } from "@asteria/mission-control-client";
import { useEffect, useState } from "react";

// Key to store visible datapoints in local storage.
const HEALTH_DATAPOINT_STORAGE_KEY = "HEALTH_DATAPOINTS";

type HealthDatapoint<
  B extends Message["board"],
  T extends (Message & { board: B; content: any })["message"]["type"],
> = [B, T];

const DEFAULT_HEALTH_DATAPOINTS: Array<
  HealthDatapoint<Message["board"], Message["message"]["type"]>
> = [
  ["EngineControlBoard", "BoardStatus"],
  ["FuelControlBoard", "BoardStatus"],
  ["OxidizerControlBoard", "BoardStatus"],
  ["RecoveryBoard", "BoardStatus"],
  ["PowerBoard", "BoardStatus"],
  ["SensorCarrier", "BoardStatus"],
  ["FlightComputer", "Status"],
  ["RfsComputer", "Status"],
];

function Health() {
  const theme = useMantineTheme();
  const [datapoints, setDatapoints] = useState<
    Array<HealthDatapoint<Message["board"], Message["message"]["type"]>>
  >([]);
  const [addingDatapoint, setAddingDatapoint] = useState(false);

  useEffect(() => {
    const storedHealthDatapoints = localStorage.getItem(
      HEALTH_DATAPOINT_STORAGE_KEY,
    );
    if (!storedHealthDatapoints)
      return setDatapoints(DEFAULT_HEALTH_DATAPOINTS);

    try {
      const datapoints = JSON.parse(storedHealthDatapoints);
      if (!Array.isArray(datapoints)) throw new Error("should be an array");
      datapoints.forEach((dp) => {
        if (!Array.isArray(dp) || dp.length != 2)
          throw new Error("invalid datapoint format");
      });
      setDatapoints(datapoints);
    } catch (_) {
      localStorage.removeItem(HEALTH_DATAPOINT_STORAGE_KEY);
      setDatapoints(DEFAULT_HEALTH_DATAPOINTS);
    }
  }, []);

  useEffect(() => {
    const content =
      datapoints.length == 0
        ? JSON.stringify(DEFAULT_HEALTH_DATAPOINTS)
        : JSON.stringify(datapoints);
    localStorage.setItem(HEALTH_DATAPOINT_STORAGE_KEY, content);
  }, [datapoints]);

  const handleDatapointAdd = (
    datapoint: HealthDatapoint<Message["board"], Message["message"]["type"]>,
  ) => {
    setDatapoints((datapoints) => [...datapoints, datapoint]);
    setAddingDatapoint(false);
  };

  return (
    <>
      <Modal
        title="Add new health datapoint"
        opened={addingDatapoint}
        onClose={() => setAddingDatapoint(false)}
      >
        <AddDatapointForm datapoints={datapoints} onAdd={handleDatapointAdd} />
      </Modal>
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
        <Affix position={{ bottom: "xl", right: "xl" }}>
          <Flex gap={"xs"}>
            <Tooltip label={"Add new health datapoint"}>
              <ActionIcon
                loading={addingDatapoint}
                size={"xl"}
                onClick={() => setAddingDatapoint(true)}
              >
                <IconPlus />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Affix>
        {datapoints.map(([board, messageType]) => {
          const handleRemove = () => {
            setDatapoints((datapoints) =>
              datapoints.filter(([b, t]) => b != board || t != messageType),
            );
          };

          return (
            <Datapoint
              key={`${board}-${messageType}`}
              board={board}
              message={messageType}
              onRemove={handleRemove}
            />
          );
        })}
      </Box>
    </>
  );
}

interface AddDatapointFormProps {
  datapoints: Array<
    HealthDatapoint<Message["board"], Message["message"]["type"]>
  >;
  onAdd: (
    datapoint: HealthDatapoint<Message["board"], Message["message"]["type"]>,
  ) => void;
}

function AddDatapointForm({ datapoints, onAdd }: AddDatapointFormProps) {
  const [board, setBoard] = useState("");
  const [type, setType] = useState("");

  const existent = !!datapoints.find(([b, t]) => b == board && t == type);

  return (
    <Flex gap={"sm"} direction={"column"}>
      <Select
        label="Board"
        onOptionSubmit={setBoard}
        data={Object.keys(BOARD_MESSAGE_MAP)}
        selectFirstOptionOnChange
      />
      <Select
        label="Message Type"
        disabled={!board}
        onOptionSubmit={setType}
        data={((BOARD_MESSAGE_MAP as any)[board as any] || [])
          .flatMap((dps: any) => dps)
          .filter((dp: any) => dp.hasContent)
          .map((dp: any) => dp.type)}
        selectFirstOptionOnChange
      />
      {existent && (
        <Alert
          w="100%"
          title="This datapoint is already added"
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle />}
        />
      )}
      <Button
        mt={"md"}
        onClick={() => onAdd([board, type] as any)}
        disabled={existent || !board || !type}
      >
        Add datapoint
      </Button>
    </Flex>
  );
}

interface DatapointHealthProps<
  B extends Message["board"],
  T extends Message["message"]["type"],
> {
  board: B;
  message: T;
  onRemove: () => void;
}

function Datapoint<
  B extends Message["board"],
  T extends Message["message"]["type"],
>({ board, message, onRemove }: DatapointHealthProps<B, T>) {
  const theme = useMantineTheme();

  const datapoint = useMavlinkMessage(board, message as any) as {
    message: { content?: object };
  } | null;

  return (
    <Card withBorder padding="xs" radius="md">
      <Stack h="100%" align="flex-start">
        <Group w="100%" justify="space-between">
          <Text size="sm" fw={600} style={{ minWidth: 120 }}>
            {board} – {message}
          </Text>
          <ActionIcon size="sm" onClick={() => onRemove()}>
            <IconTrash />
          </ActionIcon>
        </Group>
        {datapoint?.message?.content ? (
          <Box bdrs={"md"} bg={theme.colors.gray[0]} w="100%" h="100%">
            <CodeHighlight
              background="transparent"
              withCopyButton={false}
              h="100%"
              w="100%"
              language="json"
              style={{ fontSize: 11, whiteSpace: "pre-wrap" }}
              code={JSON.stringify(datapoint.message.content, null, 2) ?? "{}"}
            />
          </Box>
        ) : datapoint?.message ? (
          <Alert
            w="100%"
            title="Received message but it has no content"
            color="blue"
            variant="light"
            icon={<IconInfoCircle />}
          />
        ) : (
          <Alert
            w="100%"
            title="No message received"
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
