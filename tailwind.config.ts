import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        paper: "#f7f5ef",
        sage: "#6f8c78",
        mint: "#dce9df",
        clay: "#c7785b",
        sky: "#dcebf3"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 33, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
