import {
  BlurView,
  createGlobalStyles,
  Dimensions,
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

import { Image, ImageBackground } from "react-native";
import { sectionIcons } from "../../assets/ui";
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from "../../services/apiService";
import { ChapterSummary } from "../../types/story";
import { hauntedLibraryBackground } from "../../../src/assets/index";

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
          "rgba(10, 11, 15, 0.95)",
          "rgba(30, 41, 59, 0.8)",
          "rgba(10, 11, 15, 0.95)",
        ]}
        style={[
          globalStyles.StoryCardGradient,
          {
            borderColor: "#d4af37",
            borderWidth: 1,
            shadowColor: "#d4af37",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
        ]}
      >
        <BlurView intensity={10} style={globalStyles.StoryCardBlur}>
          <View style={globalStyles.StoryCardHeader}>
            <View style={globalStyles.StoryTitleSection}>
              <Text
                style={[
                  globalStyles.StoryCardTitle,
                  {
                    color: "#4ee6e6",
                    fontSize: 18,
                    fontWeight: "bold",
                    textShadowColor: "rgba(0, 0, 0, 0.8)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 6,
                  },
                ]}
              >
                Chapter {chapter.chapterNumber}:{" "}
                {chapter.title || "Untitled Chapter"}
              </Text>
              {chapter.isStartingChapter && (
                <View style={[globalStyles.StoryRarityBadge, { marginTop: 8 }]}>
                  <LinearGradient
                    colors={["#d4af37", "#fbbf24"]}
                    style={globalStyles.StoryRarityBadgeGradient}
                  >
                    <Text
                      style={[
                        globalStyles.StoryRarityBadgeText,
                        { color: "#0a0b0f", fontWeight: "bold" },
                      ]}
                    >
                      Starting Point
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              globalStyles.StoryActionButton,
              {
                alignSelf: "flex-start",
                borderRadius: 20,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={["#4ee6e6", "#06b6d4"]}
              style={[
                globalStyles.StoryActionButtonGradient,
                {
                  shadowColor: "#4ee6e6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                  borderRadius: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                },
              ]}
            >
              <Image
                source={sectionIcons.bookOpen}
                style={{ width: 14, height: 14 }}
              />

              <Text
                style={[
                  globalStyles.StoryActionButtonText,
                  {
                    color: "#0a0b0f",
                    fontWeight: "bold",
                    marginLeft: 6,
                  },
                ]}
              >
                Begin Chapter
              </Text>
            </LinearGradient>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

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
          <Image
            source={sectionIcons.bookOpen}
            style={{ width: 40, height: 40 }}
          />
          <Text
            style={{
              color: "#4ee6e6",
              fontSize: 18,
              margin: 20,
              textShadowColor: "rgba(78, 230, 230, 0.5)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Loading Chapters...
          </Text>
        </View>
      </Modal>
    );
  }

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
          <Image
            source={sectionIcons.bookOpen}
            style={{ width: 40, height: 40 }}
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
        <View style={globalStyles.StoryModalpassages}>
          <ImageBackground
            source={hauntedLibraryBackground}
            resizeMode="cover"
            style={[
              globalStyles.StoryModalGradient,
              {
                borderColor: "#d4af37",
                borderWidth: 2,
                shadowColor: "#d4af37",
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                width: width * 0.9,
                height: height * 0.8,
                elevation: 12,
                overflow: "hidden",
                borderRadius: 12,
              },
            ]}
            imageStyle={{
              borderRadius: 10,
              opacity: 0.8,
            }}
          >
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.4)",
                "rgba(30, 41, 59, 0.3)",
                "rgba(10, 11, 15, 0.4)",
              ]}
              style={{ flex: 1 }}
            >
              <BlurView intensity={5} style={globalStyles.StoryModalBlur}>
                <View
                  style={[
                    globalStyles.StoryModalHeader,
                    {
                      borderBottomColor: "#d4af37",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    },
                  ]}
                >
                  <View style={[globalStyles.StoryHeaderpassages, { flex: 1 }]}>
                    <Image
                      source={sectionIcons.bookOpen}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text
                      style={[
                        globalStyles.StoryModalTitle,
                        {
                          color: "#4ee6e6",
                          fontSize: 28,
                          fontWeight: "bold",
                          letterSpacing: 3,
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 3 },
                          textShadowRadius: 8,
                        },
                      ]}
                    >
                      Select Chapter
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: "#ef4444",
                      shadowColor: "#ef4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                      width: 36,
                      height: 36,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={onClose}
                  >
                    <Text
                      style={{
                        color: "#ef4444",
                        fontSize: 24,
                        fontWeight: "bold",
                        lineHeight: 24,
                        textAlign: "center",
                        marginTop: -2,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <Text
                    style={[
                      globalStyles.StoryModalSubtitle,
                      {
                        color: "#ffe066",
                        fontSize: 16,
                        fontWeight: "bold",
                        textShadowColor: "rgba(0, 0, 0, 0.8)",
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                      },
                    ]}
                  >
                    {storyTitle}
                  </Text>
                  <Text
                    style={[
                      globalStyles.StoryModalSubtitle,
                      {
                        color: "#d4af37",
                        fontSize: 14,
                        fontStyle: "italic",
                        fontWeight: "600",
                        textShadowColor: "rgba(0, 0, 0, 0.8)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      },
                    ]}
                  >
                    Choose which chapter to begin your journey
                  </Text>
                </View>

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
                      <Image
                        source={sectionIcons.bookOpen}
                        style={{ width: 40, height: 40 }}
                      />
                      <Text
                        style={{
                          color: "#4ee6e6",
                          fontSize: 18,
                          textAlign: "center",
                          textShadowColor: "rgba(78, 230, 230, 0.5)",
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}
                      >
                        No Chapters Available
                      </Text>
                      <Text
                        style={{
                          color: "#d4af37",
                          fontSize: 14,
                          textAlign: "center",
                          marginTop: 8,
                          fontStyle: "italic",
                        }}
                      >
                        This story may not have chapters yet.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </BlurView>
            </LinearGradient>
          </ImageBackground>
        </View>
      </>
    </Modal>
  );
};

export default ChapterScreen;
