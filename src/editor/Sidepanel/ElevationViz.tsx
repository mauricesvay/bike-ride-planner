import {
  ActiveElement,
  CategoryScale,
  Chart,
  Chart as ChartJS,
  ChartEvent,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import numeral from "numeral";
import { Line } from "react-chartjs-2";
import { AltitudeList } from "../../modules/router/use-brouter-route";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const ElevationViz = ({
  altitudeList,
  onHover = ({
    chart,
  }: {
    event: ChartEvent;
    elements: ActiveElement[];
    chart: Chart;
  }) => {
    return;
  },
}: {
  altitudeList: AltitudeList;
  onHover?: (e: any) => void;
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: "nearest" as const,
      axis: "x" as const,
    },
    onHover: onHover,
  };
  const data = {
    labels: altitudeList.map(
      (v) => `${numeral(v.distance / 1000).format("0.00")}km`
    ),
    datasets: [
      {
        fill: true,
        label: "Altitude (m)",
        data: altitudeList.map((v) => v.altitude),
        borderWidth: 1,
      },
    ],
  };
  return <Line options={options} data={data} height={200} />;
};
