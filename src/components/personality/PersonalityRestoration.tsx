import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const palette = personalityConfig.theme;
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

  // Component for individual achievement cards (Foundry-inspired)
  const AchievementCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    isCompleted: boolean;
    reward?: string;
  }> = ({ title, description, icon, progress, total, isCompleted, reward }) => {
    const progressPercentage = Math.round((progress / total) * 100);

    return (
      <View style={[
        styles.achievementCard,
        {
          borderColor: isCompleted ? `${palette.accent}60` : `${palette.primary}40`,
          backgroundColor: '#0a0e14'
        }
      ]}>
        {/* Corner ornament */}
        <View style={[styles.cornerOrnament, {
          borderColor: isCompleted ? `${palette.accent}60` : `${palette.primary}60`
        }]} />

        {/* Icon marker */}
        <View style={[styles.iconMarker, {
          backgroundColor: isCompleted ? `${palette.accent}20` : `${palette.primary}20`,
          borderColor: isCompleted ? `${palette.accent}60` : `${palette.primary}60`
        }]}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <Text style={[styles.achievementTitle, {
              color: isCompleted ? `${palette.accent}` : `${palette.primary}90`
            }]}>
              {title}
            </Text>
            {isCompleted && (
              <Text style={[styles.completedMark, { color: palette.accent }]}>✓</Text>
            )}
          </View>

          <Text style={styles.achievementDescription}>{description}</Text>

          {/* Progress pips */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { borderColor: `${palette.primary}20` }]}>
              {[...Array(total)].map((_, i) => {
                const isFilled = i < progress;
                return (
                  <View key={i} style={[styles.progressPip, {
                    backgroundColor: isFilled
                      ? (isCompleted ? palette.accent : palette.primary)
                      : 'rgba(26, 32, 40, 0.5)',
                    borderColor: isFilled
                      ? (isCompleted ? palette.accent : palette.primary)
                      : 'rgba(42, 48, 56, 0.8)',
                  }]} />
                );
              })}
            </View>
            <Text style={[styles.progressText, {
              color: isCompleted ? palette.accent : `${palette.primary}90`
            }]}>
              {progress}/{total} ({progressPercentage}%)
            </Text>
          </View>

          {/* Reward banner */}
          {reward && isCompleted && (
            <View style={[styles.rewardBanner, {
              backgroundColor: `${palette.accent}15`,
              borderColor: `${palette.accent}60`
            }]}>
              <Text style={[styles.rewardText, { color: palette.accent }]}>
                🏆 {reward}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Overall Progress Summary (Foundry-inspired)
  const ProgressSummary: React.FC = () => (
    <View style={[styles.summaryCard, {
      borderColor: `${palette.primary}60`,
      backgroundColor: '#0a0e14'
    }]}>
      {/* Corner ornaments (all 4 corners) */}
      <View style={[styles.cornerOrnamentTL, { borderColor: `${palette.primary}60` }]} />
      <View style={[styles.cornerOrnamentTR, { borderColor: `${palette.primary}60` }]} />
      <View style={[styles.cornerOrnamentBL, { borderColor: `${palette.primary}60` }]} />
      <View style={[styles.cornerOrnamentBR, { borderColor: `${palette.primary}60` }]} />

      {/* Character identity */}
      <View style={styles.identitySection}>
        <View style={[styles.avatarBox, {
          backgroundColor: `${palette.primary}15`,
          borderColor: `${palette.primary}60`
        }]}>
          <Text style={styles.avatarIcon}>{personalityConfig.avatar}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={[styles.scholarClass, { color: palette.primary }]}>
            {personalityConfig.scholarClass}
          </Text>
          <Text style={styles.archiveSection}>
            MASTER OF {personalityConfig.archiveSection.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: palette.primary }]}>
            {stats.completedStories}
          </Text>
          <Text style={styles.statLabel}>STORIES</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: palette.accent }]}>
            {stats.completedQuests}
          </Text>
          <Text style={styles.statLabel}>QUESTS</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: palette.secondary }]}>
            {stats.availableTools}
          </Text>
          <Text style={styles.statLabel}>TOOLS</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: `${palette.primary}90` }]}>
            {stats.journalEntries}
          </Text>
          <Text style={styles.statLabel}>ENTRIES</Text>
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
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      style={{
        backgroundColor: '#0a0b0f',
        flex: 1
      }}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={[styles.mainTitle, { color: palette.primary }]}>
          ARCHIVE OF RESTORATION
        </Text>
        <Text style={styles.curatorNote}>
          {personalityConfig.curatorNote}
        </Text>
      </View>

      {/* Overall Progress Summary */}
      <ProgressSummary />

      {/* Story Completion Section */}
      <View style={{ marginBottom: 24 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            📖 CHRONICLE MASTERY
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            🏆 SCHOLAR CHALLENGES
          </Text>
        </View>
        
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            🛠️ WISDOM ARSENAL
          </Text>
        </View>
        <CopingToolsCollection
          unlockedTools={userUnlockedTools}
          primaryTrait={primaryTrait}
          authToken={userProfile?.authToken}
          globalStyles={globalStyles}
        />
      </View>

      {/* Settings Section */}
      <View style={{ marginBottom: 24 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            ⚙️ ARCHIVE SETTINGS
          </Text>
        </View>
        
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            💚 MENTAL HEALTH SUPPORT
          </Text>
        </View>
        
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
                Linking.openURL(url).catch(() => {});
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
                Linking.openURL(url).catch(() => {});
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
                Linking.openURL(url).catch(() => {});
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
                Linking.openURL(url).catch(() => {});
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
      <View style={[styles.footerCard, {
        borderColor: `${palette.primary}40`,
        backgroundColor: '#0a0e14'
      }]}>
        <Text style={[styles.footerTitle, { color: palette.primary }]}>
          🌟 JOURNEY PROGRESS
        </Text>
        <Text style={styles.footerDesc}>
          {personalityConfig.journeyDesc}
        </Text>

        <View style={styles.runeRow}>
          {personalityConfig.backgroundRunes.map((rune: string, index: number) => (
            <Text key={index} style={styles.rune}>
              {rune}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Header styles
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  curatorNote: {
    fontSize: 13,
    color: 'rgba(199, 208, 224, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Section header styles
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // Summary card styles
  summaryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    position: 'relative',
  },
  cornerOrnamentTL: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  cornerOrnamentTR: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 8,
  },
  cornerOrnamentBL: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 8,
  },
  cornerOrnamentBR: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 8,
  },
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78, 230, 230, 0.15)',
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 32,
  },
  identityText: {
    flex: 1,
  },
  scholarClass: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  archiveSection: {
    fontSize: 11,
    color: 'rgba(199, 208, 224, 0.7)',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(199, 208, 224, 0.7)',
    letterSpacing: 0.8,
    fontWeight: '600',
  },

  // Achievement card styles
  achievementCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  cornerOrnament: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  iconMarker: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  achievementContent: {
    paddingRight: 50,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  completedMark: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  achievementDescription: {
    fontSize: 12,
    color: 'rgba(199, 208, 224, 0.7)',
    marginBottom: 10,
    lineHeight: 16,
  },
  progressSection: {
    marginTop: 4,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(10, 14, 20, 0.5)',
  },
  progressPip: {
    flex: 1,
    height: 6,
    borderRadius: 2,
    borderWidth: 1,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  rewardBanner: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Footer styles
  footerCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  footerDesc: {
    fontSize: 13,
    color: 'rgba(199, 208, 224, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  runeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rune: {
    fontSize: 20,
    opacity: 0.5,
  },
});
