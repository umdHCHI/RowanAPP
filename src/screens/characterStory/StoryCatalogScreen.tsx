import {
  BlurView,
  createGlobalStyles,
  darkTheme,
  Dimensions,
  Icon,
  LinearGradient,
  Modal,
  React,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useEffect,
  useState,
  View,
} from "../../imports";

// Import archive service for backend operations
import { archiveService } from "../../services/archiveService";
// Import test function
// Import ChapterScreen for chapter selection - temporarily disabled
// import ChapterScreen from './ChapterScreen';

const { width } = Dimensions.get("window");

export type Story = {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  exploration: number;
  revelations: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  skillFocus: string[];
  atmosphere: string;
  statBoosts: string[];
  unlockLevel: number;
  isLocked?: boolean;
  passages?: any[];
  image?: string;
};

type StoryCatalogModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectStory: (Story: Story) => void;
};

const StoryCatalogModal = ({
  visible,
  onClose,
  onSelectStory,
}: StoryCatalogModalProps) => {
  const [Storys, setStorys] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const globalStyles = createGlobalStyles(darkTheme);

  // Load Storys from backend on mount
  useEffect(() => {
    const loadStorys = async () => {
      if (!visible) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading Storys from backend...");
        const backendStorys = await archiveService.getAvailableStories();
        console.log("Backend Storys response:", backendStorys);

        if (backendStorys && backendStorys.length > 0) {
          console.log("Setting Storys:", backendStorys);
          setStorys(backendStorys);
        } else {
          console.log("No Storys returned from backend");
          setStorys([]);
        }
      } catch (error) {
        console.error("Failed to load Storys from the Archive:", error);
        setError("Failed to load Storys from the Archive");
        setStorys([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorys();
  }, [visible]);

  const getRarityColors = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case "Legendary":
        return ["#F97316", "#FCD34D"];
      case "Epic":
        return ["#A855F7", "#F472B6"];
      case "Rare":
        return ["#3B82F6", "#06B6D4"];
      default:
        return ["#6B7280", "#9CA3AF"];
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case "Legendary":
        return "rgba(249, 115, 22, 0.3)";
      case "Epic":
        return "rgba(168, 85, 247, 0.3)";
      case "Rare":
        return "rgba(59, 130, 246, 0.3)";
      default:
        return "rgba(107, 114, 128, 0.2)";
    }
  };

  const StoryCard = ({ Story }: { Story: Story }) => (
    <TouchableOpacity
      style={[globalStyles.StoryCard, { opacity: Story.isLocked ? 0.6 : 1 }]}
      onPress={() => !Story.isLocked && onSelectStory(Story)}
      activeOpacity={Story.isLocked ? 1 : 0.8}
      disabled={Story.isLocked}
    >
      <LinearGradient
        colors={[
          "rgba(30, 41, 59, 0.95)",
          "rgba(51, 65, 85, 0.8)",
          "rgba(30, 41, 59, 0.95)",
        ]}
        style={globalStyles.StoryCardGradient}
      >
        <BlurView intensity={10} style={globalStyles.StoryCardBlur}>
          {/* Rarity Border */}
          <LinearGradient
            colors={getRarityColors(Story.rarity)}
            style={globalStyles.StoryRarityBorder}
          />

          {/* Lock Overlay */}
          {Story.isLocked && (
            <View style={globalStyles.StoryLockOverlay}>
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.6)"]}
                style={globalStyles.StoryLockGradient}
              >
                <Icon name="lock" size={24} color="#A855F7" />
                <Text
                  style={[globalStyles.StoryLockText, { color: "#A855F7" }]}
                >
                  Level {Story.unlockLevel} Required
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Header */}
          <View style={globalStyles.StoryCardHeader}>
            <View style={globalStyles.StoryTitleSection}>
              <Text style={[globalStyles.StoryCardTitle, { color: "#A855F7" }]}>
                {Story.title || "Untitled Story"}
              </Text>
              <Text
                style={[globalStyles.StoryCardCategory, { color: "#9CA3AF" }]}
              >
                {Story.category || "Unknown Category"}
              </Text>
            </View>

            <View style={globalStyles.StoryRarityBadge}>
              <LinearGradient
                colors={getRarityColors(Story.rarity)}
                style={globalStyles.StoryRarityBadgeGradient}
              >
                <Text style={globalStyles.StoryRarityBadgeText}>
                  {Story.rarity}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Progress Indicator */}
          {(Story.exploration || 0) > 0 && (
            <View style={globalStyles.StoryProgressSection}>
              <View style={globalStyles.StoryProgressHeader}>
                <Icon name="compass" size={12} color="#06B6D4" />
                <Text
                  style={[
                    globalStyles.StoryProgressLabel,
                    { color: "#06B6D4" },
                  ]}
                >
                  Exploration: {Story.exploration || 0}%
                </Text>
              </View>
              <View style={globalStyles.StoryProgressBar}>
                <LinearGradient
                  colors={["#06B6D4", "#A855F7"]}
                  style={[
                    globalStyles.StoryProgressFill,
                    { width: `${Story.exploration || 0}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={[globalStyles.StoryDescription, { color: "#9CA3AF" }]}>
            {Story.description || "No description available"}
          </Text>

          {/* Atmosphere */}
          <View style={globalStyles.StoryAtmosphereContainer}>
            <Icon name="eye" size={10} color="#06B6D4" />
            <Text
              style={[globalStyles.StoryAtmosphereText, { color: "#06B6D4" }]}
            >
              ✦ {Story.atmosphere || "Mysterious atmosphere"} ✦
            </Text>
          </View>

          {/* Skill Focus Tags */}
          <View style={globalStyles.StorySkillFocusContainer}>
            <Text
              style={[globalStyles.StorySkillFocusLabel, { color: "#9CA3AF" }]}
            >
              Coping Skills:
            </Text>
            <View style={globalStyles.StorySkillTags}>
              {(Story.skillFocus || []).slice(0, 2).map((skill, index) => (
                <View key={index} style={globalStyles.StorySkillTag}>
                  <Text style={globalStyles.StorySkillTagText}>{skill}</Text>
                </View>
              ))}
              {(Story.skillFocus || []).length > 2 && (
                <View style={globalStyles.StorySkillTag}>
                  <Text style={globalStyles.StorySkillTagText}>
                    +{(Story.skillFocus || []).length - 2}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stat Boosts */}
          <View style={globalStyles.StoryStatBoostsContainer}>
            <Text
              style={[globalStyles.StoryStatBoostsLabel, { color: "#9CA3AF" }]}
            >
              Strengthens:
            </Text>
            <View style={globalStyles.StoryStatBoostTags}>
              {(Story.statBoosts || []).map((stat, index) => (
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

          {/* Footer Info */}
          <View style={globalStyles.StoryFooter}>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="clock" size={12} color="#FB923C" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {Story.timeToComplete || "Unknown time"}
              </Text>
            </View>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="key" size={12} color="#A855F7" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {Story.revelations || 0} revelations
              </Text>
            </View>
            <View style={globalStyles.StoryFooterStat}>
              <Icon name="zap" size={12} color="#A855F7" />
              <Text
                style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
              >
                {Story.difficulty || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          {!Story.isLocked && (
            <View style={globalStyles.StoryActionButton}>
              <LinearGradient
                colors={["#7C3AED", "#A855F7"]}
                style={globalStyles.StoryActionButtonGradient}
              >
                <Icon name="book-open" size={14} color="#E0E7FF" />
                <Text style={globalStyles.StoryActionButtonText}>
                  {(Story.exploration || 0) > 0
                    ? "Continue Study"
                    : "Begin Reading"}
                </Text>
              </LinearGradient>
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <Icon
            name="loader"
            size={40}
            color="#A855F7"
            style={{ marginBottom: 16 }}
          />
          <Text style={{ color: "white", fontSize: 18, margin: 20 }}>
            Loading Storys from the Archive...
          </Text>
        </View>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
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
            onPress={onClose}
            style={{
              padding: 20,
              backgroundColor: "#333",
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <>
        <View style={globalStyles.StoryModalOverlay}>
          <LinearGradient
            colors={[
              "rgba(30, 41, 59, 0.95)",
              "rgba(51, 65, 85, 0.8)",
              "rgba(30, 41, 59, 0.95)",
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={globalStyles.StoryModalpassages}>
            <LinearGradient
              colors={[
                "rgba(30, 41, 59, 0.95)",
                "rgba(51, 65, 85, 0.8)",
                "rgba(30, 41, 59, 0.95)",
              ]}
              style={[
                globalStyles.StoryModalGradient,
                { borderColor: "#374151" },
              ]}
            >
              <BlurView intensity={20} style={globalStyles.StoryModalBlur}>
                {/* Header */}
                <View style={globalStyles.StoryModalHeader}>
                  <View style={globalStyles.StoryHeaderpassages}>
                    <Icon name="book" size={24} color="#A855F7" />
                    <Text
                      style={[
                        globalStyles.StoryModalTitle,
                        { color: "#A855F7" },
                      ]}
                    >
                      Archive of Storys
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TouchableOpacity
                        style={[
                          globalStyles.StoryCloseButton,
                          { marginRight: 8 },
                        ]}
                        onPress={() => runComprehensiveTest()}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(59, 130, 246, 0.8)",
                            "rgba(37, 99, 235, 0.8)",
                          ]}
                          style={globalStyles.StoryCloseButtonGradient}
                        >
                          <Text style={{ color: "#E0E7FF", fontSize: 12 }}>
                            Test
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={globalStyles.StoryCloseButton}
                        onPress={onClose}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(239, 68, 68, 0.8)",
                            "rgba(220, 38, 38, 0.8)",
                          ]}
                          style={globalStyles.StoryCloseButtonGradient}
                        >
                          <Icon name="x" size={18} color="#FECACA" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[
                      globalStyles.StoryModalSubtitle,
                      { color: "#9CA3AF" },
                    ]}
                  >
                    Ancient Storys of wisdom await your study. Each Story
                    contains powerful coping techniques disguised as mystical
                    knowledge.
                  </Text>
                </View>

                {/* Story Grid */}
                <ScrollView
                  style={globalStyles.StoryScrollView}
                  contentContainerStyle={globalStyles.StoryGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {Storys.length > 0 ? (
                    Storys.map((Story) => (
                      <StoryCard key={Story.id} Story={Story} />
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
                        color="#A855F7"
                        style={{ marginBottom: 16 }}
                      />
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 18,
                          textAlign: "center",
                        }}
                      >
                        No Storys Available
                      </Text>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 14,
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        The Archive is currently empty. Check back later for new
                        wisdom to discover.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </BlurView>
            </LinearGradient>
          </View>
        </View>
      </>
    </Modal>
  );
};

// Add a comprehensive test function
const runComprehensiveTest = async () => {
  console.log("=== RUNNING COMPREHENSIVE STORY TEST ===");

  try {
    // Test 1: Get story catalog
    console.log("1. Testing story catalog...");
    const catalog = await archiveService.getAvailableStories();
    console.log("Story catalog result:", catalog);
    console.log("Catalog length:", catalog?.length);

    if (catalog && catalog.length > 0) {
      const firstStory = catalog[0];
      console.log("First story:", firstStory);

      // Test 2: Get chapters for first story
      console.log("2. Testing chapters for story:", firstStory.id);
      const chapters = await archiveService.getChapters(firstStory.id);
      console.log("Chapters result:", chapters);

      if (chapters && chapters.length > 0) {
        const firstChapter = chapters[0];
        console.log("First chapter:", firstChapter);

        // Test 3: Get story passages from chapter
        console.log("3. Testing story passages from chapter:", firstChapter.id);
        const storypassages = await archiveService.getStorypassagesFromChapter(
          firstStory.id,
          firstChapter.id
        );
        console.log("Story passages result:", storypassages);
        console.log("Story passages passages:", storypassages?.passages);
        console.log(
          "Story passages passages length:",
          storypassages?.passages?.length
        );

        if (
          storypassages &&
          storypassages.passages &&
          storypassages.passages.length > 0
        ) {
          console.log("✅ SUCCESS: Story passages loaded with passages");
          console.log("First passage:", storypassages.passages[0]);
        } else {
          console.log("❌ FAILED: No passages in story passages");
        }
      } else {
        console.log("❌ FAILED: No chapters found");
      }
    } else {
      console.log("❌ FAILED: No stories in catalog");
    }
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
  }

  console.log("=== END COMPREHENSIVE TEST ===");
};

export default StoryCatalogModal;
