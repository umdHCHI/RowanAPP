import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { createGlobalStyles } from '../styles/globalStyles';
import { ThemeColors, characterCreatorTheme, characterHomeScreenTheme, darkTheme, lightTheme, loginTheme, onboardingTheme, personalitySurveyTheme } from '../styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  // New theme system
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Backward compatibility
  styles: ReturnType<typeof createGlobalStyles>;
  isDark: boolean;
  loginTheme: ThemeColors;
  onboardingTheme: ThemeColors;
  characterCreatorTheme: ThemeColors;
  characterHomeScreenTheme: ThemeColors;
  personalitySurveyTheme: ThemeColors; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark'); // Default to dark for Archive aesthetic
  
  // Get the appropriate theme based on current mode
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const styles = createGlobalStyles(theme);
  const isDark = themeMode === 'dark';
  
  // Toggle between light and dark modes
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // System theme sync disabled - The Archive always starts in dark mode for aesthetic consistency
  // useEffect(() => {
  //   if (systemColorScheme) {
  //     setThemeMode(systemColorScheme as ThemeMode);
  //   }
  // }, [systemColorScheme]);
  
  const value: ThemeContextType = {
    // New theme system
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    loginTheme,
    onboardingTheme,
    characterCreatorTheme,
    characterHomeScreenTheme,
    personalitySurveyTheme,
    // Backward compatibility
    styles,
    isDark,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 