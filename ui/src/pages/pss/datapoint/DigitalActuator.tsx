import {
  Box,
  Text,
  Paper,
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

interface DigitalActuatorProps {
  onChange: (active: boolean) => void;
  enabled: boolean;
  allowed: boolean;
  defaultEnabled: boolean;
}

export function DigitalActuator({
  onChange,
  enabled,
  allowed,
  defaultEnabled,
}: DigitalActuatorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const color = allowed ? (enabled ? "green" : "red") : "dark";

  // Boolean whether the "knob" of the actuator should be at the right of the datapoint indicator.
  // If the actuator is _not_ enabled by default, we want the "enabled" state to be on the right.
    const right = defaultEnabled ? !enabled : enabled;

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
        gap: GAP,
        width: `calc(1.5 * ${SLOT_WIDTH} + 2 * ${HORIZONTAL_PADDING})`,
        padding: `${VERTICAL_PADDING} ${HORIZONTAL_PADDING}`,
      }}
    >
      <Box style={{ zIndex: 1 }} />
      <Box style={{ zIndex: 1 }} />
      <Box
        onClick={() => {
          if (!allowed) return;
          onChange(!enabled);
        }}
        style={{
          position: "absolute",
          top: SLIDER_PADDING,
          bottom: SLIDER_PADDING,
          left: SLIDER_PADDING,
          width: `calc(${SLOT_WIDTH} - 2 * ${SLIDER_PADDING})`,
          zIndex: 2,
          cursor: allowed ? "pointer" : "default",
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: theme.colors[color][9],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          backgroundColor: theme.colors[color][1],
          color: theme.colors[color][9],
          transform: right
            ? `translateX(calc(${SLOT_WIDTH} * 0.5 + calc(${HORIZONTAL_PADDING} * 2)))`
            : "translateX(0)",
        }}
      >
        <Text p="xs" size="sm" fw={600}>
          {enabled ? "Open" : "Closed"}
        </Text>
      </Box>
    </Paper>
  );
}
