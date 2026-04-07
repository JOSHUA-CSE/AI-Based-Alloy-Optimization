import React from "react";

const HomeFooter = ({ onDashboardClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚗️</span>
              <span className="font-bold text-lg">AlloySense AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              Smart Materials. Smarter Decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#dash" className="hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          {/* Copyright */}
          <div className="text-center text-sm text-slate-500">
            <p>
              &copy; {currentYear} AlloySense AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
