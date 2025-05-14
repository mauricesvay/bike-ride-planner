import { LayersControl, TileLayer } from "react-leaflet";

const { Overlay } = LayersControl;

export const Heatmap = () => {
  const tileLayerUrl = `https://connecttile.garmin.com/ROAD_CYCLING/{z}/{x}/{y}.png`;
  return (
    <Overlay name="Heatmap">
      <TileLayer url={tileLayerUrl} attribution="&copy; Garmin" opacity={1} />
    </Overlay>
  );
};
