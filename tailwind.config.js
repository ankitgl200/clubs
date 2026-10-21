/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#E0EBFF',
          200: '#C7D9FE',
          300: '#9EBEFD',
          400: '#6FA0FC',
          500: '#2463FF', // Primary Electric Blue
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        navy: {
          800: '#101D32', // Dark card surface
          850: '#0D172A',
          900: '#07111F', // Deep Midnight Navy background
          950: '#040913',
        },
        accent: {
          violet: '#7258FF',
          cyan: '#56D9FF',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'glow-blue': '0 0 30px -5px rgba(36, 99, 255, 0.35)',
        'glow-violet': '0 0 30px -5px rgba(114, 88, 255, 0.35)',
        'card-light': '0 4px 20px -2px rgba(16, 27, 60, 0.05), 0 2px 6px -1px rgba(16, 27, 60, 0.03)',
        'card-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.4), 0 2px 10px -1px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(36,99,255,0.15), transparent 70%)',
        'grid-pattern': "radial-gradient(rgba(36, 99, 255, 0.12) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
