import { ColorSchemeName } from 'react-native';

export type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  tabBar: string;
  tabBarInactive: string;
  
  // Character Creator & Archive specific colors
  archiveBackground: string;
  archiveCard: string;
  archiveBorder: string;
  archiveText: string;
  archiveSubtext: string;
  archiveAccent: string;
  archiveAccentSecondary: string;
  archiveGradientStart: string;
  archiveGradientEnd: string;
  archiveGradientMiddle: string;
  archiveMode: 'light' | 'dark';
  
  // Foundation colors
  foundationSight: string;
  foundationWill: string;
  foundationHeart: string;
  foundationHarmony: string;
  
  // Status colors
  statusSuccess: string;
  statusWarning: string;
  statusError: string;
  statusInfo: string;
  
  // Rarity colors
  rarityCommon: string;
  rarityRare: string;
  rarityEpic: string;
  rarityLegendary: string;
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
};

// Your original light theme
export const lightTheme: ThemeColors = {
  primary: '#7C3AED',
  background: '#0F172A',
  card: '#1E1B4B',
  text: '#FEF3C7',
  border: '#92400E',
  notification: '#DC2626',
  tabBar: '#1E1B4B',
  tabBarInactive: '#475569',
  archiveBackground: '#0F172A',
  archiveCard: '#1E1B4B',
  archiveBorder: '#92400E',
  archiveText: '#FEF3C7',
  archiveSubtext: '#FDE68A',
  archiveAccent: '#FCD34D',
  archiveAccentSecondary: '#F59E0B',
  archiveGradientStart: '#0F172A',
  archiveGradientEnd: '#1E1B4B',
  archiveGradientMiddle: '#92400E',
  archiveMode: 'light',
  foundationSight: '#3B82F6',
  foundationWill: '#059669',
  foundationHeart: '#DC2626',
  foundationHarmony: '#D97706',
  statusSuccess: '#059669',
  statusWarning: '#D97706',
  statusError: '#DC2626',
  statusInfo: '#3B82F6',
  rarityCommon: '#6B7280',
  rarityRare: '#3B82F6',
  rarityEpic: '#A855F7',
  rarityLegendary: '#F97316',
};

// Your original dark theme
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

// Updated getTheme function to prioritize the new Archive theme.
// You can change the logic here to switch between themes as needed.
export const getTheme = (colorScheme: ColorSchemeName): ThemeColors => {
  // Defaulting to the new 'archiveTheme' for the primary game experience.
  return archiveTheme; 
  // Or, if you want to keep the light/dark toggle:
  // return colorScheme === 'dark' ? darkTheme : lightTheme;
};