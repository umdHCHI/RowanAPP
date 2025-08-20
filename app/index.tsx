import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, useMasterState, View } from '../src/imports';

export default function Index() {
  const { auth, onboarding } = useMasterState();
  const [isInitialized, setIsInitialized] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);     
    return () => {
      clearTimeout(timer);
    };
  }, []);



  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0b0f' }}>
        <Text style={{ color: '#4ee6e6', fontSize: 16 }}>Initializing...</Text>
      </View>
    );
  }


  if (!auth.authToken) {
    return <Redirect href="/(auth)/login" />;
  }
  return <Redirect href="/(auth)/login" />;


}