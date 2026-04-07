import React, { useState, useEffect } from "react";
import "../styles/history-page.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch history and statistics
  useEffect(() => {
    fetchHistory();
    fetchStatistics();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = new URL("http://localhost:8000/api/history/");
      if (filter !== "all") {
        url.searchParams.append("decision", filter);
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setHistory(data.history || []);
      } else {
        setError(data.error || "Failed to fetch history");
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/statistics/");
      const data = await response.json();

      if (data.success) {
        setStatistics(data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const fetchDecisionDetail = async (decisionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/history/${decisionId}/`);
      const data = await response.json();

      if (data.success) {
        setSelectedDecision(data);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  if (selectedDecision) {
    return (
      <div className="history-detail">
        <div className="detail-header">
          <button
            onClick={() => setSelectedDecision(null)}
            className="btn-back"
          >
            ← Back to History
          </button>
          <h2>Decision Details - ID: {selectedDecision.id}</h2>
        </div>

        <div className="detail-content">
          {/* Metadata */}
          <div className="detail-section">
            <h3>Metadata</h3>
            <div className="metadata-grid">
              <div>
                <strong>Timestamp:</strong>
                <p>{formatDate(selectedDecision.timestamp)}</p>
              </div>
              <div>
                <strong>Decision:</strong>
                <p className={`status-badge ${selectedDecision.decision}`}>
                  {selectedDecision.decision.toUpperCase()}
                </p>
              </div>
            </div>
            {selectedDecision.notes && (
              <div>
                <strong>Notes:</strong>
                <p>{selectedDecision.notes}</p>
              </div>
            )}
          </div>

          {/* Input Composition */}
          <div className="detail-section">
            <h3>Input Composition</h3>
            <div className="composition-grid">
              {Object.entries(selectedDecision.input_composition).map(
                ([element, value]) => (
                  <div key={element} className="composition-item">
                    <strong>{element}</strong>
                    <span>{parseFloat(value).toFixed(2)}%</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* AI Prediction */}
          <div className="detail-section">
            <h3>AI Prediction</h3>
            <div className="prediction-grid">
              <div>
                <strong>Tensile Strength:</strong>
                <p>{selectedDecision.ai_prediction?.strength?.toFixed(0)} MPa</p>
              </div>
              <div>
                <strong>Melting Temp:</strong>
                <p>{selectedDecision.ai_prediction?.melting_temp?.toFixed(0)}°C</p>
              </div>
              <div>
                <strong>Confidence:</strong>
                <p>{selectedDecision.ai_prediction?.confidence}%</p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="detail-section">
            <h3>AI Recommendations</h3>
            <table className="recommendations-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Suggested Value</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {selectedDecision.ai_recommendation?.map((rec, idx) => (
                  <tr key={idx}>
                    <td>{rec.element}</td>
                    <td>{parseFloat(rec.suggested_value).toFixed(2)}%</td>
                    <td>{rec.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Values Applied */}
          <div className="detail-section">
            <h3>Final Values Applied</h3>
            <div className="composition-grid">
              {Object.entries(selectedDecision.final_values).map(
                ([element, value]) => (
                  <div key={element} className="composition-item">
                    <strong>{element}</strong>
                    <span>{parseFloat(value).toFixed(2)}%</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Machine Log */}
          {selectedDecision.machine_log && (
            <div className="detail-section">
              <h3>Machine Log</h3>
              <div className="machine-log">
                <div>
                  <strong>Status:</strong>
                  <p className={`status-badge ${selectedDecision.machine_log.status}`}>
                    {selectedDecision.machine_log.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <strong>Timestamp:</strong>
                  <p>{formatDate(selectedDecision.machine_log.timestamp)}</p>
                </div>
                {selectedDecision.machine_log.response && (
                  <div>
                    <strong>Response:</strong>
                    <pre>{JSON.stringify(selectedDecision.machine_log.response, null, 2)}</pre>
                  </div>
                )}
                {selectedDecision.machine_log.error && (
                  <div>
                    <strong>Error:</strong>
                    <p style={{ color: "#ef4444" }}>
                      {selectedDecision.machine_log.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <h1>📊 Decision History</h1>
        <p>Track all manager approvals and rejections</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-value">{statistics.total_decisions}</div>
            <div className="stat-label">Total Decisions</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{statistics.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{statistics.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{statistics.approval_rate}%</div>
            <div className="stat-label">Approval Rate</div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-group">
        <button
          onClick={() => setFilter("all")}
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          All Decisions
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`filter-btn ${filter === "approved" ? "active" : ""}`}
        >
          ✓ Approved
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
        >
          ✗ Rejected
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading">
          <p>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <p>📭 No decisions found</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Decision</th>
                <th>Strength (MPa)</th>
                <th>Temp (°C)</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="timestamp">
                    {formatDate(item.timestamp)}
                  </td>
                  <td>
                    <span className={`status-badge ${item.decision}`}>
                      {item.decision === "approved" ? "✓ Approved" : "✗ Rejected"}
                    </span>
                  </td>
                  <td>{item.prediction?.strength?.toFixed(0) || "N/A"}</td>
                  <td>{item.prediction?.melting_temp?.toFixed(0) || "N/A"}</td>
                  <td>{item.prediction?.confidence || "N/A"}%</td>
                  <td>
                    <button
                      onClick={() => fetchDecisionDetail(item.id)}
                      className="btn-view-details"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
