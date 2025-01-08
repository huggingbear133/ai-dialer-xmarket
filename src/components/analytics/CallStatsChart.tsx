import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,  // Register PointElement
  LineElement,
  Title,
  Tooltip,
  Legend
);


// Define the expected prop types for the component
interface CallStatsChartProps {
  data: Record<string, number>;
}

export function CallStatsChart({ data }: CallStatsChartProps) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: "End of Call Reasons",
        data: Object.values(data),
        borderColor: "#4caf50",
        backgroundColor: "#81c784",
        fill: true,
      },
    ],
  };

  // Return the chart component with the correct chart data
  return (
    <Line className="p-6 bg-gray-500/10 rounded-lg" data={chartData} />
  );
}
