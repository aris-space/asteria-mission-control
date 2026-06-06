import {
  Box,
  Text,
  Paper,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { CONTAINER_HEIGHT, SLOT_WIDTH } from ".";

interface DigitalSensorProps {
  enabled: boolean;
  defaultEnabled: boolean;
}

export function DigitalSensor({ enabled, defaultEnabled }: DigitalSensorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const notNormal = defaultEnabled !== enabled;
  const buttonColorName = enabled ? "green" : "red";
  const buttonColor = theme.colors[buttonColorName][2];
  const defaultBg =
    colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];
  const backgroundColor = notNormal ? buttonColor : defaultBg;

  return (
    <Paper
      shadow="xs"
      radius="md"
      style={{
        position: "relative",
        backgroundColor,
        overflow: "hidden",
        height: CONTAINER_HEIGHT,
        width: `calc(1.5 * ${SLOT_WIDTH})`,
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: `calc(${SLOT_WIDTH})`,
          zIndex: 2,
          borderRadius: theme.radius.md,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: theme.colors[buttonColorName][8],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          backgroundColor: buttonColor,
          color: theme.colors[buttonColorName][8],
          transform: notNormal
            ? `translateX(calc(${SLOT_WIDTH} * 0.5))`
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
