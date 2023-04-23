import { LatLng, LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";

export function MyMapComponent({
  addMarker,
}: {
  addMarker: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click: ({ latlng }: LeafletMouseEvent) => {
      addMarker(latlng);
    },
  });
  return null;
}
