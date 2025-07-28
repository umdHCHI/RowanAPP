import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { apiService } from '../../imports';
import { loginStyles as loginStylesGlobal } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

// Floating mystical elements for atmosphere
type FloatingElementProps = {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  translateY?: number;
};

const FloatingElement = ({ children, duration = 3000, delay = 0, translateY = 20 }: FloatingElementProps) => {
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  const translateYInterpolated = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -translateY],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY: translateYInterpolated }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Research condition visual themes
const ResearchConditions = {
  A: {
    avatars: ['⚔️', '🛡️', '🏹', '🔮', '⚡'],
    titles: [
      'Warrior Scholar',
      'Guardian Sage',
      'Archer Mystic',
      'Mage Chronicler',
      'Storm Keeper'
    ],
    theme: 'Character Creation Realm',
    description: 'Forge your avatar and customize your path through The Archive'
  },
  B: {
    avatars: ['🔮', '⚖️', '🌟', '🕊️', '🌙'],
    titles: [
      'Sage Explorer',
      'Order Keeper', 
      'Social Catalyst',
      'Peace Weaver',
      'Shadow Walker'
    ],
    theme: 'Personality Discovery Chambers',
    description: 'Discover your true nature through the ancient wisdom of personality'
  }
};

// For demo purposes, cycle between both conditions
const AllAvatars = [...ResearchConditions.A.avatars, ...ResearchConditions.B.avatars];
const AllTitles = [...ResearchConditions.A.titles, ...ResearchConditions.B.titles];
export default function ArchiveLoginScreen() {
  const router = useRouter();
  const { auth, theme, onboarding } = useMasterState();
  const { login } = auth;
  const loginStyles = loginStylesGlobal(theme.loginTheme);
  const { setAssignedPath } = onboarding;
  
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState(0);
  const [showCurator, setShowCurator] = useState(false);

  // Cycle through all research condition types for visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersonality((prev) => (prev + 1) % AllAvatars.length);
    }, 4000);
    
    // Show curator after initial load
    const curatorTimer = setTimeout(() => setShowCurator(true), 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(curatorTimer);
    };
  }, []);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('Starting login process for user:', username);
      
      // 1. Login and get token
      const loginResponse = await apiService.login(username, password);
      const token = loginResponse.token;
      
      console.log('Login successful, token received:', !!token, 'Token length:', token?.length);

      // 2. Store token in context/storage
      await login(token, String(loginResponse.user.id), loginResponse.user);
      
      console.log('Token stored in context, user ID:', loginResponse.user.id);


      // 3. Check user profile and onboarding status
      const userProfile = loginResponse.user;
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = userProfile.profile?.has_completed_onboarding;
      const completionType = userProfile.profile?.completion_type;
      const needsOnboarding = loginResponse.needs_onboarding;
      const onboardingType = loginResponse.onboarding_type;



      
      // Determine if user should go through onboarding
      let shouldRedirectToOnboarding = false;
      let assignedPath: 'character' | 'survey' | null = null;
      
      const isTestUser = userProfile.username === 'admin' || userProfile.profile?.completion_type === 'test';
      
      if (isTestUser) {
        // Test users and admin users should always go through onboarding (for testing)
        shouldRedirectToOnboarding = true;
        assignedPath = null; // Let them choose
      } else if (needsOnboarding) {
        // User needs onboarding based on backend response
        shouldRedirectToOnboarding = true;
        // Use the onboarding_type from backend if available
        if (onboardingType === 'character' || onboardingType === 'survey') {
          assignedPath = onboardingType;
        } else {
          assignedPath = null; // Let them choose
        }
      } else if (!hasCompletedOnboarding) {
        // User hasn't completed onboarding
        shouldRedirectToOnboarding = true;
        assignedPath = null; // Let them choose
      } else if (hasCompletedOnboarding && completionType) {
        // User has completed onboarding with a proper completion type
        shouldRedirectToOnboarding = false;
        assignedPath = completionType as 'character' | 'survey';
      } else {
        // Fallback - user has completed onboarding but no completion type
        shouldRedirectToOnboarding = true;
        assignedPath = null;
      }
      

      
      if (shouldRedirectToOnboarding) {
        // User needs to complete onboarding
        setAssignedPath(assignedPath);
        router.replace('/(onboarding)/onboarding');
      } else {
        // User has completed onboarding with a proper completion type
        setAssignedPath(assignedPath);
        
        // Navigate based on completion type
        if (assignedPath === 'character') {
          router.replace('/(character)/character');
        } else if (assignedPath === 'survey') {
          router.replace('/(personality)/personality');
        } else {
          // This shouldn't happen if we checked properly above
          router.replace('/(onboarding)/onboarding');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Access to The Archive denied. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => { //will need to remove at end of testing
    setIsLoading(true);
    try {
      const response = await apiService.login('admin', 'admin');
      const testUserId = String(response.user.id);
      
      // Mark as test user and ensure they go through onboarding
      await login(response.token, testUserId, response.user);
      
      // Always redirect to onboarding for admin/test users
      router.replace('/(onboarding)/onboarding');
    } catch (err) {
      setError('Curator access denied');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={loginStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={loginStyles.container.backgroundColor} />
      
      {/* Mystical Background */}
      <View style={loginStyles.backgroundContainer}>
        {/* Floating mystical elements */}
        <View style={loginStyles.floatingElements}>
          <FloatingElement delay={0} duration={4000} translateY={15}>
            <Text style={[loginStyles.floatingIcon, { left: 40, top: 60 }]}>📚</Text>
          </FloatingElement>
          <FloatingElement delay={1000} duration={5000} translateY={20}>
            <Text style={[loginStyles.floatingIcon, { right: 40, top: 60 }]}>✨</Text>
          </FloatingElement>
          <FloatingElement delay={2000} duration={3500} translateY={18}>
            <Text style={[loginStyles.floatingIcon, { left: 40, top: 60 }]}>🕯️</Text>
          </FloatingElement>
          <FloatingElement delay={1500} duration={4500} translateY={22}>
            <Text style={[loginStyles.floatingIcon, { right: 40, top: 60 }]}>📖</Text>
          </FloatingElement>
          <FloatingElement delay={3000} duration={3000} translateY={16}>
            <Text style={[loginStyles.floatingIcon, { left: 40, top: 60 }]}>🗝️</Text>
          </FloatingElement>
        </View>

        {/* Gradient Overlay */}
        <View style={loginStyles.gradientOverlay} />
      </View>

      <ScrollView 
        contentContainerStyle={loginStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with cycling research condition avatars */}
        <View style={loginStyles.header}>
          <View style={loginStyles.personalityAvatar}>
            <Text style={loginStyles.avatarIcon}>
              {AllAvatars[currentPersonality]}
            </Text>
            <View style={loginStyles.avatarGlow} />
          </View>
          
          <View style={loginStyles.titleSection}>
            <Text style={loginStyles.gameTitle}>THE ARCHIVE</Text>
            <Text style={loginStyles.gameSubtitle}>Chronicles of Inner Wisdom</Text>
            <Text style={loginStyles.personalityClass}>
              {AllTitles[currentPersonality]} Path
            </Text>
            <Text style={loginStyles.researchHint}>
              {currentPersonality < 5 ? '⚔️ Character Path' : '🧠 Personality Path'}
            </Text>
          </View>
        </View>

        {/* The Curator's Welcome */}
        {showCurator && (
          <View style={loginStyles.curatorSection}>
            <View style={loginStyles.curatorCard}>
              <View style={loginStyles.curatorHeader}>
                <Text style={loginStyles.curatorAvatar}>🧙‍♂️</Text>
                <View style={loginStyles.curatorInfo}>
                  <Text style={loginStyles.curatorName}>The Curator</Text>
                  <Text style={loginStyles.curatorTitle}>Guardian of The Archive</Text>
                </View>
              </View>
              
                <View style={loginStyles.curatorMessage}>
                <Text style={loginStyles.curatorText}>
                  "Welcome, Scholar. I am The Curator, guardian of this sacred Archive. 
                  Within these mystical halls lie two paths of wisdom: the Character Creation Realm 
                  where you forge your avatar, and the Personality Discovery Chambers where you 
                  uncover your true nature. Both paths lead to mastery over stress and the 
                  ancient arts of resilience."
                </Text>
              </View>
              
              <View style={loginStyles.curatorFooter}>
                <Text style={loginStyles.curatorHint}>
                  Present your credentials to enter...
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Login Form - Styled as Ancient Scroll */}
        <View style={loginStyles.loginScroll}>
          <View style={loginStyles.scrollHeader}>
            <Text style={loginStyles.scrollTitle}>Archive Access Credentials</Text>
            <View style={loginStyles.decorativeLine} />
          </View>
          
          <View style={loginStyles.formContainer}>
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Scholar Name</Text>
              <TextInput
                style={loginStyles.mysticalInput}
                placeholder="Enter your identity..."
                placeholderTextColor={theme.loginTheme.placeholderTextColor}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Secret Phrase</Text>
              <TextInput
                style={loginStyles.mysticalInput}
                placeholder="Whisper your passphrase..."
                placeholderTextColor={theme.loginTheme.placeholderTextColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error && (
              <View style={loginStyles.errorContainer}>
                <Text style={loginStyles.errorIcon}>⚠️</Text>
                <Text style={loginStyles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[loginStyles.enterButton, isLoading && loginStyles.enterButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <View style={loginStyles.buttonContent}>
                <Text style={loginStyles.buttonIcon}>🗝️</Text>
                <Text style={loginStyles.buttonText}>
                  {isLoading ? 'Accessing Archive...' : 'Enter The Archive'}
                </Text>
              </View>
              <View style={loginStyles.buttonGlow} />
            </TouchableOpacity>

            {/* Curator's Test Access --- Remove at end of testing*/}
            <TouchableOpacity
              style={loginStyles.curatorAccess}
              onPress={handleAdminLogin}
              disabled={isLoading}
            >
              <Text style={loginStyles.curatorAccessText}> 
                🧙‍♂️ Curator's Testing Entrance
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Footer Mystical Text */}
        <View style={loginStyles.footer}>
          <Text style={loginStyles.footerText}>
            "Every story is a doorway, every choice a teacher."
          </Text>
          <Text style={loginStyles.footerSignature}>
            ~ Ancient Archive Proverb
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


