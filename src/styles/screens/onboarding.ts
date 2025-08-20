import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../foundation';
import { ThemeColors, onboardingTheme } from '../theme';

/**
 * Onboarding screen styles for character path selection
 */
export const createOnboardingStyles = (theme: ThemeColors = onboardingTheme) => ({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: theme.background || onboardingTheme.background,
  } as ViewStyle,

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,

  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,

  floatingIcon: {
    position: 'absolute',
    fontSize: 28,
    color: theme.floatingIconColor || onboardingTheme.floatingIconColor,
    opacity: 0.4,
  } as TextStyle,

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.gradientOverlayBackground || onboardingTheme.gradientOverlayBackground,
  } as ViewStyle,

  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
  } as ViewStyle,

  // Header section
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  } as ViewStyle,

  archiveTitle: {
    color: theme.floatingIconColor || onboardingTheme.floatingIconColor,
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 6,
    marginBottom: SPACING.sm,
    textShadowColor: theme.gameTitleShadow || onboardingTheme.gameTitleShadow,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  } as TextStyle,

  archiveSubtitle: {
    color: theme.gameSubtitle || onboardingTheme.gameSubtitle,
    fontSize: FONT_SIZES.lg,
    fontStyle: 'italic',
    marginBottom: 15,
  } as TextStyle,

  decorativeLine: {
    width: 120,
    height: 2,
    backgroundColor: theme.decorativeLine || onboardingTheme.decorativeLine,
    opacity: 0.8,
  } as ViewStyle,

  // Curator section
  curatorSection: {
    marginBottom: SPACING.xl * 2,
  } as ViewStyle,

  curatorCard: {
    backgroundColor: theme.curatorCard || onboardingTheme.curatorCard,
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 25,
    borderWidth: 2,
    borderColor: theme.curatorCardBorder || onboardingTheme.curatorCardBorder,
    shadowColor: theme.curatorCardShadowColor || onboardingTheme.curatorCardShadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  } as ViewStyle,

  curatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  } as ViewStyle,

  curatorAvatar: {
    fontSize: 40,
    marginRight: 15,
  } as TextStyle,

  curatorInfo: {
    flex: 1,
  } as ViewStyle,

  curatorName: {
    color: theme.curatorName || onboardingTheme.curatorName,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  curatorTitle: {
    color: theme.curatorTitle || onboardingTheme.curatorTitle,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  } as TextStyle,

  curatorMessage: {
    marginBottom: SPACING.xl,
  } as ViewStyle,

  curatorText: {
    color: theme.curatorText || onboardingTheme.curatorText,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    fontStyle: 'italic',
  } as TextStyle,

  curatorChoice: {
    alignItems: 'center',
  } as ViewStyle,

  curatorChoiceText: {
    color: theme.curatorChoiceText || onboardingTheme.curatorChoiceText,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  // Path selection section
  pathsContainer: {
    marginBottom: SPACING.xl * 2,
  } as ViewStyle,

  pathsTitle: {
    color: theme.pathsTitle || onboardingTheme.pathsTitle,
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as TextStyle,

  pathsSubtitle: {
    color: theme.pathsSubtitle || onboardingTheme.pathsSubtitle,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xxxl - 2,
    fontStyle: 'italic',
  } as TextStyle,

  pathsGrid: {
    gap: 25,
  } as ViewStyle,

  // Path cards
  pathCard: {
    borderRadius: BORDER_RADIUS.xlarge,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  pathCardSelected: {
    shadowOpacity: 0.8,
    shadowRadius: 16,
  } as ViewStyle,

  pathCardGradient: {
    backgroundColor: theme.pathCardGradient || onboardingTheme.pathCardGradient,
    padding: 25,
  } as ViewStyle,

  pathIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  } as ViewStyle,

  pathIcon: {
    fontSize: 50,
    zIndex: 2,
  } as TextStyle,

  pathIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 35,
    opacity: 0.3,
    zIndex: 1,
  } as ViewStyle,

  pathHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  } as ViewStyle,

  pathTitle: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs + 2,
    textAlign: 'center',
  } as TextStyle,

  pathSubtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  } as TextStyle,

  pathAtmosphere: {
    color: theme.pathAtmosphere || onboardingTheme.pathAtmosphere,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  } as TextStyle,

  pathDescription: {
    color: theme.pathDescription || onboardingTheme.pathDescription,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: 15,
  } as TextStyle,

  // Benefits section
  benefitsContainer: {
    marginBottom: SPACING.lg,
  } as ViewStyle,

  benefitsList: {
    color: theme.benefitsList || onboardingTheme.benefitsList,
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
  } as TextStyle,

  // Button
  pathButton: {
    backgroundColor: theme.pathButton || onboardingTheme.pathButton,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
  } as ViewStyle,

  pathButtonText: {
    color: '#1a1a1a',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  } as ViewStyle,

  footerText: {
    color: theme.footerText || onboardingTheme.footerText,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as TextStyle,

  footerSignature: {
    color: theme.footerSignature || onboardingTheme.footerSignature,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  } as TextStyle,
});

export type OnboardingStyles = ReturnType<typeof createOnboardingStyles>;
