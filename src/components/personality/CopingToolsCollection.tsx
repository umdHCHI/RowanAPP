import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { CopingTool, CopingToolsCollectionProps } from '../../imports';
import { apiService } from '../../services/apiService';

export const CopingToolsCollection: React.FC<CopingToolsCollectionProps> = ({
  unlockedTools,
  primaryTrait,
  authToken,
  globalStyles
}) => {
  const [personalityTools, setPersonalityTools] = useState<CopingTool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  
  // Get user's unlocked coping tools from master state (from full_profile endpoint)
  const { character } = useMasterState();
  const userUnlockedTools = character.backendCharacter?.coping_tools || [];

  console.log("=== CopingToolsCollection Debug ===");
  console.log("Props unlockedTools:", unlockedTools);
  console.log("Master state coping_tools:", userUnlockedTools);
  console.log("Primary trait:", primaryTrait);
  console.log("=== End CopingToolsCollection Debug ===");

  useEffect(() => {
    const loadPersonalityTools = async () => {
      try {
        console.log("=== LOADING COPING TOOLS FOR PERSONALITY ===");
        console.log("Primary trait:", primaryTrait);
        console.log("User's unlocked tools:", userUnlockedTools);
        
        // Map personality types to match your PersonalityKey format
        const personalityMapping: Record<string, string> = {
          'Openness': 'openness',
          'Conscientiousness': 'conscientiousness', 
          'Extraversion': 'extraversion',
          'Agreeableness': 'agreeableness',
          'Neuroticism': 'neuroticism'
        };
        
        const targetPersonalityType = personalityMapping[primaryTrait] || primaryTrait.toLowerCase();
        console.log("Looking for tools with personality_type:", targetPersonalityType);
        
        // Get available coping tools from the backend
        const allTools = await apiService.getAvailableCopingTools();
        console.log("All available tools from backend:", allTools);
        
        // Filter tools for the current personality type
        const filteredTools = allTools.filter((tool: CopingTool) => {
          console.log(`Tool "${tool.name}" has personality_type: "${tool.personality_type}"`);
          return tool.personality_type === targetPersonalityType;
        });
        
        console.log(`Filtered tools for ${primaryTrait} (${targetPersonalityType}):`, filteredTools);
        console.log(`Found ${filteredTools.length} tools for this personality type`);
        
        if (filteredTools.length === 0) {
          console.warn("No tools found for personality type. Available personality types in all tools:");
          const uniquePersonalityTypes = [...new Set(allTools.map((tool: any) => tool.personality_type))];
          console.warn("Unique personality types:", uniquePersonalityTypes);
        }
        
        setPersonalityTools(filteredTools);
        setToolsLoading(false);
      } catch (error) {
        console.error("Failed to load coping tools:", error);
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
    
    console.log(`Tool "${tool.name}" (ID: ${tool.id}) is unlocked:`, isInUnlockedList);
    return isInUnlockedList;
  };

  if (toolsLoading) {
    return (
      <View style={globalStyles.personalityToolsContainer}>
        <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
        <Text style={globalStyles.personalityToolsSubtitle}>Loading your techniques...</Text>
        <ActivityIndicator size="small" color="#4ee6e6" style={{ marginTop: 10 }} />
      </View>
    );
  }

  if (personalityTools.length === 0) {
    return (
      <View style={globalStyles.personalityToolsContainer}>
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
    <View style={globalStyles.personalityToolsContainer}>
      <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
      <Text style={globalStyles.personalityToolsSubtitle}>
        Techniques for {primaryTrait} scholars ({unlockedCount}/{personalityTools.length} available)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {personalityTools.map((tool) => {
          const isUnlocked = isToolUnlocked(tool);
          
          return (
            <View key={tool.id} style={[
              globalStyles.personalityToolCard, 
              !isUnlocked && globalStyles.personalityToolLocked
            ]}>
              <Text style={globalStyles.personalityToolIcon}>
                {isUnlocked ? tool.emoji_icon : "🔒"}
              </Text>
              <Text style={globalStyles.personalityToolName}>
                {isUnlocked ? tool.name : "Locked Tool"}
              </Text>
              <Text style={globalStyles.personalityToolDescription}>
                {isUnlocked ? tool.description : "Complete stories to unlock this technique"}
              </Text>
              
              {/* Show wellness bonuses for unlocked tools */}
              {isUnlocked && (
                <View style={{ marginTop: 5 }}>
                  {tool.awareness_bonus > 0 && (
                    <Text style={[globalStyles.personalityToolUnlockSource, { color: '#9d4edd' }]}>
                      +{tool.awareness_bonus} Awareness
                    </Text>
                  )}
                  {tool.resilience_bonus > 0 && (
                    <Text style={[globalStyles.personalityToolUnlockSource, { color: '#06ffa5' }]}>
                      +{tool.resilience_bonus} Resilience
                    </Text>
                  )}
                  {tool.connection_bonus > 0 && (
                    <Text style={[globalStyles.personalityToolUnlockSource, { color: '#4cc9f0' }]}>
                      +{tool.connection_bonus} Connection
                    </Text>
                  )}
                  {tool.balance_bonus > 0 && (
                    <Text style={[globalStyles.personalityToolUnlockSource, { color: '#f72585' }]}>
                      +{tool.balance_bonus} Balance
                    </Text>
                  )}
                </View>
              )}
              
              {/* Show level requirement for locked tools */}
              {!isUnlocked && (
                <Text style={[globalStyles.personalityToolUnlockSource, { color: '#ffd60a' }]}>
                  {tool.level_required > 1 ? `Level ${tool.level_required} required` : 'Story completion required'}
                </Text>
              )}
              
              {/* Show tool type */}
              <Text style={[globalStyles.personalityToolUnlockSource, { color: '#aaa', fontSize: 10 }]}>
                {tool.tool_type} • {tool.subtype}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
