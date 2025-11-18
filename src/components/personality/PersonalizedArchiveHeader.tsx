import React from 'react';
import { Image, Text, View } from 'react-native';
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
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#4ee6e6',
      }}>
        <Text style={{ color: '#4ee6e6', fontSize: 16, textAlign: 'center' }}>
          The Archive
        </Text>
      </View>
    );
  }

  // Create personality-specific header style
  const headerStyle = {
    backgroundColor: config.theme?.background || '#0a0b0f',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
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
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Text
            style={{
              color: config.theme?.primary || '#4ee6e6',
              fontSize: 16,
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
              marginTop: 1
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {config.journeyDesc || 'Your journey through the archives...'}
          </Text>
        </View>

        {/* Character Info Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <View style={{ flex: 1, paddingRight: 6 }}>
            <Text
              style={{
                color: config.theme?.primary || '#4ee6e6',
                fontSize: 14,
                fontWeight: 'bold'
              }}
              numberOfLines={1}
            >
              {characterName}
            </Text>
            <Text
              style={{
                color: '#ccc',
                fontSize: 10,
                fontStyle: 'italic'
              }}
              numberOfLines={1}
            >
              {config.scholarClass || 'The Explorer'} • Lvl {characterLevel}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', flex: 1, paddingLeft: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {typeof config.avatar === 'string' ? (
                <Text
                  style={{
                    color: config.theme?.primary || '#4ee6e6',
                    fontSize: 12,
                    fontWeight: '600'
                  }}
                >
                  {config.avatar || '🏛️'}
                </Text>
              ) : (
                <Image
                  source={config.avatar}
                  style={{
                    width: 16,
                    height: 16,
                    resizeMode: 'contain'
                  }}
                />
              )}
              <Text
                style={{
                  color: config.theme?.primary || '#4ee6e6',
                  fontSize: 12,
                  fontWeight: '600'
                }}
                numberOfLines={1}
              >
                {config.archiveSection || 'Archive'}
              </Text>
            </View>
            <Text
              style={{
                color: '#ccc',
                fontSize: 9
              }}
              numberOfLines={1}
            >
              {primaryTrait} Scholar
            </Text>
          </View>
        </View>

        {/* Experience Bar */}
        <View style={{ marginTop: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ color: '#ccc', fontSize: 9 }}>Lumens To Light Your Way</Text>
            <Text style={{ color: '#ccc', fontSize: 9 }}>
              {experience} / {experienceNeeded} 🌙
            </Text>
          </View>
          <View style={{
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${Math.min(experiencePercentage, 100)}%`,
              backgroundColor: config.theme?.primary || '#4ee6e6',
              borderRadius: 2
            }} />
          </View>
        </View>

        {/* Trait Indicator */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 4,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <Text
            style={{
              color: config.theme?.primary || '#4ee6e6',
              fontSize: 11,
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
