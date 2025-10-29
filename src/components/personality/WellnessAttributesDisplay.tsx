import React from 'react';
import { Text, View } from 'react-native';
import { useMasterState } from "../../context/MasterStateContext";
import { PersonalityWellnessAttributes } from '../../imports';
import { WellnessAttributesDisplayProps } from '../../types/index';

export const WellnessAttributesDisplay: React.FC<WellnessAttributesDisplayProps> = ({
  personalityType,
  personalityScores,
  storyProgress,
  globalStyles
}) => {

  const personalityAttributes = PersonalityWellnessAttributes[personalityType]?.attributes || PersonalityWellnessAttributes.Openness.attributes;
  
  const {
    theme,
    auth,
    character,
    wellness
  } = useMasterState();

  const userUnlockedTools = wellness.myTools || [];

  // FIXED: Use personalityScores prop as primary source, fallback to character context
  const getWellnessValue = (wellnessProperty: string): number => {
    let baseValue = 0;
    
    // PRIMARY: Use personalityScores prop if available (from PersonalityHomeScreen)
    if (personalityScores && typeof personalityScores === 'object') {
      // Handle both array format and object format
      if (Array.isArray(personalityScores)) {
        const labelMap: Record<string, string> = {
          'awareness': 'Exploration',
          'resilience': 'Courage',
          'connection': 'Connection', 
          'balance': 'Fear'
        };
        
        const stat = personalityScores.find((s: any) => 
          s.label === labelMap[wellnessProperty]
        );
        baseValue = stat?.value || 0;
      } else {
        // Object format - direct property access
        baseValue = personalityScores[wellnessProperty] || 0;
      }
    }
    // FALLBACK: Use character context if no personalityScores prop
    else {
      const characterData = character.backendCharacter;
      
      if (characterData) {
        // Direct property access (following The Archive's dual research path architecture)
        const characterObj = characterData as any;
        if (characterObj[wellnessProperty] !== undefined) {
          baseValue = characterObj[wellnessProperty];
        }
        // Check wellness_stats array format for character users
        else if (characterObj.wellness_stats && Array.isArray(characterObj.wellness_stats)) {
          const labelMap: Record<string, string> = {
            'awareness': 'Exploration',
            'resilience': 'Courage',
            'connection': 'Connection', 
            'balance': 'Fear'
          };
          
          const stat = characterObj.wellness_stats.find((s: any) => 
            s.label === labelMap[wellnessProperty]
          );
          baseValue = stat?.value || 0;
        }
      } else {
        // For personality users or new users - start at 0 and build through story rewards
        baseValue = 0;
      }
    }
    
    // Ensure valid number
    if (baseValue === undefined || baseValue === null || isNaN(baseValue)) {
      baseValue = 0;
    }
    
    return baseValue;
  };

  // Map personality attributes to wellness stats with tool bonuses
  const characterAttributes = personalityAttributes.map((attr: any) => {
    const baseValue = getWellnessValue(attr.wellnessProperty);
    
    // Calculate tool bonus for The Archive's dual research path system
    let toolBonus = 0;
    if (userUnlockedTools && userUnlockedTools.length > 0) {
      userUnlockedTools.forEach(tool => {
        switch (attr.wellnessProperty) {
          case 'awareness':
            toolBonus += tool.awareness_bonus || 0;
            break;
          case 'resilience':
            toolBonus += tool.resilience_bonus || 0;
            break;
          case 'connection':
            toolBonus += tool.connection_bonus || 0;
            break;
          case 'balance':
            toolBonus += tool.balance_bonus || 0;
            break;
        }
      });
    }
    
    const totalValue = baseValue + toolBonus;
    
    return {
      icon: attr.icon,
      label: attr.label,
      value: totalValue,
      baseValue: baseValue,
      toolBonus: toolBonus,
      color: attr.color,
      description: attr.description,
      wellnessProperty: attr.wellnessProperty
    };
  });

  return (
    <View style={globalStyles.personalityAttributesContainer}>
      <Text style={globalStyles.personalityEchoesTitle}>Echoes of the Self</Text>
      <View style={globalStyles.personalityAttributesGrid}>
        {characterAttributes.map((attr: any, index: number) => (
          <View key={index} style={globalStyles.personalityAttributeCardParchment}>
            <Text style={[globalStyles.personalityAttributeLabel, { fontSize: 16 }]}>
              {attr.icon} {attr.label}
            </Text>
            <View style={globalStyles.personalityAttributeBarMagic}>
              {/* Base progress bar with Archive's visual design philosophy */}
              <View 
                style={[
                  globalStyles.personalityAttributeProgressMagic,
                  { 
                    width: `${(attr.baseValue / 20) * 100}%`,
                    backgroundColor: attr.color
                  }
                ]}
              />
              {/* Tool bonus overlay with cyan accent (#4ee6e6) */}
              {attr.toolBonus > 0 && (
                <View 
                  style={[
                    globalStyles.personalityAttributeProgressMagic,
                    { 
                      backgroundColor: '#4ee6e6', // The Archive's cyan accent
                      opacity: 0.7,
                      position: 'absolute',
                      left: `${(attr.baseValue / 20) * 100}%`,
                      width: `${(attr.toolBonus / 20) * 100}%`
                    }
                  ]}
                />
              )}
            </View>
            <Text style={globalStyles.personalityAttributeValue}>
              {attr.value}/20
              {attr.toolBonus > 0 && (
                <Text style={{ color: '#4ee6e6', fontSize: 12 }}>
                  {' '}(+{attr.toolBonus} from tools)
                </Text>
              )}
            </Text>
            <Text style={globalStyles.personalityCuratorNote}>
              Curator&apos;s Note: <Text style={globalStyles.personalityCuratorNoteText}>{attr.description}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
