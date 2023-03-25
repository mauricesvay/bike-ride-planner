import { DownloadIcon } from "@chakra-ui/icons";
import { Box, Grid, GridItem } from "@chakra-ui/layout";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { BaseBuilder, buildGPX } from "gpx-builder";
import { Point } from "gpx-builder/dist/builder/BaseBuilder/models";
import { useState } from "react";
import { EditorMap } from "./EditorMap";
import { ProfileSelector } from "./ProfileSelector";
import { Stats } from "./Stats";
import { BrouterProfile, useBrouterRoute } from "./use-brouter-route";
import { useWaypoints } from "./use-waypoints";
import { Waypoints } from "./Waypoints";

function Editor() {
  const [profile, setProfile] = useState<BrouterProfile>("safety");
  const {
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    setWaypoints,
  } = useWaypoints();

  // Routing
  const { data } = useBrouterRoute(waypoints, profile);
  const lines =
    data?.features.map((feature: any) =>
      feature.geometry.coordinates.map(([lng, lat]: any) => [lat, lng])
    ) ?? [];

  // Stats
  const properties = data?.features[0].properties;
  const duration = properties?.["total-time"];
  const distance = properties?.["track-length"];
  const ascend = properties?.["filtered ascend"];

  const handleExport = () => {
    const now = Date.now();
    const points: Point[] = waypoints.map((waypoint) => {
      const point = new Point(waypoint.latlng.lat, waypoint.latlng.lng, {
        ele: 0, // @TODO: set correct elevation
      });
      return point;
    });
    const segmentPoints: Point[] = data.features[0].geometry.coordinates.map(
      ([lng, lat, ele]: any, i: number) => {
        const time = data.features[0].properties.times[i];
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
    let blob = new Blob([gpxString], {
      type: "application/gpx+xml;charset=utf-8",
    });
    saveAs(blob, "export.gpx");
  };

  return (
    <Grid
      w="100%"
      h="100vh"
      templateAreas={`"header header"
                      "nav main"`}
      gridTemplateRows={"0fr 1fr"}
      gridTemplateColumns={"320px 1fr"}
    >
      <GridItem area={"header"} borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" p={2} align="center">
          <Heading size="md">Bike Ride Planner</Heading>
          <Button leftIcon={<DownloadIcon />} onClick={() => handleExport()}>
            Download GPX
          </Button>
        </Flex>
      </GridItem>
      <GridItem p="2" area={"nav"}>
        <ProfileSelector profile={profile} onProfileChange={setProfile} />
        <Box mt={2}>
          <Waypoints
            waypoints={waypoints}
            setItems={setWaypoints}
            updateWaypoint={updateWaypoint}
            removeWaypoint={removeWaypoint}
          />
        </Box>

        <Stats length={distance} time={duration} ascend={ascend} />
      </GridItem>
      <GridItem area={"main"}>
        <EditorMap
          waypoints={waypoints}
          updateWaypoint={updateWaypoint}
          removeWaypoint={removeWaypoint}
          addWaypoint={addWaypoint}
          lines={lines}
        />
      </GridItem>
    </Grid>
  );
}

export default Editor;
