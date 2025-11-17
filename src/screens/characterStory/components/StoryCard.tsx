import React from 'react';
import {
  BlurView,
  Icon,
  LinearGradient,
  Text,
  TouchableOpacity,
  View
} from '../../../imports';
import { Story } from '../../../types';
import { getRarityColors } from '../utils/storyHelpers';

interface StoryCardProps {
  story: Story;
  progress: any;
  onSelect: () => void;
  globalStyles: any;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  progress,
  onSelect,
  globalStyles
}) => {
  const isCompleted = progress?.is_completed || false;
  const progressPercentage = progress?.progress_percentage || 0;
  const lastPlayed = progress?.last_played;
  const hasProgress = !!progress;
  const passagesVisited = progress?.passages_visited_count || 0;
  const choicesMade = progress?.choices_made_count || 0;
  const completedAt = progress?.completed_at;

  return (
    <TouchableOpacity
      style={[globalStyles.StoryCard, { opacity: story.isLocked ? 0.6 : 1 }]}
      onPress={() => !story.isLocked && onSelect()}
      activeOpacity={story.isLocked ? 1 : 0.8}
      disabled={story.isLocked}
    >
      <LinearGradient
        colors={[
          "rgba(10, 11, 15, 0.95)",
          "rgba(30, 41, 59, 0.8)",
          "rgba(10, 11, 15, 0.95)",
        ]}
        style={[globalStyles.StoryCardGradient, {
          borderColor: '#d4af37',
          borderWidth: 1,
          shadowColor: '#d4af37',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }]}
      >
        <BlurView intensity={10} style={globalStyles.StoryCardBlur}>
          <LinearGradient
            colors={getRarityColors(story.rarity || "Common")}
            style={globalStyles.StoryRarityBorder}
          />

          {story.isLocked && (
            <View style={globalStyles.StoryLockOverlay}>
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.6)"]}
                style={globalStyles.StoryLockGradient}
              >
                <Icon name="lock" size={24} color="#A855F7" />
                <Text
                  style={[globalStyles.StoryLockText, { color: "#A855F7" }]}
                >
                  Level {story.unlockLevel || 1} Required
                </Text>
              </LinearGradient>
            </View>
          )}

          <View style={globalStyles.StoryCardHeader}>
            <View style={globalStyles.StoryTitleSection}>
              <Text style={[globalStyles.StoryCardTitle, {
                color: "#4ee6e6",
                fontSize: 18,
                fontWeight: 'bold',
                textShadowColor: 'rgba(78, 230, 230, 0.5)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }]}>
                {story.title || "Untitled Story"}
              </Text>
              <Text
                style={[globalStyles.StoryCardCategory, {
                  color: "#d4af37",
                  fontSize: 14,
                  fontStyle: 'italic',
                  fontWeight: '600',
                }]}
              >
                {story.category || "Unknown Category"}
              </Text>
            </View>

            <View style={globalStyles.StoryRarityBadge}>
              <LinearGradient
                colors={getRarityColors(story.rarity || "Common")}
                style={globalStyles.StoryRarityBadgeGradient}
              >
                <Text style={globalStyles.StoryRarityBadgeText}>
                  {story.rarity || "Common"}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {hasProgress && (
            <View style={globalStyles.StoryProgressSection}>
              <View style={globalStyles.StoryProgressHeader}>
                <Icon name="compass" size={12} color="#06B6D4" />
                <Text
                  style={[
                    globalStyles.StoryProgressLabel,
                    { color: "#06B6D4" },
                  ]}
                >
                  {isCompleted ? "✅ Completed" : `📖 Progress: ${Math.round(progressPercentage)}%`}
                </Text>
              </View>
              <View style={globalStyles.StoryProgressBar}>
                <LinearGradient
                  colors={isCompleted ? ["#10B981", "#059669"] : ["#06B6D4", "#A855F7"]}
                  style={[
                    globalStyles.StoryProgressFill,
                    { width: `${Math.max(progressPercentage, 5)}%` },
                  ]}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="map-pin" size={10} color="#06B6D4" />
                  <Text style={[globalStyles.StoryProgressLabel, { color: "#6B7280", fontSize: 10, marginLeft: 2 }]}>
                    {passagesVisited} passages
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="check-circle" size={10} color="#10B981" />
                  <Text style={[globalStyles.StoryProgressLabel, { color: "#6B7280", fontSize: 10, marginLeft: 2 }]}>
                    {choicesMade} choices
                  </Text>
                </View>
              </View>

              {isCompleted && completedAt && (
                <Text style={[globalStyles.StoryProgressLabel, { color: "#10B981", fontSize: 10, marginTop: 2 }]}>
                  Completed: {new Date(completedAt).toLocaleDateString()}
                </Text>
              )}

              {!isCompleted && lastPlayed && (
                <Text style={[globalStyles.StoryProgressLabel, { color: "#6B7280", fontSize: 10, marginTop: 2 }]}>
                  Last played: {new Date(lastPlayed).toLocaleDateString()} at {new Date(lastPlayed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
          )}

          <Text style={[globalStyles.StoryDescription, { color: "#9CA3AF" }]}>
            {story.description || "No description available"}
          </Text>

          <View style={globalStyles.StoryAtmosphereContainer}>
            <Icon name="eye" size={10} color="#06B6D4" />
            <Text
              style={[globalStyles.StoryAtmosphereText, { color: "#06B6D4" }]}
            >
              ✦ {story.atmosphere || "Mysterious atmosphere"} ✦
            </Text>
          </View>

          <View style={globalStyles.StorySkillFocusContainer}>
            <Text
              style={[globalStyles.StorySkillFocusLabel, { color: "#9CA3AF" }]}
            >
              Coping Skills:
            </Text>
            <View style={globalStyles.StorySkillTags}>
              {(story.skillFocus || ["General Wellness"]).slice(0, 2).map((skill, index) => (
                <View key={index} style={globalStyles.StorySkillTag}>
                  <Text style={globalStyles.StorySkillTagText}>{skill}</Text>
                </View>
              ))}
              {(story.skillFocus || []).length > 2 && (
                <View style={globalStyles.StorySkillTag}>
                  <Text style={globalStyles.StorySkillTagText}>
                    +{(story.skillFocus || []).length - 2}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={globalStyles.StoryStatBoostsContainer}>
            <Text
              style={[globalStyles.StoryStatBoostsLabel, { color: "#9CA3AF" }]}
            >
              Strengthens:
            </Text>
            <View style={globalStyles.StoryStatBoostTags}>
              {(story.statBoosts || ["General Growth"]).map((stat, index) => (
                <View key={index} style={globalStyles.StoryStatBoostTag}>
                  <Icon name="trending-up" size={8} color="#10B981" />
                  <Text
                    style={[
                      globalStyles.StoryStatBoostText,
                      { color: "#10B981" },
                    ]}
                  >
                    {stat}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={globalStyles.StoryFooter}>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="clock" size={12} color="#FB923C" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {story.timeToComplete || "10-15 min"}
              </Text>
            </View>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="key" size={12} color="#A855F7" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {story.revelations || 1} revelations
              </Text>
            </View>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="zap" size={12} color="#A855F7" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {story.difficulty || "Intermediate"}
              </Text>
            </View>
          </View>

          {!story.isLocked && (
            <View style={globalStyles.StoryActionButton}>
              <LinearGradient
                colors={isCompleted ? ["#4ee6e6", "#06b6d4"] : ["#4ee6e6", "#06b6d4"]}
                style={[globalStyles.StoryActionButtonGradient, {
                  shadowColor: '#4ee6e6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }]}
              >
                <Icon
                  name={isCompleted ? "check-circle" : hasProgress ? "play" : "book-open"}
                  size={14}
                  color="#0a0b0f"
                />
                <Text style={[globalStyles.StoryActionButtonText, {
                  color: '#0a0b0f',
                  fontWeight: 'bold',
                }]}>
                  {isCompleted
                    ? "Replay Story"
                    : hasProgress
                      ? "Continue Reading"
                      : "Begin Reading"
                  }
                </Text>
              </LinearGradient>
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};
