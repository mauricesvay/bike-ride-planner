import { Button } from "@chakra-ui/react";
import L, { LatLng, LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { useRef } from "react";
import {
  LayersControl,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { CenterButton } from "./CenterButton";
import { MyMapComponent } from "./MyMapComponent";
import { Waypoint } from "./Waypoint.types";
import "./editor-map.css";
import { usePopup } from "./use-popup";
import { useStravaAuth } from "./use-strava-auth";
const { BaseLayer, Overlay } = LayersControl;

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
  lines: LatLngExpression[][];
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

  // Strava heatmap
  const strava = useStravaAuth();
  const stravaElement = strava ? (
    <Overlay name="Strava Heatmap">
      <TileLayer
        url={`http://heatmap-external-b.strava.com/tiles-auth/ride/hot/{z}/{x}/{y}.png?Key-Pair-Id=${strava["Key-Pair-Id"]}&Policy=${strava.Policy}&Signature=${strava.Signature}`}
        attribution="&copy; Strava"
        maxZoom={15}
      />
    </Overlay>
  ) : null;

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
        {stravaElement}
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
        <Polyline positions={lines[0]} pathOptions={{ color: "red" }} />
      ) : null}
      <CenterButton waypoints={waypoints} />
    </MapContainer>
  );
}
