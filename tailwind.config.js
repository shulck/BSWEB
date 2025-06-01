/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '2xl': '1400px',
      },
      colors: {
        'primary-dark': '#1a1a1a',
        'secondary-dark': '#2a2a2a',
        'surface-dark': '#242424',
        'accent-orange': '#FF6B35',
        'accent-teal': '#4ECDC4',
        'orange': '#FF6B35',
        'teal': '#4ECDC4',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
        'teal-gradient': 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        'accent-gradient': 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
      },
      boxShadow: {
        'dark': '0 10px 25px rgba(0, 0, 0, 0.3)',
        'medium-dark': '0 20px 40px rgba(0, 0, 0, 0.4)',
      },
      borderColor: {
        'dark': 'rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
