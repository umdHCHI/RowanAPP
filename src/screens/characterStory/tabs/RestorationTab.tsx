import React from 'react';
import { Linking } from 'react-native';
import { MattAvatar, ReganAvatar, RowanAvatar, TrevorAvatar } from '../../../assets/ui';
import { Alert, Icon, Image, LinearGradient, Text, TouchableOpacity, View } from '../../../imports';
import { calculateOverallArchiveProgress } from '../utils/foundationHelpers';

interface RestorationTabProps {
  homeStyles: any;
  storyStyles: any;
  homeTheme: any;
  theme: any;
  wellness: any;
  auth: any;
  router: any;
  stories: any[];
  journalStats: any;
  archive: any;
  isLoadingStories: boolean;
  apiService: any;
  ui: any;
}

export const RestorationTab: React.FC<RestorationTabProps> = ({
  homeStyles,
  storyStyles,
  theme,
  auth,
  router,
  stories,
  journalStats,
  archive,
  isLoadingStories,
  ui,
  apiService
}) => {

  return (
    <>
      {ui.activeTab === "restoration" && (
        <View style={homeStyles.archiveTabpassagesArea}>
          {isLoadingStories ? (
            <View style={storyStyles.centeredMessageContainer}>
              <Icon
                name="loader"
                size={40}
                color="#A855F7"
                style={{ marginBottom: 16 }}
              />
              <Text style={storyStyles.centeredMessageTitle}>
                Loading Archive Data...
              </Text>
              <Text style={storyStyles.centeredMessageText}>
                Retrieving your journey statistics from the Archive...
              </Text>
            </View>
          ) : (
            <>
              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="book-open" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: 'rgba(78, 230, 230, 0.8)',
                      fontSize: 20,
                      fontWeight: '600',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      Story Progress
                    </Text>
                    <Icon name="book-open" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Your journey through the ancient stories
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const completedCount = stories.filter(story => story.exploration >= 100).length;
                        const totalStories = stories.length;
                        const completionRate = totalStories > 0 ? Math.round((completedCount / totalStories) * 100) : 0;
                        Alert.alert(
                          "Stories Completed",
                          `You have completed ${completedCount} out of ${totalStories} available stories.\n\nCompletion Rate: ${completionRate}%`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: 'rgba(78, 230, 230, 0.4)',
                          borderWidth: 1,
                          shadowColor: 'rgba(78, 230, 230, 0.2)',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🏆
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {stories.filter(story => story.exploration >= 100).length}
                            <Text style={homeStyles.foundationMaxValue}>
                              /{stories.length}
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            {stories.length > 0 ? Math.round((stories.filter(story => story.exploration >= 100).length / stories.length) * 100) : 0}% Complete
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#10B981", "#059669"]}
                              style={[
                                homeStyles.foundationProgressFill,
                                {
                                  width: `${stories.length > 0 ? (stories.filter(story => story.exploration >= 100).length / stories.length) * 100 : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Stories Completed
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Tales you've fully explored and mastered
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(78, 230, 230, 0.6)',
                          shadowColor: 'rgba(78, 230, 230, 0.3)',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.4,
                          shadowRadius: 2,
                          elevation: 2,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                        const exploredChapters = stories.reduce((total, story) => {
                          if (story.exploration > 0) {
                            // Estimate chapters explored based on progress
                            const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                            return total + chaptersExplored;
                          }
                          return total;
                        }, 0);
                        Alert.alert(
                          "Chapters Explored",
                          `You have explored approximately ${exploredChapters} out of ${totalChapters} total chapters across all stories.`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: 'rgba(78, 230, 230, 0.4)',
                          borderWidth: 1,
                          shadowColor: 'rgba(78, 230, 230, 0.2)',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            📖
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {stories.reduce((total, story) => {
                              if (story.exploration > 0) {
                                const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                return total + chaptersExplored;
                              }
                              return total;
                            }, 0)}
                            <Text style={homeStyles.foundationMaxValue}>
                              /{stories.reduce((total, story) => total + (story.chapter_count || 0), 0)}
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Chapters Explored
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#06B6D4", "#0891B2"]}
                              style={[
                                homeStyles.foundationProgressFill,
                                {
                                  width: `${(() => {
                                    const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                                    const exploredChapters = stories.reduce((total, story) => {
                                      if (story.exploration > 0) {
                                        const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                        return total + chaptersExplored;
                                      }
                                      return total;
                                    }, 0);
                                    return totalChapters > 0 ? (exploredChapters / totalChapters) * 100 : 0;
                                  })()}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Chapters Explored
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Story chapters you've ventured through
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(78, 230, 230, 0.6)',
                          shadowColor: 'rgba(78, 230, 230, 0.3)',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.4,
                          shadowRadius: 2,
                          elevation: 2,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const totalRevelations = stories.reduce((total, story) => total + (story.revelations || 0), 0);
                        Alert.alert(
                          "Revelations Unlocked",
                          `You have unlocked ${totalRevelations} profound revelations across all your story explorations.`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            ✨
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {stories.reduce((total, story) => total + (story.revelations || 0), 0)}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Revelations Found
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Hidden Truths
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Profound insights you've discovered
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="edit-3" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                      Journal Progress
                    </Text>
                    <Icon name="edit-3" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Your reflections and insights captured in the Archive
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const journalEntries = journalStats?.entries_by_type?.journal || 0;
                        const drawEntries = journalStats?.entries_by_type?.draw || 0;
                        const voiceEntries = journalStats?.entries_by_type?.voice || 0;
                        const totalEntries = journalStats?.total_entries || 0;
                        const streakDays = journalStats?.streak_days || 0;

                        Alert.alert(
                          "Journal Entries",
                          `📝 Journal entries: ${journalEntries}\n🎨 Drawing entries: ${drawEntries}\n🎤 Voice entries: ${voiceEntries}\n\nTotal entries: ${totalEntries}\nCurrent streak: ${streakDays} days`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            📝
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {journalStats?.total_entries || 0}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Total Entries
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Reflections
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Your captured thoughts and insights
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={async () => {
                        try {
                          // Get the latest journal entries from API
                          const entries = await apiService.getMyCodexEntries();
                          const journalEntries = entries.filter((entry: any) => entry.entry_type === 'journal');
                          const latestEntry = journalEntries[0];

                          if (latestEntry) {
                            Alert.alert(
                              "Latest Journal Entry",
                              `"${latestEntry.prompt_text}"`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          } else {
                            Alert.alert(
                              "No Journal Entries",
                              "You haven't written any journal entries yet. Start reflecting to capture your thoughts!",
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }
                        } catch (error) {
                          Alert.alert(
                            "Error",
                            "Could not load journal entries. Please try again.",
                            [{ text: "OK", style: "default" }]
                          );
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            ✨
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {journalStats?.entries_by_type?.journal || 0}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Journal Entries
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Written Reflections
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Your thoughts captured in words
                        </Text>
                        {/* Interactive Indicator */}
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const drawEntries = journalStats?.entries_by_type?.draw || 0;
                        const voiceEntries = journalStats?.entries_by_type?.voice || 0;
                        const totalCreative = drawEntries + voiceEntries;
                        const totalEntries = journalStats?.total_entries || 0;
                        const streakDays = journalStats?.streak_days || 0;

                        Alert.alert(
                          "Creative Expressions",
                          `🎨 Drawing entries: ${drawEntries}\n🎤 Voice entries: ${voiceEntries}\n\nTotal creative expressions: ${totalCreative}\nTotal journal entries: ${totalEntries}\nCurrent streak: ${streakDays} days`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🎨
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {(journalStats?.entries_by_type?.draw || 0) + (journalStats?.entries_by_type?.voice || 0)}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Artistic Expression
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Your drawings and voice recordings
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Creative works captured in the Archive
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="archive" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                      Archive Progress
                    </Text>
                    <Icon name="archive" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Your discoveries and insights within the Archive
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const progressData = calculateOverallArchiveProgress(stories, archive);

                        Alert.alert(
                          "Overall Progress",
                          `Archive Progress: ${progressData.overallProgress}%\n\nStories with progress: ${progressData.storiesWithProgress}/${progressData.totalStories}\nCompleted stories: ${progressData.completedStories}\nAverage progress: ${progressData.averageProgress}%`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            📊
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {calculateOverallArchiveProgress(stories, archive).overallProgress}%
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Archive Progress
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Overall Progress
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Your journey through all stories
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const progressData = calculateOverallArchiveProgress(stories, archive);
                        const storiesInProgress = progressData.storiesWithProgress - progressData.completedStories;

                        Alert.alert(
                          "Active Explorations",
                          `Stories in progress: ${storiesInProgress}\n\nStories with progress: ${progressData.storiesWithProgress}\nCompleted stories: ${progressData.completedStories}\nTotal stories: ${progressData.totalStories}`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🔄
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {(() => {
                              const progressData = calculateOverallArchiveProgress(stories, archive);
                              return Math.max(0, progressData.storiesWithProgress - progressData.completedStories);
                            })()}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            In Progress
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Active Explorations
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Stories you're currently exploring
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        const progressData = calculateOverallArchiveProgress(stories, archive);
                        const unstartedStories = progressData.totalStories - progressData.storiesWithProgress;
                        const memoriesExplored = archive.codexEntries?.length || 0;
                        const artifactsDiscovered = archive.discoveredArtifacts?.length || 0;

                        Alert.alert(
                          "Archive Discoveries",
                          `Unstarted stories: ${unstartedStories}\n\nCodex entries: ${memoriesExplored}\nArtifacts discovered: ${artifactsDiscovered}\n\nBegin your journey to unlock new wisdom!`,
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🔓
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            {archive.codexEntries?.length || 0}
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Codex Entries
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Archive Discoveries
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Entries you've created in the Archive
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="settings" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                      Archive Settings
                    </Text>
                    <Icon name="settings" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Customize your journey through The Archive
                  </Text>

                  <View style={[homeStyles.foundationsGrid, {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                  }]}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                        marginBottom: 8,
                        width: '48%',
                        minHeight: 50,
                      }}
                      onPress={() => {
                        try {
                          router.push('/(onboarding)/character-creator');
                        } catch (error) {
                          Alert.alert('Navigation Error', `Failed to navigate: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                        Customize Avatar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                        marginBottom: 8,
                        width: '48%',
                        minHeight: 50,
                      }}
                      onPress={() => {
                        theme.toggleTheme();
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
                        {theme.themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                        marginBottom: 8,
                        width: '48%',
                        minHeight: 50,
                      }}
                      onPress={() => {
                        if (auth && auth.logout) {
                          try {
                            auth.logout();
                          } catch (error) {
                            Alert.alert('Logout Error', `Failed to logout: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        } else {
                          Alert.alert('Error', 'Logout function not available');
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
                        Leave Archive
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {/* Mental Health Resources Section */}
              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="heart" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                      Mental Health Support
                    </Text>
                    <Icon name="heart" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    If you're struggling, these resources are here to help
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 8,
                        paddingHorizontal: 18,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
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
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 8,
                        paddingHorizontal: 18,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
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
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 8,
                        paddingHorizontal: 18,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                        marginBottom: 8,
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
                        backgroundColor: '#2a8a8a',
                        borderRadius: 20,
                        paddingVertical: 8,
                        paddingHorizontal: 18,
                        borderWidth: 2,
                        borderColor: '#2a8a8a',
                        shadowColor: '#2a8a8a',
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
                </LinearGradient>
              </View>

              {/* Game Credits Section */}
              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="users" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...homeStyles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                     -- Game Credits --
                    </Text>
                    <Icon name="users" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...homeStyles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                    textShadowColor: 'rgba(212, 175, 55, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    The brave souls who brought this adventure to life
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        Alert.alert(
                          "🖋️ Master of Tales",
                          "Our talented story writer crafted the immersive narratives and compelling characters that guide your journey through The Archive. Every choice, every revelation, and every moment of discovery was carefully woven to support your wellness adventure.",
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: 'rgba(139, 92, 246, 0.6)',
                          borderWidth: 2,
                          shadowColor: 'rgba(139, 92, 246, 0.4)',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationLevel}>
                            🖋️ Master of Tales
                          </Text>

                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Story Writer:{'\n'}
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                          width: '100%',
                          justifyContent: 'center',
                        }}>
                          <Image
                            source={MattAvatar}
                            style={{
                              width: 48,
                              height: 48,
                              marginRight: 8,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: 'rgba(78, 230, 230, 0.3)',
                            }}
                            resizeMode="cover"
                          />
                          <Text style={[homeStyles.foundationDescription, {
                            color: '#4ee6e6',
                            fontSize: 14,
                            fontWeight: '500',
                          }]}>
                            Matthew Wilson
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationDescription}>
                          Crafted immersive narratives for your journey
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(139, 92, 246, 0.8)',
                          shadowColor: 'rgba(139, 92, 246, 0.5)',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        Alert.alert(
                          "⚔️ Code Guardians",
                          "Two skilled developers who transformed ideas into reality. They built the magical systems, crafted the user experience, and ensured every interaction feels smooth and engaging. Their dedication brought The Archive's mystical atmosphere to life.",
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: 'rgba(34, 197, 94, 0.6)',
                          borderWidth: 2,
                          shadowColor: 'rgba(34, 197, 94, 0.4)',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationLevel}>
                            ⚔️ Code Guardians
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Development Team:
                        </Text>

                        <View style={{
                          width: '100%',
                          alignItems: 'center',
                          marginTop: 8,
                          marginBottom: 8,
                        }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 6,
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                            <Image
                              source={ReganAvatar}
                              style={{
                                width: 32,
                                height: 32,
                                marginRight: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'rgba(78, 230, 230, 0.3)',
                              }}
                              resizeMode="cover"
                            />
                            <Text style={[homeStyles.foundationDescription, {
                              color: '#4ee6e6',
                              fontSize: 12,
                              fontWeight: '500',
                            }]}>
                              Regan Gross
                            </Text>
                          </View>

                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 6,
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                            <Image
                              source={TrevorAvatar}
                              style={{
                                width: 32,
                                height: 32,
                                marginRight: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'rgba(78, 230, 230, 0.3)',
                              }}
                              resizeMode="cover"
                            />
                            <Text style={[homeStyles.foundationDescription, {
                              color: '#4ee6e6',
                              fontSize: 12,
                              fontWeight: '500',
                            }]}>
                              Trevor Schmidt
                            </Text>
                          </View>

                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 6,
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                            <Image
                              source={RowanAvatar}
                              style={{
                                width: 32,
                                height: 32,
                                marginRight: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'rgba(78, 230, 230, 0.3)',
                              }}
                              resizeMode="cover"
                            />
                            <Text style={[homeStyles.foundationDescription, {
                              color: '#4ee6e6',
                              fontSize: 12,
                              fontWeight: '500',
                            }]}>
                              Rowan Stratton
                            </Text>
                          </View>
                        </View>

                        <Text style={homeStyles.foundationDescription}>
                          Built the magical systems that power The Archive
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(34, 197, 94, 0.8)',
                          shadowColor: 'rgba(34, 197, 94, 0.5)',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        Alert.alert(
                          "🧙 Wise Mentor",
                          "Our faculty advisor provided invaluable guidance, ensuring this project meets the highest academic standards while remaining true to its mission of supporting mental wellness. Their wisdom shaped both the research foundation and practical implementation.",
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: 'rgba(251, 146, 60, 0.6)',
                          borderWidth: 2,
                          shadowColor: 'rgba(251, 146, 60, 0.4)',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationLevel}>
                            🧙 Wise Mentor
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Faculty Advisor:{'\n'}
                          Dr. Jomara Sandbulte
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Provided guidance and wisdom throughout the quest
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(251, 146, 60, 0.8)',
                          shadowColor: 'rgba(251, 146, 60, 0.5)',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => {
                        Alert.alert(
                          "🏛️ The Archive Origins",
                          "Born in the Human Computer Interaction Laboratory, this project represents cutting-edge research in digital wellness tools. Visual assets and creative elements were sourced from talented artists on Itch.io, bringing depth and beauty to your adventure.",
                          [{ text: "Continue Exploring", style: "default" }]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#4ee6e6',
                          borderWidth: 2,
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }]}
                      >
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationLevel}>
                            🏛️ Origins & Assets
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          HCI Lab{'\n'}Itch.io
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Research foundation and artistic contributions
                        </Text>
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#4ee6e6',
                          shadowColor: '#4ee6e6',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 4,
                        }} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={{
                    marginTop: 16,
                    padding: 16,
                    backgroundColor: 'rgba(78, 230, 230, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.3)',
                  }}>
                    <Text style={{
                      color: '#4ee6e6',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: 8,
                      letterSpacing: 1,
                      textShadowColor: 'rgba(78, 230, 230, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      ✨ A Special Thanks ✨
                    </Text>
                    <Text style={{
                      color: '#d4af37',
                      fontSize: 14,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      lineHeight: 20,
                      textShadowColor: 'rgba(212, 175, 55, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      To every explorer who ventures into The Archive, your journey matters.
                      This project exists to support your wellness adventure, and we're honored
                      to be part of your story of growth and discovery.
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </>
          )}
        </View>
      )}
    </>
  );
};
