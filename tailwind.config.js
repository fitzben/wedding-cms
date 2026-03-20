/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Pinyon Script"', 'cursive'],
      },
      colors: {
        maroon: '#960c23',
        gold: '#C9A84C',
        ivory: '#F5EFE0',
        offwhite: '#FAF7F2',
        charcoal: '#1A1A1A',
      }
    },
  },
  plugins: [],
}

