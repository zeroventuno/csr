import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        blue: "var(--blue)",
        "blue-deep": "var(--blue-deep)",
        aqua: "var(--aqua)",
        "aqua-soft": "var(--aqua-soft)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        sidebar: "var(--sidebar)",
        "sidebar-text": "var(--sidebar-text)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      fontFamily: {
        head: ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        csr: "var(--shadow)",
      },
      maxWidth: {
        site: "1240px",
      },
      keyframes: {
        csrFloat: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        csrPulse: {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "csrFloat 2.6s ease-in-out infinite",
        "float-slow": "csrFloat 3.4s ease-in-out infinite",
        pulseDot: "csrPulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
