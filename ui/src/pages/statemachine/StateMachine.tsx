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
import { IconZoomReset } from "@tabler/icons-react";

// Attribute which is used to store which kind of a state a state is
const STATE_KIND_ATTR: string = "data-state-kind";

function StateMachine() {
  const [stateMachine, setStateMachine] =
    useState<StateMachineDefintion | null>();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    if (!stateMachine) resetSvg();
    setupSvg();
    setupZoom();
    setupStateListeners();
  }, [stateMachine, containerRef]);

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
    svg.setAttribute("height", "100%");
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

  function setupStateListeners() {
    if (!svgRef.current) return;

    // add click listener to rects representing a state of the state machine
    // and set correct cursor
    d3.select(svgRef.current)
      .selectAll(`[${STATE_KIND_ATTR}]`)
      .selectAll("rect")
      .style("cursor", "pointer")
      // use `each` instead of `on` to also get access to the parent node with the attribute
      .each((_, index, nodes) => {
        const node = nodes[index] as SVGRectElement;
        node.onclick = (event) => {
          console.log("clicked on state", node, event);
        };
      });

    // disable pointer events for all non-rect nodes in the tree
    d3.select(svgRef.current)
      .selectAll(`[${STATE_KIND_ATTR}]`)
      .selectAll(":not(rect)")
      .attr("pointer-events", "none")
      .style("pointer-events", "none");
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

  return (
    <Flex direction={"column"} justify={"center"} align={"center"}>
      {isDirty && (
        <Affix position={{ top: "5rem", right: "lg" }}>
          <Tooltip label={"Reset zoom and pan"}>
            <ActionIcon onClick={resetZoomAndPan}>
              <IconZoomReset />
            </ActionIcon>
          </Tooltip>
        </Affix>
      )}
      <Affix position={{ top: "5rem", left: "lg" }}>
        <StateMachineSelector onChange={setStateMachine} />
      </Affix>
      {stateMachine ? (
        <Box w={"100%"}>
          <section className={classes.svgContainer} ref={containerRef} />
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
  onChange: (stateMachine: StateMachineDefintion | null) => void;
}

function StateMachineSelector(props: StateMachineSelectorProps) {
  const [selected, setSelected] = useState<string | null>();
  const { data: activeScenario, ...active } = useActiveScenario();
  const { data: allStateMachines = [], ...all } = useAllStateMachines(
    activeScenario?.id ?? "",
  );
  const { data: stateMachine, ...machine } = useStateMachine(
    activeScenario?.id ?? "",
    selected ?? "",
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
