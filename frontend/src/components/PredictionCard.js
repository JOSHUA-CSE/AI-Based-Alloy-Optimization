import React from "react";

function PredictionCard({ prediction }) {
  if (!prediction) return null;

  return (
    <div className="card-dark">
      <h3 className="text-lg font-semibold mb-6">📊 Predicted Properties</h3>
      
      <div className="space-y-6">
        <div>
          <p className="metric-label text-white/70">Tensile Strength</p>
          <p className="text-5xl font-bold text-gold-400">{prediction.strength?.toFixed(0)} MPa</p>
        </div>

        <div>
          <p className="metric-label text-white/70">Melting Temperature</p>
          <p className="text-5xl font-bold text-gold-400">{prediction.melting_temp?.toFixed(0)}°C</p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="metric-label text-white/70 mb-3">Confidence Score</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
            <span className="text-lg font-semibold text-gold-400">{prediction.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;
