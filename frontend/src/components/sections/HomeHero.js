import React from "react";

const HomeHero = ({ onDashboardClick }) => {
  return (
    <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                AI-Based Alloy Optimization Tool
              </h1>
              <p className="text-lg text-slate-600">
                Analyze, predict, and optimize alloy compositions with machine learning. Get instant insights and recommendations for your metallurgical research.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={onDashboardClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Analyze Alloy →
            </button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
              <div>
                <div className="text-2xl font-bold text-blue-600">99.2%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">&lt;100ms</div>
                <div className="text-sm text-slate-600">Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">1000+</div>
                <div className="text-sm text-slate-600">Alloys</div>
              </div>
            </div>
          </div>

          {/* Right: Image Placeholder */}
          <div className="hidden lg:block">
            <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-3">🔬</div>
                <p className="text-slate-600 font-medium">Advanced Material Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
