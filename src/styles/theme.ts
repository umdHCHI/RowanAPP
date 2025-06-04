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
};

// Light Theme
export const lightTheme: ThemeColors = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  border: '#C6C6C8',
  notification: '#FF3B30',
  tabBar: '#FFFFFF',
  tabBarInactive: '#8E8E93',
};

// Dark Theme
export const darkTheme: ThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A',
  tabBar: '#25292e',
  tabBarInactive: '#8E8E93',
};

export const getTheme = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}; 