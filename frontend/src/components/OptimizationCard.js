import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function OptimizationCard({ optimization, deviation, originalComposition }) {
  if (!optimization) return null;

  // Prepare comparison data
  const compositionData = Object.entries(optimization.composition || {}).map(
    ([key, val]) => ({
      name: key,
      optimized: parseFloat(val).toFixed(1),
      original: originalComposition?.[key] ? parseFloat(originalComposition[key]).toFixed(1) : 0,
    })
  );

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-navy-500 mr-2"></span>
              <span className="text-slate-700">Original:</span>
              <span className="font-semibold text-navy-600 ml-1">{data.original}%</span>
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-gold-400 mr-2"></span>
              <span className="text-slate-700">Optimized:</span>
              <span className="font-semibold text-gold-600 ml-1">{data.optimized}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="section-title">✨ Composition Overview</h3>

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-medium text-slate-600 mb-1">New Strength</p>
          <p className="text-2xl font-bold text-emerald-600">
            {optimization.new_strength?.toFixed(0)} MPa
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs font-medium text-slate-600 mb-1">New Melting Temp</p>
          <p className="text-2xl font-bold text-blue-600">
            {optimization.new_melting_temp?.toFixed(0)}°C
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-slate-700 mb-4">Element Composition Comparison</p>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={compositionData}
              margin={{ top: 30, right: 30, left: 0, bottom: 60 }}
            >
              <defs>
                <linearGradient id="navyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f3a5f" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#152540" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4c542" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e6b800" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#cbd5e1"
                opacity={0.4}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: "13px", fontWeight: "500" }}
                tick={{ fill: "#475569" }}
              />

              <YAxis
                stroke="#64748b"
                style={{ fontSize: "13px" }}
                tick={{ fill: "#475569" }}
                label={{ value: "Composition (%)", angle: -90, position: "insideLeft" }}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100,116,139,0.1)" }} />

              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                contentStyle={{
                  paddingTop: "15px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              />

              <Bar
                dataKey="original"
                name="Original"
                fill="url(#navyGradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              />

              <Bar
                dataKey="optimized"
                name="Optimized"
                fill="url(#goldGradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-blue-600">💡 Tip:</span> Hover over bars to see detailed
          comparison values between original and optimized compositions.
        </p>
      </div>
    </div>
  );
}

export default OptimizationCard;
