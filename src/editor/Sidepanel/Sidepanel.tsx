import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { RouteTab, RouteTabProps } from "./RouteTab";
import { StatsTab, StatsTabProps } from "./StatsTab";

export const Sidepanel = ({
  profile,
  setProfile,
  waypoints,
  setWaypoints,
  updateWaypoint,
  removeWaypoint,
  reverseWaypoints,
  distance,
  duration,
  ascend,
}: RouteTabProps & StatsTabProps) => {
  return (
    <Tabs>
      <TabList>
        <Tab>Route</Tab>
        <Tab>Stats</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RouteTab
            profile={profile}
            setProfile={setProfile}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
            updateWaypoint={updateWaypoint}
            removeWaypoint={removeWaypoint}
            reverseWaypoints={reverseWaypoints}
          />
        </TabPanel>
        <TabPanel>
          <StatsTab distance={distance} duration={duration} ascend={ascend} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
