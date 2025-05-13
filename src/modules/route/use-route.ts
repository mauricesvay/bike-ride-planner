import { useEffect, useState } from "react";
import { match } from "ts-pattern";
import {
  BrouterProfile,
  BrouterResponse,
  isBrouterProfile,
  useBrouterRoute,
} from "../router/use-brouter-route";
import { useWaypoints } from "./use-waypoints";

export const useRoute = () => {
  // Profile
  const localStorageProfile =
    localStorage.getItem("bikerideplanner_profile") ?? "";
  const initialProfile = match(localStorageProfile)
    .when(isBrouterProfile, (v) => v)
    .otherwise(() => "safety" as const);
  localStorage.getItem("bikerideplanner_profile") ?? "safety";
  const [profile, setProfile] = useState<BrouterProfile>(initialProfile);
  useEffect(() => {
    localStorage.setItem("bikerideplanner_profile", profile);
  }, [profile]);

  // Waypoints
  const {
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    setWaypoints,
    reverseWaypoints,
  } = useWaypoints();

  // Route
  const [route, setRoute] = useState<BrouterResponse | undefined>(undefined);
  const { data } = useBrouterRoute(waypoints, profile);
  useEffect(() => {
    setRoute(data);
  }, [data]);

  return {
    profile,
    setProfile,
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    setWaypoints,
    reverseWaypoints,
    route,
  };
};
