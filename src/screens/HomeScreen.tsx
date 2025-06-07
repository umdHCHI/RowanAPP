import { useOnboarding } from "../context/OnboardingContext";
import { useTheme } from "../context/ThemeContext";
import CharacterCreatorScreen from "./CharacterCreatorScreen";
import CharacterHomeScreen from "./CharacterHomeScreen";
import PersonalityHomeScreen from "./PersonalityHomeScreen";
import PersonalitySurveyScreen from "./PersonalitySurveyScreen";
import WelcomeScreen from "./WelcomeScreen";

export default function HomeScreen() {
  const { styles } = useTheme();
  const { onboardingState } = useOnboarding();

  // Debug information
  console.log('Current onboarding state:', onboardingState);

  // If user has completed onboarding, show appropriate home screen
  if (onboardingState.hasCompletedSurvey) {
    return <PersonalityHomeScreen />;
  }

  if (onboardingState.hasCompletedCharacter) {
    return <CharacterHomeScreen />;
  }

  // If user has an assigned path but hasn't completed it, show the appropriate screen
  if (onboardingState.assignedPath) {
    if (onboardingState.assignedPath === 'character') {
      return <CharacterCreatorScreen />;
    } else if (onboardingState.assignedPath === 'survey') {
      return <PersonalitySurveyScreen />;
    }
  }

  // If no path is assigned and onboarding is not completed, show welcome screen
  return <WelcomeScreen />;
} 