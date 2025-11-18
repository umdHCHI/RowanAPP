import {
  BlurView,
  createGlobalStyles,
  Dimensions,
  Icon,
  Image,
  LinearGradient,
  Modal,
  React,
  ScrollView,
  Story,
  StyleSheet,
  Text,
  TouchableOpacity,
  useEffect,
  useState,
  View
} from "../../imports";

import { sectionIcons } from "../../assets/ui";
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from "../../services/apiService";
import { StoryCard } from "./components/StoryCard";
import { useStoryData } from "./hooks/useStoryData";
import { useStoryProgress } from "./hooks/useStoryProgress";
import { filterAndSortStories, calculateProgressStats, ProgressFilter, SortOption } from "./utils/storyHelpers";

const { width } = Dimensions.get("window");

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
  const { theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const {
    stories,
    isLoadingStories: isLoading,
    loadStories,
    setStories
  } = useStoryData();

  const {
    storyProgress,
    loadStoryProgress,
    refreshStoryProgress,
    handleStorySelection
  } = useStoryProgress({ stories, onSelectStory });

  const [error, setError] = useState<string | null>(null);
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('progress');
  const [bookOpen] = useState(sectionIcons.bookOpen);

  useEffect(() => {
    const loadData = async () => {
      if (!visible) return;

      setError(null);

      try {
        await loadStories();
      } catch (error) {
        setError("Failed to load stories from the Archive");
      }
    };

    loadData();
  }, [visible]);

  useEffect(() => {
    if (stories.length > 0) {
      loadStoryProgress(stories);
    }
  }, [stories.length]);

  const filteredStories = filterAndSortStories(
    stories,
    storyProgress,
    progressFilter,
    sortBy
  );

  const progressStats = calculateProgressStats(storyProgress);

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
            Loading Stories from the Archive...
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
              "rgba(10, 11, 15, 0.95)",
              "rgba(30, 41, 59, 0.8)",
              "rgba(10, 11, 15, 0.95)",
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={globalStyles.StoryModalpassages}>
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.95)",
                "rgba(30, 41, 59, 0.8)",
                "rgba(10, 11, 15, 0.95)",
              ]}
              style={[
                globalStyles.StoryModalGradient,
                {
                  borderColor: "#d4af37",
                  borderWidth: 2,
                  shadowColor: '#d4af37',
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <BlurView intensity={20} style={globalStyles.StoryModalBlur}>
                <View style={globalStyles.StoryModalHeader}>
                  <View style={globalStyles.StoryHeaderpassages}>
                    <Image source={bookOpen} style={{ width: 24, height: 24 }} />
                    <Text
                      style={[
                        globalStyles.StoryModalTitle,
                        {
                          color: "#4ee6e6",
                          fontSize: 28,
                          fontWeight: 'bold',
                          letterSpacing: 3,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 8,
                        },
                      ]}
                    >
                      Archive of Stories
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
                            "rgba(78, 230, 230, 0.8)",
                            "rgba(6, 182, 212, 0.8)",
                          ]}
                          style={globalStyles.StoryCloseButtonGradient}
                        >
                          <Text style={{ color: "#0a0b0f", fontSize: 12, fontWeight: 'bold' }}>
                            Test
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          globalStyles.StoryCloseButton,
                          { marginRight: 8 },
                        ]}
                        onPress={() => refreshStoryProgress()}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(212, 175, 55, 0.8)",
                            "rgba(251, 191, 36, 0.8)",
                          ]}
                          style={globalStyles.StoryCloseButtonGradient}
                        >
                          <Text style={{ color: "#0a0b0f", fontSize: 12, fontWeight: 'bold' }}>
                            Refresh
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
                          <Icon name="x" size={16} color="#E0E7FF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {Object.keys(storyProgress).length > 0 && (
                  <View style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.1)',
                    borderRadius: 12,
                    padding: 12,
                    marginHorizontal: 16,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: '#4ee6e6',
                    shadowColor: '#4ee6e6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Icon name="trending-up" size={16} color="#4ee6e6" />
                      <Text style={{
                        color: '#4ee6e6',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginLeft: 6,
                        textShadowColor: 'rgba(78, 230, 230, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your Progress Summary
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#ffe066', fontSize: 18, fontWeight: 'bold' }}>
                          {progressStats.completed}
                        </Text>
                        <Text style={{ color: '#d4af37', fontSize: 12, fontStyle: 'italic' }}>Completed</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#ffe066', fontSize: 18, fontWeight: 'bold' }}>
                          {progressStats.inProgress}
                        </Text>
                        <Text style={{ color: '#d4af37', fontSize: 12, fontStyle: 'italic' }}>In Progress</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#ffe066', fontSize: 18, fontWeight: 'bold' }}>
                          {progressStats.averageProgress}%
                        </Text>
                        <Text style={{ color: '#d4af37', fontSize: 12, fontStyle: 'italic' }}>Avg Progress</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  marginBottom: 16
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#d4af37', fontSize: 12, marginRight: 8, fontStyle: 'italic' }}>Filter:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          marginRight: 8,
                          backgroundColor: progressFilter === 'all' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                          borderWidth: 1,
                          borderColor: progressFilter === 'all' ? '#4ee6e6' : '#374151'
                        }}
                        onPress={() => setProgressFilter('all')}
                      >
                        <Text style={{ color: progressFilter === 'all' ? '#0a0b0f' : '#d4af37', fontSize: 11, fontWeight: '600' }}>
                          All ({stories.length})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          marginRight: 8,
                          backgroundColor: progressFilter === 'completed' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                          borderWidth: 1,
                          borderColor: progressFilter === 'completed' ? '#4ee6e6' : '#374151'
                        }}
                        onPress={() => setProgressFilter('completed')}
                      >
                        <Text style={{ color: progressFilter === 'completed' ? '#0a0b0f' : '#d4af37', fontSize: 11, fontWeight: '600' }}>
                          Completed ({progressStats.completed})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          marginRight: 8,
                          backgroundColor: progressFilter === 'in-progress' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                          borderWidth: 1,
                          borderColor: progressFilter === 'in-progress' ? '#4ee6e6' : '#374151'
                        }}
                        onPress={() => setProgressFilter('in-progress')}
                      >
                        <Text style={{ color: progressFilter === 'in-progress' ? '#0a0b0f' : '#d4af37', fontSize: 11, fontWeight: '600' }}>
                          In Progress ({progressStats.inProgress})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: progressFilter === 'not-started' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                          borderWidth: 1,
                          borderColor: progressFilter === 'not-started' ? '#4ee6e6' : '#374151'
                        }}
                        onPress={() => setProgressFilter('not-started')}
                      >
                        <Text style={{ color: progressFilter === 'not-started' ? '#0a0b0f' : '#d4af37', fontSize: 11, fontWeight: '600' }}>
                          Not Started ({stories.filter(story => !storyProgress[story.id] || storyProgress[story.id].passages_visited_count === 0).length})
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#d4af37', fontSize: 12, marginRight: 8, fontStyle: 'italic' }}>Sort:</Text>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginRight: 4,
                        backgroundColor: sortBy === 'progress' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                        borderWidth: 1,
                        borderColor: sortBy === 'progress' ? '#4ee6e6' : '#374151'
                      }}
                      onPress={() => setSortBy('progress')}
                    >
                      <Text style={{ color: sortBy === 'progress' ? '#0a0b0f' : '#d4af37', fontSize: 10, fontWeight: '600' }}>
                        Progress
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginRight: 4,
                        backgroundColor: sortBy === 'recent' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                        borderWidth: 1,
                        borderColor: sortBy === 'recent' ? '#4ee6e6' : '#374151'
                      }}
                      onPress={() => setSortBy('recent')}
                    >
                      <Text style={{ color: sortBy === 'recent' ? '#0a0b0f' : '#d4af37', fontSize: 10, fontWeight: '600' }}>
                        Recent
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: sortBy === 'title' ? 'rgba(78, 230, 230, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                        borderWidth: 1,
                        borderColor: sortBy === 'title' ? '#4ee6e6' : '#374151'
                      }}
                      onPress={() => setSortBy('title')}
                    >
                      <Text style={{ color: sortBy === 'title' ? '#0a0b0f' : '#d4af37', fontSize: 10, fontWeight: '600' }}>
                        Title
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  style={globalStyles.StoryScrollView}
                  contentContainerStyle={globalStyles.StoryGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredStories.length > 0 ? (
                    filteredStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        progress={storyProgress[story.id]}
                        onSelect={() => handleStorySelection(story)}
                        globalStyles={globalStyles}
                      />
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
                        {progressFilter === 'all' ? 'No Stories Available' : `No ${progressFilter.replace('-', ' ')} Stories`}
                      </Text>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 14,
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        {progressFilter === 'all'
                          ? 'The Archive is currently empty. Check back later for new wisdom to discover.'
                          : `Try changing the filter to see other stories.`
                        }
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

const runComprehensiveTest = async () => {
  try {
    const catalog = await apiService.getAvailableStories();

    if (catalog && catalog.length > 0) {
      const firstStory = catalog[0];
      const allProgress = await apiService.getStoryProgressRecords('');
      const storyProgress = await apiService.getStoryProgress(firstStory.id);
      const chapters = await apiService.getChapters(firstStory.id);

      if (chapters && chapters.length > 0) {
        const firstChapter = chapters[0];
        const storypassages = await apiService.getStorypassagesFromChapter(
          firstStory.id,
          firstChapter.id
        );
      }
    }
  } catch (error) {
    // Silently handle test error
  }
};

export default StoryCatalogModal;
