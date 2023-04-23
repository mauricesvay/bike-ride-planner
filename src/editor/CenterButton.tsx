import { Button } from "@chakra-ui/react";
import * as turf from "@turf/turf";
import L, { LatLngBoundsExpression } from "leaflet";
import { MouseEventHandler, useRef } from "react";
import { useMap } from "react-leaflet";
import { Waypoint } from "./Waypoint.types";

const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
};

export function CenterButton({ waypoints }: { waypoints: Waypoint[] }) {
  const parentMap = useMap();
  const buttonRef = useRef();

  const handleCenterMap: MouseEventHandler<HTMLButtonElement> = () => {
    // Compute bounds
    var features = turf.featureCollection(
      waypoints.map(({ latlng: { lat, lng } }) => turf.point([lat, lng]))
    );
    var enveloped = turf.envelope(features);
    if (!enveloped.bbox) {
      return;
    }
    const nextBounds: LatLngBoundsExpression = [
      [enveloped.bbox[0], enveloped.bbox[1]],
      [enveloped.bbox[2], enveloped.bbox[3]],
    ];

    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(
        buttonRef.current
      ).disableScrollPropagation(buttonRef.current);
    }
    parentMap.fitBounds(nextBounds);
  };

  return (
    <div className={POSITION_CLASSES.topright}>
      <Button
        onClick={handleCenterMap}
        className="leaflet-control"
        ref={buttonRef}
      >
        Center
      </Button>
    </div>
  );
}
