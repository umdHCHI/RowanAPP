import { Redirect } from 'expo-router';
import { useAuth, useOnboarding } from '../src/imports';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const { authToken } = useAuth();
  const { onboardingState } = useOnboarding();

  console.log('=== INDEX ROUTING DEBUG ===');
  console.log('Auth token:', authToken ? 'Present' : 'Missing');
  console.log('Onboarding state:', onboardingState);
  console.log('Onboarding isComplete:', onboardingState.isComplete);
  console.log('Assigned path:', onboardingState.assignedPath);

  // If not authenticated, redirect to login
  if (!authToken) {
    console.log('Redirecting to login - no auth token');
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  if (!onboardingState.isComplete) {
    console.log('Onboarding not complete, redirecting to onboarding');
    if (onboardingState.assignedPath === 'character') {
      console.log('Redirecting to character creator');
      return <Redirect href="/(onboarding)/character-creator" />;
    } else if (onboardingState.assignedPath === 'survey') {
      console.log('Redirecting to personality test');
      return <Redirect href="/(onboarding)/personality-test" />;
    } else {
      console.log('Redirecting to general onboarding');
      return <Redirect href="/(onboarding)/onboarding" />;
    }
  }

  // If authenticated and onboarding complete, redirect to appropriate screen
  console.log('Onboarding complete, redirecting to appropriate screen');
  console.log('Current onboarding state:', onboardingState);
  console.log('Is test user:', authToken === '8a71299900898a32febbca89ef5638a406475348');
  
  if (onboardingState.assignedPath === 'character') {
    console.log('Redirecting to character screen');
    return <Redirect href="/(character)/character" />;
  } else if (onboardingState.assignedPath === 'survey') {
    console.log('Redirecting to personality screen');
    return <Redirect href="/(personality)/personality" />;
  } else {
    console.log('No assigned path, showing home screen');
    return <HomeScreen />;
  }
}