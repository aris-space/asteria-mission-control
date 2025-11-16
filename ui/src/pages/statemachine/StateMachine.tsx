import { useGetStateMachine } from "@asteria/mission-control-client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ActionIcon, Affix, Flex, Tooltip } from "@mantine/core";
import classes from "./StateMachine.module.css";
import { IconZoomReset } from "@tabler/icons-react";

// Attribute which is used to store which kind of a state a state is
const STATE_KIND_ATTR: string = "data-state-kind";

function StateMachine() {
  const { data: stateMachine = "" } = useGetStateMachine();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    setupSvg();
    setupZoom();
    setupStateListeners();
  }, [stateMachine, containerRef]);

  function setupSvg() {
    if (!stateMachine || !containerRef.current) return;
    containerRef.current.innerHTML = stateMachine;
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

    d3.select(svgRef.current)
      .call(zoom)
      .on("dblclick.zoom", null);
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
      <section className={classes.svgContainer} ref={containerRef} />
    </Flex>
  );
}

export default StateMachine;
