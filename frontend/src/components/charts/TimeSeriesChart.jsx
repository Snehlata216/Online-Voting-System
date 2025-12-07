import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function TimeSeriesChart({ series = [] }) {
  const labels = series.map((s) => s.label);
  const data = {
    labels,
    datasets: [
      {
        label: "Votes",
        data: series.map((s) => Number(s.value) || 0),
        borderColor: "#0ea5a4",
        backgroundColor: "rgba(14,165,164,0.12)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 13 } } },
    scales: {
      x: { ticks: { color: "#0b1220", font: { size: 12 } } },
      y: { ticks: { color: "#0b1220", font: { size: 12 } } },
    },
  };

  return <div className="chart-container time-series"><Line data={data} options={options} /></div>;
}
