import { ViewStyle } from 'react-native';
import { BORDER_RADIUS, SPACING, standardShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Card component styles for RPG aesthetic
 */
export const createCardStyles = (theme: ThemeColors) => ({
  // Basic card with gradient
  card: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...standardShadows.card,
  } as ViewStyle,
  
  cardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: theme.archiveBorder || 'rgba(217, 119, 6, 0.2)',
  } as ViewStyle,
  
  cardGradientAccent: (accentColor: string) => ({
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: accentColor,
  } as ViewStyle),
  
  // Foundation cards (2-column grid)
  foundationCard: {
    width: '48%',
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    ...standardShadows.card,
  } as ViewStyle,
  
  foundationCardGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
    minHeight: 140,
  } as ViewStyle,
  
  foundationCardGradientAccent: (accentColor: string) => ({
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: accentColor,
    minHeight: 140,
  } as ViewStyle),
  
  // Section cards
  sectionCard: {
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
    marginBottom: SPACING.xxl,
    ...standardShadows.card,
  } as ViewStyle,
  
  sectionCardGradient: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  } as ViewStyle,
  
  sectionCardGradientAccent: (accentColor: string) => ({
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: accentColor,
  } as ViewStyle),
  
  // Story cards
  storyCard: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...standardShadows.floating,
  } as ViewStyle,
  
  // Modal/Dialog cards
  modalCard: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    backgroundColor: theme.archiveCard || 'rgba(40, 25, 15, 0.98)',
    ...standardShadows.modal,
  } as ViewStyle,
  
  // Character/Personality specific cards
  characterCard: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: theme.card || 'rgba(35, 25, 20, 0.98)',
    ...standardShadows.card,
  } as ViewStyle,
  
  personalityCard: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: theme.card || 'rgba(25, 35, 50, 0.95)',
    ...standardShadows.card,
  } as ViewStyle,
});

export type CardStyles = ReturnType<typeof createCardStyles>;
