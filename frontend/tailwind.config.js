/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          50: '#f6f7f9',
          100: '#edeef2',
          200: '#d7dbe2',
          300: '#b4bccb',
          400: '#8b97af',
          500: '#6d7b97',
          600: '#56627d',
          700: '#465067',
          800: '#3c4456',
          900: '#1e2433',
          950: '#0f121a',
        },
        gold: {
          50: '#fbf8ed',
          100: '#f5efd4',
          200: '#ecdda8',
          300: '#dfc373',
          400: '#d4aa48',
          500: '#c29235',
          600: '#a7732b',
          700: '#855426',
          800: '#6f4325',
          900: '#5c3822',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
