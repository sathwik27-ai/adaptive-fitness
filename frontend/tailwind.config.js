/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-main': '#D8CBB5',
        'bg-secondary': '#E6DCCB',
        'bg-card': '#F4EFE6',
        'bg-surface': '#CBBDA6',
        'primary': '#2F5D3A',
        'primary-hover': '#254C30',
        'accent-light': '#6F8F76',
        'accent-soft': '#A7C4A0',
        'chart-orange': '#E59A3A',
        'chart-purple': '#8C6FAE',
        'chart-olive': '#4F7C63',
        'cta': '#1B1410',
        'text-primary': '#1E1E1E',
        'text-secondary': '#6B6B6B',
        'text-muted': '#9E9587',
        'text-on-dark': '#FFFFFF',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'modal': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
