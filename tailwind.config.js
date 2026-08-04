/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        blue: {
          50:  '#eff5fe',
          100: '#deeafd',
          200: '#bed5fb',
          300: '#8db8f8',
          400: '#5a93f4',
          500: '#3a7df2',
          600: '#266df0',
          700: '#1a5cd4',
          800: '#154ab0',
          900: '#123d8e',
          950: '#0c2860',
        },
        gray: {
          900: '#101112',
        },
      },
    },
  },
  plugins: [],
}

