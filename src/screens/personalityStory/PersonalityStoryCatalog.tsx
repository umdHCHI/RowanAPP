import React, { useState } from "react";
import {
  Dimensions,
  Icon,
  LinearGradient,
  ScrollView,
  Story,
  Text,
  TouchableOpacity,
  View
} from "../../imports";

// Import archive service for backend operations
import { PersonalityKey } from "../../imports";

const { width } = Dimensions.get("window");

// Personality-specific visual themes
const PersonalityThemes = {
  Openness: {
    primary: '#9d4edd',
    secondary: '#f72585',
    accent: '#4cc9f0',
    background: 'rgba(88, 43, 125, 0.03)',
    cardGradient: ['rgba(157, 78, 221, 0.03)', 'rgba(247, 37, 133, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(247, 37, 133, 0.1)', 'rgba(255, 214, 10, 0.1)'],
      Epic: ['rgba(157, 78, 221, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Common: ['rgba(157, 78, 221, 0.1)', 'rgba(166, 99, 204, 0.1)']
    },
    modalTitle: 'Infinite Possibilities Archive',
    modalSubtitle: 'Explore boundless stories that spark imagination and creativity. Each tale opens new dimensions of thought.',
    atmosphereIcon: 'star',
    skillIcon: 'zap',
    actionText: 'Discover',
    cardStyle: 'cosmic'
  },
  Conscientiousness: {
    primary: '#2a9d8f',
    secondary: '#f4a261',
    accent: '#e76f51',
    background: 'rgba(42, 157, 143, 0.05)',
    cardGradient: ['rgba(42, 157, 143, 0.03)', 'rgba(244, 162, 97, 0.02)', 'rgba(231, 111, 81, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(244, 162, 97, 0.1)', 'rgba(231, 111, 81, 0.1)'],
      Epic: ['rgba(42, 157, 143, 0.1)', 'rgba(244, 162, 97, 0.1)'],
      Rare: ['rgba(42, 157, 143, 0.1)', 'rgba(38, 70, 83, 0.1)'],
      Common: ['rgba(38, 70, 83, 0.1)', 'rgba(42, 157, 143, 0.1)']
    },
    modalTitle: 'Methodical Study Archive',
    modalSubtitle: 'Structured wisdom awaits. Each story builds upon proven techniques for systematic personal growth.',
    atmosphereIcon: 'compass',
    skillIcon: 'target',
    actionText: 'Study',
    cardStyle: 'structured'
  },
  Extraversion: {
    primary: '#f72585',
    secondary: '#ffd60a',
    accent: '#4cc9f0',
    background: 'rgba(247, 37, 133, 0.05)',
    cardGradient: ['rgba(247, 37, 133, 0.03)', 'rgba(255, 214, 10, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(255, 214, 10, 0.1)', 'rgba(247, 127, 0, 0.1)'],
      Epic: ['rgba(247, 37, 133, 0.1)', 'rgba(255, 214, 10, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(247, 37, 133, 0.1)'],
      Common: ['rgba(247, 37, 133, 0.1)', 'rgba(76, 201, 240, 0.1)']
    },
    modalTitle: 'Social Connection Archive',
    modalSubtitle: 'Dynamic stories that energize and inspire. Connect with wisdom that amplifies your vibrant spirit.',
    atmosphereIcon: 'zap',
    skillIcon: 'users',
    actionText: 'Connect',
    cardStyle: 'energetic'
  },
  Agreeableness: {
    primary: '#06ffa5',
    secondary: '#ffffb3',
    accent: '#4cc9f0',
    background: 'rgba(4, 72, 47, 0.05)',
    cardGradient: ['rgba(0, 10, 6, 0.03)', 'rgba(106, 106, 74, 0.02)', 'rgba(24, 59, 70, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(255, 255, 179, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Epic: ['rgba(6, 255, 165, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Common: ['rgba(6, 255, 165, 0.1)', 'rgba(76, 201, 240, 0.1)']
    },
    modalTitle: 'Harmony Gardens Archive',
    modalSubtitle: 'Gentle wisdom flows through these stories. Find peace, understanding, and compassionate growth.',
    atmosphereIcon: 'heart',
    skillIcon: 'shield',
    actionText: 'Embrace',
    cardStyle: 'harmonious'
  },
  Neuroticism: {
    primary: '#7209b7',
    secondary: '#a663cc',
    accent: '#4cc9f0',
    background: 'rgba(114, 9, 183, 0.05)',
    cardGradient: ['rgba(114, 9, 183, 0.03)', 'rgba(166, 99, 204, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(166, 99, 204, 0.1)', 'rgba(114, 9, 183, 0.1)'],
      Epic: ['rgba(114, 9, 183, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(114, 9, 183, 0.1)'],
      Common: ['rgba(114, 9, 183, 0.1)', 'rgba(166, 99, 204, 0.1)']
    },
    modalTitle: 'Reflection Chambers Archive',
    modalSubtitle: 'Deep wisdom for profound souls. These stories honor your emotional depth and inner complexity.',
    atmosphereIcon: 'moon',
    skillIcon: 'eye',
    actionText: 'Reflect',
    cardStyle: 'introspective'
  }
};

type PersonalityStoryCatalogProps = {
  primaryTrait: PersonalityKey;
  stories: Story[]; 
  isLoading: boolean;
  onStorySelect: (story: Story) => void;
  globalStyles: any;
  personalityStyles?: any;
  userPersonalityTrait?: string;
  setStories: (stories: Story[]) => void;
  onStoryRestart?: () => void;
  setIsLoading: (loading: boolean) => void;
};

const PersonalityStoryCatalog = ({
  primaryTrait,
  stories,
  isLoading,
  onStorySelect,
  globalStyles,
  personalityStyles,
  setIsLoading,
}: PersonalityStoryCatalogProps) => {

  const [error, setError] = useState<string | null>(null);

  const theme = PersonalityThemes[primaryTrait];

  const getRarityColors = (rarity: string): readonly [string, string] => {
    const colors = theme.rarityColors[rarity as keyof typeof theme.rarityColors] || theme.rarityColors.Common;
    return [colors[0], colors[1]] as const;
  };

  const getRarityGlow = (rarity: string): string => {
    const colors = getRarityColors(rarity);
    return `${colors[0]}40`;
  };

  const getCardStyleOverrides = () => {
    const baseOverrides = {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };

    switch (theme.cardStyle) {
      case 'cosmic':
        return {
          ...baseOverrides,
          borderRadius: 16,
        };
      case 'structured':
        return {
          ...baseOverrides,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: theme.primary,
        };
      case 'energetic':
        return {
          ...baseOverrides,
          borderRadius: 20,
        };
      case 'harmonious':
        return {
          ...baseOverrides,
          borderRadius: 24,
          shadowOpacity: 0.2,
        };
      case 'introspective':
        return {
          ...baseOverrides,
          borderRadius: 12,
          shadowColor: theme.secondary,
          shadowOpacity: 0.4,
        };
      default:
        return baseOverrides;
    }
  };

  const StoryCard = ({ story }: { story: Story }) => {
    const cardOverrides = getCardStyleOverrides();
    const leftBorderColor = personalityStyles ? theme.primary : "rgba(78, 230, 230, 0.8)";
    
    return (
      <TouchableOpacity
        style={[
          globalStyles.personalityStoryCard, 
          { 
            opacity: story.isLocked ? 0.6 : 1,
            shadowColor: leftBorderColor,
            maxHeight: 400,
          },
          cardOverrides
        ]}
        onPress={() => !story.isLocked && onStorySelect(story)}
        activeOpacity={story.isLocked ? 1 : 0.8}
        disabled={story.isLocked}
      >
        <LinearGradient
          colors={['rgba(38, 70, 83, 0.1)', 'rgba(42, 157, 143, 0.1)']} 
          style={[globalStyles.personalityStoryCardGradient, { borderRadius: (cardOverrides as any)?.borderRadius }]}
        >
          {/* Personality-specific Rarity Border */}
          <LinearGradient
            colors={getRarityColors(story.rarity || "Common")}
            style={[
              globalStyles.personalityStoryRarityBorder,
              { 
                borderRadius: (cardOverrides as any).borderRadius,
                shadowColor: getRarityGlow(story.rarity || "Common"),
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }
            ]}
          />

          {/* Lock Overlay */}
          {story.isLocked && (
            <View style={globalStyles.personalityStoryLockOverlay}>
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.6)"]}
                style={globalStyles.personalityStoryLockGradient}
              >
                <Icon name="lock" size={24} color={theme.primary} />
                <Text
                  style={[globalStyles.personalityStoryLockText, { color: theme.primary }]}
                >
                  Level {story.unlockLevel || 1} Required
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Header with Personality Colors */}
          <View style={globalStyles.personalityStoryCardHeader}>
            <View style={globalStyles.personalityStoryTitleSection}>
              <Text style={[globalStyles.personalityStoryCardTitle, { color: theme.primary }]}>
                {story.title || "Untitled Story"}
              </Text>
              <Text
                style={[globalStyles.personalityStoryCardCategory, { color: theme.secondary }]}
              >
                {story.category || "Unknown Category"}
              </Text>
            </View>

            <View style={globalStyles.personalityStoryRarityBadge}>
              <LinearGradient
                colors={getRarityColors(story.rarity || "Common")}
                style={globalStyles.personalityStoryRarityBadgeGradient}
              >
                <Text style={globalStyles.personalityStoryRarityBadgeText}>
                  {story.rarity || "Common"}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Progress Indicator with Personality Colors */}
          {(story.exploration || 0) > 0 && (
            <View style={globalStyles.personalityStoryProgressSection}>
              <View style={globalStyles.personalityStoryProgressHeader}>
                <Icon name="compass" size={12} color={theme.accent} />
                <Text
                  style={[
                    globalStyles.personalityStoryProgressLabel,
                    { color: theme.accent },
                  ]}
                >
                  Exploration: {story.exploration || 0}%
                </Text>
              </View>
              <View style={globalStyles.personalityStoryProgressBar}>
                <LinearGradient
                  colors={[theme.accent, theme.primary]}
                  style={[
                    globalStyles.personalityStoryProgressFill,
                    { width: `${story.exploration || 0}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={[globalStyles.personalityStoryDescription, { color: "#E5E7EB" }]}>
            {story.description || "No description available"}
          </Text>

          {/* Atmosphere with Personality Icon */}
          <View style={globalStyles.personalityStoryAtmosphereContainer}>
            <Icon name={theme.atmosphereIcon} size={10} color={theme.accent} />
            <Text
              style={[globalStyles.personalityStoryAtmosphereText, { color: theme.accent }]}
            >
              ✦ {story.atmosphere || "Mysterious atmosphere"} ✦
            </Text>
          </View>

          {/* Skill Focus Tags with Personality Colors */}
          <View style={globalStyles.personalityStorySkillFocusContainer}>
            <Text
              style={[globalStyles.personalityStorySkillFocusLabel, { color: theme.secondary }]}
            >
              Coping Skills:
            </Text>
            <View style={globalStyles.personalityStorySkillTags}>
              {(story.skillFocus || ["General Wellness"]).slice(0, 2).map((skill, index) => (
                <View key={index} style={[globalStyles.personalityStorySkillTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}>
                  <Text style={[globalStyles.personalityStorySkillTagText, { color: theme.primary }]}>{skill}</Text>
                </View>
              ))}
              {(story.skillFocus || []).length > 2 && (
                <View style={[globalStyles.personalityStorySkillTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}>
                  <Text style={[globalStyles.personalityStorySkillTagText, { color: theme.primary }]}>
                    +{(story.skillFocus || []).length - 2}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stat Boosts with Personality Colors */}
          <View style={globalStyles.personalityStoryStatBoostsContainer}>
            <Text
              style={[globalStyles.personalityStoryStatBoostsLabel, { color: theme.secondary }]}
            >
              Strengthens:
            </Text>
            <View style={globalStyles.personalityStoryStatBoostTags}>
              {(story.statBoosts || ["General Growth"]).map((stat, index) => (
                <View key={index} style={globalStyles.personalityStoryStatBoostTag}>
                  <Icon name={theme.skillIcon} size={8} color={theme.accent} />
                  <Text
                    style={[
                      globalStyles.personalityStoryStatBoostText,
                      { color: theme.accent },
                    ]}
                  >
                    {stat}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Info with Personality Colors */}
          <View style={globalStyles.personalityStoryFooter}>
            <View style={globalStyles.personalityStoryFooterStat}>
              <Icon name="clock" size={12} color={theme.secondary} />
              <Text
                style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
              >
                {story.timeToComplete || "10-15 min"}
              </Text>
            </View>
            <View style={globalStyles.personalityStoryFooterStat}>
              <Icon name="key" size={12} color={theme.primary} />
              <Text
                style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
              >
                {story.revelations || 1} revelations
              </Text>
            </View>
            <View style={globalStyles.personalityStoryFooterStat}>
              <Icon name="zap" size={12} color={theme.accent} />
              <Text
                style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
              >
                {story.difficulty || "Intermediate"}
              </Text>
            </View>
          </View>

          {/* Action Button with Personality Styling */}
          {!story.isLocked && (
            <View style={globalStyles.personalityStoryActionButton}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={[globalStyles.personalityStoryActionButtonGradient, { borderRadius: theme.cardStyle === 'harmonious' ? 16 : 8 }]}
              >
                <Icon name="book-open" size={14} color="#ffffff" />
                <Text style={[globalStyles.personalityStoryActionButtonText, { color: "#ffffff" }]}>
                  {(story.exploration || 0) > 0
                    ? `Continue ${theme.actionText}`
                    : `${theme.actionText} Story`}
                </Text>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Loading state with personality colors
  if (isLoading) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Icon
          name="loader"
          size={40}
          color={theme.primary}
          style={{ marginBottom: 16 }}
        />
        <Text style={{ color: "white", fontSize: 18, margin: 20 }}>
          Loading Stories from {theme.modalTitle}...
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 14, margin: 10, textAlign: 'center' }}>
          Personality Type: {primaryTrait}
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Icon
          name="alert-circle"
          size={40}
          color="#EF4444"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            color: "white",
            fontSize: 18,
            margin: 20,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
          style={{
            padding: 20,
            backgroundColor: theme.primary,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.personalityStoryCatalogContainer}>
      {/* Header with Personality Theming */}

 
      {/* Story Grid */}
      <ScrollView
        style={globalStyles.personalityStoryScrollView}
        contentContainerStyle={globalStyles.personalityStoryGrid}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {stories.length > 0 ? (
          <>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Icon
              name="book"
              size={40}
              color={theme.primary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: theme.primary,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              No Stories Available for {primaryTrait}
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 14,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              The {theme.modalTitle} is currently empty. Complete the personality survey to unlock stories tailored to your {primaryTrait.toLowerCase()} traits.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PersonalityStoryCatalog; 