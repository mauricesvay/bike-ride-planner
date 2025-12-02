import { Grid, GridItem } from "@chakra-ui/layout";
import { Button, Flex, Heading, useTheme } from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { getGpx, parseGpx } from "../modules/gpx/gpx.utils";
import { useRoute } from "../modules/route/use-route";
import {
  getAltitudeList
} from "../modules/router/use-brouter-route";
import { EditorMap } from "./EditorMap";
import { ImportButton } from "./ImportButton";
import { Sidepanel } from "./Sidepanel/Sidepanel";

function Editor() {
  const theme = useTheme();
  const borderColor = theme.semanticTokens.colors["chakra-border-color"];

  const {
    profile,
    setProfile,
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    setWaypoints,
    reverseWaypoints,
    route: data,
  } = useRoute();

  const lines =
    data?.features.map((feature) => {
      return feature.geometry.coordinates.map(([lng, lat, altitude]) => ({
        lat,
        lng,
        altitude,
      }));
    }) ?? [];

  // Stats
  const properties = data?.features[0].properties;
  const duration = parseFloat(properties?.["total-time"] ?? "0");
  const distance = parseFloat(properties?.["track-length"] ?? "0");
  const ascend = parseFloat(properties?.["filtered ascend"] ?? "0");

  // Elevation
  const altitudeList = data ? getAltitudeList(data) : [];

  const handleNew = () => {
    setWaypoints([]);
  }

  // Export
  const handleExport = () => {
    if (data) {
      const gpxString = getGpx(waypoints, data);
      let blob = new Blob([gpxString], {
        type: "application/gpx+xml;charset=utf-8",
      });
      saveAs(blob, "export.gpx");
    }
  };

  // Import
  const handleImport = (files: FileList) => {
    if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        const gpxText = String(event.target?.result) ?? "";
        const { waypoints: nextWaypoints } = parseGpx(gpxText);
        if (nextWaypoints.length === 0) {
          alert(t("editor.import.nowaypoints"));
        } else {
          setWaypoints(nextWaypoints);
        }
      });
      reader.readAsText(file);
    }
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
      <GridItem
        area={"header"}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Flex justify="space-between" p={2} align="center">
          <Heading size="md">Bike Ride Planner</Heading>
          <Flex gap={2}>
            <Button onClick={() => handleNew()}>New</Button>
            <ImportButton onFileSelected={handleImport} />
            <Button onClick={() => handleExport()}>Export GPX</Button>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem area={"nav"} overflow="hidden">
        <Sidepanel
          profile={profile}
          setProfile={setProfile}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
          updateWaypoint={updateWaypoint}
          removeWaypoint={removeWaypoint}
          reverseWaypoints={reverseWaypoints}
          distance={distance}
          duration={duration}
          ascend={ascend}
          altitudeList={altitudeList}
        />
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
