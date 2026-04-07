import React from "react";

function Recommendations({ title, items }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendations;
