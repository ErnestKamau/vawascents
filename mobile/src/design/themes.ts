/**
 * Aura — Semantic Themes
 * auraLight / auraDark (green, main app) and auraLightAuth / auraDarkAuth (violet,
 * onboarding/auth/otp/unlock flow) map semantic tokens → primitives.
 * Components consume these — never raw hex.
 */

import {
  violet,
  green,
  orchid,
  gold,
  neutral,
  softWhite,
  red,
  amber,
  blue,
  spacing,
  radius,
  opacity,
  blur,
  zIndex,
  iconSize,
  touchTarget,
  GlassLevel,
} from './tokens/primitives';
import { typography, fontFamily } from './tokens/typography';
import { duration, easing, spring, pressScale } from './tokens/motion';
import { ElevationLevel, getElevationStyle } from './tokens/elevation';
import { ViewStyle } from 'react-native';

export type Brand = 'green' | 'violet';

// ---------------------------------------------------------------------------
// Glass recipe params per level
// ---------------------------------------------------------------------------

export type GlassRecipe = {
  level: GlassLevel;
  blurIntensity: number;
  tint: string;
  borderColor: string;
  borderAlpha: number;
  highlightColor: string;
};

/** Dark-glass hairline tint per brand: violet[200] for auth, green[200] for the main app. */
const DARK_GLASS_BORDER_RGB: Record<Brand, string> = {
  violet: '199,185,246',
  green: '174,219,187',
};

function makeGlassRecipes(mode: 'light' | 'dark', brand: Brand): Record<GlassLevel, GlassRecipe> {
  if (mode === 'light') {
    return {
      0: { level: 0, blurIntensity: blur.glass0, tint: 'transparent', borderColor: 'transparent', borderAlpha: 0, highlightColor: 'transparent' },
      1: { level: 1, blurIntensity: blur.glass1, tint: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.5)', borderAlpha: 0.5, highlightColor: 'rgba(255,255,255,0.4)' },
      2: { level: 2, blurIntensity: blur.glass2, tint: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.55)', borderAlpha: 0.55, highlightColor: 'rgba(255,255,255,0.5)' },
      3: { level: 3, blurIntensity: blur.glass3, tint: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.6)', borderAlpha: 0.6, highlightColor: 'rgba(255,255,255,0.55)' },
      4: { level: 4, blurIntensity: blur.glass4, tint: 'rgba(248,246,251,0.78)', borderColor: 'rgba(255,255,255,0.65)', borderAlpha: 0.65, highlightColor: 'rgba(255,255,255,0.6)' },
      5: { level: 5, blurIntensity: blur.glass5, tint: 'rgba(248,246,251,0.82)', borderColor: 'rgba(255,255,255,0.7)', borderAlpha: 0.7, highlightColor: 'rgba(255,255,255,0.65)' },
    };
  }
  // Dark: stronger glass, brand-tinted hairline border
  const b = DARK_GLASS_BORDER_RGB[brand];
  return {
    0: { level: 0, blurIntensity: blur.glass0, tint: 'transparent', borderColor: 'transparent', borderAlpha: 0, highlightColor: 'transparent' },
    1: { level: 1, blurIntensity: blur.glass1, tint: 'rgba(29,22,41,0.55)', borderColor: `rgba(${b},0.12)`, borderAlpha: 0.12, highlightColor: 'rgba(255,255,255,0.06)' },
    2: { level: 2, blurIntensity: blur.glass2, tint: 'rgba(29,22,41,0.65)', borderColor: `rgba(${b},0.16)`, borderAlpha: 0.16, highlightColor: 'rgba(255,255,255,0.08)' },
    3: { level: 3, blurIntensity: blur.glass3, tint: 'rgba(39,30,54,0.72)', borderColor: `rgba(${b},0.2)`, borderAlpha: 0.2, highlightColor: 'rgba(255,255,255,0.1)' },
    4: { level: 4, blurIntensity: blur.glass4, tint: 'rgba(39,30,54,0.8)', borderColor: `rgba(${b},0.24)`, borderAlpha: 0.24, highlightColor: 'rgba(255,255,255,0.12)' },
    5: { level: 5, blurIntensity: blur.glass5, tint: 'rgba(20,15,29,0.78)', borderColor: `rgba(${b},0.28)`, borderAlpha: 0.28, highlightColor: 'rgba(255,255,255,0.14)' },
  };
}

// ---------------------------------------------------------------------------
// Semantic color surfaces
// ---------------------------------------------------------------------------

export type SemanticColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;

  backgroundSecondary: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  borderSubtle: string;
  borderFocus: string;
  primaryHover: string;
  primaryPressed: string;
  primaryMuted: string;
  successMuted: string;
  warningMuted: string;
  dangerMuted: string;
  infoMuted: string;
  skeleton: string;
  skeletonHighlight: string;
  overlay: string;
  divider: string;
  /** Gold accent — premium CTAs, receipts, loyalty highlights */
  gold: string;
  goldMuted: string;
  /** Ambient aura wash gradient stops */
  horizonStart: string;
  horizonMid: string;
  horizonEnd: string;
};

function buildLightColors(brand: Brand): SemanticColors {
  const b = brand === 'green' ? green : violet;
  return {
    primary: b[500],
    secondary: b[700],
    accent: orchid[500],
    background: neutral[50],
    surface: neutral[0],
    text: neutral[900],
    textSecondary: neutral[500],
    border: neutral[200],
    error: red[600],
    success: '#1D9A6C',
    warning: amber[600],
    info: blue[600],
    tint: b[500],
    tabIconDefault: neutral[400],
    tabIconSelected: b[500],

    backgroundSecondary: neutral[100],
    surfaceRaised: neutral[0],
    surfaceOverlay: 'rgba(24,11,51,0.4)',
    textMuted: neutral[400],
    textInverse: softWhite.primary,
    textOnPrimary: softWhite.primary,
    borderSubtle: neutral[100],
    borderFocus: b[500],
    primaryHover: b[600],
    primaryPressed: b[700],
    primaryMuted: b[100],
    successMuted: '#E3F6EE',
    warningMuted: amber[50],
    dangerMuted: red[50],
    infoMuted: blue[50],
    skeleton: neutral[200],
    skeletonHighlight: neutral[100],
    overlay: 'rgba(24,11,51,0.45)',
    divider: neutral[200],
    gold: gold[500],
    goldMuted: gold[50],
    horizonStart: brand === 'green' ? green[50] : orchid[50],
    horizonMid: brand === 'green' ? neutral[50] : violet[50],
    horizonEnd: neutral[50],
  };
}

function buildDarkColors(brand: Brand): SemanticColors {
  const b = brand === 'green' ? green : violet;
  const borderRgb = DARK_GLASS_BORDER_RGB[brand];
  return {
    primary: b[400],
    secondary: b[300],
    accent: orchid[400],
    background: neutral[950],
    surface: neutral[900],
    text: softWhite.primary,
    textSecondary: softWhite.secondary,
    border: `rgba(${borderRgb},0.12)`,
    error: red[400],
    success: '#4ADE9B',
    warning: amber[400],
    info: blue[400],
    tint: b[400],
    tabIconDefault: softWhite.muted,
    tabIconSelected: b[300],

    backgroundSecondary: neutral[900],
    surfaceRaised: neutral[850],
    surfaceOverlay: 'rgba(0,0,0,0.55)',
    textMuted: softWhite.muted,
    textInverse: neutral[950],
    textOnPrimary: neutral[950],
    borderSubtle: `rgba(${borderRgb},0.08)`,
    borderFocus: b[400],
    primaryHover: b[300],
    primaryPressed: b[500],
    primaryMuted: brand === 'green' ? 'rgba(46,128,84,0.2)' : 'rgba(109,63,224,0.2)',
    successMuted: 'rgba(74,222,155,0.18)',
    warningMuted: 'rgba(245,158,11,0.18)',
    dangerMuted: 'rgba(239,68,68,0.18)',
    infoMuted: 'rgba(59,130,246,0.18)',
    skeleton: neutral[800],
    skeletonHighlight: neutral[700],
    overlay: 'rgba(0,0,0,0.6)',
    divider: `rgba(${borderRgb},0.1)`,
    gold: gold[400],
    goldMuted: 'rgba(221,169,53,0.16)',
    horizonStart: brand === 'green' ? green[950] : orchid[950],
    horizonMid: brand === 'green' ? neutral[950] : violet[950],
    horizonEnd: neutral[950],
  };
}

// ---------------------------------------------------------------------------
// Full theme object
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: SemanticColors;
  spacing: typeof spacing;
  radius: typeof radius;
  opacity: typeof opacity;
  blur: typeof blur;
  zIndex: typeof zIndex;
  iconSize: typeof iconSize;
  touchTarget: typeof touchTarget;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  duration: typeof duration;
  easing: typeof easing;
  spring: typeof spring;
  pressScale: typeof pressScale;
  glass: Record<GlassLevel, GlassRecipe>;
  getElevation: (level: ElevationLevel) => ViewStyle;
};

function buildTheme(mode: ThemeMode, brand: Brand): AppTheme {
  return {
    mode,
    colors: mode === 'light' ? buildLightColors(brand) : buildDarkColors(brand),
    spacing,
    radius,
    opacity,
    blur,
    zIndex,
    iconSize,
    touchTarget,
    typography,
    fontFamily,
    duration,
    easing,
    spring,
    pressScale,
    glass: makeGlassRecipes(mode, brand),
    getElevation: (level) => getElevationStyle(level, mode),
  };
}

/** Main app palette — green (Home, Product, Cart, Orders, Profile, Wallet). */
export const auraLight = buildTheme('light', 'green');
export const auraDark = buildTheme('dark', 'green');

/** Auth-flow palette — violet (onboarding, auth, OTP, forgot-password, unlock). */
export const auraLightAuth = buildTheme('light', 'violet');
export const auraDarkAuth = buildTheme('dark', 'violet');

export const Themes = {
  light: auraLight,
  dark: auraDark,
} as const;

export type ThemeName = keyof typeof Themes;

export type LegacyTheme = SemanticColors;
