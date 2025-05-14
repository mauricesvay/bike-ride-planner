import { detectCorners } from "./detectCorners";

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
  points: { lat: number; lon: number; lng?: number }[],
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
