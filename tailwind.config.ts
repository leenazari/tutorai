import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3366FF",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#3366FF",
          600: "#2952cc",
          700: "#1f3d99",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-ring": "pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "speak-pulse": "speakPulse 1.4s ease-in-out infinite",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        speakPulse: {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(51, 102, 255, 0.5)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 20px rgba(51, 102, 255, 0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
