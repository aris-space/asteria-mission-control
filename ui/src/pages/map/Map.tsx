import {
  Circle,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ActionIcon,
  Affix,
  Card,
  Flex,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import { useEffect, useReducer, useRef, useState } from "react";
import { LatLngTuple } from "leaflet";
import { PositionData } from "packages/api-client/src";
import { IconMapPinUp, IconMapPinX } from "@tabler/icons-react";

// Maximum amount of stored data points to keep.
// When a new data point beyond this length is received,
// is replaces the oldest data point.
const MAX_HISTORY_LENGTH = 10000;

// Delay in milliseconds after which position updates
// are drawn on the map.
const UPDATE_DELAY = 50;

// Amount of segments into which the history should be split.
// Every segment has a distinct opacity to create the trace
// of the rocket on the map.
const SEGMENTS = 25;

type Position = Pick<
  PositionData,
  "locationLatitude" | "locationLongitude" | "locationHamsl"
>;

function Map() {
  const theme = useMantineTheme();
  const positionMessage = useMavlinkMessage("SensorCarrier", "PositionData");

  const lastRender = useRef(0);
  const history = useRef<Position[]>([]);
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const [following, setFollowing] = useState<boolean>(true);

  useEffect(() => {
    const content = positionMessage?.message.content;
    if (!content) return;

    const { locationHamsl, locationLatitude, locationLongitude } = content;
    // Zero-coordinates are nonsense values.
    if (!locationLatitude && !locationLongitude && !locationHamsl) return;

    const last = history.current.at(-1);
    if (
      last &&
      last.locationHamsl == locationHamsl &&
      last.locationLatitude == locationLatitude &&
      last.locationLongitude == locationLongitude
    ) {
      // The last entry in the history is already the exact same position.
      // We thus don't need to update the history.
      return;
    }

    history.current.push({
      locationHamsl,
      locationLatitude,
      locationLongitude,
    });

    if (history.current.length > MAX_HISTORY_LENGTH) {
      history.current.splice(0, history.current.length - MAX_HISTORY_LENGTH);
    }

    const now = new Date().getTime();
    if (now - lastRender.current < UPDATE_DELAY) return;

    lastRender.current = now;

    // Trigger a re-render.
    forceRender();
  }, [positionMessage]);

  const positions: LatLngTuple[] = history.current.map((entry) => [
    entry.locationLatitude,
    entry.locationLongitude,
  ]);

  const polylines = Array.from({ length: SEGMENTS }, (_, i) => {
    const start = Math.floor((i / SEGMENTS) * positions.length);
    const end = Math.floor(((i + 1) / SEGMENTS) * positions.length);

    return {
      positions: positions.slice(start, end + 1),
      opacity: 0.05 + (i / (SEGMENTS - 1)) * 0.95,
    };
  });

  const latest = positions.at(-1);

  return (
    <Card
      h="calc(100vh - var(--app-shell-header-height))"
      w="100%"
      p={0}
      radius={0}
    >
      <Affix zIndex={1000} position={{ top: "5rem", right: "lg" }}>
        <Flex gap={"xs"}>
          <Tooltip label={"Toggle rocket following"}>
            <ActionIcon onClick={() => setFollowing(!following)}>
              {following ? <IconMapPinX /> : <IconMapPinUp />}
            </ActionIcon>
          </Tooltip>
        </Flex>
      </Affix>
      <MapContainer
        zoomControl={false}
        attributionControl={false}
        center={[47.399555, 8.630641]}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {polylines.map(({ positions, opacity }, idx) => (
          <Polyline
            key={idx}
            opacity={opacity}
            color={theme.colors.red[9]}
            positions={positions}
          />
        ))}
        {latest && (
          <Circle
            center={latest}
            radius={5}
            fill
            fillOpacity={1}
            fillColor={theme.colors.red[9]}
            color={theme.colors.red[9]}
          />
        )}
        <Follower
          position={latest}
          active={following}
          onActiveChange={setFollowing}
        />
      </MapContainer>
    </Card>
  );
}

interface FollowerProps {
  position?: LatLngTuple;
  active: boolean;
  onActiveChange: (active: boolean) => void;
}

function Follower({ position, active, onActiveChange }: FollowerProps) {
  const map = useMap();

  useMapEvents({
    // When the user starts dragging, we disable the tracker
    // since the user now wants to control the map itself.
    drag: () => onActiveChange(false),
  });

  useEffect(() => {
    if (active && position) {
      map.panTo(position, { animate: false });
      map.setView(position);
    }
  }, [active, position]);
  return <></>;
}

export default Map;
