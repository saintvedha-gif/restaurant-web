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
          orange: '#FF6D00',
          green: '#00C853',
          red: '#FF3D00',
          dark: '#2A1E12',
          surface: '#342518',
          panel: '#3E2D1C',
          text: '#F5F5F5',
        },
        // Tokens legacy para ProductModal (mapeados a nueva paleta oscura)
        cream: {
          50: '#2A1E12',
          100: '#342518',
          200: '#3E2D1C',
          300: '#503A28',
        },
        wheat: {
          50: '#2A1E12',
          100: '#342518',
          200: '#3E2D1C',
          300: '#503A28',
          400: '#614830',
        },
        mustard: {
          50: '#28200E',
          100: '#342518',
          200: '#FFD60A26',
          300: '#FFD60A66',
          400: '#FFD60A',
          700: '#B08C00',
        },
        olive: {
          50: '#0A2014',
          200: '#0D3A1C',
          300: '#00C853',
          500: '#00C853',
          700: '#00A843',
        },
        forest: {
          500: '#003D19',
          600: '#002D12',
          700: '#00C853',
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
