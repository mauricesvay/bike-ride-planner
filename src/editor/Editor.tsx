import { Box, Grid, GridItem } from "@chakra-ui/layout";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { useState } from "react";
import { EditorMap } from "./EditorMap";
import { ImportButton } from "./ImportButton";
import { ProfileSelector } from "./ProfileSelector";
import { Stats } from "./Stats";
import { Waypoints } from "./Waypoints";
import { getGpx, parseGpx } from "./gpx.utils";
import { BrouterProfile, useBrouterRoute } from "./use-brouter-route";
import { useWaypoints } from "./use-waypoints";

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
  const duration = parseFloat(properties?.["total-time"] ?? "0");
  const distance = parseFloat(properties?.["track-length"] ?? "0");
  const ascend = parseFloat(properties?.["filtered ascend"] ?? "0");

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
      <GridItem area={"header"} borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" p={2} align="center">
          <Heading size="md">Bike Ride Planner</Heading>
          <Flex gap={2}>
            <ImportButton onFileSelected={handleImport} />
            <Button onClick={() => handleExport()}>Export GPX</Button>
          </Flex>
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
