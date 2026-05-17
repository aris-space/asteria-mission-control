import {
  ManualStateTransition,
  Message,
  useSendMessage,
} from "@asteria/mission-control-client";
import { RefObject, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ActionIcon,
  Affix,
  Alert,
  Badge,
  Box,
  Flex,
  Loader,
  Tooltip,
} from "@mantine/core";
import classes from "./StateMachine.module.css";
import { IconEye, IconEyeOff, IconZoomReset } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useDiagramSvg from "@asteria/hooks/DiagramSvgHook";
import { useInterval, useToggle } from "@mantine/hooks";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";

// Attribute which is used to store which state a diagram node represents
const CELL_ID_ATTR: string = "data-cell-id";
/// Attribute which is used to annotate a state cell with it's corresponding state
const CELL_STATE_ATTR: string = "data-state";
// Attribute which is used to indicate whether a state is clickable
const CLICKABLE_ATTR: string = "data-clickable-state";
// Attribute which is used to indicate whether a state is active
const ACTIVE_ATTR: string = "data-active-state";
// Attribute which is used to indicate whether a state is reachable from
// the current state using a manual transition
const MANUALLLY_REACHABLE_ATTR: string = "data-manually-reachable-state";
// Attribute which is indicated that the manual transition into this
// state is an abort transition.
const ABORT_TRANSITION_ATTR: string = "data-abort-transition";

function StateMachine() {
  const { remoteComputer, remoteComputerBoard, stateMachine } =
    useRemoteComputer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathIndex, setPathIndex] = useState<number>(0);
  // We need to also store the path index in a ref because the `handleManualStateTransition` method
  // is called from a callback function and otherwise it just copies the initial path index.
  const pathIndexRef = useRef<number>(0);
  // By default the states should not be highlighted.
  const [highlightStates, toggleHighlightStates] = useToggle([false, true]);
  const [[activeState, transitionTimestamp], setActiveState] = useState<
    [string | null, number]
  >([null, Date.now()]);
  const stateMachineStateMessage = useMavlinkMessage(
    remoteComputerBoard as any,
    "StateMachineState",
  );

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const {
    isZoomDirty,
    resetZoom,
    ref: svgRef,
  } = useDiagramSvg(
    stateMachine?.diagram as string,
    containerRef as RefObject<HTMLDivElement>,
  );

  useEffect(() => {
    if (!stateMachine) setActiveState([null, Date.now()]);
    else
      setActiveState(([state]) => [
        state ?? stateMachine?.initialState ?? null,
        Date.now(),
      ]);
    toggleHighlightStates(false);
  }, [stateMachine]);

  useEffect(() => {
    pathIndexRef.current = pathIndex;
  }, [pathIndex]);

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
    highlightActiveState();
    highlightManuallyReachableStates();
    highlightAvailableStates();
    removeStateListeners();
    setupStateListeners();
  }, [activeState, stateMachine, svgRef.current]);

  /**
   * Get the name of the state how it's present in the diagram. If no (postfixed) version of the
   * state is present in the diagram, return `undefined`.
   * @param state original name of the state (with postfix)
   * @returns name of the state how it's present in the diagram.
   */
  const getDiagramState = (state: string) => {
    if (!stateMachine?.stateNodes[state]) {
      // The target state does not exist in the diagram.
      if (state.endsWith(" - W")) return state.substring(0, state.length - 4);
      else {
        const split = state.split(" ");
        const postfix = split[split.length - 1];
        const stateName = split.slice(0, split.length - 1).join(" ");
        if (!isNaN(parseInt(postfix))) return stateName;
        else {
          return undefined;
        }
      }
    } else {
      return state;
    }
  };

  function removeStateListeners() {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll(`[${CLICKABLE_ATTR}]`)
      // .selectAll("rect")
      .style("cursor", "default")
      .each((_, index, nodes) => {
        const node = nodes[index] as SVGRectElement;
        node.onclick = null;
      });
  }

  function setupStateListeners() {
    if (!svgRef.current) return;

    // Add click listener to rects representing a state of the state machine
    // and set correct cursor.
    d3.select(svgRef.current)
      .selectAll(`[${MANUALLLY_REACHABLE_ATTR}="true"]`)
      .attr(CLICKABLE_ATTR, "true")
      .style("cursor", "pointer")
      .each((_, index, nodes) => {
        const node = nodes[index] as SVGElement;
        node.onclick = () => {
          const stateNode = node.closest(`[${CELL_ID_ATTR}]`);
          if (!stateNode) {
            notifications.show({
              title: "Invalid diagram",
              message:
                "Clicked node does not have a parent node which contains the state information",
              color: "red",
            });
            return;
          }

          const stateId = stateNode.getAttribute(CELL_ID_ATTR) as string;

          if (stateMachine) {
            const [state] =
              Object.entries(stateMachine.stateNodes).find(
                ([, id]) => id == stateId,
              ) ?? [];

            if (state) {
              handleManualStateTransition(state);
            } else {
              console.warn(
                `Found no state->node mapping in state machine for node ${stateId}`,
              );
            }
          } else {
            console.warn(
              `Clicked on state machine node ${stateId} but no state machine is active`,
            );
          }
        };
      });
  }

  /**
   * Handle a manual state transition by sending a JSON-serialized
   * MavLink message to the backend.
   * @param state name of the state which should be transitioned into.
   */
  function handleManualStateTransition(state: string) {
    const encoder = new TextEncoder();
    const bytes = new Uint8Array(encoder.encode(state).buffer);
    const transition: ManualStateTransition = {
      // Exactly 30 bytes; Pad on the right with zeroes.
      state: Array.from([...bytes, ...new Array(30).fill(0)]).slice(0, 30),
      transitionIndex: pathIndexRef.current + 1,
    };
    const message: Message = {
      board: remoteComputerBoard as any,
      message: { type: "ManualStateTransition", content: transition },
    };
    sendMessage(
      { data: message },
      {
        onError: () => {
          notifications.show({
            title: "Manual transition failed",
            message: `Failed to send message for manual state transition into '${state}'`,
            color: "red",
          });
        },
      },
    );
  }

  function highlightActiveState() {
    if (!svgRef.current) return;
    // remove all currently highlighted states
    d3.select(svgRef.current)
      .selectAll(`[${ACTIVE_ATTR}`)
      .attr(ACTIVE_ATTR, null);
    if (activeState && stateMachine) {
      const diagramState = getDiagramState(activeState);
      if (!diagramState) {
        // A state which doesn't exist in the diagram and which doesn't have a postfix
        // should be unreachable.
        notifications.show({
          title: "Invalid active state",
          message: `Received active state '${activeState}' which does not exist in the diagram and is not a postfixed state`,
          color: "red",
        });
        return;
      }

      const activeStateId = stateMachine.stateNodes[diagramState];
      d3.select(svgRef.current)
        .selectAll(`[${CELL_ID_ATTR}="${activeStateId}"]`)
        .attr(ACTIVE_ATTR, true);
    }
  }

  function highlightManuallyReachableStates() {
    if (!svgRef.current) return;
    // Remove all currently highlighted states.
    d3.select(svgRef.current)
      .selectAll(`[${MANUALLLY_REACHABLE_ATTR}`)
      .attr(MANUALLLY_REACHABLE_ATTR, null);
    d3.select(svgRef.current)
      .selectAll(`[${ABORT_TRANSITION_ATTR}`)
      .attr(ABORT_TRANSITION_ATTR, null);
    if (stateMachine && activeState) {
      stateMachine.manualTransitions[activeState].forEach(([state, abort]) => {
        const stateId = stateMachine.stateNodes[state];
        d3.select(svgRef.current)
          .select(`[${CELL_ID_ATTR}="${stateId}"]`)
          .attr(MANUALLLY_REACHABLE_ATTR, true)
          .attr(ABORT_TRANSITION_ATTR, abort)
          .each((_, index, nodes) => {
            const node = nodes[index] as SVGElement;
            if (!node) return;
            const rect = node.querySelector("rect");
            if (!rect) return;
            calculateAndSetRectDasharray(rect, 10, 10);
          });
      });
    }
  }

  function highlightAvailableStates() {
    if (!containerRef.current) return;
    // remove all currently highlighted cells
    d3.select(svgRef.current)
      .selectAll(`[${CELL_STATE_ATTR}`)
      .attr(CELL_STATE_ATTR, null);

    if (stateMachine) {
      Object.entries(stateMachine.stateNodes).forEach(([label, id]) => {
        d3.select(`[${CELL_ID_ATTR}="${id}"]`).attr(CELL_STATE_ATTR, label);
      });
    }
  }

  return (
    <Flex direction={"column"} justify={"center"} align={"center"} w={"100%"}>
      {stateMachine && (
        <Affix position={{ top: "5rem", right: "lg" }}>
          <Flex gap={"xs"}>
            <Tooltip label={"Toggle node highlight"}>
              <ActionIcon onClick={() => toggleHighlightStates()}>
                {highlightStates ? <IconEyeOff /> : <IconEye />}
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
      <Affix position={{ bottom: "lg", right: "lg" }}>
        {stateMachine && activeState && (
          <StateStats
            pathIndex={pathIndex}
            stateName={activeState}
            transitionTimestamp={transitionTimestamp}
          />
        )}
      </Affix>
      {stateMachine ? (
        <Box w={"100%"}>
          <section
            data-highlight-states={highlightStates}
            className={classes.container}
            ref={containerRef}
          />
        </Box>
      ) : remoteComputer ? (
        <Flex p={"lg"} justify={"center"} align={"center"}>
          <Alert
            variant="light"
            color="yellow"
            title="No state machine for remote computer"
          >
            Until now, no state machine has been received for the active remote
            computer
          </Alert>
        </Flex>
      ) : (
        <Flex p={"lg"} justify={"center"} align={"center"}>
          <Alert
            variant="light"
            color="yellow"
            title="No active remote computer"
          >
            You need to activate a remote computer before you can interact with
            a state machine.
          </Alert>
        </Flex>
      )}
    </Flex>
  );
}

/**
 * Calculate the dash array properties for a rect to achieve a
 * dash array and write them into the `--dasharray` CSS variable.
 * The perfect offset for a smooth animation is written into the
 * `--smooth-offset` CSS variable.
 * @param dashWidth width of a single dash in pixels.
 * @param gapWidth width of a single gap in pixels.
 * @param rect rect to calculate the dash array for.
 */
function calculateAndSetRectDasharray(
  rect: SVGRectElement,
  dashWidth: number,
  gapWidth: number,
) {
  const perimeter = rect.getTotalLength();
  const totalWidth = dashWidth + gapWidth;
  const repetitions = Math.round(perimeter / totalWidth);
  const actualPatternLen = perimeter / repetitions;
  const dash = actualPatternLen * (dashWidth / totalWidth);
  const gap = actualPatternLen * (gapWidth / totalWidth);
  rect.style.setProperty("--dasharray", `${dash} ${gap}`);
  rect.style.setProperty("--smooth-offset", actualPatternLen.toString());
}

const SECOND_MS: number = 1000;
const MINUTE_MS: number = 60 * SECOND_MS;
const HOUR_MS: number = 60 * MINUTE_MS;

interface StateStatsProps {
  pathIndex: number;
  stateName: string;
  transitionTimestamp: number;
}

function StateStats({
  pathIndex,
  stateName,
  transitionTimestamp,
}: StateStatsProps) {
  const [inStateSince, setInStateSince] = useState<number>(0);

  useInterval(
    () => {
      setInStateSince(Date.now() - transitionTimestamp);
    },
    50,
    { autoInvoke: true },
  );

  const formatDuration = (durationMs: number) => {
    if (durationMs >= HOUR_MS) {
      const hours = (durationMs / HOUR_MS).toFixed(3);
      return [hours, "hours"];
    }
    if (durationMs >= MINUTE_MS) {
      const minutes = (durationMs / MINUTE_MS).toFixed(3);
      return [minutes, "minutes"];
    }
    if (durationMs >= SECOND_MS) {
      const seconds = (durationMs / SECOND_MS).toFixed(3);
      return [seconds, "seconds"];
    }
    return [durationMs, "milliseconds"];
  };

  const [duration, unit] = formatDuration(inStateSince);

  return (
    <Flex direction="row" gap="xs" align={"flex-end"}>
      <Tooltip label={`The current state is '${stateName}'`}>
        <Badge color="teal">{stateName}</Badge>
      </Tooltip>
      <Tooltip label={`The current path index is ${pathIndex}`}>
        <Badge color="cyan">Path index {pathIndex}</Badge>
      </Tooltip>
      <Tooltip
        label={`The state transition into '${stateName}' at path index ${pathIndex} occurred ${duration} ${unit} ago`}
      >
        <Badge color="gray">
          <code>{duration}</code> {unit}
        </Badge>
      </Tooltip>
    </Flex>
  );
}

export default StateMachine;
