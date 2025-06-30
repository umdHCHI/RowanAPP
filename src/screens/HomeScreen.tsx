import {
  useAuth,
  useOnboarding,
  useTheme
} from "../imports";
import CharacterHomeScreen from "./characterStory/CharacterHomeScreen";
import CharacterCreatorScreen from "./onboarding/CharacterCreatorScreen";
import PersonalitySurveyScreen from "./onboarding/PersonalitySurveyScreen";
import WelcomeScreen from "./onboarding/WelcomeScreen";
import PersonalityHomeScreen from "./personalityStory/PersonalityHomeScreen";

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