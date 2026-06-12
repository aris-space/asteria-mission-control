import {
  DatapointValue,
  ExtendedDatapointInformation,
} from "@asteria/mission-control-client";
import { DigitalActuator } from "./DigitalActuator";
import { DprActuator } from "./DprActuator";
import { FractionalActuator } from "./FractionalActuator";
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

export const CONTAINER_HEIGHT: string = "2rem";
export const SLOT_WIDTH: string = "4rem";
export const GAP: string = "0.2rem";

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
              stateText={["Open", "Closed"]}
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
        case "fractional": {
          const {
            value: { percent },
          } = value as {
            component: "actuator";
            kind: "fractional";
          } & DatapointValue;
          return (
            <FractionalActuator
              allowed={allowed}
              percent={percent}
              onChange={(fraction) => onChange(name, fraction)}
            />
          );
        }
      }
      return <div />;
    }
  }
}

export function DatapointLoader() {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Paper
      shadow="xs"
      radius="md"
      style={{
        position: "relative",
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        overflow: "hidden",
        height: CONTAINER_HEIGHT,
      }}
    >
      <Flex h="100%" px="xs" align={"center"}>
        <Loader size="xs" />
      </Flex>
    </Paper>
  );
}

export default Datapoint;
