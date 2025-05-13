import { AltitudeList } from "../../modules/router/use-brouter-route";
import { ElevationViz } from "./ElevationViz";
import { Stats } from "./Stats";

export interface StatsTabProps {
  distance?: number;
  duration?: number;
  ascend?: number;
  altitudeList: AltitudeList;
}

export const StatsTab = ({
  distance,
  duration,
  ascend,
  altitudeList,
}: StatsTabProps) => {
  return (
    <>
      <Stats distance={distance} duration={duration} ascend={ascend} />
      <ElevationViz altitudeList={altitudeList} />
    </>
  );
};
