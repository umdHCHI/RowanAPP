import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, useMasterState, View } from '../src/imports';

export default function Index() {
  const { auth, onboarding } = useMasterState();
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('=== INDEX COMPONENT RENDERED ===');
  console.log('Component state:', { isInitialized });

  // Wait for auth context to fully initialize
  useEffect(() => {
    console.log('=== SETTING UP INITIALIZATION TIMER ===');
    const timer = setTimeout(() => {
      console.log('=== INITIALIZATION TIMER COMPLETE ===');
      setIsInitialized(true);
    }, 500); // Give auth context time to load from AsyncStorage
    
    return () => {
      console.log('=== CLEANING UP INITIALIZATION TIMER ===');
      clearTimeout(timer);
    };
  }, []);

  console.log('=== INDEX ROUTING DEBUG ===');
  console.log('Is initialized:', isInitialized);
  console.log('Auth token:', auth.authToken ? 'Present' : 'Missing');
  console.log('Auth token preview:', auth.authToken ? `${auth.authToken.substring(0, 10)}...` : 'null');
  console.log('User data:', auth.user ? `Present (${auth.user.username})` : 'Missing');
  console.log('Onboarding state:', {
    isComplete: onboarding.isComplete,
    assignedPath: onboarding.assignedPath,
    researchGroup: onboarding.researchGroup
  });
  console.log('Onboarding isComplete:', onboarding.isComplete);
  console.log('Assigned path:', onboarding.assignedPath);
  console.log('Research group:', onboarding.researchGroup);

  // Don't make routing decisions until initialized
  if (!isInitialized) {
    console.log('Waiting for initialization...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0b0f' }}>
        <Text style={{ color: '#4ee6e6', fontSize: 16 }}>Initializing...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to login FIRST
  if (!auth.authToken) {
    console.log('Redirecting to login - no auth token');
    return <Redirect href="/(auth)/login" />;
  }

  // TEMPORARY: Force login screen for testing (remove this when ready for production)
  // Uncomment the line below to force login screen
  console.log('=== FORCING LOGIN SCREEN FOR TESTING ===');
  return <Redirect href="/(auth)/login" />;

  // If authenticated but onboarding is not complete, redirect to onboarding
  if (!onboarding.isComplete) {
    console.log('Redirecting to onboarding - onboarding not complete');
    return <Redirect href="/(onboarding)/onboarding" />;
  }

  // If authenticated and onboarding is complete, redirect based on assigned path
  if (onboarding.assignedPath === 'character') {
    console.log('Redirecting to character path');
    return <Redirect href="/(character)/character" />;
  } else if (onboarding.assignedPath === 'survey') {
    console.log('Redirecting to personality path');
    return <Redirect href="/(personality)/personality" />;
  } else {
    // Fallback - should not happen if onboarding is complete
    console.log('Fallback redirect to onboarding');
    return <Redirect href="/(onboarding)/onboarding" />;
  }
}