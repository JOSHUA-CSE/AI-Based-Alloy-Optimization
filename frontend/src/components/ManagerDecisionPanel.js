import React, { useState } from "react";
import "../styles/manager-panel.css";

function ManagerDecisionPanel({ recommendations, originalComposition, data, onDecisionSubmit }) {
  const [editedValues, setEditedValues] = useState({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Determine if value should be increased or decreased
  const getChangeDirection = (current, suggested) => {
    const diff = suggested - current;
    if (Math.abs(diff) < 0.001) return "none";
    return diff > 0 ? "increase" : "decrease";
  };

  // Initialize edited values from recommendations
  React.useEffect(() => {
    if (recommendations && Array.isArray(recommendations)) {
      const initial = {};
      recommendations.forEach((rec) => {
        initial[rec.element] = rec.suggested_value;
      });
      setEditedValues(initial);
    }
  }, [recommendations]);

  const handleValueChange = (element, value) => {
    setEditedValues({
      ...editedValues,
      [element]: value ? parseFloat(value) : 0,
    });
  };

  const handleReset = () => {
    const initial = {};
    recommendations.forEach((rec) => {
      initial[rec.element] = rec.suggested_value;
    });
    setEditedValues(initial);
    setMessage("");
  };

  // Build changes array for payload
  const buildChangesArray = () => {
    return recommendations.map((rec) => ({
      element: rec.element,
      original: (originalComposition?.[rec.element] ?? 0),
      recommended: rec.suggested_value,
      final: editedValues[rec.element] ?? rec.suggested_value,
    }));
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const changes = buildChangesArray();
      const response = await fetch("http://localhost:8000/api/manager-decision/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_composition: originalComposition,
          ai_prediction: {
            strength: data?.prediction?.strength,
            melting_temp: data?.prediction?.melting_temp,
            confidence: data?.prediction?.confidence,
          },
          ai_recommendation: recommendations,
          changes: changes,
          decision: "approved",
          notes: notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✓ Decision approved! (ID: ${result.decision_id})`);
        if (onDecisionSubmit) {
          onDecisionSubmit("approved", result.decision_id);
        }
      } else {
        setMessage(`✗ Error: ${result.error || "Failed to approve"}`);
      }
    } catch (error) {
      setMessage(`✗ Network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const changes = buildChangesArray();
      const response = await fetch("http://localhost:8000/api/manager-decision/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_composition: originalComposition,
          ai_prediction: {
            strength: data?.prediction?.strength,
            melting_temp: data?.prediction?.melting_temp,
            confidence: data?.prediction?.confidence,
          },
          ai_recommendation: recommendations,
          changes: changes,
          decision: "rejected",
          notes: notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✗ Decision rejected and logged. (ID: ${result.decision_id})`);
        if (onDecisionSubmit) {
          onDecisionSubmit("rejected", result.decision_id);
        }
      } else {
        setMessage(`✗ Error: ${result.error || "Failed to reject"}`);
      }
    } catch (error) {
      setMessage(`✗ Network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="manager-decision-panel">
      <div className="panel-header">
        <h3>👨‍💼 Manager Decision Panel</h3>
        <p className="panel-subtitle">Review and approve AI-recommended changes</p>
      </div>

      <div className="panel-content">
        {/* Recommended Changes Only */}
        <div className="recommendations-section">
          <h4>🎯 Recommended Changes ({recommendations.length})</h4>
          <div className="recommendation-cards">
            {recommendations.map((rec, index) => {
              const current = originalComposition?.[rec.element] ?? 0;
              const suggested = rec.suggested_value ?? 0;
              const final = editedValues[rec.element] ?? suggested;
              const direction = getChangeDirection(current, suggested);

              return (
                <div key={index} className="recommendation-card">
                  {/* Element Header with Change Indicator */}
                  <div className="card-header">
                    <span className="element-name">{rec.element}</span>
                    <div className={`change-indicator ${direction}`}>
                      {direction === "increase" && <span className="arrow">↑</span>}
                      {direction === "decrease" && <span className="arrow">↓</span>}
                      <span className="change-label">
                        {direction === "increase" ? "Increase" : "Decrease"}
                      </span>
                    </div>
                  </div>

                  {/* Value Flow: Current → Suggested → Final */}
                  <div className="value-flow">
                    <div className="value-item">
                      <div className="value-label">Current</div>
                      <div className="value-display">{current.toFixed(2)}%</div>
                    </div>

                    <div className="arrow-spacer">→</div>

                    <div className="value-item">
                      <div className="value-label">Suggested</div>
                      <div className="value-display">{suggested.toFixed(2)}%</div>
                    </div>

                    <div className="arrow-spacer">→</div>

                    <div className="value-item editable">
                      <div className="value-label">Final Value</div>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={final.toFixed(2)}
                          onChange={(e) => handleValueChange(rec.element, e.target.value)}
                          className="value-input"
                        />
                        <span className="unit">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {rec.reason && (
                    <div className="reason-text">
                      💡 {rec.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <label className="notes-label">Manager Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add comments about this decision..."
            className="notes-input"
            rows="2"
          />
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message-display ${message.startsWith("✓") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="button-group">
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="btn btn-approve"
          >
            {isSubmitting ? "Processing..." : "✓ Approve & Apply"}
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="btn btn-reject"
          >
            {isSubmitting ? "Processing..." : "✗ Reject"}
          </button>
          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className="btn btn-reset"
          >
            ↻ Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerDecisionPanel;
