import React from "react";
import "../styles/cards.css";

function RecommendationsCard({ title = "💡 Recommendations", items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card recommendations-card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        <ul className="recommendations-list">
          {items.map((item, idx) => (
            <li key={idx} className="recommendation-item">
              <span className="item-dot">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RecommendationsCard;
