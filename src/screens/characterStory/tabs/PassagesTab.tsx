import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LinearGradient,
  Icon,
  Image,
  Story,
} from "../../../imports";
import { uiIcons } from "../../../assets/ui";
import { PassagesTabProps } from "../../../types/story";

export const PassagesTab: React.FC<PassagesTabProps> = ({
  homeStyles,
  storyStyles,
  isLoadingStories,
  stories,
  archive,
  handleOpenStory,
}) => {
  return (
    <View style={homeStyles.tabpassagesArea}>
      <View style={storyStyles.centeredMessageContainer}>
        <View style={storyStyles.chronicleTopBorder} />
        <Text style={storyStyles.chronicleTitle}>
          Welcome to The Archive, a place to manage your stress and make sense
          of your thoughts.
        </Text>
        <View style={storyStyles.chronicleBottomBorder} />
      </View>

      {isLoadingStories ? (
        <View style={storyStyles.centeredMessageContainer}>
          <Icon
            name="loader"
            size={40}
            color="#A855F7"
            style={{ marginBottom: 16 }}
          />
          <Text style={storyStyles.centeredMessageTitle}>
            Loading Stories...
          </Text>
          <Text style={storyStyles.centeredMessageText}>
            Fetching ancient wisdom from the Archive...
          </Text>
        </View>
      ) : stories.length > 0 ? (
        stories.map((story, index) => (
          <TouchableOpacity
            key={index}
            style={storyStyles.chronicleCard}
            onPress={() => handleOpenStory(story)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                [
                  "rgba(10, 11, 15, 0.95)",
                  "rgba(30, 41, 59, 0.8)",
                  "rgba(10, 11, 15, 0.95)",
                ] as const
              }
              style={[
                storyStyles.chronicleGradient,
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
              <View style={storyStyles.chronicleTopBorder} />

              <View style={storyStyles.chronicleHeader}>
                <View style={storyStyles.chronicleInfo}>
                  <Text style={storyStyles.chronicleTitle}>
                    {story.title || "Untitled Story"}
                  </Text>
                  <View style={storyStyles.chronicleBadges}>
                    <View style={storyStyles.categoryBadge}>
                      <Text style={storyStyles.categoryBadgeText}>
                        {story.category || "Unknown"}
                      </Text>
                    </View>
                    <View style={storyStyles.difficultyBadge}>
                      <Text style={storyStyles.difficultyBadgeText}>
                        {story.difficulty || "Unknown"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={storyStyles.chronicleDescriptionContainer}>
                <Text style={storyStyles.chronicleDescription}>
                  {story.description || "No description available"}
                </Text>
                <Text style={storyStyles.chronicleAtmosphere}>
                  ✦ {story.atmosphere || "Mysterious atmosphere"} ✦
                </Text>
              </View>

              <View style={storyStyles.explorationContainer}>
                <View style={storyStyles.explorationHeader}>
                  <Image
                    source={uiIcons.sectionIcons.explorationProgress}
                    style={{ width: 16, height: 16 }}
                    resizeMode="contain"
                  />
                  <Text style={storyStyles.explorationLabel}>
                    Exploration Progress
                  </Text>
                  <Text style={storyStyles.explorationValue}>
                    {story.exploration || 0}%
                  </Text>
                </View>
                <View style={storyStyles.explorationBar}>
                  <LinearGradient
                    colors={["#06B6D4", "#A855F7", "#4F46E5"] as const}
                    style={[
                      storyStyles.explorationFill,
                      { width: `${story.exploration || 0}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={storyStyles.chronicleStats}>
                <View style={storyStyles.chronicleStat}>
                  <Icon name="key" size={16} color="#FCD34D" />
                  <Text style={storyStyles.chronicleStatText}>
                    {story.revelations || 0} revelations
                  </Text>
                </View>
                <View style={storyStyles.chronicleStat}>
                  <Icon name="clock" size={16} color="#FB923C" />
                  <Text style={storyStyles.chronicleStatText}>
                    {story.timeToComplete || "Unknown time"}
                  </Text>
                </View>
              </View>

              <View style={storyStyles.chronicleButton}>
                <LinearGradient
                  colors={
                    [
                      "rgba(78, 230, 230, 0.4)",
                      "rgba(6, 182, 212, 0.4)",
                      "rgba(78, 230, 230, 0.4)",
                    ] as const
                  }
                  style={[
                    storyStyles.chronicleButtonGradient,
                    {
                      shadowColor: "rgba(78, 230, 230, 0.2)",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    },
                  ]}
                >
                  <Image
                    source={uiIcons.sectionIcons.bookOpen}
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      ...storyStyles.chronicleButtonText,
                      color: "rgba(78, 230, 230, 0.9)",
                      fontWeight: "600",
                    }}
                  >
                    {archive.completedStories.has(story?.id || "")
                      ? "Restart Exploration"
                      : story.exploration > 0
                      ? "Resume Exploration"
                      : "Enter Ancient Story"}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))
      ) : (
        <View style={storyStyles.centeredMessageContainer}>
          <Icon
            name="book"
            size={40}
            color="#A855F7"
            style={{ marginBottom: 16 }}
          />
          <Text style={storyStyles.centeredMessageTitle}>
            No Stories Available
          </Text>
          <Text style={storyStyles.centeredMessageText}>
            The Archive is currently empty. Check back later for new wisdom to
            discover.
          </Text>
        </View>
      )}
    </View>
  );
};
