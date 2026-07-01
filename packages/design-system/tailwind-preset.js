/**
 * Préréglage Tailwind partagé par apps/website, apps/web-pro et apps/web-family.
 * Usage dans tailwind.config.js d'une app :
 *   module.exports = { presets: [require('@legacy/design-system/tailwind-preset')], content: [...] }
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        midnight: '#0B1E3D',
        beige: '#F5F1EA',
        sage: { DEFAULT: '#7C9885', light: '#E4EDE7' },
        alert: { DEFAULT: '#B3261E', light: '#FBEAE9' },
        warning: { DEFAULT: '#B5620A', light: '#FBF0E1' },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        md: '10px',
        lg: '16px',
      },
    },
  },
};
