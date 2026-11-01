/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#12d6c7',
          cyanHover: '#0ebcaf',
          cyanGlow: 'rgba(18, 214, 199, 0.35)',
          amber: '#fca311',
          amberHover: '#e5920b',
          amberGlow: 'rgba(252, 163, 17, 0.35)',
          navy: '#080d16',
          surface: '#111827',
          card: '#131b29',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
};
