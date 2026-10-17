// SPDX-License-Identifier: GPL-3.0-or-later
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#141419",
        "surface-elevated": "#1E1E26",
        border: "#2A2A35",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
        "text-muted": "#71717A",
        indigo: {
          DEFAULT: "#6366F1",
          light: "#818CF8",
          dark: "#4F46E5",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        rpe: {
          easy: "#22C55E",
          moderate: "#F59E0B",
          hard: "#F97316",
          max: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
