import { useState } from "react";
import {
  Box,
  Text,
  Paper,
  Modal,
  Slider,
  Button,
  ActionIcon,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { CONTAINER_HEIGHT, SLOT_WIDTH } from ".";

interface FractionalActuatorProps {
  fraction: number; // 0-1 fraction
  allowed: boolean;
  onChange: (fraction: number) => void;
}

export function FractionalActuator({
  fraction,
  allowed,
  onChange,
}: FractionalActuatorProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const isOpen = fraction > 0;
  const isFull = fraction >= 1.0;

  const buttonColorName = isFull ? "green" : isOpen ? "yellow" : "red";
  const buttonColor = theme.colors[buttonColorName][2];
  const borderAndTextColor = allowed
    ? theme.colors[buttonColorName][8]
    : theme.colors["dark"][2];
  const defaultBg =
    colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];
  const backgroundColor = isOpen ? buttonColor : defaultBg;

  const displayText = isFull
    ? "Open"
    : isOpen
      ? `${Math.round(fraction * 100)}%`
      : "Closed";

  const handleGearClick = () => {
    if (!allowed) return;
    setSliderValue(Math.round(fraction * 100));
    setModalOpen(true);
  };

  const handleConfirm = () => {
    onChange(sliderValue / 100);
    setModalOpen(false);
  };

  return (
    <>
      <Paper
        shadow="xs"
        radius="md"
        style={{
          position: "relative",
          backgroundColor,
          overflow: "hidden",
          transition: "background-color 0.3s ease",
          height: CONTAINER_HEIGHT,
          // 3-zone layout: [knob-left | gear-center | knob-right]
          // knob slides between left and right zone
          width: `calc(2.5 * ${SLOT_WIDTH})`,
        }}
      >
        {/* Gear icon: always centered in the middle zone */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${SLOT_WIDTH})`,
            width: `calc(0.5 * ${SLOT_WIDTH})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            disabled={!allowed}
            onClick={handleGearClick}
            style={{ cursor: allowed ? "pointer" : "not-allowed" }}
          >
            <IconSettings size={14} />
          </ActionIcon>
        </Box>

        {/* Toggle knob */}
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
            borderColor: borderAndTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "transform 0.4s ease-in-out, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
            backgroundColor: buttonColor,
            color: borderAndTextColor,
            transform: isOpen
              ? `translateX(calc(1.5 * ${SLOT_WIDTH}))`
              : "translateX(0)",
          }}
        >
          <Text
            p="xs"
            size="sm"
            fw={600}
            ff={isOpen && !isFull ? "monospace" : "text"}
          >
            {displayText}
          </Text>
        </Box>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Set opening percentage"
        size="sm"
        centered
      >
        <Slider
          value={sliderValue}
          onChange={setSliderValue}
          size="xl"
          min={0}
          max={100}
          step={5}
          marks={[
            { value: 0, label: "0%" },
            { value: 25, label: "25%" },
            { value: 50, label: "50%" },
            { value: 75, label: "75%" },
            { value: 100, label: "100%" },
          ]}
          mb="xl"
        />
        <Button fullWidth mt="md" onClick={handleConfirm}>
          Set to {sliderValue}%
        </Button>
      </Modal>
    </>
  );
}
