/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        scout: {
          bg: "#0f1117",
          surface: "#1a1d2e",
          border: "#2d2f45",
          accent: "#6c63ff",
          accentHover: "#5a52e0",
          text: "#e2e8f0",
          muted: "#8892a4",
          go: "#22c55e",
          nogo: "#ef4444",
          pivot: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
