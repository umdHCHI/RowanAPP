import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from "../../services/apiService";
import { Story } from "../../types/story";
import { UserProfile } from "../../types/user";

// Dummy Icon and LinearGradient for now (replace with your UI lib)
const Icon = ({ name, size, color }: any) => <Text style={{ fontSize: size, color }}>{name}</Text>;
const LinearGradient = ({ children, style }: any) => <View style={style}>{children}</View>;

const TAB_LIST = [
  { key: "entrance", label: "Entrance Hall", icon: "🏛️" },
  { key: "storys", label: "Storys", icon: "📖" },
  { key: "codex", label: "Codex", icon: "📚" },
  { key: "defender", label: "Mind Defender", icon: "⚡" },
  { key: "restoration", label: "Restoration", icon: "🛠️" },
];

type PersonalityKey = "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";

const PERSONALITY_BUILDS: Record<PersonalityKey, {
  title: string;
  class: string;
  description: string;
  baseStats: {
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
  };
  storyCategories: string[];
  storyThemes: string[];
}> = {
  Openness: {
    title: "The Sage Explorer",
    class: "Creative Pathfinder",
    description: "Masters the art of perspective and boundless curiosity",
    baseStats: { awareness: 8, resilience: 6, connection: 6, balance: 5 },
    storyCategories: ["Mystery", "Discovery", "Innovation", "Exploration"],
    storyThemes: ["curiosity", "imagination", "new experiences", "creative thinking"],
  },
  Conscientiousness: {
    title: "The Methodical Guardian",
    class: "Structured Keeper",
    description: "Builds strength through order and disciplined practice",
    baseStats: { awareness: 6, resilience: 8, connection: 5, balance: 7 },
    storyCategories: ["Challenge", "Growth", "Achievement", "Structure"],
    storyThemes: ["goal-setting", "organization", "perseverance", "self-discipline"],
  },
  Extraversion: {
    title: "The Social Catalyst",
    class: "Community Builder",
    description: "Draws power from connection and shared experiences",
    baseStats: { awareness: 6, resilience: 6, connection: 8, balance: 6 },
    storyCategories: ["Adventure", "Cooperation", "Leadership", "Social"],
    storyThemes: ["teamwork", "communication", "social connection", "collaboration"],
  },
  Agreeableness: {
    title: "The Harmonious Healer",
    class: "Empathic Guide",
    description: "Transforms conflict into understanding and growth",
    baseStats: { awareness: 7, resilience: 5, connection: 8, balance: 7 },
    storyCategories: ["Healing", "Relationships", "Harmony", "Empathy"],
    storyThemes: ["compassion", "understanding", "conflict resolution", "emotional intelligence"],
  },
  Neuroticism: {
    title: "The Depth Walker",
    class: "Emotional Alchemist",
    description: "Transforms sensitivity into profound wisdom",
    baseStats: { awareness: 8, resilience: 5, connection: 6, balance: 5 },
    storyCategories: ["Transformation", "Inner Journey", "Resilience", "Emotional Depth"],
    storyThemes: ["emotional awareness", "self-reflection", "coping strategies", "personal growth"],
  },
};

// Backend personality profile interface
interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export default function PersonalityHomeScreen() {
  const { theme, auth } = useMasterState();
  const [activeTab, setActiveTab] = useState("entrance");
  const [isLoading, setIsLoading] = useState(true);
  const [traitScores, setTraitScores] = useState<Record<PersonalityKey, number>>({
    Openness: 5,
    Conscientiousness: 5,
    Extraversion: 5,
    Agreeableness: 5,
    Neuroticism: 5,
  });
  const [primaryTrait, setPrimaryTrait] = useState<PersonalityKey>("Openness");
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Story-related state
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Fetch personality profile from backend
  useEffect(() => {
    const fetchPersonalityProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize API service
        await apiService.initialize();

        // Check if user is authenticated
        const isAuthenticated = await apiService.validateToken();
        if (!isAuthenticated) {
          console.log("User not authenticated, using fallback data");
          setError("Please log in to view your personality profile");
          setIsLoading(false);
          return;
        }

        // Fetch user profile which includes personality data
        const profile = await apiService.getProfile();
        setUserProfile(profile);

        if (profile.personality_profile) {
          // Convert backend format to frontend format
          const personalityData = profile.personality_profile as PersonalityProfile;
          const scores: Record<PersonalityKey, number> = {
            Openness: personalityData.openness,
            Conscientiousness: personalityData.conscientiousness,
            Extraversion: personalityData.extraversion,
            Agreeableness: personalityData.agreeableness,
            Neuroticism: personalityData.neuroticism,
          };

          setTraitScores(scores);

          // Find primary trait (highest score)
          const primary = Object.entries(scores).reduce((a, b) =>
            scores[a[0] as PersonalityKey] > scores[b[0] as PersonalityKey] ? a : b
          )[0] as PersonalityKey;

          setPrimaryTrait(primary);
          console.log("Personality profile loaded:", { scores, primary });
        } else {
          console.log("No personality profile found, using fallback data");
          // Use fallback data if no personality profile exists
          const fallbackScores: Record<PersonalityKey, number> = {
            Openness: 7,
            Conscientiousness: 6,
            Extraversion: 5,
            Agreeableness: 8,
            Neuroticism: 4,
          };
          setTraitScores(fallbackScores);
          setPrimaryTrait("Agreeableness");
        }
      } catch (error: any) {
        console.error("Error fetching personality profile:", error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          setError("Authentication required. Please log in.");
        } else if (error.response?.status === 404) {
          setError("Personality profile not found. Please complete the personality survey.");
        } else if (error.message?.includes('network')) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("Failed to load personality profile. Please try again.");
        }

        // Use fallback data on error
        const fallbackScores: Record<PersonalityKey, number> = {
          Openness: 7,
          Conscientiousness: 6,
          Extraversion: 5,
          Agreeableness: 8,
          Neuroticism: 4,
        };
        setTraitScores(fallbackScores);
        setPrimaryTrait("Agreeableness");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalityProfile();
  }, []);

  // Fetch and filter stories based on personality
  useEffect(() => {
    const fetchStories = async () => {
      if (activeTab !== "storys") return;

      try {
        setIsLoadingStories(true);
        setStoryError(null);

        // Fetch available stories from backend
        const availableStories = await apiService.getAvailableStories();
        setStories(availableStories);

        // Filter stories based on primary personality trait
        const currentBuild = PERSONALITY_BUILDS[primaryTrait];
        const filtered = availableStories.filter(story => {
          // Check if story category matches personality preferences
          if (story.category && currentBuild.storyCategories.includes(story.category)) {
            return true;
          }

          // Check if story skillFocus matches personality themes
          if (story.skillFocus && Array.isArray(story.skillFocus)) {
            const hasMatchingSkill = story.skillFocus.some(skill => 
              currentBuild.storyThemes.includes(skill.toLowerCase())
            );
            if (hasMatchingSkill) return true;
          }

          // Check if story description contains personality-relevant keywords
          const description = story.description?.toLowerCase() || "";
          const hasRelevantKeywords = currentBuild.storyThemes.some(theme =>
            description.includes(theme.toLowerCase())
          );
          if (hasRelevantKeywords) return true;

          // Check if story atmosphere matches personality themes
          if (story.atmosphere) {
            const atmosphere = story.atmosphere.toLowerCase();
            const hasMatchingAtmosphere = currentBuild.storyThemes.some(theme =>
              atmosphere.includes(theme.toLowerCase())
            );
            if (hasMatchingAtmosphere) return true;
          }

          // If no specific matches, include stories that might be generally suitable
          return story.difficulty === "Beginner" || story.difficulty === "Intermediate";
        });

        setFilteredStories(filtered);
        console.log(`Filtered ${filtered.length} stories for ${primaryTrait} personality`);
      } catch (error: any) {
        console.error("Error fetching stories:", error);
        setStoryError("Failed to load stories. Please try again.");
        setFilteredStories([]);
      } finally {
        setIsLoadingStories(false);
      }
    };

    fetchStories();
  }, [activeTab, primaryTrait]);

  const currentBuild = PERSONALITY_BUILDS[primaryTrait];

  // Story selection handler
  const handleStorySelect = (story: Story) => {
    Alert.alert(
      `Start "${story.title}"?`,
      `This story is matched to your ${primaryTrait.toLowerCase()} personality. Ready to begin your journey?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Begin Story", 
          style: "default",
          onPress: () => {
            // TODO: Navigate to story screen
            console.log("Starting story:", story);
            Alert.alert("Story Navigation", "Story navigation will be implemented next!");
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ee6e6" />
        <Text style={{ color: "#fff", marginTop: 16 }}>
          Loading your personality profile...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#ff6b6b", textAlign: "center", marginBottom: 16 }}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            // Retry loading
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#181A20" }}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      {/* Background Gradient */}
      <LinearGradient style={StyleSheet.absoluteFill}>
        {/* Add your gradient colors here */}
      </LinearGradient>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personality Resonance</Text>
        <Text style={styles.headerTrait}>{currentBuild.title}</Text>
        <Text style={styles.headerClass}>{currentBuild.class}</Text>
        <Text style={styles.headerDesc}>{currentBuild.description}</Text>
        {userProfile && (
          <Text style={styles.userInfo}>
            Welcome, {userProfile.username}
          </Text>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {TAB_LIST.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={{ fontSize: 18 }}>{tab.icon}</Text>
            <Text
              style={{
                color: activeTab === tab.key ? "#4ee6e6" : "#fff",
                fontWeight: activeTab === tab.key ? "bold" : "normal",
                fontSize: 12,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {activeTab === "entrance" && (
          <View>
            <Text style={styles.sectionTitle}>Big Five Personality Scores</Text>
            <View style={styles.traitRow}>
              {Object.entries(traitScores).map(([trait, score]) => (
                <TouchableOpacity
                  key={trait}
                  style={[
                    styles.traitCard,
                    trait === primaryTrait && styles.primaryTraitCard
                  ]}
                  onPress={() => {
                    Alert.alert(
                      `${trait} - ${score}/10`,
                      `Your ${trait.toLowerCase()} score reflects your natural tendencies. This influences how you experience stories and interact with the world.`
                    );
                  }}
                >
                  <Text style={styles.traitName}>{trait}</Text>
                  <Text style={styles.traitScore}>{score}/10</Text>
                  {trait === primaryTrait && (
                    <Text style={styles.primaryIndicator}>Primary</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.moodBubble}>
              <Text style={styles.moodText}>
                {`"Ready to explore your story as a ${currentBuild.class}..."`}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Wellness Attributes</Text>
            <View style={styles.traitRow}>
              {Object.entries(currentBuild.baseStats).map(([label, value]) => (
                <View key={label} style={styles.traitCard}>
                  <Text style={styles.traitName}>{label.toUpperCase()}</Text>
                  <Text style={styles.traitScore}>{value}</Text>
                </View>
              ))}
            </View>
            
            {/* Personality Profile Status */}
            <View style={styles.profileStatus}>
              <Text style={styles.sectionTitle}>Profile Status</Text>
              <View style={styles.statusCard}>
                <Text style={styles.statusText}>
                  {userProfile?.personality_profile 
                    ? "✅ Personality profile loaded from backend"
                    : "⚠️ Using fallback personality data"
                  }
                </Text>
                <Text style={styles.statusSubtext}>
                  {userProfile?.personality_profile 
                    ? "Your Big Five scores are based on your survey responses"
                    : "Complete the personality survey to get personalized recommendations"
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
        {activeTab === "storys" && (
          <View>
            <View style={styles.storyHeader}>
              <Text style={styles.sectionTitle}>
                Stories for {currentBuild.title}
              </Text>
              <Text style={styles.storySubtitle}>
                Curated for your {primaryTrait.toLowerCase()} personality
              </Text>
            </View>

            {isLoadingStories ? (
              <View style={styles.centeredMessage}>
                <ActivityIndicator size="large" color="#4ee6e6" />
                <Text style={styles.centeredMessageText}>
                  Finding stories that resonate with your personality...
                </Text>
              </View>
            ) : storyError ? (
              <View style={styles.centeredMessage}>
                <Text style={styles.errorText}>{storyError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setStoryError(null);
                    setIsLoadingStories(true);
                    // Retry loading stories
                    setTimeout(() => {
                      setIsLoadingStories(false);
                    }, 1000);
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : filteredStories.length > 0 ? (
              filteredStories.map((story, index) => (
                <TouchableOpacity
                  key={story.id || index}
                  style={styles.storyCard}
                  onPress={() => handleStorySelect(story)}
                  activeOpacity={0.8}
                >
                  <View style={styles.storyCardHeader}>
                    <Text style={styles.storyTitle}>
                      {story.title || "Untitled Story"}
                    </Text>
                    <View style={styles.storyBadges}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {story.category || "General"}
                        </Text>
                      </View>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyBadgeText}>
                          {story.difficulty || "Unknown"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.storyDescription}>
                    {story.description || "No description available"}
                  </Text>

                  <View style={styles.storyFooter}>
                    <View style={styles.storyStats}>
                      <Text style={styles.storyStat}>
                        📖 {story.chapter_count || 1} chapters
                      </Text>
                      <Text style={styles.storyStat}>
                        ⏱️ {story.timeToComplete || "15-30 min"}
                      </Text>
                    </View>
                    <View style={styles.personalityMatch}>
                      <Text style={styles.matchText}>
                        🎯 Perfect for {primaryTrait}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.centeredMessage}>
                <Text style={styles.centeredMessageTitle}>
                  No Stories Available
                </Text>
                <Text style={styles.centeredMessageText}>
                  No stories are currently matched to your {primaryTrait.toLowerCase()} personality. 
                  Check back later for new content!
                </Text>
              </View>
            )}

            {/* Story Filter Info */}
            <View style={styles.filterInfo}>
              <Text style={styles.filterInfoTitle}>
                How Stories Are Matched
              </Text>
              <Text style={styles.filterInfoText}>
                Stories are selected based on your {primaryTrait.toLowerCase()} personality, 
                focusing on themes like: {currentBuild.storyThemes.slice(0, 3).join(", ")}
              </Text>
            </View>
          </View>
        )}
        {activeTab === "codex" && (
          <View>
            <Text style={styles.sectionTitle}>Codex</Text>
            {/* TODO: Codex content */}
            <Text style={{ color: "#fff", marginTop: 20 }}>
              (Codex placeholder)
            </Text>
          </View>
        )}
        {activeTab === "defender" && (
          <View>
            <Text style={styles.sectionTitle}>Mind Defender</Text>
            {/* TODO: Mind Defender content */}
            <Text style={{ color: "#fff", marginTop: 20 }}>
              (Mind Defender placeholder)
            </Text>
          </View>
        )}
        {activeTab === "restoration" && (
          <View>
            <Text style={styles.sectionTitle}>Restoration</Text>
            {/* TODO: Restoration content */}
            <Text style={{ color: "#fff", marginTop: 20 }}>
              (Restoration placeholder)
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181A20",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#23242b",
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  headerTitle: {
    color: "#4ee6e6",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  headerTrait: {
    color: "#ffe066",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  headerClass: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 6,
  },
  headerDesc: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  userInfo: {
    color: "#4ee6e6",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#23242b",
    borderBottomWidth: 1,
    borderColor: "#333",
    paddingVertical: 8,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4ee6e6",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  traitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  traitCard: {
    backgroundColor: "#23242b",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  primaryTraitCard: {
    borderColor: "#4ee6e6",
    borderWidth: 2,
    backgroundColor: "#2a2d35",
  },
  traitName: {
    color: "#4ee6e6",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  traitScore: {
    color: "#ffe066",
    fontWeight: "bold",
    fontSize: 16,
  },
  primaryIndicator: {
    color: "#4ee6e6",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  moodBubble: {
    backgroundColor: "#f5e6c4",
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: "#e2c48d",
    alignItems: "center",
  },
  moodText: {
    color: "#5a4a2c",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  profileStatus: {
    marginTop: 20,
  },
  statusCard: {
    backgroundColor: "#23242b",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statusSubtext: {
    color: "#ccc",
    fontSize: 12,
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: "#4ee6e6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  // Story-specific styles
  storyHeader: {
    marginBottom: 20,
  },
  storySubtitle: {
    color: "#4ee6e6",
    fontSize: 14,
    fontStyle: "italic",
  },
  centeredMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  centeredMessageTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  centeredMessageText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  storyCard: {
    backgroundColor: "#23242b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderLeftWidth: 4,
    borderLeftColor: "#4ee6e6",
  },
  storyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  storyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  storyBadges: {
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#4ee6e6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  difficultyBadge: {
    backgroundColor: "#ffe066",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  storyDescription: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyStats: {
    flexDirection: "row",
    gap: 16,
  },
  storyStat: {
    color: "#999",
    fontSize: 12,
  },
  personalityMatch: {
    backgroundColor: "rgba(78, 230, 230, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchText: {
    color: "#4ee6e6",
    fontSize: 11,
    fontWeight: "bold",
  },
  filterInfo: {
    backgroundColor: "#23242b",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterInfoTitle: {
    color: "#4ee6e6",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterInfoText: {
    color: "#ccc",
    fontSize: 12,
    lineHeight: 16,
  },
});
