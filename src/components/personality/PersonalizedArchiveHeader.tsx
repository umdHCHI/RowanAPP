import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PersonalityConfigs, PersonalityKey } from '../../imports';
import RunicThreadBar from '../../ui/RunicThreadBar';
import RuneBackground from '../../ui/RuneBackground';

interface PersonalizedArchiveHeaderProps {
  primaryTrait: PersonalityKey;
  traitScores: Record<PersonalityKey, number>;
  characterData: any;
  onTutorialPress?: () => void;
  hasSeenTutorial?: boolean;
}

const PersonalizedArchiveHeader: React.FC<PersonalizedArchiveHeaderProps> = ({
  primaryTrait,
  traitScores,
  characterData,
  onTutorialPress,
  hasSeenTutorial = false,
}) => {

  // Get personality configuration from PersonalityConfigs
  const config = PersonalityConfigs[primaryTrait];

  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReducedMotion(enabled);
    });
  }, []);

  // Shimmer animation for title
  const shimmerOffset = useSharedValue(0);

  useEffect(() => {
    if (!reducedMotion) {
      shimmerOffset.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [reducedMotion]);

  // Safely extract character data
  const experience = characterData?.experience || 0;
  const experienceNeeded = characterData?.experience_needed || 1000;
  const experiencePercentage = experienceNeeded > 0 ? (experience / experienceNeeded) * 100 : 0;
  const characterName = characterData?.name || characterData?.username || 'Scholar';
  const characterLevel = characterData?.level || 1;
  
  
  // Handle case where config might not exist
  if (!config) {
    return (
      <View style={{
        backgroundColor: '#0a0b0f',
        padding: 12,
        paddingTop: 16,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#4ee6e6',
      }}>
        <Text style={{ color: '#4ee6e6', fontSize: 18, textAlign: 'center' }}>
          The Archive
        </Text>
      </View>
    );
  }

  // Create personality-specific header style
  const headerStyle = {
    backgroundColor: config.theme?.background || '#0a0b0f',
    padding: 12,
    paddingTop: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: config.theme?.primary || '#4ee6e6',
    shadowColor: config.theme?.primary || '#4ee6e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative' as const
  };
  
  const palette = {
    primary: config.theme?.primary || '#4ee6e6',
    secondary: config.theme?.secondary || '#ccc',
    accent: config.theme?.accent || '#ffd43b',
  };

  return (
    <View style={headerStyle}>
      {/* Mystical background layer */}
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 1 }}>
        {/* Tutorial Button - Top Right */}
        {onTutorialPress && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: hasSeenTutorial ? 'rgba(102, 102, 102, 0.8)' : config.theme?.primary || '#4ee6e6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: config.theme?.primary || '#4ee6e6',
            }}
            onPress={onTutorialPress}
          >
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
              {hasSeenTutorial ? '📚' : '🎮 Tutorial'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Archive Title Section */}
        <View style={{ alignItems: 'center', marginBottom: 8, paddingHorizontal: 70 }}>
          <Text
            style={{
              color: config.theme?.primary || '#4ee6e6',
              fontSize: 15,
              fontWeight: 'bold',
              letterSpacing: 1.5,
              textShadowColor: `${config.theme?.primary || '#4ee6e6'}50`,
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
              textAlign: 'center'
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {config.gameTitle || 'The Archive'}
          </Text>
          <Text
            style={{
              color: config.theme?.secondary || '#ccc',
              fontSize: 10,
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 2
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {config.journeyDesc || 'Your journey through the archives...'}
          </Text>
        </View>

        {/* Character Info Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={{
                color: config.theme?.primary || '#4ee6e6',
                fontSize: 16,
                fontWeight: 'bold'
              }}
              numberOfLines={1}
            >
              {characterName}
            </Text>
            <Text
              style={{
                color: '#ccc',
                fontSize: 11,
                fontStyle: 'italic'
              }}
              numberOfLines={1}
            >
              {config.scholarClass || 'The Explorer'} • Level {characterLevel}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', flex: 1, paddingLeft: 8 }}>
            <Text
              style={{
                color: config.theme?.primary || '#4ee6e6',
                fontSize: 14,
                fontWeight: '600'
              }}
              numberOfLines={1}
            >
              {config.avatar || '🏛️'} {config.archiveSection || 'Archive'}
            </Text>
            <Text
              style={{
                color: '#ccc',
                fontSize: 10
              }}
              numberOfLines={1}
            >
              {primaryTrait} Scholar
            </Text>
          </View>
        </View>

        {/* Runic XP Thread */}
        <View style={{ marginTop: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#b8a88a', fontSize: 10, fontStyle: 'italic' }}>Essence Thread XP</Text>
            <Text style={{ color: '#b8a88a', fontSize: 10, fontStyle: 'italic' }}>
              {experience} / {experienceNeeded}
            </Text>
          </View>
          <RunicThreadBar
            value={experience}
            max={experienceNeeded}
            palette={palette}
            reducedMotion={reducedMotion}
          />
        </View>
      </View>
    </View>
  );
};

export default PersonalizedArchiveHeader;
