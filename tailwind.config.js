export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "theme-xl": "4px 20px 40px 1px var(--shadow-color)",
      },
      colors: {
        "custom-purple": "#3b6ea5",
        "custom-violet": "#28246b",
        "custom-accent": "#db8216",
      },
      borderColor: {
        custom: "var(--border-color)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#702ace",
          secondary: "#f87171",
          accent: "#db8216",
          neutral: "#2a3c5e",
          "base-100": "#1b1c48",
          "base-200": "#030918",
          "base-300": "#121212",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#facc15",
          error: "#ef4444",
          "--shadow-color": "rgba(0, 0, 0, 0.8)",
          "--note-hover-color": "#040a1c",
          "--border-color": "rgba(255, 255, 255, 0.2)",
        },
      },
      {
        light: {
          primary: "#a855f7",
          secondary: "#22d3ee",
          accent: "#fbbf24",
          neutral: "#3d4451",
          "base-100": "#f5f5f5",
          "base-200": "#ffffff",
          "base-300": "#e0e0e0",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#facc15",
          error: "#ef4444",
          "--shadow-color": "none",
          "--note-hover-color": "#e5e7eb",
          "--border-color": "rgba(0, 0, 0, 0.2)",
        },
      },
      {
        etch: {
          primary: "#702ace",
          secondary: "#f87171",
          accent: "rgb(255, 113, 10)",
          neutral: "#2b2b2b",
          "base-100": "#2b2a2a",
          "base-200": "#1a1a1b",
          "base-300": "#2b2a2a",
          info: "rgb(172, 136, 255)",
          success: "rgb(30, 203, 225)",
          warning: "#facc15",
          error: "rgb(239, 68, 68)",
          "--shadow-color": "none",
          "--note-hover-color": "#2b2a2a",
          "base-content": "#ffffff",
          "--border-color": "rgba(255, 255, 255, 0.2)",
        },
      },
    ],
  },
  safelist: ["border-custom"],
}
