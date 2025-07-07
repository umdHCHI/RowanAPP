import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from '../../services/apiService';

const { width, height } = Dimensions.get('window');

// Type definitions
type PathType = 'character' | 'survey';

interface PathData {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  curatorNote: string;
  benefits: string[];
  atmosphere: string;
  color: string;
  secondaryColor: string;
  gradientColors: string[];
  buttonText: string;
  journey: string;
}

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  translateY?: number;
}

interface PathCardProps {
  pathKey: PathType;
  pathData: PathData;
  isSelected: boolean;
  onSelect: (pathKey: PathType) => void;
  onChoose: (pathType: PathType) => Promise<void>;
  isLoading: boolean;
}

// The two research paths with rich lore and theming
const ArchivePaths: Record<PathType, PathData> = {
  character: {
    icon: '⚔️',
    title: 'Path of the Forged Soul',
    subtitle: 'Character Creation Realm',
    description: 'Craft your avatar through ancient rituals of self-expression. Choose your appearance, define your strengths, and forge the vessel that will carry you through The Archive. Your character becomes a reflection of how you wish to grow.',
    curatorNote: '"Some scholars find wisdom through creation, shaping themselves as they would shape clay. This path offers tangible transformation."',
    benefits: [
      '⚡ Customize your Archive avatar',
      '🛡️ Choose starting attributes and skills', 
      '🎨 Express your ideal self visually',
      '📈 Track growth through character progression'
    ],
    atmosphere: 'Creative Workshop',
    color: '#f72585',
    secondaryColor: '#4cc9f0',
    gradientColors: ['rgba(247, 37, 133, 0.9)', 'rgba(76, 201, 240, 0.7)', 'rgba(157, 78, 221, 0.8)'],
    buttonText: 'Enter the Forge',
    journey: 'Embark on the Path of Creation'
  },
  survey: {
    icon: '🔮',
    title: 'Path of the True Self',
    subtitle: 'Personality Discovery Chambers',
    description: 'Journey deep into the chambers of self-knowledge through the ancient Big Five wisdom. Discover your authentic nature, understand your patterns, and unlock personalized guidance tailored to your unique psychological landscape.',
    curatorNote: '"Others find wisdom through revelation, peeling back layers to discover what was always there. This path offers profound understanding."',
    benefits: [
      '🧠 Discover your Big Five personality traits',
      '✨ Receive personalized story recommendations',
      '🎯 Unlock trait-specific coping strategies',
      '🌱 Experience content adapted to your nature'
    ],
    atmosphere: 'Reflection Sanctum',
    color: '#9d4edd',
    secondaryColor: '#06ffa5',
    gradientColors: ['rgba(157, 78, 221, 0.9)', 'rgba(6, 255, 165, 0.7)', 'rgba(76, 201, 240, 0.8)'],
    buttonText: 'Enter the Chambers',
    journey: 'Embark on the Path of Discovery'
  }
};

// Floating mystical elements
const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  duration = 4000, 
  delay = 0, 
  translateY = 25 
}) => {
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    const animate = (): void => {
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
  }, [duration, delay, translateY]);

  const translateYInterpolated = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -translateY],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: translateYInterpolated }] }}>
      {children}
    </Animated.View>
  );
};

const PathCard: React.FC<PathCardProps> = ({ 
  pathKey, 
  pathData, 
  isSelected, 
  onSelect, 
  onChoose, 
  isLoading 
}) => (
  <TouchableOpacity
    style={[
      styles.pathCard,
      isSelected && styles.pathCardSelected,
      { borderColor: pathData.color }
    ]}
    onPress={() => onSelect(pathKey)}
    activeOpacity={0.8}
  >
    <View style={styles.pathCardGradient}>
      {/* Path Icon */}
      <View style={styles.pathIconContainer}>
        <Text style={styles.pathIcon}>{pathData.icon}</Text>
        <View style={[styles.pathIconGlow, { backgroundColor: pathData.color }]} />
      </View>

      {/* Path Header */}
      <View style={styles.pathHeader}>
        <Text style={[styles.pathTitle, { color: pathData.color }]}>
          {pathData.title}
        </Text>
        <Text style={[styles.pathSubtitle, { color: pathData.secondaryColor }]}>
          {pathData.subtitle}
        </Text>
        <Text style={styles.pathAtmosphere}>
          ✦ {pathData.atmosphere} ✦
        </Text>
      </View>

      {/* Path Description */}
      <Text style={styles.pathDescription}>
        {pathData.description}
      </Text>

      {/* Curator's Note */}
      <View style={styles.curatorNote}>
        <Text style={styles.curatorNoteIcon}>🧙‍♂️</Text>
        <Text style={styles.curatorNoteText}>
          {pathData.curatorNote}
        </Text>
      </View>

      {/* Benefits List */}
      <View style={styles.benefitsList}>
        <Text style={[styles.benefitsTitle, { color: pathData.secondaryColor }]}>
          What Awaits You:
        </Text>
        {pathData.benefits.map((benefit: string, index: number) => (
          <Text key={index} style={styles.benefitItem}>
            {benefit}
          </Text>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.pathButton,
          { backgroundColor: pathData.color },
          isLoading && styles.pathButtonDisabled
        ]}
        onPress={() => onChoose(pathKey)}
        disabled={isLoading}
      >
        <View style={styles.pathButtonContent}>
          <Text style={styles.pathButtonIcon}>🗝️</Text>
          <Text style={styles.pathButtonText}>
            {isLoading ? 'Opening Gateway...' : pathData.buttonText}
          </Text>
        </View>
        <View style={[styles.pathButtonGlow, { backgroundColor: pathData.color }]} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const ArchiveOnboardingScreen: React.FC = () => {
  const { theme, auth, onboarding } = useMasterState();
  const { authToken, isTestUser, user } = auth;
  const { assignedPath, setAssignedPath, setIsLoading, isLoading } = onboarding;
  
  const [isAdminOrTestUser, setIsAdminOrTestUser] = useState<boolean>(false);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [showCurator, setShowCurator] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);

  // Entrance animation sequence
  useEffect(() => {
    const sequence: (() => void)[] = [
      () => setAnimationStep(1), // Show background
      () => setShowCurator(true), // Show curator
      () => setAnimationStep(2), // Show paths
    ];

    sequence.forEach((step: () => void, index: number) => {
      setTimeout(step, (index + 1) * 1000);
    });
  }, []);

  useEffect(() => {
    const checkUserType = async (): Promise<void> => {
      try {
        if (authToken) {
       //   console.log('=== TESTING TOKEN AUTHENTICATION ===');
          const tokenTest = await apiService.testTokenAuth();
      //    console.log('Token test result:', tokenTest);
          
          const isAdminByUsername: boolean = user?.username === 'admin';
          
          let isTestByAPI: boolean = false;
          if (tokenTest.success) {
            try {
              const status = await apiService.checkOnboardingStatus();
              isTestByAPI = status.isTestUser || status.username === 'admin';
            } catch (error) {
         //     console.log('API onboarding check failed, using other methods');
            }
          }
          
          const isAdminOrTest: boolean = isAdminByUsername || isTestByAPI;
        //  console.log('Final isAdminOrTest:', isAdminOrTest);
          setIsAdminOrTestUser(isAdminOrTest);
        }
      } catch (error) {
     //   console.error('Error checking user type:', error);
        setIsAdminOrTestUser(isTestUser);
      }
    };

    checkUserType();
  }, [authToken, user, isTestUser]);

  useEffect(() => {
    if (authToken && assignedPath && !isAdminOrTestUser) {
      if (assignedPath === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else if (assignedPath === 'survey') {
        router.replace('/(onboarding)/personality-test');
      }
    }
  }, [authToken, assignedPath, isAdminOrTestUser]);

  const handlePathChoice = async (pathType: PathType): Promise<void> => {
    if (!authToken) {
      Alert.alert('Authentication Error', 'Please log in first');
      return;
    }

  //  console.log(`=== ${pathType.toUpperCase()} CHOICE DEBUG ===`);
 //   console.log('Auth token present:', authToken ? 'Yes' : 'No');
 //   console.log('Is admin or test user:', isAdminOrTestUser);
 //   console.log('Username:', user?.username);

    setIsLoading(true);
    try {
      // Let the API service handle all the research group assignment and onboarding logic
      if (isAdminOrTestUser) {
       // console.log(`Admin/Test user choosing ${pathType} path - setting locally`);
        await setAssignedPath(pathType);
      } else {
      //  console.log(`Regular user choosing ${pathType} path - completing onboarding via API service`);
        const updatedProfile = await apiService.completeOnboarding(pathType);
        await setAssignedPath(pathType);
      }
      
      if (pathType === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else {
        router.replace('/(onboarding)/personality-test');
      }
    } catch (error: any) {
    //  console.error(`Error in handle${pathType}Choice:`, error);
      Alert.alert(
        'Error', 
        `Failed to start ${pathType} onboarding: ${error.message || 'Unknown error'}. Please try again or contact support.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathSelect = (pathKey: PathType): void => {
    setSelectedPath(pathKey);
  };

  // If not authenticated, show message
  if (!authToken) {
    return (
      <View style={styles.authErrorContainer}>
        <Text style={styles.authErrorTitle}>🔒 Archive Access Required</Text>
        <Text style={styles.authErrorText}>
          The Curator awaits your return. Please present your credentials to enter The Archive.
        </Text>
        <TouchableOpacity
          style={styles.authErrorButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.authErrorButtonText}>Return to Gateway</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0b0f" />
      
      {/* Mystical Background */}
      <View style={styles.backgroundContainer}>
        {/* Floating mystical elements */}
        <View style={styles.floatingElements}>
          <FloatingElement delay={0} duration={5000} translateY={20}>
            <Text style={[styles.floatingIcon, { left: '5%', top: '10%' }]}>📚</Text>
          </FloatingElement>
          <FloatingElement delay={1500} duration={4000} translateY={15}>
            <Text style={[styles.floatingIcon, { right: '10%', top: '15%' }]}>✨</Text>
          </FloatingElement>
          <FloatingElement delay={3000} duration={6000} translateY={25}>
            <Text style={[styles.floatingIcon, { left: '15%', top: '70%' }]}>🕯️</Text>
          </FloatingElement>
          <FloatingElement delay={2000} duration={4500} translateY={18}>
            <Text style={[styles.floatingIcon, { right: '20%', top: '60%' }]}>🔮</Text>
          </FloatingElement>
          <FloatingElement delay={4000} duration={3500} translateY={22}>
            <Text style={[styles.floatingIcon, { left: '80%', top: '30%' }]}>📖</Text>
          </FloatingElement>
        </View>

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Archive Header */}
        <View style={styles.header}>
          <Text style={styles.archiveTitle}>THE ARCHIVE</Text>
          <Text style={styles.archiveSubtitle}>Gateway to Inner Wisdom</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* The Curator's Welcome */}
        {showCurator && (
          <View style={styles.curatorSection}>
            <View style={styles.curatorCard}>
              <View style={styles.curatorHeader}>
                <Text style={styles.curatorAvatar}>🧙‍♂️</Text>
                <View style={styles.curatorInfo}>
                  <Text style={styles.curatorName}>The Curator Speaks</Text>
                  <Text style={styles.curatorTitle}>Guardian of The Archive</Text>
                </View>
              </View>
              
              <View style={styles.curatorMessage}>
                <Text style={styles.curatorText}>
                  "Welcome, brave Scholar, to The Archive's threshold. Before you lie two sacred paths, 
                  each leading to mastery over the storms of stress and the shadows of uncertainty. 
                  Choose wisely, for your path will shape how you discover the coping wisdom that 
                  lies dormant within your mind."
                </Text>
              </View>
              
              <View style={styles.curatorChoice}>
                <Text style={styles.curatorChoiceText}>
                  ✦ Which path calls to your soul? ✦
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Path Selection */}
        {animationStep >= 2 && (
          <View style={styles.pathsContainer}>
            <Text style={styles.pathsTitle}>Choose Your Journey</Text>
            <Text style={styles.pathsSubtitle}>
              Two ancient methods of self-discovery await your decision
            </Text>
            
            <View style={styles.pathsGrid}>
              <PathCard 
                pathKey="character" 
                pathData={ArchivePaths.character}
                isSelected={selectedPath === 'character'}
                onSelect={handlePathSelect}
                onChoose={handlePathChoice}
                isLoading={isLoading}
              />
              <PathCard 
                pathKey="survey" 
                pathData={ArchivePaths.survey}
                isSelected={selectedPath === 'survey'}
                onSelect={handlePathSelect}
                onChoose={handlePathChoice}
                isLoading={isLoading}
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Every scholar's journey begins with a single choice, 
            but wisdom lies in understanding that all paths lead to growth."
          </Text>
          <Text style={styles.footerSignature}>
            ~ The Curator's First Teaching
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
    fontSize: 28,
    color: '#4ee6e6',
    opacity: 0.4,
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.7)',
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
  
  archiveTitle: {
    color: '#4ee6e6',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 8,
    textShadowColor: 'rgba(78, 230, 230, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  
  archiveSubtitle: {
    color: '#d4af37',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  
  decorativeLine: {
    width: 120,
    height: 2,
    backgroundColor: '#4ee6e6',
    opacity: 0.8,
  },
  
  curatorSection: {
    marginBottom: 40,
  },
  
  curatorCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 16,
    padding: 25,
    borderWidth: 2,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  
  curatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  curatorAvatar: {
    fontSize: 40,
    marginRight: 15,
  },
  
  curatorInfo: {
    flex: 1,
  },
  
  curatorName: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  curatorTitle: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  curatorMessage: {
    marginBottom: 20,
  },
  
  curatorText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  curatorChoice: {
    alignItems: 'center',
  },
  
  curatorChoiceText: {
    color: '#4ee6e6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  pathsContainer: {
    marginBottom: 40,
  },
  
  pathsTitle: {
    color: '#4ee6e6',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  pathsSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  
  pathsGrid: {
    gap: 25,
  },
  
  pathCard: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 10,
  },
  
  pathCardSelected: {
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  
  pathCardGradient: {
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    padding: 25,
  },
  
  pathIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  
  pathIcon: {
    fontSize: 50,
    zIndex: 2,
  },
  
  pathIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 35,
    opacity: 0.3,
    zIndex: 1,
  },
  
  pathHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  pathTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  
  pathSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  pathAtmosphere: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  pathDescription: {
    color: '#e5e7eb',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  curatorNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4af37',
  },
  
  curatorNoteIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  
  curatorNoteText: {
    color: '#d4af37',
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
  
  benefitsList: {
    marginBottom: 25,
  },
  
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  benefitItem: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  
  pathButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  
  pathButtonDisabled: {
    opacity: 0.7,
  },
  
  pathButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  
  pathButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  pathButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  pathButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    opacity: 0.4,
    zIndex: 1,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  footerText: {
    color: '#4ee6e6',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  
  footerSignature: {
    color: '#d4af37',
    fontSize: 13,
    fontStyle: 'italic',
  },
  
  // Auth Error Styles
  authErrorContainer: {
    flex: 1,
    backgroundColor: '#0a0b0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  authErrorTitle: {
    color: '#4ee6e6',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  authErrorText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  
  authErrorButton: {
    backgroundColor: '#4ee6e6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  
  authErrorButtonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ArchiveOnboardingScreen;