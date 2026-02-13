import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#E7E7E5",
        canvas: "#0D0D0D",
        muted: "#9E9E96",
        line: "#242424"
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-sora)", "system-ui", "sans-serif"]
      },
      animation: {
        "page-in": "pageIn 420ms ease-out both"
      },
      keyframes: {
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
