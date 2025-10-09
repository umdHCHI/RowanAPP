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
const { width } = Dimensions.get("window");

type StoryCatalogModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectStory: (Story: Story) => void;
};

// Progress filter options
type ProgressFilter = 'all' | 'completed' | 'in-progress' | 'not-started';

const StoryCatalogModal = ({
  visible,
  onClose,
  onSelectStory,
}: StoryCatalogModalProps) => {
  const { theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyProgress, setStoryProgress] = useState<Record<number, any>>({});
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'recent'>('progress');
  const [bookOpen] = useState(sectionIcons.bookOpen);
  useEffect(() => {
    const loadStories = async () => {
      if (!visible) return;

      setIsLoading(true);
      setError(null);

      try {
        const backendStories = await apiService.getCharacterStories();

        if (backendStories && backendStories.length > 0) {
          setStories(backendStories);
          
          // Load story progress for all stories
          await loadStoryProgress(backendStories);
        } else {
          setStories([]);
        }
      } catch (error) {
        setError("Failed to load stories from the Archive");
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [visible]);

  const loadStoryProgress = async (storyList: Story[]) => {
    try {
      const allProgress = await apiService.getStoryProgressRecords('');
      
      if (allProgress && allProgress.length > 0) {
        // Create a map of story ID to progress for efficient lookup
        const progressMap: Record<number, any> = {};
        allProgress.forEach((progress: any) => {
          progressMap[progress.story] = progress;
        });
        
        setStoryProgress(progressMap);
      } else {
        setStoryProgress({});
      }
    } catch (error) {
      setStoryProgress({});
    }
  };

  const getFilteredAndSortedStories = () => {
    let filteredStories = [...stories];

    switch (progressFilter) {
      case 'completed':
        filteredStories = filteredStories.filter(story => 
          storyProgress[story.id]?.is_completed
        );
        break;
      case 'in-progress':
        filteredStories = filteredStories.filter(story => 
          storyProgress[story.id] && !storyProgress[story.id].is_completed && storyProgress[story.id].passages_visited_count > 0
        );
        break;
      case 'not-started':
        filteredStories = filteredStories.filter(story => 
          !storyProgress[story.id] || storyProgress[story.id].passages_visited_count === 0
        );
        break;
      default:
        break;
    }

    filteredStories.sort((a, b) => {
      const progressA = storyProgress[a.id];
      const progressB = storyProgress[b.id];

      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'recent':
          const lastPlayedA = progressA?.last_played ? new Date(progressA.last_played).getTime() : 0;
          const lastPlayedB = progressB?.last_played ? new Date(progressB.last_played).getTime() : 0;
          return lastPlayedB - lastPlayedA;
        case 'progress':
        default:
          const storyOrder = {
            12: 1,
            27: 2,
            2: 3
          };
          
          const orderA = storyOrder[a.id as keyof typeof storyOrder] || 999;
          const orderB = storyOrder[b.id as keyof typeof storyOrder] || 999;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          const progressPercentA = progressA?.progress_percentage || 0;
          const progressPercentB = progressB?.progress_percentage || 0;
          return progressPercentB - progressPercentA;
      }
    });

    return filteredStories;
  };

  const handleStorySelection = async (selectedStory: Story) => {
    try {
      try {
        await apiService.restartStory(selectedStory.id);
      } catch (restartError) {
        // Silently handle restart error
      }
      
      const progress = storyProgress[selectedStory.id];
      
      if (progress) {
        onSelectStory(selectedStory);
      } else {
        try {
          const newProgress = await apiService.createStoryProgress(selectedStory.id, {
            current_passage_id: selectedStory.starting_passage_id || '',
            story_variables: {}
          });
          
          setStoryProgress(prev => ({
            ...prev,
            [selectedStory.id]: newProgress
          }));
          
          onSelectStory(selectedStory);
        } catch (progressError) {
          onSelectStory(selectedStory);
        }
      }
    } catch (error) {
      onSelectStory(selectedStory);
    }
  };

  const refreshStoryProgress = async () => {
    try {
      await loadStoryProgress(stories);
    } catch (error) {
      // Silently handle refresh error
    }
  };

  const getRarityColors = (rarity: string): readonly [string, string] => {
    const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
    
    switch (normalizedRarity) {
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
    const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
    
    switch (normalizedRarity) {
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

  const StoryCard = ({ Story }: { Story: Story }) => {
    const progress = storyProgress[Story.id];
    const isCompleted = progress?.is_completed || false;
    const progressPercentage = progress?.progress_percentage || 0;
    const lastPlayed = progress?.last_played;
    const hasProgress = !!progress;
    const passagesVisited = progress?.passages_visited_count || 0;
    const choicesMade = progress?.choices_made_count || 0;
    const completedAt = progress?.completed_at;

    return (
      <TouchableOpacity
        style={[globalStyles.StoryCard, { opacity: Story.isLocked ? 0.6 : 1 }]}
        onPress={() => !Story.isLocked && handleStorySelection(Story)}
        activeOpacity={Story.isLocked ? 1 : 0.8}
        disabled={Story.isLocked}
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
              colors={getRarityColors(Story.rarity || "Common")}
              style={globalStyles.StoryRarityBorder}
            />

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
                    Level {Story.unlockLevel || 1} Required
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
                  {Story.title || "Untitled Story"}
                </Text>
                <Text
                  style={[globalStyles.StoryCardCategory, { 
                    color: "#d4af37",
                    fontSize: 14,
                    fontStyle: 'italic',
                    fontWeight: '600',
                  }]}
                >
                  {Story.category || "Unknown Category"}
                </Text>
              </View>

              <View style={globalStyles.StoryRarityBadge}>
                <LinearGradient
                  colors={getRarityColors(Story.rarity || "Common")}
                  style={globalStyles.StoryRarityBadgeGradient}
                >
                  <Text style={globalStyles.StoryRarityBadgeText}>
                    {Story.rarity || "Common"}
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
                    Last played: {new Date(lastPlayed).toLocaleDateString()} at {new Date(lastPlayed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                )}
              </View>
            )}

            <Text style={[globalStyles.StoryDescription, { color: "#9CA3AF" }]}>
              {Story.description || "No description available"}
            </Text>

            <View style={globalStyles.StoryAtmosphereContainer}>
              <Icon name="eye" size={10} color="#06B6D4" />
              <Text
                style={[globalStyles.StoryAtmosphereText, { color: "#06B6D4" }]}
              >
                ✦ {Story.atmosphere || "Mysterious atmosphere"} ✦
              </Text>
            </View>

            <View style={globalStyles.StorySkillFocusContainer}>
              <Text
                style={[globalStyles.StorySkillFocusLabel, { color: "#9CA3AF" }]}
              >
                Coping Skills:
              </Text>
              <View style={globalStyles.StorySkillTags}>
                {(Story.skillFocus || ["General Wellness"]).slice(0, 2).map((skill, index) => (
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

            <View style={globalStyles.StoryStatBoostsContainer}>
              <Text
                style={[globalStyles.StoryStatBoostsLabel, { color: "#9CA3AF" }]}
              >
                Strengthens:
              </Text>
              <View style={globalStyles.StoryStatBoostTags}>
                {(Story.statBoosts || ["General Growth"]).map((stat, index) => (
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
                  {Story.timeToComplete || "10-15 min"}
                </Text>
              </View>
              <View style={globalStyles.StoryFooterStat}>
                <Icon name="key" size={12} color="#A855F7" />
                <Text
                  style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
                >
                  {Story.revelations || 1} revelations
                </Text>
              </View>
              <View style={globalStyles.StoryFooterStat}>
                <Icon name="zap" size={12} color="#A855F7" />
                <Text
                  style={[globalStyles.StoryFooterStatText, { color: "#9CA3AF" }]}
                >
                  {Story.difficulty || "Intermediate"}
                </Text>
              </View>
            </View>

            {!Story.isLocked && (
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

  const filteredStories = getFilteredAndSortedStories();

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
                          {Object.values(storyProgress).filter((p: any) => p.is_completed).length}
                        </Text>
                        <Text style={{ color: '#d4af37', fontSize: 12, fontStyle: 'italic' }}>Completed</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#ffe066', fontSize: 18, fontWeight: 'bold' }}>
                          {Object.values(storyProgress).filter((p: any) => !p.is_completed && p.passages_visited_count > 0).length}
                        </Text>
                        <Text style={{ color: '#d4af37', fontSize: 12, fontStyle: 'italic' }}>In Progress</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#ffe066', fontSize: 18, fontWeight: 'bold' }}>
                          {Math.round(Object.values(storyProgress).reduce((acc: number, p: any) => acc + (p.progress_percentage || 0), 0) / Math.max(Object.keys(storyProgress).length, 1))}%
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
                          Completed ({Object.values(storyProgress).filter((p: any) => p.is_completed).length})
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
                          In Progress ({Object.values(storyProgress).filter((p: any) => !p.is_completed && p.passages_visited_count > 0).length})
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
                    filteredStories.map((Story) => (
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
