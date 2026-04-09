import React, { useState } from "react";

const elementsList = [
  "Al", "As", "B", "C", "Ca", "Ce", "Co", "Cr", "Cu", "Fe",
  "La", "Mg", "Mn", "Mo", "N", "Nb", "Ni", "O", "P", "Pb",
  "S", "Se", "Si", "Sn", "Ta", "Ti", "V", "W", "Zn", "Zr",
];

function ComparisonInput({ onCompare, loading, originalComposition }) {
  const [compositions, setCompositions] = useState([
    {},
    {}
  ]);
  const [comparisonName, setComparisonName] = useState("My Comparison");

  const handleCompositionChange = (index, element, value) => {
    const updated = [...compositions];
    updated[index] = {
      ...updated[index],
      [element]: value === "" ? undefined : parseFloat(value) || 0,
    };
    setCompositions(updated);
  };

  const handleAddComposition = () => {
    setCompositions([...compositions, {}]);
  };

  const handleRemoveComposition = (index) => {
    if (compositions.length > 2) {
      setCompositions(compositions.filter((_, i) => i !== index));
    }
  };

  const handleUseCurrentAsBaseline = () => {
    if (originalComposition) {
      setCompositions([originalComposition, {}]);
    }
  };

  const handleCompare = () => {
    const filledCompositions = compositions.filter(
      (comp) => Object.values(comp).some((v) => v && v !== 0)
    );

    if (filledCompositions.length < 2) {
      alert("Please enter at least 2 compositions for comparison");
      return;
    }

    onCompare(filledCompositions, comparisonName);
  };

  return (
    <div className="space-y-6">
      {/* Comparison Name */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Comparison Name
        </label>
        <input
          type="text"
          value={comparisonName}
          onChange={(e) => setComparisonName(e.target.value)}
          placeholder="e.g., Alloy A vs B vs C"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Actions */}
      {originalComposition && (
        <div>
          <button
            onClick={handleUseCurrentAsBaseline}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm"
          >
            Use Current Composition as Baseline
          </button>
        </div>
      )}

      {/* Compositions Input */}
      <div className="space-y-4">
        {compositions.map((comp, compIdx) => (
          <div key={compIdx} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Composition {compIdx + 1} {compIdx === 0 ? "(Baseline)" : ""}
              </h3>
              {compositions.length > 2 && (
                <button
                  onClick={() => handleRemoveComposition(compIdx)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Element Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {elementsList.map((element) => (
                <div key={element}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {element}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={comp[element] !== undefined ? comp[element] : ""}
                    onChange={(e) =>
                      handleCompositionChange(compIdx, element, e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Total Sum */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-700">
                Total: <span className="text-blue-600">
                  {Object.values(comp).reduce((a, b) => (a || 0) + (b || 0), 0).toFixed(2)}%
                </span>
              </p>
              {Object.values(comp).reduce((a, b) => (a || 0) + (b || 0), 0) > 100 && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Total exceeds 100% - will be normalized during comparison
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Composition Button */}
      <button
        onClick={handleAddComposition}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition font-semibold"
      >
        + Add Another Composition
      </button>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Comparing..." : "Compare Compositions"}
      </button>
    </div>
  );
}

export default ComparisonInput;
