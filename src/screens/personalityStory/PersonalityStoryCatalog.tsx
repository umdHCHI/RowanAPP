import React, { useEffect, useState } from "react";
import {
  BlurView,
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
import { apiService } from "../../services/apiService";

const { width } = Dimensions.get("window");

// Personality-specific visual themes
const PersonalityThemes = {
  Openness: {
    primary: '#9d4edd',
    secondary: '#f72585',
    accent: '#4cc9f0',
    background: 'rgba(88, 43, 125, 0.03)',
    cardGradient: ['rgba(157, 78, 221, 0.15)', 'rgba(247, 37, 133, 0.12)', 'rgba(76, 201, 240, 0.15)'],
    rarityColors: {
      Legendary: ['#f72585', '#ffd60a'],
      Epic: ['#9d4edd', '#4cc9f0'],
      Rare: ['#4cc9f0', '#06ffa5'],
      Common: ['#9d4edd', '#a663cc']
    },
    modalTitle: 'Infinite Possibilities Archive',
    modalSubtitle: 'Explore boundless stories that spark imagination and creativity. Each tale opens new dimensions of thought.',
    atmosphereIcon: 'star',
    skillIcon: 'lightbulb',
    actionText: 'Discover',
    cardStyle: 'cosmic'
  },
  Conscientiousness: {
    primary: '#2a9d8f',
    secondary: '#f4a261',
    accent: '#e76f51',
    background: 'rgba(42, 157, 143, 0.05)',
    cardGradient: ['rgba(42, 157, 143, 0.15)', 'rgba(244, 162, 97, 0.12)', 'rgba(231, 111, 81, 0.15)'],
    rarityColors: {
      Legendary: ['#f4a261', '#e76f51'],
      Epic: ['#2a9d8f', '#f4a261'],
      Rare: ['#2a9d8f', '#264653'],
      Common: ['#264653', '#2a9d8f']
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
    cardGradient: ['rgba(247, 37, 133, 0.15)', 'rgba(255, 214, 10, 0.12)', 'rgba(76, 201, 240, 0.15)'],
    rarityColors: {
      Legendary: ['#ffd60a', '#f77f00'],
      Epic: ['#f72585', '#ffd60a'],
      Rare: ['#4cc9f0', '#f72585'],
      Common: ['#f72585', '#4cc9f0']
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
    cardGradient: ['rgba(0, 10, 6, 0.15)', 'rgba(106, 106, 74, 0.12)', 'rgba(24, 59, 70, 0.15)'],
    rarityColors: {
      Legendary: ['#ffffb3', '#06ffa5'],
      Epic: ['#06ffa5', '#4cc9f0'],
      Rare: ['#4cc9f0', '#06ffa5'],
      Common: ['#06ffa5', '#4cc9f0']
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
    cardGradient: ['rgba(114, 9, 183, 0.15)', 'rgba(166, 99, 204, 0.12)', 'rgba(76, 201, 240, 0.15)'],
    rarityColors: {
      Legendary: ['#a663cc', '#7209b7'],
      Epic: ['#7209b7', '#4cc9f0'],
      Rare: ['#4cc9f0', '#7209b7'],
      Common: ['#7209b7', '#a663cc']
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
  onStorySelect: (story: Story) => void;
  globalStyles: any;
};

const PersonalityStoryCatalog = ({
  primaryTrait,
  onStorySelect,
  globalStyles
}: PersonalityStoryCatalogProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = PersonalityThemes[primaryTrait];

  // Load stories from backend on mount
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading stories for personality type:", primaryTrait);
        
        // Fetch stories from backend
        const backendStories = await apiService.getAvailableStories();
        console.log("Backend stories loaded:", backendStories?.length || 0);
        
        if (backendStories && backendStories.length > 0) {
          // For now, show all available stories
          setStories(backendStories);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Failed to load stories from the Archive:", error);
        setError("Failed to load stories from the Archive");
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [primaryTrait]);
  const getRarityColors = (rarity: string): readonly [string, string] => {
    const colors = theme.rarityColors[rarity as keyof typeof theme.rarityColors] || theme.rarityColors.Common;
    return [colors[0], colors[1]] as const;
  };

  const getRarityGlow = (rarity: string): string => {
    const colors = getRarityColors(rarity);
    return `${colors[0]}40`; // Add transparency
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
          transform: [{ rotate: '1deg' }],
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
          transform: [{ scale: 1.02 }],
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
    
    return (
      <TouchableOpacity
        style={[
          globalStyles.personalityStoryCard, 
          { opacity: story.isLocked ? 0.6 : 1 },
          cardOverrides
        ]}
        onPress={() => !story.isLocked && onStorySelect(story)}
        activeOpacity={story.isLocked ? 1 : 0.8}
        disabled={story.isLocked}
      >
        <LinearGradient
          colors={[theme.cardGradient[0], theme.cardGradient[1]]} 
          style={[globalStyles.personalityStoryCardGradient, { borderRadius: (cardOverrides as any)?.borderRadius }]}
        >
          <BlurView intensity={theme.cardStyle === 'harmonious' ? 8 : 5} style={globalStyles.personalityStoryCardBlur}>
            {/* Personality-specific Rarity Border */}
            <LinearGradient
              colors={getRarityColors(story.rarity || "Common")}
              style={[
                globalStyles.personalityStoryRarityBorder,
                { 
                  borderRadius: (cardOverrides as any).borderRadius,
                  shadowColor: getRarityGlow(story.rarity || "Common"),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
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
          </BlurView>
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
            // Retry loading
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);
          }}
          style={{
            padding: 20,
            backgroundColor: theme.primary,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.personalityStoryCatalogContainer}>
      {/* Header with Personality Theming */}
      <View style={globalStyles.personalityStoryCatalogHeader}>
        <View style={globalStyles.personalityStoryHeaderContent}>
          <Icon name="book" size={24} color={theme.primary} />
          <Text
            style={[
              globalStyles.personalityStoryCatalogTitle,
              { color: theme.primary },
            ]}
          >
            {theme.modalTitle}
          </Text>
        </View>
        <Text
          style={[
            globalStyles.personalityStoryCatalogSubtitle,
            { color: theme.secondary },
          ]}
        >
          {theme.modalSubtitle}
        </Text>
      </View>

      {/* Story Grid */}
      <ScrollView
        style={globalStyles.personalityStoryScrollView}
        contentContainerStyle={globalStyles.personalityStoryGrid}
        showsVerticalScrollIndicator={false}
      >
        {stories.length > 0 ? (
          stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))
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
              No Stories Available
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 14,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              The {theme.modalTitle} is currently empty. Check back later for new
              wisdom to discover.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PersonalityStoryCatalog; 