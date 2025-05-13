import { useQuery } from "@tanstack/react-query";
import { Waypoint } from "../../editor/Waypoint.types";

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;

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
    staleTime: ONE_HOUR,
  });
};

export type AltitudeList = {
  distance: number;
  altitude: number;
}[];

export function getAltitudeList(data: BrouterResponse): AltitudeList {
  const messages = data.features[0].properties.messages;
  const altitudeList = messages.reduce((acc, cur, index) => {
    if (index === 0) {
      return acc;
    }
    const altitude = parseFloat(cur[2]);
    const distanceFromPreviousPoint = parseFloat(cur[3]);
    const cumulativeDistance =
      (acc[acc.length - 1]?.distance ?? 0) + distanceFromPreviousPoint;
    acc.push({
      distance: cumulativeDistance,
      altitude: altitude,
    });
    return acc;
  }, [] as AltitudeList);
  return altitudeList;
}
