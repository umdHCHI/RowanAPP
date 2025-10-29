// Re-export all screen-specific styles for easy access
export * from './characterCreator';
export * from './characterHome';
export * from './login';
export * from './onboarding';
export * from './personalitySurvey';

// Screen style types
export type { CharacterCreatorStyles } from './characterCreator';
export type { CharacterHomeStyles } from './characterHome';
export type { LoginStyles } from './login';
export type { OnboardingStyles } from './onboarding';
export type { PersonalitySurveyStyles } from './personalitySurvey';

// You can add more screens as they are refactored:
// export * from './personalityTest';
// export * from './personality';
// etc.
