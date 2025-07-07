import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { apiService } from '../../imports';

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
      // 1. Login and get token
      const loginResponse = await apiService.login(username, password);
      const token = loginResponse.token;

      // 2. Store token in context/storage
      await login(token, String(loginResponse.user.id), loginResponse.user);

      // 3. Check user profile and onboarding status
      const userProfile = loginResponse.user;
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = userProfile.profile?.has_completed_onboarding;
      const completionType = userProfile.profile?.completion_type;
      const needsOnboarding = loginResponse.needs_onboarding;
      const onboardingType = loginResponse.onboarding_type;
      const isAdminUser = userProfile.username === 'admin';

   //   console.log('=== LOGIN FLOW DEBUG ===');
   //   console.log('Username:', userProfile.username);
   //   console.log('Is admin user:', isAdminUser);
   //   console.log('Needs onboarding (backend):', needsOnboarding);
   //   console.log('Onboarding type (backend):', onboardingType);
   //   console.log('Has completed onboarding:', hasCompletedOnboarding);
   //   console.log('Completion type:', completionType);
      
      // Determine if user should go through onboarding
      let shouldRedirectToOnboarding = false;
      let assignedPath: 'character' | 'survey' | null = null;
      
      if (isAdminUser) {
        // Admin users should always go through onboarding (for testing)
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
      
   //   console.log('Should redirect to onboarding:', shouldRedirectToOnboarding);
   //   console.log('Assigned path:', assignedPath);
      
      if (shouldRedirectToOnboarding) {
        // User needs to complete onboarding
        setAssignedPath(assignedPath);
        if (assignedPath === 'character') {
          router.replace('/(onboarding)/character-creator');
        } else if (assignedPath === 'survey') {
          router.replace('/(onboarding)/personality-test');
        } else {
          router.replace('/(onboarding)/onboarding');
        }
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

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.login('admin', 'admin');
      const testUserId = String(response.user.id);
      
      await login(response.token, testUserId, response.user);
      router.replace('/(onboarding)/onboarding');
    } catch (err) {
      setError('Curator access denied');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0b0f" />
      
      {/* Mystical Background */}
      <View style={styles.backgroundContainer}>
        {/* Floating mystical elements */}
        <View style={styles.floatingElements}>
          <FloatingElement delay={0} duration={4000} translateY={15}>
            <Text style={[styles.floatingIcon, { left: '10%', top: '15%' }]}>📚</Text>
          </FloatingElement>
          <FloatingElement delay={1000} duration={5000} translateY={20}>
            <Text style={[styles.floatingIcon, { right: '15%', top: '25%' }]}>✨</Text>
          </FloatingElement>
          <FloatingElement delay={2000} duration={3500} translateY={18}>
            <Text style={[styles.floatingIcon, { left: '20%', top: '60%' }]}>🕯️</Text>
          </FloatingElement>
          <FloatingElement delay={1500} duration={4500} translateY={22}>
            <Text style={[styles.floatingIcon, { right: '10%', top: '70%' }]}>📖</Text>
          </FloatingElement>
          <FloatingElement delay={3000} duration={3000} translateY={16}>
            <Text style={[styles.floatingIcon, { left: '70%', top: '40%' }]}>🗝️</Text>
          </FloatingElement>
        </View>

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with cycling research condition avatars */}
        <View style={styles.header}>
          <View style={styles.personalityAvatar}>
            <Text style={styles.avatarIcon}>
              {AllAvatars[currentPersonality]}
            </Text>
            <View style={styles.avatarGlow} />
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.gameTitle}>THE ARCHIVE</Text>
            <Text style={styles.gameSubtitle}>Chronicles of Inner Wisdom</Text>
            <Text style={styles.personalityClass}>
              {AllTitles[currentPersonality]} Path
            </Text>
            <Text style={styles.researchHint}>
              {currentPersonality < 5 ? '⚔️ Character Path' : '🧠 Personality Path'}
            </Text>
          </View>
        </View>

        {/* The Curator's Welcome */}
        {showCurator && (
          <View style={styles.curatorSection}>
            <View style={styles.curatorCard}>
              <View style={styles.curatorHeader}>
                <Text style={styles.curatorAvatar}>🧙‍♂️</Text>
                <View style={styles.curatorInfo}>
                  <Text style={styles.curatorName}>The Curator</Text>
                  <Text style={styles.curatorTitle}>Guardian of The Archive</Text>
                </View>
              </View>
              
              <View style={styles.curatorMessage}>
                <Text style={styles.curatorText}>
                  "Welcome, Scholar. I am The Curator, guardian of this sacred Archive. 
                  Within these mystical halls lie two paths of wisdom: the Character Creation Realm 
                  where you forge your avatar, and the Personality Discovery Chambers where you 
                  uncover your true nature. Both paths lead to mastery over stress and the 
                  ancient arts of resilience."
                </Text>
              </View>
              
              <View style={styles.curatorFooter}>
                <Text style={styles.curatorHint}>
                  Present your credentials to enter...
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Login Form - Styled as Ancient Scroll */}
        <View style={styles.loginScroll}>
          <View style={styles.scrollHeader}>
            <Text style={styles.scrollTitle}>Archive Access Credentials</Text>
            <View style={styles.decorativeLine} />
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Scholar Name</Text>
              <TextInput
                style={styles.mysticalInput}
                placeholder="Enter your identity..."
                placeholderTextColor="#8b7355"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Secret Phrase</Text>
              <TextInput
                style={styles.mysticalInput}
                placeholder="Whisper your passphrase..."
                placeholderTextColor="#8b7355"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.enterButton, isLoading && styles.enterButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>🗝️</Text>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Accessing Archive...' : 'Enter The Archive'}
                </Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>

            {/* Curator's Test Access */}
            <TouchableOpacity
              style={styles.curatorAccess}
              onPress={handleAdminLogin}
              disabled={isLoading}
            >
              <Text style={styles.curatorAccessText}>
                🧙‍♂️ Curator's Testing Entrance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Mystical Text */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Every story is a doorway, every choice a teacher."
          </Text>
          <Text style={styles.footerSignature}>
            ~ Ancient Archive Proverb
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


//move and consolidate styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b0f',
  },
  
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingIcon: {
    position: 'absolute',
    fontSize: 24,
    color: '#4ee6e6',
    opacity: 0.3,
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
  },
  
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  personalityAvatar: {
    position: 'relative',
    marginBottom: 20,
  },
  
  avatarIcon: {
    fontSize: 60,
    zIndex: 2,
  },
  
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#4ee6e6',
    borderRadius: 40,
    opacity: 0.3,
    zIndex: 1,
  },
  
  titleSection: {
    alignItems: 'center',
  },
  
  gameTitle: {
    color: '#4ee6e6',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  gameSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  
  personalityClass: {
    color: '#ffe066',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  researchHint: {
    color: '#4ee6e6',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  
  curatorSection: {
    marginBottom: 30,
  },
  
  curatorCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  curatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  curatorAvatar: {
    fontSize: 32,
    marginRight: 15,
  },
  
  curatorInfo: {
    flex: 1,
  },
  
  curatorName: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  curatorTitle: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  curatorMessage: {
    marginBottom: 15,
  },
  
  curatorText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  curatorFooter: {
    alignItems: 'center',
  },
  
  curatorHint: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '600',
  },
  
  loginScroll: {
    backgroundColor: 'rgba(244, 241, 232, 0.95)',
    borderRadius: 12,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#8b4513',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  
  scrollHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  
  scrollTitle: {
    color: '#2c1810',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: '#d4af37',
  },
  
  formContainer: {
    gap: 20,
  },
  
  inputContainer: {
    marginBottom: 5,
  },
  
  inputLabel: {
    color: '#5d4037',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  mysticalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2c1810',
    borderWidth: 2,
    borderColor: '#d4af37',
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 10,
  },
  
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  
  enterButton: {
    position: 'relative',
    backgroundColor: '#4ee6e6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10,
  },
  
  enterButtonDisabled: {
    opacity: 0.7,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  
  buttonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  buttonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#4ee6e6',
    borderRadius: 14,
    opacity: 0.3,
    zIndex: 1,
  },
  
  curatorAccess: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9d4edd',
    marginTop: 15,
  },
  
  curatorAccessText: {
    color: '#9d4edd',
    fontSize: 14,
    fontWeight: '600',
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  footerText: {
    color: '#4ee6e6',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  footerSignature: {
    color: '#d4af37',
    fontSize: 12,
    fontStyle: 'italic',
  },
});