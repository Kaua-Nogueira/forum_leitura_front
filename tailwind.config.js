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
      fontSize: {
        xs: ['0.84rem', { lineHeight: '1.35rem' }],
        sm: ['0.95rem', { lineHeight: '1.45rem' }],
        base: ['1.05rem', { lineHeight: '1.65rem' }],
        lg: ['1.18rem', { lineHeight: '1.75rem' }],
        xl: ['1.32rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.58rem', { lineHeight: '2.05rem' }],
        '3xl': ['1.95rem', { lineHeight: '2.35rem' }],
        '4xl': ['2.35rem', { lineHeight: '2.7rem' }],
      },
      colors: {
        parchment: {
          DEFAULT: '#F6F2E9',
          warm: '#EDE6D8',
          deep: '#CFC4AE',
        },
        ink: {
          DEFAULT: '#141413',
          secondary: '#242220',
          muted: '#45413A',
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
          DEFAULT: '#A67C37',
          light: '#D4B275',
          subtle: '#F9F4EB',
        },
        slateDark: {
          bg: '#13171F',
          card: '#1B202B',
          elevated: '#242B38',
          border: '#3A4354',
          text: '#F4F1EA',
          muted: '#C6CCD6',
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
