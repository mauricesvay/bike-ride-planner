import { useQuery } from "@tanstack/react-query";
import { Waypoint } from "./Waypoint.types";

export interface BrouterResponse {
  type: "FeatureCollection";
  features: {
    geometry: {
      coordinates: [number, number, number][];
      type: "LineString";
    };
    properties: {
      cost: string;
      creator: string;
      "filtered ascend": string;
      messages: [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ][];
      name: string;
      "plain-ascend": string;
      times: number[];
      "total-energy": string;
      "total-time": string;
      "track-length": string;
    };
    type: "Feature";
  }[];
}

export const BROUTER_PROFILES = [
  "safety",
  "trekking",
  "fastbike",
  "shortest",
] as const;

export type BrouterProfile = (typeof BROUTER_PROFILES)[number];

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
  return useQuery<BrouterResponse>({
    queryKey: ["brouter-route", params],
    queryFn: () => fetch(url).then((response) => response.json()),
    enabled: waypoints.length > 1,
  });
};
