import React from "react";
import "../styles/cards.css";

function RootCauseCard({ issues }) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="card root-cause-card">
      <div className="card-header">
        <h3>🔴 Root Cause Analysis</h3>
      </div>
      <div className="card-body">
        <ul className="issue-list">
          {issues.map((issue, idx) => (
            <li key={idx} className="issue-item">{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RootCauseCard;
