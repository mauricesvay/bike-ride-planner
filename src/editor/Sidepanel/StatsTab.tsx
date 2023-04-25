import { Stats } from "./Stats";

export interface StatsTabProps {
  distance?: number;
  duration?: number;
  ascend?: number;
}

export const StatsTab = ({ distance, duration, ascend }: StatsTabProps) => {
  return <Stats distance={distance} duration={duration} ascend={ascend} />;
};
