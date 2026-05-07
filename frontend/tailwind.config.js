/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      /* ── Font family ─────────────────────────────────── */
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },

      /* ── Custom indigo / brand shades ────────────────── */
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      /* ── Box shadows ─────────────────────────────────── */
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0/0.07),  0 1px 2px -1px rgb(0 0 0/0.07)',
        'card-md': '0 4px 6px -1px rgb(0 0 0/0.07), 0 2px 4px -2px rgb(0 0 0/0.07)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0/0.08), 0 4px 6px -4px rgb(0 0 0/0.08)',
        'glow':    '0 0 0 3px rgb(99 102 241/0.25)',
      },

      /* ── Border radius ───────────────────────────────── */
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      /* ── Animations ──────────────────────────────────── */
      animation: {
        'fade-in':   'fadeIn 0.35s ease-out both',
        'slide-up':  'slideUp 0.35s ease-out both',
        'scale-in':  'scaleIn 0.2s ease-out both',
        'shimmer':   'shimmer 1.4s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft':'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      keyframes: {
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(14px)'},to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' },   to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },

      /* ── Spacing extras ──────────────────────────────── */
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },

      /* ── Typography scale ────────────────────────────── */
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      /* ── Min/max sizes ───────────────────────────────── */
      minHeight: {
        'dvh': '100dvh',
      },

      /* ── Background sizes ────────────────────────────── */
      backgroundSize: {
        '200': '200% 100%',
      },
    },
  },

  plugins: [],
};
