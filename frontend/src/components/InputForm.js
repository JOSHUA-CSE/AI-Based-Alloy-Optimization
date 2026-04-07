import React, { useState } from "react";
import { predictAlloy } from "../services/api";
import "../styles/input-form.css";

const elements = [
  "Fe", "C", "Cr", "Ni", "Mn", "Si", "P", "S", "Al", "Mo"
];

const SAMPLE_DATA = [
  {
    name: "Stainless Steel",
    composition: { Fe: 70.5, C: 0.08, Cr: 18.5, Ni: 8.0, Mn: 2.0, Si: 0.75, P: 0.045, S: 0.03, Al: 0.1, Mo: 0 }
  },
  {
    name: "Tool Steel",
    composition: { Fe: 86.0, C: 1.2, Cr: 5.0, Ni: 0, Mn: 0.8, Si: 0.3, P: 0.03, S: 0.03, Al: 0, Mo: 1.0 }
  },
  {
    name: "High Nickel Alloy",
    composition: { Fe: 50.0, C: 0.1, Cr: 20.0, Ni: 25.0, Mn: 1.5, Si: 1.0, P: 0.02, S: 0.02, Al: 2.0, Mo: 0.5 }
  },
  {
    name: "Low Carbon Steel",
    composition: { Fe: 98.5, C: 0.2, Cr: 0.5, Ni: 0.3, Mn: 0.8, Si: 0.15, P: 0.02, S: 0.02, Al: 0, Mo: 0 }
  },
  {
    name: "Aluminum Alloy",
    composition: { Fe: 60.0, C: 0.05, Cr: 2.0, Ni: 5.0, Mn: 2.5, Si: 3.0, P: 0.01, S: 0.01, Al: 27.0, Mo: 0.5 }
  }
];

function InputForm({ setResult, setOriginalComposition }) {
  const [values, setValues] = useState(
    Object.fromEntries(elements.map(e => [e, 0]))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  const handleChange = (e, el) => {
    setValues({ ...values, [el]: parseFloat(e.target.value) });
  };

  const loadSampleData = () => {
    const nextIndex = (currentSampleIndex + 1) % SAMPLE_DATA.length;
    setCurrentSampleIndex(nextIndex);
    setValues(SAMPLE_DATA[nextIndex].composition);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    // Store original composition for comparison
    setOriginalComposition(values);

    try {
      const res = await predictAlloy(values);
      setResult(res.data);
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
        <h2>⚙️ Alloy Composition</h2>
        <button onClick={loadSampleData} className="sample-btn" title="Load sample data">
          📋 Sample ({SAMPLE_DATA[currentSampleIndex].name})
        </button>
      </div>

      <div className="sliders-container">
        {elements.map(el => (
          <div key={el} className="slider">
            <label className="slider-label">{el}</label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={values[el]}
              onChange={(e) => handleChange(e, el)}
              className="slider-input"
            />
            <span className="slider-value">{values[el].toFixed(2)}</span>
          </div>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="submit-btn">
        {loading ? "🔄 Analyzing..." : "🚀 Predict"}
      </button>
    </div>
  );
}

export default InputForm;
