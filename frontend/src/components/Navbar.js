import React, { useState, useEffect } from "react";
import "../styles/navbar.css";

function Navbar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-icon">🧪</span>
        <h1 className="navbar-brand-title">AI Alloy Optimization System</h1>
      </div>
      <div className="navbar-meta">
        <div className="navbar-timestamp">
          <span className="navbar-timestamp-icon">🕐</span>
          <span className="navbar-timestamp-text">{time}</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

