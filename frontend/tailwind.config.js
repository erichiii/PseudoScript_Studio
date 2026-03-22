/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: "#c7b7ff",
        lilac: "#e0d1ff",
        blush: "#f9d9e2",
        sky: "#cde7ff",
        midnight: "#1f1b2c",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(31, 27, 44, 0.25)",
      },
    },
  },
  plugins: [],
};
