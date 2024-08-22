import type { Config } from 'tailwindcss';

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'dot-matrix': ['"DotGothic16"', 'sans-serif'], // Add Google Font here
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
  },
  safelist: [
    {
      pattern: /alert-.*/,
      variants: ['info', 'success', 'warning', 'error'],
    },
  ],
} satisfies Config;
