import { ColorSchemeName } from 'react-native';

export type ThemeColors = {
  primary?: string;
  background?: string;
  card?: string;
  text?: string;
  border?: string;
  notification?: string;
  tabBar?: string;
  tabBarInactive?: string;
  
  // Character Creator & Archive specific colors
  archiveBackground?: string;
  archiveCard?: string;
  archiveBorder?: string;
  archiveText?: string;
  archiveSubtext?: string;
  archiveAccent?: string;
  archiveAccentSecondary?: string;
  archiveGradientStart?: string;
  archiveGradientEnd?: string;
  archiveGradientMiddle?: string;
  archiveMode?: 'light' | 'dark';
  
  // Foundation colors
  foundationSight?: string;
  foundationWill?: string;
  foundationHeart?: string;
  foundationHarmony?: string;
  
  // Status colors
  statusSuccess?: string;
  statusWarning?: string;
  statusError?: string;
  statusInfo?: string;
  
  // Rarity colors
  rarityCommon?: string;
  rarityRare?: string;
  rarityEpic?: string;
  rarityLegendary?: string;

  // This should be for something else 
  buttonTextColor?: string;
  modalOverlayBackground?: string;

  // Login specific colors
  placeholderTextColor?: string;
  floatingIconColor?: string;
  gradientOverlayBackground?: string;
  avatarGlow?: string;
  gameTitle?: string;
  gameTitleShadow?: string;
  gameSubtitle?: string;
  personalityClass?: string;
  researchHint?: string;
  curatorCard?: string;
  curatorName?: string;
  curatorTitle?: string;
  curatorText?: string;
  curatorHint?: string;
  loginScrollBackground?: string;
  loginScrollBorder?: string;
  curatorCardBorder?: string;
  curatorCardShadowColor?: string;
  loginScrollTitle?: string;
  loginScrollTitleShadow?: string;
  decorativeLine?: string;
  inputLabel?: string;
  mysticalInputBackground?: string;
  mysticalInputColor?: string;
  mysticalInputBorder?: string;
  mysticalInputShadow?: string;
  errorContainerBackground?: string;
  errorContainerBorder?: string;
  errorContainerText?: string;
  inputContainerBorder?: string;
  inputContainerShadow?: string;
  inputContainerBackground?: string;
  inputContainerText?: string;
  enterButton?: string;
  enterButtonShadow?: string;
  enterButtonText?: string;
  buttonGlow?: string;
  curatorAccess?: string;
  curatorAccessBorder?: string;
  curatorAccessText?: string;
  footerText?: string;
  footerSignature?: string; 

  //Onboarding specific colors
  curatorChoiceText?: string;
  pathsTitle?: string;
  pathsSubtitle?: string;
  pathCardGradient?: string;
  pathAtmosphere?: string;
  pathDescription?: string;
  curatorNote?: string;
  curatorNoteBorder?: string;
  curatorNoteText?: string;
  benefitsList?: string;
  pathButton?: string;
  authErrorContainer?: string;
  authErrorTitle?: string;
  authErrorText?: string;
  authErrorButton?: string;
  authErrorButtonText?: string;
};

// The new theme designed to evoke an "old library" feeling.
export const archiveTheme: ThemeColors = {
  primary: '#8a0303', // Deep burgundy, like a wax seal or ink
  background: '#1a120b', // Dark, warm brown, like old wood shelves
  card: '#3e2723', // Deep leather brown
  text: '#e0dcd3', // Aged parchment off-white
  border: '#6a4f4b', // Muted, dusty brown
  notification: '#c62828', // A classic, deep red for alerts
  tabBar: '#3e2723',
  tabBarInactive: '#a1887f',

  // Archive specific colors using the new palette
  archiveBackground: '#1a120b',
  archiveCard: 'rgba(62, 39, 35, 0.8)', // Leathery brown with some transparency
  archiveBorder: 'rgba(200, 159, 101, 0.4)', // Muted gold/brass border
  archiveText: '#e0dcd3', // Parchment text
  archiveSubtext: '#a1887f', // Lighter, dusty brown for subtitles
  archiveAccent: '#c89f65', // Muted gold/brass for highlights
  archiveAccentSecondary: '#8a0303', // Burgundy for secondary accents
  archiveGradientStart: '#3e2723',
  archiveGradientEnd: '#1a120b',
  archiveGradientMiddle: '#2c1d18',
  archiveMode: 'dark', // This is a dark theme by nature

  // Foundation colors with a more thematic feel
  foundationSight: '#5c6bc0', // Deep indigo for wisdom/sight
  foundationWill: '#26a69a', // Muted teal for willpower
  foundationHeart: '#ec407a', // Rose/magenta for emotion/heart
  foundationHarmony: '#c89f65', // Gold for balance/harmony

  // Status colors
  statusSuccess: '#43a047', // Deep green for success
  statusWarning: '#fb8c00', // Amber for warnings
  statusError: '#c62828', // The notification red
  statusInfo: '#039be5', // A clear, scholarly blue

  // Rarity colors that feel like magical items
  rarityCommon: '#a1887f', // Dusty brown
  rarityRare: '#039be5', // Scholar blue
  rarityEpic: '#6a1b9a', // Rich purple
  rarityLegendary: '#c89f65', // Legendary gold

  //Other colors 
  modalOverlayBackground:"rgba(0,0,0,0.5)",
  buttonTextColor:"#FFFFFF",
};

// Proper light theme with muted purple colors
export const lightTheme: ThemeColors = {
  primary: '#af87d7', // Muted purple for neuroticism
  background: '#e8d5f2', // Muted purple background
  card: '#d4b8e6', // Lighter muted purple cards
  text: '#000000', // Pure black text for maximum contrast
  border: '#c4a0d8', // Purple borders
  notification: '#c62828', // Keep red for alerts
  tabBar: '#d4b8e6', // Muted purple tab bar
  tabBarInactive: '#8d6e63', // Muted brown for inactive tabs
  
  // Archive specific colors for light mode
  archiveBackground: '#e8d5f2', // Muted purple background
  archiveCard: '#d4b8e6', // Lighter muted purple cards
  archiveBorder: '#c4a0d8', // Purple borders
  archiveText: '#000000', // Pure black text for maximum contrast
  archiveSubtext: '#2c1810', // Dark brown for subtitles
  archiveAccent: '#af87d7', // Muted purple for accents
  archiveAccentSecondary: '#c89f65', // Gold for secondary accents
  archiveGradientStart: '#d4b8e6',
  archiveGradientEnd: '#af87d7',
  archiveGradientMiddle: '#d4b8e6',
  archiveMode: 'light',
  
  // Foundation colors for light mode
  foundationSight: '#3f51b5', // Indigo for wisdom
  foundationWill: '#00796b', // Teal for willpower
  foundationHeart: '#c2185b', // Pink for emotion
  foundationHarmony: '#c89f65', // Gold for balance
  
  // Status colors for light mode
  statusSuccess: '#2e7d32', // Dark green for success
  statusWarning: '#f57c00', // Orange for warnings
  statusError: '#c62828', // Red for errors
  statusInfo: '#1976d2', // Blue for info
  
  // Rarity colors for light mode
  rarityCommon: '#6d4c41', // Brown for common
  rarityRare: '#1976d2', // Blue for rare
  rarityEpic: '#7b1fa2', // Purple for epic
  rarityLegendary: '#c89f65', // Gold for legendary
};

// Original dark theme - needs to be updated to match the new palette
export const darkTheme: ThemeColors = {
  primary: '#A855F7',
  background: '#0A0F1C',
  card: '#1A2332',
  text: '#E2E8F0',
  border: '#1E3A8A',
  notification: '#F87171',
  tabBar: '#0F172A',
  tabBarInactive: '#475569',
  archiveBackground: '#0A0F1C',
  archiveCard: '#1A2332',
  archiveBorder: '#1E3A8A',
  archiveText: '#E2E8F0',
  archiveSubtext: '#94A3B8',
  archiveAccent: '#60A5FA',
  archiveAccentSecondary: '#3B82F6',
  archiveGradientStart: '#0A0F1C',
  archiveGradientEnd: '#1E293B',
  archiveGradientMiddle: '#0F172A',
  archiveMode: 'dark',
  foundationSight: '#06B6D4',
  foundationWill: '#10B981',
  foundationHeart: '#F472B6',
  foundationHarmony: '#FCD34D',
  statusSuccess: '#10B981',
  statusWarning: '#FCD34D',
  statusError: '#F87171',
  statusInfo: '#06B6D4',
  rarityCommon: '#9CA3AF',
  rarityRare: '#06B6D4',
  rarityEpic: '#F472B6',
  rarityLegendary: '#FCD34D',
};

// Login theme
export const loginTheme: ThemeColors = {

  //actual used values
  background: '#0a0b0f', 
  floatingIconColor:"#4ee6e6",
  gradientOverlayBackground:'rgba(10, 11, 15, 0.8)',
  avatarGlow:"#4ee6e6",
  gameTitle:"#4ee6e6",
  gameTitleShadow:"rgba(78, 230, 230, 0.5)",
  gameSubtitle:"#d4af37",
  personalityClass:"#ffe066",
  researchHint:"#4ee6e6",
  curatorCard: "rgba(212, 175, 55, 0.15)",
  curatorCardBorder: "#d4af37",
  curatorCardShadowColor: "#d4af37",
  curatorName: "#d4af37",
  curatorTitle: "#ccc",
  curatorText: "#fff",
  curatorHint: '#d4af37',

  loginScrollBackground: "rgba(244, 241, 232, 0.95)",
  loginScrollBorder: "#d4af37",
  loginScrollTitle: '#2c1810',
  decorativeLine: "#d4af37",
  inputLabel: "#5d4037",
  mysticalInputBackground: "rgba(255, 255, 255, 0.9)",
  mysticalInputColor: "#2c1810",
  mysticalInputBorder: "#d4af37",
  mysticalInputShadow: "#d4af37",
  placeholderTextColor: "#8b7355",
  errorContainerBackground: "rgba(239, 68, 68, 0.1)",
  errorContainerBorder: "#ef4444",
  errorContainerText: "#dc2626",
  enterButton: "#4ee6e6",
  enterButtonShadow: "#4ee6e6",
  enterButtonText: "#0a0b0f",
  buttonGlow: "#4ee6e6",
  curatorAccess: "rgba(157, 78, 221, 0.2)",
  curatorAccessBorder: "#9d4edd",
  curatorAccessText: "#9d4edd",
  footerText: "#4ee6e6",
  footerSignature: "#d4af37",


};

//Onboarding theme
export const onboardingTheme: ThemeColors = {
  background: '#0a0b0f',
  floatingIconColor:"#4ee6e6",
  gradientOverlayBackground:'rgba(10, 11, 15, 0.7)',
  avatarGlow:"#4ee6e6",
  gameTitle:"#4ee6e6",
  gameTitleShadow:"rgba(78, 230, 230, 0.6)",
  gameSubtitle:"#d4af37",
  decorativeLine:"#d4af37",

  // Curator colors (matching login theme)
  curatorCard: "rgba(212, 175, 55, 0.15)",
  curatorCardBorder: "#d4af37",
  curatorCardShadowColor: "#d4af37",
  curatorName: "#d4af37",
  curatorTitle: "#ccc",
  curatorText: "#fff",
  curatorHint: '#d4af37',
  
  // Onboarding specific colors
  curatorChoiceText: '#4ee6e6', 
  pathsTitle: '#4ee6e6',
  pathsSubtitle: '#ccc',
  pathCardGradient: 'rgba(30, 30, 40, 0.95)',
  pathAtmosphere: '#ccc',
  pathDescription: '#fff',
  curatorNote: 'rgba(212, 175, 55, 0.1)',
  curatorNoteBorder: '#d4af37',
  curatorNoteText: '#d4af37',
  benefitsList: '#ccc',
  pathButton: '#ffffff',
  footerText: "#4ee6e6",
  footerSignature: "#d4af37",
  authErrorContainer: "#0a0b0f",
  authErrorTitle: "#4ee6e6",
  authErrorText: "#ccc",
  authErrorButton: "#4ee6e6",
  authErrorButtonText: "#0a0b0f",
};

// Updated getTheme function to properly switch between themes
export const getTheme = (colorScheme: ColorSchemeName): ThemeColors => {
  // Use the light/dark toggle functionality
  return colorScheme === 'dark' ? archiveTheme : lightTheme;
};