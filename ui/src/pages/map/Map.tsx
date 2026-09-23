import { Protocol } from "pmtiles";
import * as maplibregl from "maplibre-gl";
import { layers, namedFlavor } from "@protomaps/basemaps";
import MapContainer, { Layer, MapRef, Source } from "react-map-gl/maplibre";
import {
  ActionIcon,
  Affix,
  Alert,
  Card,
  Flex,
  Select,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  PositionData,
  TileServer,
  useTileServers,
} from "@asteria/mission-control-client";
import {
  IconAlertTriangle,
  IconMapPinUp,
  IconMapPinX,
} from "@tabler/icons-react";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";
import "maplibre-gl/dist/maplibre-gl.css";
import { Feature, FeatureCollection, LineString, Point } from "geojson";

// Maximum amount of stored data points to keep.
// When a new data point beyond this length is received,
// is replaces the oldest data point.
const MAX_HISTORY_LENGTH = 1000;

// Delay in milliseconds after which position updates
// are drawn on the map.
const UPDATE_DELAY = 50;

// Amount of segments into which the history should be split.
// Every segment has a distinct opacity to create the trace
// of the rocket on the map.
const SEGMENTS = 25;

// Name of the default tile server to use.
const DEFAULT_TILE_SERVER_NAME = "osm";

// Key to store the name of the active tile server in the local storage.
const TILE_SERVER_NAME_STORAGE_KEY = "TILE_SERVER";

type Position = Pick<
  PositionData,
  "locationLatitude" | "locationLongitude" | "locationHamsl"
>;

type NamedTileServer = TileServer & { name: string };

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

function Map() {
  const theme = useMantineTheme();
  const { remoteComputer } = useRemoteComputer();
  const { tileServer, tileServers, setTileServer } = useActiveTileServer();
  const positionMessage = useMavlinkMessage("SensorCarrier", "PositionData");

  const mapRef = useRef<MapRef>(null);

  const lastRender = useRef(0);
  const history = useRef<Position[]>([]);
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const [following, setFollowing] = useState<boolean>(true);

  useEffect(() => {
    history.current = [];
    lastRender.current = 0;
    forceRender();
  }, [remoteComputer?.name]);

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

  const positions = history.current.map((entry) => [
    entry.locationLongitude,
    entry.locationLatitude,
  ]);

  const latest = positions.at(-1);

  // Auto-follow logic.
  useEffect(() => {
    if (following && latest) {
      mapRef.current?.panTo([latest[0], latest[1]], { duration: 0 });
    }
  }, [following, latest]);

  // GeoJSON features for building the fading trace where the rocket travelled.
  const traceFeatures = useMemo<
    Feature<LineString, { opacity: number }>[]
  >(() => {
    if (positions.length < 2) return [];

    return Array.from({ length: SEGMENTS }, (_, i) => {
      const start = Math.floor((i / SEGMENTS) * positions.length);
      const end = Math.floor(((i + 1) / SEGMENTS) * positions.length);

      const segmentCoords = positions.slice(start, end + 1);
      if (segmentCoords.length < 2) return null as any;

      return {
        type: "Feature",
        properties: { opacity: 0.05 + (i / (SEGMENTS - 1)) * 0.95 },
        geometry: { type: "LineString", coordinates: segmentCoords },
      };
    }).filter(Boolean);
  }, [positions]);

  // Determine map style based on the selected tile server.
  const mapStyle = useMemo<maplibregl.StyleSpecification>(() => {
    if (!tileServer) return { version: 8, sources: {}, layers: [] } as any;

    if (tileServer.type == "vector") {
      return {
        version: 8,
        glyphs: `${tileServer.fonts}/{fontstack}/{range}.pbf`,
        sprite: `${tileServer.sprites}/v4/light`,
        sources: {
          "pmtiles-source": {
            type: "vector",
            url: `pmtiles://${tileServer.url}`,
          },
        },
        layers: layers("pmtiles-source", namedFlavor("light"), { lang: "en" }),
      };
    } else {
      return {
        version: 8,
        sources: {
          "raster-source": {
            type: "raster",
            tiles: [tileServer.url],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "raster-layer",
            type: "raster",
            source: "raster-source",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      };
    }
  }, [tileServer]);

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
      <Affix zIndex={1000} position={{ top: "5rem", left: "lg" }}>
        <Select
          value={tileServer?.name}
          onChange={(name) => {
            if (!name) return setTileServer(null);
            const ts = tileServers[name];
            if (ts) setTileServer({ ...ts, name });
            else setTileServer(null);
          }}
          data={Object.entries(tileServers).map(([name, ts]) => ({
            label: ts.description,
            value: name,
          }))}
        />
      </Affix>
      {history.current.length == 0 && (
        <Affix zIndex={1000} position={{ bottom: "lg", left: "lg" }}>
          <Alert
            w="100%"
            title="No position data received"
            color="yellow"
            variant="filled"
            icon={<IconAlertTriangle />}
          />
        </Affix>
      )}
      <MapContainer
        ref={mapRef}
        mapStyle={mapStyle}
        initialViewState={{
          longitude: 8.631848,
          latitude: 47.405831,
          zoom: 15,
        }}
        onDragStart={() => setFollowing(false)}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Source
          id="trace"
          type="geojson"
          data={
            {
              type: "FeatureCollection",
              features: traceFeatures,
            } as FeatureCollection<LineString, { opacity: number }>
          }
        >
          <Layer
            id="trace-layer"
            type="line"
            source="trace"
            paint={{
              "line-color": theme.colors.red[9],
              "line-width": 4,
              "line-opacity": ["get", "opacity"],
            }}
          />
        </Source>
        {latest && (
          <Source
            id="latest-point"
            type="geojson"
            data={
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: latest },
              } as Feature<Point>
            }
          >
            <Layer
              id="latest-layer"
              type="circle"
              source="latest-point"
              paint={{
                "circle-radius": 5,
                "circle-color": theme.colors.red[9],
              }}
            />
          </Source>
        )}
      </MapContainer>
    </Card>
  );
}

function useActiveTileServer() {
  const { data: tileServers = {} } = useTileServers();
  const [tileServer, setTileServer] = useState<NamedTileServer | null>(null);

  useEffect(() => {
    if (tileServer && tileServers[tileServer.name]) return;
    if (Object.keys(tileServers).length === 0) return setTileServer(null);

    const storedTileServer =
      localStorage.getItem(TILE_SERVER_NAME_STORAGE_KEY) ||
      DEFAULT_TILE_SERVER_NAME;

    if (tileServers[storedTileServer]) {
      setTileServer({
        ...tileServers[storedTileServer],
        name: storedTileServer,
      });
    } else {
      setTileServer(null);
    }
  }, [tileServers]);

  const updateTileServer = (tileServer: NamedTileServer | null) => {
    if (!tileServer) {
      localStorage.setItem(
        TILE_SERVER_NAME_STORAGE_KEY,
        DEFAULT_TILE_SERVER_NAME,
      );
    } else {
      localStorage.setItem(TILE_SERVER_NAME_STORAGE_KEY, tileServer.name);
    }
    setTileServer(tileServer);
  };

  return { tileServers, tileServer, setTileServer: updateTileServer };
}

export default Map;
