import { useMavlinkMessage } from "@asteria/hooks/EventContext";
import { Alert, Box, Card, Text, useMantineTheme } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { CSSProperties, ReactNode, useEffect, useId, useState } from "react";

const MAX_HISTORY = 1000;

// Minimum visible span on any axis (metres).  Prevents the view from
// zooming in to sub-centimetre detail when the vehicle is nearly stationary.
const MIN_SPAN_M = 20;

// Approximate metres per degree of latitude (constant) and per degree of
// longitude (latitude-dependent).
const METRES_PER_LAT_DEG = 111_320;

// SVG plot canvas dimensions
const SVG_W = 500;
const SVG_H = 260;
const M = { top: 12, right: 12, bottom: 46, left: 58 };
const IW = SVG_W - M.left - M.right;
const IH = SVG_H - M.top - M.bottom;

interface TrackPoint {
  lat: number;
  lon: number;
  alt: number;
}

// Bounding polygon geo-point – will be made configurable in a future update
interface GeoPoint {
  lat: number;
  lon: number;
}

// Stub: populate this to render a bounding polygon on the top view
const BOUNDING_POLYGON: GeoPoint[] = [];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** North-south offset from a reference latitude, in metres. */
function latToM(lat: number, latRef: number): number {
  return (lat - latRef) * METRES_PER_LAT_DEG;
}

/** East-west offset from a reference longitude, in metres (corrected for latitude). */
function lonToM(lon: number, lonRef: number, latRef: number): number {
  return (
    (lon - lonRef) * METRES_PER_LAT_DEG * Math.cos((latRef * Math.PI) / 180)
  );
}

function linScale(d0: number, d1: number, r0: number, r1: number) {
  if (d0 === d1) return (_: number) => (r0 + r1) / 2;
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

function computeDomain(
  vals: number[],
  padFrac = 0.12,
  minSpan = 0,
): [number, number] {
  if (!vals.length) {
    const half = Math.max(minSpan, 1) / 2;
    return [-half, half];
  }
  let min = vals[0];
  let max = vals[0];
  for (const v of vals) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const rawSpan = max - min;
  const paddedSpan = Math.max(rawSpan * (1 + 2 * padFrac), minSpan);
  const center = (min + max) / 2;
  return [center - paddedSpan / 2, center + paddedSpan / 2];
}

function ticks(min: number, max: number, n = 5): number[] {
  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, i) => min + step * i);
}

function fmtNum(n: number): string {
  const a = Math.abs(n);
  if (a >= 1000) return n.toFixed(0);
  if (a >= 100) return n.toFixed(1);
  if (a >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

// ─── Generic Plot ────────────────────────────────────────────────────────────

interface PlotProps {
  title: string;
  xLabel: string;
  yLabel: string;
  xs: number[];
  ys: number[];
  /** Rendered inside the clipped inner plot area, receives computed scales */
  extraContent?: (
    scaleX: (v: number) => number,
    scaleY: (v: number) => number,
  ) => ReactNode;
  /** Minimum span enforced on both axes (same units as xs/ys) */
  minSpan?: number;
  /** Forwarded to the outer Card (e.g. for CSS grid span) */
  style?: CSSProperties;
}

function Plot({
  title,
  xLabel,
  yLabel,
  xs,
  ys,
  extraContent,
  minSpan = 0,
  style,
}: PlotProps) {
  const theme = useMantineTheme();
  const uid = useId();
  const clipId = `clip-${uid}`;
  const hasData = xs.length > 0;

  const [xd0, xd1] = computeDomain(xs, 0.12, minSpan);
  const [yd0, yd1] = computeDomain(ys, 0.12, minSpan);
  const sx = linScale(xd0, xd1, 0, IW);
  const sy = linScale(yd0, yd1, IH, 0); // flip: larger values go up

  const xTickVals = ticks(xd0, xd1);
  const yTickVals = ticks(yd0, yd1);

  const trail =
    xs.length > 1
      ? xs
          .map(
            (x, i) =>
              `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(ys[i]).toFixed(1)}`,
          )
          .join(" ")
      : "";

  const curX = xs[xs.length - 1];
  const curY = ys[ys.length - 1];

  const { gray, blue, red } = theme.colors;

  return (
    <Card
      withBorder
      padding="xs"
      radius="md"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...style,
      }}
    >
      <Text size="sm" fw={600} mb="xs">
        {title}
      </Text>
      {!hasData ? (
        <Alert
          title="No position data received"
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle />}
        />
      ) : (
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: "100%", flex: 1 }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={IW} height={IH} />
            </clipPath>
          </defs>

          {/* Plot background */}
          <rect
            x={M.left}
            y={M.top}
            width={IW}
            height={IH}
            fill={gray[1]}
            rx={3}
          />

          {/* Grid lines */}
          <g opacity={0.5}>
            {yTickVals.map((t, i) => (
              <line
                key={i}
                x1={M.left}
                x2={M.left + IW}
                y1={M.top + sy(t)}
                y2={M.top + sy(t)}
                stroke={gray[4]}
                strokeWidth={1}
              />
            ))}
            {xTickVals.map((t, i) => (
              <line
                key={i}
                x1={M.left + sx(t)}
                x2={M.left + sx(t)}
                y1={M.top}
                y2={M.top + IH}
                stroke={gray[4]}
                strokeWidth={1}
              />
            ))}
          </g>

          {/* Inner content: extra layer + trail + current position dot */}
          <g
            transform={`translate(${M.left},${M.top})`}
            clipPath={`url(#${clipId})`}
          >
            {extraContent?.(sx, sy)}
            {trail && (
              <path
                d={trail}
                fill="none"
                stroke={blue[6]}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            )}
            {curX !== undefined && (
              <circle cx={sx(curX)} cy={sy(curY)} r={5} fill={red[6]} />
            )}
          </g>

          {/* X axis */}
          <g transform={`translate(${M.left},${M.top + IH})`}>
            <line x1={0} x2={IW} stroke={gray[7]} />
            {xTickVals.map((t, i) => (
              <g key={i} transform={`translate(${sx(t)},0)`}>
                <line y2={5} stroke={gray[7]} />
                <text y={17} textAnchor="middle" fontSize={9} fill={gray[7]}>
                  {fmtNum(t)}
                </text>
              </g>
            ))}
            <text
              x={IW / 2}
              y={40}
              textAnchor="middle"
              fontSize={11}
              fill={gray[8]}
              fontWeight="bold"
            >
              {xLabel}
            </text>
          </g>

          {/* Y axis */}
          <g transform={`translate(${M.left},${M.top})`}>
            <line y2={IH} stroke={gray[7]} />
            {yTickVals.map((t, i) => (
              <g key={i} transform={`translate(0,${sy(t)})`}>
                <line x1={-5} stroke={gray[7]} />
                <text
                  x={-8}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill={gray[7]}
                >
                  {fmtNum(t)}
                </text>
              </g>
            ))}
            <text
              transform={`translate(${-44},${IH / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill={gray[8]}
              fontWeight="bold"
            >
              {yLabel}
            </text>
          </g>
        </svg>
      )}
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────

function MapPage() {
  const theme = useMantineTheme();

  const positionMsg = useMavlinkMessage("SensorCarrier", "PositionData") as {
    message: {
      content?: {
        locationLatitude: number;
        locationLongitude: number;
        locationHamsl: number;
      };
    };
  } | null;

  const [history, setHistory] = useState<TrackPoint[]>([]);

  useEffect(() => {
    const c = positionMsg?.message?.content;
    if (!c) return;
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.lat === c.locationLatitude &&
        last.lon === c.locationLongitude &&
        last.alt === c.locationHamsl
      )
        return prev;
      return [
        ...prev.slice(-(MAX_HISTORY - 1)),
        {
          lat: c.locationLatitude,
          lon: c.locationLongitude,
          alt: c.locationHamsl,
        },
      ];
    });
  }, [positionMsg]);

  // Use the first received fix as the local origin so all axes are in metres.
  const refLat = history[0]?.lat ?? 0;
  const refLon = history[0]?.lon ?? 0;

  const nsM = history.map((p) => latToM(p.lat, refLat)); // North-South metres
  const ewM = history.map((p) => lonToM(p.lon, refLon, refLat)); // East-West metres
  const alts = history.map((p) => p.alt);

  // Polygon extra-content callback for the top view (converted to metres)
  const topViewExtra = (
    scaleX: (v: number) => number,
    scaleY: (v: number) => number,
  ) => {
    if (!BOUNDING_POLYGON.length) return null;
    const points = BOUNDING_POLYGON.map(
      (p) =>
        `${scaleX(lonToM(p.lon, refLon, refLat)).toFixed(1)},${scaleY(latToM(p.lat, refLat)).toFixed(1)}`,
    ).join(" ");
    return (
      <polygon
        points={points}
        fill={theme.colors.orange[2]}
        fillOpacity={0.35}
        stroke={theme.colors.orange[6]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    );
  };

  return (
    <Box
      p="lg"
      style={{
        width: "100%",
        height: "calc(100vh - 4rem)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: theme.spacing.sm,
      }}
    >
      {/* Row 1 – Side Views */}
      <Plot
        title="Side View A – N-S / Altitude"
        xLabel="N-S (m)"
        yLabel="Altitude AMSL (m)"
        xs={nsM}
        ys={alts}
        minSpan={MIN_SPAN_M}
      />
      <Plot
        title="Side View B – E-W / Altitude"
        xLabel="E-W (m)"
        yLabel="Altitude AMSL (m)"
        xs={ewM}
        ys={alts}
        minSpan={MIN_SPAN_M}
      />

      {/* Row 2 – Top View spanning both columns */}
      <Plot
        title="Top View – E-W / N-S"
        xLabel="E-W (m)"
        yLabel="N-S (m)"
        xs={ewM}
        ys={nsM}
        extraContent={topViewExtra}
        style={{ gridColumn: "span 2" }}
        minSpan={MIN_SPAN_M}
      />
    </Box>
  );
}

export default MapPage;
