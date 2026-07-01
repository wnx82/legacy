/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@legacy/design-system/tailwind-preset')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
};
