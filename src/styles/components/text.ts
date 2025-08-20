import { TextStyle } from 'react-native';
import { engravedText, FONT_FAMILIES, FONT_SIZES, FONT_WEIGHTS, glowingText, SPACING, standardTextShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Text component styles following typography hierarchy for RPG aesthetic
 */
export const createTextStyles = (theme: ThemeColors) => ({
  // Title hierarchy
  titleLarge: {
    fontFamily: FONT_FAMILIES.TITLE,
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    color: theme.archiveAccent || '#4ee6e6',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 1,
    ...engravedText,
  } as TextStyle,
  
  titleMedium: {
    fontFamily: FONT_FAMILIES.TITLE,
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: theme.archiveAccent || '#4ee6e6',
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 1,
    ...engravedText,
  } as TextStyle,
  
  titleSmall: {
    fontFamily: FONT_FAMILIES.TITLE,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: theme.archiveAccent || '#4ee6e6',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    ...engravedText,
  } as TextStyle,
  
  // Subtitle hierarchy
  subtitleLarge: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: theme.archiveAccentSecondary || '#d4af37',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as TextStyle,
  
  subtitleMedium: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: theme.archiveAccentSecondary || '#d4af37',
    textAlign: 'center',
    marginBottom: SPACING.xs + 2,
  } as TextStyle,
  
  subtitleSmall: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: theme.archiveAccentSecondary || '#d4af37',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  } as TextStyle,
  
  // Body text hierarchy
  bodyLarge: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.md,
    color: theme.archiveText || '#ffffff',
    lineHeight: 24,
  } as TextStyle,
  
  bodyMedium: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.sm,
    color: theme.archiveText || '#ffffff',
    lineHeight: 20,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.xs,
    color: theme.archiveText || '#ffffff',
    lineHeight: 16,
  } as TextStyle,
  
  // Caption text
  caption: {
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: 10,
    color: theme.archiveSubtext || '#888888',
    fontStyle: 'italic',
  } as TextStyle,
  
  // Special effects text
  glowingTitle: {
    ...glowingText(theme),
    fontFamily: FONT_FAMILIES.TITLE,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
  } as TextStyle,
  
  mysticText: {
    ...standardTextShadows.mystic,
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.md,
    color: theme.archiveAccent || '#4ee6e6',
  } as TextStyle,
  
  // Accent text variations
  accentText: (color: string) => ({
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: color,
  } as TextStyle),
  
  accentTextLarge: (color: string) => ({
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: color,
  } as TextStyle),
  
  accentTextSmall: (color: string) => ({
    fontFamily: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: color,
  } as TextStyle),
  
  // Status text colors
  successText: {
    color: theme.statusSuccess || '#10b981',
    fontWeight: FONT_WEIGHTS.medium,
  } as TextStyle,
  
  warningText: {
    color: theme.statusWarning || '#f59e0b',
    fontWeight: FONT_WEIGHTS.medium,
  } as TextStyle,
  
  errorText: {
    color: theme.statusError || '#ef4444',
    fontWeight: FONT_WEIGHTS.medium,
  } as TextStyle,
  
  infoText: {
    color: theme.statusInfo || '#3b82f6',
    fontWeight: FONT_WEIGHTS.medium,
  } as TextStyle,
});

export type TextStyles = ReturnType<typeof createTextStyles>;
