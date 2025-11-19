import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FloatingElementProps } from '../../components/rewards/FloatingElement';
import { useMasterState } from '../../context/MasterStateContext';
import { apiService } from '../../services/apiService';
import { createLoginStyles } from '../../styles/screens/login';
import { ResearchConditions } from '../characterStory/constants/researchConditions';



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

const AllAvatars = ResearchConditions.avatars;
const AllTitles = ResearchConditions.titles;

export default function ArchiveLoginScreen() {
  //const router = useRouter();
  const { auth, theme,  } = useMasterState();
  const { login } = auth;
  const loginStyles = createLoginStyles(theme.loginTheme);

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showCurator, setShowCurator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % AllAvatars.length);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={loginStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={loginStyles.container.backgroundColor} />

        <View style={[loginStyles.backgroundContainer, { pointerEvents: 'none' }]}>
          <View style={[loginStyles.floatingElements, { pointerEvents: 'none' }]}>
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
            <Image 
              source={AllAvatars[currentImage]} 
              style={loginStyles.avatarIcon}
              resizeMode="contain"
            />
            <View style={loginStyles.avatarGlow} />
          </View>
          
          <View style={loginStyles.titleSection}>
            <Text style={loginStyles.gameTitle}>THE ARCHIVE</Text>
            <Text style={loginStyles.gameSubtitle}>Self Reflection to Combat Stress</Text>
            <Text style={loginStyles.personalityClass}>
              {AllTitles[currentImage]} Path
            </Text>

          </View>
        </View>

        {showCurator && (
          <View style={loginStyles.curatorSection}>
            <View style={loginStyles.curatorCard}>
              <View style={loginStyles.curatorHeader}>
              <Image 
                    source={require('../../../assets/loginScreen/welcome.png')}
                    style={{
                      width: '100%',
                      height: 300,
                      marginBottom: 2,
                    }}
                  />
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
          <Text style={loginStyles.footerText}>{/*Might want to make this dynamic */}
            "You have power over your mind - not outside events. Realize this, and you will find strength."
          </Text>
          <Text style={loginStyles.footerSignature}>
            ~ Marcus Aurelius
          </Text>
        </View>
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
