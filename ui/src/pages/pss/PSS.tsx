import {
  ExtendedDatapointInformation,
  ManualActuatorChange,
  Message,
  RemoteComputerKind,
  useRfsPss,
  useRocketPss,
  useSendMessage,
} from "@asteria/mission-control-client";
import React, {
  CSSProperties,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActionIcon,
  Affix,
  Alert,
  Box,
  Flex,
  Loader,
  Tooltip,
} from "@mantine/core";
import { useMap, useToggle, useViewportSize } from "@mantine/hooks";
import * as d3 from "d3";
import { IconEye, IconEyeOff, IconZoomReset } from "@tabler/icons-react";
import classes from "./PSS.module.css";
import Datapoint from "./datapoint";
import useDiagramSvg from "@asteria/hooks/DiagramSvgHook";
import { notifications } from "@mantine/notifications";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";

// Attribute which is used to store which state a diagram node represents
const CELL_ID_ATTR: string = "data-cell-id";

type Transform = { k: number; x: number; y: number };

interface PssProps {
  kind: "rfs" | "rocket";
}

function PSS({ kind }: PssProps) {
  const { remoteComputer } = useRemoteComputer();
  const { data: pssInfo } = kind == "rfs" ? useRfsPss() : useRocketPss();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { width, height } = useViewportSize();
  // By default the datapoint markers should not be visible.
  const [datapointVisibility, toggleDatapointVisibility] = useToggle([
    "hidden",
    "inherit",
  ]);
  const [pathIndex, setPathIndex] = useState<number>(0);
  // We need to also store the path index in a ref because the manual actuator change
  // is called from a callback function and otherwise it just copies the initial path index.
  const pathIndexRef = useRef<number>(0);
  const datapointNodes = useMap<string, SVGElement>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [[activeState, _transitionTimestamp], setActiveState] = useState<
    [string | null, number]
  >([null, Date.now()]);
  const board = remoteComputer
    ? remoteComputer.kind == RemoteComputerKind.flight_computer
      ? "FlightComputer"
      : "RfsComputer"
    : null;
  const stateMachineStateMessage = useMavlinkMessage(
    board as any,
    "StateMachineState",
  );

  const {
    isZoomDirty,
    resetZoom,
    zoomTransform,
    ready: svgReady,
  } = useDiagramSvg(
    pssInfo?.diagram as string,
    containerRef as RefObject<HTMLDivElement>,
    {
      onZoom: (transform) => {
        // We do this kinda sketchy style overriding here to prevent having a state update and thus a re-render
        // per zoom event. This is much more performant as zoom events happen at a very high frequency!
        Object.keys(pssInfo?.datapointInfo || {}).forEach((name) => {
          const info = pssInfo?.datapointInfo[name];
          if (!info) return;
          const styles = computeDatapointStyle(transform, info);
          if (!styles) return;

          const datapointContainer = document.querySelector(
            `[data-datapoint-container-for="${name}"]`,
          ) as HTMLDivElement | null;
          if (!datapointContainer) return;

          datapointContainer.style.setProperty("top", styles[0].top as string);
          datapointContainer.style.setProperty(
            "left",
            styles[0].left as string,
          );

          let datapoint =
            datapointContainer.firstElementChild as HTMLDivElement | null;
          if (!datapoint) return;
          datapoint.style.setProperty(
            "transform",
            styles[1].transform as string,
          );
        });
      },
    },
  );

  useEffect(() => {
    if (!stateMachineStateMessage) return;

    const { state, pathIndex } = stateMachineStateMessage.message.content;

    const decoder = new TextDecoder();
    const bytes = new Uint8Array(state.filter(Boolean));
    const targetState = decoder.decode(bytes);

    if (targetState != activeState) {
      console.debug(`State changed to '${targetState}'`);
    }

    setPathIndex(pathIndex);
    setActiveState([targetState, Date.now()]);
  }, [stateMachineStateMessage]);

  useEffect(() => {
    pathIndexRef.current = pathIndex;
  }, [pathIndex]);

  useEffect(() => {
    updateDatapointVisibility();
    setupNodes();
  }, [pssInfo, containerRef, datapointVisibility]);

  function setupNodes() {
    if (!containerRef.current || !pssInfo) return;
    datapointNodes.clear();

    Object.entries(pssInfo.datapointInfo).forEach(([name, { cell }]) => {
      d3.select(`[${CELL_ID_ATTR}="${cell}"]`).each((_, index, nodes) => {
        const node = nodes[index] as SVGElement;
        datapointNodes.set(name, node);
      });
    });
  }

  function updateDatapointVisibility() {
    if (!containerRef.current || !pssInfo) return;

    if (pssInfo) {
      Object.entries(pssInfo.datapointInfo).forEach(([, { cell }]) => {
        d3.select(`[${CELL_ID_ATTR}="${cell}"]`).style(
          "visibility",
          datapointVisibility,
        );
      });
    }
  }

  const datapointElements = useMemo(() => {
    return Object.entries(pssInfo?.datapointInfo || {}).map(([name, info]) => {
      const styles = computeDatapointStyle(zoomTransform, info);
      if (!styles) return <React.Fragment key={name} />;

      const datapoint = (
        <Datapoint
          name={name}
          kind={info.kind}
          onChange={(name, value) => {
            const encoder = new TextEncoder();
            const actuator = new Uint8Array(encoder.encode(name).buffer);
            const action: ManualActuatorChange = {
              // Exactly 20 bytes; Pad with zeroes on the right.
              actuator: Array.from([
                ...actuator,
                ...new Array(20).fill(0),
              ]).slice(0, 20),
              pathIndex: pathIndexRef.current,
              value,
            };

            const message: Message = {
              board: board as any,
              message: {
                type: "ManualActuatorChange",
                content: action,
              },
            };
            sendMessage(
              { data: message },
              {
                onError: () => {
                  notifications.show({
                    title: "Manual actuator change failed",
                    message: `Failed to send message for manual actuator change of '${name}' to '${value}'`,
                    color: "red",
                  });
                },
              },
            );
          }}
        />
      );

      return (
        <div data-datapoint-container-for={name} key={name} style={styles[0]}>
          <div style={styles[1]}>
            {datapoint}
            <span>{info.label}</span>
          </div>
        </div>
      );
    });
  }, [height, width, pssInfo, datapointNodes, svgReady]);

  return (
    <>
      {datapointElements}
      <Flex direction={"column"} justify={"center"} align={"center"} w={"100%"}>
        {pssInfo && (
          <Affix position={{ top: "5rem", right: "lg" }}>
            <Flex gap={"xs"}>
              <Tooltip label={"Toggle datapoint highlight"}>
                <ActionIcon onClick={() => toggleDatapointVisibility()}>
                  {datapointVisibility == "inherit" ? (
                    <IconEyeOff />
                  ) : (
                    <IconEye />
                  )}
                </ActionIcon>
              </Tooltip>
              {isZoomDirty && (
                <Tooltip label={"Reset zoom and pan"}>
                  <ActionIcon onClick={resetZoom}>
                    <IconZoomReset />
                  </ActionIcon>
                </Tooltip>
              )}
            </Flex>
          </Affix>
        )}
        <Affix position={{ bottom: "lg", left: "lg" }}>
          {isSending && <Loader size={"sm"} />}
        </Affix>
        {!remoteComputer ? (
          <Flex p={"lg"} justify={"center"} align={"center"}>
            <Alert
              variant="light"
              color="yellow"
              title="No active remote computer"
            >
              You need to activate a remote computer before you can interact
              with a PSS diagram.
            </Alert>
          </Flex>
        ) : kind == "rfs" &&
          remoteComputer.kind == RemoteComputerKind.flight_computer ? (
          <Flex p={"lg"} justify={"center"} align={"center"}>
            <Alert
              variant="light"
              color="yellow"
              title="RFS PSS diagram unavailable"
            >
              The RFS PSS diagram is not available when the active remote
              computer is a flight computer.
            </Alert>
          </Flex>
        ) : (
          <Box w={"100%"}>
            <section
              data-highlight-states={datapointVisibility}
              className={classes.container}
              ref={containerRef}
            />
          </Box>
        )}
      </Flex>
    </>
  );
}

/**
 * Compute the style of a single datapoint.
 * This is a separate method as it's also used when a zoom event occurrs.
 * @param transform the current zoom transform object
 * @param info datapoint information returned from API
 * @returns css inline style object or undefined if no cell was found
 */
function computeDatapointStyle(
  transform: Transform,
  info: ExtendedDatapointInformation,
): [CSSProperties, CSSProperties] | undefined {
  const node = d3
    .select(`[${CELL_ID_ATTR}="${info?.cell}"]`)
    .node() as SVGElement | null;

  if (!node) return undefined;
  const bounds = node.getBoundingClientRect();
  const datapointContainerStyle: CSSProperties = {
    // Position the container relative to the viewport (ignore scroll).
    position: "absolute",
    top: `${window.scrollY + bounds.top + bounds.height / 2}px`,
    left: `${window.scrollX + bounds.left + bounds.width / 2}px`,
  };

  if (info.align == "left") {
    // It's left aligned.
    datapointContainerStyle.transform = "translateY(-50%)";
  } else {
    // It's right aligned.
    datapointContainerStyle.transform = "translateY(-50%) translateX(-100%)";
  }

  const datapointStyle: CSSProperties = {
    transform: `scale(${transform.k})`,
    transformOrigin: `center ${info.align}`,
    display: "flex",
    whiteSpace: "nowrap",
    gap: "0.5rem",
    alignItems: "center",
    flexDirection: info.align == "left" ? "row" : "row-reverse",
  };

  return [datapointContainerStyle, datapointStyle];
}

export default PSS;
