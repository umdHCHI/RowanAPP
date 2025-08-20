import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, engravedText, FONT_SIZES, FONT_WEIGHTS, glowingText, SPACING, standardShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Base styles for common UI patterns across the app
 */
export const createBaseStyles = (theme: ThemeColors) => ({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: theme.archiveBackground || theme.background || 'rgba(15, 10, 20, 0.98)',
  } as ViewStyle,

  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: SPACING.lg,
  } as ViewStyle,

  safeContainer: {
    flex: 1,
    backgroundColor: theme.archiveBackground || theme.background,
  } as ViewStyle,

  // Common card styles
  card: {
    backgroundColor: theme.archiveCard || theme.card || 'rgba(40, 25, 15, 0.98)',
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.archiveBorder || theme.border || 'rgba(217, 119, 6, 0.2)',
    ...standardShadows.card,
  } as ViewStyle,

  // Text effects
  engravedText: engravedText,
  glowingText: glowingText(theme),

  // Common button styles
  button: {
    backgroundColor: theme.primary || '#4338ca',
    padding: SPACING.lg,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    marginVertical: SPACING.sm,
    ...standardShadows.button,
  } as ViewStyle,

  buttonText: {
    color: theme.archiveText || theme.text || '#ffffff',
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
  } as TextStyle,

  secondaryButton: {
    backgroundColor: 'transparent',
    padding: SPACING.lg,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.archiveBorder || theme.border,
  } as ViewStyle,

  secondaryButtonText: {
    color: theme.archiveAccent || theme.primary || '#4ee6e6',
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.md,
  } as TextStyle,

  // Common input styles
  input: {
    backgroundColor: theme.archiveCard || 'rgba(40, 25, 15, 0.5)',
    color: theme.archiveText || theme.text || '#ffffff',
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.archiveBorder || theme.border,
    fontSize: FONT_SIZES.md,
  } as ViewStyle & TextStyle,

  inputFocused: {
    borderColor: theme.archiveAccent || theme.primary,
  } as ViewStyle,

  // Common text styles
  text: {
    color: theme.archiveText || theme.text || '#ffffff',
    fontSize: FONT_SIZES.md,
  } as TextStyle,

  title: {
    color: theme.archiveAccent || theme.primary || '#4ee6e6',
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.lg,
    ...engravedText,
  } as TextStyle,

  subtitle: {
    color: theme.archiveAccentSecondary || '#d4af37',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.md,
  } as TextStyle,

  bodyText: {
    color: theme.archiveText || theme.text || '#ffffff',
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  } as TextStyle,

  captionText: {
    color: theme.archiveSubtext || '#888888',
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  } as TextStyle,

  // Navigation styles
  tabBar: {
    backgroundColor: theme.archiveCard || theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.archiveBorder || theme.border,
    height: 60,
  } as ViewStyle,

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  } as ViewStyle,

  tabIcon: {
    fontSize: FONT_SIZES.xxl,
    marginBottom: SPACING.xs,
  } as TextStyle,

  tabLabel: {
    fontSize: FONT_SIZES.xs,
    color: theme.archiveSubtext || theme.text,
  } as TextStyle,

  activeTabIcon: {
    color: theme.archiveAccent || theme.primary,
  } as TextStyle,

  activeTabLabel: {
    color: theme.archiveAccent || theme.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  } as TextStyle,

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  modalContent: {
    backgroundColor: theme.archiveCard || theme.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    margin: SPACING.xl,
    maxHeight: '80%',
    ...standardShadows.modal,
  } as ViewStyle,

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.archiveBorder || theme.border,
  } as ViewStyle,

  modalTitle: {
    color: theme.archiveAccent || theme.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  closeButton: {
    padding: SPACING.sm,
  } as ViewStyle,

  closeButtonText: {
    color: theme.archiveSubtext || '#888888',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.archiveBackground || theme.background,
  } as ViewStyle,

  loadingText: {
    color: theme.archiveText || theme.text,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  } as TextStyle,

  // Error states
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  } as ViewStyle,

  errorText: {
    color: '#dc2626',
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  } as TextStyle,

  // Success states
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  } as ViewStyle,

  successText: {
    color: '#059669',
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  } as TextStyle,

  // List styles
  listContainer: {
    paddingVertical: SPACING.sm,
  } as ViewStyle,

  listItem: {
    backgroundColor: theme.archiveCard || theme.card,
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: theme.archiveBorder || theme.border,
  } as ViewStyle,

  listItemPressed: {
    opacity: 0.8,
  } as ViewStyle,

  // Separator styles
  separator: {
    height: 1,
    backgroundColor: theme.archiveBorder || theme.border,
    marginVertical: SPACING.md,
  } as ViewStyle,

  sectionSeparator: {
    height: 2,
    backgroundColor: theme.archiveAccentSecondary || '#d4af37',
    marginVertical: SPACING.lg,
    opacity: 0.3,
  } as ViewStyle,
});

export type BaseStyles = ReturnType<typeof createBaseStyles>;
