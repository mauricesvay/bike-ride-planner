import { LatLng } from "leaflet";
import { useMapEvents } from "react-leaflet";

export function MyMapComponent({
  addMarker,
}: {
  addMarker: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click: ({ latlng }: { latlng: LatLng }) => {
      addMarker(latlng);
    },
  });
  return null;
}
