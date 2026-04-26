import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function ClusterPieChart({ distribution = {} }) {
  const labels = Object.keys(distribution);
  const values = Object.values(distribution);

  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ["#34d399", "#38bdf8", "#f59e0b"],
            borderColor: "#08111f",
            borderWidth: 4,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            labels: {
              color: "#cbd5e1",
            },
          },
        },
      }}
    />
  );
}

export function SimilarityBarChart({ items = [] }) {
  return (
    <Bar
      data={{
        labels: items.map((item) => item.label),
        datasets: [
          {
            label: "Similarity",
            data: items.map((item) => item.score * 100),
            backgroundColor: "#38bdf8",
            borderRadius: 10,
          },
        ],
      }}
      options={{
        scales: {
          x: {
            ticks: { color: "#cbd5e1" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(148, 163, 184, 0.15)" },
          },
        },
        plugins: {
          legend: {
            labels: { color: "#cbd5e1" },
          },
        },
      }}
    />
  );
}
