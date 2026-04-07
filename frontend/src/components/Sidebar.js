import React, { useState } from "react";
import { predictAlloy } from "../services/api";
import "../styles/sidebar.css";

const elements = ["Fe", "C", "Cr", "Ni", "Mn", "Si", "P", "S", "Al", "Mo"];

function Sidebar({ setResult, setLoading, setError }) {
  const [values, setValues] = useState(
    Object.fromEntries(elements.map(e => [e, ""]))
  );
  const [targetStrength, setTargetStrength] = useState("");
  const [constraints, setConstraints] = useState("");

  const handleChange = (e, element) => {
    const value = e.target.value;
    if (value === "" || !isNaN(value)) {
      setValues({ ...values, [element]: value });
    }
  };

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
    <aside className="sidebar">
      <div className="sidebar-content">
        <section className="input-section">
          <h2>Alloy Composition</h2>
          <div className="input-grid">
            {elements.map(el => (
              <div key={el} className="input-group">
                <label>{el} %</label>
                <input
                  type="text"
                  placeholder="0-100"
                  value={values[el]}
                  onChange={(e) => handleChange(e, el)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="input-section">
          <h3>Optional Parameters</h3>
          <div className="input-group">
            <label>Target Strength (MPa)</label>
            <input
              type="text"
              placeholder="e.g., 500"
              value={targetStrength}
              onChange={(e) => setTargetStrength(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Constraints</label>
            <textarea
              placeholder="e.g., C < 0.5%, Cr > 10%"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="input-field textarea"
              rows="3"
            />
          </div>
        </section>

        <button onClick={handleSubmit} className="run-btn">
          <span>⚡</span> Run Optimization
        </button>

        <div className="info-box">
          <h4>💡 Tip</h4>
          <p>Enter percentages for each element to predict alloy properties.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
