import React, { useState } from "react";

function ComparisonTable({ comparisonData }) {
  const [selectedProperties, setSelectedProperties] = useState(["strength"]);

  if (!comparisonData || !comparisonData.results || comparisonData.results.length === 0) {
    return <div className="text-center text-gray-500">No comparison data available</div>;
  }

  const results = comparisonData.results;
  const baseline = results[0];

  // Get unique elements to display (top 15 by average presence)
  const elementAverages = {};
  results.forEach((result) => {
    Object.entries(result.composition).forEach(([element, value]) => {
      if (!elementAverages[element]) elementAverages[element] = 0;
      elementAverages[element] += value;
    });
  });

  const topElements = Object.entries(elementAverages)
    .map(([el, sum]) => ({ element: el, avg: sum / results.length }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
    .map((x) => x.element);

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="px-4 py-3 text-left font-semibold">Composition</th>
              {topElements.map((el) => (
                <th key={el} className="px-4 py-3 text-center font-semibold text-sm">
                  {el}%
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold">Strength (MPa)</th>
              <th className="px-4 py-3 text-center font-semibold">Melting Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr
                key={idx}
                className={`border-b transition-colors hover:bg-blue-50 ${
                  idx === 0 ? "bg-yellow-50 border-2 border-yellow-300" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {idx === 0 ? "Baseline" : `Composition ${idx + 1}`}
                </td>
                {topElements.map((el) => (
                  <td key={el} className="px-4 py-3 text-center text-sm">
                    <span className="font-mono">{result.composition[el]?.toFixed(2) || "0.00"}%</span>
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-semibold text-blue-600">
                  {result.strength.toFixed(2)}
                  {result.vs_baseline && (
                    <div
                      className={`text-xs font-semibold ${
                        result.vs_baseline.strength_delta >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.vs_baseline.strength_delta >= 0 ? "↑" : "↓"}
                      {Math.abs(result.vs_baseline.strength_delta).toFixed(2)} (
                      {result.vs_baseline.strength_percent_change > 0 ? "+" : ""}
                      {result.vs_baseline.strength_percent_change.toFixed(1)}%)
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">
                  {result.melting_temp.toFixed(2)}
                  {result.vs_baseline && (
                    <div
                      className={`text-xs font-semibold ${
                        result.vs_baseline.melting_temp_delta >= 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {result.vs_baseline.melting_temp_delta >= 0 ? "↑" : "↓"}
                      {Math.abs(result.vs_baseline.melting_temp_delta).toFixed(2)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Strength */}
        <div
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md"
        >
          <p className="text-sm font-semibold opacity-90">Best Strength (MPa)</p>
          <p className="text-3xl font-bold mt-2">
            {Math.max(...results.map((r) => r.strength)).toFixed(2)}
          </p>
          <p className="text-xs mt-2 opacity-75">
            Composition{" "}
            {results.indexOf(results.reduce((max, r) => (r.strength > max.strength ? r : max))) + 1}
          </p>
        </div>

        {/* Best Temperature */}
        <div
          className="bg-gradient-to-br from-warninge-500 to-orange-600 text-white rounded-lg p-6 shadow-md"
        >
          <p className="text-sm font-semibold opacity-90">Lowest Melting Point (°C)</p>
          <p className="text-3xl font-bold mt-2">
            {Math.min(...results.map((r) => r.melting_temp)).toFixed(2)}
          </p>
          <p className="text-xs mt-2 opacity-75">
            Composition{" "}
            {results.indexOf(results.reduce((min, r) => (r.melting_temp < min.melting_temp ? r : min))) + 1}
          </p>
        </div>

        {/* Composition Count */}
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md"
        >
          <p className="text-sm font-semibold opacity-90">Compared Compositions</p>
          <p className="text-3xl font-bold mt-2">{results.length}</p>
          <p className="text-xs mt-2 opacity-75">Total in comparison</p>
        </div>
      </div>
    </div>
  );
}

export default ComparisonTable;
