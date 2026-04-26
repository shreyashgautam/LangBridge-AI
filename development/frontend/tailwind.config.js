/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "#101b2f",
        accent: "#7dd3fc",
        glow: "#38bdf8",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(8, 17, 31, 0.45)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12), transparent 28%)",
      },
    },
  },
  plugins: [],
};
