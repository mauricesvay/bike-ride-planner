import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Waypoint } from "../../editor/Waypoint.types";

export const useWaypoints = () => {
  const initialMarkers = JSON.parse(
    localStorage.getItem("bikerideplanner_waypoints") ?? "[]"
  ) as Waypoint[];
  const [waypoints, setWaypoints] = useState<Waypoint[]>(initialMarkers);

  useEffect(() => {
    localStorage.setItem(
      "bikerideplanner_waypoints",
      JSON.stringify(waypoints)
    );
  }, [waypoints]);

  const addWaypoint = (latlng: LatLng) =>
    setWaypoints([...waypoints, { latlng, label: "" }]);

  const removeWaypoint = (i: number) => {
    const newMarkers = [...waypoints];
    newMarkers.splice(i, 1);
    setWaypoints(newMarkers);
  };

  const updateWaypoint = (i: number, updatedWaypoint: Partial<Waypoint>) => {
    const newWaypoints = [...waypoints];
    newWaypoints[i] = { ...newWaypoints[i], ...updatedWaypoint };
    setWaypoints(newWaypoints);
  };

  const insertWaypoint = (i: number, latlng: LatLng) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(i, 0, { latlng, label: "" });
    setWaypoints(newWaypoints);
  };

  const reverseWaypoints = () => {
    const newWaypoints = [...waypoints];
    newWaypoints.reverse();
    setWaypoints(newWaypoints);
  };

  return {
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    insertWaypoint,
    setWaypoints,
    reverseWaypoints,
  };
};
