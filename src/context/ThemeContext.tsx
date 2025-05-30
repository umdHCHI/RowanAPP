import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { createGlobalStyles } from '../styles/globalStyles';
import { ThemeColors, getTheme } from '../styles/theme';

type ThemeContextType = {
  theme: ThemeColors;
  styles: ReturnType<typeof createGlobalStyles>;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  const theme = getTheme(isDark ? 'dark' : 'light');
  const styles = createGlobalStyles(theme);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, styles, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 