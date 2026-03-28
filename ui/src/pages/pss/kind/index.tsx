import {
  ExtendedDatapointInformation,
  ManualActuatorChange,
  NamedPssDatapointValue,
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
  extends Pick<ExtendedDatapointInformation, "kind" | "name">,
    Pick<NamedPssDatapointValue, "value"> {
  onChange: (action: ManualActuatorChange) => void;
}

function DatapointKind({ kind, name, value, onChange }: DatapointKindProps) {
  const handleDigitalActuatorChange = (active: boolean) => {
    const encoder = new TextEncoder();
    // We assume that the backend does bounds checks on the actuator name bytes length and
    // thus we don't need to do that here.
    const bytes = new Uint8Array(encoder.encode(name).buffer);
    const action: ManualActuatorChange = {
      actuator: Array.from(bytes),
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
      actuator: Array.from(bytes),
      pathIndex: 0,
      value: active ? value : NaN,
    };
    onChange(action);
  };

  switch (kind.component) {
    case "sensor": {
      switch (kind.kind) {
        case "analog": {
          const unit = kind.value.unit;
          return <AnalogSensor value={value} unit={unit} />;
        }
        case "digital":
          return <DigitalSensor active={value == 1.0} />;
      }
      break;
    }
    case "actuator": {
      switch (kind.kind) {
        case "digital":
          return (
            <DigitalActuator
              active={value == 1.0}
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

export default DatapointKind;
