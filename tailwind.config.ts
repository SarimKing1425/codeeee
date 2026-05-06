import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kyrie: {
          blue: "#1B4F72",
          blueLight: "#D6EAF8",
          gray: "#5D6D7E",
          ink: "#0A1A2A",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      animation: {
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "ring-pulse": "ring-pulse 1.6s ease-out infinite",
        "fade-in": "fade-in 0.6s ease-out both",
        "slide-up": "slide-up 0.4s ease-out both",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.015) translateY(-6px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        "ring-pulse": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
