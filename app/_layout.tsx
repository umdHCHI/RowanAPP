import { AuthProvider } from '../src/context/AuthContext';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import TabNavigator from '../src/navigation/TabNavigator';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <TabNavigator />
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
