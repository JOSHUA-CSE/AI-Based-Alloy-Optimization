import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ComparisonChart({ comparisonData }) {
  const [chartType, setChartType] = useState("strength");

  if (!comparisonData || !comparisonData.results || comparisonData.results.length === 0) {
    return <div className="text-center text-gray-500">No comparison data available</div>;
  }

  const results = comparisonData.results;

  // Prepare data for charts
  const chartData = results.map((result, idx) => ({
    name: idx === 0 ? "Baseline" : `Comp ${idx + 1}`,
    strength: result.strength,
    melting_temp: result.melting_temp / 10, // Scale down for visualization
    confidence: result.confidence,
  }));

  const strengthDeltaData = results.map((result, idx) => ({
    name: idx === 0 ? "Baseline" : `Comp ${idx + 1}`,
    delta: result.vs_baseline ? result.vs_baseline.strength_delta : 0,
    pct_change: result.vs_baseline ? result.vs_baseline.strength_percent_change : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setChartType("strength")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            chartType === "strength"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Strength Comparison
        </button>
        <button
          onClick={() => setChartType("temperature")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            chartType === "temperature"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Melting Temperature
        </button>
        <button
          onClick={() => setChartType("delta")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            chartType === "delta"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Strength Delta vs Baseline
        </button>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {chartType === "strength" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Strength Comparison (MPa)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                  formatter={(value) => value.toFixed(2)}
                />
                <Bar dataKey="strength" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {chartType === "temperature" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Melting Temperature Comparison (°C / 10)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                  formatter={(value) => (value * 10).toFixed(2)}
                />
                <Bar dataKey="melting_temp" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {chartType === "delta" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Strength Change vs Baseline (MPa)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={strengthDeltaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                  formatter={(value, name) => {
                    if (name === "delta") return value.toFixed(2) + " MPa";
                    if (name === "pct_change") return value.toFixed(1) + "%";
                    return value;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="delta"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 5 }}
                  name="Strength Delta (MPa)"
                />
                <Line
                  type="monotone"
                  dataKey="pct_change"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  yAxisId="right"
                  name="Percent Change (%)"
                />
                <YAxis yAxisId="right" orientation="right" />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Element Composition Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Element Composition Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left font-semibold">Element</th>
                {results.map((result, idx) => (
                  <th key={idx} className="px-4 py-2 text-center font-semibold">
                    {idx === 0 ? "Baseline" : `Comp ${idx + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Show top 10 elements by average presence */}
              {Object.entries(
                results.reduce((acc, result) => {
                  Object.entries(result.composition).forEach(([el, val]) => {
                    if (!acc[el]) acc[el] = [];
                    acc[el].push(val);
                  });
                  return acc;
                }, {})
              )
                .map(([el, values]) => ({
                  element: el,
                  avg: values.reduce((a, b) => a + b, 0) / values.length,
                  values,
                }))
                .sort((a, b) => b.avg - a.avg)
                .slice(0, 10)
                .map(({ element, values }) => (
                  <tr key={element} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-700">{element}</td>
                    {values.map((val, idx) => (
                      <td
                        key={idx}
                        className={`px-4 py-2 text-center font-mono ${
                          val > 10
                            ? "bg-red-100"
                            : val > 5
                              ? "bg-orange-100"
                              : val > 1
                                ? "bg-yellow-100"
                                : "bg-green-100"
                        }`}
                      >
                        {val.toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComparisonChart;
