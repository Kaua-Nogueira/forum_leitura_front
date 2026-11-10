/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"EB Garamond"', 'Georgia', 'serif'],
        literary: ['"EB Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        parchment: {
          DEFAULT: '#FAF7F2',
          warm: '#F3EFE6',
          deep: '#EAE3D5',
        },
        ink: {
          DEFAULT: '#1C1C1C',
          secondary: '#3D3B37',
          muted: '#6B665E',
        },
        forest: {
          DEFAULT: '#1B4332',
          hover: '#143325',
          light: '#2D6A4F',
          subtle: '#E9F2EE',
        },
        burgundy: {
          DEFAULT: '#6B1D2F',
          hover: '#521523',
          light: '#8C2D41',
          subtle: '#F7EBEE',
        },
        navy: {
          DEFAULT: '#1D2D44',
          hover: '#142030',
          light: '#2D4466',
          subtle: '#EAEEF4',
        },
        gold: {
          DEFAULT: '#B08D57',
          light: '#D4B98C',
          subtle: '#F9F4EB',
        },
        slateDark: {
          bg: '#13161B',
          card: '#1B1F27',
          elevated: '#232832',
          border: '#2D3340',
          text: '#EAE6DF',
          muted: '#9CA3AF',
        },
      },
      boxShadow: {
        'editorial': '0 2px 15px -3px rgba(28, 28, 28, 0.05), 0 4px 6px -4px rgba(28, 28, 28, 0.03)',
        'editorial-hover': '0 12px 28px -6px rgba(28, 28, 28, 0.09), 0 4px 10px -4px rgba(28, 28, 28, 0.04)',
      },
    },
  },
  plugins: [],
}
