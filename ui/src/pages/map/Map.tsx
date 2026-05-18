import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import {
  Alert,
  Box,
  Card,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "leaflet/dist/leaflet.css";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { LatLngTuple } from "leaflet";

const MAX_HISTORY = 1000;

const MIN_SPAN_M = 20;
const METRES_PER_LAT_DEG = 111_320;

const SVG_W = 500;
const SVG_H = 260;
const M = { top: 12, right: 12, bottom: 46, left: 58 };
const IW = SVG_W - M.left - M.right;
const IH = SVG_H - M.top - M.bottom;

const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_STORAGE_KEY = ""; // Downloaded tiles in case of no internet, empty for now

interface TrackPoint {
  lat: number;
  lon: number;
  alt: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function latToM(lat: number, latRef: number): number {
  return (lat - latRef) * METRES_PER_LAT_DEG;
}

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

// Generic Plot

interface PlotProps {
  title: string;
  xLabel: string;
  yLabel: string;
  xs: number[];
  ys: number[];
  extraContent?: (
    scaleX: (v: number) => number,
    scaleY: (v: number) => number,
  ) => ReactNode;
  minSpan?: number;
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
  const sy = linScale(yd0, yd1, IH, 0);

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

          <rect
            x={M.left}
            y={M.top}
            width={IW}
            height={IH}
            fill={gray[1]}
            rx={3}
          />

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

// Leaflet Map

function getStoredTileUrl(): string {
  return (
    localStorage.getItem(TILE_STORAGE_KEY) ||
    import.meta.env.VITE_TILE_SERVER_URL ||
    DEFAULT_TILE_URL
  );
}

function MapController({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (positions.length === 0) return;
    if (!initialized.current) {
      map.setView(positions[0], 15);
      initialized.current = true;
      return;
    }
    const trackBounds = latLngBounds(positions);
    if (!map.getBounds().contains(trackBounds)) {
      map.fitBounds(trackBounds, { padding: [20, 20], maxZoom: map.getZoom() });
    }
  }, [map, positions]);

  return null;
}

interface LeafletTopViewProps {
  history: TrackPoint[];
  style?: CSSProperties;
}

function LeafletTopView({ history, style }: LeafletTopViewProps) {
  const [tileUrl, setTileUrl] = useState(getStoredTileUrl);
  const [inputValue, setInputValue] = useState(tileUrl);

  const positions: LatLngTuple[] = history.map((p) => [p.lat, p.lon]);
  const currentPos: LatLngTuple | null =
    positions.length > 0 ? positions[positions.length - 1] : null;

  function applyTileUrl() {
    const url = inputValue.trim() || DEFAULT_TILE_URL;
    setTileUrl(url);
    localStorage.setItem(TILE_STORAGE_KEY, url);
  }

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
        Top View – Map
      </Text>

      <div style={{ flex: 1, minHeight: 0 }}>
        {history.length === 0 ? (
          <Alert
            title="No position data received"
            color="yellow"
            variant="light"
            icon={<IconAlertTriangle />}
          />
        ) : (
          <MapContainer
            center={currentPos ?? [0, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              key={tileUrl}
              url={tileUrl}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController positions={positions} />
            {positions.length > 1 && (
              <Polyline positions={positions} color="#339af0" weight={2} />
            )}
            {currentPos && (
              <CircleMarker
                center={currentPos}
                radius={6}
                pathOptions={{
                  color: "#fa5252",
                  fillColor: "#fa5252",
                  fillOpacity: 1,
                }}
              />
            )}
          </MapContainer>
        )}
      </div>

      <TextInput
        mt="xs"
        size="xs"
        label="Tile server URL"
        placeholder={DEFAULT_TILE_URL}
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        onBlur={applyTileUrl}
        onKeyDown={(e) => e.key === "Enter" && applyTileUrl()}
      />
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

  const refLat = history[0]?.lat ?? 0;
  const refLon = history[0]?.lon ?? 0;

  const nsM = history.map((p) => latToM(p.lat, refLat));
  const ewM = history.map((p) => lonToM(p.lon, refLon, refLat));
  const alts = history.map((p) => p.alt);

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

      {/* Row 2 – Leaflet map spanning both columns */}
      <LeafletTopView history={history} style={{ gridColumn: "span 2" }} />
    </Box>
  );
}

export default MapPage;
