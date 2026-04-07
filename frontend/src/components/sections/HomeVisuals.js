import React from "react";

const HomeVisuals = () => {
  const images = [
    {
      title: "Metal Microstructure",
      emoji: "🔬",
      description: "Advanced analysis of material composition",
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Alloy Samples",
      emoji: "⚗️",
      description: "High-quality material specimens",
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Industrial Lab",
      emoji: "🏭",
      description: "State-of-the-art testing facilities",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "AI Neural Network",
      emoji: "🧠",
      description: "Advanced machine learning models",
      color: "from-pink-500 to-red-600",
    },
    {
      title: "Data Analysis",
      emoji: "📊",
      description: "Comprehensive metrics and insights",
      color: "from-red-500 to-orange-600",
    },
    {
      title: "Innovation Hub",
      emoji: "💡",
      description: "Cutting-edge research environment",
      color: "from-orange-500 to-yellow-600",
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Visual Gallery</h2>
          <p className="text-slate-400 text-lg">Explore the world of alloy optimization and materials science</p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl h-72 cursor-pointer"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${image.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>

              {/* Animated Pattern Background */}
              <div className="absolute inset-0 opacity-10">
                <div
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, transparent 20%, rgba(79, 172, 254, .1) 21%, rgba(79, 172, 254, .1) 34%, transparent 35%, transparent), radial-gradient(circle at 60% 70%, transparent 20%, rgba(79, 172, 254, .1) 21%, rgba(79, 172, 254, .1) 34%, transparent 35%, transparent), radial-gradient(circle at 80% 20%, transparent 20%, rgba(79, 172, 254, .1) 21%, rgba(79, 172, 254, .1) 34%, transparent 35%, transparent)",
                    backgroundSize: "200% 200%",
                  }}
                  className="absolute inset-0 animate-pulse"
                ></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {/* Large Emoji */}
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">{image.emoji}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-300 transition-colors duration-300">{image.title}</h3>

                {/* Description */}
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.description}
                </p>
              </div>

              {/* Border Gradient */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${image.color} opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300`}></div>

              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-slate-700/50 group-hover:border-cyan-500/50 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 bg-gradient-to-r from-slate-800/30 via-cyan-500/10 to-slate-800/30 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm text-center">
          <p className="text-slate-300 mb-4">
            🌟 Our platform leverages cutting-edge AI technology combined with decades of metallurgical expertise to deliver unparalleled insights.
          </p>
          <p className="text-slate-400 text-sm">
            Trusted by leading research institutions and industrial partners worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeVisuals;
