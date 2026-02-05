/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-brown': '#6B4F4B',      // A deep, rich brown for text and primary elements
        'wood-light': '#F0EAD6',      // A soft, light beige for backgrounds, like bleached wood
        'wood-accent': '#C8A27C',     // A warm, tan accent for buttons and highlights
        'wood-accent-hover': '#B48A64', // A slightly darker accent for hover states
        'password-weak': '#dc2626',   // Red
        'password-medium': '#f59e0b', // Amber
        'password-strong': '#16a34a', // Green
        'nav-brown': '#392618',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'], // An elegant, high-contrast serif for headings
        'sans': ['Roboto', 'sans-serif'], // A clean, modern sans-serif for body text
        'realwood': ['Realwood', 'sans-serif'], // Custom wood-themed font
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}