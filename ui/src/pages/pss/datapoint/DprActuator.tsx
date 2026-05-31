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
import { CONTAINER_HEIGHT, GAP, SLOT_WIDTH } from ".";

interface DprActuatorProps {
  enabled: boolean;
  allowed: boolean;
  setpoint: number;
  onChange: (active: boolean, value: number) => void;
}

export function DprActuator({
  enabled,
  allowed,
  setpoint,
  onChange,
}: DprActuatorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const buttonColorName = enabled ? "green" : "red";
  const buttonColor = theme.colors[buttonColorName][2];
  const borderAndTextColor = allowed
    ? theme.colors[buttonColorName][8]
    : theme.colors["dark"][2];
  const [inputValue, setInputValue] = useState<number | string>(setpoint);

  return (
    <Paper
      shadow="xs"
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
        <Transition mounted={enabled} transition="fade" duration={400}>
          {(styles) => (
            <Button
              style={styles}
              size="xs"
              lh={1.75}
              color="dark"
              h={"fit-content"}
              variant="light"
              disabled={!allowed}
              onClick={() => onChange(enabled, Number(inputValue))}
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
          disabled={!allowed}
          placeholder="Input"
          step={1}
          variant="unstyled"
          size="xs"
          styles={{
            input: {
              width: "100%",
              textAlign: "center",
              fontWeight: 500,
              backgroundColor: "white",
            },
          }}
        />
      </Box>
      <Box
        onClick={() => {
          if (!allowed) return;
          // When deactivating the DPR, set the value of the setpoint input
          // to the current value such that "spaming" activate-deactivate
          // doesn't change the setpoint.
          if (enabled) setInputValue(setpoint);
          onChange(!enabled, enabled ? NaN : Number(inputValue as string));
        }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: `calc(${SLOT_WIDTH})`,
          zIndex: 2,
          cursor: allowed ? "pointer" : "not-allowed",
          borderRadius: theme.radius.md,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: borderAndTextColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          backgroundColor: buttonColor,
          color: borderAndTextColor,
          transform: enabled
            ? `translateX(calc(${SLOT_WIDTH} * 2)`
            : "translateX(0)",
        }}
      >
        <Text p="xs" size="sm" fw={600} ff={enabled ? "monospace" : "text"}>
          {enabled ? setpoint : "Closed"}
        </Text>
      </Box>
    </Paper>
  );
}
