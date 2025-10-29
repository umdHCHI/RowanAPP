/**
 * Main styles entry point - The Archive RPG
 * 
 * This file provides a structured, modular approach to styling that follows
 * industry best practices. All styles are organized by:
 * 
 * - Foundation: Constants, effects, and utilities
 * - Components: Reusable UI component styles  
 * - Screens: Screen-specific styles
 * - Base: Common patterns and base styles
 */

// Foundation exports
export * from './foundation';

// Component exports
export * from './components';

// Screen exports  
export * from './screens';

// Base exports
export * from './base';

// Theme exports
export * from './theme';

// Main style creation functions
import { createBaseStyles } from './base';
import {
  createBadgeStyles,
  createButtonStyles,
  createCardStyles,
  createFormStyles,
  createInteractiveStyles,
  createLayoutStyles,
  createProgressStyles,
  createTextStyles,
} from './components';
import { createCharacterCreatorStyles, createCharacterHomeStyles, createLoginStyles, createOnboardingStyles, createPersonalitySurveyStyles } from './screens';
import { ThemeColors } from './theme';

/**
 * Creates all standardized component styles
 */
export const createStandardizedStyles = (theme: ThemeColors) => ({
  buttons: createButtonStyles(theme),
  cards: createCardStyles(theme),
  text: createTextStyles(theme),
  progress: createProgressStyles(theme),
  badges: createBadgeStyles(theme),
  layout: createLayoutStyles(theme),
  interactive: createInteractiveStyles(theme),
  forms: createFormStyles(theme),
});

/**
 * Creates all screen-specific styles
 */
export const createScreenStyles = (theme: ThemeColors) => ({
  login: createLoginStyles(theme),
  onboarding: createOnboardingStyles(theme),
  characterCreator: createCharacterCreatorStyles(theme),
  characterHome: createCharacterHomeStyles(theme),
  personalitySurvey: createPersonalitySurveyStyles(theme),
  // Add more screens as they are refactored:
  // personalityTest: createPersonalityTestStyles(theme),
  // etc.
});

/**
 * Main style creation function - creates all styles for the app
 */
export const createGlobalStyles = (theme: ThemeColors) => {
  const base = createBaseStyles(theme);
  const standardized = createStandardizedStyles(theme);
  const screens = createScreenStyles(theme);

  return {
    base,
    std: standardized,
    screens,
  };
};

/**
 * Complete styles object with all styles for the app
 * This is the main export that replaces the old globalStyles pattern
 */
export const createCompleteStyles = (theme: ThemeColors) => {
  const globalStyles = createGlobalStyles(theme);
  
  return {
    ...globalStyles.base,
    std: globalStyles.std,
    screens: globalStyles.screens,
  };
};

// Type exports
export type StandardizedStyles = ReturnType<typeof createStandardizedStyles>;
export type ScreenStyles = ReturnType<typeof createScreenStyles>;
export type GlobalStyles = ReturnType<typeof createGlobalStyles>;
export type CompleteStyles = ReturnType<typeof createCompleteStyles>;

// Legacy compatibility exports (to be removed after migration)
export { getOnboardingStyles, loginStyles } from './globalStyles';
// Add other legacy exports as needed during migration
