import type { Config } from 'tailwindcss';

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'dot-matrix': ['"DotGothic16"', 'sans-serif'], // Add Google Font here
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
    screens: {
      isStandalone: { raw: '(display-mode: standalone)' },
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
