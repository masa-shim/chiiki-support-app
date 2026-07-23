import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
