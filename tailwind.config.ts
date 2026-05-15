import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04070d",
          900: "#070b16",
          800: "#0b1424",
          700: "#0f1c33",
        },
        navy: {
          DEFAULT: "#0a1a3a",
          deep: "#061129",
          glow: "#1a3a7a",
        },
        marine: {
          DEFAULT: "#0f5f5b",
          deep: "#073f3d",
          glow: "#1ea69b",
          mint: "#2ed1b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "border-spin": {
          "0%": { "--angle": "0deg" },
          "100%": { "--angle": "360deg" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(46, 209, 184, 0.35)" },
          "50%": { boxShadow: "0 0 0 12px rgba(46, 209, 184, 0)" },
        },
      },
      animation: {
        "border-spin": "border-spin 4s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
