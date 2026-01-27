/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        archive: {
          dark: '#0a0a0a',
          darker: '#000000',
          purple: '#6B46C1',
          purpleLight: '#8B5CF6',
          purpleDark: '#5B21B6',
          teal: '#0D9488',
          tealDark: '#0F766E',
        },
        void: {
          black: '#000000',
          dark: '#1a0a1a',
          purple: '#2D1B4E',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        body: ['CrimsonPro-Medium-Italic', 'serif'],
        ui: ['Quicksand-SemiBold', 'sans-serif'],
        display: ['BeyondWonderland', 'serif'],
        titleWhite: ['FontTitle-White', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

