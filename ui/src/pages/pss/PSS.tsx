import { usePssInformation } from "@asteria/mission-control-client";
import { useEffect, useRef } from "react";
import { ActionIcon, Affix, Box, Flex, Loader, Tooltip } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import * as d3 from "d3";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import classes from "./PSS.module.css";

// Attribute which is used to store which state a diagram node represents
const CELL_ID_ATTR: string = "data-cell-id";

function PSS() {
  const { data: pssInformation } = usePssInformation();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // By default the datapoint markers should not be visible.
  const [datapointVisibility, toggleDatapointVisibility] = useToggle([
    "hidden",
    "inherit",
  ]);

  useEffect(() => {
    setupSvg();
  }, [pssInformation, containerRef]);

  useEffect(() => {
    updateDatapointVisibility();
  }, [pssInformation, containerRef, datapointVisibility]);

  function setupSvg() {
    if (!pssInformation || !containerRef.current) return;
    containerRef.current.innerHTML = pssInformation.diagram;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) {
      console.warn("Received non-svg PSS diagram from API");
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
    svg.setAttribute("height", "80vh");
  }

  function updateDatapointVisibility() {
    if (!containerRef.current || !pssInformation) return;

    if (pssInformation) {
      Object.entries(pssInformation.datapointNodes).forEach(([, id]) => {
        d3.select(`[${CELL_ID_ATTR}="${id}"]`).style(
          "visibility",
          datapointVisibility,
        );
      });
    }
  }

  return (
    <Flex
      direction={"column"}
      justify={"center"}
      align={"center"}
      h={"100%"}
      w={"100%"}
    >
      {pssInformation && (
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
          </Flex>
        </Affix>
      )}
      {pssInformation ? (
        <Box
          className={classes.container}
          style={{ justifySelf: "center", alignSelf: "center" }}
          w={"100%"}
        >
          <section
            data-highlight-states={datapointVisibility}
            ref={containerRef}
          />
        </Box>
      ) : (
        <Flex p={"lg"} justify={"center"} align={"center"}>
          <Loader />
        </Flex>
      )}
    </Flex>
  );
}

export default PSS;
