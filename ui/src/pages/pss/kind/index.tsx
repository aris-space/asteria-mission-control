import {
  ExtendedDatapointInformation,
  NamedDatapointValue,
} from "@asteria/mission-control-client";
import { DigitalActuator } from "./DigitalActuator";
import { DprActuator } from "./DprActuator";
import { DigitalSensor } from "./DigitalSensor";
import { AnalogSensor } from "./AnalogSensor";

export const VERTICAL_PADDING: string = "4px";
export const HORIZONTAL_PADDING: string = "6px";
export const CONTAINER_HEIGHT: string = "2.5rem";
export const SLOT_WIDTH: string = "5rem";
export const GAP: string = "0.5rem";
export const SLIDER_PADDING: string = "4px";

interface DatapointKindProps
  extends Pick<ExtendedDatapointInformation, "kind">,
    Pick<NamedDatapointValue, "value"> {}

function DatapointKind({ kind, value }: DatapointKindProps) {
  if (kind.component != value.component || kind.kind != value.kind) {
    // This should not happen; We received a value of a different datapoint kind than
    // what the datapoint on the diagram is defined as.
    return <></>;
  }

  switch (value.component) {
    case "sensor": {
      switch (value.kind) {
        case "analog": {
          const unit = (kind as any).value.unit;
          return <AnalogSensor value={value.value.value} unit={unit} />;
        }
        case "digital":
          return <DigitalSensor active={value.value.enabled} />;
      }
      break;
    }
    case "actuator": {
      switch (value.kind) {
        case "digital":
          return (
            <DigitalActuator
              active={value.value.active}
              onToggle={console.log}
            />
          );
        case "dpr":
          return (
            <DprActuator
              value={value.value.setpoint}
              active={value.value.enabled}
              onSet={console.log}
              onToggle={console.log}
            />
          );
        case "fractional":
      }
      return <div />;
    }
  }
}

export default DatapointKind;
