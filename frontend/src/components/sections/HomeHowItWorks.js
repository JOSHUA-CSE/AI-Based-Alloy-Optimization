import React from "react";

const HomeHowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Enter Composition",
      description: "Input the elements and their percentages you want to analyze.",
      icon: "📝",
    },
    {
      number: 2,
      title: "AI Analysis",
      description: "Our machine learning models process your data instantly.",
      icon: "⚡",
    },
    {
      number: 3,
      title: "Get Results",
      description: "Receive predictions, recommendations, and optimized compositions.",
      icon: "✨",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-600">Simple 3-step process to optimize your alloys</p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {step.number}
                </div>

                {/* Icon and Content */}
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 text-2xl text-slate-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeHowItWorks;
