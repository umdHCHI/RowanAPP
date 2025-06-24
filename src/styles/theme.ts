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

// Light Theme (the original dark theme you showed me)
export const lightTheme: ThemeColors = {
  primary: '#7C3AED',
  background: '#0F172A',
  card: '#1E1B4B',
  text: '#FEF3C7',
  border: '#92400E',
  notification: '#DC2626',
  tabBar: '#1E1B4B',
  tabBarInactive: '#475569',
  
  // Archive specific colors - Light Mode (original dark theme)
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
  
  // Foundation colors - Light Mode
  foundationSight: '#3B82F6',
  foundationWill: '#059669',
  foundationHeart: '#DC2626',
  foundationHarmony: '#D97706',
  
  // Status colors - Light Mode
  statusSuccess: '#059669',
  statusWarning: '#D97706',
  statusError: '#DC2626',
  statusInfo: '#3B82F6',
  
  // Rarity colors - Light Mode
  rarityCommon: '#6B7280',
  rarityRare: '#3B82F6',
  rarityEpic: '#A855F7',
  rarityLegendary: '#F97316',
};

// Dark Theme (proper dark mode with blue-green-black gradients)
export const darkTheme: ThemeColors = {
  primary: '#A855F7',
  background: '#0A0F1C',
  card: '#1A2332',
  text: '#E2E8F0',
  border: '#1E3A8A',
  notification: '#F87171',
  tabBar: '#0F172A',
  tabBarInactive: '#475569',
  
  // Archive specific colors - Dark Mode
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
  
  // Foundation colors - Dark Mode
  foundationSight: '#06B6D4',
  foundationWill: '#10B981',
  foundationHeart: '#F472B6',
  foundationHarmony: '#FCD34D',
  
  // Status colors - Dark Mode
  statusSuccess: '#10B981',
  statusWarning: '#FCD34D',
  statusError: '#F87171',
  statusInfo: '#06B6D4',
  
  // Rarity colors - Dark Mode
  rarityCommon: '#9CA3AF',
  rarityRare: '#06B6D4',
  rarityEpic: '#F472B6',
  rarityLegendary: '#FCD34D',
};

export const getTheme = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}; 