import {
  ExtendedDatapointInformation,
  ManualActuatorChange,
} from "@asteria/mission-control-client";
import { DigitalActuator } from "./DigitalActuator";
import { DprActuator } from "./DprActuator";
import { DigitalSensor } from "./DigitalSensor";
import { AnalogSensor } from "./AnalogSensor";
import { usePssDatapointData as usePssDatapointValue } from "@asteria/hooks/PssDataContext";
import {
  Flex,
  Loader,
  Paper,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";

export const VERTICAL_PADDING: string = "4px";
export const HORIZONTAL_PADDING: string = "6px";
export const CONTAINER_HEIGHT: string = "2.5rem";
export const SLOT_WIDTH: string = "5rem";
export const GAP: string = "0.5rem";
export const SLIDER_PADDING: string = "4px";

interface DatapointKindProps extends Pick<
  ExtendedDatapointInformation,
  "kind" | "name"
> {
  onChange: (action: ManualActuatorChange) => void;
}

function DatapointKind({ kind, name, onChange }: DatapointKindProps) {
  const value = usePssDatapointValue(name);

  const handleDigitalActuatorChange = (active: boolean) => {
    const encoder = new TextEncoder();
    const bytes = new Uint8Array(encoder.encode(name).buffer);
    const action: ManualActuatorChange = {
      // Exactly 20 bytes; Pad with zeroes on the right.
      actuator: Array.from([...bytes, ...new Array(20).fill(0)]).slice(0, 20),
      pathIndex: 0,
      value: active ? 1.0 : 0.0,
    };
    onChange(action);
  };

  const handleDprActuatorChange = (active: boolean, value: number) => {
    const encoder = new TextEncoder();
    // We assume that the backend does bounds checks on the actuator name bytes length and
    // thus we don't need to do that here.
    const bytes = new Uint8Array(encoder.encode(name).buffer);
    const action: ManualActuatorChange = {
      actuator: Array.from([...bytes, ...new Array(20).fill(0)]).slice(0, 20),
      pathIndex: 0,
      value: active ? value : NaN,
    };
    onChange(action);
  };

  if (value == null) return <DatapointLoader />;

  switch (kind.component) {
    case "sensor": {
      switch (kind.kind) {
        case "analog": {
          return <AnalogSensor value={value} unit={kind.unit} />;
        }
        case "digital":
          return (
            <DigitalSensor
              defaultEnabled={kind.default_enabled}
              enabled={value == 1.0}
            />
          );
      }
      break;
    }
    case "actuator": {
      switch (kind.kind) {
        case "digital":
          return (
            <DigitalActuator
              defaultEnabled={kind.default_enabled}
              enabled={value == 1.0}
              onChange={handleDigitalActuatorChange}
            />
          );
        case "dpr":
          return (
            <DprActuator
              value={value}
              active={!isNaN(value)}
              onChange={handleDprActuatorChange}
            />
          );
        case "fractional":
      }
      return <div />;
    }
  }
}

function DatapointLoader() {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Paper
      withBorder
      radius="md"
      style={{
        position: "relative",
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        overflow: "hidden",
        height: CONTAINER_HEIGHT,
        padding: VERTICAL_PADDING,
      }}
    >
      <Flex h="100%" px="xs" align={"center"}>
        <Loader size="xs" />
      </Flex>
    </Paper>
  );
}

export default DatapointKind;
