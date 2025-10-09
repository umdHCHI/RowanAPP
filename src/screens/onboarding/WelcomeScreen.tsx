import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from "../../context/MasterStateContext";
import { getOnboardingStyles } from '../../styles/globalStyles';

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
  onboardingStyles: any;
}

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
  isLoading,
  onboardingStyles
}) => (
  <TouchableOpacity
    style={[
      onboardingStyles.pathCard,
      isSelected && onboardingStyles.pathCardSelected,
      { borderColor: pathData.color }
    ]}
    onPress={() => onSelect(pathKey)}
    activeOpacity={0.8}
  >
    <View style={onboardingStyles.pathCardGradient}>
      <View style={onboardingStyles.pathIconContainer}>
        <Text style={onboardingStyles.pathIcon}>{pathData.icon}</Text>
        <View style={[onboardingStyles.pathIconGlow, { backgroundColor: pathData.color }]} />
      </View>

      <View style={onboardingStyles.pathHeader}>
        <Text style={[onboardingStyles.pathTitle, { color: pathData.color }]}>
          {pathData.title}
        </Text>
        <Text style={[onboardingStyles.pathSubtitle, { color: pathData.secondaryColor }]}>
          {pathData.subtitle}
        </Text>
        <Text style={onboardingStyles.pathAtmosphere}>
          ✦ {pathData.atmosphere} ✦
        </Text>
      </View>

      <Text style={onboardingStyles.pathDescription}>
        {pathData.description}
      </Text>

      <View style={onboardingStyles.curatorNote}>
        <Text style={onboardingStyles.curatorNoteIcon}>🧙‍♂️</Text>
        <Text style={onboardingStyles.curatorNoteText}>
          {pathData.curatorNote}
        </Text>
      </View>

      <View style={onboardingStyles.benefitsList}>
        <Text style={[onboardingStyles.benefitsTitle, { color: pathData.secondaryColor }]}>
          What Awaits You:
        </Text>
        {pathData.benefits.map((benefit: string, index: number) => (
          <Text key={index} style={onboardingStyles.benefitItem}>
            {benefit}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={[
          onboardingStyles.pathButton,
          { backgroundColor: pathData.color },
          isLoading && onboardingStyles.pathButtonDisabled
        ]}
        onPress={() => onChoose(pathKey)}
        disabled={isLoading}
      >
        <View style={onboardingStyles.pathButtonContent}>
          <Text style={onboardingStyles.pathButtonIcon}>🗝️</Text>
          <Text style={onboardingStyles.pathButtonText}>
            {isLoading ? 'Opening Gateway...' : pathData.buttonText}
          </Text>
        </View>
        <View style={[onboardingStyles.pathButtonGlow, { backgroundColor: pathData.color }]} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const ArchiveOnboardingScreen: React.FC = () => {
  const { theme, auth, onboarding } = useMasterState();
  const { authToken, isTestUser, user } = auth;
  const { assignedPath, setAssignedPath, setIsLoading, isLoading } = onboarding;
  const onboardingStyles = getOnboardingStyles(theme.onboardingTheme);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [showCurator, setShowCurator] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);

  const isAdminOrTestUser = isTestUser || user?.username === 'admin';

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
    if (authToken && assignedPath && !isAdminOrTestUser && onboarding.isComplete) {
      if (assignedPath === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else if (assignedPath === 'survey') {
        router.replace('/(onboarding)/personality-test');
      }
    }
  }, [authToken, assignedPath, isAdminOrTestUser, onboarding.isComplete, isTestUser]);

  const handlePathChoice = async (pathType: PathType): Promise<void> => {
    if (!authToken) {
      Alert.alert('Authentication Error', 'Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      await setAssignedPath(pathType);
      
      if (pathType === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else {
        router.replace('/(onboarding)/personality-test');
      }
    } catch (error: any) {
      Alert.alert(
        'Navigation Error', 
        `Failed to navigate to ${pathType} creation screen: ${error.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathSelect = (pathKey: PathType): void => {
    setSelectedPath(pathKey);
  };

  if (!authToken) {
    return (
      <View style={onboardingStyles.authErrorContainer}>
        <Text style={onboardingStyles.authErrorTitle}>🔒 Archive Access Required</Text>
        <Text style={onboardingStyles.authErrorText}>
          The Curator awaits your return. Please present your credentials to enter The Archive.
        </Text>
        <TouchableOpacity
          style={onboardingStyles.authErrorButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={onboardingStyles.authErrorButtonText}>Return to Gateway</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={onboardingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0b0f" />

      <View style={onboardingStyles.backgroundContainer}>
        <View style={onboardingStyles.floatingElements}>
          <FloatingElement delay={0} duration={5000} translateY={20}>
            <Text style={[onboardingStyles.floatingIcon, { left: '5%', top: '10%' }]}>📚</Text>
          </FloatingElement>
          <FloatingElement delay={1500} duration={4000} translateY={15}>
            <Text style={[onboardingStyles.floatingIcon, { right: '10%', top: '15%' }]}>✨</Text>
          </FloatingElement>
          <FloatingElement delay={3000} duration={6000} translateY={25}>
            <Text style={[onboardingStyles.floatingIcon, { left: '15%', top: '70%' }]}>🕯️</Text>
          </FloatingElement>
          <FloatingElement delay={2000} duration={4500} translateY={18}>
            <Text style={[onboardingStyles.floatingIcon, { right: '20%', top: '60%' }]}>🔮</Text>
          </FloatingElement>
          <FloatingElement delay={4000} duration={3500} translateY={22}>
            <Text style={[onboardingStyles.floatingIcon, { left: '80%', top: '30%' }]}>📖</Text>
          </FloatingElement>
        </View>

        <View style={onboardingStyles.gradientOverlay} />
      </View>

      <ScrollView
        style={onboardingStyles.container}
        contentContainerStyle={onboardingStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={onboardingStyles.header}>
          <Text style={onboardingStyles.archiveTitle}>THE ARCHIVE</Text>
          <Text style={onboardingStyles.archiveSubtitle}>Gateway to Inner Wisdom</Text>
          <View style={onboardingStyles.decorativeLine} />
        </View>

        {showCurator && (
          <View style={onboardingStyles.curatorSection}>
            <View style={onboardingStyles.curatorCard}>
              <View style={onboardingStyles.curatorHeader}>
                <Text style={onboardingStyles.curatorAvatar}>🧙‍♂️</Text>
                <View style={onboardingStyles.curatorInfo}>
                  <Text style={onboardingStyles.curatorName}>The Curator Speaks</Text>
                  <Text style={onboardingStyles.curatorTitle}>Guardian of The Archive</Text>
                </View>
              </View>
              
              <View style={onboardingStyles.curatorMessage}>
                <Text style={onboardingStyles.curatorText}>
                  "Welcome, brave Scholar, to The Archive's threshold. Before you lie two sacred paths, 
                  each leading to mastery over the storms of stress and the shadows of uncertainty. 
                  Choose wisely, for your path will shape how you discover the coping wisdom that 
                  lies dormant within your mind."
                </Text>
              </View>
              
              <View style={onboardingStyles.curatorChoice}>
                <Text style={onboardingStyles.curatorChoiceText}>
                  ✦ Which path calls to your soul? ✦
                </Text>
              </View>
            </View>
          </View>
        )}

        {animationStep >= 2 && (
          <View style={onboardingStyles.pathsContainer}>
            <Text style={onboardingStyles.pathsTitle}>Choose Your Journey</Text>
            <Text style={onboardingStyles.pathsSubtitle}>
              Two ancient methods of self-discovery await your decision
            </Text>
            
            <View style={onboardingStyles.pathsGrid}>
              <PathCard 
                pathKey="character" 
                pathData={ArchivePaths.character}
                isSelected={selectedPath === 'character'}
                onSelect={handlePathSelect}
                onChoose={handlePathChoice}
                isLoading={isLoading}
                onboardingStyles={onboardingStyles}
              />
              <PathCard 
                pathKey="survey" 
                pathData={ArchivePaths.survey}
                isSelected={selectedPath === 'survey'}
                onSelect={handlePathSelect}
                onChoose={handlePathChoice}
                isLoading={isLoading}
                onboardingStyles={onboardingStyles}
              />
            </View>
          </View>
        )}

        <View style={onboardingStyles.footer}>
          <Text style={onboardingStyles.footerText}>
            "Every scholar's journey begins with a single choice, 
            but wisdom lies in understanding that all paths lead to growth."
          </Text>
          <Text style={onboardingStyles.footerSignature}>
            ~ The Curator's First Teaching
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ArchiveOnboardingScreen;