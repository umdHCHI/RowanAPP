import { useAuth } from "../context/AuthContext";
import { useOnboarding } from "../context/OnboardingContext";
import { useTheme } from "../context/ThemeContext";
import CharacterCreatorScreen from "./CharacterCreatorScreen";
import CharacterHomeScreen from "./characterStory/CharacterHomeScreen";
import PersonalityHomeScreen from "./personalityStory/PersonalityHomeScreen";
import PersonalitySurveyScreen from "./PersonalitySurveyScreen";
import WelcomeScreen from "./WelcomeScreen";

export default function HomeScreen() {
  const { styles } = useTheme();
  const { onboardingState } = useOnboarding();
  const { isTestUser } = useAuth();

  // Debug information
  console.log('Current onboarding state:', onboardingState);
  console.log('Is test user:', isTestUser);

  // For test user, always show the welcome screen
  if (isTestUser) {
    return <WelcomeScreen />;
  }

  // For regular users, follow their assigned research group
  if (onboardingState.isComplete) {
    if (onboardingState.researchGroup === 'A') {
      return <CharacterHomeScreen />;
    } else {
      return <PersonalityHomeScreen />;
    }
  }

  // If onboarding is not complete, show the appropriate screen based on research group
  if (onboardingState.researchGroup === 'A') {
    return <CharacterCreatorScreen />;
  } else {
    return <PersonalitySurveyScreen />;
  }
} 