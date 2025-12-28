import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

// Custom theme inspired by the library aesthetic - warm, atmospheric
export const archiveTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors - warm amber/parchment from candlelight
    primary: '#D4A574',
    primaryContainer: 'rgba(212, 165, 116, 0.2)',
    onPrimary: '#000000',
    onPrimaryContainer: '#F5E6D3',
    
    // Secondary colors - subtle teal from library atmosphere
    secondary: '#A8967A',
    secondaryContainer: 'rgba(168, 150, 122, 0.2)',
    onSecondary: '#000000',
    onSecondaryContainer: '#E8D5B7',
    
    // Background - dark with library feel
    background: '#000000',
    surface: 'rgba(0, 0, 0, 0.6)',
    surfaceVariant: 'rgba(0, 0, 0, 0.4)',
    onBackground: '#F5E6D3',
    onSurface: '#F5E6D3',
    onSurfaceVariant: '#D4C5A9',
    
    // Borders and outlines
    outline: 'rgba(232, 213, 183, 0.2)',
    outlineVariant: 'rgba(232, 213, 183, 0.1)',
    
    // Error and warning
    error: '#C8A082',
    errorContainer: 'rgba(200, 160, 130, 0.2)',
    onError: '#FFFFFF',
    onErrorContainer: '#C8A082',
    
    // Elevation/shadows
    elevation: {
      level0: 'rgba(0, 0, 0, 0)',
      level1: 'rgba(0, 0, 0, 0.05)',
      level2: 'rgba(0, 0, 0, 0.08)',
      level3: 'rgba(0, 0, 0, 0.11)',
      level4: 'rgba(0, 0, 0, 0.12)',
      level5: 'rgba(0, 0, 0, 0.14)',
    },
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    // Body text: Crimson Pro Medium 500 Italic
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontFamily: 'CrimsonPro-Medium-Italic',
      fontWeight: '500' as const,
      fontStyle: 'italic' as const,
    },
    bodyMedium: {
      ...MD3DarkTheme.fonts.bodyMedium,
      fontFamily: 'CrimsonPro-Medium-Italic',
      fontWeight: '500' as const,
      fontStyle: 'italic' as const,
    },
    bodySmall: {
      ...MD3DarkTheme.fonts.bodySmall,
      fontFamily: 'CrimsonPro-Medium-Italic',
      fontWeight: '500' as const,
      fontStyle: 'italic' as const,
    },
    // UI elements: Quicksand SemiBold 600
    labelLarge: {
      ...MD3DarkTheme.fonts.labelLarge,
      fontFamily: 'Quicksand-SemiBold',
      fontWeight: '600' as const,
    },
    labelMedium: {
      ...MD3DarkTheme.fonts.labelMedium,
      fontFamily: 'Quicksand-SemiBold',
      fontWeight: '600' as const,
    },
    labelSmall: {
      ...MD3DarkTheme.fonts.labelSmall,
      fontFamily: 'Quicksand-SemiBold',
      fontWeight: '600' as const,
    },
    // Button labels use Quicksand
    titleSmall: {
      ...MD3DarkTheme.fonts.titleSmall,
      fontFamily: 'Quicksand-SemiBold',
      fontWeight: '600' as const,
    },
  },
  roundness: 12, // Softer, more organic corners
}

