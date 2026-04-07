import React, { useState } from "react";
import { predictAlloy } from "../services/api";

// All 30 elements
const ALL_ELEMENTS = [
  "Al", "As", "B", "C", "Ca", "Ce", "Co", "Cr", "Cu", "Fe",
  "La", "Mg", "Mn", "Mo", "N", "Nb", "Ni", "O", "P", "Pb",
  "S", "Se", "Si", "Sn", "Ta", "Ti", "V", "W", "Zn", "Zr"
];

// Element categories for smart randomization
const ELEMENT_CATEGORIES = {
  dominant: ["Fe"], // Should be 40-90%
  major: ["Cr", "Ni", "Mn", "Si", "Co", "Mo", "Cu", "Ti"], // 0-15%
  minor: ["P", "S", "C", "N", "O", "Pb", "As", "Se"], // 0-5%
  rare: ["Al", "Mg", "Ca", "Ta", "Nb", "Zr", "W", "V", "B", "La", "Ce", "Sn", "Zn"] // 0-5%
};

// Smart random value generator
const getRandomValue = (element) => {
  if (ELEMENT_CATEGORIES.dominant.includes(element)) {
    return parseFloat((Math.random() * 50 + 40).toFixed(2)); // 40-90
  } else if (ELEMENT_CATEGORIES.major.includes(element)) {
    return parseFloat((Math.random() * 15).toFixed(2)); // 0-15
  } else if (ELEMENT_CATEGORIES.minor.includes(element)) {
    return parseFloat((Math.random() * 5).toFixed(2)); // 0-5
  } else if (ELEMENT_CATEGORIES.rare.includes(element)) {
    return parseFloat((Math.random() * 5).toFixed(2)); // 0-5
  }
  return parseFloat((Math.random() * 3).toFixed(2)); // 0-3
};

// Generate sample data with 2 modes: normalized (100%) or under-composition (<100%)
// CONSTRAINT: Never exceeds 100%
const generateSampleData = () => {
  const sampleData = {};
  ALL_ELEMENTS.forEach(element => {
    sampleData[element] = getRandomValue(element);
  });
  
  // Randomly pick generation mode: 0=normalize to 100%, 1=under-composition (<100%)
  const mode = Math.floor(Math.random() * 2);
  
  const total = Object.values(sampleData).reduce((sum, val) => sum + val, 0);
  
  if (mode === 0) {
    // MODE 0: Normalize to exactly 100%
    if (total > 0) {
      ALL_ELEMENTS.forEach(element => {
        sampleData[element] = parseFloat(((sampleData[element] / total) * 100).toFixed(2));
      });
      
      // Fix floating-point sum errors by adjusting the largest element
      const roundedTotal = Object.values(sampleData).reduce((sum, val) => sum + val, 0);
      if (Math.abs(roundedTotal - 100) > 0.01) {
        let maxElement = ALL_ELEMENTS[0];
        let maxValue = sampleData[maxElement];
        ALL_ELEMENTS.forEach(el => {
          if (sampleData[el] > maxValue) {
            maxValue = sampleData[el];
            maxElement = el;
          }
        });
        const adjustment = 100 - roundedTotal;
        sampleData[maxElement] = parseFloat((sampleData[maxElement] + adjustment).toFixed(2));
      }
    }
  } else {
    // MODE 1: Under-composition (scale to 50-95% - always less than 100%)
    if (total > 0) {
      const scaleFactor = (Math.random() * 0.45) + 0.5; // 50-95%
      ALL_ELEMENTS.forEach(element => {
        sampleData[element] = parseFloat(((sampleData[element] / total) * 100 * scaleFactor).toFixed(2));
      });
    }
  }
  
  return { data: sampleData, mode };
};

function InputCard({ setResult, setOriginalComposition, setLoading, setError }) {
  const [values, setValues] = useState(Object.fromEntries(ALL_ELEMENTS.map(e => [e, ""])));
  const [targetStrength, setTargetStrength] = useState("");
  const [animatingElements, setAnimatingElements] = useState(new Set());
  const [generationMode, setGenerationMode] = useState(null); // Track generation mode

  const handleChange = (e, element) => {
    const val = e.target.value;
    if (val === "" || (!isNaN(val) && parseFloat(val) >= 0)) {
      setValues({ ...values, [element]: val });
    }
  };

  const loadSampleData = () => {
    const { data: newData, mode } = generateSampleData();
    setValues(newData);
    setGenerationMode(mode); // Track mode
    
    // Animate all elements
    setAnimatingElements(new Set(ALL_ELEMENTS));
    setTimeout(() => setAnimatingElements(new Set()), 600);
  };

  const resetForm = () => {
    setValues(Object.fromEntries(ALL_ELEMENTS.map(e => [e, ""])));
    setTargetStrength("");
    setGenerationMode(null);
    setError(null);
  };

  // Calculate total composition
  const total = Object.values(values).reduce((sum, val) => {
    return sum + (val !== "" ? parseFloat(val) : 0);
  }, 0);

  const validateInputs = () => {
    const filledElements = Object.values(values).filter(v => v !== "");
    if (filledElements.length === 0) {
      setError("Please enter at least one element composition");
      return false;
    }
    for (let val of Object.values(values)) {
      if (val !== "" && (isNaN(val) || parseFloat(val) < 0 || parseFloat(val) > 100)) {
        setError("All values must be between 0 and 100");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    const filledData = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "")
    );

    // Store original composition for comparison
    const originalComp = {};
    Object.entries(filledData).forEach(([key, val]) => {
      originalComp[key] = parseFloat(val);
    });
    setOriginalComposition(originalComp);

    setLoading(true);
    try {
      const res = await predictAlloy(filledData);
      setResult(res.data);
    } catch (err) {
      setError(`API Error: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-navy-500">🔬 Alloy Composition (%)</h2>
        <button 
          onClick={loadSampleData}
          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-all duration-200 border border-amber-200 hover:border-amber-300"
        >
          📋 Load Sample
        </button>
      </div>
      
      {/* Composition Grid */}
      <div className="mb-6 pb-6 border-b border-slate-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {ALL_ELEMENTS.map(el => (
            <div 
              key={el}
              className={`transition-all duration-500 ${
                animatingElements.has(el) 
                  ? "transform scale-105 bg-amber-50 rounded-lg p-2" 
                  : "p-2"
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                {el}
              </label>
              <input
                type="number"
                placeholder="0.0"
                value={values[el]}
                onChange={(e) => handleChange(e, el)}
                className="w-full px-2 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Total Composition Warning */}
      {total > 0 && (
        <div className={`mb-6 p-3 rounded-lg transition-all ${
          total > 100
            ? "bg-red-50 border border-red-300 text-red-700"
            : total < 100
            ? "bg-yellow-50 border border-yellow-300 text-yellow-700"
            : "bg-blue-50 border border-blue-300 text-blue-700"
        }`}>
          <p className="text-sm font-medium">
            {total > 100 
              ? "⚠️ Total exceeds 100%"
              : total < 100
              ? "📊 Under-composition (< 100%)"
              : "✅ Perfect composition (= 100%)"}
            <span className="font-bold ml-2">{total.toFixed(2)}%</span>
          </p>
          {generationMode !== null && (
            <p className="text-xs text-slate-600 mt-1">
              Generated mode: {
                generationMode === 0 ? "Normalized (= 100%)" :
                "Under-composition (50-95%)"
              }
            </p>
          )}
        </div>
      )}

      {/* Target Strength */}
      <div className="mb-6 pb-6 border-b border-slate-300">
        <label className="block text-sm font-medium text-slate-700 mb-2">Target Strength (MPa) - Optional</label>
        <input
          type="number"
          placeholder="e.g., 850"
          value={targetStrength}
          onChange={(e) => setTargetStrength(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={handleSubmit}
          className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          ⚡ Analyze Alloy
        </button>
        <button 
          onClick={resetForm}
          className="px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default InputCard;
