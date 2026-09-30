/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./login.html",
    "./pages/**/*.{html,js}",
    "./js/**/*.{html,js}",
    "./shared/**/*.{html,js}",
    "./router/**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
