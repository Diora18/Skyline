/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#0284C7",
        accent: "#F59E0B",
        success: "#10B981",
        neutral: "#0F172A",
      }
    },
  },
  plugins: [],
}
