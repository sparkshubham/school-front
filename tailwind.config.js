/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#0f1c2e',
        pine: {
          50: '#f0f7f4',
          100: '#dceee6',
          500: '#1f7a5c',
          600: '#17654b',
          700: '#124c39',
          800: '#0e3a2d',
          900: '#0a2a21',
        },
        gold: '#c9a227',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,28,46,0.06), 0 8px 24px rgba(15,28,46,0.06)',
      },
    },
  },
  plugins: [],
};
