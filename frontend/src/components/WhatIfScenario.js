import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { runWhatIfScenario } from "../services/api";

function WhatIfScenario({ data, originalComposition }) {
  const [selectedElement, setSelectedElement] = useState("Fe");
  const [variationPercentage, setVariationPercentage] = useState(1.0);
  const [numSteps, setNumSteps] = useState(21);
  const [scenarioResults, setScenarioResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyType, setPropertyType] = useState("strength");

  const handleRunScenario = async () => {
    try {
      setLoading(true);
      setError(null);

      const scenarioName = `What-If: Varying ${selectedElement} ±${variationPercentage}%`;

      const response = await runWhatIfScenario(
        originalComposition,
        selectedElement,
        variationPercentage,
        numSteps,
        scenarioName
      );

      setScenarioResults(response.data.scenario);
    } catch (err) {
      setError(err.response?.data?.error || "Error running what-if scenario");
      console.error("What-if error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data based on selected property
  const chartData = scenarioResults?.variations.map((variation, idx) => ({
    index: idx,
    element_pct: variation.element_percentage,
    strength: variation.strength,
    strength_delta: variation.strength_delta,
    melting_temp: variation.melting_temp,
    melting_temp_delta: variation.melting_temp_delta,
  })) || [];

  const elementsList = [
    "Al", "As", "B", "C", "Ca", "Ce", "Co", "Cr", "Cu", "Fe",
    "La", "Mg", "Mn", "Mo", "N", "Nb", "Ni", "O", "P", "Pb",
    "S", "Se", "Si", "Sn", "Ta", "Ti", "V", "W", "Zn", "Zr",
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">What-If Scenario Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Element Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Element to Vary
            </label>
            <select
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {elementsList.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </div>

          {/* Variation Percentage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Variation Range (±%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={variationPercentage}
                onChange={(e) => setVariationPercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 font-semibold">%</span>
            </div>
          </div>

          {/* Number of Steps */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Simulation Points
            </label>
            <select
              value={numSteps}
              onChange={(e) => setNumSteps(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={11}>11 points</option>
              <option value={21}>21 points (recommended)</option>
              <option value={31}>31 points</option>
              <option value={51}>51 points (detailed)</option>
            </select>
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunScenario}
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Running..." : "Run Scenario"}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold text-gray-700 mb-2">Quick Presets:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setVariationPercentage(0.1);
                handleRunScenario();
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition"
            >
              ±0.1%
            </button>
            <button
              onClick={() => {
                setVariationPercentage(0.5);
                handleRunScenario();
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition"
            >
              ±0.5%
            </button>
            <button
              onClick={() => {
                setVariationPercentage(1.0);
                handleRunScenario();
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition"
            >
              ±1%
            </button>
            <button
              onClick={() => {
                setVariationPercentage(5.0);
                handleRunScenario();
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition"
            >
              ±5%
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {scenarioResults && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900">Element Varied</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{scenarioResults.element_name}</p>
              <p className="text-xs text-blue-700 mt-2">
                Range: {scenarioResults.variation_range.min}% to {scenarioResults.variation_range.max}%
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900">Baseline Strength</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {scenarioResults.baseline_strength.toFixed(2)} MPa
              </p>
              <p className="text-xs text-green-700 mt-2">Current composition</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900">Strength Sensitivity</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {scenarioResults.strength_sensitivity.toFixed(4)} MPa/%
              </p>
              <p className="text-xs text-orange-700 mt-2">Change per 1% element change</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900">Temperature Sensitivity</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {scenarioResults.melting_temp_sensitivity.toFixed(4)} °C/%
              </p>
              <p className="text-xs text-purple-700 mt-2">Temperature change per 1%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-4">
            {/* Property Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setPropertyType("strength")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  propertyType === "strength"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Strength
              </button>
              <button
                onClick={() => setPropertyType("temperature")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  propertyType === "temperature"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Melting Temperature
              </button>
              <button
                onClick={() => setPropertyType("both")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  propertyType === "both"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Both (Normalized)
              </button>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {propertyType === "strength" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Strength vs {scenarioResults.element_name}%
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="element_pct"
                        label={{ value: `${scenarioResults.element_name} (%)`, position: "insideBottomRight", offset: -5 }}
                      />
                      <YAxis label={{ value: "Strength (MPa)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                        formatter={(value) => value.toFixed(2)}
                        labelFormatter={(label) => `${label.toFixed(2)}%`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="strength"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        name="Strength (MPa)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {propertyType === "temperature" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Melting Temperature vs {scenarioResults.element_name}%
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="element_pct"
                        label={{ value: `${scenarioResults.element_name} (%)`, position: "insideBottomRight", offset: -5 }}
                      />
                      <YAxis label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                        formatter={(value) => value.toFixed(2)}
                        labelFormatter={(label) => `${label.toFixed(2)}%`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="melting_temp"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={false}
                        name="Temperature (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {propertyType === "both" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Property Sensitivity Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="element_pct"
                        label={{ value: `${scenarioResults.element_name} (%)`, position: "insideBottomRight", offset: -5 }}
                      />
                      <YAxis label={{ value: "Delta from Baseline", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                        formatter={(value) => value.toFixed(2)}
                        labelFormatter={(label) => `${label.toFixed(2)}%`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="strength_delta"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="Strength Delta (MPa)"
                      />
                      <Line
                        type="monotone"
                        dataKey="melting_temp_delta"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={false}
                        name="Temperature Delta (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>

          {/* Optimal Range Indicator */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Sensitivity Analysis</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Strength Sensitivity:</span>{" "}
                <span
                  className={`font-bold ${
                    Math.abs(scenarioResults.strength_sensitivity) > 10
                      ? "text-orange-600"
                      : Math.abs(scenarioResults.strength_sensitivity) > 5
                        ? "text-gray-600"
                        : "text-green-600"
                  }`}
                >
                  {scenarioResults.strength_sensitivity > 0 ? "↑" : "↓"}
                  {Math.abs(scenarioResults.strength_sensitivity).toFixed(4)} MPa per 1% {scenarioResults.element_name}
                </span>
              </p>
              <p className="text-gray-600">
                {scenarioResults.strength_sensitivity > 0
                  ? "Increasing this element improves strength."
                  : "Decreasing this element improves strength."}
              </p>
            </div>
          </div>

          {/* Variation Table */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Variations</h4>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left font-semibold">{scenarioResults.element_name}%</th>
                  <th className="px-4 py-2 text-center font-semibold">Strength (MPa)</th>
                  <th className="px-4 py-2 text-center font-semibold">Delta</th>
                  <th className="px-4 py-2 text-center font-semibold">Temp (°C)</th>
                  <th className="px-4 py-2 text-center font-semibold">Temp Delta</th>
                </tr>
              </thead>
              <tbody>
                {scenarioResults.variations.map((variation, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{variation.element_percentage.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{variation.strength.toFixed(2)}</td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${
                        variation.strength_delta > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {variation.strength_delta > 0 ? "+" : ""}
                      {variation.strength_delta.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">{variation.melting_temp.toFixed(2)}</td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${
                        variation.melting_temp_delta > 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {variation.melting_temp_delta > 0 ? "+" : ""}
                      {variation.melting_temp_delta.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatIfScenario;
