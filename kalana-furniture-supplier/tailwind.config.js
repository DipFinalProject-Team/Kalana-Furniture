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
        'realwood': ['"Realwood"', 'sans-serif'],
      },
      animation: {
        'snowfall': 'snowfall 10s linear infinite',
        'hero-snowfall': 'hero-snowfall 12s linear infinite',
      },
      keyframes: {
        'snowfall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' },
        },
        'hero-snowfall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg) scale(0.8)' },
          '50%': { transform: 'translateY(50vh) rotate(180deg) scale(1.2)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg) scale(0.8)' },
        },
      },
    },
  },
  plugins: [],
}
