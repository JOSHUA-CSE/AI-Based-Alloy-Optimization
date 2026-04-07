import React from "react";

const HomeCTA = ({ onDashboardClick }) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="max-w-3xl mx-auto">
        {/* CTA Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-12 shadow-lg text-white text-center">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Start Analyzing Your Alloy Now
          </h2>

          {/* Subheading */}
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Get instant predictions and optimization recommendations for your alloy compositions.
          </p>

          {/* Button */}
          <button
            onClick={onDashboardClick}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
