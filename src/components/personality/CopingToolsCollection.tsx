import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, AccessibilityInfo, Image } from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { CopingTool, CopingToolsCollectionProps, PersonalityConfigs, PersonalityWellnessAttributes } from '../../imports';
import { apiService } from '../../services/apiService';
import RuneBackground from '../../ui/RuneBackground';

export const CopingToolsCollection: React.FC<CopingToolsCollectionProps> = ({
  unlockedTools,
  primaryTrait,
  authToken,
  globalStyles
}) => {
  const [personalityTools, setPersonalityTools] = useState<CopingTool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Get user's unlocked coping tools from master state (from full_profile endpoint)
  const { character } = useMasterState();
  const userUnlockedTools = character.backendCharacter?.coping_tools || [];

  // Get personality config for theming
  const config = PersonalityConfigs[primaryTrait];
  const palette = {
    primary: config?.theme?.primary || '#4ee6e6',
    secondary: config?.theme?.secondary || '#ccc',
    accent: config?.theme?.accent || '#ffd43b',
  };

  // Get personality-specific wellness attributes for matching icons/labels
  const personalityAttributes = PersonalityWellnessAttributes[primaryTrait]?.attributes || PersonalityWellnessAttributes.Openness.attributes;

  // Create a map of wellness properties to their personality-specific icons and labels
  const wellnessAttributeMap: Record<string, { icon: any; label: string }> = {};
  personalityAttributes.forEach((attr: any) => {
    wellnessAttributeMap[attr.wellnessProperty] = {
      icon: attr.icon,
      label: attr.label,
    };
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReducedMotion(enabled);
    });
  }, []);

  useEffect(() => {
    const loadPersonalityTools = async () => {
      try {
        // Map personality types to match your PersonalityKey format
        const personalityMapping: Record<string, string> = {
          'Openness': 'openness',
          'Conscientiousness': 'conscientiousness', 
          'Extraversion': 'extraversion',
          'Agreeableness': 'agreeableness',
          'Neuroticism': 'neuroticism'
        };
        
        const targetPersonalityType = personalityMapping[primaryTrait] || primaryTrait.toLowerCase();
        
        // Get available coping tools from the backend
        const allTools = await apiService.getAvailableCopingTools();
        
        // Filter tools for the current personality type
        const filteredTools = allTools.filter((tool: CopingTool) => {
          return tool.personality_type === targetPersonalityType;
        });
        
        setPersonalityTools(filteredTools);
        setToolsLoading(false);
      } catch (error) {
        setToolsLoading(false);
      }
    };

    loadPersonalityTools();
  }, [primaryTrait, userUnlockedTools]);

  const isToolUnlocked = (tool: CopingTool): boolean => {
    // Check if this tool is in the user's unlocked tools list
    const isInUnlockedList = userUnlockedTools.some((unlockedTool: any) => 
      unlockedTool.id === tool.id || 
      unlockedTool.tool_id === tool.tool_id ||
      unlockedTool.name === tool.name
    );
    
    return isInUnlockedList;
  };

  if (toolsLoading) {
    return (
      <View style={[globalStyles.personalityToolsContainer, { position: 'relative' }]}>
        <RuneBackground palette={palette} reducedMotion={reducedMotion} />
        <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
        <Text style={globalStyles.personalityToolsSubtitle}>Loading your techniques...</Text>
        <ActivityIndicator size="small" color={palette.primary} style={{ marginTop: 10 }} />
      </View>
    );
  }

  if (personalityTools.length === 0) {
    return (
      <View style={[globalStyles.personalityToolsContainer, { position: 'relative' }]}>
        <RuneBackground palette={palette} reducedMotion={reducedMotion} />
        <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
        <Text style={globalStyles.personalityToolsSubtitle}>
          No tools available for {primaryTrait} yet
        </Text>
        <Text style={[globalStyles.personalityToolsSubtitle, { fontSize: 12, marginTop: 5, opacity: 0.7 }]}>
          Tools may be added in future updates
        </Text>
      </View>
    );
  }

  // Count unlocked tools for display
  const unlockedCount = personalityTools.filter(tool => isToolUnlocked(tool)).length;

  return (
    <View style={[globalStyles.personalityToolsContainer, { position: 'relative' }]}>
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
      <Text style={globalStyles.personalityToolsSubtitle}>
        Techniques for {primaryTrait} scholars ({unlockedCount}/{personalityTools.length} available)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        {personalityTools.map((tool) => {
          const isUnlocked = isToolUnlocked(tool);

          return (
            <View
              key={tool.id}
              style={[
                globalStyles.personalityToolCard,
                {
                  backgroundColor: isUnlocked ? 'rgba(26, 26, 26, 0.85)' : 'rgba(20, 20, 20, 0.7)',
                  borderWidth: 1,
                  borderColor: isUnlocked ? `${palette.primary}60` : 'rgba(100, 100, 100, 0.4)',
                  borderRadius: 12,
                  padding: 14,
                  marginRight: 12,
                  width: 220,
                  minHeight: 200,
                  shadowColor: isUnlocked ? palette.primary : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isUnlocked ? 0.2 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]}
            >
              {/* Tool icon */}
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={[globalStyles.personalityToolIcon, { fontSize: 36 }]}>
                  {isUnlocked ? tool.emoji_icon : "🔒"}
                </Text>
              </View>

              {/* Tool name */}
              <Text
                style={[
                  globalStyles.personalityToolName,
                  {
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: isUnlocked ? palette.primary : '#888',
                    textAlign: 'center',
                    marginBottom: 8,
                  }
                ]}
                numberOfLines={2}
              >
                {isUnlocked ? tool.name : "Locked Tool"}
              </Text>

              {/* Tool description */}
              <Text
                style={[
                  globalStyles.personalityToolDescription,
                  {
                    fontSize: 12,
                    lineHeight: 16,
                    fontStyle: 'italic',
                    opacity: isUnlocked ? 0.9 : 0.7,
                    textAlign: 'center',
                    marginBottom: 10,
                    flex: 1,
                  }
                ]}
                numberOfLines={4}
              >
                {isUnlocked ? tool.description : "Complete stories to unlock this technique"}
              </Text>
              
              {/* Separator line */}
              <View style={{ height: 1, backgroundColor: `${palette.primary}30`, marginVertical: 8 }} />

              {/* Show wellness bonuses for unlocked tools with personality-specific icons */}
              {isUnlocked && (
                <View style={{ marginBottom: 8 }}>
                  {/* Map backend bonus properties to personality wellness properties */}
                  {/* awareness_bonus → awareness, exploration_bonus → awareness */}
                  {(tool.awareness_bonus > 0 || (tool as any).exploration_bonus > 0) && wellnessAttributeMap.awareness && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      {typeof wellnessAttributeMap.awareness.icon === 'string' ? (
                        <Text style={{ fontSize: 14, marginRight: 4 }}>
                          {wellnessAttributeMap.awareness.icon}
                        </Text>
                      ) : (
                        <Image
                          source={wellnessAttributeMap.awareness.icon}
                          style={{ width: 14, height: 14, marginRight: 4 }}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.accent, fontSize: 11, fontWeight: '600' }]}>
                        +{tool.awareness_bonus || (tool as any).exploration_bonus || 0} {wellnessAttributeMap.awareness.label}
                      </Text>
                    </View>
                  )}
                  {/* resilience_bonus → resilience, courage_bonus → resilience */}
                  {(tool.resilience_bonus > 0 || (tool as any).courage_bonus > 0) && wellnessAttributeMap.resilience && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      {typeof wellnessAttributeMap.resilience.icon === 'string' ? (
                        <Text style={{ fontSize: 14, marginRight: 4 }}>
                          {wellnessAttributeMap.resilience.icon}
                        </Text>
                      ) : (
                        <Image
                          source={wellnessAttributeMap.resilience.icon}
                          style={{ width: 14, height: 14, marginRight: 4 }}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.accent, fontSize: 11, fontWeight: '600' }]}>
                        +{tool.resilience_bonus || (tool as any).courage_bonus || 0} {wellnessAttributeMap.resilience.label}
                      </Text>
                    </View>
                  )}
                  {/* connection_bonus → connection */}
                  {tool.connection_bonus > 0 && wellnessAttributeMap.connection && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      {typeof wellnessAttributeMap.connection.icon === 'string' ? (
                        <Text style={{ fontSize: 14, marginRight: 4 }}>
                          {wellnessAttributeMap.connection.icon}
                        </Text>
                      ) : (
                        <Image
                          source={wellnessAttributeMap.connection.icon}
                          style={{ width: 14, height: 14, marginRight: 4 }}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.accent, fontSize: 11, fontWeight: '600' }]}>
                        +{tool.connection_bonus} {wellnessAttributeMap.connection.label}
                      </Text>
                    </View>
                  )}
                  {/* balance_bonus → balance, fear_bonus → balance */}
                  {(tool.balance_bonus > 0 || (tool as any).fear_bonus > 0) && wellnessAttributeMap.balance && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      {typeof wellnessAttributeMap.balance.icon === 'string' ? (
                        <Text style={{ fontSize: 14, marginRight: 4 }}>
                          {wellnessAttributeMap.balance.icon}
                        </Text>
                      ) : (
                        <Image
                          source={wellnessAttributeMap.balance.icon}
                          style={{ width: 14, height: 14, marginRight: 4 }}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.accent, fontSize: 11, fontWeight: '600' }]}>
                        +{tool.balance_bonus || (tool as any).fear_bonus || 0} {wellnessAttributeMap.balance.label}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Show level requirement for locked tools */}
              {!isUnlocked && (
                <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.accent, fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 6 }]}>
                  {tool.level_required > 1 ? `Level ${tool.level_required} required` : 'Story completion required'}
                </Text>
              )}

              {/* Show tool type with mystical styling */}
              <Text style={[globalStyles.personalityToolUnlockSource, { color: palette.secondary, fontSize: 10, textAlign: 'center', opacity: 0.7, fontStyle: 'italic' }]}>
                {tool.tool_type} • {tool.subtype}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
