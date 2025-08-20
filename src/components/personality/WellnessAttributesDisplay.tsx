import React from 'react';
import { Text, View } from 'react-native';
import { useMasterState } from "../../context/MasterStateContext";
import { PersonalityKey, PersonalityWellnessAttributes } from '../../imports';


interface WellnessAttributesDisplayProps {
  personalityType: PersonalityKey;
  personalityScores: Record<string, number>; // Changed to accept any string keys for wellness stats
  storyProgress?: any;
  globalStyles: any;
  // Note: unlockedTools prop removed - we get this data directly from master state context
}

export const WellnessAttributesDisplay: React.FC<WellnessAttributesDisplayProps> = ({
  personalityType,
  storyProgress,
  globalStyles
  // Note: unlockedTools removed - we get this data directly from master state context
}) => {
  // Get personality-specific attributes from imports.ts
  const personalityAttributes = PersonalityWellnessAttributes[personalityType]?.attributes || PersonalityWellnessAttributes.Openness.attributes;
  
  // Get the master state for theme and other global data
  const {
    theme,
    auth,
    onboarding,
    character,
    equipment,
    archive,
    ui,
    loading,
    wellness
  } = useMasterState();

  // Get user's ACTUALLY unlocked coping tools from master state (from full_profile endpoint)
  // This is the same data source that CopingToolsCollection uses
  const userUnlockedTools = character.backendCharacter?.coping_tools || [];
  
  // Use the actually unlocked tools from backend, not the prop which contains all available tools
  const actuallyUnlockedTools = userUnlockedTools;

  // Debug logging for coping tools
  console.log("=== WellnessAttributesDisplay Debug ===");
  console.log("userUnlockedTools:", userUnlockedTools);
  console.log("character.backendCharacter?.coping_tools:", character.backendCharacter?.coping_tools);
  console.log("personalityType:", personalityType);
  console.log("=== End WellnessAttributesDisplay Debug ===");
  
  console.log("=== WellnessAttributesDisplay Tool Usage ===");
  console.log("User's actually unlocked tools:", actuallyUnlockedTools?.length || 0);
  console.log("Tool bonus details:", actuallyUnlockedTools.map(t => ({
    name: t.name,
    awareness: t.awareness_bonus || 0,
    resilience: t.resilience_bonus || 0,
    connection: t.connection_bonus || 0,
    balance: t.balance_bonus || 0
  })));
  console.log("=== End WellnessAttributesDisplay Tool Usage ===");

  // Function to get wellness value from backend data plus coping tool bonuses
  const getWellnessValue = (wellnessProperty: string): number => {
    const homeData = wellness.homeData;
    const backendCharacter = character.backendCharacter;
    
    // Try to get base value from homeData first, then backendCharacter
    let baseValue = 0;
    if (homeData && (homeData as any)[wellnessProperty] !== undefined) {
      baseValue = (homeData as any)[wellnessProperty];
    } else if (backendCharacter && (backendCharacter as any)[wellnessProperty] !== undefined) {
      baseValue = (backendCharacter as any)[wellnessProperty];
    }
    
    // Calculate bonus from unlocked coping tools
    let toolBonus = 0;
    if (actuallyUnlockedTools && actuallyUnlockedTools.length > 0) {
      actuallyUnlockedTools.forEach(tool => {
        // Map wellness property names to tool bonus properties
        switch (wellnessProperty) {
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
          // Add any other wellness properties as needed
          default:
            break;
        }
      });
    }
    
    console.log(`Wellness ${wellnessProperty}: base=${baseValue}, tool bonus=${toolBonus}, total=${baseValue + toolBonus} (from ${actuallyUnlockedTools.length} unlocked tools)`);
    return baseValue + toolBonus;
  };

  // Map personality-specific attributes to actual character wellness stats with tool bonuses
  const characterAttributes = personalityAttributes.map((attr: any) => {
    const baseValue = getWellnessValue(attr.wellnessProperty);
    
    // Calculate tool bonus separately for display purposes
    let toolBonus = 0;
    if (actuallyUnlockedTools && actuallyUnlockedTools.length > 0) {
      actuallyUnlockedTools.forEach(tool => {
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
    
    return {
      icon: attr.icon,
      label: attr.label,
      value: baseValue,
      baseValue: baseValue - toolBonus, // Original backend value
      toolBonus: toolBonus, // Bonus from tools
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
              {/* Base progress bar */}
              <View 
                style={[
                  globalStyles.personalityAttributeProgressMagic,
                  { 
                    width: `${(attr.baseValue / 20) * 100}%`, // Base value from backend
                    backgroundColor: attr.color
                  }
                ]}
              />
              {/* Tool bonus overlay */}
              {attr.toolBonus > 0 && (
                <View 
                  style={[
                    globalStyles.personalityAttributeProgressMagic,
                    { 
                      backgroundColor: '#4ee6e6', // Cyan for tool bonus
                      opacity: 0.7,
                      position: 'absolute',
                      left: `${(attr.baseValue / 20) * 100}%`, // Start where base ends
                      width: `${(attr.toolBonus / 20) * 100}%` // Only show bonus portion
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
