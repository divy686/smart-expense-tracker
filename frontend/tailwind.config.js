/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1C372A",
        accent: "#00B8D4",
        bg: "#F9F9F6",
        surface: "#FFFFFF",
        muted: "#5B6C64",
        border: "#E2E2DF",
        danger: "#CC5A3A",
        success: "#2D7A5D",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
     },
  },
  plugins: [],
};