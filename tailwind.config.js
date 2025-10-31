/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 50%, #7C3AED 100%)',
        'gradient-conic': 'conic-gradient(from 0deg, #7C3AED, #22D3EE, #F59E0B, #7C3AED)',
      },
      animation: {
        'count-up': 'count-up 1s ease-out',
      },
      keyframes: {
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}