import React from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  LinearGradient,
  Icon,
  Image,
} from "../../../imports";
import {
  uiIcons,
  MattAvatar,
  ReganAvatar,
  RowanAvatar,
  TrevorAvatar,
} from "../../../assets/ui";
import { CharacterDisplay } from "../components/CharacterDisplay";
import { GearSlot } from "../components/GearSlot";
import { FoundationCard } from "../components/FoundationCard";
import { getExperienceDisplay } from "../utils/experienceHelpers";
import { EquippedItems } from "../../../imports";
import { ProfileTabProps as BaseProfileTabProps } from "../../../types/characterHome";

interface ProfileTabProps extends BaseProfileTabProps {
  storyStyles: any;
  theme: any;
  router: any;
  stories: any[];
  journalStats: any;
  archive: any;
  isLoadingStories: boolean;
  apiService: any;
  ui: any;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  homeStyles,
  homeTheme,
  wellness,
  equipment,
  character,
  setShowEquipmentModal,
  openAttributeModal,
  wellnessStatsForDisplay,
  auth,
  params,
  isLoadingCharacterData,
  storyStyles,
  theme,
  router,
  stories,
  journalStats,
  archive,
  isLoadingStories,
  apiService,
  ui,
}) => {
  const getEquippedGearForSlot = (
    slot: "weapon" | "armor" | "helmet" | "boots"
  ) => {
    return equipment.equippedGear.find(
      (gear: any) => gear.gear_type.slot === slot
    );
  };

  const handleEquipmentPress = async () => {
    try {
      await equipment.loadBackendGear();
      setShowEquipmentModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to load equipment data. Please try again.");
    }
  };

  const handleFoundationPress = (foundation: any) => {
    openAttributeModal(foundation);
  };

  const leftGearSlots = [
    {
      type: "focus" as keyof EquippedItems,
      label: "Focus Item",
      icon: uiIcons.sectionIcons.staffwithgreengem,
      slot: "weapon" as const,
    },
    {
      type: "shield" as keyof EquippedItems,
      label: "Mind Shield",
      icon: uiIcons.sectionIcons.bluejewel,
      slot: "helmet" as const,
    },
  ];

  const rightGearSlots = [
    {
      type: "comfort" as keyof EquippedItems,
      label: "Comfort Layer",
      icon: uiIcons.sectionIcons.purplebottle,
      slot: "armor" as const,
    },
    {
      type: "ground" as keyof EquippedItems,
      label: "Ground Stone",
      icon: uiIcons.sectionIcons.bluegloveofthanos,
      slot: "boots" as const,
    },
  ];

  return (
    <View style={homeStyles.tabpassagesArea}>
      {/* Character Profile Section */}
      <View style={homeStyles.avatarShowcaseHeader}>
        <LinearGradient
          colors={[
            "rgba(10, 11, 15, 0.95)",
            "rgba(30, 41, 59, 0.8)",
            "rgba(10, 11, 15, 0.95)",
          ]}
          style={[
            homeStyles.archiveHeaderGradient,
            {
              borderColor: "#9e8532ff",
              borderWidth: 2,
              shadowColor: "#d4af37",
              shadowOffset: { width: 2, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
            },
          ]}
        >
          <View style={{ alignItems: "center" }}>
            {/* Experience Bar */}
            <View style={homeStyles.experienceProgressContainer}>
              <LinearGradient
                colors={["rgba(78, 230, 230, 0.8)", "rgba(6, 182, 212, 0.8)"]}
                style={homeStyles.experienceProgressGradient}
              >
                <Icon name="zap" size={14} color="#0a0b0f" />
                <Text style={homeStyles.experienceProgressText}>
                  {getExperienceDisplay(wellness)}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Character and Equipment Display */}
          <View style={homeStyles.characterDisplaySection}>
            {/* Left Gear Column */}
            <View style={homeStyles.gearColumnLeft}>
              {leftGearSlots.map((slot, i) => (
                <GearSlot
                  key={i}
                  slot={slot}
                  equippedGear={getEquippedGearForSlot(slot.slot)}
                  onPress={handleEquipmentPress}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
              ))}
            </View>

            {/* Character Display */}
            <CharacterDisplay
              wellness={wellness}
              character={character}
              homeStyles={homeStyles}
              isLoadingCharacterData={isLoadingCharacterData}
              params={params}
            />

            {/* Right Gear Column */}
            <View style={homeStyles.gearColumnRight}>
              {rightGearSlots.map((slot, i) => (
                <GearSlot
                  key={i}
                  slot={slot}
                  equippedGear={getEquippedGearForSlot(slot.slot)}
                  onPress={handleEquipmentPress}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Wellness Foundations Section */}
      <View style={homeStyles.foundationsSection}>
        <LinearGradient
          colors={[
            homeTheme.foundationCardGradientStart || "rgba(10, 11, 15, 0.95)",
            homeTheme.foundationCardGradientMiddle || "rgba(30, 41, 59, 0.8)",
            homeTheme.foundationCardGradientEnd || "rgba(10, 11, 15, 0.95)",
          ]}
          style={homeStyles.foundationsSectionGradient}
        >
          <View style={homeStyles.foundationsHeader}>
            <Icon name="anchor" size={20} color="#4ee6e6" />
            <Text style={homeStyles.foundationsTitle}>
              Moments of Reflection
            </Text>
            <Icon name="anchor" size={20} color="#4ee6e6" />
          </View>
          <Text style={homeStyles.foundationsSubtitle}>
            The ethereal pillars that support your mental architecture
          </Text>

          <View style={homeStyles.foundationsGrid}>
            {wellnessStatsForDisplay.map((foundation: any, index: number) => (
              <FoundationCard
                key={index}
                foundation={foundation}
                index={index}
                homeStyles={homeStyles}
                homeTheme={homeTheme}
                onPress={handleFoundationPress}
              />
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Progress & Statistics Section */}
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
          {/* Story Progress Section */}
          <View style={homeStyles.foundationsSection}>
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.95)",
                "rgba(30, 41, 59, 0.8)",
                "rgba(10, 11, 15, 0.95)",
              ]}
              style={[
                homeStyles.foundationsSectionGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <View style={homeStyles.foundationsHeader}>
                <Icon name="book-open" size={20} color="#4ee6e6" />
                <Text
                  style={{
                    ...homeStyles.foundationsTitle,
                    color: "rgba(78, 230, 230, 0.8)",
                    fontSize: 20,
                    fontWeight: "600",
                    letterSpacing: 2,
                    textShadowColor: "rgba(78, 230, 230, 0.3)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Your Journey Progress
                </Text>
                <Icon name="book-open" size={20} color="#4ee6e6" />
              </View>
              <Text
                style={{
                  ...homeStyles.foundationsSubtitle,
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 16,
                  textShadowColor: "rgba(212, 175, 55, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Track your progress through stories, reflections, and personal
                growth
              </Text>

              <View style={homeStyles.foundationsGrid}>
                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const completedCount = stories.filter(
                      (story) => story.exploration >= 100
                    ).length;
                    const totalStories = stories.length;
                    const completionRate =
                      totalStories > 0
                        ? Math.round((completedCount / totalStories) * 100)
                        : 0;
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "rgba(78, 230, 230, 0.4)",
                        borderWidth: 1,
                        shadowColor: "rgba(78, 230, 230, 0.2)",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>🏆</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {
                          stories.filter((story) => story.exploration >= 100)
                            .length
                        }
                        <Text style={homeStyles.foundationMaxValue}>
                          /{stories.length}
                        </Text>
                      </Text>
                      <Text style={homeStyles.foundationLevel}>
                        {stories.length > 0
                          ? Math.round(
                              (stories.filter(
                                (story) => story.exploration >= 100
                              ).length /
                                stories.length) *
                                100
                            )
                          : 0}
                        % Complete
                      </Text>
                    </View>
                    <View style={homeStyles.foundationProgressContainer}>
                      <View style={homeStyles.foundationProgressBar}>
                        <LinearGradient
                          colors={["#10B981", "#059669"]}
                          style={[
                            homeStyles.foundationProgressFill,
                            {
                              width: `${
                                stories.length > 0
                                  ? (stories.filter(
                                      (story) => story.exploration >= 100
                                    ).length /
                                      stories.length) *
                                    100
                                  : 0
                              }%`,
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
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const journalEntries =
                      journalStats?.entries_by_type?.journal || 0;
                    const drawEntries =
                      journalStats?.entries_by_type?.draw || 0;
                    const voiceEntries =
                      journalStats?.entries_by_type?.voice || 0;
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>📝</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {journalStats?.total_entries || 0}
                      </Text>
                      <Text style={homeStyles.foundationLevel}>
                        Total Entries
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>Reflections</Text>
                    <Text style={homeStyles.foundationDescription}>
                      Your captured thoughts and insights
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const totalRevelations = stories.reduce(
                      (total, story) => total + (story.revelations || 0),
                      0
                    );
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>✨</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {stories.reduce(
                          (total, story) => total + (story.revelations || 0),
                          0
                        )}
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
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const totalChapters = stories.reduce(
                      (total, story) => total + (story.chapter_count || 0),
                      0
                    );
                    const exploredChapters = stories.reduce((total, story) => {
                      if (story.exploration > 0) {
                        // Estimate chapters explored based on progress
                        const chaptersExplored = Math.ceil(
                          (story.exploration / 100) * (story.chapter_count || 1)
                        );
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "rgba(78, 230, 230, 0.4)",
                        borderWidth: 1,
                        shadowColor: "rgba(78, 230, 230, 0.2)",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>📖</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {stories.reduce((total, story) => {
                          if (story.exploration > 0) {
                            const chaptersExplored = Math.ceil(
                              (story.exploration / 100) *
                                (story.chapter_count || 1)
                            );
                            return total + chaptersExplored;
                          }
                          return total;
                        }, 0)}
                        <Text style={homeStyles.foundationMaxValue}>
                          /
                          {stories.reduce(
                            (total, story) =>
                              total + (story.chapter_count || 0),
                            0
                          )}
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
                                const totalChapters = stories.reduce(
                                  (total, story) =>
                                    total + (story.chapter_count || 0),
                                  0
                                );
                                const exploredChapters = stories.reduce(
                                  (total, story) => {
                                    if (story.exploration > 0) {
                                      const chaptersExplored = Math.ceil(
                                        (story.exploration / 100) *
                                          (story.chapter_count || 1)
                                      );
                                      return total + chaptersExplored;
                                    }
                                    return total;
                                  },
                                  0
                                );
                                return totalChapters > 0
                                  ? (exploredChapters / totalChapters) * 100
                                  : 0;
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
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Journal Progress Section */}
          <View style={homeStyles.foundationsSection}>
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.95)",
                "rgba(30, 41, 59, 0.8)",
                "rgba(10, 11, 15, 0.95)",
              ]}
              style={[
                homeStyles.foundationsSectionGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <View style={homeStyles.foundationsHeader}>
                <Icon name="edit-3" size={20} color="#4ee6e6" />
                <Text
                  style={{
                    ...homeStyles.foundationsTitle,
                    color: "#4ee6e6",
                    fontSize: 20,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textShadowColor: "rgba(78, 230, 230, 0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Journal Progress
                </Text>
                <Icon name="edit-3" size={20} color="#4ee6e6" />
              </View>
              <Text
                style={{
                  ...homeStyles.foundationsSubtitle,
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 16,
                  textShadowColor: "rgba(212, 175, 55, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Your reflections and insights captured in the Archive
              </Text>

              <View style={homeStyles.foundationsGrid}>
                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={async () => {
                    try {
                      // Get the latest journal entries from API
                      const entries = await apiService.getMyCodexEntries();
                      const journalEntries = entries.filter(
                        (entry: any) => entry.entry_type === "journal"
                      );
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>✨</Text>
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
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const drawEntries =
                      journalStats?.entries_by_type?.draw || 0;
                    const voiceEntries =
                      journalStats?.entries_by_type?.voice || 0;
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>🎨</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {(journalStats?.entries_by_type?.draw || 0) +
                          (journalStats?.entries_by_type?.voice || 0)}
                      </Text>
                      <Text style={homeStyles.foundationLevel}>
                        Artistic Expression
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>
                      Creative Works
                    </Text>
                    <Text style={homeStyles.foundationDescription}>
                      Your drawings and voice recordings
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    const streakDays = journalStats?.streak_days || 0;
                    const totalEntries = journalStats?.total_entries || 0;
                    Alert.alert(
                      "Reflection Streak",
                      `Current streak: ${streakDays} days\nTotal entries: ${totalEntries}\n\nKeep up the great work on your self-reflection journey!`,
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationIconContainer}>
                      <Text style={homeStyles.foundationIcon}>🔥</Text>
                    </View>
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationValue}>
                        {journalStats?.streak_days || 0}
                      </Text>
                      <Text style={homeStyles.foundationLevel}>Day Streak</Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>Consistency</Text>
                    <Text style={homeStyles.foundationDescription}>
                      Your dedication to self-reflection
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Archive Settings Section */}
          <View style={homeStyles.foundationsSection}>
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.95)",
                "rgba(30, 41, 59, 0.8)",
                "rgba(10, 11, 15, 0.95)",
              ]}
              style={[
                homeStyles.foundationsSectionGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <View style={homeStyles.foundationsHeader}>
                <Icon name="settings" size={20} color="#4ee6e6" />
                <Text
                  style={{
                    ...homeStyles.foundationsTitle,
                    color: "#4ee6e6",
                    fontSize: 20,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textShadowColor: "rgba(78, 230, 230, 0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Archive Settings
                </Text>
                <Icon name="settings" size={20} color="#4ee6e6" />
              </View>
              <Text
                style={{
                  ...homeStyles.foundationsSubtitle,
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 16,
                  textShadowColor: "rgba(212, 175, 55, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Customize your journey through The Archive
              </Text>

              <View
                style={[
                  homeStyles.foundationsGrid,
                  {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#2a8a8a",
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 2,
                    borderColor: "#2a8a8a",
                    shadowColor: "#2a8a8a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginBottom: 8,
                    width: "48%",
                    minHeight: 50,
                  }}
                  onPress={() => {
                    Alert.alert("Settings", "Profile settings coming soon!");
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Profile Settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#2a8a8a",
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 2,
                    borderColor: "#2a8a8a",
                    shadowColor: "#2a8a8a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginBottom: 8,
                    width: "48%",
                    minHeight: 50,
                  }}
                  onPress={() => {
                    router.push("/(auth)/login");
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Sign Out
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
              style={[
                homeStyles.foundationsSectionGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <View style={homeStyles.foundationsHeader}>
                <Icon name="heart" size={20} color="#4ee6e6" />
                <Text
                  style={{
                    ...homeStyles.foundationsTitle,
                    color: "#4ee6e6",
                    fontSize: 20,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textShadowColor: "rgba(78, 230, 230, 0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Mental Health Support
                </Text>
                <Icon name="heart" size={20} color="#4ee6e6" />
              </View>
              <Text
                style={{
                  ...homeStyles.foundationsSubtitle,
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 16,
                  textShadowColor: "rgba(212, 175, 55, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                If you're struggling, these resources are here to help
              </Text>

              <View style={homeStyles.foundationsGrid}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#2a8a8a",
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderWidth: 2,
                    borderColor: "#2a8a8a",
                    shadowColor: "#2a8a8a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginBottom: 8,
                    width: "48%",
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Crisis Support",
                      "If you're in crisis, please contact your local emergency services or a mental health crisis line."
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Crisis Support
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#2a8a8a",
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderWidth: 2,
                    borderColor: "#2a8a8a",
                    shadowColor: "#2a8a8a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginBottom: 8,
                    width: "48%",
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Resources",
                      "Mental health resources and professional help information coming soon."
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Find Help
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
              style={[
                homeStyles.foundationsSectionGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <View style={homeStyles.foundationsHeader}>
                <Icon name="users" size={20} color="#4ee6e6" />
                <Text
                  style={{
                    ...homeStyles.foundationsTitle,
                    color: "#4ee6e6",
                    fontSize: 20,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textShadowColor: "rgba(78, 230, 230, 0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Game Credits
                </Text>
                <Icon name="users" size={20} color="#4ee6e6" />
              </View>
              <Text
                style={{
                  ...homeStyles.foundationsSubtitle,
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 16,
                  textShadowColor: "rgba(212, 175, 55, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "rgba(139, 92, 246, 0.6)",
                        borderWidth: 2,
                        shadowColor: "rgba(139, 92, 246, 0.4)",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationLevel}>
                        🖋️ Master of Tales
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>
                      Story Writer:{"\n"}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={MattAvatar}
                        style={{
                          width: 48,
                          height: 48,
                          marginRight: 8,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(78, 230, 230, 0.3)",
                        }}
                        resizeMode="cover"
                      />
                      <Text
                        style={[
                          homeStyles.foundationDescription,
                          {
                            color: "#4ee6e6",
                            fontSize: 14,
                            fontWeight: "500",
                          },
                        ]}
                      >
                        Matthew Wilson
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationDescription}>
                      Crafted immersive narratives for your journey
                    </Text>
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(139, 92, 246, 0.8)",
                        shadowColor: "rgba(139, 92, 246, 0.5)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.foundationCard}
                  onPress={() => {
                    Alert.alert(
                      "⚔️ Code Guardians",
                      "Three skilled developers who transformed ideas into reality. They built the magical systems, crafted the user experience, and ensured every interaction feels smooth and engaging. Their dedication brought The Archive's mystical atmosphere to life.",
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "rgba(34, 197, 94, 0.6)",
                        borderWidth: 2,
                        shadowColor: "rgba(34, 197, 94, 0.4)",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationLevel}>
                        ⚔️ Code Guardians
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>
                      Development Team:
                    </Text>

                    <View
                      style={{
                        width: "100%",
                        alignItems: "center",
                        marginTop: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={ReganAvatar}
                          style={{
                            width: 32,
                            height: 32,
                            marginRight: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(78, 230, 230, 0.3)",
                          }}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            homeStyles.foundationDescription,
                            {
                              color: "#4ee6e6",
                              fontSize: 12,
                              fontWeight: "500",
                            },
                          ]}
                        >
                          Regan Gross
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={TrevorAvatar}
                          style={{
                            width: 32,
                            height: 32,
                            marginRight: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(78, 230, 230, 0.3)",
                          }}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            homeStyles.foundationDescription,
                            {
                              color: "#4ee6e6",
                              fontSize: 12,
                              fontWeight: "500",
                            },
                          ]}
                        >
                          Trevor Schmidt
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={RowanAvatar}
                          style={{
                            width: 32,
                            height: 32,
                            marginRight: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(78, 230, 230, 0.3)",
                          }}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            homeStyles.foundationDescription,
                            {
                              color: "#4ee6e6",
                              fontSize: 12,
                              fontWeight: "500",
                            },
                          ]}
                        >
                          Rowan Stratton
                        </Text>
                      </View>
                    </View>

                    <Text style={homeStyles.foundationDescription}>
                      Built the magical systems that power The Archive
                    </Text>
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(34, 197, 94, 0.8)",
                        shadowColor: "rgba(34, 197, 94, 0.5)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    />
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "rgba(251, 146, 60, 0.6)",
                        borderWidth: 2,
                        shadowColor: "rgba(251, 146, 60, 0.4)",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationLevel}>
                        🧙 Wise Mentor
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>
                      Faculty Advisor:{"\n"}
                      Dr. Jomara Sandbulte
                    </Text>
                    <Text style={homeStyles.foundationDescription}>
                      Provided guidance and wisdom throughout the quest
                    </Text>
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(251, 146, 60, 0.8)",
                        shadowColor: "rgba(251, 146, 60, 0.5)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    />
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
                    style={[
                      homeStyles.foundationCardGradient,
                      {
                        borderColor: "#4ee6e6",
                        borderWidth: 2,
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                  >
                    <View style={homeStyles.foundationValueContainer}>
                      <Text style={homeStyles.foundationLevel}>
                        🏛️ Origins & Assets
                      </Text>
                    </View>
                    <Text style={homeStyles.foundationLabel}>
                      HCI Lab{"\n"}Itch.io
                    </Text>
                    <Text style={homeStyles.foundationDescription}>
                      Research foundation and artistic contributions
                    </Text>
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#4ee6e6",
                        shadowColor: "#4ee6e6",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  marginTop: 16,
                  padding: 16,
                  backgroundColor: "rgba(78, 230, 230, 0.1)",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(78, 230, 230, 0.3)",
                }}
              >
                <Text
                  style={{
                    color: "#4ee6e6",
                    fontSize: 16,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 8,
                    letterSpacing: 1,
                    textShadowColor: "rgba(78, 230, 230, 0.3)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  ✨ A Special Thanks ✨
                </Text>
                <Text
                  style={{
                    color: "#d4af37",
                    fontSize: 14,
                    fontStyle: "italic",
                    textAlign: "center",
                    lineHeight: 20,
                    textShadowColor: "rgba(212, 175, 55, 0.3)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  To every explorer who ventures into The Archive, your journey
                  matters. This project exists to support your wellness
                  adventure, and we're honored to be part of your story of
                  growth and discovery.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </>
      )}
    </View>
  );
};
