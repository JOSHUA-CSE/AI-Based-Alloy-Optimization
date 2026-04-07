module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {colors: {
        navy: {
          50: "#f8fafc",
          100: "#f1f5fb",
          500: "#1f3a5f",
          600: "#1a2f4d",
          700: "#152540",
        },
        gold: {
          50: "#fffbf0",
          400: "#f4c542",
          500: "#e6b800",
          600: "#cc9900",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          600: "#475569",
          700: "#334155",
        },
      },
      spacing: {
        "18": "4.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "sm": "0 2px 4px rgba(0, 0, 0, 0.05)",
        "base": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "md": "0 8px 20px rgba(0, 0, 0, 0.1)",
        "lg": "0 12px 32px rgba(0, 0, 0, 0.12)",
      },},
  },
  plugins: [],
}