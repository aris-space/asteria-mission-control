import { useState } from "react";
import {
  Box,
  NumberInput,
  Button,
  Text,
  Paper,
  Transition,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  CONTAINER_HEIGHT,
  GAP,
  HORIZONTAL_PADDING,
  SLIDER_PADDING,
  SLOT_WIDTH,
  VERTICAL_PADDING,
} from ".";

interface DprActuatorProps {
  value: number;
  onChange: (active: boolean, value: number) => void;
  active: boolean;
}

export function DprActuator({ value, onChange, active }: DprActuatorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [inputValue, setInputValue] = useState<number | string>(value);

  return (
    <Paper
      withBorder
      radius="md"
      style={{
        width: "fit-content",
        position: "relative",
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        overflow: "hidden",
        display: "grid",
        height: CONTAINER_HEIGHT,
        gap: GAP,
        padding: `${VERTICAL_PADDING} ${HORIZONTAL_PADDING}`,
        gridTemplateColumns: `${SLOT_WIDTH} calc(${SLOT_WIDTH} - 2 * ${GAP}) ${SLOT_WIDTH}`,
        alignItems: "stretch",
      }}
    >
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Transition mounted={active} transition="fade" duration={400}>
          {(styles) => (
            <Button
              style={styles}
              size="xs"
              lh={1.75}
              color="dark"
              h={"fit-content"}
              variant="light"
              onClick={() => onChange(active, Number(inputValue))}
            >
              SET
            </Button>
          )}
        </Transition>
      </Box>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <NumberInput
          value={inputValue}
          onChange={setInputValue}
          placeholder="Input"
          step={0.1}
          variant="unstyled"
          size="xs"
          styles={{
            input: {
              width: "100%",
              textAlign: "center",
              fontWeight: 500,
              backgroundColor: theme.colors.gray[2],
            },
          }}
        />
      </Box>
      <Box style={{ zIndex: 1 }} />
      <Box
        onClick={() => {
          // When deactivating the DPR, set the value of the setpoint input
          // to the current value such that "spaming" activate-deactivate
          // doesn't change the setpoint.
          if (active) setInputValue(value);
          onChange(!active, active ? NaN : Number(inputValue as string));
        }}
        style={{
          position: "absolute",
          top: SLIDER_PADDING,
          bottom: SLIDER_PADDING,
          left: SLIDER_PADDING,
          width: `calc(${SLOT_WIDTH} - 2 * ${SLIDER_PADDING})`,
          zIndex: 2,
          cursor: "pointer",
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: active ? theme.colors.green[9] : theme.colors.red[9],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          backgroundColor: active ? theme.colors.green[1] : theme.colors.red[1],
          color: active ? theme.colors.green[9] : theme.colors.red[9],
          transform: active
            ? `translateX(calc(${SLOT_WIDTH} * 2 + calc(${HORIZONTAL_PADDING} * 2)))`
            : "translateX(0)",
        }}
      >
        <Text p="xs" size="sm" fw={600} ff={active ? "monospace" : "text"}>
          {active ? value : "Off"}
        </Text>
      </Box>
    </Paper>
  );
}
