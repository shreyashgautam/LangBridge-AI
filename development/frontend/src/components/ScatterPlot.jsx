import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const clusterColors = {
  "Pure Bengali": "#34d399",
  "Code Mixed": "#38bdf8",
  "Formal Bengali": "#f59e0b",
};

export default function ScatterPlot({ points = [] }) {
  const clusters = ["Pure Bengali", "Code Mixed", "Formal Bengali"];

  const datasets = clusters.map((cluster) => ({
    label: cluster,
    data: points.filter((point) => point.cluster === cluster).map((point) => ({ x: point.x, y: point.y, text: point.text })),
    backgroundColor: clusterColors[cluster],
    pointRadius: 6,
    pointHoverRadius: 8,
  }));

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <Scatter
        data={{ datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#cbd5e1",
              },
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const raw = context.raw;
                  return `${context.dataset.label}: ${raw.text}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#94a3b8" },
              grid: { color: "rgba(148, 163, 184, 0.15)" },
            },
            y: {
              ticks: { color: "#94a3b8" },
              grid: { color: "rgba(148, 163, 184, 0.15)" },
            },
          },
        }}
        height={360}
      />
    </div>
  );
}
