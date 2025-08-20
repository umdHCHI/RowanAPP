import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_WEIGHTS, SPACING } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Progress bar component styles
 */
export const createProgressStyles = (theme: ThemeColors) => ({
  // Basic progress bars
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: BORDER_RADIUS.small,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  
  progressBarSmall: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 3,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  
  progressBarTiny: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 2,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  
  // Progress fills
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  progressFillSmall: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,
  
  progressFillTiny: {
    height: '100%',
    borderRadius: 2,
  } as ViewStyle,
  
  // Progress segments
  progressSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
  } as ViewStyle,
  
  progressSegmentActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.6)',
  } as ViewStyle,
});

/**
 * Badge component styles
 */
export const createBadgeStyles = (theme: ThemeColors) => ({
  // Basic badges
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small + 2,
  } as ViewStyle,
  
  badgeText: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.semibold,
  } as TextStyle,
  
  // Status badges
  badgeStatus: {
    backgroundColor: 'rgba(75, 85, 99, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeStatusText: {
    color: theme.archiveSubtext || '#888888',
    fontSize: 9,
  } as TextStyle,
  
  // Success badges
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeSuccessText: {
    color: theme.statusSuccess || '#10B981',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,
  
  // Warning badges
  badgeWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeWarningText: {
    color: theme.statusWarning || '#F59E0B',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,
  
  // Error badges
  badgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeErrorText: {
    color: theme.statusError || '#ef4444',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,
  
  // Rarity badges
  badgeCommon: {
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeRare: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeEpic: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  badgeLegendary: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle,
  
  // Custom color badges
  badgeCustom: (backgroundColor: string) => ({
    backgroundColor: backgroundColor,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  } as ViewStyle),
  
  badgeCustomText: (color: string) => ({
    color: color,
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle),
});

export type ProgressStyles = ReturnType<typeof createProgressStyles>;
export type BadgeStyles = ReturnType<typeof createBadgeStyles>;
