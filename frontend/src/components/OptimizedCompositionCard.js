import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/cards.css";

function OptimizedCompositionCard({ optimization, deviation }) {
  if (!optimization) return null;

  const compositionData = Object.entries(optimization.composition || {}).map(([key, val]) => ({
    name: key,
    value: parseFloat(val).toFixed(2),
  }));

  return (
    <div className="card optimization-card">
      <div className="card-header">
        <h3>✨ Optimized Alloy Composition</h3>
        <p className="card-subtitle">Recommended elemental composition for improved properties</p>
      </div>
      <div className="card-body">
        {/* Metrics */}
        <div className="optimization-metrics">
          <div className="opt-metric">
            <span className="opt-label">New Strength</span>
            <span className="opt-value">{optimization.new_strength?.toFixed(2)} MPa</span>
          </div>
          <div className="opt-metric">
            <span className="opt-label">New Melting Temp</span>
            <span className="opt-value">{optimization.new_melting_temp?.toFixed(2)} °C</span>
          </div>
          <div className="opt-metric">
            <span className="opt-label">Deviation Score</span>
            <span className="opt-value">{deviation?.toFixed(4)}</span>
          </div>
        </div>

        {/* Composition Chart */}
        <div className="composition-chart">
          <h4>Element Composition Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compositionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#e5e7eb",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Composition Table */}
        <div className="composition-table">
          <h4>Composition Details</h4>
          <div className="table-grid">
            {compositionData.map((comp, idx) => (
              <div key={idx} className="composition-item">
                <span className="element-name">{comp.name}</span>
                <span className="element-value">{comp.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptimizedCompositionCard;
