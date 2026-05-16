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
  defaultEnabled: boolean;
}

export function DigitalActuator({
  onChange,
  enabled,
  defaultEnabled: _,
}: DigitalActuatorProps) {
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
        gap: GAP,
        width: `calc(1.5 * ${SLOT_WIDTH} + 2 * ${HORIZONTAL_PADDING})`,
        padding: `${VERTICAL_PADDING} ${HORIZONTAL_PADDING}`,
      }}
    >
      <Box style={{ zIndex: 1 }} />
      <Box style={{ zIndex: 1 }} />
      <Box
        onClick={() => onChange(!enabled)}
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
          borderColor: enabled ? theme.colors.green[9] : theme.colors.red[9],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          backgroundColor: enabled
            ? theme.colors.green[1]
            : theme.colors.red[1],
          color: enabled ? theme.colors.green[9] : theme.colors.red[9],
          transform: enabled
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
