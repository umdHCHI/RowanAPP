import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PERSONALITY_BUILDS, PersonalityConfigs, PersonalityKey } from '../imports';

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
  
  // Fallback to default config if the specific one is not found
  if (!config || !personalityBuild) {
    console.log("No config found for primaryTrait:", primaryTrait, "using default");
    const defaultConfig = PersonalityConfigs.Openness;
    const defaultBuild = PERSONALITY_BUILDS.Openness;
    return (
      <View style={[styles.headerContainer, { backgroundColor: defaultConfig.theme.background }]}>
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

  const dynamicStyles = {
    headerContainer: {
      ...styles.headerContainer,
      backgroundColor: config.theme.background,
      borderBottomColor: config.theme.primary,
      shadowColor: config.theme.primary,
    },
    avatarGlow: {
      ...styles.avatarGlow,
      backgroundColor: config.mysticalElements.avatarGlow,
    },
    mysticalBorder: {
      ...styles.mysticalBorder,
      backgroundColor: config.mysticalElements.borderGlow,
    },
    backgroundRune: {
      ...styles.backgroundRune,
      color: config.theme.secondary,
    },
    scholarRank: {
      ...styles.scholarRank,
      color: config.theme.primary,
    },
    scholarClass: {
      ...styles.scholarClass,
      color: config.theme.accent,
    },
    archiveLabel: {
      ...styles.archiveLabel,
      color: config.theme.primary,
    },
    journeyIndicator: {
      ...styles.journeyIndicator,
      backgroundColor: `${config.theme.primary}20`,
      borderLeftColor: config.theme.primary,
    },
    mindStateLabel: {
      ...styles.mindStateLabel,
      color: config.theme.secondary,
    },
    mindStateProgress: {
      ...styles.mindStateProgress,
      backgroundColor: config.theme.secondary,
    }
  };

  return (
    <View style={dynamicStyles.headerContainer}>
      {/* Personality-specific background elements */}
      <View style={styles.backgroundElements}>
        {config.backgroundRunes.map((rune: string, index: number) => (
          <Text key={index} style={dynamicStyles.backgroundRune}>
            {rune}
          </Text>
        ))}
      </View>

      {/* Main header content */}
      <View style={styles.headerContent}>
        {/* Left side - Avatar and Scholar Info */}
        <View style={styles.leftSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>{config.avatar}</Text>
            <View style={dynamicStyles.avatarGlow} />
          </View>

          <View style={styles.scholarInfo}>
            <Text style={dynamicStyles.scholarRank}>Archive Scholar</Text>
            <Text style={dynamicStyles.scholarClass}>{personalityBuild.class}</Text>
            <Text style={styles.scholarLevel}>
              Level {getCharacterLevel()}
            </Text>
          </View>
        </View>

        {/* Right side - Game Title and Description */}
        <View style={styles.rightSection}>
          <View style={styles.gameInfo}>
            <Text style={dynamicStyles.archiveLabel}>THE ARCHIVE</Text>
            <Text style={styles.gameTitle}>{config.gameTitle}</Text>
            <Text style={styles.archiveSection}>{config.archiveSection}</Text>
            <Text style={styles.curatorNote}>{config.curatorNote}</Text>
          </View>
        </View>
      </View>

      {/* Journey section with personality-specific content */}
      <View style={styles.journeySection}>
        <View style={dynamicStyles.journeyIndicator}>
          <Text style={styles.journeyIcon}>🗝️</Text>
          <Text style={styles.journeyText}>{config.journeyDesc}</Text>
        </View>

        {/* Personality-specific mind state indicators */}
        <View style={styles.mindStateContainer}>
          {config.mindStates.map((state: any, index: number) => (
            <View key={index} style={styles.mindState}>
              <Text style={styles.mindStateIcon}>{state.icon}</Text>
              <Text style={dynamicStyles.mindStateLabel}>{state.label}</Text>
              <View style={styles.mindStateBar}>
                <View 
                  style={[
                    dynamicStyles.mindStateProgress,
                    { width: `${(calculateMindState(state.key) / 10) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Mystical border with personality color */}
      <View style={dynamicStyles.mysticalBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.1,
  },

  backgroundRune: {
    fontSize: 60,
    transform: [{ rotate: '15deg' }],
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },

  avatarIcon: {
    fontSize: 48,
    zIndex: 2,
  },

  avatarGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 35,
    opacity: 0.3,
    zIndex: 1,
  },

  scholarInfo: {
    flex: 1,
  },

  scholarRank: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },

  scholarClass: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  scholarLevel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },

  gameInfo: {
    alignItems: 'flex-end',
  },

  archiveLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 2,
  },

  gameTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },

  archiveSection: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
  },

  curatorNote: {
    color: '#ccc',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'right',
  },

  journeySection: {
    marginTop: 10,
  },

  journeyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },

  journeyIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  journeyText: {
    color: '#ccc',
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },

  mindStateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  mindState: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },

  mindStateIcon: {
    fontSize: 18,
    marginBottom: 4,
  },

  mindStateLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  mindStateBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  mindStateProgress: {
    height: '100%',
    borderRadius: 2,
  },

  mysticalBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

export default PersonalizedArchiveHeader;
