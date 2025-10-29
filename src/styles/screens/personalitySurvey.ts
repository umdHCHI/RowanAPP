/**
 * Personality Survey Screen Styles
 * Styles for the personality assessment survey
 */

import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../foundation';
import { ThemeColors, personalitySurveyTheme } from '../theme';

export type PersonalitySurveyStyles = ReturnType<typeof createPersonalitySurveyStyles>;

/**
 * Creates personality survey screen styles
 */
export const createPersonalitySurveyStyles = (theme: ThemeColors = personalitySurveyTheme) => ({
  // Main container
  container: {
    flex: 1,
    backgroundColor: theme.background || personalitySurveyTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  } as ViewStyle,

  backgroundContainer: {
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
    backgroundColor: theme.gradientOverlayBackground || personalitySurveyTheme.gradientOverlayBackground,
  } as ViewStyle,

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: SPACING.xl,
  } as ViewStyle,

  headerTitle: {
    color: '#4ee6e6',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  } as TextStyle,

  headerSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  } as TextStyle,

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  } as ViewStyle,

  modalView: {
    backgroundColor: theme.card || personalitySurveyTheme.card,
    borderRadius: BORDER_RADIUS.large,
    padding: 25,
    borderWidth: 1,
    borderColor: theme.border || personalitySurveyTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    maxWidth: 400,
    alignItems: 'center',
  } as ViewStyle,

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text || personalitySurveyTheme.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  } as TextStyle,

  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.text || personalitySurveyTheme.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 25,
  } as TextStyle,

  modalButton: {
    backgroundColor: theme.primary || personalitySurveyTheme.primary,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: theme.primary || personalitySurveyTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  // Survey content
  surveyContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  contentWrapper: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  } as ViewStyle,

  // Progress bar
  progressHeader: {
    width: '100%',
    marginBottom: SPACING.lg,
  } as ViewStyle,

  progressText: {
    color: theme.tabBarInactive || personalitySurveyTheme.tabBarInactive,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as TextStyle,

  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,

  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary || personalitySurveyTheme.primary,
    borderRadius: 4,
  } as ViewStyle,

  // Question card
  questionCard: {
    width: '100%',
    backgroundColor: theme.card || personalitySurveyTheme.card,
    borderRadius: BORDER_RADIUS.large,
    padding: 25,
    borderWidth: 1,
    borderColor: theme.border || personalitySurveyTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
    marginTop: 24,
  } as ViewStyle,

  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text || personalitySurveyTheme.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.lg,
  } as TextStyle,

  // Option buttons
  optionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.border || personalitySurveyTheme.border,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    width: '100%',
    marginVertical: 6,
    alignItems: 'center',
  } as ViewStyle,

  optionButtonSelected: {
    backgroundColor: `${theme.primary || personalitySurveyTheme.primary}20`,
    borderColor: theme.primary || personalitySurveyTheme.primary,
    shadowColor: theme.primary || personalitySurveyTheme.primary,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  optionText: {
    color: theme.text || personalitySurveyTheme.text,
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,

  optionTextSelected: {
    color: theme.primary || personalitySurveyTheme.primary,
    fontWeight: '700',
  } as TextStyle,

  // Navigation
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.lg,
  } as ViewStyle,

  skipButtonText: {
    color: theme.tabBarInactive || personalitySurveyTheme.tabBarInactive,
    fontSize: 15,
    textDecorationLine: 'underline',
  } as TextStyle,

  nextButton: {
    backgroundColor: theme.primary || personalitySurveyTheme.primary,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: 14,
    paddingHorizontal: 35,
    shadowColor: theme.primary || personalitySurveyTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  disabledButton: {
    opacity: 0.5,
  } as ViewStyle,

  // Trait indicator card
  traitIndicatorCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary || personalitySurveyTheme.primary,
  } as ViewStyle,

  traitIndicatorTitle: {
    color: theme.tabBarInactive || personalitySurveyTheme.tabBarInactive,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  } as TextStyle,

  traitIndicatorValue: {
    color: theme.primary || personalitySurveyTheme.primary,
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  allScoresContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.sm,
  } as ViewStyle,

  scoreText: {
    fontSize: 12,
    color: theme.text || personalitySurveyTheme.text,
  } as TextStyle,

  primaryScoreText: {
    color: theme.primary || personalitySurveyTheme.primary,
    fontWeight: 'bold',
  } as TextStyle,

  // Basic reusable styles
  text: {
    color: theme.text || personalitySurveyTheme.text,
    fontSize: 16,
  } as TextStyle,

  button: {
    backgroundColor: theme.primary || personalitySurveyTheme.primary,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  card: {
    backgroundColor: theme.curatorCard || personalitySurveyTheme.curatorCard,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: theme.curatorCardBorder || personalitySurveyTheme.curatorCardBorder,
    shadowColor: theme.curatorCardShadowColor || personalitySurveyTheme.curatorCardShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,

  title: {
    color: theme.gameTitle || personalitySurveyTheme.gameTitle,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    textShadowColor: theme.gameTitleShadow || personalitySurveyTheme.gameTitleShadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  } as TextStyle,

  subtitle: {
    color: theme.text || personalitySurveyTheme.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  } as TextStyle,
});
