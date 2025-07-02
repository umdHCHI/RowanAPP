import { Redirect } from 'expo-router';
import { useMasterState } from '../src/imports';

export default function Index() {
  const { auth, onboarding } = useMasterState();

  console.log('=== INDEX ROUTING DEBUG ===');
  console.log('Auth token:', auth.authToken ? 'Present' : 'Missing');
  console.log('Onboarding state:', {
    isComplete: onboarding.isComplete,
    assignedPath: onboarding.assignedPath,
    researchGroup: onboarding.researchGroup
  });
  console.log('Onboarding isComplete:', onboarding.isComplete);
  console.log('Assigned path:', onboarding.assignedPath);
  console.log('Research group:', onboarding.researchGroup);

  // If not authenticated, redirect to login
  if (!auth.authToken) {
    console.log('Redirecting to login - no auth token');
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  if (!onboarding.isComplete) {
    console.log('Onboarding not complete, redirecting to onboarding');
    if (onboarding.assignedPath === 'character') {
      console.log('Redirecting to character creator');
      return <Redirect href="/(onboarding)/character-creator" />;
    } else if (onboarding.assignedPath === 'survey') {
      console.log('Redirecting to personality test');
      return <Redirect href="/(onboarding)/personality-test" />;
    } else {
      console.log('Redirecting to general onboarding');
      return <Redirect href="/(onboarding)/onboarding" />;
    }
  }

  // If authenticated and onboarding complete, redirect to appropriate screen based on research condition
  console.log('Onboarding complete, redirecting to appropriate screen');
  console.log('Current onboarding state:', {
    isComplete: onboarding.isComplete,
    assignedPath: onboarding.assignedPath,
    researchGroup: onboarding.researchGroup
  });
  console.log('Research group:', onboarding.researchGroup);
  console.log('Is test user:', auth.authToken === '8a71299900898a32febbca89ef5638a406475348');
  
  // Route based on research condition
  if (onboarding.researchGroup === 'A') {
    // Character Creator path - Research Condition A
    console.log('Redirecting to CharacterHomeScreen (Research Condition A)');
    return <Redirect href="/(character)/character" />;
  } else if (onboarding.researchGroup === 'B') {
    // Personality Test path - Research Condition B
    console.log('Redirecting to PersonalityHomeScreen (Research Condition B)');
    return <Redirect href="/(personality)/personality" />;
  } else {
    // Fallback - if no research group is set, default to character path
    console.log('No research group set, defaulting to character path');
    return <Redirect href="/(character)/character" />;
  }
}