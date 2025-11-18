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

  // Character Home Screen specific colors
  tabTextColor?: string; // Color for tab text
  tabTextSecondColor?: string; // Color for secondary tab text
  tabIsActiveGradient?: string; // Gradient for active tab background
  tabIsActiveSecondaryGradient?: string; // Secondary gradient for active tab background
  tabTextShadowColor?: string; // Shadow color for tab text
  
  // Character display colors
  characterFrameBorder?: string;
  characterFrameShadow?: string;
  characterLevelBadgeText?: string;
  characterMoodBubbleBorder?: string;
  characterMoodBubbleShadow?: string;
  characterMoodBubbleText?: string;
  characterRarityText?: string;
  characterRarityShadow?: string;
  characterClassText?: string;
  characterNameText?: string;
  characterNameShadow?: string;
  experienceProgressBorder?: string;
  experienceProgressShadow?: string;
  experienceProgressText?: string;
  
  // Gear system colors
  gearSlotBorder?: string;
  gearSlotShadow?: string;
  gearSlotLockedText?: string;
  gearSlotGradientStart?: string;
  gearSlotGradientEnd?: string;
  
  // Foundation section colors
  foundationsSectionBorder?: string;
  foundationsSectionShadow?: string;
  foundationsTitleText?: string;
  foundationsTitleShadow?: string;
  foundationsSubtitleText?: string;
  foundationsSubtitleShadow?: string;
  foundationCardBorder?: string;
  foundationCardShadow?: string;
  foundationCardGradientStart?: string;
  foundationCardGradientMiddle?: string;
  foundationCardGradientEnd?: string;
  
  // Story/Chronicle colors
  chronicleCardBorder?: string;
  chronicleCardShadow?: string;
  chronicleGradientStart?: string;
  chronicleGradientMiddle?: string;
  chronicleGradientEnd?: string;
  chronicleButtonGradientStart?: string;
  chronicleButtonGradientMiddle?: string;
  chronicleButtonGradientEnd?: string;
  chronicleButtonShadow?: string;
  chronicleButtonText?: string;
  
  // Button colors
  restartButtonBackground?: string;
  restartButtonBorder?: string;
  restartButtonShadow?: string;
  restartButtonText?: string;
  debugButtonBackground?: string;
  debugButtonBorder?: string;
  debugButtonShadow?: string;
  debugButtonText?: string;
  playButtonBackground?: string;
  playButtonBorder?: string;
  playButtonShadow?: string;
  playButtonText?: string;
  playButtonTextShadow?: string;
  
  // Section container colors
  sectionContainerBackground?: string;
  sectionContainerBorder?: string;
  sectionContainerShadow?: string;
  sectionHeaderBorder?: string;
  
  // Codex specific colors
  codexSectionBackground?: string;
  codexSectionBorder?: string;
  codexSectionShadow?: string;
  codexTitleText?: string;
  codexTitleShadow?: string;
  codexSubtitleText?: string;
  codexSubtitleShadow?: string;
  codexButtonBackground?: string;
  codexButtonBorder?: string;
  codexButtonShadow?: string;
  codexButtonText?: string;
  codexButtonTextShadow?: string;
  codexPromptBackground?: string;
  codexPromptBorder?: string;
  codexPromptShadow?: string;
  codexPromptTitleText?: string;
  codexPromptTitleShadow?: string;
  codexPromptContentText?: string;
  codexPromptContentShadow?: string;
  
  // Mind Defender specific colors
  mindDefenderSectionBackground?: string;
  mindDefenderSectionBorder?: string;
  mindDefenderSectionShadow?: string;
  mindDefenderTitleText?: string;
  mindDefenderTitleShadow?: string;
  mindDefenderSubtitleText?: string;
  mindDefenderSubtitleShadow?: string;
  mindDefenderTipsBackground?: string;
  mindDefenderTipsBorder?: string;
  mindDefenderTipsShadow?: string;
  mindDefenderTipsTitleText?: string;
  mindDefenderTipsTitleShadow?: string;
  mindDefenderTipsContentText?: string;
  mindDefenderTipsContentShadow?: string;
  
  // Progress and stats colors
  explorationBarFillStart?: string;
  explorationBarFillMiddle?: string;
  explorationBarFillEnd?: string;
  categoryBadgeBackground?: string;
  categoryBadgeText?: string;
  difficultyBadgeBackground?: string;
  difficultyBadgeText?: string;
  chronicleStatText?: string;
  explorationLabelText?: string;
  explorationValueText?: string;
  
  // Loading and empty state colors
  loadingIconColor?: string;
  loadingTitleText?: string;
  loadingSubtitleText?: string;
  emptyStateIconColor?: string;
  emptyStateTitleText?: string;
  emptyStateSubtitleText?: string;
  
  // Gradient arrays (instead of individual start/middle/end)
  archiveGradient?: string[];
  characterFrameGradient?: string[];
  gearSlotGradient?: string[];
  foundationCardGradient?: string[];
  chronicleCardGradient?: string[];
  chronicleButtonGradient?: string[];
  levelBadgeGradient?: string[];
  moodBubbleGradient?: string[];
  experienceProgressGradient?: string[];
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

export const characterCreatorTheme: ThemeColors = {
};

export const personalitySurveyTheme: ThemeColors = {
  background: '#0a0b0f',
  gradientOverlayBackground: 'rgba(180, 126, 126, 0.5)',
  primary: 'rgba(56, 139, 211, 0.38)',
  tabBarInactive: '#9CA3AF', // Light gray for unselected option text
  text: '#ffffff', // White text for selected options and other text
  buttonTextColor: '#ffffff',
  modalOverlayBackground: 'rgba(0,0,0,0.5)',
  placeholderTextColor: '#9CA3AF',
  floatingIconColor: '#4ee6e6',
  avatarGlow: '#4ee6e6',
  gameTitle: '#4ee6e6',
  gameTitleShadow: 'rgba(78, 230, 230, 0.5)',
  gameSubtitle: '#d4af37',
  personalityClass: '#ffe066',
  researchHint: '#4ee6e6',
  curatorCard: 'rgba(212, 175, 55, 0.15)',
  curatorCardBorder: '#d4af37',
  curatorCardShadowColor: '#d4af37',
  curatorName: '#d4af37',
  curatorTitle: '#ccc',
  curatorText: '#fff',
  curatorHint: '#d4af37',
};

export const characterHomeScreenTheme: ThemeColors = {
  // Core archive colors
  archiveBackground: '#0a0b0f',
  archiveText: '#ffffff',
  archiveSubtext: '#a1887f', // For story descriptions and secondary text
  archiveBorder: '#8d7527ff',
  archiveAccent: '#c89f65',
  archiveAccentSecondary: '#8a0303', // For secondary accents like stat text
  archiveCard: 'rgba(62, 39, 35, 0.8)', // Card backgrounds
  archiveGradientStart: '#0a0b0f',
  archiveGradientMiddle: '#1e293b',
  archiveGradientEnd: '#0a0b0f',

  // Tab colors
  tabTextColor:  '#4ee6e6',
  tabTextSecondColor: '#9CA3AF', // Dark brown shadow for text
  tabIsActiveGradient: "rgba(78, 230, 230, 0.4)",
  tabIsActiveSecondaryGradient: "rgba(6, 182, 212, 0.4)", // Secondary gradient for active tab background
  tabTextShadowColor: 'rgba(78, 230, 230, 0.5)',
  archiveGradient: ['rgba(10, 11, 15, 0.95)', 'rgba(30, 41, 59, 0.8)', 'rgba(10, 11, 15, 0.95)'],
  
  characterFrameGradient: ['#d4af37', '#8d7527ff'],
  
  gearSlotGradient: ['rgba(10, 11, 15, 0.9)', 'rgba(30, 41, 59, 0.7)'],
  
  foundationCardGradient: ['rgba(10, 11, 15, 0.9)', 'rgba(30, 41, 59, 0.7)', 'rgba(10, 11, 15, 0.9)'],
  
  chronicleCardGradient: ['rgba(10, 11, 15, 0.95)', 'rgba(30, 41, 59, 0.8)', 'rgba(10, 11, 15, 0.95)'],
  
  chronicleButtonGradient: ['rgba(78, 230, 230, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(78, 230, 230, 0.4)'],
  
  levelBadgeGradient: ['#d4af37', '#8d7527ff'],
  
  moodBubbleGradient: ['rgba(212, 175, 55, 0.2)', 'rgba(139, 117, 39, 0.3)'],
  
  experienceProgressGradient: ['#4ee6e6', '#06B6D4'],
  // Character display colors
  characterFrameBorder: '#d4af37',
  characterFrameShadow: '#d4af37',
  characterLevelBadgeText: '#0a0b0f',
  characterMoodBubbleBorder: '#d4af37',
  characterMoodBubbleShadow: '#8b4513',
  characterMoodBubbleText: '#2c1810',
  characterRarityText: '#4ee6e6',
  characterRarityShadow: 'rgba(78, 230, 230, 0.3)',
  characterClassText: '#d4af37',
  characterNameText: '#ffe066',
  characterNameShadow: 'rgba(255, 224, 102, 0.5)',
  experienceProgressBorder: '#4ee6e6',
  experienceProgressShadow: '#4ee6e6',
  experienceProgressText: '#0a0b0f',
  
  // Gear system colors
  gearSlotBorder: '#d4af37',
  gearSlotShadow: '#d4af37',
  gearSlotLockedText: '#6B7280',
  gearSlotGradientStart: 'rgba(10, 11, 15, 0.9)',
  gearSlotGradientEnd: 'rgba(30, 41, 59, 0.7)',
  
  // Foundation section colors
  foundationsSectionBorder: '#d4af37',
  foundationsSectionShadow: '#d4af37',
  foundationsTitleText: '#4ee6e6',
  foundationsTitleShadow: 'rgba(78, 230, 230, 0.5)',
  foundationsSubtitleText: '#d4af37',
  foundationsSubtitleShadow: 'rgba(212, 175, 55, 0.3)',
  foundationCardBorder: '#d4af37',
  foundationCardShadow: '#d4af37',
  foundationCardGradientStart: 'rgba(10, 11, 15, 0.9)',
  foundationCardGradientMiddle: 'rgba(30, 41, 59, 0.7)',
  foundationCardGradientEnd: 'rgba(10, 11, 15, 0.9)',
  
  // Story/Chronicle colors
  chronicleCardBorder: '#d4af37',
  chronicleCardShadow: '#d4af37',
  chronicleGradientStart: 'rgba(10, 11, 15, 0.95)',
  chronicleGradientMiddle: 'rgba(30, 41, 59, 0.8)',
  chronicleGradientEnd: 'rgba(10, 11, 15, 0.95)',
  chronicleButtonGradientStart: 'rgba(78, 230, 230, 0.4)',
  chronicleButtonGradientMiddle: 'rgba(6, 182, 212, 0.4)',
  chronicleButtonGradientEnd: 'rgba(78, 230, 230, 0.4)',
  chronicleButtonShadow: 'rgba(78, 230, 230, 0.2)',
  chronicleButtonText: 'rgba(78, 230, 230, 0.9)',
  
  // Button colors
  restartButtonBackground: 'rgba(78, 230, 230, 0.1)',
  restartButtonBorder: 'rgba(78, 230, 230, 0.4)',
  restartButtonShadow: 'rgba(78, 230, 230, 0.2)',
  restartButtonText: 'rgba(78, 230, 230, 0.7)',
  debugButtonBackground: 'rgba(212, 175, 55, 0.2)',
  debugButtonBorder: '#d4af37',
  debugButtonShadow: '#d4af37',
  debugButtonText: '#d4af37',
  playButtonBackground: '#2a8a8a',
  playButtonBorder: '#2a8a8a',
  playButtonShadow: '#2a8a8a',
  playButtonText: '#ffffff',
  playButtonTextShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Section container colors
  sectionContainerBackground: 'rgba(10, 11, 15, 0.95)',
  sectionContainerBorder: '#d4af37',
  sectionContainerShadow: '#d4af37',
  sectionHeaderBorder: '#d4af37',
  
  // Codex specific colors
  codexSectionBackground: 'rgba(10, 11, 15, 0.95)',
  codexSectionBorder: '#d4af37',
  codexSectionShadow: '#d4af37',
  codexTitleText: 'rgba(78, 230, 230, 0.8)',
  codexTitleShadow: 'rgba(78, 230, 230, 0.3)',
  codexSubtitleText: '#d4af37',
  codexSubtitleShadow: 'rgba(212, 175, 55, 0.3)',
  codexButtonBackground: 'rgba(78, 230, 230, 0.3)',
  codexButtonBorder: 'rgba(78, 230, 230, 0.5)',
  codexButtonShadow: 'rgba(78, 230, 230, 0.2)',
  codexButtonText: 'rgba(78, 230, 230, 0.9)',
  codexButtonTextShadow: 'rgba(78, 230, 230, 0.2)',
  codexPromptBackground: 'rgba(78, 230, 230, 0.1)',
  codexPromptBorder: '#4ee6e6',
  codexPromptShadow: '#4ee6e6',
  codexPromptTitleText: 'rgba(78, 230, 230, 0.7)',
  codexPromptTitleShadow: 'rgba(78, 230, 230, 0.2)',
  codexPromptContentText: '#ffe066',
  codexPromptContentShadow: 'rgba(255, 224, 102, 0.3)',
  
  // Mind Defender specific colors
  mindDefenderSectionBackground: 'rgba(10, 11, 15, 0.95)',
  mindDefenderSectionBorder: '#d4af37',
  mindDefenderSectionShadow: '#d4af37',
  mindDefenderTitleText: 'rgba(78, 230, 230, 0.8)',
  mindDefenderTitleShadow: 'rgba(78, 230, 230, 0.3)',
  mindDefenderSubtitleText: '#d4af37',
  mindDefenderSubtitleShadow: 'rgba(212, 175, 55, 0.3)',
  mindDefenderTipsBackground: 'rgba(10, 11, 15, 0.95)',
  mindDefenderTipsBorder: '#d4af37',
  mindDefenderTipsShadow: '#d4af37',
  mindDefenderTipsTitleText: '#4ee6e6',
  mindDefenderTipsTitleShadow: 'rgba(78, 230, 230, 0.5)',
  mindDefenderTipsContentText: '#d4af37',
  mindDefenderTipsContentShadow: 'rgba(212, 175, 55, 0.3)',
  
  // Progress and stats colors
  explorationBarFillStart: '#06B6D4',
  explorationBarFillMiddle: '#A855F7',
  explorationBarFillEnd: '#4F46E5',
  categoryBadgeBackground: 'rgba(78, 230, 230, 0.2)',
  categoryBadgeText: '#4ee6e6',
  difficultyBadgeBackground: 'rgba(212, 175, 55, 0.2)',
  difficultyBadgeText: '#d4af37',
  chronicleStatText: '#e0dcd3',
  explorationLabelText: '#06B6D4',
  explorationValueText: '#06B6D4',
  
  // Loading and empty state colors
  loadingIconColor: '#A855F7',
  loadingTitleText: '#4ee6e6',
  loadingSubtitleText: '#d4af37',
  emptyStateIconColor: '#A855F7',
  emptyStateTitleText: '#4ee6e6',
  emptyStateSubtitleText: '#d4af37',
};

// Updated getTheme function to properly switch between themes
export const getTheme = (colorScheme: ColorSchemeName): ThemeColors => {
  // Use the light/dark toggle functionality
  return colorScheme === 'dark' ? archiveTheme : lightTheme;
};