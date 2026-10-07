import { RefObject, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export type Transform = { k: number; x: number; y: number };

export interface DiagramSvgOptions {
  disableZoom: boolean;
  onZoom: (transform: Transform) => void;
}

const defaultOptions: DiagramSvgOptions = {
  disableZoom: false,
  onZoom: () => {},
};

interface DiagramSvg {
  ref: RefObject<SVGSVGElement | null>;
  isZoomDirty: boolean;
  resetZoom: () => void;
  zoomTransform: Transform;
  ready: boolean;
}

function useDiagramSvg(
  diagram: string,
  container: HTMLDivElement | null,
  options: Partial<DiagramSvgOptions> = {},
): DiagramSvg {
  const ref = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [isZoomDirty, setZoomDirty] = useState<boolean>(false);
  const { onZoom, disableZoom } = { ...defaultOptions, ...options };
  const zoomTransform = useRef<Transform>({ k: 1, x: 0, y: 0 });
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (diagram && container) {
      createSvg();
      if (!disableZoom) createZoom();
    } else if (container) {
      // Reset the SVG.
      container.innerHTML = "";
      ref.current = null;
      zoomRef.current = null;
      setZoomDirty(false);
      setReady(false);
    } else {
      setReady(false);
    }
  }, [diagram, container]);

  /**
   * Create a new SVG element for the diagram. The SVG element
   * is placed as the only child of `containerRef`.
   */
  const createSvg = () => {
    if (!container) return;

    container.innerHTML = diagram;
    const svg = container.querySelector("svg");
    if (!svg) {
      console.error("Provided invalid SVG diagram to useDiagramSvg hook!");
      return;
    }
    ref.current = svg;

    // Ensure the whole svg content is wrapped in a `g` element to which we can
    // apply our transformation.
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

    setReady(true);
  };

  /**
   * Create a new zoom instance.
   */
  const createZoom = () => {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 10])
      .on("zoom", (event) => {
        setZoomDirty(true);

        d3.select(ref.current as SVGSVGElement)
          .select("g")
          .attr("transform", event.transform.toString());

        // Call user zoom callback function.
        onZoom(event.transform);

        zoomTransform.current = event.transform;
      });

    d3.select(ref.current as SVGSVGElement)
      .call(zoom)
      .on("dblclick.zoom", null);

    zoomRef.current = zoom;
  };

  /**
   * Reset the current zoom and pan state to the initial value.
   */
  const resetZoom = () => {
    if (ref.current && zoomRef.current) {
      d3.select(ref.current).call(zoomRef.current.transform, d3.zoomIdentity);
    }
    setZoomDirty(false);
  };

  return {
    ref,
    ready,
    isZoomDirty,
    resetZoom,
    zoomTransform: zoomTransform.current,
  };
}

export default useDiagramSvg;
