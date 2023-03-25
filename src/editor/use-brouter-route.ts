import { useQuery } from "@tanstack/react-query";
import { Waypoint } from "./Waypoint.types";

export const BROUTER_PROFILES = [
  "safety",
  "trekking",
  "fastbike",
  "shortest",
] as const;

export type BrouterProfile = typeof BROUTER_PROFILES[number];

export function isBrouterProfile(str: string): str is BrouterProfile {
  return BROUTER_PROFILES.includes(str as BrouterProfile);
}

const API_URL = "https://brouter.de/brouter";

export const useBrouterRoute = (
  waypoints: Waypoint[],
  profile: BrouterProfile = "safety"
) => {
  const params = {
    lonlats: waypoints
      .map((waypoint) => `${waypoint.latlng.lng},${waypoint.latlng.lat}`)
      .join("|"),
    profile: profile,
    alternativeidx: "0",
    format: "geojson",
  };
  const url = `${API_URL}?${new URLSearchParams(params)}`;
  return useQuery({
    queryKey: ["brouter-route", params],
    queryFn: () => fetch(url).then((response) => response.json()),
    enabled: waypoints.length > 1,
  });
};
