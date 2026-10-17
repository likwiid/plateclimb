// SPDX-License-Identifier: GPL-3.0-or-later
// ─── Color Palette ──────────────────────────────────────────────────────────

export const colors = {
  // Brand / Accent
  indigo: '#6366F1',
  indigoLight: '#818CF8',
  indigoDark: '#4F46E5',

  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Extended palette
  purple: '#A855F7',
  violet: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#10B981',
  amber: '#FBBF24',

  // Text
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    muted: '#71717A',
    dim: '#52525B',
    white: '#FFFFFF',
  },

  // Backgrounds
  bg: {
    base: '#0A0A0F',
    surface: '#141419',
    elevated: '#1E1E26',
    black: '#000000',
  },

  // Borders
  border: {
    default: '#2A2A35',
    light: '#3A3A45',
  },

  // Set type colors (workout)
  setType: {
    warmup: '#FBBF24',
    working: '#6366F1',
    dropset: '#F97316',
    myo: '#EC4899',
    lengthened: '#8B5CF6',
  },

  // Overlay
  overlay: {
    light: 'rgba(0,0,0,0.5)',
    medium: 'rgba(0,0,0,0.6)',
    heavy: 'rgba(0,0,0,0.7)',
    dark: 'rgba(0,0,0,0.85)',
  },
} as const;

// ─── Spacing Scale ──────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const typography = {
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '5xl': 48,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// ─── Dimensions ─────────────────────────────────────────────────────────────

export const dimensions = {
  screenPaddingHorizontal: 16,
  cardBorderRadius: 12,
  buttonBorderRadius: 8,
  inputBorderRadius: 8,
  bottomSheetRadius: 24,
  iconSizeSmall: 16,
  iconSizeMedium: 20,
  iconSizeLarge: 24,
  handleWidth: 36,
  handleHeight: 4,
} as const;

// ─── Animation Timing ───────────────────────────────────────────────────────

export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
  searchDebounce: 300,
  timerTick: 16,
} as const;

// ─── Bundled Theme Object ───────────────────────────────────────────────────

export const theme = {
  colors,
  spacing,
  typography,
  dimensions,
  timing,
} as const;
