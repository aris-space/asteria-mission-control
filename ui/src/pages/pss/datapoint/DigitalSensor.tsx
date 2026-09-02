import {
  Text,
  Paper,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { CONTAINER_HEIGHT, SLOT_WIDTH } from ".";

interface DigitalSensorProps {
  enabled: boolean;
  defaultEnabled: boolean;
  /** Label for [enabled, disabled] */
  stateText?: [string, string];
}

export function DigitalSensor({
  enabled,
  defaultEnabled,
  stateText = ["On", "Off"],
}: DigitalSensorProps) {
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
        backgroundColor,
        height: CONTAINER_HEIGHT,
        width: SLOT_WIDTH,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: theme.colors[buttonColorName][8],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <Text size="sm" fw={600} c={theme.colors[buttonColorName][8]}>
        {stateText[enabled ? 0 : 1]}
      </Text>
    </Paper>
  );
}
