import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function OptimizationChart({ opt }) {
  const data = Object.entries(opt.composition).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  return (
    <div className="card">
      <h2>Optimized Composition</h2>

      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>

      <p>New Strength: {opt.new_strength.toFixed(2)}</p>
      <p>New Melting Temp: {opt.new_melting_temp.toFixed(2)}</p>
    </div>
  );
}

export default OptimizationChart;
