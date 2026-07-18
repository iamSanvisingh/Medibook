/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B5FEF',
        'primary-dark': '#4448D6',
        'primary-light': '#EEF0FF',
        ink: '#0F172A',
        muted: '#64748B',
        border: '#E7EAF0',
        surface: '#F7F8FB',
        card: '#FFFFFF',
        success: '#16A34A',
        'success-bg': '#DCFCE7',
        pending: '#7C3AED',
        'pending-bg': '#EDE9FE',
        danger: '#DC2626',
        'danger-bg': '#FEE2E2',
        // dark mode counterparts
        'dark-surface': '#0F1115',
        'dark-card': '#171A21',
        'dark-border': '#262B36',
        'dark-ink': '#F1F5F9',
        'dark-muted': '#94A3B8',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px, 1fr))'
      }
    },
  },
  plugins: [],
}