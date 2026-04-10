import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "var(--color-cream)",
        ink: "var(--color-ink)",
        emerald: "var(--color-emerald)",
        mint: "var(--color-mint)",
        sky: "var(--color-sky)",
        peach: "var(--color-peach)",
        coral: "var(--color-coral)",
        surfaceLow: "var(--color-surface-low)",
        surfaceLowest: "var(--color-surface-lowest)",
        surfaceHigh: "var(--color-surface-high)",
        mutedInk: "var(--color-text-muted)",
        outlineSoft: "var(--color-outline)"
      },
      boxShadow: {
        card: "0 18px 45px rgba(30, 40, 45, 0.08)",
        soft: "0 8px 32px rgba(0, 0, 0, 0.04)"
      },
      borderRadius: {
        panel: "28px",
        screen: "32px"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
