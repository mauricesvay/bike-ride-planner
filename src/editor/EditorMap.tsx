import { Button } from "@chakra-ui/react";
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
}

export function EditorMap({
  waypoints,
  lines,
  updateWaypoint,
  removeWaypoint,
  addWaypoint,
}: EditorMapProps) {
  const markerRef = useRef<LeafletMarker[]>([]);
  const {
    position: popupPosition,
    selectedMarkerIndex,
    openPopup,
    closePopup,
  } = usePopup();

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
            <Button
              onClick={(e) => {
                addWaypoint(popupPosition);
                closePopup();
              }}
            >
              Add a point
            </Button>
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
