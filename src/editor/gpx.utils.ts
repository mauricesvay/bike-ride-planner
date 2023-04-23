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

  return { waypoints };
}
