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
        gold: "#d49a2a"
      },
      boxShadow: {
        panel: "0 18px 44px rgba(16, 24, 32, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
