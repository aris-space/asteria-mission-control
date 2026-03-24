import {
  Text,
  Paper,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { CONTAINER_HEIGHT, GAP, HORIZONTAL_PADDING, VERTICAL_PADDING } from ".";
import { useEffect, useRef, useState } from "react";

// Threshold between previous and new value such that it indicates
// a change in tendency.
const TENDENCY_THRESHOLD: number = 1;

// The tendency how the value of the analog sensor is changing.
type AnalogSensorTendency = "equal" | "grow" | "shrink";

interface AnalogSensorProps {
  value: number;
  unit: string;
}

export function AnalogSensor({ value, unit }: AnalogSensorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const previousValue = useRef<number>(null);
  const [tendency, setTendency] = useState<AnalogSensorTendency>("equal");

  useEffect(() => {
    if (!previousValue.current) {
      previousValue.current = value;
    }
    const difference = previousValue.current - value;
    if (difference > TENDENCY_THRESHOLD) setTendency("shrink");
    else if (difference < -TENDENCY_THRESHOLD) setTendency("grow");
    else setTendency("equal");
  }, [value]);

  return (
    <Paper
      withBorder
      radius="md"
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        overflow: "hidden",
        height: CONTAINER_HEIGHT,
        gap: `calc(${GAP} / 2)`,
        padding: `${VERTICAL_PADDING} ${HORIZONTAL_PADDING}`,
      }}
    >
      <Text p="xs" size="sm" fw={600} ff={"monospace"}>
        {value.toFixed(2)}
      </Text>
      <Tendency tendency={tendency} />
      <Text p="xs" size="sm" fw={500}>
        {unit}
      </Text>
    </Paper>
  );
}

interface TendencyProps {
  tendency: AnalogSensorTendency;
}

function Tendency({ tendency }: TendencyProps) {
  const theme = useMantineTheme();
  const centerY = tendency == "equal" ? 50 : tendency == "shrink" ? 80 : 20;

  const color =
    tendency == "equal" ? theme.colors.blue[5] : tendency == "shrink" ? theme.colors.orange[5] : theme.colors.green[5];

  const translate = tendency == "equal" ? "0" : tendency == "shrink" ? "-10%" : "10%";

  return (
    <svg
      height={"1em"}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ verticalAlign: "middle", transform: `translateY(${translate})` }}
    >
      <polyline
        fill={"none"}
        stroke={color}
        strokeWidth={15}
        strokeLinecap="round"
        points={`20,50 50,${centerY} 80,50`}
      />
    </svg>
  );
}
