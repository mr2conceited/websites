/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e11d2e',
          dark: '#b8121f',
        },
      },
    },
  },
  plugins: [],
};
