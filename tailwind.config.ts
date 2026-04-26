import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        field: "#f5f7f4",
        line: "#d7ddd2",
        moss: "#65734f",
        signal: "#cc3f2f",
        blue: "#315f8c",
        gold: "#d49a2a",
        trust: {
          system: "#101820",
          user: "#65734f",
          delegated: "#315f8c",
          tool: "#d49a2a",
          untrusted: "#cc3f2f"
        }
      },
      boxShadow: {
        panel: "0 18px 44px rgba(16, 24, 32, 0.10)",
        verdict: "0 24px 60px rgba(16, 24, 32, 0.16)"
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        },
        "dash-flow": {
          to: { "stroke-dashoffset": "-24" }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 1.6s ease-in-out infinite",
        "dash-flow": "dash-flow 1.4s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
