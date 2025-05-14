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
