import {
  DatapointValue,
  ExtendedDatapointInformation,
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

interface DatapointProps extends Pick<
  ExtendedDatapointInformation,
  "kind" | "name"
> {
  allowed: boolean;
  onChange: (name: string, value: number) => void;
}

function Datapoint({ kind, name, allowed, onChange }: DatapointProps) {
  const value = usePssDatapointValue(name);

  const handleDigitalActuatorChange = (active: boolean) => {
    onChange(name, active ? 1.0 : 0.0);
  };

  const handleDprActuatorChange = (active: boolean, value: number) => {
    onChange(name, active ? value : NaN);
  };

  if (value == null) return <DatapointLoader />;

  switch (kind.component) {
    case "sensor": {
      switch (kind.kind) {
        case "analog": {
          {
            const {
              value: { value: numValue },
            } = value as {
              component: "sensor";
              kind: "analog";
            } & DatapointValue;
            return (
              <AnalogSensor value={numValue} unit={kind.unit} precision={3} />
            );
          }
        }
        case "digital": {
          const {
            value: { enabled },
          } = value as {
            component: "sensor";
            kind: "digital";
          } & DatapointValue;
          return (
            <DigitalSensor
              defaultEnabled={kind.default_enabled}
              enabled={enabled}
            />
          );
        }
      }
    }
    case "actuator": {
      switch (kind.kind) {
        case "digital": {
          const {
            value: { enabled },
          } = value as {
            component: "actuator";
            kind: "digital";
          } & DatapointValue;
          return (
            <DigitalActuator
              allowed={allowed}
              defaultEnabled={kind.default_enabled}
              enabled={enabled}
              onChange={handleDigitalActuatorChange}
            />
          );
        }
        case "dpr": {
          const {
            value: { enabled, setpoint },
          } = value as {
            component: "actuator";
            kind: "dpr";
          } & DatapointValue;
          return (
            <DprActuator
              allowed={allowed}
              enabled={enabled}
              setpoint={setpoint}
              onChange={handleDprActuatorChange}
            />
          );
        }
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

export default Datapoint;
