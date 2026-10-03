/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbe0',
          100: '#fff5b8',
          500: '#3A0CA3',
          600: '#3A0CA3',
          700: '#2d0a7d',
          800: '#240863',
          900: '#1a0648',
        },
        launchpad: {
          white: '#ffffff',
          'pale-yellow': '#fffbe0',
          yellow: '#fff275',
          'bright-yellow': '#f9e830',
          'dark-yellow': '#e4c900',
          'deep-yellow': '#d4b600',
          purple: '#3A0CA3',
          /** legacy aliases → map to primary palette */
          gold: '#f9e830',
          lavender: '#fffbe0',
          twilight: '#2d0a7d',
          light: '#ffffff',
          mid: '#e5e7eb',
          charcoal: '#2d0a7d',
          slate: '#3A0CA3',
          teal: '#3A0CA3',
        },
        primary: '#3A0CA3',
        secondary: '#2d0a7d',
      },
    },
  },
  plugins: [],
}
