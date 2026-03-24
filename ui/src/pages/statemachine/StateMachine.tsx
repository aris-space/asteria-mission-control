import {
  StateMachine as StateMachineDefintion,
  useActiveScenario,
  useAllStateMachines,
  useStateMachine,
} from "@asteria/mission-control-client";
import React, { useEffect, useRef, useState } from "react";
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
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [highlightStates, setHighlightStates] = useState<boolean>(false);

  const [activeState, setActiveState] = useState<string | null>();

  useEffect(() => {
    if (!stateMachine) resetSvg();
    setupSvg();
    setupZoom();
  }, [stateMachine, containerRef]);

  useEffect(() => {
    setActiveState(stateMachine?.initialState ?? null);
    setHighlightStates(false);
  }, [stateMachine]);

  useEffect(() => {
    highlightActiveState();
    highlightManuallyReachableStates();
    highlightAvailableStates();
    removeStateListeners();
    setupStateListeners();

    if (activeState && stateMachine) {
      notifications.show({
        title: "Transitions from active state",
        message: `[${(stateMachine?.manualTransitions[activeState] || []).join(", ")}]`,
      });
    }

    return () => {};
  }, [activeState, stateMachine]);

  const resetSvg = () => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    setIsDirty(false);
  };

  function setupSvg() {
    if (!stateMachine || !containerRef.current) return;
    containerRef.current.innerHTML = stateMachine.diagram;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) {
      console.warn("Received non-svg state machine from API");
      return;
    }
    svgRef.current = svg;

    // ensure the whole svg content is wrapped in a `g` element to which we can
    // apply our transformation
    if (!svg.querySelector("g")) {
      const wrapper = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      wrapper.innerHTML = svg.innerHTML;
      svg.innerHTML = "";
      svg.appendChild(wrapper);
    }

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "calc(100vh - var(--app-shell-header-height))");
  }

  function setupZoom() {
    if (!svgRef.current) return;
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 10])
      .on("zoom", (event) => {
        setIsDirty(true);
        d3.select(svgRef.current)
          .select("g")
          .attr("transform", event.transform.toString());
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
    zoomRef.current = zoom;
  }

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

    // add click listener to rects representing a state of the state machine
    // and set correct cursor
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
                message: `Clicked on node for state "${state}"`,
                color: "blue",
              });

              // TODO: Here we would need to send the manual transition message
              //       and only once the message with the new active state
              //       is received, we update the active state
              setActiveState(state);
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

  function resetZoomAndPan() {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).call(
        zoomRef.current.transform,
        d3.zoomIdentity,
      );
    }
    setIsDirty(false);
  }

  function toggleStateHighlight() {
    setHighlightStates((highlight) => !highlight);
  }

  function highlightActiveState() {
    if (!svgRef.current) return;
    // remove all currently highlighted states
    d3.select(svgRef.current)
      .selectAll(`[${ACTIVE_ATTR}`)
      .attr(ACTIVE_ATTR, null);
    if (activeState && stateMachine) {
      const activeStateId = stateMachine.stateNodes[activeState];
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
          .attr(MANUALLLY_REACHABLE_ATTR, true);
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
    <Flex direction={"column"} justify={"center"} align={"center"} w={"100%"} h={"100%"}>
      {stateMachine && (
        <Affix position={{ top: "5rem", right: "lg" }}>
          <Flex gap={"xs"}>
            <Tooltip label={"Toggle node highlight"}>
              <ActionIcon onClick={toggleStateHighlight}>
                {highlightStates ? <IconEyeOff /> : <IconEye />}
              </ActionIcon>
            </Tooltip>
            {isDirty && (
              <Tooltip label={"Reset zoom and pan"}>
                <ActionIcon onClick={resetZoomAndPan}>
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
      {stateMachine ? (
        <Box w={"100%"}>
          <section
            data-highlight-states={highlightStates}
            className={classes.svgContainer}
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

interface StateMachineSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onChange: (stateMachine: StateMachineDefintion | null) => void;
}

function StateMachineSelector(props: StateMachineSelectorProps) {
  const [selected, setSelected] = useState<string | null>();
  const { data: activeScenario, ...active } = useActiveScenario();
  const { data: allStateMachines = [], ...all } = useAllStateMachines(
    activeScenario?.id ?? "",
  );
  const { data: stateMachine, ...machine } = useStateMachine(selected ?? "");

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
