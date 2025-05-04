import { BaseBuilder, buildGPX } from "gpx-builder";
import { Point } from "gpx-builder/dist/builder/BaseBuilder/models";
import gpxParser from "gpxparser";
import { Waypoint } from "./Waypoint.types";
import { BrouterResponse } from "./use-brouter-route";
import { LatLng } from "leaflet";

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
 * Calculates the bearing between two points in degrees (0-360)
 * @param lat1 Latitude of point 1 (in degrees)
 * @param lng1 Longitude of point 1 (in degrees)
 * @param lat2 Latitude of point 2 (in degrees)
 * @param lng2 Longitude of point 2 (in degrees)
 * @returns Bearing in degrees
 */
function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convert to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lngDiffRad = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(lngDiffRad) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lngDiffRad);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  // Normalize to 0-360
  return (bearing + 360) % 360;
}

/**
 * Detects corners/direction changes in a list of waypoints
 * @param points List of points with lat/lng properties
 * @param angleThreshold Minimum angle change to consider a point as a corner (in degrees)
 * @returns List of indices representing corner points
 */
export function detectCorners(
  points: { lat: number; lon: number }[] | { lat: number; lng: number }[],
  angleThreshold: number = 30
): number[] {
  if (points.length < 3) {
    return []; // Need at least 3 points to detect a corner
  }

  const corners: number[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    // Get current and neighboring points
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Handle different property names
    const prevLat = prev.lat;
    const prevLng = "lng" in prev ? prev.lng : prev.lon;
    const currentLat = current.lat;
    const currentLng = "lng" in current ? current.lng : current.lon;
    const nextLat = next.lat;
    const nextLng = "lng" in next ? next.lng : next.lon;

    // Calculate bearings between segments
    const bearing1 = calculateBearing(prevLat, prevLng, currentLat, currentLng);
    const bearing2 = calculateBearing(currentLat, currentLng, nextLat, nextLng);

    // Calculate the absolute difference between bearings
    let angleDiff = Math.abs(bearing2 - bearing1);
    // Ensure we get the smaller angle (always <= 180 degrees)
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }

    // If the angle difference exceeds our threshold, this is a corner
    if (angleDiff > angleThreshold) {
      corners.push(i);
    }
  }

  return corners;
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
 * Calculate the perpendicular distance from a point to a line segment
 * @param point The point to calculate distance from
 * @param lineStart Start point of the line
 * @param lineEnd End point of the line
 * @returns Distance in meters
 */
function perpendicularDistance(
  point: { lat: number; lon?: number; lng?: number },
  lineStart: { lat: number; lon?: number; lng?: number },
  lineEnd: { lat: number; lon?: number; lng?: number }
): number {
  // Handle different property names
  const pointLng =
    "lng" in point && point.lng !== undefined
      ? point.lng
      : (point.lon as number);
  const lineStartLng =
    "lng" in lineStart && lineStart.lng !== undefined
      ? lineStart.lng
      : (lineStart.lon as number);
  const lineEndLng =
    "lng" in lineEnd && lineEnd.lng !== undefined
      ? lineEnd.lng
      : (lineEnd.lon as number);

  // Convert to cartesian coordinates (simplified for small distances)
  const earthRadius = 6371000; // meters

  // Convert to radians
  const p1LatRad = (lineStart.lat * Math.PI) / 180;
  const p1LngRad = (lineStartLng * Math.PI) / 180;
  const p2LatRad = (lineEnd.lat * Math.PI) / 180;
  const p2LngRad = (lineEndLng * Math.PI) / 180;
  const pLatRad = (point.lat * Math.PI) / 180;
  const pLngRad = (pointLng * Math.PI) / 180;

  // Convert to cartesian coords (x,y,z) where earth center is (0,0,0)
  const p1x = earthRadius * Math.cos(p1LatRad) * Math.cos(p1LngRad);
  const p1y = earthRadius * Math.cos(p1LatRad) * Math.sin(p1LngRad);
  const p1z = earthRadius * Math.sin(p1LatRad);

  const p2x = earthRadius * Math.cos(p2LatRad) * Math.cos(p2LngRad);
  const p2y = earthRadius * Math.cos(p2LatRad) * Math.sin(p2LngRad);
  const p2z = earthRadius * Math.sin(p2LatRad);

  const px = earthRadius * Math.cos(pLatRad) * Math.cos(pLngRad);
  const py = earthRadius * Math.cos(pLatRad) * Math.sin(pLngRad);
  const pz = earthRadius * Math.sin(pLatRad);

  // Line vector
  const vx = p2x - p1x;
  const vy = p2y - p1y;
  const vz = p2z - p1z;

  // Vector from p1 to point
  const wx = px - p1x;
  const wy = py - p1y;
  const wz = pz - p1z;

  // Cross product to get area of parallelogram
  const crossX = vy * wz - vz * wy;
  const crossY = vz * wx - vx * wz;
  const crossZ = vx * wy - vy * wx;

  // Area = |cross product| / 2 = |v × w| / 2
  const area =
    Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) / 2;

  // Height = 2 * Area / |v|
  const lineLength = Math.sqrt(vx * vx + vy * vy + vz * vz);

  return lineLength === 0 ? 0 : (2 * area) / lineLength;
}

/**
 * Implements Ramer-Douglas-Peucker algorithm to simplify a curve/path
 * @param points Array of points with lat/lng properties
 * @param epsilon Distance threshold for simplification (in meters)
 * @param startIndex Start index for current segment
 * @param endIndex End index for current segment
 * @param result Array to collect indices to keep
 */
function douglasPeucker(
  points: { lat: number; lon?: number; lng?: number }[],
  epsilon: number,
  startIndex: number,
  endIndex: number,
  result: Set<number>
): void {
  // Add start and end points
  result.add(startIndex);
  result.add(endIndex);

  if (startIndex + 1 >= endIndex) {
    return; // No points in between
  }

  let furthestPointIndex = startIndex;
  let maxDistance = 0;

  // Find furthest point from line segment
  for (let i = startIndex + 1; i < endIndex; i++) {
    const distance = perpendicularDistance(
      points[i],
      points[startIndex],
      points[endIndex]
    );

    if (distance > maxDistance) {
      maxDistance = distance;
      furthestPointIndex = i;
    }
  }

  // If furthest point exceeds threshold, recursively process sub-segments
  if (maxDistance > epsilon) {
    douglasPeucker(points, epsilon, startIndex, furthestPointIndex, result);
    douglasPeucker(points, epsilon, furthestPointIndex, endIndex, result);
  }
}

/**
 * Decimates (simplifies) a list of points using the Ramer-Douglas-Peucker algorithm
 * combined with corner detection to preserve important shape features
 *
 * @param points Array of points to be simplified
 * @param options Configuration options
 * @returns Simplified array of points (indices of points to keep)
 */
export function decimatePoints(
  points: { lat: number; lon?: number; lng?: number }[],
  options: {
    /** Maximum distance error in meters for simplification */
    epsilon?: number;
    /** Whether to preserve corners */
    preserveCorners?: boolean;
    /** Angle threshold for corner detection */
    cornerAngleThreshold?: number;
  } = {}
): number[] {
  if (points.length <= 2) {
    return [...Array(points.length).keys()]; // Return all indices if 2 or fewer points
  }

  const {
    epsilon = 10, // Default 10 meters simplification tolerance
    preserveCorners = true,
    cornerAngleThreshold = 30,
  } = options;

  // Use RDP algorithm to identify important points
  const indicesToKeep = new Set<number>();
  douglasPeucker(points, epsilon, 0, points.length - 1, indicesToKeep);

  // Add corners if requested
  if (preserveCorners) {
    const corners = detectCorners(points, cornerAngleThreshold);
    corners.forEach((index) => indicesToKeep.add(index));
  }

  // Convert to array and sort
  return Array.from(indicesToKeep).sort((a, b) => a - b);
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
  console.log(gpx);

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
