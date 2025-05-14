import { BaseBuilder, buildGPX } from "gpx-builder";
import { Point } from "gpx-builder/dist/builder/BaseBuilder/models";
import gpxParser from "gpxparser";
import { LatLng } from "leaflet";
import { Waypoint } from "../../editor/Waypoint.types";
import { BrouterResponse } from "../router/use-brouter-route";
import { decimatePoints } from "./decimatePoints";
import { detectCorners } from "./detectCorners";

export function getGpx(
  waypoints: Waypoint[],
  brouterData: BrouterResponse
): string {
  const now = Date.now();
  const points: Point[] = waypoints.map((waypoint) => {
    const point = new Point(waypoint.latlng.lat, waypoint.latlng.lng, {
      ele: 0, // @TODO: set correct elevation
      name: waypoint.label,
    });
    return point;
  });
  const segmentPoints: Point[] =
    brouterData.features[0].geometry.coordinates.map(
      ([lng, lat, ele]: any, i: number) => {
        const time = brouterData.features[0].properties.times[i];
        const point = new Point(lat, lng, {
          ele: ele,
          time: new Date(now + time * 1000),
        });
        return point;
      }
    );
  const gpxData = new BaseBuilder();
  gpxData.setWayPoints(points);
  gpxData.setSegmentPoints(segmentPoints);
  const gpxString = buildGPX(gpxData.toObject());
  return gpxString;
}

/**
 * Extracts waypoints from track with automatic corner detection
 * @param track Track points from GPX
 * @param angleThreshold Minimum angle to consider a corner
 * @returns List of waypoints including start, end, and corners
 */
export function extractWaypointsFromTrack(
  track: { lat: number; lon: number }[],
  angleThreshold: number = 30
): Waypoint[] {
  if (track.length === 0) {
    return [];
  }

  // Detect corners
  const cornerIndices = detectCorners(track, angleThreshold);

  // Always include start and end points
  const waypointIndices = [0, ...cornerIndices, track.length - 1];
  // Remove duplicates and sort
  const uniqueIndices = [...new Set(waypointIndices)].sort((a, b) => a - b);

  // Convert to waypoints
  return uniqueIndices.map((index) => {
    const point = track[index];
    return {
      label:
        index === 0
          ? "Start"
          : index === track.length - 1
          ? "End"
          : `Point ${cornerIndices.indexOf(index) + 1}`,
      latlng: {
        lat: point.lat,
        lng: point.lon,
      } as LatLng,
    };
  });
}

/**
 * Creates a simplified list of waypoints from an array of track points
 *
 * @param trackPoints Original array of track points
 * @param options Decimation options
 * @returns Simplified array of Waypoint objects
 */
export function createDecimatedWaypoints(
  trackPoints: { lat: number; lon: number }[],
  options: {
    epsilon?: number;
    preserveCorners?: boolean;
    cornerAngleThreshold?: number;
  } = {}
): Waypoint[] {
  if (trackPoints.length === 0) {
    return [];
  }

  // Get indices of points to keep
  const indicesToKeep = decimatePoints(trackPoints, options);

  // Convert to Waypoints
  return indicesToKeep.map((index) => {
    const point = trackPoints[index];
    return {
      label:
        index === 0
          ? "Start"
          : index === trackPoints.length - 1
          ? "End"
          : `Point ${index}`,
      latlng: {
        lat: point.lat,
        lng: point.lon,
      } as LatLng,
    };
  });
}

export function parseGpx(gpxString: string) {
  var gpx = new gpxParser();
  gpx.parse(gpxString);
  const waypoints: Waypoint[] = gpx.waypoints.map(({ name, lat, lon }) => ({
    label: name ?? "",
    latlng: {
      lat,
      lng: lon,
    } as LatLng,
  }));

  const trackPoints = gpx.tracks[0]?.points || [];
  const significantWaypoints = extractWaypointsFromTrack(trackPoints, 30).map(
    (wp) => ({ lat: wp.latlng.lat, lon: wp.latlng.lng })
  );
  // Use the new decimation function instead of just start/end points
  const defaultWaypoints =
    significantWaypoints.length > 0
      ? createDecimatedWaypoints(significantWaypoints, {
          epsilon: 20, // 20 meters simplification tolerance
          preserveCorners: true,
          cornerAngleThreshold: 30, // 30 degrees threshold for corners
        })
      : [];

  return {
    name: gpx.metadata.name,
    waypoints: waypoints.length === 0 ? defaultWaypoints : waypoints,
    tracks: gpx.tracks,
  };
}
