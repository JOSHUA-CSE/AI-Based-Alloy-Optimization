import React, { useState } from "react";
import { predictAlloy, readOpcuaComposition } from "../services/api";
import "../styles/input-form.css";

const elements = [
  "Fe", "C", "Cr", "Ni", "Mn", "Si", "P", "S", "Al", "Mo",
];

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

function InputForm({ setResult, setOriginalComposition }) {
  const [values, setValues] = useState(
    Object.fromEntries(elements.map(element => [element, 0]))
  );
  const [targetStrength, setTargetStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshingOpcua, setRefreshingOpcua] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event, element) => {
    setValues({ ...values, [element]: Number(event.target.value) });
  };

  const refreshFromOpcua = async () => {
    setRefreshingOpcua(true);
    setError(null);

    try {
      const response = await readOpcuaComposition();
      const opcuaValues = response.data || {};
      const nextValues = Object.fromEntries(
        elements.map(element => {
          const rawValue = opcuaValues[element];
          return [element, rawValue === undefined || rawValue === null ? 0 : Number(rawValue)];
        })
      );
      setValues(nextValues);
    } catch (err) {
      console.error(err);
      setError(`OPC-UA Error: ${getApiErrorMessage(err)}`);
    } finally {
      setRefreshingOpcua(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setOriginalComposition(values);

    try {
      const payload = { ...values };
      if (targetStrength !== "") payload.target_strength = Number(targetStrength);
      const response = await predictAlloy(payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Error calling API. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card input-form">
      <div className="form-header">
        <h2>Alloy Composition</h2>
        <button
          onClick={refreshFromOpcua}
          disabled={refreshingOpcua}
          className="sample-btn"
          title="Refresh OPC-UA values"
        >
          {refreshingOpcua ? "Refreshing..." : "Refresh OPC-UA"}
        </button>
      </div>

      <div className="sliders-container">
        {elements.map(element => (
          <div key={element} className="slider">
            <label className="slider-label">{element}</label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={values[element]}
              onChange={(event) => handleChange(event, element)}
              className="slider-input"
            />
            <span className="slider-value">{values[element].toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="target-strength-section">
        <label className="target-label">
          Target Tensile Strength (psi) <span className="optional-tag">optional</span>
        </label>
        <input
          type="number"
          min="0"
          step="100"
          placeholder="e.g. 90000"
          value={targetStrength}
          onChange={(event) => setTargetStrength(event.target.value)}
          className="target-input"
        />
        {targetStrength && (
          <p className="target-hint">
            AI will recommend a composition to achieve {Number(targetStrength).toLocaleString()} psi
          </p>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="submit-btn">
        {loading ? "Analyzing..." : "Predict"}
      </button>
    </div>
  );
}

export default InputForm;
