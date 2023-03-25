import { LatLng } from "leaflet";
import { useCallback, useState } from "react";

interface PopupState {
  position: LatLng;
  selectedMarkerIndex: number | null;
}

export function usePopup() {
  const [markerState, setMarkerState] = useState<PopupState | null>(null);
  const closePopup = useCallback(() => {
    setMarkerState(null);
  }, [setMarkerState]);

  const openPopup = useCallback(
    (position: LatLng, markerIndex?: number) => {
      setMarkerState({
        position,
        selectedMarkerIndex: markerIndex ?? null,
      });
    },
    [setMarkerState]
  );

  return {
    position: markerState?.position,
    selectedMarkerIndex: markerState?.selectedMarkerIndex,
    openPopup,
    closePopup,
  };
}
