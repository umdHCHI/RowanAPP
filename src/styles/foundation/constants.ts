import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Typography constants
export const FONT_FAMILIES = {
  TITLE: 'serif',
  TEXT: 'sans-serif', 
  BODY: 'sans-serif',
  PIXEL: 'pixel',
} as const;

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width,
  height,
} as const;

// Common spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Common border radius values
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
} as const;

// Common font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Common font weights
export const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Shadow presets
export const SHADOWS = {
  small: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
