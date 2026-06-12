import {
  Stack,
  Title,
  Switch,
  Group,
  Text,
  Divider,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { DigitalActuator } from "./datapoint/DigitalActuator";
import { DprActuator } from "./datapoint/DprActuator";
import { FractionalActuator } from "./datapoint/FractionalActuator";
import { DigitalSensor } from "./datapoint/DigitalSensor";
import { AnalogSensor } from "./datapoint/AnalogSensor";
import { DatapointLoader } from "./datapoint";

export default function Demo() {
  // DigitalActuator state
  const [daEnabled, setDaEnabled] = useState(false);
  const [daAllowed, setDaAllowed] = useState(true);
  const [daDefault, setDaDefault] = useState(false);

  // FractionalActuator state
  const [faPercent, setFaPercent] = useState(0);
  const [faAllowed, setFaAllowed] = useState(true);

  // DprActuator state
  const [dprEnabled, setDprEnabled] = useState(false);
  const [dprAllowed, setDprAllowed] = useState(true);
  const [dprSetpoint, setDprSetpoint] = useState(1.5);

  // DigitalSensor state
  const [dsEnabled, setDsEnabled] = useState(false);
  const [dsDefault, setDsDefault] = useState(false);

  // AnalogSensor state
  const [asValue, setAsValue] = useState<number | string>(42.0);
  const [asPrecision, setAsPrecision] = useState<number | string>(2);
  const [asUnit, setAsUnit] = useState("bar");

  return (
    <Stack p="xl" gap="xl" maw={700}>
      <Title order={2}>PSS Component Demo</Title>

      {/* DigitalActuator */}
      <Stack gap="sm">
        <Text fw={600}>DigitalActuator</Text>
        <DigitalActuator
          enabled={daEnabled}
          allowed={daAllowed}
          defaultEnabled={daDefault}
          onChange={setDaEnabled}
          stateText={["Open", "Closed"]}
        />
        <Group gap="lg">
          <Switch
            label="enabled"
            checked={daEnabled}
            onChange={(e) => setDaEnabled(e.currentTarget.checked)}
          />
          <Switch
            label="allowed"
            checked={daAllowed}
            onChange={(e) => setDaAllowed(e.currentTarget.checked)}
          />
          <Switch
            label="defaultEnabled"
            checked={daDefault}
            onChange={(e) => setDaDefault(e.currentTarget.checked)}
          />
        </Group>
      </Stack>

      <Divider />

      {/* FractionalActuator */}
      <Stack gap="sm">
        <Text fw={600}>FractionalActuator</Text>
        <FractionalActuator
          percent={faPercent}
          allowed={faAllowed}
          onChange={setFaPercent}
        />
        <Group gap="lg" align="flex-end">
          <Switch
            label="allowed"
            checked={faAllowed}
            onChange={(e) => setFaAllowed(e.currentTarget.checked)}
          />
          <NumberInput
            label="percent (0–1)"
            value={faPercent}
            onChange={(v) => setFaPercent(Number(v))}
            step={0.1}
            min={0}
            max={1}
            size="xs"
            w={110}
          />
        </Group>
      </Stack>

      <Divider />

      {/* DprActuator */}
      <Stack gap="sm">
        <Text fw={600}>DprActuator</Text>
        <DprActuator
          enabled={dprEnabled}
          allowed={dprAllowed}
          setpoint={dprSetpoint}
          onChange={(active, value) => {
            setDprEnabled(active);
            if (!isNaN(value)) setDprSetpoint(value);
          }}
        />
        <Group gap="lg" align="flex-end">
          <Switch
            label="enabled"
            checked={dprEnabled}
            onChange={(e) => setDprEnabled(e.currentTarget.checked)}
          />
          <Switch
            label="allowed"
            checked={dprAllowed}
            onChange={(e) => setDprAllowed(e.currentTarget.checked)}
          />
          <NumberInput
            label="setpoint"
            value={dprSetpoint}
            onChange={(v) => setDprSetpoint(Number(v))}
            step={0.1}
            size="xs"
            w={80}
          />
        </Group>
      </Stack>

      <Divider />

      {/* DigitalSensor */}
      <Stack gap="sm">
        <Text fw={600}>DigitalSensor</Text>
        <DigitalSensor enabled={dsEnabled} defaultEnabled={dsDefault} />
        <Group gap="lg">
          <Switch
            label="enabled"
            checked={dsEnabled}
            onChange={(e) => setDsEnabled(e.currentTarget.checked)}
          />
          <Switch
            label="defaultEnabled"
            checked={dsDefault}
            onChange={(e) => setDsDefault(e.currentTarget.checked)}
          />
        </Group>
      </Stack>

      <Divider />

      {/* AnalogSensor */}
      <Stack gap="sm">
        <Text fw={600}>AnalogSensor</Text>
        <AnalogSensor
          value={Number(asValue)}
          precision={Number(asPrecision)}
          unit={asUnit}
        />
        <Group gap="lg" align="flex-end">
          <NumberInput
            label="value"
            value={asValue}
            onChange={setAsValue}
            step={0.1}
            size="xs"
            w={100}
          />
          <NumberInput
            label="precision"
            value={asPrecision}
            onChange={setAsPrecision}
            min={0}
            max={6}
            size="xs"
            w={80}
          />
          <TextInput
            label="unit"
            value={asUnit}
            onChange={(e) => setAsUnit(e.currentTarget.value)}
            size="xs"
            w={80}
          />
        </Group>
      </Stack>

      <Divider />

      <DatapointLoader></DatapointLoader>
    </Stack>
  );
}
