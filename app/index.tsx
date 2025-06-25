import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useOnboarding } from '../src/context/OnboardingContext';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const { authToken } = useAuth();
  const { onboardingState } = useOnboarding();

  // If not authenticated, redirect to login
  if (!authToken) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  if (!onboardingState.isComplete) {
    if (onboardingState.assignedPath === 'character') {
      return <Redirect href="/(onboarding)/character-creator" />;
    } else if (onboardingState.assignedPath === 'survey') {
      return <Redirect href="/(onboarding)/personality-test" />;
    } else {
      return <Redirect href="/(onboarding)/onboarding" />;
    }
  }

  // If authenticated and onboarding complete, show home screen
  return <HomeScreen />;
}