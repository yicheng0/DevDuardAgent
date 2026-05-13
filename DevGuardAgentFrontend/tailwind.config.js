/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          background: '#F8FAFC',
          panel: '#FFFFFF',
          primary: '#2563EB',
          danger: '#DC2626',
          warning: '#F97316',
          success: '#16A34A',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
