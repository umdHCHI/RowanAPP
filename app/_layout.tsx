import { OnboardingProvider } from '../src/context/OnboardingContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import TabNavigator from '../src/navigation/TabNavigator';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <TabNavigator />
      </OnboardingProvider>
    </ThemeProvider>
  );
}
