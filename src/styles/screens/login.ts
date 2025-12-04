import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../foundation';
import { ThemeColors, loginTheme } from '../theme';

/**
 * Login screen styles following RPG aesthetic with mystical theme
 */
export const createLoginStyles = (theme: ThemeColors = loginTheme) => ({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: theme.background || loginTheme.background,
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



  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.gradientOverlayBackground || loginTheme.gradientOverlayBackground,
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

  personalityAvatar: {
    position: 'relative',
    marginBottom: SPACING.xl,
  } as ViewStyle,

  avatarIcon: {
    width: 60,
    height: 60,
    zIndex: 2,
  } as ImageStyle,

  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: theme.avatarGlow || loginTheme.avatarGlow,
    borderRadius: 40,
    opacity: 0.3,
    zIndex: 1,
  } as ViewStyle,

  titleSection: {
    alignItems: 'center',
  } as ViewStyle,

  gameTitle: {
    color: theme.gameTitle || loginTheme.gameTitle,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 4,
    marginBottom: SPACING.sm,
    textShadowColor: theme.gameTitleShadow || loginTheme.gameTitleShadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  } as TextStyle,

  gameSubtitle: {
    color: theme.gameSubtitle || loginTheme.gameSubtitle,
    fontSize: FONT_SIZES.md,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  } as TextStyle,

  personalityClass: {
    color: theme.personalityClass || loginTheme.personalityClass,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  } as TextStyle,

  researchHint: {
    color: theme.researchHint || loginTheme.researchHint,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    opacity: 0.8,
  } as TextStyle,

  // Curator section
  curatorSection: {
    marginBottom: SPACING.xxxl - 2,
  } as ViewStyle,

  curatorCard: {
    backgroundColor: theme.curatorCard || loginTheme.curatorCard,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: theme.curatorCardBorder || loginTheme.curatorCardBorder,
    shadowColor: theme.curatorCardShadowColor || loginTheme.curatorCardShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  curatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  } as ViewStyle,

  curatorAvatar: {
    fontSize: FONT_SIZES.xxxl,
    marginRight: 15,
  } as TextStyle,

  curatorInfo: {
    flex: 1,
  } as ViewStyle,

  curatorName: {
    color: theme.curatorName || loginTheme.curatorName,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  curatorTitle: {
    color: theme.curatorTitle || loginTheme.curatorTitle,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  } as TextStyle,

  curatorMessage: {
    marginBottom: 15,
  } as ViewStyle,

  curatorText: {
    color: theme.curatorText || loginTheme.curatorText,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    fontStyle: 'italic',
  } as TextStyle,

  curatorFooter: {
    alignItems: 'center',
  } as ViewStyle,

  curatorHint: {
    color: theme.curatorHint || loginTheme.curatorHint,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  } as TextStyle,

  // Login scroll/form section
  loginScroll: {
    backgroundColor: theme.loginScrollBackground || loginTheme.loginScrollBackground,
    borderRadius: BORDER_RADIUS.large,
    padding: 25,
    marginBottom: SPACING.xxxl - 2,
    shadowColor: theme.loginScrollBorder || loginTheme.loginScrollBorder,
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: theme.loginScrollBorder || loginTheme.loginScrollBorder,
  } as ViewStyle,

  scrollHeader: {
    alignItems: 'center',
    marginBottom: 25,
  } as ViewStyle,

  scrollTitle: {
    color: theme.loginScrollTitle || loginTheme.loginScrollTitle,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  } as TextStyle,

  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: theme.decorativeLine || loginTheme.decorativeLine,
  } as ViewStyle,

  // Form elements
  formContainer: {
    gap: SPACING.xl,
  } as ViewStyle,

  inputContainer: {
    marginBottom: SPACING.xs,
  } as ViewStyle,

  inputLabel: {
    color: theme.inputLabel || loginTheme.inputLabel,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
  } as TextStyle,

  mysticalInput: {
    backgroundColor: theme.mysticalInputBackground || loginTheme.mysticalInputBackground,
    borderRadius: SPACING.sm,
    padding: 15,
    fontSize: FONT_SIZES.md,
    color: theme.mysticalInputColor || loginTheme.mysticalInputColor,
    borderWidth: 2,
    borderColor: theme.mysticalInputBorder || loginTheme.mysticalInputBorder,
    shadowColor: theme.mysticalInputShadow || loginTheme.mysticalInputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle & TextStyle,

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.errorContainerBackground || loginTheme.errorContainerBackground,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.errorContainerBorder || loginTheme.errorContainerBorder,
    marginTop: SPACING.sm,
  } as ViewStyle,

  errorIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
  } as TextStyle,

  errorText: {
    color: theme.errorContainerText || loginTheme.errorContainerText,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  } as TextStyle,

  // Buttons
  enterButton: {
    position: 'relative',
    backgroundColor: theme.enterButton || loginTheme.enterButton,
    borderRadius: BORDER_RADIUS.large,
    padding: FONT_SIZES.lg,
    alignItems: 'center',
    shadowColor: theme.enterButtonShadow || loginTheme.enterButtonShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginTop: SPACING.sm,
  } as ViewStyle,

  enterButtonDisabled: {
    opacity: 0.7,
  } as ViewStyle,

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  } as ViewStyle,

  buttonIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  } as TextStyle,

  buttonText: {
    color: theme.enterButtonText || loginTheme.enterButtonText,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: theme.buttonGlow || loginTheme.buttonGlow,
    borderRadius: 14,
    opacity: 0.3,
    zIndex: 1,
  } as ViewStyle,

  // Additional elements
  curatorAccess: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: theme.curatorAccess || loginTheme.curatorAccess,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.curatorAccessBorder || loginTheme.curatorAccessBorder,
    marginTop: 15,
  } as ViewStyle,

  curatorAccessText: {
    color: theme.curatorAccessText || loginTheme.curatorAccessText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  } as TextStyle,

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  } as ViewStyle,

  footerText: {
    color: theme.footerText || loginTheme.footerText,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as TextStyle,

  footerSignature: {
    color: theme.footerSignature || loginTheme.footerSignature,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  } as TextStyle,
});

export type LoginStyles = ReturnType<typeof createLoginStyles>;
