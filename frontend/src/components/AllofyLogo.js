import React from "react";

const AllofyLogo = ({ size = 32, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: "inline-block" }}
    >
      {/* Dark background */}
      <rect width="100" height="100" fill="#1F2937" rx="12" />

      {/* Metallic alloy layers */}
      <g stroke="#60A5FA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Top layer - liquid metal effect */}
        <path d="M 20 35 Q 30 25, 40 30 T 60 30 T 80 35" strokeDasharray="4,2" opacity="0.8" />
        
        {/* Middle crystalline structure */}
        <path d="M 25 50 L 50 40 L 75 50" />
        <path d="M 25 50 L 50 60 L 75 50" />
        <line x1="50" y1="40" x2="50" y2="60" />
        
        {/* Bottom solid layer */}
        <path d="M 20 65 Q 30 72, 50 70 Q 70 68, 80 65" />
      </g>

      {/* Accent nodes - representing metal composition */}
      <circle cx="50" cy="40" r="2.5" fill="#0EA5E9" />
      <circle cx="25" cy="50" r="2" fill="#06B6D4" />
      <circle cx="75" cy="50" r="2" fill="#06B6D4" />
      <circle cx="50" cy="60" r="2.5" fill="#0EA5E9" />

      {/* Glowing effect */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
};

export default AllofyLogo;
