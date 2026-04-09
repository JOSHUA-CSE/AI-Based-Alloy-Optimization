import React from "react";
import HomeHero from "./sections/HomeHero";
import HomeFeatures from "./sections/HomeFeatures";
import HomeAbout from "./sections/HomeAbout";
import HomeHowItWorks from "./sections/HomeHowItWorks";
import HomeCTA from "./sections/HomeCTA";
import HomeFooter from "./sections/HomeFooter";

const Homepage = ({ onNavigateToDashboard }) => {
  const handleDashboardClick = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚗️</span>
            <span className="text-xl font-bold text-slate-900">Alloyfy</span>
          </div>
          <button
            onClick={handleDashboardClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <HomeHero onDashboardClick={handleDashboardClick} />
        <HomeFeatures />
        <HomeAbout />
        <HomeHowItWorks />
        <HomeCTA onDashboardClick={handleDashboardClick} />
        <HomeFooter />
      </main>
    </div>
  );
};

export default Homepage;
