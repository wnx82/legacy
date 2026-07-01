/**
 * Tokens de design Legacy — sobres, rassurants, non morbides.
 * Utilisés à la fois par le préréglage Tailwind (`tailwind-preset.js`) et
 * directement par les composants React et l'application Flutter (portage
 * manuel des valeurs, voir apps/app/lib/theme).
 */
export const colors = {
  midnightBlue: '#0B1E3D', // bleu nuit — couleur principale, confiance
  white: '#FFFFFF',
  lightBeige: '#F5F1EA', // fond doux
  softGray: '#6B7280', // texte secondaire
  softGrayLight: '#E5E7EB', // bordures, séparateurs
  sageGreen: '#7C9885', // accent positif, sérénité
  sageGreenLight: '#E4EDE7',
  discreetRed: '#B3261E', // alertes importantes uniquement
  discreetRedLight: '#FBEAE9',
  discreetOrange: '#B5620A', // avertissements
  discreetOrangeLight: '#FBF0E1',
} as const;

export const statusColors = {
  neutral: { bg: colors.softGrayLight, text: colors.softGray },
  info: { bg: '#E4EDF7', text: colors.midnightBlue },
  success: { bg: colors.sageGreenLight, text: colors.sageGreen },
  warning: { bg: colors.discreetOrangeLight, text: colors.discreetOrange },
  danger: { bg: colors.discreetRedLight, text: colors.discreetRed },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '22px',
    '2xl': '28px',
    '3xl': '36px',
  },
} as const;

export type StatusTone = keyof typeof statusColors;
