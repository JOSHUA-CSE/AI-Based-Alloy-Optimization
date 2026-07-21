import React, { useState } from "react";
import { predictAlloy, readOpcuaComposition } from "../services/api";

const ALL_ELEMENTS = [
  "Al", "As", "B", "C", "Ca", "Ce", "Co", "Cr", "Cu", "Fe",
  "La", "Mg", "Mn", "Mo", "N", "Nb", "Ni", "O", "P", "Pb",
  "S", "Se", "Si", "Sn", "Ta", "Ti", "V", "W", "Zn", "Zr",
];

const emptyValues = () => Object.fromEntries(ALL_ELEMENTS.map(element => [element, ""]));

const getApiErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data) return err.message || "Unable to read OPC-UA values";

  const endpointErrors = data.details?.attempted_endpoints;
  if (endpointErrors) {
    const attempts = Object.entries(endpointErrors)
      .map(([endpoint, message]) => `${endpoint}: ${message}`)
      .join("; ");
    return `${data.error} ${attempts}`;
  }

  return data.error || data.detail || err.message || "Unable to read OPC-UA values";
};

function InputCard({ setResult, setOriginalComposition, setLoading, setError }) {
  const [values, setValues] = useState(emptyValues());
  const [animatingElements, setAnimatingElements] = useState(new Set());
  const [targetStrength, setTargetStrength] = useState("");
  const [refreshingOpcua, setRefreshingOpcua] = useState(false);

  const handleChange = (event, element) => {
    const value = event.target.value;
    if (value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0)) {
      setValues({ ...values, [element]: value });
    }
  };

  const refreshFromOpcua = async () => {
    setRefreshingOpcua(true);
    setError(null);

    try {
      const response = await readOpcuaComposition();
      const opcuaValues = response.data || {};
      const nextValues = Object.fromEntries(
        ALL_ELEMENTS.map(element => {
          const rawValue = opcuaValues[element];
          const value = rawValue === undefined || rawValue === null
            ? ""
            : Number(rawValue).toFixed(2);

          return [element, value];
        })
      );

      setValues(nextValues);
      setAnimatingElements(new Set(ALL_ELEMENTS));
      setTimeout(() => setAnimatingElements(new Set()), 600);
    } catch (err) {
      setError(`OPC-UA Error: ${getApiErrorMessage(err)}`);
      console.error(err);
    } finally {
      setRefreshingOpcua(false);
    }
  };

  const resetForm = () => {
    setValues(emptyValues());
    setTargetStrength("");
    setError(null);
  };

  const total = Object.values(values).reduce((sum, value) => {
    return sum + (value !== "" ? Number(value) : 0);
  }, 0);

  const validateInputs = () => {
    const filledElements = Object.values(values).filter(value => value !== "");
    if (filledElements.length === 0) {
      setError("Please enter at least one element composition");
      return false;
    }

    for (const value of Object.values(values)) {
      if (value !== "" && (Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
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
      Object.entries(values).filter(([, value]) => value !== "")
    );

    const originalComp = {};
    Object.entries(filledData).forEach(([key, value]) => {
      originalComp[key] = Number(value);
    });
    setOriginalComposition(originalComp);

    setLoading(true);
    try {
      const payload = { ...filledData };
      if (targetStrength !== "") payload.target_strength = Number(targetStrength);
      const response = await predictAlloy(payload);
      setResult(response.data);
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
        <h2 className="text-xl font-semibold text-navy-500">Alloy Composition (%)</h2>
        <button
          onClick={refreshFromOpcua}
          disabled={refreshingOpcua}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed text-blue-700 font-medium rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
        >
          {refreshingOpcua ? "Refreshing..." : "Refresh OPC-UA"}
        </button>
      </div>

      <div className="mb-6 pb-6 border-b border-slate-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {ALL_ELEMENTS.map(element => (
            <div
              key={element}
              className={`transition-all duration-500 ${
                animatingElements.has(element)
                  ? "transform scale-105 bg-blue-50 rounded-lg p-2"
                  : "p-2"
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                {element}
              </label>
              <input
                type="number"
                placeholder="0.0"
                value={values[element]}
                onChange={(event) => handleChange(event, element)}
                className="w-full px-2 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

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
              ? "Total exceeds 100%"
              : total < 100
                ? "Under-composition (< 100%)"
                : "Perfect composition (= 100%)"}
            <span className="font-bold ml-2">{total.toFixed(2)}%</span>
          </p>
        </div>
      )}

      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Target Tensile Strength (psi)
          <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">optional</span>
        </label>
        <input
          type="number"
          min="0"
          step="100"
          placeholder="e.g. 90000"
          value={targetStrength}
          onChange={(event) => setTargetStrength(event.target.value)}
          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        {targetStrength && (
          <p className="mt-1 text-xs text-blue-600">
            AI will find the closest achievable composition to {Number(targetStrength).toLocaleString()} psi
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Analyze Alloy
        </button>
        <button
          onClick={resetForm}
          className="px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-all duration-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default InputCard;
