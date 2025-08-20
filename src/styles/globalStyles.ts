import { Dimensions, ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeColors, loginTheme } from './theme';

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
export const getOnboardingStyles = (onboardingTheme: ThemeColors): {[key: string]: any} => {

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

// Helper function for the Character Creator styles
export const characterCreatorStyles = (characterCreatorTheme: ThemeColors): {[key: string]: any} => {
  return {
  container: {
    flex: 1,
    backgroundColor: '#0a0b0f',
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
    color: '#4ee6e6',
    opacity: 0.3,
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 30,
  },
  
  forgeTitle: {
    color: '#4ee6e6',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 8,
  },
  
  forgeSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  
  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: '#4ee6e6',
    opacity: 0.8,
  },
  
  // Prominent Name Section
  nameSection: {
    backgroundColor: 'rgba(78, 230, 230, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10, // Reduced from 25 to 15
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  
  nameLabel: {
    color: '#4ee6e6',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Name Input Styles
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ee6e6',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  
  nameInputFocused: {
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  
  // Section Titles
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Preview Section
  previewSection: {
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#9d4edd',
  },
  
  previewContainer: {
    alignItems: 'center',
  },
  
  // Style Section
  styleSection: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#f72585',
  },
  
  // Custom Two-Row Grid Layout
  categoryGrid: {
    marginBottom: 5,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },

  selectedCategoryButton: {
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderColor: '#4ee6e6',
    borderWidth: 1,
  },

  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  selectedCategoryText: {
    color: '#4ee6e6',
  },
  
  // Single Color Section
  colorSection: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffd60a',
    alignItems: 'center',
  },
  
  // Style and Color Option Controls
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
  },
  
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 12,
    minWidth: 60,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  
  selectedOptionButton: {
    backgroundColor: 'rgba(78, 230, 230, 0.3)',
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  
  optionImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  
  optionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  
  selectedOptionText: {
    color: '#4ee6e6',
  },
  
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  
  selectedColorButton: {
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  
  // Character Creator Component Styles (for StyleControls and ColorOptionControls)
  characterCreatorHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  
  characterCreatorNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ee6e6',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  
  characterCreatorStyleSelectorContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  
  characterCreatorStyleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 250,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  characterCreatorArrowButton: {
    backgroundColor: '#4ee6e6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  characterCreatorArrowText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  characterCreatorOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'center',
  },
  
  // Color Controls Styles
  characterCreatorColorCategory: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  
  characterCreatorColorCategoryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  characterCreatorColorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  
  characterCreatorColorArrowButton: {
    backgroundColor: '#4ee6e6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  
  characterCreatorColorOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  
  characterCreatorColorArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Complete Section
  completeSection: {
    marginBottom: 40,
  },
  
  completeButton: {
    backgroundColor: '#4ee6e6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  completeButtonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
  },
}
};

// Helper function for the Personality Survey styles 
 export const getPersonalitySurveyStyles = (personalitySurveyTheme: ThemeColors): {[key: string]: any} => {
  return {
    container: {
      flex: 1,
      backgroundColor: personalitySurveyTheme.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    backgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: personalitySurveyTheme.gradientOverlayBackground,
    },
    header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 30,
  },
  
  headerTitle: {
    color: '#4ee6e6',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
  },

    // ---- Modal Styles ----
    // Inspired by onboardingStyles.curatorCard
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalView: {
      backgroundColor: personalitySurveyTheme.card,
      borderRadius: 16,
      padding: 25,
      borderWidth: 1,
      borderColor: personalitySurveyTheme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      maxWidth: 400,
      alignItems: 'center',
    },
    modalTitle: {
      // Inspired by onboardingStyles.pathsTitle
      fontSize: 22,
      fontWeight: 'bold',
      color: personalitySurveyTheme.text,
      textAlign: 'center',
      marginBottom: 15,
    },
    modalText: {
      // Inspired by onboardingStyles.curatorText
      fontSize: 16,
      lineHeight: 24,
      color: personalitySurveyTheme.text,
      fontStyle: 'italic',
      textAlign: 'center',
      marginBottom: 25,
    },
    modalButton: {
      // Inspired by onboardingStyles.pathButton but using primaryColor
      backgroundColor:  personalitySurveyTheme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 30,
      shadowColor: personalitySurveyTheme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    modalButtonText: {
      color: '#fff', // Assuming button text is white/light
      fontSize: 16,
      fontWeight: 'bold',
    },

    // ---- Survey Content ----
    surveyContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 450,
        alignItems: 'center',
    },
    progressHeader: {
        width: '100%',
        marginBottom: 16,
    },
    progressText: {
        color: personalitySurveyTheme.tabBarInactive,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: personalitySurveyTheme.primary,
        borderRadius: 4,
    },

    // ---- Question Card ----
    // Inspired by onboardingStyles.curatorCard
    questionCard: {
      width: '100%',
      backgroundColor: personalitySurveyTheme.card,
      borderRadius: 16,
      padding: 25,
      borderWidth: 1,
      borderColor: personalitySurveyTheme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 24,
      marginTop: 24,
    },
    questionText: {
      fontSize: 18,
      fontWeight: '600',
      color: personalitySurveyTheme.text,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 20,
    },

    // ---- Option Buttons ----
    optionButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: personalitySurveyTheme.border,
      borderRadius: 12,
      padding: 15,
      width: '100%',
      marginVertical: 6,
      alignItems: 'center',
    },
    optionButtonSelected: {
      // Inspired by personalityStyles.tabButtonActive
      backgroundColor:  `${personalitySurveyTheme.primary}20`,
      borderColor:  personalitySurveyTheme.primary,
      shadowColor: personalitySurveyTheme.primary,
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    optionText: {
      color: personalitySurveyTheme.text,
      fontSize: 16,
      fontWeight: '500',
    },
    optionTextSelected: {
      color:  personalitySurveyTheme.primary,
      fontWeight: '700',
    },

    // ---- Navigation ----
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 16,
    },
    skipButtonText: {
        color: personalitySurveyTheme.tabBarInactive,
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    nextButton: {
        // Similar to modalButton
        backgroundColor: personalitySurveyTheme.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 35,
        shadowColor: personalitySurveyTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },

    // ---- Debug / Trait Indicator Card ----
    // Inspired by onboardingStyles.curatorNote
    traitIndicatorCard: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: personalitySurveyTheme.primary,
    },
    traitIndicatorTitle: {
        color: personalitySurveyTheme.tabBarInactive,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    traitIndicatorValue: {
        color:  personalitySurveyTheme.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    allScoresContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 8,
    },
    scoreText: {
        fontSize: 12,
        color: personalitySurveyTheme.text,
    },
    primaryScoreText: {
        color: personalitySurveyTheme.primary,
        fontWeight: 'bold',
    },

    // ---- Basic styles that the component expects ----
    text: {
      color: personalitySurveyTheme.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: personalitySurveyTheme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: personalitySurveyTheme.curatorCard,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: personalitySurveyTheme.curatorCardBorder,
      shadowColor: personalitySurveyTheme.curatorCardShadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      color: personalitySurveyTheme.gameTitle,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
      textShadowColor: personalitySurveyTheme.gameTitleShadow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: personalitySurveyTheme.text,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 16,
    },
    // Add the theme colors as style properties for easy access
    primary: personalitySurveyTheme.primary,
    tabBarInactive: personalitySurveyTheme.tabBarInactive,
    border: personalitySurveyTheme.curatorCardBorder,
    notification: '#ef4444', // Red color for errors
  };
};

// Helper function for Character Home Screen styles
export const characterHomeScreenStyles = (characterHomeScreenTheme: ThemeColors): {[key: string]: any} => {
  return{
   archiveContainer: {
      flex: 1,
      backgroundColor: characterHomeScreenTheme.archiveBackground,
    },
    archivepassages: {
      flex: 1,
      paddingTop: 10,
    },

    archiveTabpassagesArea: {
      paddingBottom: 16,
    },
  archiveTabContainer: {
      width: '96%',
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      marginBottom: 8,
      marginLeft: 8,
      backgroundColor: 'transparent',
    },
    archiveTabGradient: {
      width: '100%',
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'transparent',
     // borderColor: '#8d7527ff',
      borderWidth: 2,
    },
    archiveTabpassages: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: 'transparent',
    },
    archiveTabScrollpassages: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      gap: 4,
    },
    archiveTabpassagesContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingTop: 0,
      paddingBottom: 0,
    },
    tabpassagesArea: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: 'transparent',
    },
    avatarShowcaseHeader: {
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 12,
      backgroundColor: 'transparent',
    }, 
    archiveHeader: {
      padding: 10,
      paddingTop: 10, // Further reduced space for status bar
      backgroundColor: 'transparent',
      borderBottomWidth: 2,
      borderBottomColor: characterHomeScreenTheme.archiveBorder,
    },
    archiveHeaderGradient: {
      width: '95%',
      paddingVertical: 2,
      paddingHorizontal: 2,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      marginLeft: 8,
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderColor: '#8d7527ff',
      borderWidth: 2,
    },
    archiveHeaderpassages: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      backgroundColor: 'transparent',
    },
    archiveHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 16,
    },
    archiveHeaderIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      position: 'relative',
      overflow: 'hidden',
    },
    archiveHeaderIconOverlay: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: 'rgba(255, 224, 102, 0.8)',
      borderRadius: 8,
      padding: 2,
      zIndex: 2,
    },
    archiveHeaderTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 2,
    },
    archiveHeaderTitle: {
      color: '#4ee6e6',
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: 4,
      textShadowColor: 'rgba(78, 230, 230, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    archiveHeaderSubtitle: {
      color: '#d4af37',
      fontSize: 16,
      fontStyle: 'italic',
      marginBottom: 4,
    },
    archiveStatusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      gap: 6,
    },
    archiveStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
      backgroundColor: '#4ee6e6',
    },
    archiveStatusText: {
      color: '#365f5fff',
      fontSize: 12,
      fontStyle: 'italic',
      opacity: 0.8,
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
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center',
      marginLeft: 4,
    },
    tabTextActive: {
      fontWeight: '700',
      textShadowColor: characterHomeScreenTheme.tabTextShadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    tabTextInactive: {
      fontWeight: 'bold',
      textShadowColor: 'transparent',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    archiveTitle: {
      fontFamily: FONT_FAMILY_TITLE,
      fontSize: 28,
      fontWeight: 'bold',
      color: characterHomeScreenTheme.archiveAccent,
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
    
    // Character Display Styles
    centralCharacterDisplay: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingHorizontal: 0,
      flex: 0,
      minWidth: 0,
      maxWidth: width < 768 ? 220 : 220,
    },
    characterDisplaySection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      paddingHorizontal: 0,
      maxWidth: "100%",
      overflow: 'visible',
      minHeight: width * 0.5,
      position: 'relative',
      flex: 1,
    },
    characterFrame: {
      width: Math.min(width * 0.35, 200),
      height: Math.min(width * 0.35, 200),
      borderRadius: width < 768 ? 16 : 18,
      padding: 2,
      marginBottom: width < 768 ? 8 : 10,
      maxWidth: 200,
      minWidth: 150,
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
    characterMoodBubble: {
      position: 'absolute',
      bottom: -25,
      left: '50%',
      transform: [{ translateX: 10 }],
      width: 120,
      borderRadius: 20,
      overflow: 'hidden',
    },
    moodBubbleGradient: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 2,
      borderColor: '#D97706',
    },
    moodBubbleText: {
      color: '#92400E',
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    
    // Character Info Styles
    characterInfoBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(217, 119, 6, 0.2)',
    },
    characterDetails: {
      alignItems: 'flex-start',
    },
    characterRarity: {
      color: '#4ee6e6',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    characterClass: {
      color: '#d4af37',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 2,
    },
    characterName: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'right',
      textShadowColor: 'rgba(78, 230, 230, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    
    // Experience Progress Styles
    experienceProgressContainer: {
      marginBottom: 8,
      borderRadius: 8,
      overflow: 'hidden',
      marginHorizontal: 10,
    },
    experienceProgressGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    experienceProgressText: {
      color: '#0a0b0f',
      fontSize: 12,
      fontWeight: '600',
    //  marginLeft: 6,
    },
    
    // Gear Slot Styles
    gearColumn: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      gap: width < 768 ? 12 : 16,
      width: width < 768 ? 60 : 70,
      height: width < 768 ? 120 : 140,
      top: '50%',
      transform: [{ translateY: -40 }],
    },
    gearColumnLeft: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      gap: width < 768 ? 12 : 16,
      width: width < 768 ? 60 : 70,
      height: width < 768 ? 120 : 140,
      left: width < 768 ? 40 : 60,
      top: '50%',
      transform: [{ translateY: -80 }],
    },
    gearColumnRight: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      gap: width < 768 ? 2 : 4,
      width: width < 768 ? 60 : 70,
      height: width < 768 ? 120 : 140,
      right: width < 768 ? 40 : 60,
      top: '50%',
      transform: [{ translateY: -80 }],
    },
    gearSlot: {
      width: '100%',
      height: width < 768 ? 50 : 55,
      borderRadius: 8,
      overflow: 'hidden',
    },
    gearSlotGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    emptyGearSlot: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '80%',
      height: '80%',
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
    gearSlotLockedText: {
      color: '#6B7280',
      fontSize: 8,
      textAlign: 'center',
      fontWeight: '500',
      marginTop: 2,
    },
    
    // Foundation Styles
    foundationsSection: {
      marginTop: 20,
      borderRadius: 16,
      overflow: 'hidden',
    },
    foundationsSectionGradient: {
      padding: 20,
      borderWidth: 2,
      borderColor: '#d4af37',
    },
    foundationsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    foundationsTitle: {
      color: '#4ee6e6',
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 10,
      textAlign: 'center',
    },
    foundationsSubtitle: {
      fontSize: 14,
      color: '#d4af37',
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
    foundationValueContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    foundationValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#4ee6e6',
      marginBottom: 2,
    },
    foundationMaxValue: {
      fontSize: 14,
      color: '#d4af37',
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
    foundationLabel: {
      fontSize: 12,
      color: '#4ee6e6',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 4,
    },
    foundationDescription: {
      fontSize: 10,
      color: '#9CA3AF',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    xpToNext: {
      fontSize: 9,
      color: '#FCD34D',
      textAlign: 'center',
      fontWeight: '500',
    },
    
    // Button Styles  
    restartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.4)',
      flex: 1,
      marginRight: 4,
    },
    restartButtonText: {
      color: '#EF4444',
      fontSize: 12,
      fontWeight: '600',
    },
    debugButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(168, 85, 247, 0.4)',
      flex: 1,
      marginLeft: 4,
    },
    debugButtonText: {
      color: '#A855F7',
      fontSize: 12,
      fontWeight: '600',
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

// Helper function for base/common styles
export const getBaseStyles = (theme: ThemeColors): {[key: string]: any} => {
  return {
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    button: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
    },

    buttonText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 16,
    },

    input: {
      backgroundColor: theme.archiveCard,
      color: theme.text,
      padding: 12,
      borderRadius: 8,
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

    // Navigation
    tabBar: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      height: 60,
    },

    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    },

    tabIcon: {
      fontSize: 24,
      marginBottom: 4,
    },

    tabLabel: {
      fontSize: 12,
      color: theme.text,
    },

    activeTabIcon: {
      color: theme.primary,
    },

    activeTabLabel: {
      color: theme.primary,
      fontWeight: 'bold',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },

    modalContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: theme.border,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },

    modalText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 22,
      marginBottom: 20,
      textAlign: 'center',
    },

    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 16,
    },

    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },

    modalButtonPrimary: {
      backgroundColor: theme.primary,
    },

    modalButtonSecondary: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },

    modalButtonText: {
      fontWeight: 'bold',
      fontSize: 14,
    },

    modalButtonTextPrimary: {
      color: theme.text,
    },

    modalButtonTextSecondary: {
      color: theme.text,
    },

    // Loading states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.archiveBackground,
    },

    loadingText: {
      color: theme.text,
      fontSize: 16,
      marginTop: 16,
    },

    // Error states
    errorContainer: {
      backgroundColor: theme.notification,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#ff4444',
    },

    errorText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },

    // Success states
    successContainer: {
      backgroundColor: '#4CAF50',
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
    },

    successText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },

    // Character creation
    creationContainer: {
      flex: 1,
      backgroundColor: theme.archiveBackground,
      padding: 16,
    },

    creationSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    creationSectionTitle: {
      color: theme.archiveAccent,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },

    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },

    optionItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 60,
      minHeight: 60,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    optionItemSelected: {
      backgroundColor: 'rgba(78, 230, 230, 0.2)',
      borderColor: theme.archiveAccent,
    },

    optionItemText: {
      color: theme.archiveText,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 4,
    },

    optionItemTextSelected: {
      color: theme.archiveAccent,
    },

    // Preview
    previewContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 16,
      padding: 20,
      marginVertical: 16,
    },

    previewFrame: {
      width: 160,
      height: 200,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.archiveBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },

    previewPlaceholder: {
      color: theme.archiveText,
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },

    // Character display
    characterCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginVertical: 12,
      borderWidth: 2,
      borderColor: theme.archiveBorder,
      shadowColor: theme.archiveAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },

    characterName: {
      color: theme.archiveAccent,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },

    characterClass: {
      color: theme.archiveText,
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 16,
    },

    characterLevel: {
      color: theme.archiveAccentSecondary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },

    characterStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
    },

    characterStat: {
      alignItems: 'center',
    },

    characterStatValue: {
      color: theme.archiveAccent,
      fontSize: 20,
      fontWeight: 'bold',
    },

    characterStatLabel: {
      color: theme.archiveText,
      fontSize: 12,
      marginTop: 4,
    },

    // Equipment
    equipmentSlot: {
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 4,
    },

    equipmentSlotEmpty: {
      backgroundColor: theme.archiveCard,
      borderStyle: 'dashed',
    },

    equipmentSlotEquipped: {
      backgroundColor: theme.archiveCard,
      borderColor: theme.archiveAccent,
    },

    equipmentIcon: {
      fontSize: 20,
      color: theme.text,
    },

    equipmentIconEquipped: {
      color: theme.archiveAccent,
    },

    // Story cards
    storyCard: {
      backgroundColor: theme.archiveCard,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
    },

    storyTitle: {
      color: theme.archiveAccent,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },

    storyDescription: {
      color: theme.archiveText,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },

    storyMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    storyDifficulty: {
      color: theme.archiveAccentSecondary,
      fontSize: 12,
      fontWeight: '600',
    },

    storyType: {
      backgroundColor: theme.archiveAccent,
      color: theme.archiveBackground,
      fontSize: 10,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },

    // Archive entries
    archiveEntry: {
      backgroundColor: theme.archiveCard,
      borderRadius: 8,
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: theme.archiveBorder,
      flexDirection: 'row',
      alignItems: 'center',
    },

    archiveEntryIcon: {
      fontSize: 16,
      color: theme.archiveAccent,
      marginRight: 12,
      width: 20,
      textAlign: 'center',
    },

    archiveEntryText: {
      flex: 1,
      color: theme.archiveText,
      fontSize: 14,
    },

    archiveEntryTimestamp: {
      color: theme.archiveSubtext,
      fontSize: 10,
      fontStyle: 'italic',
    },

    // Floating action button
    floatingButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },

    floatingButtonIcon: {
      fontSize: 24,
      color: theme.text,
    },

    // Utility classes for quick styling
    flex1: { flex: 1 },
    flex0: { flex: 0 },
    flexGrow: { flexGrow: 1 },
    flexShrink: { flexShrink: 1 },
    row: { flexDirection: 'row' },
    column: { flexDirection: 'column' },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    spaceBetween: { justifyContent: 'space-between' },
    spaceAround: { justifyContent: 'space-around' },
    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },
    fontBold: { fontWeight: 'bold' },
    fontNormal: { fontWeight: 'normal' },
    fontLight: { fontWeight: '300' },
    absolute: { position: 'absolute' },
    relative: { position: 'relative' },
    fullWidth: { width: '100%' },
    fullHeight: { height: '100%' },
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    
    // Common spacing
    marginSmall: { margin: 8 },
    marginMedium: { margin: 16 },
    marginLarge: { margin: 24 },
    paddingSmall: { padding: 8 },
    paddingMedium: { padding: 16 },
    paddingLarge: { padding: 24 },
    
    // Common shadows
    shadowSmall: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    shadowMedium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    shadowLarge: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
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
  };
};

// Helper function for Archive-specific styles
export const getArchiveStyles = (theme: ThemeColors): {[key: string]: any} => {
  return {
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
      paddingBottom: 16,
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
  };
};

// Helper function for Story/Story Screen styles
export const getStoryStyles = (theme: ThemeColors): {[key: string]: any} => {
  return {
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
      ...glowingText(theme),
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
  };
};

export const createGlobalStyles = (theme: ThemeColors): { [key: string]: any } => {
  // Combine all the organized style functions
  const baseStyles = getBaseStyles(theme);
  const archiveStyles = getArchiveStyles(theme);
  const storyStyles = getStoryStyles(theme);
  
  return StyleSheet.create({
    // Include all organized styles from modular functions
    ...baseStyles,
    ...archiveStyles, 
    ...storyStyles,

    // ===== ESSENTIAL STYLES STILL IN USE =====
    // These styles are kept here because they're actively used throughout the app
    // and haven't yet been migrated to the modular system
    
    // Modal styles - heavily used throughout the app
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

    // Input styles - used in forms
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      color: theme.text,
      marginVertical: 8,
    },

    // Primary button - used throughout app
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

    // Background layer - used in layouts
    backgroundLayer: {
      zIndex: -1,
    },

    // ===== STORY SYSTEM STYLES =====
    // These are heavily used in Story screens and components
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
      minHeight: 200, 
      maxHeight: 250, 
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