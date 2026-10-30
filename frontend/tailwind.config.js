/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: '#FAF6EE',
          paper: '#FFFEFA',
          grid: '#F0ECE1',
          border: '#E8DEC8',
          text: '#4A3E3D',
          muted: '#8C7E7A',
          yellow: '#FFF3B0',
          butter: '#FEF9C3',
          sunflower: '#E9A825',
          gold: '#D97706',
          peach: '#FFE5D9',
          pink: '#FCD5CE',
          rose: '#F8B4B4',
          sage: '#E2ECE9',
          green: '#99B898',
          lavender: '#E5D9F2',
          purple: '#B39DDB',
          mint: '#D8F3DC',
          brown: '#5D4037',
          terracotta: '#D47A60',
        },
      },
      fontFamily: {
        hand: ['"Patrick Hand"', '"Caveat"', 'cursive'],
        cozy: ['"Quicksand"', '"Nunito"', 'sans-serif'],
        display: ['"Itim"', '"Patrick Hand"', 'cursive'],
      },
      boxShadow: {
        'cozy': '0 4px 15px -2px rgba(138, 108, 76, 0.08), 0 2px 6px -1px rgba(138, 108, 76, 0.04)',
        'cozy-md': '0 6px 20px -3px rgba(138, 108, 76, 0.12), 0 4px 8px -2px rgba(138, 108, 76, 0.06)',
        'cozy-lg': '0 12px 30px -4px rgba(138, 108, 76, 0.16), 0 6px 12px -3px rgba(138, 108, 76, 0.08)',
        'paper': '2px 3px 0px 0px rgba(74, 62, 61, 0.1)',
        'sticker': '0 2px 5px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'cozy': '1.5rem',
        'cozy-lg': '2rem',
        'bubble': '2.5rem',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(#E8DEC8 1px, transparent 1px)",
        'lined-pattern': "linear-gradient(to bottom, transparent 95%, #E8DEC8 95%)",
      },
    },
  },
  plugins: [],
}
