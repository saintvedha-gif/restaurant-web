/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override Tailwind yellow → nueva paleta principal
        yellow: {
          300: '#FFE033',
          400: '#FFD60A',
          700: '#B08C00',
          900: '#6B5200',
        },
        // Paleta de marca nueva
        brand: {
          yellow: '#FFD60A',
          orange: '#FFD60A',
          green: '#00C853',
          red: '#FFD60A',
          dark: '#2A1E12',
          surface: '#342518',
          panel: '#3E2D1C',
          text: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Sora', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}