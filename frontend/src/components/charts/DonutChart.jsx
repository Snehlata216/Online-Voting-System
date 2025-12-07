import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ["#0ea5a4", "#06b6d4", "#f97316", "#ef4444", "#6366f1", "#f59e0b"];

export default function DonutChart({ candidates = [] }) {
  const labels = candidates.map((c) => c.name ?? `#${c.candidateId}`);
  const data = {
    labels,
    datasets: [
      {
        data: candidates.map((c) => Number(c.totalVotes) || 0),
        backgroundColor: candidates.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#0b1220", font: { size: 13 } } },
      tooltip: { bodyFont: { size: 13 } },
    },
  };

  return <div className="chart-container donut"><Doughnut data={data} options={options} /></div>;
}
