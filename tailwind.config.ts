import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F4E78",
          gold: "#C9A227",
        },
      },
    },
  },
  plugins: [],
};

export default config;
