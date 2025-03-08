import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "#ffffff",
        background: "#0f171b",
        accent: "#39da79",
        background_light: "#19262d",
      },
      fontSize: {
        base: "var(--fs-base)",
        big: "var(--fs-big)",
        bigger: "var(--fs-bigger)",
        h1: "var(--fs-h1)",
        h2: "var(--fs-h2)",
        h3: "var(--fs-h3)",
        h4: "var(--fs-h4)",
        h5: "var(--fs-h5)",
        h6: "var(--fs-h6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
