import React from 'react';
import { Text, View } from 'react-native';
import { PERSONALITY_BUILDS, PersonalityConfigs, PersonalityKey } from '../imports';
import { getPersonalityStyles } from '../styles/globalStyles';

interface PersonalizedArchiveHeaderProps {
  primaryTrait: PersonalityKey;
  traitScores: Record<PersonalityKey, number>;
  characterData?: {
    level: number;
    name: string;
  } | null;
}

const PersonalizedArchiveHeader = ({
  primaryTrait,
  traitScores,
  characterData,
}: PersonalizedArchiveHeaderProps) => {
  if (!primaryTrait || !traitScores) {
    return null;
  }
  
  const config = PersonalityConfigs[primaryTrait];
  const personalityBuild = PERSONALITY_BUILDS[primaryTrait];
  
  // Generate personality-specific styles
  const personalityStyles = getPersonalityStyles(
    config.theme.primary,
    config.theme.secondary,
    config.theme.accent
  );
  
  // Fallback to default config if the specific one is not found
  if (!config || !personalityBuild) {
    console.log("No config found for primaryTrait:", primaryTrait, "using default");
    const defaultConfig = PersonalityConfigs.Openness;
    const defaultBuild = PERSONALITY_BUILDS.Openness;
    const defaultStyles = getPersonalityStyles(
      defaultConfig.theme.primary,
      defaultConfig.theme.secondary,
      defaultConfig.theme.accent
    );
    return (
      <View style={[personalityStyles.headerContainer, { backgroundColor: defaultConfig.theme.background }]}>
        <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>
          Loading personality configuration...
        </Text>
      </View>
    );
  }

  // Calculate mind state values based on personality type
  const calculateMindState = (stateKey: string): number => {
    switch (stateKey) {
      case 'awareness':
      case 'curiosity':
        return (traitScores.Openness + traitScores.Conscientiousness) / 2;
      case 'imagination':
      case 'creativity':
        return traitScores.Openness;
      case 'openness':
      case 'adventure':
        return (traitScores.Openness + traitScores.Extraversion) / 2;
      case 'discipline':
      case 'focus':
        return traitScores.Conscientiousness;
      case 'persistence':
      case 'resilience':
        return (traitScores.Conscientiousness + (10 - traitScores.Neuroticism)) / 2;
      case 'achievement':
      case 'progress':
        return (traitScores.Conscientiousness + traitScores.Extraversion) / 2;
      case 'vitality':
      case 'energy':
        return traitScores.Extraversion;
      case 'social':
      case 'connection':
        return (traitScores.Extraversion + traitScores.Agreeableness) / 2;
      case 'communication':
      case 'expression':
        return traitScores.Extraversion;
      case 'compassion':
      case 'empathy':
        return traitScores.Agreeableness;
      case 'peace':
      case 'harmony':
        return (traitScores.Agreeableness + (10 - traitScores.Neuroticism)) / 2;
      case 'healing':
      case 'growth':
        return (traitScores.Agreeableness + traitScores.Openness) / 2;
      case 'mindfulness':
        return (traitScores.Neuroticism + traitScores.Openness) / 2;
      case 'introspection':
      case 'depth':
        return traitScores.Neuroticism;
      case 'emotional_balance':
      case 'flow':
        return (10 - traitScores.Neuroticism + traitScores.Agreeableness) / 2;
      default:
        return traitScores[primaryTrait];
    }
  };

  // Get character level from backend data, fallback to calculated level if not available
  const getCharacterLevel = (): number => {
    if (characterData && characterData.level) {
      return characterData.level;
    }
    // Fallback to calculated level if backend data is not available
    return Math.floor(traitScores[primaryTrait] / 2) + 1;
  };

  return (
    <View style={[personalityStyles.headerContainer, { backgroundColor: config.theme.background }]}>
      {/* Personality-specific background elements */}
      <View style={personalityStyles.backgroundElements}>
        {config.backgroundRunes.map((rune: string, index: number) => (
          <Text key={index} style={personalityStyles.backgroundRune}>
            {rune}
          </Text>
        ))}
      </View>

      {/* Main header content */}
      <View style={personalityStyles.headerContent}>
        {/* Left side - Avatar and Scholar Info */}
        <View style={personalityStyles.leftSection}>
          <View style={personalityStyles.avatarContainer}>
            <Text style={personalityStyles.avatarIcon}>{config.avatar}</Text>
            <View style={personalityStyles.avatarGlow} />
          </View>

          <View style={personalityStyles.scholarInfo}>
            <Text style={personalityStyles.scholarRank}>Archive Scholar</Text>
            <Text style={personalityStyles.scholarClass}>{personalityBuild.class}</Text>
            <Text style={personalityStyles.scholarLevel}>
              Level {getCharacterLevel()}
            </Text>
          </View>
        </View>

        {/* Right side - Game Title and Description */}
        <View style={personalityStyles.rightSection}>
          <View style={personalityStyles.gameInfo}>
            <Text style={personalityStyles.archiveLabel}>THE ARCHIVE</Text>
            <Text style={personalityStyles.gameTitle}>{config.gameTitle}</Text>
            <Text style={personalityStyles.archiveSection}>{config.archiveSection}</Text>
            <Text style={personalityStyles.curatorNote}>{config.curatorNote}</Text>
          </View>
        </View>
      </View>

      {/* Journey section with personality-specific content */}
      <View style={personalityStyles.journeySection}>
        <View style={personalityStyles.journeyIndicator}>
          <Text style={personalityStyles.journeyIcon}>🗝️</Text>
          <Text style={personalityStyles.journeyText}>{config.journeyDesc}</Text>
        </View>

        {/* Personality-specific mind state indicators */}
        <View style={personalityStyles.mindStateContainer}>
          {config.mindStates.map((state: any, index: number) => (
            <View key={index} style={personalityStyles.mindState}>
              <Text style={personalityStyles.mindStateIcon}>{state.icon}</Text>
              <Text style={personalityStyles.mindStateLabel}>{state.label}</Text>
              <View style={personalityStyles.mindStateBar}>
                <View 
                  style={[
                    personalityStyles.mindStateProgress,
                    { width: `${(calculateMindState(state.key) / 10) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Mystical border with personality color */}
      <View style={personalityStyles.mysticalBorder} />
    </View>
  );
};

export default PersonalizedArchiveHeader;
