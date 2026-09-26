/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Assistant', 'Rubik', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#1f2a44', soft: '#5b6680', faint: '#94a0b8' },
        brand: { DEFAULT: '#2f6bff', soft: '#e8efff' },
        cat: {
          flights: '#2f80ed',
          hotels: '#8b5cf6',
          transport: '#16a34a',
          attractions: '#e11d48',
          car: '#f97316',
          insurance: '#0d9488',
          checklist: '#7c3aed',
        },
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(31, 42, 68, 0.25)',
        pin: '0 6px 14px -4px rgba(31, 42, 68, 0.45)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
