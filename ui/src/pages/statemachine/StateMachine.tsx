import {
  ManualStateTransition,
  Message,
  StateMachine as StateMachineDefintion,
  useActiveScenario,
  useAllStateMachines,
  useSendMessage,
  useStateMachine,
} from "@asteria/mission-control-client";
import React, { RefObject, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ActionIcon,
  Affix,
  Alert,
  Box,
  Flex,
  Loader,
  Select,
  Tooltip,
} from "@mantine/core";
import classes from "./StateMachine.module.css";
import { IconEye, IconEyeOff, IconZoomReset } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useDiagramSvg from "@asteria/hooks/DiagramSvgHook";
import { useMavlinkMessage } from "@asteria/hooks/EventContext";
import { useToggle } from "@mantine/hooks";

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

function StateMachine() {
  const [stateMachine, setStateMachine] =
    useState<StateMachineDefintion | null>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathIndex, setPathIndex] = useState<number>(0);
  // By default the states should not be highlighted.
  const [highlightStates, toggleHighlightStates] = useToggle([false, true]);
  const [activeState, setActiveState] = useState<string | null>();
  const board = stateMachine
    ? stateMachine.kind == "fc"
      ? "FlightComputer"
      : "RfsComputer"
    : null;
  const manualStateTransitionMessage = useMavlinkMessage(
    board as any,
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
    setActiveState(stateMachine?.initialState ?? null);
    toggleHighlightStates(false);
  }, [stateMachine]);

  useEffect(() => {
    if (!manualStateTransitionMessage) return;

    const { state, pathIndex } = manualStateTransitionMessage.message.content;

    const decoder = new TextDecoder();
    const bytes = new Uint8Array(state.filter(Boolean));
    const targetState = decoder.decode(bytes);

    console.debug(`State changed to '${targetState}'`);

    setPathIndex(pathIndex);
    setActiveState(targetState);
  }, [manualStateTransitionMessage]);

  useEffect(() => {
    highlightActiveState();
    highlightManuallyReachableStates();
    highlightAvailableStates();
    removeStateListeners();
    setupStateListeners();

    if (activeState && stateMachine) {
      notifications.show({
        title: "Manual transitions from active state",
        message: `[${(stateMachine?.manualTransitions[activeState] || []).join(", ")}]`,
      });
    }

    return () => {};
  }, [activeState, stateMachine]);

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
              notifications.show({
                title: "Diagram state",
                message: `Clicked on node for state '${state}'`,
                color: "blue",
              });

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
      transitionIndex: pathIndex + 1,
    };
    const message: Message = {
      board: board as any,
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
        onSuccess: () => {
          notifications.show({
            title: "Manual transition sent",
            message: `Sent message for manual state transition into '${state}'`,
            color: "green",
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
    // remove all currently highlighted states
    d3.select(svgRef.current)
      .selectAll(`[${MANUALLLY_REACHABLE_ATTR}`)
      .attr(MANUALLLY_REACHABLE_ATTR, null);
    if (stateMachine && activeState) {
      stateMachine.manualTransitions[activeState].forEach((state) => {
        const stateId = stateMachine.stateNodes[state];
        d3.select(svgRef.current)
          .select(`[${CELL_ID_ATTR}="${stateId}"]`)
          .attr(MANUALLLY_REACHABLE_ATTR, true)
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
    <Flex
      direction={"column"}
      justify={"center"}
      align={"center"}
      h={"calc(100vh - var(--app-shell-header-height))"}
      w={"100%"}
    >
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
      <Affix position={{ top: "5rem", left: "lg" }}>
        <StateMachineSelector onChange={setStateMachine} />
      </Affix>
      <Affix position={{ bottom: "lg", left: "lg" }}>
        {isSending && <Loader size={"sm"} />}
      </Affix>
      {stateMachine ? (
        <Box w={"100%"}>
          <section
            data-highlight-states={highlightStates}
            className={classes.container}
            ref={containerRef}
          />
        </Box>
      ) : (
        <Flex p={"lg"} justify={"center"} align={"center"}>
          <Alert variant="light" color="blue" title="No state machine selected">
            You need to select a state machine to start
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

interface StateMachineSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onChange: (stateMachine: StateMachineDefintion | null) => void;
}

function StateMachineSelector(props: StateMachineSelectorProps) {
  const [selected, setSelected] = useState<string | null>();
  const { data: activeScenario, ...active } = useActiveScenario();
  const { data: allStateMachines = [], ...all } = useAllStateMachines(
    activeScenario?.id as string,
  );
  const { data: stateMachine, ...machine } = useStateMachine(
    activeScenario?.id as string,
    selected as string,
  );

  useEffect(() => {
    if (!selected) props.onChange(null);
  }, [selected]);

  useEffect(() => {
    if (!activeScenario) return;
    setSelected(null);
  }, [activeScenario]);

  useEffect(() => {
    if (!stateMachine) return;
    props.onChange(stateMachine);
  }, [stateMachine]);

  useEffect(() => {
    if (!machine.error) return;
    setSelected(null);
  }, [machine.error]);

  const handleStateMachineChange = (value: string | null) => {
    setSelected(value);
  };

  const loading = active.isPending || all.isPending || machine.isLoading;

  return (
    <Select
      placeholder={"Select a state machine"}
      data={allStateMachines.map(({ id, name }) => ({
        label: name,
        value: id,
      }))}
      disabled={loading}
      value={selected}
      onChange={handleStateMachineChange}
      clearable
      allowDeselect
      rightSection={loading ? <Loader size="xs" /> : <React.Fragment />}
      rightSectionWidth={40}
    />
  );
}

export default StateMachine;
