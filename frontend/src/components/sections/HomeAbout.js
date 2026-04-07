import React from "react";

const HomeAbout = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">About Alloy Optimization</h2>
          <p className="text-slate-600">Why AI-powered analysis matters for materials engineering</p>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-6">
            {/* What is it? */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">•</span> What is Alloy Optimization?
              </h3>
              <p className="text-slate-600">
                Alloy optimization is the process of finding the ideal combination of elements to create materials with superior properties. Traditional trial-and-error methods are expensive, time-consuming, and often inefficient.
              </p>
            </div>

            {/* Why it matters */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="text-green-600">•</span> Why It Matters in Industry
              </h3>
              <p className="text-slate-600">
                Materials science directly impacts aerospace, automotive, construction, and manufacturing industries. Better alloys mean safer products, longer lifespan, improved performance, and reduced costs.
              </p>
            </div>

            {/* AI Benefits */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">•</span> Benefits of AI in Materials Engineering
              </h3>
              <ul className="text-slate-600 space-y-2 ml-6">
                <li>✓ <strong>Faster Research:</strong> Reduce months of experimentation to days</li>
                <li>✓ <strong>Cost Reduction:</strong> Eliminate wasteful tests and optimize material usage</li>
                <li>✓ <strong>Better Results:</strong> Discover superior compositions humans might miss</li>
                <li>✓ <strong>Data-Driven:</strong> Make decisions backed by comprehensive analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAbout;
