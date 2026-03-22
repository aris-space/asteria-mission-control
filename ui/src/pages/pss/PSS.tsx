import {
  DatapointValue,
  usePssInformation,
} from "@asteria/mission-control-client";
import React, { CSSProperties, useEffect, useRef } from "react";
import { ActionIcon, Affix, Box, Flex, Loader, Tooltip } from "@mantine/core";
import { useMap, useToggle } from "@mantine/hooks";
import * as d3 from "d3";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import classes from "./PSS.module.css";
import DatapointKind from "./kind";

// Attribute which is used to store which state a diagram node represents
const CELL_ID_ATTR: string = "data-cell-id";

const TEST_VALUE: Array<[string, DatapointValue]> = [
  [
    "oss_dpr",
    {
      component: "actuator",
      kind: "dpr",
      value: {
        enabled: true,
        setpoint: 25.1,
      },
    },
  ],
  [
    "oss_vnt_vlv",
    {
      component: "sensor",
      kind: "digital",
      value: {
        enabled: false,
      },
    },
  ],
];

function PSS() {
  const { data: pssInformation } = usePssInformation();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // By default the datapoint markers should not be visible.
  const [datapointVisibility, toggleDatapointVisibility] = useToggle([
    "hidden",
    "inherit",
  ]);
  const datapointNodes = useMap<string, SVGElement>();
  const datapointValues = useMap<string, DatapointValue>(TEST_VALUE);

  useEffect(() => {
    setupSvg();
  }, [pssInformation, containerRef]);

  useEffect(() => {
    updateDatapointVisibility();
    setupNodes();
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

  function setupNodes() {
    if (!containerRef.current || !pssInformation) return;
    datapointNodes.clear();

    Object.entries(pssInformation.datapointInfo).forEach(([name, { cell }]) => {
      d3.select(`[${CELL_ID_ATTR}="${cell}"]`).each((_, index, nodes) => {
        const node = nodes[index] as SVGElement;
        datapointNodes.set(name, node);
      });
    });
  }

  function updateDatapointVisibility() {
    if (!containerRef.current || !pssInformation) return;

    if (pssInformation) {
      Object.entries(pssInformation.datapointInfo).forEach(([, { cell }]) => {
        d3.select(`[${CELL_ID_ATTR}="${cell}"]`).style(
          "visibility",
          datapointVisibility,
        );
      });
    }
  }

  return (
    <>
      {Array.from(datapointValues.entries()).map(([name, value]) => {
        const info = pssInformation?.datapointInfo[name];
        const node = datapointNodes.get(name);
        if (!info || !node) return <React.Fragment key={name} />;

        const bounds = node.getBoundingClientRect();

        const datapoint = <DatapointKind value={value} kind={info.kind} />;

        const datapointStyle: CSSProperties = {
          // Position the container relative to the viewport (ignore scroll).
          position: "fixed",
          top: bounds.top + bounds.height / 2,
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          left: bounds.left + bounds.width / 2,
        };
        if (info.align == "left") {
          // It's left aligned.
          datapointStyle.transform = "translateY(-50%)";
        } else {
          // It's right aligned.
          datapointStyle.transform = "translateY(-50%) translateX(-100%)";
          // We need to reverse the elements since label should now come first.
          datapointStyle.flexDirection = "row-reverse";
        }

        return (
          <div key={name} style={datapointStyle}>
            {datapoint}
            <span>{info.label}</span>
          </div>
        );
      })}
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
    </>
  );
}

export default PSS;
