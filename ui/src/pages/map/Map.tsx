import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, useMantineTheme } from "@mantine/core";
import { useMavlinkMessage } from "@asteria/hooks/MavlinkContext";
import { useEffect, useReducer, useRef } from "react";
import { LatLngTuple } from "leaflet";
import { PositionData } from "packages/api-client/src";

type Position = Pick<
  PositionData,
  "locationLatitude" | "locationLongitude" | "locationHamsl"
>;

function Map() {
  const theme = useMantineTheme();
  const positionMessage = useMavlinkMessage("SensorCarrier", "PositionData");

  const history = useRef<Position[]>([]);
  const [, forceRender] = useReducer((x) => x + 1, 0);

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

    // Trigger a re-render.
    forceRender();
  }, [positionMessage]);

  const positions: LatLngTuple[] = history.current.map((entry) => [
    entry.locationLatitude,
    entry.locationLongitude,
  ]);

  return (
    <Card
      h="calc(100vh - var(--app-shell-header-height))"
      w="100%"
      p={0}
      radius={0}
    >
      <MapContainer
        zoomControl={false}
        attributionControl={false}
        center={[0, 0]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline color={theme.colors.red[9]} positions={positions} />
      </MapContainer>
    </Card>
  );
}

export default Map;
