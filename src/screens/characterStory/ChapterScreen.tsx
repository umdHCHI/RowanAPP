import {
  BlurView,
  createGlobalStyles,
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

// Import useTheme directly to avoid circular dependency issues
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from "../../services/apiService";
import { ChapterSummary } from "../../types/story";

const { width, height } = Dimensions.get("window");

type ChapterScreenProps = {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  onChapterSelect: (chapterId: number) => void;
};

const ChapterScreen = ({
  visible,
  onClose,
  storyId,
  storyTitle,
  onChapterSelect,
}: ChapterScreenProps) => {
  const { theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chapters when modal becomes visible
  useEffect(() => {
    const loadChapters = async () => {
      if (!visible || !storyId) return;

      setIsLoading(true);
      setError(null);

      try {
        const backendChapters = await apiService.getChapters(storyId);

        if (backendChapters && backendChapters.length > 0) {
          setChapters(backendChapters);
        } else {
          setChapters([]);
        }
      } catch (error) {
        setError("Failed to load chapters from the Archive");
        setChapters([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChapters();
  }, [visible, storyId]);

  const handleChapterSelect = (chapter: ChapterSummary) => {
    onChapterSelect(chapter.id);
    onClose();
  };

  const ChapterCard = ({ chapter }: { chapter: ChapterSummary }) => (
    <TouchableOpacity
      style={globalStyles.StoryCard}
      onPress={() => handleChapterSelect(chapter)}
      activeOpacity={0.8}
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
          {/* Chapter Number Badge */}
          <View style={globalStyles.StoryRarityBadge}>
            <LinearGradient
              colors={["#A855F7", "#7C3AED"]}
              style={globalStyles.StoryRarityBadgeGradient}
            >
              <Text style={globalStyles.StoryRarityBadgeText}>
                Chapter {chapter.chapterNumber}
              </Text>
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={globalStyles.StoryCardHeader}>
            <View style={globalStyles.StoryTitleSection}>
              <Text style={[globalStyles.StoryCardTitle, { color: "#A855F7" }]}>
                {chapter.title || "Untitled Chapter"}
              </Text>
              {chapter.isStartingChapter && (
                <View style={globalStyles.StoryRarityBadge}>
                  <LinearGradient
                    colors={["#10B981", "#34D399"]}
                    style={globalStyles.StoryRarityBadgeGradient}
                  >
                    <Text style={globalStyles.StoryRarityBadgeText}>
                      Starting Point
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <View style={globalStyles.StoryActionButton}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={globalStyles.StoryActionButtonGradient}
            >
              <Icon name="book-open" size={14} color="#E0E7FF" />
              <Text style={globalStyles.StoryActionButtonText}>
                Begin Chapter
              </Text>
            </LinearGradient>
          </View>
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
            Loading Chapters...
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
                <View
                  style={[
                    globalStyles.StoryModalHeader,
                    { borderBottomColor: "#374151" },
                  ]}
                >
                  <View style={globalStyles.StoryHeaderpassages}>
                    <Icon name="book" size={24} color="#A855F7" />
                    <Text
                      style={[
                        globalStyles.StoryModalTitle,
                        { color: "#A855F7" },
                      ]}
                    >
                      Select Chapter
                    </Text>
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
                  <Text
                    style={[
                      globalStyles.StoryModalSubtitle,
                      { color: "#9CA3AF" },
                    ]}
                  >
                    {storyTitle}
                  </Text>
                  <Text
                    style={[
                      globalStyles.StoryModalSubtitle,
                      { color: "#9CA3AF", fontSize: 14 },
                    ]}
                  >
                    Choose which chapter to begin your journey
                  </Text>
                </View>

                {/* Chapters Grid */}
                <ScrollView
                  style={globalStyles.StoryScrollView}
                  contentContainerStyle={globalStyles.StoryGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <ChapterCard key={chapter.id} chapter={chapter} />
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
                        No Chapters Available
                      </Text>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 14,
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        This story may not have chapters yet.
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

export default ChapterScreen;
