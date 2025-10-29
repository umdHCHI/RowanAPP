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
import { apiService } from '../../services/apiService';
import { createLoginStyles } from '../../styles/screens/login';

const { width, height } = Dimensions.get('window');

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

const ResearchConditions = {
  A: {
    avatars: ['⚔️', '🛡️', '🏹', '🔮', '⚡', '💥'],
    titles: [
      'Seeker of Truths',
      'Bearer of Burdens',
      'Keeper of Bonds',
      'Weaver of Change',
      'Watcher Between Worlds', 
      'Marked by Fate'
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

const AllAvatars = [...ResearchConditions.A.avatars, ...ResearchConditions.B.avatars];
const AllTitles = [...ResearchConditions.A.titles, ...ResearchConditions.B.titles];

export default function ArchiveLoginScreen() {
  const router = useRouter();
  const { auth, theme, onboarding } = useMasterState();
  const { login } = auth;
  const loginStyles = createLoginStyles(theme.loginTheme);

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState(0);
  const [showCurator, setShowCurator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersonality((prev) => (prev + 1) % AllAvatars.length);
    }, 4000);
    
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
      const loginResponse = await apiService.login(username, password);
      const token = loginResponse.token;
      const charId = loginResponse.character_id != null ? String(loginResponse.character_id) : '';
      await login(token, charId, loginResponse.user);
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

  return (
    <View style={loginStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={loginStyles.container.backgroundColor} />

      <View style={[loginStyles.backgroundContainer, { pointerEvents: 'none' }]}>
        <View style={[loginStyles.floatingElements, { pointerEvents: 'none' }]}>
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

        <View style={[loginStyles.gradientOverlay, { pointerEvents: 'none' }]} />
      </View>

      <ScrollView 
        style={{ flex: 1, zIndex: 10 }}
        contentContainerStyle={loginStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
      >
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
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={loginStyles.mysticalInput}
                  placeholder="Whisper your passphrase..."
                  placeholderTextColor={theme.loginTheme.placeholderTextColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 15,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ fontSize: 20 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
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
          </View>
        </View>

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
