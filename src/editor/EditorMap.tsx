import { Button, HStack, VStack } from "@chakra-ui/react";
import L, { LatLng, Marker as LeafletMarker } from "leaflet";
import max from "lodash/max";
import min from "lodash/min";
import { useCallback, useRef } from "react";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import { Hotline } from "react-leaflet-hotline";
import { HotlineGetter } from "react-leaflet-hotline/dist/types/types";
import { CenterButton } from "./CenterButton";
import "./editor-map.css";
import { Heatmap } from "./Heatmap";
import { MyMapComponent } from "./MyMapComponent";
import { usePopup } from "./use-popup";
import { Waypoint } from "./Waypoint.types";
const { BaseLayer } = LayersControl;

function getTileLayers() {
  return [
    {
      name: "CyclOSM",
      url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
    },
    {
      name: "Jawg Sunny",
      url: `https://{s}.tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=${window.BikeRidePlanner.jawg.accessToken}`,
      attribution: "&copy; Jawg Maps &copy; OpenStreetMap contributors",
    },
    {
      name: "Jawg Dark",
      url: `https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${window.BikeRidePlanner.jawg.accessToken}`,
      attribution: "&copy; Jawg Maps &copy; OpenStreetMap contributors",
    },
  ];
}

interface EditorMapProps {
  waypoints: Waypoint[];
  lines: { lat: number; lng: number; altitude: number }[][];
  updateWaypoint: (i: number, updatedWaypoint: Partial<Waypoint>) => void;
  removeWaypoint: (i: number) => void;
  addWaypoint: (latlng: LatLng) => void;
  insertWaypoint?: (i: number, latlng: LatLng) => void;
}

export function EditorMap({
  waypoints,
  lines,
  updateWaypoint,
  removeWaypoint,
  addWaypoint,
  insertWaypoint,
}: EditorMapProps) {
  const markerRef = useRef<LeafletMarker[]>([]);
  const {
    position: popupPosition,
    selectedMarkerIndex,
    openPopup,
    closePopup,
  } = usePopup();

  // Find the best position to insert a new waypoint
  const findBestInsertPosition = (newLatlng: LatLng): number => {
    if (waypoints.length === 0) return 0;
    if (waypoints.length === 1) return 1;

    let bestIndex = 1;
    let minDeviation = Infinity;

    // Try inserting only between existing waypoints (not at endpoints)
    for (let i = 1; i < waypoints.length; i++) {
      const p1 = waypoints[i - 1].latlng;
      const p2 = waypoints[i].latlng;
      const p = newLatlng;

      // Ensure all are LatLng objects
      const point1 =
        p1 instanceof L.LatLng
          ? p1
          : new L.LatLng((p1 as any).lat, (p1 as any).lng);
      const point2 =
        p2 instanceof L.LatLng
          ? p2
          : new L.LatLng((p2 as any).lat, (p2 as any).lng);
      const point =
        p instanceof L.LatLng
          ? p
          : new L.LatLng((p as any).lat, (p as any).lng);

      // Calculate the direct distance between the two waypoints
      const directDistance = point1.distanceTo(point2);

      // Calculate the detour distance: distance via new point minus direct distance
      const detourDistance =
        point1.distanceTo(point) + point.distanceTo(point2) - directDistance;

      if (detourDistance < minDeviation) {
        minDeviation = detourDistance;
        bestIndex = i;
      }
    }

    return bestIndex;
  };

  // Altitude range
  const altitudes = lines[0]?.map((p) => p.altitude) ?? [];
  const minAltitude = min(altitudes) ?? 0;
  const maxAltitude = max(altitudes) ?? 1;
  const getVal: HotlineGetter<{
    lat: number;
    lng: number;
    altitude: number;
  }> = useCallback(
    ({ point: { altitude } }) =>
      (altitude - minAltitude) / (maxAltitude - minAltitude),
    [minAltitude, maxAltitude]
  );

  return (
    <MapContainer
      bounds={[
        [48.81, 2.22],
        [48.91, 2.47],
      ]}
      style={{ height: "100%" }}
    >
      <LayersControl>
        {getTileLayers().map((tileLayer, index) => (
          <BaseLayer
            checked={index === 0}
            name={tileLayer.name}
            key={tileLayer.name}
          >
            <TileLayer
              url={tileLayer.url}
              attribution={tileLayer.attribution}
            />
          </BaseLayer>
        ))}
        <Heatmap />
      </LayersControl>

      {waypoints.map((waypoint, i) => {
        const icon = L.divIcon({
          className: "custom-marker",
          html: `${i}`,
          iconSize: [24, 24],
        });
        return (
          <Marker
            icon={icon}
            draggable
            position={waypoint.latlng}
            key={i}
            ref={(element) => {
              if (element) {
                markerRef.current[i] = element;
              }
            }}
            eventHandlers={{
              click: (e) => {
                if (popupPosition && selectedMarkerIndex === i) {
                  closePopup();
                } else {
                  openPopup(e.latlng, i);
                }
              },
              dragend: (e) => {
                const marker = markerRef.current[i];
                if (marker) {
                  updateWaypoint(i, { latlng: marker.getLatLng() });
                }
              },
            }}
          ></Marker>
        );
      })}
      {popupPosition ? (
        <Popup position={popupPosition}>
          {selectedMarkerIndex !== undefined && selectedMarkerIndex !== null ? (
            <Button
              onClick={() => {
                removeWaypoint(selectedMarkerIndex);
                closePopup();
              }}
            >
              Delete
            </Button>
          ) : (
            <VStack spacing={2} align="stretch">
              <Button
                onClick={() => {
                  if (insertWaypoint) {
                    insertWaypoint(0, popupPosition);
                  } else {
                    const newWaypoints = [
                      { latlng: popupPosition, label: "" },
                      ...waypoints,
                    ];
                  }
                  closePopup();
                }}
                colorScheme="green"
              >
                Start point
              </Button>
              <Button
                onClick={() => {
                  const insertIndex = findBestInsertPosition(popupPosition);
                  if (insertWaypoint) {
                    insertWaypoint(insertIndex, popupPosition);
                  } else {
                    // Fallback: insert locally if insertWaypoint not provided
                    const newWaypoints = [...waypoints];
                    newWaypoints.splice(insertIndex, 0, {
                      latlng: popupPosition,
                      label: "",
                    });
                  }
                  closePopup();
                }}
                size="sm"
                disabled={waypoints.length < 2}
              >
                Insert point
              </Button>
              <Button
                onClick={() => {
                  addWaypoint(popupPosition);
                  closePopup();
                }}
                colorScheme="red"
              >
                End point
              </Button>
            </VStack>
          )}
        </Popup>
      ) : null}
      <MyMapComponent addMarker={openPopup} />
      {lines.length > 0 ? (
        <Hotline
          data={lines[0]}
          getLat={(t) => {
            return t.point.lat;
          }}
          getLng={(t) => t.point.lng}
          getVal={getVal}
          options={{ weight: 3, outlineWidth: 4, outlineColor: "#000000" }}
        />
      ) : null}
      <CenterButton waypoints={waypoints} />
    </MapContainer>
  );
}
