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
import { ArchivePaths } from '../../data/archivePaths';
import { createOnboardingStyles } from '../../styles/screens/onboarding';
import { FloatingElementProps, PathCardProps, PathType } from '../../types/index';



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
  const onboardingStyles = createOnboardingStyles(theme.onboardingTheme);
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
      } else if (assignedPath === 'personality') {
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
      // Set the assigned path (synchronous)
      setAssignedPath(pathType);

      // Navigate to the appropriate screen
      // Onboarding will be completed when user finishes character creation or personality test
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


        <View style={onboardingStyles.gradientOverlay} />
      </View>

      <ScrollView
        style={onboardingStyles.container}
        contentContainerStyle={onboardingStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={onboardingStyles.header}>
          <Text style={onboardingStyles.archiveTitle}>THE ARCHIVE</Text>
          <Text style={onboardingStyles.archiveSubtitle}>A story-driven space to practice handling stress</Text>
          <View style={onboardingStyles.decorativeLine} />
        </View>

        {showCurator && (
          <View style={onboardingStyles.curatorSection}>
            <View style={onboardingStyles.curatorCard}>
              <View style={onboardingStyles.curatorHeader}>
                <Text style={onboardingStyles.curatorAvatar}>🐈‍⬛</Text>
                <View style={onboardingStyles.curatorInfo}>
                  <Text style={onboardingStyles.curatorName}>The Curator Speaks</Text>
                  <Text style={onboardingStyles.curatorTitle}>Guardian of The Archive</Text>
                </View>
              </View>
              
              <View style={onboardingStyles.curatorMessage}>
                <Text style={onboardingStyles.curatorText}>
                  "You look tired, Scholar. The kind of tired that sleep alone does not fix.
                    This is The Archive, a living library built from your memories, worries, and 
                    almost-breakdowns. Here, worry reshapes itself into myth. Nothing hunts you here. Nothing judges you.
                    You only explore."
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
                pathKey="personality" 
                pathData={ArchivePaths.personality}
                isSelected={selectedPath === 'personality'}
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
            "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for."
          </Text>
          <Text style={onboardingStyles.footerSignature}>
            ~ Epicurus
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ArchiveOnboardingScreen;