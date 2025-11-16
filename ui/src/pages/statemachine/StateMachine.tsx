import { useGetStateMachine } from "@asteria/mission-control-client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Button, Flex } from "@mantine/core";
import classes from "./StateMachine.module.css";

interface StateMachineProps {}

function StateMachine(props: StateMachineProps) {
  const { data: stateMachine = "" } = useGetStateMachine();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement>(null);

  useEffect(() => {
    if (!stateMachine || !containerRef.current) return;

    containerRef.current.innerHTML = stateMachine;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) {
      console.warn("Received non-svg state machine from API");
      return;
    }
    svgRef.current = svg;
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) =>
        d3
          .select(svg)
          .select("g")
          .attr("transform", event.transform.toString()),
      );

    let g = svg.querySelector("g");
    if (!g) {
      const wrapper = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      wrapper.innerHTML = svg.innerHTML;
      svg.innerHTML = "";
      svg.appendChild(wrapper);
      g = wrapper;
    }
    d3.select(svg).call(zoom);
  }, [stateMachine, containerRef]);

  const resetZoomAndPan = () => {
    if (svgRef.current) {
      d3
        .select(svgRef.current)
        .select("g")
        .attr("transform", "");
    }
  }

  return (
    <Flex direction={"column"} justify={"center"} align={"center"}>
      <Button onClick={resetZoomAndPan}>Reset zoom and pan</Button>
      <section className={classes.svgContainer} ref={containerRef} />
    </Flex>
  );
}

export default StateMachine;
