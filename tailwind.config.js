/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
    extend: {
      colors: {
        artfix: {
          blue: '#1a3a5c',
                      teal: '#0d9488',
                      green: '#16a34a',
                      yellow: '#ca8a04',
                      purple: '#7c3aed',
                      red: '#dc2626',
            }
      }
    },
  },
  plugins: [],
    }
