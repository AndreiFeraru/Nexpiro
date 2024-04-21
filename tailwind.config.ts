import type { Config } from 'tailwindcss';

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
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
