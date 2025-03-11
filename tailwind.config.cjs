/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        secondary: '#6C757D',
        text: '#343A40',
        background: '#F8F9FA',
        navigation: '#2654A1',
        message_self: '#e2f5fd',
        message_other: '#ffffff'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}