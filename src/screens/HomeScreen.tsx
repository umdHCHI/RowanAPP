import { useOnboarding } from "../context/OnboardingContext";
import { useTheme } from "../context/ThemeContext";
import CharacterHomeScreen from "./CharacterHomeScreen";
import PersonalityHomeScreen from "./PersonalityHomeScreen";
import WelcomeScreen from "./WelcomeScreen";

export default function HomeScreen() {
  const { styles } = useTheme();
  const { onboardingState } = useOnboarding();

  // Debug information
  console.log('Current onboarding state:', onboardingState);

  // If neither onboarding path is completed, show welcome screen
  if (!onboardingState.hasCompletedSurvey && !onboardingState.hasCompletedCharacter) {
    return <WelcomeScreen />;
  }

  // If survey is completed, show personality home
  if (onboardingState.hasCompletedSurvey) {
    return <PersonalityHomeScreen />;
  }

  // If character is completed, show character home
  if (onboardingState.hasCompletedCharacter) {
    return <CharacterHomeScreen />;
  }

  return null;
} 