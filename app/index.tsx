import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const { authToken } = useAuth();

  // If not authenticated, redirect to login
  if (!authToken) {
    return <Redirect href="/login" />;
  }

  // If authenticated, show home screen
  return <HomeScreen />;
}