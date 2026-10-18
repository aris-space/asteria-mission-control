import { Protocol } from "pmtiles";
import * as maplibregl from "maplibre-gl";
import { layers, namedFlavor } from "@protomaps/basemaps";
import MapContainer, {
  Layer,
  MapRef,
  Marker,
  Source,
} from "react-map-gl/maplibre";
import {
  ActionIcon,
  Affix,
  Alert,
  Card,
  Flex,
  Loader,
  Select,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TileServer,
  useGroundStation,
  useTileServers,
} from "@asteria/mission-control-client";
import {
  IconAlertTriangle,
  IconBuildingBroadcastTower,
  IconMapPinFilled,
  IconMapPinUp,
  IconMapPinX,
  IconPolygon,
} from "@tabler/icons-react";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";
import "maplibre-gl/dist/maplibre-gl.css";
import { Feature, Polygon } from "geojson";
import { bbox, destination, distance, point, polygon } from "@turf/turf";

// Maximum amount of stored data points to keep.
// When a new data point beyond this length is received,
// is replaces the oldest data point.
const MAX_HISTORY_LENGTH = 5000;

// Amount to shorten the history from the beginning once it
// starts "overflowing", meaning once `MAX_HISTORY_LENGTH`
// is reached.
// This should prevent that we need to iterate over the entire list
// for every new position after reaching `MAX_HISTORY_LENGTH`.
const HISTORY_SHORTEN_AMOUNT = 1000;

// Delay in milliseconds after which position updates
// are drawn on the map.
const UPDATE_DELAY = 75;

// The distance in meters between two positions such that the
// second position is added to the rocket's history.
const MIN_DISTANCE_STEP = 3;

// Name of the default tile server to use.
const DEFAULT_TILE_SERVER_NAME = "osm";

// Key to store the name of the active tile server in the local storage.
const TILE_SERVER_NAME_STORAGE_KEY = "TILE_SERVER";

type NamedTileServer = TileServer & { name: string };

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

function Map() {
  const theme = useMantineTheme();
  const { remoteComputer, gncPolygon, isGncPolygonLoading } =
    useRemoteComputer();
  const { tileServer, tileServers, setTileServer } = useActiveTileServer();
  const positionMessage = useMavlinkMessage("SensorCarrier", "PositionData");
  const { data: groundStation, isLoading: isGroundStationLoading } =
    useGroundStation();

  const mapRef = useRef<MapRef>(null);

  const lastRender = useRef(0);
  // History of rocket positions stored as longitude-latitude tuples.
  const history = useRef<[number, number][]>([]);

  const [following, setFollowing] = useState<boolean>(true);

  useEffect(() => {
    history.current = [];
    lastRender.current = 0;
    if (mapRef.current) {
      const traceSource = mapRef.current.getSource("trace");
      if (traceSource instanceof maplibregl.GeoJSONSource) {
        traceSource.setData({ type: "FeatureCollection", features: [] });
      }

      const latestPointSource = mapRef.current.getSource("latest-point");
      if (latestPointSource instanceof maplibregl.GeoJSONSource) {
        latestPointSource.setData({ type: "Point", coordinates: [] });
      }
    }
  }, [remoteComputer?.name]);

  useEffect(() => {
    const content = positionMessage?.message.content;
    if (!content) return;

    const { locationLatitude: lat, locationLongitude: lng } = content;
    // Zero-coordinates are nonsense values.
    if (!lat && !lng) return;

    const last = history.current.at(-1);

    if (last) {
      const dist = distance(point(last), point([lng, lat]), {
        units: "meters",
      });
      if (dist <= MIN_DISTANCE_STEP) {
        // The minimum distance between the new and the last point is smaller
        // than our `MIN_DISTANCE_STEP` threshold.
        // We thus don't need to update the history.
        return;
      }
    }

    history.current.push([lng, lat]);

    if (history.current.length > MAX_HISTORY_LENGTH) {
      console.warn(
        `Maximum history length of ${MAX_HISTORY_LENGTH} has been reached; removing ${HISTORY_SHORTEN_AMOUNT} elements`,
      );
      history.current.splice(0, HISTORY_SHORTEN_AMOUNT);
    }

    requestAnimationFrame((now) => {
      updateLatest();
      if (now - lastRender.current < UPDATE_DELAY) return;

      lastRender.current = now;

      updateTrace();
    });
  }, [positionMessage]);

  /// Update the trace on the map without re-rendering the entire React component.
  const updateTrace = () => {
    const source = mapRef.current?.getSource("trace");

    if (!(source instanceof maplibregl.GeoJSONSource)) return;

    source.setData({
      type: "FeatureCollection",
      features:
        history.current.length >= 2
          ? [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: history.current },
            },
          ]
          : [],
    });
  };

  // Update the point of the "head" of the rocket without re-rendering the entire React component.
  // If `following` is `true`, this also pans to the new "head" point`
  const updateLatest = () => {
    const source = mapRef.current?.getSource("latest-point");
    const latest = history.current.at(-1);

    if (!(source instanceof maplibregl.GeoJSONSource) || !latest) return;

    source.setData(point(latest));

    // Auto-follow logic.
    if (following) mapRef.current?.panTo(latest, { duration: 50 });
  };

  // GeoJSON features for the GNC polygon.
  const polygonFeatures = useMemo<Feature<Polygon> | null>(() => {
    if (!gncPolygon) return null;
    const origin = point([gncPolygon.originLng, gncPolygon.originLat]);
    const coordinates = gncPolygon.inner.points.map(([north, east]) => {
      // Hypothenuse distance in meters.
      const dist = Math.sqrt(north ** 2 + east ** 2);
      // Clockwise angle from the north axis.
      const bearing = Math.atan2(east, north) * (180 / Math.PI);
      // Projection from the origin point
      const dest = destination(origin, dist, bearing, { units: "meters" });
      return dest.geometry.coordinates;
    });

    // GeoJSON requires a "LinearRing", meaning the first and last points
    // must be exactly identical to close the shape.
    if (coordinates.length > 0) {
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];

      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordinates.push([...first]);
      }
    }

    return polygon([coordinates]);
  }, [gncPolygon]);

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
          <Tooltip label={"Center on ground station"}>
            <ActionIcon
              loading={isGroundStationLoading}
              disabled={!groundStation}
              onClick={() => {
                if (!groundStation) return;
                setFollowing(false);
                mapRef.current?.flyTo({
                  center: [groundStation.longitude, groundStation.latitude],
                  duration: 500,
                });
              }}
            >
              <IconBuildingBroadcastTower />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Fit view to GNC polygon"}>
            <ActionIcon
              loading={isGncPolygonLoading}
              disabled={!polygonFeatures}
              onClick={() => {
                if (!polygonFeatures) return;
                setFollowing(false);
                const [minLng, minLat, maxLng, maxLat] = bbox(polygonFeatures);
                mapRef.current?.fitBounds(
                  [
                    [minLng, minLat],
                    [maxLng, maxLat],
                  ],
                  { padding: 50, duration: 500 },
                );
              }}
            >
              {<IconPolygon />}
            </ActionIcon>
          </Tooltip>
        </Flex>
      </Affix>
      <Affix zIndex={1000} position={{ top: "5rem", left: "lg" }}>
        <Select
          disabled={!tileServers || Object.keys(tileServers).length == 0}
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
      {isGroundStationLoading ? (
        <Flex h="100%" align="center" justify="center">
          <Loader />
        </Flex>
      ) : (
        <MapContainer
          ref={mapRef}
          mapStyle={mapStyle}
          // `initialViewState` is only read on mount, which is why the map is
          // only rendered once the ground station has been loaded.
          initialViewState={
            groundStation
              ? {
                  longitude: groundStation.longitude,
                  latitude: groundStation.latitude,
                  zoom: 15,
                }
              : { longitude: 0, latitude: 0, zoom: 1 }
          }
          onDragStart={() => setFollowing(false)}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <Source
            id="trace"
            type="geojson"
            data={{ type: "FeatureCollection", features: [] }}
          >
            <Layer
              id="trace-layer"
              type="line"
              source="trace"
              paint={{
                "line-width": 4,
                "line-color": theme.colors.red[9],
              }}
            />
          </Source>
          {polygonFeatures && (
            <Source id="gnc-polygon" type="geojson" data={polygonFeatures}>
              <Layer
                id="gnc-polygon-layer"
                type="fill"
                source="gnc-polygon"
                paint={{
                  "fill-color": theme.colors.blue[9],
                  "fill-opacity": 0.1,
                }}
              />
              <Layer
                id="gnc-polygon-outline-layer"
                type="line"
                source="gnc-polygon"
                paint={{
                  "line-color": theme.colors.blue[9],
                  "line-width": 2,
                }}
              />
            </Source>
          )}

          <Source
            id="latest-point"
            type="geojson"
            data={{ type: "Point", coordinates: [] }}
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

          {groundStation && (
            <Marker
              longitude={groundStation.longitude}
              latitude={groundStation.latitude}
              anchor="bottom"
            >
              <IconMapPinFilled
                size={36}
                color={theme.colors.red[7]}
                style={{
                  filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4))",
                }}
              />
            </Marker>
          )}
        </MapContainer>
      )}
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
