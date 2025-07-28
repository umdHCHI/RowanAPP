import { Dimensions, ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeColors, loginTheme, onboardingTheme } from './theme';

const { width, height } = Dimensions.get('window');

const FONT_FAMILY_TITLE = 'serif';
const FONT_FAMILY_TEXT = 'sans-serif';
const FONT_FAMILY_BODY = 'sans-serif';
const FONT_FAMILY_PIXEL = 'pixel';

const engravedText: TextStyle = {
  textShadowColor: 'rgba(0, 0, 0, 0.4)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 1,
};

const glowingText = (theme: ThemeColors): TextStyle => ({
  textShadowColor: theme.archiveAccent,
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
});

//Helper function for the Login specific styles 
export const loginStyles = (theme: ThemeColors) : {[key: string]: any} => {  
  const isColor = theme?.archiveText || theme.primary;  return {

  container: {
    flex: 1,
    backgroundColor: loginTheme.background,
  },
  
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingIcon: {
    position: 'absolute',
    fontSize: 24,
    color: loginTheme.floatingIconColor,
    opacity: 0.3,
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: loginTheme.gradientOverlayBackground,
  },
  
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  personalityAvatar: {
    position: 'relative',
    marginBottom: 20,
  },
  
  avatarIcon: {
    fontSize: 60,
    zIndex: 2,
  },
  
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: loginTheme.avatarGlow,
    borderRadius: 40,
    opacity: 0.3,
    zIndex: 1,
  },
  
  titleSection: {
    alignItems: 'center',
  },
  
  gameTitle: {
    color: loginTheme.gameTitle,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
    textShadowColor: loginTheme.gameTitleShadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  gameSubtitle: {
    color: loginTheme.gameSubtitle,
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  
  personalityClass: {
    color: loginTheme.personalityClass,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  researchHint: {
    color: loginTheme.researchHint,
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  
  curatorSection: {
    marginBottom: 30,
  },
  
  curatorCard: {
    backgroundColor: loginTheme.curatorCard,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: loginTheme.curatorCardBorder,
    shadowColor: loginTheme.curatorCardShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  curatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  curatorAvatar: {
    fontSize: 32,
    marginRight: 15,
  },
  
  curatorInfo: {
    flex: 1,
  },
  
  curatorName: {
    color: loginTheme.curatorName,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  curatorTitle: {
    color: loginTheme.curatorTitle,
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  curatorMessage: {
    marginBottom: 15,
  },
  
  curatorText: {
    color: loginTheme.curatorText,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  curatorFooter: {
    alignItems: 'center',
  },
  
  curatorHint: {
    color: loginTheme.curatorHint,
    fontSize: 12,
    fontWeight: '600',
  },
  
  loginScroll: {
    backgroundColor: loginTheme.loginScrollBackground,
    borderRadius: 12,
    padding: 25,
    marginBottom: 30,
    shadowColor: loginTheme.loginScrollBorder,
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: loginTheme.loginScrollBorder,
  },
  
  scrollHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  
  scrollTitle: {
    color: loginTheme.loginScrollTitle,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: loginTheme.decorativeLine,
  },
  
  formContainer: {
    gap: 20,
  },
  
  inputContainer: {
    marginBottom: 5,
  },
  
  inputLabel: {
    color: loginTheme.inputLabel,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  mysticalInput: {
    backgroundColor: loginTheme.mysticalInputBackground,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: loginTheme.mysticalInputColor,
    borderWidth: 2,
    borderColor: loginTheme.mysticalInputBorder,
    shadowColor: loginTheme.mysticalInputShadow,
    placeholderTextColor: loginTheme.placeholderTextColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: loginTheme.errorContainerBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: loginTheme.errorContainerBorder,
    marginTop: 10,
  },
  
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  errorText: {
    color: loginTheme.errorContainerText,
    fontSize: 14,
    flex: 1,
  },
  
  enterButton: {
    position: 'relative',
    backgroundColor: loginTheme.enterButton,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: loginTheme.enterButtonShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10,
  },
  
  enterButtonDisabled: {
    opacity: 0.7,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  
  buttonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  buttonText: {
    color: loginTheme.enterButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: loginTheme.buttonGlow,
    borderRadius: 14,
    opacity: 0.3,
    zIndex: 1,
  },
  
  curatorAccess: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: loginTheme.curatorAccess,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: loginTheme.curatorAccessBorder,
    marginTop: 15,
  },
  
  curatorAccessText: {
    color: loginTheme.curatorAccessText,
    fontSize: 14,
    fontWeight: '600',
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  footerText: {
    color: loginTheme.footerText,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  footerSignature: {
    color: loginTheme.footerSignature,
    fontSize: 12,
    fontStyle: 'italic',
  },
}
};

//Helper function for the Onboarding theme
export const getOnboardingStyles = (theme?: ThemeColors): {[key: string]: any} => {

  return {
    container: {
      flex: 1,
      backgroundColor: onboardingTheme.background,
    },
    
    backgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    
    floatingElements: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    
    floatingIcon: {
      position: 'absolute',
      fontSize: 28,
      color: onboardingTheme.floatingIconColor,
      opacity: 0.4,
    },
    
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: onboardingTheme.gradientOverlayBackground,
    },
    
    scrollContainer: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    
    archiveTitle: {
      color: onboardingTheme.floatingIconColor,
      fontSize: 36,
      fontWeight: 'bold',
      letterSpacing: 6,
      marginBottom: 8,
      textShadowColor: onboardingTheme.gameTitleShadow,
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 10,
    },
    
    archiveSubtitle: {
      color: onboardingTheme.gameSubtitle,
      fontSize: 18,
      fontStyle: 'italic',
      marginBottom: 15,
    },
    
    decorativeLine: {
      width: 120,
      height: 2,
      backgroundColor: onboardingTheme.decorativeLine,
      opacity: 0.8,
    },
    
    curatorSection: {
      marginBottom: 40,
    },
    
    curatorCard: {
      backgroundColor: onboardingTheme.curatorCard,
      borderRadius: 16,
      padding: 25,
      borderWidth: 2,
      borderColor: onboardingTheme.curatorCardBorder,
      shadowColor: onboardingTheme.curatorCardShadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
    
    curatorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    
    curatorAvatar: {
      fontSize: 40,
      marginRight: 15,
    },
    
    curatorInfo: {
      flex: 1,
    },
    
    curatorName: {
      color: onboardingTheme.curatorName,
      fontSize: 20,
      fontWeight: 'bold',
    },
    
    curatorTitle: {
      color: onboardingTheme.curatorTitle,
      fontSize: 14,
      fontStyle: 'italic',
    },
    
    curatorMessage: {
      marginBottom: 20,
    },
    
    curatorText: {
      color: onboardingTheme.curatorText,
      fontSize: 16,
      lineHeight: 24,
      fontStyle: 'italic',
    },
    
    curatorChoice: {
      alignItems: 'center',
    },
    
    curatorChoiceText: {
      color: onboardingTheme.curatorChoiceText,
      fontSize: 16,
      fontWeight: 'bold',
    },
    
    pathsContainer: {
      marginBottom: 40,
    },
    
    pathsTitle: {
      color: onboardingTheme.pathsTitle,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    
    pathsSubtitle: {
      color: onboardingTheme.pathsSubtitle,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 30,
      fontStyle: 'italic',
    },
    
    pathsGrid: {
      gap: 25,
    },
    
    pathCard: {
      borderRadius: 16,
      borderWidth: 2,
      overflow: 'hidden',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      marginBottom: 10,
    },
    
    pathCardSelected: {
      shadowOpacity: 0.8,
      shadowRadius: 16,
    },
    
    pathCardGradient: {
      backgroundColor: onboardingTheme.pathCardGradient,
      padding: 25,
    },
    
    pathIconContainer: {
      alignItems: 'center',
      marginBottom: 20,
      position: 'relative',
    },
    
    pathIcon: {
      fontSize: 50,
      zIndex: 2,
    },
    
    pathIconGlow: {
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 35,
      opacity: 0.3,
      zIndex: 1,
    },
    
    pathHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    
    pathTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 6,
      textAlign: 'center',
    },
    
    pathSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    
    pathAtmosphere: {
      color: onboardingTheme.pathAtmosphere,
      fontSize: 14,
      fontStyle: 'italic',
    },
    
    pathDescription: {
      color: onboardingTheme.pathDescription,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 20,
    },
    
    curatorNote: {
      flexDirection: 'row',
      backgroundColor: onboardingTheme.curatorNote,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: onboardingTheme.curatorNoteBorder,
    },
    
    curatorNoteIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    
    curatorNoteText: {
      color: onboardingTheme.curatorNoteText,
      fontSize: 13,
      fontStyle: 'italic',
      flex: 1,
      lineHeight: 18,
    },
    
    benefitsList: {
      marginBottom: 25,
    },
    
    benefitsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    
    benefitItem: {
      color: onboardingTheme.benefitsList,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 6,
    },
    
    pathButton: {
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      position: 'relative',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    
    pathButtonDisabled: {
      opacity: 0.7,
    },
    
    pathButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 2,
    },
    
    pathButtonIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    
    pathButtonText: {
      color: onboardingTheme.pathButton,
      fontSize: 16,
      fontWeight: 'bold',
    },
    
    pathButtonGlow: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: 14,
      opacity: 0.4,
      zIndex: 1,
    },
    
    footer: {
      alignItems: 'center',
      marginTop: 20,
    },
    
    footerText: {
      color: onboardingTheme.footerText,
      fontSize: 15,
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 10,
    },
    
    footerSignature: {
      color: onboardingTheme.footerSignature,
      fontSize: 13,
      fontStyle: 'italic',
    },
    
    // Auth Error Styles
    authErrorContainer: {
      flex: 1,
      backgroundColor: onboardingTheme.authErrorContainer,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    
    authErrorTitle: {
      color: onboardingTheme.authErrorTitle,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    
    authErrorText: {
      color: onboardingTheme.authErrorText,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    
    authErrorButton: {
      backgroundColor: onboardingTheme.authErrorButton,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 12,
    },
    
    authErrorButtonText: {
      color: onboardingTheme.authErrorButtonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  
  }
}



// Helper function to generate personality-specific styles
export const getPersonalityStyles = (primaryColor: string, secondaryColor: string, accentColor: string, theme?: ThemeColors) => {
  const isDark = !theme || theme.archiveMode === 'dark';
  
  return {
  tabBar: {
    flexDirection: "row" as const,
    backgroundColor: theme?.tabBar || (isDark ? "#1a1a1a" : "#ffffff"),
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: primaryColor,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonActive: {
    backgroundColor: `${primaryColor}20`,
    borderColor: primaryColor,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  tabTextActive: {
    color: primaryColor,
    fontWeight: "700" as const,
    textShadowColor: primaryColor,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  curatorMessageCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
    overflow: 'hidden' as const,
  },
  curatorName: {
    color: theme?.archiveText || primaryColor,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  curatorMessage: {
    color: theme?.archiveText || '#fff',
    fontSize: 14,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  personalizedGreeting: {
    color: theme?.archiveText || primaryColor,
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  attributesContainer: {
    marginBottom: 16,
  },
  echoesTitle: {
    color: theme?.archiveText || primaryColor,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  attributeCardParchment: {
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  attributeLabel: {
    color: theme?.archiveText || primaryColor,
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  questsTitle: {
    color: theme?.archiveText || primaryColor,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  questCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  // Wellness Foundations Card Styles
  wellnessContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  wellnessTitle: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  wellnessItem: {
    backgroundColor: '#23242b',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: `${primaryColor}40`,
    alignItems: 'center',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wellnessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  wellnessLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  wellnessValue: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  questCompleted: {
    shadowColor: primaryColor,
    shadowOpacity: 0.2,
  },
  questTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: primaryColor,
    borderRadius: 3,
  },
  questProgressCompleted: {
    backgroundColor: '#2ECC71',
  },
  toolsTitle: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  toolCard: {
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  toolLocked: {
    shadowColor: '#666',
    shadowOpacity: 0.1,
  },
  toolName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  toolNameLocked: {
    color: '#999999',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  toolDescription: {
    color: '#cccccc',
    fontSize: 10,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  restorationTitle: {
    color: primaryColor,
    fontSize: 24,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
    textShadowColor: primaryColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  progressLabel: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  wellnessFill: {
    height: '100%' as any,
    borderRadius: 3,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  achievementTitle: {
    color: accentColor,
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  codexContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(38, 70, 83, 0.1)',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  codexHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  codexTitle: {
    color: primaryColor,
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  codexCloseButton: {
    padding: 8,
  },
  codexCloseText: {
    color: primaryColor,
    fontSize: 18,
  },
  codexContent: {
    flex: 1,
    backgroundColor: '#23242b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  codexQuestTitle: {
    color: primaryColor,
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  codexQuestDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  codexOptionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  codexOptionButton: {
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: 'rgba(42, 45, 53, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: primaryColor,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden' as const,
  },
  codexOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  codexOptionText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '600' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  codexFooterText: {
    color: secondaryColor,
    fontSize: 12,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  thoughtDefenderContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(38, 70, 83, 0.1)',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  thoughtDefenderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  thoughtDefenderTitle: {
    color: primaryColor,
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  thoughtDefenderCloseButton: {
    padding: 8,
  },
  thoughtDefenderCloseText: {
    color: primaryColor,
    fontSize: 18,
  },
  thoughtDefenderContent: {
    flex: 1,
    backgroundColor: '#23242b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "rgba(38, 70, 83, 0.01)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  thoughtDefenderMainTitle: {
    color: primaryColor,
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  thoughtDefenderDescription: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  thoughtDefenderInstructionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    flexWrap: 'wrap' as const,
  },
  thoughtDefenderInstructionItem: {
    alignItems: 'center' as const,
    flex: 1,
    minWidth: 120,
    marginHorizontal: 8,
  },
  thoughtDefenderInstructionIcon: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  thoughtDefenderInstructionText: {
    color: primaryColor,
    fontSize: 12,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
    paddingHorizontal: 4,
  },
  thoughtDefenderStartButton: {
    backgroundColor: primaryColor,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  thoughtDefenderStartButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  thoughtDefenderFooterText: {
    color: secondaryColor,
    fontSize: 12,
    textAlign: 'center' as const,
    marginTop: 16,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Header-specific styles
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 32,
    position: 'relative' as const,
    borderBottomWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackground: {
    backgroundColor: primaryColor,
  },
  headerBorder: {
    borderBottomColor: primaryColor,
  },
  headerShadow: {
    shadowColor: primaryColor,
  },
  backgroundElements: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    opacity: 0.1,
  },
  backgroundRune: {
    fontSize: 60,
    transform: [{ rotate: '15deg' }],
    color: secondaryColor,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 18,
  },
  leftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 48,
    zIndex: 2,
  },
  avatarGlow: {
    position: 'absolute' as const,
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 35,
    opacity: 0.3,
    zIndex: 1,
    backgroundColor: accentColor,
  },
  scholarInfo: {
    flex: 1,
  },
  scholarRank: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    letterSpacing: 1,
    marginBottom: 2,
    color: primaryColor,
  },
  scholarClass: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 2,
    color: accentColor,
  },
  scholarLevel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end' as const,
  },
  gameInfo: {
    alignItems: 'flex-end' as const,
  },
  archiveLabel: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    letterSpacing: 2,
    marginBottom: 2,
    color: primaryColor,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold' as const,
    textAlign: 'right' as const,
    marginBottom: 2,
  },
  archiveSection: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'right' as const,
    marginBottom: 4,
  },
  curatorNote: {
    color: '#ccc',
    fontSize: 11,
    fontStyle: 'italic' as const,
    textAlign: 'right' as const,
  },
  journeySection: {
    marginTop: 10,
  },
  journeyIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 15,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    backgroundColor: `${primaryColor}20`,
    borderLeftColor: primaryColor,
  },
  journeyIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  journeyText: {
    color: '#ccc',
    fontSize: 13,
    fontStyle: 'italic' as const,
    flex: 1,
  },
  mindStateContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: 4,
  },
  mindState: {
    alignItems: 'center' as const,
    flex: 1,
    marginHorizontal: 4,
  },
  mindStateIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  mindStateLabel: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    marginBottom: 6,
    color: secondaryColor,
  },
  mindStateBar: {
    width: '100%' as any,
    height: 4,
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  mindStateProgress: {
    height: '100%' as any,
    borderRadius: 2,
    backgroundColor: secondaryColor,
  },
  mysticalBorder: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2 as any,
    backgroundColor: accentColor,
  },
  // Additional styles needed for components
  curatorHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 15,
  },
  curatorAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  curatorInfo: {
    flex: 1,
  },
  curatorTitle: {
    color: '#ccc',
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
  dailyLabel: {
    color: accentColor,
    fontSize: 10,
    fontWeight: 'bold' as const,
    letterSpacing: 1,
  },
  messageContent: {
    marginBottom: 10,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: `${primaryColor}30`,
    paddingTop: 15,
  },
  expandedHint: {
    color: accentColor,
    fontSize: 12,
    marginBottom: 8,
  },
  expandedFooter: {
    color: '#999',
    fontSize: 11,
    fontStyle: 'italic' as const,
  },
  attributesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
  },
  attributeBarMagic: {
    height: 6,
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden' as const,
  },
  attributeProgressMagic: {
    height: '100%' as any,
    borderRadius: 3,
  },
  attributeValue: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  curatorNoteText: {
    color: accentColor,
  },
  questsContainer: {
    marginBottom: 20,
  },
  questDescription: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  questProgress: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  questProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderRadius: 2,
    marginRight: 10,
    overflow: 'hidden' as const,
  },

  questProgressText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  toolsContainer: {
    marginBottom: 20,
  },
};
};

type StyleGuide = {
  [key: string]: ViewStyle | TextStyle | ImageStyle | any;
}

export const createGlobalStyles = (theme: ThemeColors): { [key: string]: any } => {
  return StyleSheet.create({ 

    container: {
      flex: 1,
      backgroundColor: theme.archiveBackground,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      padding: 16,
    },
    engravedText: engravedText,
    glowingText: glowingText(theme),

    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    text: {
      color: theme.text,
      fontSize: 16,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    subtitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
    },
    buttonText: {
      color: theme.buttonTextColor,
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      color: theme.text,
      marginVertical: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      width: '100%',
      marginBottom: 16,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlayBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalpassages: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: width < 768 ? 20 : 32,
      alignItems: 'center',
      maxWidth: width < 768 ? width * 0.95 : 350,
      width: width < 768 ? width * 0.95 : 350,
    },

    // Character Creator Styles
    creatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: 500,
      marginTop: 8,
    },
    characterPreview: {
      width: 140,
      height: 200,
      marginBottom: 8,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },

    // ===== ARCHIVE SPECIFIC STYLES =====
    
    // Archive Layout
    archiveContainer: {
      flex: 1,
      backgroundColor: theme.archiveBackground,
    },
 
    archivepassages: {
      flex: 1,
      paddingTop: 10,
    },
    archiveTabpassagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    archiveTabpassagesArea: {
      paddingBottom: 32,
    },

    // Archive Header
    archiveHeader: {
      padding: 20,
      paddingTop: 10, // Further reduced space for status bar
      backgroundColor: 'transparent',
      borderBottomWidth: 2,
      borderBottomColor: theme.archiveBorder,
    },
    archiveTitle: {
      fontFamily: FONT_FAMILY_TITLE,
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.archiveAccent,
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: 1,
      ...engravedText,
    },
    levelDisplay: {
      alignItems: 'center',
      marginBottom: 16,
    },
    levelText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    experienceBar: {
      width: '100%',
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 4,
    },
    experienceFill: {
      height: '100%',
      borderRadius: 4,
    },
    experienceText: {
      fontSize: 12,
      fontWeight: '600',
    },
    wellnessStats: {
      marginTop: 8,
    },
    wellnessLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    wellnessGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    wellnessStat: {
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 4,
      marginVertical: 2,
    },

    // Archive Header Gradient
    archiveHeaderGradient: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveHeaderpassages: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    archiveHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    archiveHeaderIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      position: 'relative',
    },
    archiveHeaderIconOverlay: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    archiveHeaderTextContainer: {
      flex: 1,
    },
    archiveHeaderTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      marginBottom: 4,
    },
    archiveHeaderSubtitle: {
      fontSize: 14,
      color: theme.archiveSubtext,
      fontStyle: 'italic',
      marginBottom: 8,
    },
    archiveStatusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    archiveStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.statusSuccess,
      marginRight: 6,
    },
    archiveStatusText: {
      fontSize: 12,
      color: theme.statusSuccess,
    },

    // Archive Tab Navigation
    archiveTabContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    archiveTabGradient: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveTabpassages: {
      borderRadius: 12,
    },
    archiveTabScrollpassages: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    archiveTabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderRadius: 8,
      overflow: 'hidden',
      minWidth: 120,
    },
    archiveActiveTab: {
      backgroundColor: 'rgba(217, 119, 6, 0.3)',
    },
    archiveTabText: {
      color: theme.archiveSubtext,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 8,
    },
    archiveActiveTabText: {
      color: theme.archiveAccentSecondary,
    },

    // Archive Cards and Sections
    archiveCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    },
    archiveCardGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveSection: {
      backgroundColor: theme.archiveCard,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    archiveSectionGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.archiveBorder,
    },
    archiveSectionTitle: {
      fontFamily: FONT_FAMILY_TITLE,
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.archiveAccent,
      marginHorizontal: 12,
      textAlign: 'center',
    },
    archiveSectionSubtitle: {
      fontFamily: FONT_FAMILY_BODY,
      fontSize: 14,
      color: theme.archiveSubtext,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 4,
    },
    archiveSectionContent: {
      padding: 16,
    },

    // Archive Buttons
    archivePrimaryButton: {
      backgroundColor: theme.archiveAccent,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderBottomWidth: 2,
      borderBottomColor: 'rgba(0,0,0,0.3)',
    },
    archivePrimaryButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    archivePrimaryButtonText: {
      fontFamily: FONT_FAMILY_BODY,
      color: '#1a120b', // Dark text on gold button
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  
    archiveSecondaryButtonGradient: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    archiveSecondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.archiveSubtext,
    },
    archiveSecondaryButtonText: {
      fontFamily: FONT_FAMILY_BODY,
      color: theme.archiveSubtext,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },

    // Archive Foundation Cards
    archiveFoundationCard: {
      width: '48%',
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    archiveFoundationCardGradient: {
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.archiveBorder,
      minHeight: 180,
    },
    archiveFoundationIconContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    archiveFoundationIcon: {
      fontSize: 24,
      marginBottom: 0,
    },
    archiveFoundationValueContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    archiveFoundationValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.archiveText,
      marginBottom: 2,
    },
    archiveFoundationMaxValue: {
      fontSize: 14,
      color: theme.archiveAccentSecondary,
    },
    archiveFoundationLevel: {
      fontSize: 10,
      color: theme.statusInfo,
      fontWeight: '600',
    },
    archiveFoundationLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.archiveSubtext,
      marginBottom: 6,
      textAlign: 'center',
    },
    archiveFoundationDescription: {
      fontSize: 9,
      color: theme.archiveAccentSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 13,
      marginBottom: 8,
    },

    // Archive Progress Bars
    archiveProgressBar: {
      width: '100%',
      height: 8,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderRadius: 4,
      marginBottom: 4,
      overflow: 'hidden',
      position: 'relative',
    },
    archiveProgressFill: {
      height: '100%',
      borderRadius: 4,
    },

    // Archive Grid Layouts
    archiveGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    archiveTwoColumnLayout: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    archiveColumnCard: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },

    // Archive Text Styles
    archiveText: {
      color: theme.archiveText,
      fontSize: 14,
    },
    archiveSubtext: {
      color: theme.archiveSubtext,
      fontSize: 12,
      fontStyle: 'italic',
    },
    archiveAccentText: {
      color: theme.archiveAccent,
      fontSize: 16,
      fontWeight: '600',
    },
    archiveAccentSecondaryText: {
      color: theme.archiveAccentSecondary,
      fontSize: 14,
      fontWeight: '600',
    },

    // Archive Badges
    archiveBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    archiveBadgeText: {
      color: theme.archiveAccent,
      fontSize: 10,
      fontWeight: '600',
    },
    archiveStatusBadge: {
      backgroundColor: 'rgba(75, 85, 99, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    archiveStatusBadgeText: {
      color: theme.archiveSubtext,
      fontSize: 9,
    },

    // Archive Centered Messages
    archiveCenteredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      minHeight: 300,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveCenteredMessageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      textAlign: 'center',
      marginBottom: 12,
    },
    archiveCenteredMessageText: {
      fontSize: 14,
      color: theme.archiveSubtext,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
      fontStyle: 'italic',
    },

    // Archive Character Display
    archiveCharacterFrame: {
      width: 210,
      height: 195,
      borderRadius: 20,
      padding: 3,
      marginBottom: 12,
    },
    archiveCharacterFrameInner: {
      flex: 1,
      borderRadius: 17,
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    archiveCharacterPreview: {
      width: 210,
      height: 195,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    archiveCharacterLayer: {
      position: 'absolute',
      width: 170,
      height: 230,
      resizeMode: 'contain',
    },

    // Archive Restoration Metrics
    archiveRestorationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    archiveRestorationCard: {
      width: '48%',
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    archiveRestorationCardGradient: {
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveRestorationIcon: {
      fontSize: 20,
      marginBottom: 8,
    },
    archiveRestorationLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    archiveRestorationValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.statusInfo,
      marginBottom: 4,
    },
    archiveRestorationDescription: {
      fontSize: 8,
      color: theme.archiveSubtext,
      textAlign: 'center',
    },

    // Archive Progress Tracking
    archiveProgressTrackingSection: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 20,
    },
    archiveProgressTrackingGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    archiveProgressTrackingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    archiveProgressTrackingTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.statusSuccess,
      marginLeft: 8,
    },
    archiveProgressTrackingpassages: {
      gap: 12,
    },
    archiveProgressTrackingItem: {
      padding: 12,
      backgroundColor: 'rgba(51, 65, 85, 0.5)',
      borderRadius: 8,
      marginBottom: 8,
    },
    archiveProgressTrackingItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    archiveProgressTrackingItemTitle: {
      color: theme.archiveAccentSecondary,
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
      marginLeft: 8,
    },
    archiveProgressTrackingItemValue: {
      color: theme.statusInfo,
      fontSize: 14,
      fontWeight: 'bold',
    },
    archiveProgressTrackingItemDescription: {
      color: theme.archiveSubtext,
      fontSize: 10,
      fontStyle: 'italic',
      marginLeft: 24,
    },

    // Additional styles needed for CharacterHomeNew.tsx
    atmosphericOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundColor: '#000',
    },
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderRadius: 8,
      overflow: 'hidden',
      minWidth: 120,
    },
    activeTab: {
      backgroundColor: 'rgba(217, 119, 6, 0.3)',
    },
    tabText: {
      color: theme.archiveSubtext,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 8,
    },
    activeTabText: {
      color: theme.archiveAccentSecondary,
    },
    tabpassagesArea: {
      paddingBottom: 32,
    },
    avatarShowcaseSection: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    },
    avatarShowcaseGradient: {
      padding: 20,
      borderWidth: 2,
      borderColor: 'rgba(217, 119, 6, 0.4)',
    },
    avatarShowcaseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarShowcaseTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.archiveAccent,
      marginHorizontal: 12,
      textAlign: 'center',
    },
    characterInfoBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    characterDetails: {
      flex: 1,
    },
    characterRarity: {
      color: '#4ECDC4',
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 2,
    },
    characterClass: {
      color: theme.archiveAccentSecondary,
      fontWeight: 'bold',
      fontSize: 13,
      marginBottom: 2,
    },
    characterName: {
      color: theme.archiveText,
      fontWeight: 'bold',
      fontSize: 18,
    },
    researchConditionBadge: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    researchConditionGradient: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    researchConditionText: {
      color: '#DDD6FE',
      fontSize: 11,
      fontWeight: '600',
    },
    characterDisplaySection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 6,
      maxWidth: '100%',
      overflow: 'hidden',
      minHeight: width < 768 ? 160 : 200,
    },
    gearColumn: {
      justifyContent: 'flex-start',
      height: width < 768 ? 140 : 180,
      width: width < 768 ? 45 : 55,
      marginHorizontal: width < 768 ? 2 : 3,
      flexShrink: 0,
      minWidth: width < 768 ? 45 : 55,
      paddingTop: width < 768 ? 8 : 12,
    },
    gearSlot: {
      width: '100%',
      height: width < 768 ? 45 : 55,
      borderRadius: width < 768 ? 8 : 10,
      overflow: 'hidden',
      marginVertical: width < 768 ? 6 : 8,
    },
    gearSlotGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    gearIcon: {
      width: width < 768 ? 30 : 36,
      height: width < 768 ? 30 : 36,
    },
    emptyGearSlot: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    equippedGearSlot: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      borderRadius: 8,
    },
    gearSlotIcon: {
      fontSize: width < 768 ? 14 : 16,
      marginBottom: 1,
    },
    gearSlotLabel: {
      color: '#9CA3AF',
      fontSize: width < 768 ? 6 : 7,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: width < 768 ? 8 : 9,
    },
    centralCharacterDisplay: {
      alignItems: 'center',
      marginHorizontal: width < 768 ? 4 : 6,
      flex: 1,
      minWidth: 0,
    },
    characterFrame: {
      width: width < 768 ? 180 : 210,
      height: width < 768 ? 165 : 195,
      borderRadius: width < 768 ? 18 : 20,
      padding: 3,
      marginBottom: width < 768 ? 10 : 12,
    },
    characterFrameInner: {
      flex: 1,
      borderRadius: 17,
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullCharacterPreview: {
      width: width < 768 ? 145 : 170,
      height: width < 768 ? 195 : 230,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullCharacterLayer: {
      position: 'absolute',
      width: width < 768 ? 145 : 170,
      height: width < 768 ? 195 : 230,
      resizeMode: 'contain',
    },
    characterLevelBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      borderRadius: 12,
      overflow: 'hidden',
    },
    levelBadgeGradient: {
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    levelBadgeText: {
      color: '#92400E',
      fontSize: 12,
      fontWeight: 'bold',
    },
    essenceResonanceIndicator: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      right: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    essenceResonanceGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    essenceResonanceText: {
      color: theme.archiveAccentSecondary,
      fontSize: 10,
      fontWeight: '600',
      marginLeft: 4,
    },
    characterMoodBubble: {
      borderRadius: 12,
      overflow: 'hidden',
      maxWidth: 200,
    },
    moodBubbleGradient: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 2,
      borderColor: '#D97706',
    },
    moodBubbleText: {
      color: '#92400E',
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    researchConditionInfo: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 16,
    },
    researchConditionInfoGradient: {
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    researchConditionInfoTitle: {
      color: theme.archiveAccentSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginVertical: 4,
    },
    researchConditionInfoText: {
      color: '#DDD6FE',
      fontSize: 10,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    quickActionButton: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    quickActionGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    quickActionText: {
      color: '#E0E7FF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    quickActionSecondaryGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    quickActionSecondaryText: {
      color: '#06B6D4',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    twoColumnLayout: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    columnCard: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    cardGradient: {
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
      borderRadius: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingBottom: 12,
    },
    cardTitle: {
      color: theme.archiveAccentSecondary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    resonancepassages: {
      padding: 16,
      paddingTop: 0,
    },
    speechBubble: {
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 16,
    },
    speechBubbleGradient: {
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.2)',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    speechText: {
      color: '#06B6D4',
      fontSize: 11,
      fontStyle: 'italic',
      lineHeight: 16,
      marginLeft: 8,
      flex: 1,
    },
    statusList: {
      gap: 8,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusItemText: {
      color: theme.archiveSubtext,
      fontSize: 11,
      marginLeft: 8,
    },
    mappassages: {
      padding: 16,
      paddingTop: 0,
      gap: 8,
    },
    mapButton: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    mapButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    mapButtonText: {
      color: theme.archiveSubtext,
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 8,
    },
    foundationsSection: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
    },
    foundationsSectionGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    foundationsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    foundationsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#10B981',
      marginHorizontal: 10,
      textAlign: 'center',
    },
    foundationsSubtitle: {
      fontSize: 14,
      color: theme.archiveSubtext,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 20,
    },
    foundationsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    foundationCard: {
      width: '48%',
      marginBottom: 8,
      borderRadius: 12,
      overflow: 'hidden',
    },
    foundationCardGradient: {
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.2)',
      minHeight: 140,
    },
    foundationIconContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    foundationIcon: {
      fontSize: 24,
      marginBottom: 0,
    },
    recentGainBadge: {
      position: 'absolute',
      top: -8,
      right: -12,
      borderRadius: 8,
      overflow: 'hidden',
    },
    recentGainGradient: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    recentGainText: {
      color: '#065F46',
      fontSize: 10,
      fontWeight: 'bold',
    },
    foundationValueContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    foundationValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.archiveText,
      marginBottom: 2,
    },
    foundationMaxValue: {
      fontSize: 14,
      color: theme.archiveAccentSecondary,
    },
    foundationLevel: {
      fontSize: 10,
      color: '#06B6D4',
      fontWeight: '600',
    },
    foundationProgressContainer: {
      width: '100%',
      marginBottom: 6,
    },
    foundationProgressBar: {
      width: '100%',
      height: 8,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderRadius: 4,
      marginBottom: 4,
      overflow: 'hidden',
      position: 'relative',
    },
    foundationProgressFill: {
      height: '100%',
      borderRadius: 4,
    },
    xpSegment: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: 'rgba(55, 65, 81, 0.8)',
    },
    xpSegmentActive: {
      backgroundColor: 'rgba(252, 211, 77, 0.6)',
    },
    xpToNext: {
      fontSize: 8,
      color: '#9CA3AF',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    foundationLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.archiveSubtext,
      marginBottom: 6,
      textAlign: 'center',
    },
    foundationDescription: {
      fontSize: 9,
      color: theme.archiveAccentSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 13,
      marginBottom: 8,
    },
    nextUnlockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'rgba(217, 119, 6, 0.2)',
      borderRadius: 6,
      marginTop: 4,
    },
    nextUnlockText: {
      fontSize: 8,
      color: theme.archiveAccentSecondary,
      marginLeft: 4,
      textAlign: 'center',
      fontWeight: '500',
    },
    chronicleCard: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    chronicleGradient: {
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    chronicleTopBorder: {
      height: 3,
      backgroundColor: '#A855F7',
    },
    chronicleHeader: {
      padding: 16,
      paddingBottom: 8,
    },
    chronicleInfo: {
      marginBottom: 8,
    },
    chronicleTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#06B6D4',
      marginBottom: 8,
    },
    chronicleBadges: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryBadge: {
      backgroundColor: 'rgba(67, 56, 202, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    categoryBadgeText: {
      color: '#C7D2FE',
      fontSize: 10,
    },
    difficultyBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    difficultyBadgeText: {
      color: '#DDD6FE',
      fontSize: 10,
    },
    chronicleDescriptionContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 12,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: 8,
    },
    chronicleDescription: {
      color: theme.archiveSubtext,
      fontSize: 12,
      fontStyle: 'italic',
      lineHeight: 18,
      marginBottom: 6,
    },
    chronicleAtmosphere: {
      color: '#DDD6FE',
      fontSize: 10,
      textAlign: 'center',
    },
    explorationContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    explorationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    explorationLabel: {
      color: theme.archiveSubtext,
      fontSize: 12,
      marginLeft: 8,
      flex: 1,
    },
    explorationValue: {
      color: '#06B6D4',
      fontSize: 12,
      fontWeight: 'bold',
    },
    explorationBar: {
      height: 6,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    explorationFill: {
      height: '100%',
      borderRadius: 3,
    },
    chronicleStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginBottom: 16,
    },
    chronicleStat: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chronicleStatText: {
      color: theme.archiveAccentSecondary,
      fontSize: 10,
      marginLeft: 6,
    },
    chronicleButton: {
      margin: 16,
      marginTop: 0,
      borderRadius: 8,
      overflow: 'hidden',
    },
    chronicleButtonGradient: {
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chronicleButtonText: {
      color: '#E0E7FF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    artifactsSection: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    artifactsSectionGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    artifactsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    artifactsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#A855F7',
      marginHorizontal: 12,
      textAlign: 'center',
    },
    artifactsSubtitle: {
      fontSize: 14,
      color: theme.archiveSubtext,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 20,
    },
    artifactsGrid: {
      gap: 16,
    },
    artifactCard: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    artifactCardGradient: {
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.2)',
    },
    artifactHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    artifactInfo: {
      flex: 1,
    },
    artifactName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.archiveText,
      marginBottom: 6,
    },
    artifactBadges: {
      flexDirection: 'row',
      gap: 6,
    },
    typeBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
    },
    typeBadgeText: {
      color: '#DDD6FE',
      fontSize: 9,
    },
    rarityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
    },
    rarityBadgeText: {
      color: '#1F2937',
      fontSize: 9,
      fontWeight: 'bold',
    },
    statusBadge: {
      backgroundColor: 'rgba(75, 85, 99, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    equippedBadge: {
      backgroundColor: 'rgba(6, 182, 212, 0.8)',
    },
    equippedText: {
      color: '#CFFAFE',
      fontSize: 9,
    },
    artifactDescriptionContainer: {
      marginBottom: 12,
      padding: 8,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: 6,
    },
    artifactDescription: {
      color: theme.archiveSubtext,
      fontSize: 10,
      fontStyle: 'italic',
      lineHeight: 15,
    },
    resonanceContainer: {
      marginBottom: 12,
    },
    resonanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    resonanceLabel: {
      color: theme.archiveSubtext,
      fontSize: 11,
      marginLeft: 6,
      flex: 1,
    },
    resonanceValue: {
      color: theme.archiveAccentSecondary,
      fontSize: 11,
      fontWeight: 'bold',
    },
    resonanceBar: {
      height: 4,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    resonanceFill: {
      height: '100%',
      borderRadius: 2,
    },
    artifactButton: {
      borderRadius: 6,
      overflow: 'hidden',
    },
    artifactButtonGradient: {
      paddingVertical: 8,
      alignItems: 'center',
    },
    artifactButtonText: {
      color: '#E0E7FF',
      fontSize: 11,
      fontWeight: '600',
    },
    wisdomSection: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    wisdomSectionGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    wisdomHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    wisdomTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#A855F7',
      marginLeft: 8,
      textAlign: 'center',
    },
    wisdomSubtitle: {
      fontSize: 12,
      color: theme.archiveSubtext,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 20,
    },
    wisdompassages: {
      gap: 12,
    },
    insightCard: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    insightCardGradient: {
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    insightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    insightTrait: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#06B6D4',
    },
    clarityBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    clarityBadgeText: {
      color: '#DDD6FE',
      fontSize: 10,
    },
    insightProgressBar: {
      height: 4,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderRadius: 2,
      marginBottom: 8,
      overflow: 'hidden',
    },
    insightProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    insightGuidance: {
      color: theme.archiveSubtext,
      fontSize: 11,
      fontStyle: 'italic',
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      marginBottom: 8,
    },
    insightText: {
      color: theme.archiveSubtext,
      fontSize: 11,
      lineHeight: 16,
    },
    restorationStatus: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    restorationStatusGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    restorationStatusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    restorationStatusTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#A855F7',
      marginLeft: 8,
    },
    restorationStatusGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    restorationStatusCard: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'rgba(51, 65, 85, 0.5)',
      borderRadius: 8,
    },
    restorationStatusLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    restorationStatusValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#10B981',
      marginBottom: 4,
    },
    restorationStatusSubtext: {
      fontSize: 9,
      color: '#9CA3AF',
      textAlign: 'center',
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    skillBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginHorizontal: 4,
      marginBottom: 4,
    },
    skillBadgeText: {
      color: '#DDD6FE',
      fontSize: 10,
    },
    centeredMessageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    centeredMessageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.archiveAccentSecondary,
      textAlign: 'center',
      marginBottom: 12,
    },
    centeredMessageText: {
      fontSize: 14,
      color: theme.archiveSubtext,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
      fontStyle: 'italic',
    },
    backgroundLayer: {
      zIndex: -1,
    },
    primaryButton: {
      borderRadius: 12,
      overflow: 'hidden',
      minWidth: 200,
    },
    primaryButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    primaryButtonText: {
      color: '#E0E7FF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
    },



    // ===== STORY/STORY SCREEN STYLES =====
    StoryModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    StoryModalpassages: {
      width: '100%',
      maxHeight: '90%',
      backgroundColor: theme.archiveBackground,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.archiveAccent,
      padding: 20,
      shadowColor: theme.archiveAccent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 20,
      flex: 1,
    },
    StoryHeader: {
      paddingBottom: 16,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.archiveBorder,
  },
    StoryHeaderLeft: {
      flex: 1,
    },
    StoryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    StoryTitle: {
      fontFamily: FONT_FAMILY_TITLE,
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.archiveAccent,
      textAlign: 'center',
      marginBottom: 8,
      ...glowingText,
    },
    StoryRarityBadge: {
      backgroundColor: theme.rarityEpic,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      marginLeft: 8,
    },
    StoryRarityText: {
      color: '#1F2937',
      fontSize: 9,
      fontWeight: 'bold',
    },
    StorySubtitle: {
      fontFamily: FONT_FAMILY_BODY,
      fontSize: 14,
      color: theme.archiveSubtext,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    StoryDifficultyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    StoryDifficultyText: {
      fontSize: 10,
      color: theme.rarityEpic,
      marginLeft: 3,
      fontWeight: '600',
    },
    StoryAtmosphereRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    StoryAtmosphereText: {
      fontSize: 10,
      color: theme.archiveSubtext,
      fontStyle: 'italic',
      marginLeft: 4,
    },
    StoryCloseButton: {
      backgroundColor: theme.notification,
      padding: 8,
      borderRadius: 6,
    },
    StoryCloseIcon: {
      color: '#FECACA',
    },
    StoryMainpassages: {
      flex: 1,
      // Ensure proper layout on mobile
      minHeight: 0,
    },
    StoryCurrentAtmosphere: {
      marginBottom: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      padding: 8,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    StoryPassageContainer: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
      minHeight: 100,
    },
    StoryPassageText: {
      fontFamily: FONT_FAMILY_BODY,
      fontSize: 16,
      color: theme.archiveText,
      lineHeight: 24,
      fontStyle: 'italic',
    },
    StoryChoicesContainer: {
      gap: 5,
      marginLeft: 10,
    },
    StoryChoiceButton: {
      backgroundColor: theme.archiveCard,
      padding: -3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
      flexDirection: 'row',
      alignItems: 'center',
    },
    StoryChoiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    StoryChoiceIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    StoryChoiceText: {
      fontFamily: FONT_FAMILY_BODY,
      fontSize: 14,
      fontWeight: '600',
      color: theme.archiveText,
      lineHeight: 20,
      flex: 1,
    },

    // Story/Story Screen - Notifications & Artifact Unlock
    StoryStatGainNotification: {
      position: 'absolute',
      top: 120,
      left: 20,
      right: 20,
      borderRadius: 12,
      overflow: 'hidden',
      zIndex: 1000,
    },
    StoryStatGainGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.5)',
    },
    StoryStatGainpassages: {
      marginLeft: 12,
    },
    StoryStatGainTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#065F46',
      marginBottom: 4,
    },
    StoryStatGainText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#065F46',
    },
    StoryArtifactUnlockNotification: {
      position: 'absolute',
      top: 200,
      left: 20,
      right: 20,
      borderRadius: 16,
      overflow: 'hidden',
      zIndex: 1001,
    },
    StoryArtifactUnlockGradient: {
      padding: 20,
      borderWidth: 2,
      borderColor: 'rgba(168, 85, 247, 0.7)',
    },
    StoryArtifactUnlockpassages: {
      marginLeft: 12,
    },
    StoryArtifactUnlockTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.archiveAccent,
      marginBottom: 6,
      textAlign: 'center',
    },
    StoryArtifactUnlockName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.archiveText,
      marginBottom: 4,
    },
    StoryArtifactUnlockDescription: {
      fontSize: 12,
      color: theme.archiveSubtext,
      marginBottom: 8,
      lineHeight: 16,
    },
    StoryArtifactPowers: {
      marginTop: 4,
    },
    StoryArtifactPowerText: {
      fontSize: 10,
      color: '#C4B5FD',
      fontStyle: 'italic',
    },
    StoryProgressSection: {
      width: '90%',
      marginVertical: 10,
    },

    // ===== STORY CATALOG STYLES =====
    StoryCard: {
      backgroundColor: theme.archiveCard,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    StoryCardGradient: {
      padding: 20,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    StoryCardBlur: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    StoryRarityBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 1,
    },
    StoryLockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      borderRadius: 16,
    },
    StoryLockGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
    },
    StoryLockText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 8,
    },
    StoryCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    StoryTitleSection: {
      flex: 1,
      marginRight: 12,
    },
    StoryCardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      lineHeight: 20,
    },
    StoryCardCategory: {
      fontSize: 12,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    StoryRarityBadgeGradient: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    StoryRarityBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    StoryProgressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    StoryProgressLabel: {
      fontSize: 11,
      marginLeft: 6,
      flex: 1,
    },
    StoryProgressBar: {
      height: 4,
      backgroundColor: 'rgba(55, 65, 81, 0.3)',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 4,
    },
    StoryProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    StoryDescription: {
      fontSize: 12,
      lineHeight: 16,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    StoryAtmosphereContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(30, 41, 59, 0.3)',
      borderRadius: 6,
    },
    StorySkillFocusContainer: {
      marginBottom: 12,
    },
    StorySkillFocusLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 6,
    },
    StorySkillTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    StorySkillTag: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
    },
    StorySkillTagText: {
      fontSize: 9,
      color: '#DDD6FE',
      fontWeight: '500',
    },
    StoryStatBoostsContainer: {
      marginBottom: 12,
    },
    StoryStatBoostsLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 6,
    },
    StoryStatBoostTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    StoryStatBoostTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
    },
    StoryStatBoostText: {
      fontSize: 9,
      marginLeft: 4,
      fontWeight: '500',
    },
    StoryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(75, 85, 99, 0.3)',
    },
    StoryFooterStat: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    StoryFooterStatText: {
      fontSize: 10,
      marginLeft: 4,
    },
    StoryActionButton: {
      marginTop: 12,
      borderRadius: 8,
      overflow: 'hidden',
    },
    StoryActionButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    StoryActionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
      color: '#E0E7FF',
    },

    // ===== STORY MODAL STYLES =====
    StoryModalGradient: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
    },
    StoryModalBlur: {
      flex: 1,
      borderRadius: 16,
      padding: 20,
    },
    StoryModalHeader: {
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    StoryHeaderpassages: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    StoryModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    StoryCloseButtonGradient: {
      padding: 8,
      borderRadius: 6,
    },
    StoryModalSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    StoryScrollView: {
      flex: 1,
    },
    StoryGrid: {
      paddingBottom: 20,
    },

    // ===== CODEX MODAL STYLES =====
    codexModalOverlay: {
      flex: 1,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    codexModalpassages: {
      width: width * 0.9,
      height: height * 0.8,
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'hidden',
    },
    codexPixelBorder: {
      flex: 1,
      borderWidth: 2,
      borderColor: theme.archiveBorder,
      backgroundColor: theme.archiveMode === 'dark' ? '#1A2332' : '#F5E6D3',
      padding: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    codexTextureOverlay: {
      opacity: theme.archiveMode === 'dark' ? 0.3 : 0.8,
      resizeMode: 'stretch',
      width: '100%',
      height: '100%',
    },
    codexInnerpassages: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: 24,
      justifyContent: 'flex-start',
    },
    codexHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: theme.archiveBorder,
      paddingBottom: 12,
    },
    codexTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 1,
      textShadowColor: theme.archiveMode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    codexCloseButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)',
    },
    codexTypeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 8,
    },
    codexTypeButton: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: 'transparent',
      width: '30%',
    },
    codexSelectedType: {
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
    },
    codexTypeText: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    codexpassagesContainer: {
      flex: 1,
      flexDirection: 'column',
      gap: 16,
    },
    codexPromptSection: {
      flex: 0.4,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 12,
    },
    codexInputSection: {
      flex: 0.6,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 12,
    },
    codexSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      letterSpacing: 0.5,
      textShadowColor: theme.archiveMode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    codexPromptList: {
      flex: 1,
    },
    codexPromptItem: {
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(243, 244, 246, 0.5)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
    },
    codexSelectedPrompt: {
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
      borderColor: theme.archiveAccent,
    },
    codexCompletedPrompt: {
      opacity: 0.5,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.2)',
    },
    codexPromptText: {
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.3,
      marginBottom: 8,
    },
    codexPromptMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    codexSkillCategory: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    codexDifficulty: {
      fontSize: 12,
      letterSpacing: 0.3,
    },
    codexJournalInput: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 12,
      textAlignVertical: 'top',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.3,
    },
    codexVoicePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(243, 244, 246, 0.3)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
    },
    codexVoiceText: {
      fontSize: 16,
      marginTop: 12,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    codexSaveButton: {
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)',
      padding: 16,
      borderWidth: 2,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    codexDisabledButton: {
      opacity: 0.5,
    },
    codexSaveButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 1,
    },

    // ===== DRAWING CANVAS STYLES =====
    drawingCanvasContainer: {
      flex: 1,
      backgroundColor: theme.archiveMode === 'dark' ? '#1A2332' : '#F8FAFC',
      minHeight: 300,
    },
    drawingCanvasContainerMobile: {
      flex: 1,
      backgroundColor: theme.archiveMode === 'dark' ? '#1A2332' : '#F8FAFC',
      minHeight: 0,
      minWidth: 0,
      padding: 0,
    },
    drawingCanvasToolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(243, 244, 246, 0.8)',
      borderBottomWidth: 1,
      borderBottomColor: theme.archiveBorder,
    },
    drawingCanvasToolbarMobile: {
      padding: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    drawingCanvasCanvas: {
      flex: 1,
      backgroundColor: theme.archiveMode === 'dark' ? '#0F172A' : '#FFFFFF',
      minHeight: 200,
    },
    drawingCanvasCanvasMobile: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      backgroundColor: theme.archiveMode === 'dark' ? '#0F172A' : '#FFFFFF',
    },
    drawingCanvasBottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(243, 244, 246, 0.8)',
      borderTopWidth: 1,
      borderTopColor: theme.archiveBorder,
    },
    drawingCanvasBottomBarMobile: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.95)' : 'rgba(243, 244, 246, 0.95)',
      borderTopWidth: 1,
      borderTopColor: theme.archiveBorder,
    },
    drawingCanvasColorPicker: {
      flexDirection: 'row',
      gap: 10,
    },
    drawingCanvasColorOption: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.archiveMode === 'dark' ? '#4B5563' : '#D1D5DB',
    },
    drawingCanvasSelectedColor: {
      borderColor: theme.archiveText,
      borderWidth: 3,
    },
    drawingCanvasWidthPicker: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    drawingCanvasWidthOption: {
      backgroundColor: theme.archiveText,
      borderRadius: 50,
    },
    drawingCanvasSelectedWidth: {
      borderWidth: 2,
      borderColor: theme.archiveAccent,
    },
    drawingCanvasActions: {
      flexDirection: 'row',
      gap: 10,
    },
    drawingCanvasActionButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
    },
    drawingCanvasCancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 0.8)',
    },
    drawingCanvasSaveButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.archiveAccent,
    },
    drawingCanvasButtonText: {
      color: theme.archiveText,
      fontWeight: 'bold',
      fontSize: 16,
    },

    // ===== CHARACTER CREATOR STYLES =====
    characterCreatorContainer: {
      flex: 1,
      backgroundColor: theme.archiveBackground,
  },
  characterCreatorHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.archiveBorder,
},
characterCreatorNameInput: {
  fontFamily: FONT_FAMILY_BODY,
  color: theme.archiveText,
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 2,
  borderBottomWidth: 2,
  borderBottomColor: theme.archiveBorder,
  paddingVertical: 8,
  paddingHorizontal: 12,
  minWidth: 200,
  textAlign: 'center',
  backgroundColor: 'rgba(0,0,0,0.2)',
  borderRadius: 8,
},
    characterCreatorTitle: {
      fontFamily: FONT_FAMILY_TITLE,
      color: theme.archiveAccent,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      ...engravedText,
  },
  characterCreatorMainpassages: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
    characterCreatorPreviewSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 8,
      minHeight: 200, // Reduced from 300 to allow smaller character
      maxHeight: 350, // Reduced from 500 to prevent excessive sizing
    },
    characterCreatorColorSection: {
      flex: 1,
      paddingLeft: 8,
      justifyContent: 'center',
    },
    characterCreatorColorContainer: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    characterCreatorColorOptionsContainer: {
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(243, 244, 246, 0.5)',
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
      maxHeight: 300, // Limit height to prevent overlap
    },
    characterCreatorSkinSelectorBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      resizeMode: 'stretch',
     
     
     
     
      zIndex: 0,
    },
    characterCreatorSectionTitle: {
      color: theme.archiveText,
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    characterCreatorColorCategory: {
      marginBottom: 8,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
    },
    characterCreatorColorCategoryLabel: {
      color: theme.archiveText,
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'center',
    },
    characterCreatorColorControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    characterCreatorColorArrowButton: {
      backgroundColor: theme.archiveAccent,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.archiveMode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    characterCreatorColorOptionText: {
      color: theme.archiveText,
      fontSize: 11,
      fontWeight: '500',
      minWidth: 40,
      textAlign: 'center',
    },
    characterCreatorColorArrowText: {
      color: theme.archiveMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    characterCreatorBottomSection: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      borderTopWidth: 1,
      borderTopColor: theme.archiveBorder,
    },
    characterCreatorStyleCategoryContainer: {
      marginBottom: 16,
    },
    characterCreatorCategoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginHorizontal: 4,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    characterCreatorSelectedCategoryButton: {
      backgroundColor: theme.archiveAccent,
      borderColor: theme.archiveAccent,
    },
    characterCreatorCategoryText: {
      color: theme.archiveText,
      fontSize: 14,
      fontWeight: '500',
    },
    characterCreatorSelectedCategoryText: {
      color: theme.archiveMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
      fontWeight: 'bold',
    },
    characterCreatorStyleSelectorContainer: {
      marginVertical: 20,
      alignItems: 'center',
    },
    characterCreatorStyleControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 200,
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(243, 244, 246, 0.3)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    characterCreatorArrowButton: {
      backgroundColor: theme.archiveAccent,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.archiveMode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    characterCreatorArrowText: {
      color: theme.archiveMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
    },
    characterCreatorOptionText: {
      color: theme.archiveText,
      fontSize: 16,
      fontWeight: '500',
      minWidth: 80,
      textAlign: 'center',
    },
    characterCreatorSkinSelectorContainer: {
      width: 360,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      position: 'relative',
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(243, 244, 246, 0.3)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },
    characterCreatorSkinGrid: {
      flexDirection: 'row',
      width: 360,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    characterCreatorSkinColumn: {
      flexDirection: 'column',
    },
    characterCreatorSkinOption: {
      margin: 2,
      borderRadius: 4,
      overflow: 'hidden',
    },
    characterCreatorSelectedSkinOption: {
      borderWidth: 2,
      borderColor: theme.archiveAccent,
      borderRadius: 4,
    },
    characterCreatorSkinFrame: {
      width: 60,
      height: 15,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    characterCreatorSkinColorImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
    },
    characterCreatorSkinFrameOverlay: {
      width: 60,
      height: 15,
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 2,
    },
    characterCreatorButtonSection: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      alignItems: 'center',
      backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      borderTopWidth: 1,
      borderTopColor: theme.archiveBorder,
    },
    characterCreatorCompleteButton: {
      backgroundColor: theme.archiveAccent,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      shadowColor: theme.archiveMode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    characterCreatorCompleteButtonText: {
      color: theme.archiveMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    characterCreatorLogoutButton: {
      backgroundColor: '#ff4444',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginBottom: 20,
    },
    characterCreatorLogoutButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },

    // ===== PERSONALITY HOME SCREEN STYLES =====
    personalityCentered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#181A20",
    },
    personalityTabBar: {
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#4ee6e6",
      shadowColor: "#4ee6e6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    personalityTabButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      marginHorizontal: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },
    personalityTabButtonActive: {
      backgroundColor: "rgba(78, 230, 230, 0.2)",
      borderColor: "#4ee6e6",
      shadowColor: "#4ee6e6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    personalityTabIcon: {
      fontSize: 22,
      marginBottom: 6,
    },
    personalityTabText: {
      color: "#ccc",
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
    personalityTabTextActive: {
      color: "#4ee6e6",
      fontWeight: "700",
      textShadowColor: "#4ee6e6",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    personalitySectionTitle: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
      marginBottom: 10,
      marginTop: 10,
    },
    personalityTraitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    personalityTraitCard: {
      backgroundColor: "#23242b",
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: "#333",
    },
    personalityPrimaryTraitCard: {
      borderColor: "#4ee6e6",
      borderWidth: 2,
      backgroundColor: "#2a2d35",
    },
    personalityTraitName: {
      color: "#4ee6e6",
      fontWeight: "bold",
      fontSize: 12,
      marginBottom: 2,
    },
    personalityTraitScore: {
      color: "#ffe066",
      fontWeight: "bold",
      fontSize: 16,
    },
    personalityPrimaryIndicator: {
      color: "#4ee6e6",
      fontSize: 10,
      fontWeight: "bold",
      marginTop: 2,
    },
    personalityMoodBubble: {
      backgroundColor: "#f5e6c4",
      borderRadius: 12,
      padding: 16,
      marginVertical: 15,
      borderWidth: 2,
      borderColor: "#e2c48d",
      alignItems: "center",
    },
    personalityMoodText: {
      color: "#5a4a2c",
      fontSize: 14,
      fontStyle: "italic",
      textAlign: "center",
    },
    personalityProfileStatus: {
      marginTop: 20,
    },
    personalityStatusCard: {
      backgroundColor: "#23242b",
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: "#333",
    },
    personalityStatusText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
    },
    personalityStatusSubtext: {
      color: "#ccc",
      fontSize: 12,
      lineHeight: 16,
    },
    personalityRetryButton: {
      backgroundColor: "#4ee6e6",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    personalityStoryHeader: {
      marginBottom: 20,
    },
    personalityStorySubtitle: {
      color: "#4ee6e6",
      fontSize: 16,
      fontWeight: "500",
    },
    personalityCenteredMessage: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    personalityCenteredMessageTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    personalityCenteredMessageText: {
      color: "#ccc",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    personalityErrorText: {
      color: "#ff6b6b",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
    },
    personalityStoryCard: {
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 12,
      paddingBottom: 12,
      shadowColor: "rgba(38, 70, 83, 0.01)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      overflow: 'hidden',
    },
    personalityStoryCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    personalityStoryTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      flex: 1,
      marginRight: 10,
    },
    personalityStoryBadges: {
      flexDirection: "row",
      gap: 8,
    },
    personalityCategoryBadge: {
      backgroundColor: "#4ee6e6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    personalityCategoryBadgeText: {
      color: "#000",
      fontSize: 10,
      fontWeight: "bold",
    },
    personalityDifficultyBadge: {
      backgroundColor: "#ffe066",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    personalityDifficultyBadgeText: {
      color: "#000",
      fontSize: 10,
      fontWeight: "bold",
    },
    personalityStoryDescription: {
      color: "#ccc",
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    personalityStoryFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    personalityStoryStats: {
      flexDirection: "row",
      gap: 16,
    },
    personalityStoryStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    personalityStoryStatText: {
      color: '#9CA3AF',
      fontSize: 12,
    },
    personalityMatch: {
      backgroundColor: "rgba(78, 230, 230, 0.05)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    personalityMatchText: {
      color: "#4ee6e6",
      fontSize: 11,
      fontWeight: "bold",
    },
    personalityFilterInfo: {
      backgroundColor: "#23242b",
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#333",
    },
    personalityFilterInfoTitle: {
      color: "#4ee6e6",
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 8,
    },
    personalityFilterInfoText: {
      color: "#ccc",
      fontSize: 12,
      lineHeight: 16,
    },
    personalityTypeCard: {
      backgroundColor: "#23242b",
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: "#4ee6e6",
      shadowColor: "#4ee6e6",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    personalityTypeHeader: {
      alignItems: "center",
      marginBottom: 10,
    },
    personalityTypeLabel: {
      color: "#4ee6e6",
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 2,
    },
    personalityTypeName: {
      color: "#ffe066",
      fontSize: 18,
      fontWeight: "bold",
    },
    personalityTypeClass: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    personalityTypeContent: {
      alignItems: "center",
    },
    personalityTypeDescription: {
      color: "#ccc",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 10,
    },
    personalityDominantTraitInfo: {
      alignItems: "center",
      marginBottom: 10,
    },
    personalityDominantTraitLabel: {
      color: "#4ee6e6",
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 2,
    },
    personalityDominantTraitScore: {
      color: "#ffe066",
      fontSize: 16,
      fontWeight: "bold",
    },
    personalityLastUpdatedText: {
      color: "#ccc",
      fontSize: 12,
      fontStyle: "italic",
      marginTop: 5,
    },
    personalitySectionSubtitle: {
      color: '#9CA3AF',
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
    },
    personalityStoryCardGradient: {
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
      overflow: 'hidden',
    },
    personalityStoryCardTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
    },
    personalityStoryCardCategory: {
      color: "#ccc",
      fontSize: 12,
      fontWeight: "500",
    },
    personalityStoryInfo: {
      flex: 1,
    },
    personalityStoryDescriptionContainer: {
      marginBottom: 16,
    },
    personalityStoryAtmosphere: {
      color: '#06B6D4',
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    personalityExplorationContainer: {
      marginBottom: 16,
    },
    personalityExplorationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    personalityExplorationLabel: {
      color: '#06B6D4',
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 8,
    },
    personalityExplorationValue: {
      color: '#06B6D4',
      fontSize: 14,
      fontWeight: 'bold',
    },
    personalityExplorationBar: {
      height: 6,
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    personalityExplorationFill: {
      height: '100%',
      borderRadius: 3,
    },
    personalityExplorationFooter: {
      color: '#9CA3AF',
      fontSize: 12,
      textAlign: 'center',
    },

    // Additional styles for personality story catalog
    personalityStoryCatalogContainer: {
      flex: 1,
    },
    personalityStoryCatalogHeader: {
      marginBottom: 20,
    },
    personalityStoryHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    personalityStoryCatalogTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginLeft: 12,
    },
    personalityStoryCatalogSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 36,
    },
    personalityStoryScrollView: {
      flex: 1,
    },
    personalityStoryGrid: {
      paddingBottom: 20,
    },

    personalityStoryRarityBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      borderWidth: 2,
      opacity: 0.8,
    },
    personalityStoryLockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      zIndex: 10,
    },
    personalityStoryLockGradient: {
      flex: 1,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    personalityStoryLockText: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 8,
    },
    personalityStoryTitleSection: {
      flex: 1,
    },
    personalityStoryRarityBadge: {
      marginLeft: 8,
    },
    personalityStoryRarityBadgeGradient: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    personalityStoryRarityBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
    },
    personalityStoryProgressSection: {
      marginBottom: 12,
    },
    personalityStoryProgressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    personalityStoryProgressLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    personalityStoryProgressBar: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    personalityStoryProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    personalityStoryAtmosphereContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    personalityStoryAtmosphereText: {
      fontSize: 12,
      fontStyle: 'italic',
      marginLeft: 6,
    },
    personalityStorySkillFocusContainer: {
      marginBottom: 12,
    },
    personalityStorySkillFocusLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    personalityStorySkillTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    personalityStorySkillTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    personalityStorySkillTagText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    personalityStoryStatBoostsContainer: {
      marginBottom: 12,
    },
    personalityStoryStatBoostsLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    personalityStoryStatBoostTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    personalityStoryStatBoostTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    personalityStoryStatBoostText: {
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    personalityStoryFooterStat: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    personalityStoryFooterStatText: {
      fontSize: 11,
      marginLeft: 4,
    },
    personalityStoryActionButton: {
      marginTop: 8,
    },
    personalityStoryActionButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    personalityStoryActionButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 6,
    },

    // ===== RPG UI COMPONENTS STYLES =====
    
    // Daily Curator Message Styles
    personalityCuratorMessageCard: {
      backgroundColor: '#2a2d35',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#4ee6e6',
      shadowColor: '#4ee6e6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
      marginBottom: 16,
    },
    personalityCuratorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    personalityCuratorAvatar: {
      fontSize: 32,
      marginRight: 12,
    },
    personalityCuratorInfo: {
      flex: 1,
    },
    personalityCuratorName: {
      color: '#4ee6e6',
      fontSize: 16,
      fontWeight: 'bold',
    },
    personalityCuratorTitle: {
      color: '#ccc',
      fontSize: 12,
      fontStyle: 'italic',
    },
    personalityDailyLabel: {
      color: '#ffe066',
      fontSize: 10,
      fontWeight: 'bold',
      backgroundColor: 'rgba(255, 224, 102, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    personalityMessageContent: {
      marginBottom: 8,
    },
    personalityPersonalizedGreeting: {
      color: '#4ee6e6',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    personalityCuratorMessage: {
      color: '#fff',
      fontSize: 14,
      fontStyle: 'italic',
      lineHeight: 20,
    },
    personalityExpandedContent: {
      borderTopWidth: 1,
      borderTopColor: '#444',
      paddingTop: 12,
      marginTop: 8,
    },
    personalityExpandedHint: {
      color: '#ccc',
      fontSize: 12,
      marginBottom: 8,
    },
    personalityExpandedFooter: {
      color: '#999',
      fontSize: 10,
      fontStyle: 'italic',
      textAlign: 'right',
    },

    // Character Progression Styles
    personalityProgressionCard: {
      backgroundColor: '#23242b',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#ffe066',
      marginBottom: 16,
    },
    personalityProgressionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    personalityProgressionTitle: {
      color: '#ffe066',
      fontSize: 18,
      fontWeight: 'bold',
    },
    personalityLevelBadge: {
      backgroundColor: '#4ee6e6',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    personalityLevelText: {
      color: '#000',
      fontSize: 14,
      fontWeight: 'bold',
    },
    personalityLevelTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    personalityExperienceSection: {
      marginBottom: 16,
    },
    personalityExperienceBar: {
      height: 20,
      backgroundColor: '#333',
      borderRadius: 10,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    personalityExperienceProgress: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      backgroundColor: '#4ee6e6',
      borderRadius: 10,
    },
    personalityExperienceText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      zIndex: 1,
    },
    personalityProgressStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    personalityProgressStat: {
      alignItems: 'center',
      flex: 1,
    },
    personalityStatIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    personalityStatLabel: {
      color: '#ccc',
      fontSize: 10,
      marginBottom: 2,
    },
    personalityStatValue: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    personalityNextLevelPreview: {
      backgroundColor: '#333',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    personalityNextLevelLabel: {
      color: '#4ee6e6',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    personalityNextLevelBenefit: {
      color: '#fff',
      fontSize: 14,
      fontStyle: 'italic',
    },

    // Quest Achievements Styles
    personalityQuestsContainer: {
      marginBottom: 16,
    },
    personalityQuestsTitle: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    personalityQuestsSubtitle: {
      color: '#ccc',
      fontSize: 14,
      marginBottom: 16,
    },
    personalityQuestCard: {
      backgroundColor: '#23242b',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#444',
    },
    personalityQuestCompleted: {
      borderColor: '#4ee6e6',
      backgroundColor: '#2a2d35',
    },
    personalityQuestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    personalityQuestTitle: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
    },
    personalityQuestRewardBadge: {
      backgroundColor: '#333',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    personalityQuestReward: {
      color: '#ffe066',
      fontSize: 10,
      fontWeight: 'bold',
    },
    personalityQuestDescription: {
      color: '#ccc',
      fontSize: 12,
      marginBottom: 8,
    },
    personalityQuestProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    personalityQuestProgressBar: {
      flex: 1,
      height: 6,
      backgroundColor: '#333',
      borderRadius: 3,
      overflow: 'hidden',
    },
    personalityQuestProgressFill: {
      height: '100%',
      backgroundColor: '#4ee6e6',
      borderRadius: 3,
    },
    personalityQuestProgressCompleted: {
      backgroundColor: '#2ECC71',
    },
    personalityQuestProgressText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    personalityQuestExpanded: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#444',
    },
    personalityQuestHint: {
      color: '#ccc',
      fontSize: 11,
      fontStyle: 'italic',
    },

    // Coping Tools Styles
    personalityToolsContainer: {
      marginBottom: 16,
    },
    personalityToolsTitle: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    personalityToolsCounter: {
      color: '#ccc',
      fontSize: 12,
      marginBottom: 12,
    },
    personalityToolsScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    personalityToolCard: {
      backgroundColor: '#23242b',
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      width: 120,
      borderWidth: 1,
      borderColor: '#4ee6e6',
      alignItems: 'center',
    },
    personalityToolLocked: {
      borderColor: '#666',
      backgroundColor: '#1a1a1a',
    },
    personalityToolIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    personalityToolIconLocked: {
      opacity: 0.5,
    },
    personalityToolName: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
    },
    personalityToolNameLocked: {
      color: '#666',
    },
    personalityToolDescription: {
      color: '#ccc',
      fontSize: 10,
      textAlign: 'center',
      lineHeight: 14,
    },
    personalityToolDescriptionLocked: {
      color: '#666',
    },

    // ===== WELLNESS ATTRIBUTES (ECHOES OF THE SELF) STYLES =====
    personalityAttributesContainer: {
      marginBottom: 16,
    },
    personalityEchoesTitle: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      textAlign: 'center',
    },
    personalityAttributesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    personalityAttributeCardParchment: {
      backgroundColor: '#2a2d35',
      borderRadius: 12,
      padding: 16,
      width: '48%',
      borderWidth: 1,
      borderColor: '#4ee6e6',
      shadowColor: '#4ee6e6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    personalityAttributeLabel: {
      color: '#4ee6e6',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    personalityAttributeBarMagic: {
      height: 8,
      backgroundColor: '#333',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    personalityAttributeProgressMagic: {
      height: '100%',
      borderRadius: 4,
    },
    personalityAttributeValue: {
      color: '#ffe066',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    personalityCuratorNote: {
      color: '#ccc',
      fontSize: 10,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    personalityCuratorNoteText: {
      color: '#fff',
      fontStyle: 'normal',
    },

    // ===== RPG CONTAINER STYLES =====
    personalityRpgContainer: {
      flex: 1,
      padding: 16,
      gap: 16,
    },





    // ===== PERSONALITY HEADER STYLES =====
    personalityHeaderContainer: {
      paddingTop: 30,
      paddingBottom: 20,
      paddingHorizontal: 20,
      position: 'relative',
      borderBottomWidth: 2,
      borderBottomColor: '#4ee6e6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      backgroundColor: '#0a0b0f',
    },
    personalityBackgroundElements: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      opacity: 0.1,
    },
    personalityBackgroundRune: {
      fontSize: 60,
      transform: [{ rotate: '15deg' }],
      color: '#4ee6e6',
    },
    personalityHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
      zIndex: 1,
    },

    personalityLeftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    personalityAvatarContainer: {
      position: 'relative',
      marginRight: 15,
    },
    personalityAvatarIcon: {
      fontSize: 48,
      zIndex: 2,
    },
    personalityAvatarGlow: {
      position: 'absolute',
      top: -5,
      left: -5,
      right: -5,
      bottom: -5,
      borderRadius: 35,
      opacity: 0.3,
      zIndex: 1,
      backgroundColor: '#4ee6e6',
    },
    personalityScholarInfo: {
      flex: 1,
    },
    personalityScholarRank: {
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 2,
      color: '#4ee6e6',
    },
    personalityScholarClass: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#ffe066',
    },
    personalityScholarLevel: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: '600',
      textShadowColor: '#4ee6e6',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    personalityRightSection: {
      flex: 1,
      alignItems: 'flex-end',
    },
    personalityGameInfo: {
      alignItems: 'flex-end',
    },
    personalityArchiveLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 2,
      marginBottom: 2,
      color: '#4ee6e6',
    },
    personalityGameTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
      textShadowColor: '#4ee6e6',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    personalityArchiveSection: {
      color: '#ccc',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'right',
      marginBottom: 4,
    },
    personalityHeaderCuratorNote: {
      color: '#ccc',
      fontSize: 11,
      fontStyle: 'italic',
      textAlign: 'right',
    },
    personalityJourneySection: {
      marginTop: 10,
    },
    personalityJourneyIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      padding: 10,
      borderRadius: 8,
      borderLeftWidth: 3,
      backgroundColor: 'rgba(78, 230, 230, 0.2)',
      borderLeftColor: '#4ee6e6',
    },
    personalityJourneyIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    personalityJourneyText: {
      color: '#ccc',
      fontSize: 13,
      fontStyle: 'italic',
      flex: 1,
    },
    personalityMindStateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    personalityMindState: {
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 5,
    },
    personalityMindStateIcon: {
      fontSize: 18,
      marginBottom: 4,
    },
    personalityMindStateLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 6,
      color: '#4ee6e6',
    },
    personalityMindStateBar: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(78, 230, 230, 0.2)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    personalityMindStateProgress: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: '#4ee6e6',
    },
    personalityMysticalBorder: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: '#4ee6e6',
    },
    personalityDevToggle: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 40,
      height: 40,
      backgroundColor: 'rgba(78, 230, 230, 0.1)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    personalitySwitcher: {
      position: 'absolute',
      top: 60,
      right: 10,
      backgroundColor: '#23242b',
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: '#4ee6e6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    personalitySwitcherTitle: {
      color: '#4ee6e6',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    personalitySwitcherButton: {
      backgroundColor: '#2a2d35',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginVertical: 2,
      borderWidth: 1,
      borderColor: '#444',
    },
    personalitySwitcherButtonText: {
      color: '#fff',
      fontSize: 11,
      textAlign: 'center',
    },

    // ===== PERSONALITY TAB STYLES =====
    personalityMindStateTabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#23242b',
      borderBottomWidth: 1,
      borderColor: '#333',
      paddingVertical: 8,
      marginTop: 15,
    },
    personalityMindStateTab: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    personalityMindStateTabActive: {
      borderBottomWidth: 2,
      borderBottomColor: '#4ee6e6',
    },
    personalityMindStateTabIcon: {
      fontSize: 16,
      marginBottom: 4,
    },
    personalityMindStateTabLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ccc',
    },
    personalityMindStateTabLabelActive: {
      color: '#4ee6e6',
    },
    personalityDevToggleText: {
      color: '#4ee6e6',
      fontSize: 8,
      fontWeight: 'bold',
    },
    personalitySwitcherButtonActive: {
      borderColor: '#4ee6e6',
      backgroundColor: '#2a2d35',
    },

    // Archive Stories Section Styles
    personalityArchiveStoriesContainer: {
      flex: 1,
      padding: 16,
    },
    personalityCuratorIntroCard: {
      backgroundColor: 'rgba(78, 230, 230, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#4ee6e6',
      padding: 16,
      marginBottom: 20,
    },
    personalityCuratorIntroHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    personalityCuratorIntroAvatar: {
      fontSize: 32,
      marginRight: 12,
      marginTop: 4,
    },
    personalityCuratorIntroContent: {
      flex: 1,
    },
    personalityCuratorIntroTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#4ee6e6',
    },
    personalityCuratorIntroText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#ccc',
      fontStyle: 'italic',
    },

    // Loading States
    personalityArchiveLoadingContainer: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: 'rgba(78, 230, 230, 0.05)',
      borderRadius: 12,
      marginBottom: 20,
    },
    personalityArchiveLoadingIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    personalityArchiveLoadingText: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    personalityArchiveLoadingSubtext: {
      fontSize: 12,
      color: '#999',
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },

    // Error States
    personalityArchiveErrorContainer: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderRadius: 12,
      marginBottom: 20,
    },
    personalityArchiveErrorIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    personalityArchiveErrorTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ff6b6b',
      marginBottom: 8,
      textAlign: 'center',
    },
    personalityArchiveErrorText: {
      fontSize: 14,
      color: '#ccc',
      marginBottom: 20,
      textAlign: 'center',
    },
    personalityArchiveRetryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: '#4ee6e6',
    },
    personalityArchiveRetryText: {
      color: '#1a1d23',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },

    // Stories List
    personalityArchiveStoriesScroll: {
      flex: 1,
    },

    // Archive Story Card Styles
    personalityArchiveStoryCard: {
      backgroundColor: 'rgba(78, 230, 230, 0.08)',
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(78, 230, 230, 0.2)',
    },
    personalityArchiveStoryCardHeader: {
      padding: 16,
      paddingBottom: 12,
    },
    personalityArchiveStoryCardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 8,
    },
    personalityArchiveStoryCardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    personalityArchiveStoryCardBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    personalityArchiveStoryCardBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#1a1d23',
    },
    personalityArchiveStoryCardDifficulty: {
      fontSize: 12,
      color: '#999',
      marginLeft: 'auto',
    },
    personalityArchiveStoryCardDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: '#ccc',
      marginBottom: 12,
    },
    personalityArchiveStoryCardCuratorNote: {
      backgroundColor: 'rgba(78, 230, 230, 0.1)',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#4ee6e6',
    },
    personalityArchiveStoryCardCuratorText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: '#4ee6e6',
      lineHeight: 16,
    },
    personalityArchiveStoryCardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingTop: 12,
      backgroundColor: 'rgba(78, 230, 230, 0.05)',
    },
    personalityArchiveStoryCardStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    personalityArchiveStoryCardStat: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    personalityArchiveStoryCardStatIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    personalityArchiveStoryCardStatText: {
      fontSize: 11,
      color: '#999',
    },
    personalityArchiveStoryCardEnterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: '#4ee6e6',
    },
    personalityArchiveStoryCardEnterText: {
      color: '#1a1d23',
      fontSize: 12,
      fontWeight: 'bold',
      marginRight: 4,
    },
    personalityArchiveStoryCardEnterIcon: {
      fontSize: 12,
      color: '#1a1d23',
    },

    // ===== PERSONALITY RESTORATION STYLES =====
    personalityRestorationContainer: {
      flex: 1,
      padding: 20,
    },
    personalityRestorationTitle: {
      color: '#4ee6e6',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: '#4ee6e6',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    personalityRestorationSubtitle: {
      color: '#ccc',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      fontStyle: 'italic',
    },
    personalityProgressSection: {
      marginBottom: 24,
    },
    personalityProgressCard: {
      backgroundColor: '#23242b',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#4ee6e6',
      shadowColor: '#4ee6e6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    personalityProgressLabel: {
      color: '#4ee6e6',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    personalityProgressValue: {
      color: '#ffe066',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    personalityProgressBar: {
      height: 8,
      backgroundColor: '#333',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    personalityProgressFill: {
      height: '100%',
      borderRadius: 4,
    },
    personalityProgressText: {
      color: '#ccc',
      fontSize: 12,
      textAlign: 'center',
    },
    personalityWellnessProgress: {
      marginBottom: 24,
    },
    personalityWellnessItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: '#23242b',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#444',
    },
    personalityWellnessLabel: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      width: 80,
      marginRight: 12,
    },
    personalityWellnessBar: {
      flex: 1,
      height: 6,
      backgroundColor: '#333',
      borderRadius: 3,
      overflow: 'hidden',
      marginRight: 12,
    },
    personalityWellnessFill: {
      height: '100%',
      borderRadius: 3,
    },
    personalityWellnessValue: {
      color: '#ffe066',
      fontSize: 12,
      fontWeight: 'bold',
      width: 40,
      textAlign: 'right',
    },
    personalityAchievementsSection: {
      marginBottom: 24,
    },
    personalityAchievementCard: {
      backgroundColor: '#23242b',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#ffe066',
      flexDirection: 'row',
      alignItems: 'center',
    },
    personalityAchievementIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    personalityAchievementTitle: {
      color: '#ffe066',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    personalityAchievementDesc: {
      color: '#ccc',
      fontSize: 12,
      lineHeight: 16,
    },
  });
};

// ===== STANDARDIZED STYLE PATTERNS =====


// Standard gradient patterns
const standardGradients = {
  primary: ["rgba(10, 11, 15, 0.95)", "rgba(30, 41, 59, 0.8)", "rgba(10, 11, 15, 0.95)"],
  secondary: ["rgba(10, 11, 15, 0.9)", "rgba(30, 41, 59, 0.7)", "rgba(10, 11, 15, 0.9)"],
  accent: ["rgba(78, 230, 230, 0.1)", "rgba(78, 230, 230, 0.05)", "rgba(78, 230, 230, 0.1)"],
  success: ["#10B981", "#059669"],
  warning: ["#FCD34D", "#F59E0B"],
  error: ["#EF4444", "#DC2626"],
  info: ["#06B6D4", "#0891B2"],
  purple: ["#A855F7", "#9333EA"],
  gold: ["#FCD34D", "#F59E0B"],
};

// Standard shadow patterns
const standardShadows = {
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  }),
  accentStrong: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  }),
};

// Standard border patterns
const standardBorders = {
  subtle: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  medium: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  accent: (color: string) => ({
    borderWidth: 1,
    borderColor: color,
  }),
  accentStrong: (color: string) => ({
    borderWidth: 2,
    borderColor: color,
  }),
};

// Standard text shadow patterns
const standardTextShadows = {
  subtle: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  medium: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  accent: (color: string) => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }),
  accentStrong: (color: string) => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  }),
};

// Standard card patterns
const createCardStyles = (theme: ThemeColors) => ({
  // Basic card with gradient
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.archiveBorder,
  },
  cardGradientAccent: (accentColor: string) => ({
    padding: 16,
    borderWidth: 1,
    borderColor: accentColor,
  }),
  
  // Foundation cards (2-column grid)
  foundationCard: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  foundationCardGradient: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
    minHeight: 140,
  },
  foundationCardGradientAccent: (accentColor: string) => ({
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: accentColor,
    minHeight: 140,
  }),
  
  // Section cards
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  sectionCardGradientAccent: (accentColor: string) => ({
    padding: 20,
    borderWidth: 1,
    borderColor: accentColor,
  }),
});

// Standard text patterns
const createTextStyles = (theme: ThemeColors) => ({
  // Title hierarchy
  titleLarge: {
    fontFamily: FONT_FAMILY_TITLE,
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.archiveAccent,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    ...engravedText,
  },
  titleMedium: {
    fontFamily: FONT_FAMILY_TITLE,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.archiveAccent,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    ...engravedText,
  },
  titleSmall: {
    fontFamily: FONT_FAMILY_TITLE,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.archiveAccent,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    ...engravedText,
  },
  
  // Subtitle hierarchy
  subtitleLarge: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 18,
    fontWeight: '600',
    color: theme.archiveAccentSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleMedium: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 16,
    fontWeight: '600',
    color: theme.archiveAccentSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleSmall: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 14,
    fontWeight: '600',
    color: theme.archiveAccentSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  // Body text hierarchy
  bodyLarge: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 16,
    color: theme.archiveText,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 14,
    color: theme.archiveText,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 12,
    color: theme.archiveText,
    lineHeight: 16,
  },
  
  // Caption text
  caption: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 10,
    color: theme.archiveSubtext,
    fontStyle: 'italic',
  },
  
  // Accent text variations
  accentText: (color: string) => ({
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 14,
    fontWeight: '600',
    color: color,
  }),
  accentTextLarge: (color: string) => ({
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 16,
    fontWeight: '600',
    color: color,
  }),
  accentTextSmall: (color: string) => ({
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 12,
    fontWeight: '600',
    color: color,
  }),
});

// Standard button patterns
const createButtonStyles = (theme: ThemeColors) => ({
  // Primary buttons
  buttonPrimary: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
  },
  buttonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonPrimaryText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  
  // Secondary buttons
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.archiveSubtext,
  },
  buttonSecondaryText: {
    color: theme.archiveSubtext,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Small buttons
  buttonSmall: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonSmallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: '#E0E7FF',
  },
  
  // Interactive buttons
  buttonInteractive: {
    borderRadius: 8,
    overflow: 'hidden',
    activeOpacity: 0.8,
  },
  buttonInteractiveGradient: (accentColor: string) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: accentColor,
  }),
  buttonInteractiveText: (color: string) => ({
    color: color,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  }),
});

// Standard progress bar patterns
const createProgressStyles = (theme: ThemeColors) => ({
  // Basic progress bars
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarSmall: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarTiny: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Progress fills
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 3,
  },
  progressFillTiny: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Progress segments
  progressSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
  },
  progressSegmentActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.6)',
  },
});

// Standard badge patterns
const createBadgeStyles = (theme: ThemeColors) => ({
  // Basic badges
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Status badges
  badgeStatus: {
    backgroundColor: 'rgba(75, 85, 99, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeStatusText: {
    color: theme.archiveSubtext,
    fontSize: 9,
  },
  
  // Success badges
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeSuccessText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Warning badges
  badgeWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeWarningText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Custom color badges
  badgeCustom: (backgroundColor: string, textColor: string) => ({
    backgroundColor: backgroundColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  }),
  badgeCustomText: (color: string) => ({
    color: color,
    fontSize: 10,
    fontWeight: 'bold',
  }),
});

// Standard layout patterns
const createLayoutStyles = (theme: ThemeColors) => ({
  // Grid layouts
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridTwoColumn: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridColumn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Centered layouts
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredMessage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.archiveBorder,
  },
  
  // Section layouts
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionContent: {
    padding: 16,
  },
});

// Standard interactive patterns
const createInteractiveStyles = (theme: ThemeColors) => ({
  // Touchable elements
  touchable: {
    activeOpacity: 0.8,
  },
  touchableCard: {
    activeOpacity: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Interactive indicators
  interactiveIndicator: (color: string) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  }),
  
  // Hover effects (for web)
  hoverEffect: {
    transform: [{ scale: 1.02 }],
  },
});

// Export all standardized patterns
export const getStandardizedStyles = (theme: ThemeColors) => ({
  gradients: standardGradients,
  shadows: standardShadows,
  borders: standardBorders,
  textShadows: standardTextShadows,
  cards: createCardStyles(theme),
  text: createTextStyles(theme),
  buttons: createButtonStyles(theme),
  progress: createProgressStyles(theme),
  badges: createBadgeStyles(theme),
  layout: createLayoutStyles(theme),
  interactive: createInteractiveStyles(theme),
});

// Combined function to get both global styles and standardized patterns
export const getCompleteStyles = (theme: ThemeColors) => {
  const globalStyles = createGlobalStyles(theme);
  const standardizedStyles = getStandardizedStyles(theme);
  
  return {
    ...globalStyles,
    std: standardizedStyles,
  };
};  