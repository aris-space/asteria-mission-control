import {
  DatapointValue,
  ExtendedDatapointInformation,
  usePssInformation,
} from "@asteria/mission-control-client";
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActionIcon, Affix, Box, Flex, Loader, Tooltip } from "@mantine/core";
import { useMap, useToggle, useViewportSize } from "@mantine/hooks";
import * as d3 from "d3";
import { IconEye, IconEyeOff, IconZoomReset } from "@tabler/icons-react";
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
  [
    "fss_inj_p",
    {
      component: "sensor",
      kind: "analog",
      value: {
        value: 12.4,
      },
    },
  ],
  [
    "oss_tnk_t",
    {
      component: "sensor",
      kind: "analog",
      value: {
        value: -14.9,
      },
    },
  ],
];

type Transform = { k: number; x: number; y: number };

function PSS() {
  const { width, height } = useViewportSize();
  const { data: pssInformation } = usePssInformation();
  const containerRef = useRef<HTMLDivElement>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // By default the datapoint markers should not be visible.
  const [datapointVisibility, toggleDatapointVisibility] = useToggle([
    "hidden",
    "inherit",
  ]);
  const datapointNodes = useMap<string, SVGElement>();
  const datapointValues = useMap<string, DatapointValue>(TEST_VALUE);
  const [svgReady, setSvgReady] = useState<boolean>();
  const transform = useRef<Transform>({ k: 1, x: 0, y: 0 });

  useEffect(() => {
    setupSvg();
    setupZoom();
  }, [pssInformation, containerRef, width, height]);

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
    svg.setAttribute("height", "calc(100vh - var(--app-shell-header-height))");
    setSvgReady(true);
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

        // We do this kinda sketchy style overriding here to prevent having a state update and thus a re-render
        // per zoom event. This is much more performant as zoom events happen at a very high frequency!
        Array.from(datapointValues.keys()).forEach((name) => {
          const info = pssInformation?.datapointInfo[name];
          if (!info) return;
          const styles = computeDatapointStyle(event.transform, info);
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
        // Set current transform into a ref such that we keep it across re-renders but
        // without triggering a re-render on change.
        transform.current = event.transform;
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
    zoomRef.current = zoom;
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

  function resetZoomAndPan() {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).call(
        zoomRef.current.transform,
        d3.zoomIdentity,
      );
    }
    setIsDirty(false);
  }

  const datapointElements = useMemo(() => {
    return Array.from(datapointValues.entries()).map(([name, value]) => {
      const info = pssInformation?.datapointInfo[name];
      if (!info) return <React.Fragment key={name} />;

      const styles = computeDatapointStyle(transform.current, info);
      if (!styles) return <React.Fragment key={name} />;

      const datapoint = <DatapointKind value={value} kind={info.kind} />;

      return (
        <div data-datapoint-container-for={name} key={name} style={styles[0]}>
          <div style={styles[1]}>
            {datapoint}
            <span>{info.label}</span>
          </div>
        </div>
      );
    });
  }, [
    height,
    width,
    datapointValues,
    pssInformation,
    datapointNodes,
    svgReady,
  ]);

  return (
    <>
      {datapointElements}
      <Flex
        direction={"column"}
        justify={"center"}
        align={"center"}
        h={"calc(100vh - var(--app-shell-header-height))"}
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
        {pssInformation ? (
          <Box
            className={classes.container}
            style={{ justifySelf: "center", alignSelf: "center" }}
            w={"100%"}
          >
            <section
              style={{ overflow: "hidden" }}
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
