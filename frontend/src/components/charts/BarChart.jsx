import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const PALETTE = ["#0ea5a4", "#06b6d4", "#f97316", "#ef4444", "#6366f1", "#f59e0b", "#10b981"];

export default function BarChart({ candidates = [] }) {
  const labels = candidates.map((c) => c.name ?? `#${c.candidateId}`);
  const values = candidates.map((c) => Number(c.totalVotes) || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Votes",
        data: values,
        backgroundColor: candidates.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false, bodyFont: { size: 13 } },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#0b1220",
        font: { weight: "700", size: 12 },
        formatter: (value) => (value === 0 ? "" : value),
      },
    },
    scales: {
      x: { ticks: { color: "#0b1220", font: { size: 13 } } },
      y: {
        beginAtZero: true,
        ticks: { color: "#0b1220", font: { size: 13 }, precision: 0 },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
}
