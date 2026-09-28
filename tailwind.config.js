/** @type {import('tailwindcss').Config} */
const tailwindScrollbar = require('tailwind-scrollbar');
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      zIndex: {
        '60': '60',
        '100': '100',
        '999': '999',
      },
      borderWidth: {
        '0.33': '0.33px',
      },
      rotate: {
        'y-0': '0deg',
        'y-90': '90deg',
        '-y-90': '-90deg',
        'x-0': '0deg',
        'x-90': '90deg',
        '-x-90': '-90deg',
        'x-180': '180deg',
      },
      borderColor: {
        'custom-gray': 'rgba(74, 74, 74, 1)',
      },
      boxShadow: {
        'custom1': '0px 4px 4px 0px #169CB012',
      },
      colors: {
        'custom-blue': '#028fa3',
        'weyngo': {
          'blue': '#155EEF',
          'vibrant': '#2589FF',
          'navy': '#071B49',
          'violet': '#6D28D9',
          'premium': '#8B2BE2',
          'accent': '#C026D3',
          'page': '#F8FAFC',
          'card': '#FFFFFF',
          'text': '#0F172A',
          'muted': '#475569',
        },
      },
      boxShadow: {
        'blue-300/10': '0px 4px 4px 0px rgba(125, 153, 180, 0.1)',
      },
      fontSize: {
        'xxs': '0.625rem',  // 10px
        'xxxs': '0.5rem',   // 8px, for example
        // add more custom sizes as needed
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "custom-gradient": "linear-gradient(90deg, #0B2330 0%, rgba(37, 65, 80, 0.84) 46.26%, rgba(65, 98, 115, 0.76) 79.85%)",
        "custom-shadow1": "0px 3px 10px 0px #2084D90F",
        "custom-gradient2": "linear-gradient(180.41deg, rgba(24, 184, 206, 0) 0.36%, rgba(24, 184, 206, 0.5) 242.2%)",
      },
      boxShadowColor: {
        "custom-shadow2": "0px 4px 4px 0px rgba(22, 156, 176, 0.07)",
      },

      backgroundColor: {
        'custom-light-blue': 'rgba(2, 143, 163, 0.09)',
      },
      opacity: {
        '1': '0.01',
        '0.5': '0.005',
        '2': '0.02',
        '2.5': '0.025',
      },
      animation: {
        'scroll-left': 'scroll-left 20s linear infinite',
        'scroll-right': 'scroll-right 20s linear infinite',
        'scroll': 'scroll 20s linear infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scroll': {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },

      },

    },

    screens: {
      sm: '640px',
      md: '768px', // This is the default
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    tailwindScrollbar,
    function ({ addUtilities }) {
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none', /* Internet Explorer 10+ */
          'scrollbar-width': 'none', /* Firefox */
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none', /* Safari and Chrome */
        },
      });
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin', /* Firefox */
        },
        '.scrollbar-thumb-rounded': {
          'scrollbar-color': '#028FA3 #f0f0f0', /* thumb color, track color */
        },
        '.scrollbar-thumb-rounded::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thumb-rounded::-webkit-scrollbar-thumb': {
          backgroundColor: '#888', /* Thumb color for Webkit browsers */
          borderRadius: '5px', /* Rounded corners for thumb */
        },
        '.scrollbar-thumb-rounded::-webkit-scrollbar-track': {
          backgroundColor: '#f0f0f0', /* Track color for Webkit browsers */
        },
        /* Hide scrollbar buttons in Webkit browsers */
        '.scrollbar-thumb-rounded::-webkit-scrollbar-button': {
          width: '0',
          height: '0',
          display: 'none', /* Ensures arrows are hidden */
        },
      });
      addUtilities({
        /* Hide scrollbar buttons (arrows) in WebKit browsers (Chrome, Safari, Edge) */
        '.no-scrollbar-arrows::-webkit-scrollbar-button': {
          display: 'none',
        },
      });


    },
  ],
};