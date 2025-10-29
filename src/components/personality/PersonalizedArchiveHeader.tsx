import React from 'react';
import { Text, View } from 'react-native';
import { PersonalityConfigs, PersonalityKey } from '../../imports';

interface PersonalizedArchiveHeaderProps {
  primaryTrait: PersonalityKey;
  traitScores: Record<PersonalityKey, number>;
  characterData: any;
}

const PersonalizedArchiveHeader: React.FC<PersonalizedArchiveHeaderProps> = ({  
  primaryTrait,
  traitScores,
  characterData,
}) => {
  
  // Get personality configuration from PersonalityConfigs
  const config = PersonalityConfigs[primaryTrait];
  

  // Safely extract character data
  const experience = characterData?.experience || 0;
  const experienceNeeded = characterData?.experience_needed || 1000;
  const experiencePercentage = experienceNeeded > 0 ? (experience / experienceNeeded) * 100 : 0;
  const characterName = characterData?.name || characterData?.username || 'Scholar';
  const characterLevel = characterData?.level || 1;
  
  
  // Handle case where config might not exist
  if (!config) {
    console.warn('No personality config found for trait:', primaryTrait);
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
    paddingTop: 16,
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
  
  return (
    <View style={headerStyle}>
      {/* Background Elements for Personality Type */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        opacity: 0.08,
      }}>
        {config.backgroundRunes?.map((rune: string, index: number) => (
          <Text key={index} style={{
            fontSize: 40,
            transform: [{ rotate: '15deg' }],
            color: config.theme?.primary || '#4ee6e6',
          }}>
            {rune}
          </Text>
        ))}
      </View>

      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 1 }}>
        {/* Archive Title Section */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text
            style={{
              color: config.theme?.primary || '#4ee6e6',
              fontSize: 18,
              fontWeight: 'bold',
              letterSpacing: 2,
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
              fontSize: 11,
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

        {/* Experience Bar */}
        <View style={{ marginTop: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#ccc', fontSize: 10 }}>Experience</Text>
            <Text style={{ color: '#ccc', fontSize: 10 }}>
              {experience} / {experienceNeeded} XP
            </Text>
          </View>
          <View style={{
            height: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${Math.min(experiencePercentage, 100)}%`,
              backgroundColor: config.theme?.primary || '#4ee6e6',
              borderRadius: 3
            }} />
          </View>
        </View>

        {/* Trait Indicator */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 6,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <Text
            style={{
              color: config.theme?.primary || '#4ee6e6',
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center'
            }}
            numberOfLines={1}
          >
            Welcome to {config.archiveSection || 'The Archive'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PersonalizedArchiveHeader;
