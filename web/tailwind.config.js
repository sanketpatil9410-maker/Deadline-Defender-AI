/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d8fe',
          300: '#a3beff',
          400: '#7a96ff',
          500: '#4f68ff', // Vibrant Accent Blue
          600: '#3843f5',
          700: '#2c31e0',
          800: '#2529b8',
          900: '#222792',
          950: '#151759',
        },
      }
    },
  },
  plugins: [],
}
