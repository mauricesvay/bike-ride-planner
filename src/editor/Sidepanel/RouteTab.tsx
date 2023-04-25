import { Box } from "@chakra-ui/layout";
import { ProfileSelector } from "./ProfileSelector";
import { Waypoints } from "./Waypoints";
import { BrouterProfile } from "../use-brouter-route";
import { Waypoint } from "../Waypoint.types";

export interface RouteTabProps {
  profile: BrouterProfile;
  setProfile: (profile: BrouterProfile) => void;
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  updateWaypoint: (i: number, updatedWaypoint: Partial<Waypoint>) => void;
  removeWaypoint: (i: number) => void;
}

export const RouteTab = ({
  profile,
  setProfile,
  waypoints,
  setWaypoints,
  updateWaypoint,
  removeWaypoint,
}: RouteTabProps) => {
  return (
    <>
      <ProfileSelector profile={profile} onProfileChange={setProfile} />
      <Box mt={2}>
        <Waypoints
          waypoints={waypoints}
          setItems={setWaypoints}
          updateWaypoint={updateWaypoint}
          removeWaypoint={removeWaypoint}
        />
      </Box>
    </>
  );
};
