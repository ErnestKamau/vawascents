/**
 * Aura — Primitive Tokens
 * Raw values with no semantic meaning. Components never reference these directly.
 */

// ---------------------------------------------------------------------------
// Color ramps (50–950)
// ---------------------------------------------------------------------------

/** Brand violet ramp — anchors: 200 #C7B9F6, 400 #8B6BEF, 500 #6D3FE0, 700 #4B2499 */
export const violet = {
  50: '#F5F2FD',
  100: '#E9E1FB',
  200: '#C7B9F6',
  300: '#A68CF0',
  400: '#8B6BEF',
  500: '#6D3FE0',
  600: '#5B2FC9',
  700: '#4B2499',
  800: '#381A73',
  900: '#271252',
  950: '#180B33',
} as const;

/** Accent orchid/magenta ramp — anchors: 200 #F0B8E8, 400 #D94FC4, 500 #BC27A4 */
export const orchid = {
  50: '#FDF2FB',
  100: '#FBE1F7',
  200: '#F0B8E8',
  300: '#E686D8',
  400: '#D94FC4',
  500: '#BC27A4',
  600: '#9B1D87',
  700: '#78166A',
  800: '#57104C',
  900: '#390A32',
  950: '#23061F',
} as const;

/** Gold accent — premium CTAs, receipts, bottle-cap highlights */
export const gold = {
  50: '#FDF8EC',
  100: '#FAEEC9',
  200: '#F3DC93',
  300: '#E9C25C',
  400: '#DDA935',
  500: '#C68D24',
  600: '#A16E1B',
  700: '#7C5316',
  800: '#5C3E14',
  900: '#402B10',
  950: '#271A09',
} as const;

/** Violet-tinted neutrals — never pure black/white */
export const neutral = {
  0: '#FFFFFF',
  50: '#F8F6FB',
  100: '#EFEBF5',
  200: '#DDD5EA',
  300: '#C1B5D6',
  400: '#8F80A8',
  500: '#6C5C86',
  600: '#4F4265',
  700: '#3A2F4C',
  800: '#271E36',
  850: '#1D1629',
  900: '#140F1D',
  950: '#0C0812',
  1000: '#06040B',
} as const;

/** Soft white for dark-mode text (never pure #FFFFFF on dark) */
export const softWhite = {
  primary: '#F6F2FA',
  secondary: '#D3C5E3',
  muted: '#9C8AB4',
  disabled: '#6A5C80',
} as const;

export const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
} as const;

export const amber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
} as const;

export const blue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554',
} as const;

// ---------------------------------------------------------------------------
// Spacing (2/4/8-based scale)
// ---------------------------------------------------------------------------

export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  11: 64,
  12: 80,
  13: 96,
} as const;

export type SpacingKey = keyof typeof spacing;

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  '2xl': 36,
  pill: 9999,
  circle: 9999,
} as const;

export type RadiusKey = keyof typeof radius;

// ---------------------------------------------------------------------------
// Opacity
// ---------------------------------------------------------------------------

export const opacity = {
  0: 0,
  5: 0.05,
  8: 0.08,
  10: 0.1,
  12: 0.12,
  16: 0.16,
  20: 0.2,
  24: 0.24,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,
} as const;

// ---------------------------------------------------------------------------
// Blur intensities (expo-blur intensity 0–100)
// ---------------------------------------------------------------------------

export const blur = {
  glass0: 0,
  glass1: 12,
  glass2: 24,
  glass3: 36,
  glass4: 48,
  glass5: 64,
} as const;

export type GlassLevel = 0 | 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// Z-index
// ---------------------------------------------------------------------------

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  drawer: 450,
  toast: 500,
  tooltip: 600,
  critical: 900,
} as const;

// ---------------------------------------------------------------------------
// Icon sizes
// ---------------------------------------------------------------------------

export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
} as const;

/** Minimum touch target (a11y) */
export const touchTarget = 44;
