import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { CopingTool, PersonalityConfigs, PersonalityKey, PersonalityQuests } from '../../imports';
import { apiService } from '../../services/apiService';
import { CopingTools } from '../../types/personality';
import { CopingToolsCollection } from './CopingToolsCollection';

/**
 * PersonalityRestoration Component
 * 
 * Displays a comprehensive overview of the user's achievements, progress, and completions
 * specifically designed for the personality side of the application. This component shows:
 * 
 * - Overall progress summary with key statistics
 * - Story completion achievements
 * - Quest progress and rewards
 * - Unlocked coping tools and wisdom arsenal
 * - Wellness foundation development
 * - Personality-specific mind states cultivation
 * 
 * The design follows the mystical RPG library aesthetic while focusing on therapeutic
 * achievements rather than traditional gaming metrics.
 */

interface PersonalityRestorationProps {
  primaryTrait: PersonalityKey;
  userProfile: any;
  stories: any[];
  globalStyles: any;
  onThemeToggle?: () => void;
  onLogout?: () => void;
  currentTheme?: 'dark' | 'light';
}

export const PersonalityRestoration: React.FC<PersonalityRestorationProps> = ({
  primaryTrait,
  userProfile,
  stories,
  globalStyles,
  onThemeToggle,
  onLogout,
  currentTheme = 'dark'
}) => {
  const personalityConfig = PersonalityConfigs[primaryTrait];
  const personalityQuests = (PersonalityQuests as any)[primaryTrait] || [];
  const personalityCopingTools = (CopingTools as any)[primaryTrait] || [];
  const userUnlockedTools = userProfile?.coping_tools || [];

  // State for completed stories from apiService
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());
  const [isLoadingCompletedStories, setIsLoadingCompletedStories] = useState(true);

  // State for journal entries count
  const [journalEntriesCount, setJournalEntriesCount] = useState(0);
  
  // Function to fetch completed stories from apiService
  const fetchCompletedStories = async () => {
    try {
      // Check if user is authenticated before making API calls
      if (!userProfile) {
        setCompletedStories(new Set());
        setIsLoadingCompletedStories(false);
        return;
      }

      const completed = await apiService.getCompletedStories();
      setCompletedStories(new Set(completed));
    } catch (error) {
      console.error('❌ Failed to fetch completed stories:', error);
      setCompletedStories(new Set());
    } finally {
      setIsLoadingCompletedStories(false);
    }
  };

  // Function to fetch journal entries count
  const fetchJournalStats = async () => {
    try {
      if (!userProfile) return;
      const stats = await apiService.getCodexStats();
      setJournalEntriesCount(stats.total_entries || 0);
    } catch (error) {
      console.error('❌ Failed to fetch journal stats:', error);
      setJournalEntriesCount(0);
    }
  };

  // Fetch completed stories from apiService on component mount
  useEffect(() => {
    fetchCompletedStories();
    fetchJournalStats();
  }, []);

  // Refresh completed stories when stories prop changes (in case new stories are completed)
  useEffect(() => {
    if (stories.length > 0) {
      fetchCompletedStories();
    }
  }, [stories]);
  
  // Calculate overall progress statistics
  const getOverallStats = () => {
    // Use real completion data from apiService instead of static isCompleted property
    const actuallyCompletedStories = stories.filter(story => 
      completedStories.has(String(story.id))
    ).length;
    const totalStories = stories.length;
    
    const questProgress = userProfile?.quest_progress || {};
    const completedQuests = personalityQuests.filter((quest: any) =>
      (questProgress[quest.id] || 0) >= quest.total
    ).length;
    
    // **FIX: Use userProfile.coping_tools (actual unlocked tools from backend)**
    const unlockedToolsCount = userUnlockedTools.length;

    return {
      completedStories: actuallyCompletedStories,
      totalStories,
      completedQuests,
      totalQuests: personalityQuests.length,
      availableTools: unlockedToolsCount,
      totalTools: unlockedToolsCount,
      journalEntries: journalEntriesCount
    };
  };

  const stats = getOverallStats();

  // Component for individual achievement cards
  const AchievementCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    isCompleted: boolean;
    reward?: string;
  }> = ({ title, description, icon, progress, total, isCompleted, reward }) => (
    <TouchableOpacity
      style={[
        globalStyles.personalityQuestCard,
        isCompleted && globalStyles.personalityQuestCompleted,
        {
          marginBottom: 12,
          borderColor: isCompleted ? personalityConfig.theme.primary : 'rgba(255, 255, 255, 0.1)',
          shadowColor: isCompleted ? personalityConfig.theme.primary : 'transparent'
        }
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          isCompleted ? personalityConfig.theme.background : 'rgba(26, 26, 26, 0.9)',
          isCompleted ? personalityConfig.theme.secondary + '20' : 'rgba(30, 30, 30, 0.7)'
        ]}
        style={{
          borderRadius: 8,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[globalStyles.personalityQuestTitle, { 
              color: isCompleted ? personalityConfig.theme.primary : '#fff' 
            }]}>
              {title}
            </Text>
            <Text style={[globalStyles.personalityQuestDescription, { 
              opacity: 0.8,
              fontSize: 12 
            }]}>
              {description}
            </Text>
          </View>
          {isCompleted && (
            <Text style={{ fontSize: 20, color: personalityConfig.theme.primary }}>✨</Text>
          )}
        </View>
        
        <View style={globalStyles.personalityQuestProgress}>
          <View style={[globalStyles.personalityQuestProgressBar, {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }]}>
            <View
              style={[
                globalStyles.personalityQuestProgressFill,
                { 
                  width: `${(progress / total) * 100}%`,
                  backgroundColor: isCompleted ? personalityConfig.theme.primary : personalityConfig.theme.secondary
                }
              ]}
            />
          </View>
          <Text style={[globalStyles.personalityQuestProgressText, {
            color: isCompleted ? personalityConfig.theme.primary : '#fff'
          }]}>
            {progress}/{total} {isCompleted ? "✅" : ""}
          </Text>
        </View>
        
        {reward && isCompleted && (
          <View style={{
            marginTop: 8,
            padding: 8,
            backgroundColor: personalityConfig.theme.primary + '20',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: personalityConfig.theme.primary + '40'
          }}>
            <Text style={{
              color: personalityConfig.theme.primary,
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🏆 {reward}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  // Overall Progress Summary
  const ProgressSummary: React.FC = () => (
    <View style={{
      marginBottom: 24,
      padding: 20,
      backgroundColor: 'rgba(26, 26, 26, 0.9)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: personalityConfig.theme.primary + '30'
    }}>
      <LinearGradient
        colors={[
          personalityConfig.theme.background,
          personalityConfig.theme.secondary + '20'
        ]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 12,
          opacity: 0.3
        }}
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 32, marginRight: 12 }}>{personalityConfig.avatar}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: personalityConfig.theme.primary,
            fontSize: 20,
            fontWeight: 'bold'
          }}>
            {personalityConfig.scholarClass}
          </Text>
          <Text style={{
            color: '#fff',
            fontSize: 14,
            opacity: 0.8
          }}>
            Master of {personalityConfig.archiveSection}
          </Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 120 }}>
          <Text style={{ color: personalityConfig.theme.primary, fontSize: 24, fontWeight: 'bold' }}>
            {stats.completedStories}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>
            Stories Mastered
          </Text>
        </View>
        
        <View style={{ flex: 1, minWidth: 120 }}>
          <Text style={{ color: personalityConfig.theme.accent, fontSize: 24, fontWeight: 'bold' }}>
            {stats.completedQuests}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>
            Quests Complete
          </Text>
        </View>
        
        <View style={{ flex: 1, minWidth: 120 }}>
          <Text style={{ color: personalityConfig.theme.secondary, fontSize: 24, fontWeight: 'bold' }}>
            {stats.availableTools}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>
            Tools Unlocked
          </Text>
        </View>
        
        <View style={{ flex: 1, minWidth: 120 }}>
          <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>
            {stats.journalEntries}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>
            Journal Entries
          </Text>
        </View>
      </View>
    </View>
  );

  // Add this helper function inside PersonalityRestoration
  const isToolUnlocked = (tool: CopingTool): boolean => {
    // Check if this tool is in the user's unlocked tools list
    const isInUnlockedList = userUnlockedTools.some((unlockedTool: any) => 
      unlockedTool.id === tool.id || 
      unlockedTool.tool_id === tool.tool_id ||
      unlockedTool.name === tool.name
    );
    
    return isInUnlockedList;
  };

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 20 }}
      style={{ 
        backgroundColor: personalityConfig.theme.background,
        flex: 1 
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 24, alignItems: 'center' }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          textAlign: 'center',
          marginBottom: 8,
          textShadowColor: personalityConfig.theme.primary + '40',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4
        }}>
          📜 Archive of Achievements 📜
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#fff',
          textAlign: 'center',
          opacity: 0.8,
          fontStyle: 'italic'
        }}>
          {personalityConfig.curatorNote}
        </Text>
      </View>

      {/* Overall Progress Summary */}
      <ProgressSummary />

      {/* Story Completion Section */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: personalityConfig.theme.primary,
            textAlign: 'center'
          }}>
            📖 Chronicle Mastery
          </Text>
        </View>
        

        {isLoadingCompletedStories ? (
          <View style={{
            padding: 20,
            backgroundColor: 'rgba(26, 26, 26, 0.5)',
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#fff', opacity: 0.7, textAlign: 'center' }}>
              🔍 Loading your story progress...
            </Text>
          </View>
        ) : stories.length > 0 ? (
          stories.map((story, index) => {
            const isStoryCompleted = completedStories.has(String(story.id));
            return (
              <AchievementCard
                key={story.id}
                title={story.title}
                description={`Complete "${story.title}" to unlock new wisdom`}
                icon="📚"
                progress={isStoryCompleted ? 1 : 0}
                total={1}
                isCompleted={isStoryCompleted}
                reward={isStoryCompleted ? "Story Wisdom Gained" : undefined}
              />
            );
          })
        ) : (
          <View style={{
            padding: 20,
            backgroundColor: 'rgba(26, 26, 26, 0.5)',
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#fff', opacity: 0.7, textAlign: 'center' }}>
              📚 No stories discovered yet. Begin your journey to unlock the chronicles.
            </Text>
          </View>
        )}
      </View>

      {/* Quest Progress Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🏆 Scholar Challenges
        </Text>
        
        {personalityQuests.length > 0 ? (
          personalityQuests.map((quest: any) => {
            const progress = userProfile?.quest_progress?.[quest.id] || 0;
            const isCompleted = progress >= quest.total;
            
            return (
              <AchievementCard
                key={quest.id}
                title={quest.title}
                description={quest.description}
                icon="⭐"
                progress={progress}
                total={quest.total}
                isCompleted={isCompleted}
                reward={quest.reward}
              />
            );
          })
        ) : (
          <View style={{
            padding: 20,
            backgroundColor: 'rgba(26, 26, 26, 0.5)',
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#fff', opacity: 0.7, textAlign: 'center' }}>
              🏆 Scholar challenges await your discovery.
            </Text>
          </View>
        )}
      </View>

      {/* Coping Tools Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🛠️ Wisdom Arsenal
        </Text>
        <CopingToolsCollection
          unlockedTools={userUnlockedTools.map((tool: CopingTool) => tool.tool_id || tool.id)}
          userUnlockedTools={userUnlockedTools}
          availableTools={userProfile?.available_tools || []}
          primaryTrait={primaryTrait}
          authToken={userProfile?.authToken}
          globalStyles={globalStyles}
        />
      </View>

      {/* Wellness Foundation Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🌟 Foundation of Being
        </Text>
        
        {(() => {
          const wellnessStats = userProfile?.wellness_stats || [];
          
          // Handle both array and object formats
          if (Array.isArray(wellnessStats)) {
            // Array format: [{ value: 20, label: "Awareness", icon: "🧘" }, ...]
            return wellnessStats.map((stat: any, index: number) => (
              <AchievementCard
                key={index}
                title={`${stat.icon} ${stat.label} Mastery`}
                description={`Develop your ${stat.label.toLowerCase()} through mindful practice`}
                icon={stat.icon}
                progress={stat.value || 0}
                total={10}
                isCompleted={stat.value >= 8}
                reward={stat.value >= 8 ? `${stat.label} Sage` : undefined}
              />
            ));
          } else if (wellnessStats && typeof wellnessStats === 'object') {
            // Object format: { awareness: 20, balance: 20, connection: 15, resilience: 20 }
            const statLabels = {
              awareness: { label: "Awareness", icon: "🧘" },
              balance: { label: "Balance", icon: "⚖️" },
              connection: { label: "Connection", icon: "🤝" },
              resilience: { label: "Resilience", icon: "💚" }
            };
            
            return Object.entries(wellnessStats).map(([key, value], index) => {
              const statInfo = statLabels[key as keyof typeof statLabels] || { label: key, icon: "🌟" };
              return (
                <AchievementCard
                  key={index}
                  title={`${statInfo.icon} ${statInfo.label} Mastery`}
                  description={`Develop your ${statInfo.label.toLowerCase()} through mindful practice`}
                  icon={statInfo.icon}
                  progress={typeof value === 'number' ? value : 0}
                  total={10}
                  isCompleted={typeof value === 'number' && value >= 8}
                  reward={typeof value === 'number' && value >= 8 ? `${statInfo.label} Sage` : undefined}
                />
              );
            });
          }
          
          return null;
        })()}
      </View>

      {/* Mind States Section */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🧠 States of Consciousness
        </Text>
        
        {personalityConfig.mindStates.map((mindState: any, index: number) => {
          // Find corresponding wellness stat - handle both array and object formats
          let statValue = 0;
          const wellnessStats = userProfile?.wellness_stats || [];
          
          if (Array.isArray(wellnessStats)) {
            // Array format: [{ value: 20, label: "Awareness" }, ...]
            const correspondingStat = wellnessStats.find((stat: any) => 
              stat.label.toLowerCase().includes(mindState.label.toLowerCase())
            );
            statValue = correspondingStat?.value || 0;
          } else if (wellnessStats && typeof wellnessStats === 'object') {
            // Object format: { awareness: 20, balance: 20, connection: 15, resilience: 20 }
            // Map mind state labels to wellness stat keys
            const labelToKey: Record<string, string> = {
              'awareness': 'awareness',
              'balance': 'balance', 
              'connection': 'connection',
              'resilience': 'resilience'
            };
            
            const key = labelToKey[mindState.label.toLowerCase()];
            if (key && typeof wellnessStats[key] === 'number') {
              statValue = wellnessStats[key];
            }
          }
          
          return (
            <AchievementCard
              key={index}
              title={`${mindState.icon} ${mindState.label}`}
              description={`Cultivate deeper ${mindState.label.toLowerCase()} through practice`}
              icon={mindState.icon}
              progress={statValue}
              total={10}
              isCompleted={statValue >= 7}
              reward={statValue >= 7 ? `${mindState.label} Adept` : undefined}
            />
          );
        })}
      </View>

      {/* Settings Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          ⚙️ Archive Settings
        </Text>
        
        <View style={{
          padding: 20,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: personalityConfig.theme.primary + '30'
        }}>
          <Text style={{
            color: personalityConfig.theme.accent,
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: 16
          }}>
            Customize your journey through The Archive
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                if (onThemeToggle) {
                  onThemeToggle();
                } else {
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                {currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                Alert.alert(
                  "Logout",
                  "Are you sure you want to leave The Archive?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Logout", 
                      style: "destructive",
                      onPress: () => {
                        if (onLogout) {
                          onLogout();
                        } else {
                        }
                      }
                    }
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                Leave Archive
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mental Health Resources Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: personalityConfig.theme.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          💚 Mental Health Support
        </Text>
        
        <View style={{
          padding: 20,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: personalityConfig.theme.primary + '30'
        }}>
          <Text style={{
            color: personalityConfig.theme.accent,
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: 16
          }}>
            If you're struggling, these resources are here to help
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                const url = 'https://health-services.d.umn.edu/counseling-services';
                Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                University Counseling
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                const url = 'https://health-services.d.umn.edu/counseling-services/crisis-and-mental-health-emergency';
                Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                Crisis Hotline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                const url = 'https://www.sph.umn.edu/current/resources/mental-health/';
                Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                Student Wellness
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: personalityConfig.theme.secondary,
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: personalityConfig.theme.secondary,
                shadowColor: personalityConfig.theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 8,
                width: '48%',
              }}
              onPress={() => {
                const url = 'https://mentalhealth.umn.edu/';
                Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                textAlign: 'center',
              }}>
                Mental Health Info
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Journey Summary Footer */}
      <View style={{
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(26, 26, 26, 0.5)',
        borderRadius: 12,
        marginBottom: 20
      }}>
        <Text style={{
          color: personalityConfig.theme.primary,
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 8
        }}>
          🌟 Journey Progress 🌟
        </Text>
        <Text style={{
          color: '#fff',
          fontSize: 14,
          textAlign: 'center',
          opacity: 0.8,
          lineHeight: 20
        }}>
          {personalityConfig.journeyDesc}
        </Text>
        
        <View style={{
          flexDirection: 'row',
          marginTop: 16,
          gap: 8
        }}>
          {personalityConfig.backgroundRunes.map((rune: string, index: number) => (
            <Text key={index} style={{ fontSize: 24, opacity: 0.6 }}>
              {rune}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
