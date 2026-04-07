import React from "react";

const HomeFeatures = () => {
  const features = [
    {
      icon: "�",
      title: "Prediction",
      description: "Instantly predict alloy properties with high accuracy machine learning models.",
    },
    {
      icon: "⚙️",
      title: "Optimization",
      description: "Get intelligent recommendations for the best alloy compositions.",
    },
    {
      icon: "📈",
      title: "Analysis",
      description: "Deep dive into material properties and performance metrics.",
    },
    {
      icon: "🧠",
      title: "Insights",
      description: "Understand key factors influencing your alloy performance.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Key Features</h2>
          <p className="text-slate-600">Everything you need for alloy analysis and optimization</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;
