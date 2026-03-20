/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffdf7',
          100: '#f8f1df',
          200: '#efdfb8',
          300: '#dfc88b',
        },
        wheat: {
          50: '#fdf8ee',
          100: '#f7edd8',
          200: '#ecd7ab',
          300: '#ddb875',
          400: '#cf9f4d',
        },
        mustard: {
          50: '#fdf7da',
          100: '#f9edac',
          200: '#f3db65',
          300: '#e7c13f',
          400: '#d6a723',
          500: '#b78815',
          600: '#94690f',
          700: '#73500f',
        },
        olive: {
          50: '#f4f6ea',
          100: '#e4e8cb',
          200: '#cdd7a0',
          300: '#afbf6d',
          400: '#8fa246',
          500: '#6f7f2d',
          600: '#566321',
          700: '#414d1b',
        },
        forest: {
          500: '#335c3a',
          600: '#27472d',
          700: '#1c3220',
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
