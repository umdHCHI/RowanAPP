import { useMasterState } from '../../context/MasterStateContext';
import {
  Alert,
  ArchiveArea,
  ArchiveMapModal,
  BlurView,
  CharacterPreview,
  CodexModal,
  Dimensions,
  Icon,
  Image,
  LinearGradient,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ThoughtDefenderModal,
  TouchableOpacity,
  View,
  useEffect,
  useState
} from '../../imports';

// Import GrimoireScreen directly to avoid circular dependency issues
import GrimoireScreen from './StoryScreen';
// Import ChapterScreen for chapter selection
import ChapterScreen from './ChapterScreen';
// Import archive service for backend operations
import { archiveService } from '../../services/archiveService';

const { width, height } = Dimensions.get('window');

const ArchiveInterface: React.FC = () => {
  // Use MasterStateContext instead of individual contexts
  const { 
    theme, 
    auth, 
    onboarding, 
    character, 
    equipment, 
    archive, 
    ui, 
    loading,
    wellness
  } = useMasterState();
  
  // Local state for stories
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  
  // Chapter selection state
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  // Load stories from backend on mount
  useEffect(() => {
    const loadStories = async () => {
      setIsLoadingStories(true);
      try {
        const backendStories = await archiveService.getAvailableStories();
        if (backendStories && backendStories.length > 0) {
          setStories(backendStories);
          ui.setMemoryGrimoires(backendStories);
        } else {
          setStories([]);
          ui.setMemoryGrimoires([]);
        }
      } catch (error) {
        setStories([]);
        ui.setMemoryGrimoires([]);
      } finally {
        setIsLoadingStories(false);
      }
    };

    loadStories();
  }, []);

  // Story handlers
  const handleOpenGrimoire = async (grimoire: any) => {
    try {
      console.log('=== handleOpenGrimoire called ===');
      console.log('Grimoire data:', grimoire);
      console.log('Grimoire ID:', grimoire?.id);
      console.log('Grimoire title:', grimoire?.title);
      
      setSelectedStory(grimoire);
      setIsChapterScreenVisible(true);
    } catch (error) {
      console.error('Error in handleOpenGrimoire:', error);
      // Show error to user
      Alert.alert(
        'Error',
        'Failed to open story. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleDirectStoryOpen = async (grimoire: any) => {
    try {
      // Get story content from backend
      const storyContent = await archiveService.getStoryContent(grimoire.id);
      if (storyContent) {
        ui.openGrimoire({ ...grimoire, content: storyContent });
      } else {
        // Show error if no content found
        Alert.alert(
          'No Content Available',
          'This story does not have any content yet.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error opening story:', error);
      Alert.alert(
        'Error',
        'Failed to load story content. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      console.log('=== handleChapterSelect called ===');
      console.log('Chapter ID:', chapterId);
      console.log('Selected story:', selectedStory);
      console.log('Selected story ID:', selectedStory?.id);
      
      // Close the chapter selection modal first
      setIsChapterScreenVisible(false);
      
      // For chapter-based stories, we need to get the story content with the specific chapter
      if (selectedStory?.id) {
        console.log('Opening story with chapter:', selectedStory.id, 'chapter:', chapterId);
        
        // Get story content from the selected chapter
        const storyContent = await archiveService.getStoryContentFromChapter(selectedStory.id, chapterId);
        console.log('Story content result:', storyContent);
        console.log('Story content passages:', storyContent?.passages);
        console.log('Story content passages length:', storyContent?.passages?.length);
        
        if (storyContent) {
          console.log('Opening story with chapter content:', storyContent);
          console.log('Story content passages:', storyContent.passages);
          console.log('Number of passages in story content:', storyContent.passages?.length);
          
          // Create a modified story object with chapter information
          const storyWithChapter = {
            ...selectedStory,
            content: storyContent // Pass the entire storyContent object directly
          };
          console.log('Final story object being passed to StoryScreen:', storyWithChapter);
          console.log('Final story object content passages:', storyWithChapter.content?.passages);
          console.log('Final story object content passages length:', storyWithChapter.content?.passages?.length);
          ui.openGrimoire(storyWithChapter);
        } else {
          console.log('No content found for chapter');
          Alert.alert(
            'No Content Available',
            'This chapter does not have any content yet.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        console.log('No selected story');
        Alert.alert(
          'Error',
          'No story selected. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error opening chapter:', error);
      Alert.alert(
        'Error',
        'Failed to load chapter content. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = async (completionData: {
    grimoireId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }) => {
    try {
      // Close modal
      ui.closeStory();

      // Update progress using the master state
      archive.handleStoryComplete(completionData.grimoireId);

      // Try to save completion to backend
      if (auth.characterId) {
        await archiveService.completeStory(auth.characterId, completionData.grimoireId, {
          finalRewards: completionData.finalRewards,
          skillsLearned: completionData.skillsLearned,
          totalStatGains: completionData.totalStatGains
        });
      }

      // Add final rewards as artifacts
      const newArtifacts = completionData.finalRewards.map((reward, index) => ({
        name: reward,
        type: 'Completion Reward',
        equipped: false,
        resonance: 85 + (index * 5),
        description: `Awarded for completing the grimoire journey`,
        rarity: 'Epic' as const,
      }));
      archive.setFinalRewardsArtifacts([...archive.finalRewardsArtifacts, ...newArtifacts]);

      // Add learned skills
      archive.handleSkillLearned(completionData.skillsLearned);

      // Show completion alert
      Alert.alert(
        '📚 Grimoire Mastered! ✨',
        `Your journey has transformed your understanding.`,
        [{ text: 'Continue Exploring', style: 'default' }]
      );
    } catch (error) {
      // Still show completion alert even if backend save fails
      Alert.alert(
        '📚 Grimoire Mastered! ✨',
        `Your journey has transformed your understanding.`,
        [{ text: 'Continue Exploring', style: 'default' }]
      );
    }
  };

  // Codex handlers
  const handleCodexEntrySubmit = (entry: {
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    archive.handleCodexEntry(entry);
    
    Alert.alert(
      '📝 Reflection Recorded',
      `Your ${entry.skillCategory} reflection has been added to the Archive.`,
      [{ text: 'Continue Exploring', style: 'default' }]
    );
  };

  // Mini-game handlers
  const handleMiniGameCompleteSubmit = (gameType: 'thoughtDefender' | 'drawing', data: any) => {
    archive.handleMiniGameComplete(gameType, data);
    
    if (gameType === 'thoughtDefender' && data.won) {
      Alert.alert(
        '🏆 Mind Defense Victory!',
        `You've successfully defended your mind!\n\nLevel: ${data.level}\nScore: ${data.score}`,
        [{ text: 'Excellent!', style: 'default' }]
      );
    } else if (gameType === 'drawing') {
      Alert.alert(
        '🎨 Creative Expression Recorded',
        'Your drawing has been added to the Archive.',
        [{ text: 'Continue Creating', style: 'default' }]
      );
    }
  };

  // Tab button component
  const TabButton: React.FC<{
    title: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
  }> = ({ title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[theme.styles.tabButton, isActive && theme.styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <LinearGradient
          colors={['rgba(217, 119, 6, 0.4)', 'rgba(251, 146, 60, 0.4)']}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Icon name={icon} size={18} color={isActive ? '#FCD34D' : '#9CA3AF'} />
      <Text style={[theme.styles.tabText, isActive && theme.styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Character display component - Updated to use home_data consistently
  const CharacterDisplay = () => {
    // Use homeData from wellness context which comes from the home_data endpoint
    const homeData = wellness.homeData;
    const backendCharacter = character.backendCharacter;
    
    // Check if we have character data from home_data endpoint
    const hasHomeData = homeData?.character;
    const hasBackendCharacter = backendCharacter;
    
    if (!hasHomeData && !hasBackendCharacter) {
      return (
        <View style={theme.styles.centralCharacterDisplay}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.3)']}
            style={theme.styles.characterFrame}
          >
            <View style={theme.styles.characterFrameInner}>
              <Text style={[theme.styles.archiveText, { textAlign: 'center' }]}>
                No character created yet
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    // Use home_data character if available, otherwise fall back to backend character
    const characterData = hasHomeData ? homeData.character : backendCharacter;
    const wellnessStats = hasHomeData ? homeData.character.wellness_stats : null;

    // Ensure characterData is not null before using it
    if (!characterData) {
      return (
        <View style={theme.styles.centralCharacterDisplay}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.3)']}
            style={theme.styles.characterFrame}
          >
            <View style={theme.styles.characterFrameInner}>
              <Text style={[theme.styles.archiveText, { textAlign: 'center' }]}>
                Character data unavailable
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={theme.styles.centralCharacterDisplay}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.3)']}
          style={theme.styles.characterFrame}
        >
          <View style={theme.styles.characterFrameInner}>
            {/* Use CharacterPreview component for consistent display with CharacterCreatorScreen */}
            <CharacterPreview
              baseAsset={character.getBaseAsset()}
              background={character.getCurrentBackgroundAsset()}
              hairSheet={character.getHairAsset()}
              clothesSheet={character.getClothesAsset()}
              eyesSheet={character.getEyesAsset()}
              eyebrowsSheet={character.getEyebrowsAsset()}
              mouthSheet={character.getMouthAsset()}
              hairIndex={character.getHairIndex()}
              clothesIndex={character.getClothesIndex()}
              eyesIndex={character.getEyesIndex()}
              eyebrowsIndex={character.getEyebrowsIndex()}
              mouthIndex={character.selectedMouthType}
            />
            
            {/* Character Level and Status */}
            <View style={theme.styles.characterLevelBadge}>
              <LinearGradient colors={['#FCD34D', '#F59E0B']} style={theme.styles.levelBadgeGradient}>
                <Text style={theme.styles.levelBadgeText}>Lv.{characterData.level || 1}</Text>
              </LinearGradient>
            </View>
            
            {/* Essence Resonance Indicator */}
            <View style={theme.styles.essenceResonanceIndicator}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']}
                style={theme.styles.essenceResonanceGradient}
              >
                <Icon name="zap" size={12} color="#FCD34D" />
                <Text style={theme.styles.essenceResonanceText}>{characterData.wellness_average || 87}% Resonance</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
        
        {/* Character Mood Bubble */}
        <View style={theme.styles.characterMoodBubble}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            style={theme.styles.moodBubbleGradient}
          >
            <Text style={theme.styles.moodBubbleText}>
              "Ready to explore the depths of memory..."
            </Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  return (
    <View style={theme.styles.archiveContainer}>
      <StatusBar barStyle={theme.themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.theme.archiveBackground} />
      
      {/* Gothic Background */}
      <LinearGradient
        colors={[theme.theme.archiveGradientStart, theme.theme.archiveGradientMiddle, theme.theme.archiveGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Atmospheric Overlay */}
      <View style={theme.styles.atmosphericOverlay} />

      <View style={theme.styles.archiveContent}>
        {/* Archive Header */}
        <View style={theme.styles.archiveHeader}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.6)']}
            style={theme.styles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={theme.styles.archiveHeaderContent}>
              <View style={theme.styles.archiveHeaderLeft}>
                <LinearGradient
                  colors={['#D97706', '#F97316', '#DC2626']}
                  style={theme.styles.archiveHeaderIcon}
                >
                  <Icon name="book" size={20} color="white" />
                  <View style={theme.styles.archiveHeaderIconOverlay}>
                    <Icon name="zap" size={12} color="#FCD34D" />
                  </View>
                </LinearGradient>
                <View style={theme.styles.archiveHeaderTextContainer}>
                  <Text style={theme.styles.archiveHeaderTitle}>The Archive</Text>
                  <Text style={theme.styles.archiveHeaderSubtitle}>Keeper of Memory • Curator of Hidden Knowledge</Text>
                  <View style={theme.styles.archiveStatusIndicator}>
                    <View style={theme.styles.archiveStatusDot} />
                    <Text style={theme.styles.archiveStatusText}>Archive systems active</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={theme.styles.archiveTabContainer}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.8)']}
            style={theme.styles.archiveTabGradient}
          >
            <BlurView intensity={20} style={theme.styles.archiveTabContent}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={theme.styles.archiveTabScrollContent}
              >
                <TabButton title="Entrance Hall" icon="home" isActive={ui.activeTab === 'entrance'} onPress={() => ui.setActiveTab('entrance')} />
                <TabButton title="Ancient Grimoires" icon="book-open" isActive={ui.activeTab === 'tomes'} onPress={() => ui.setActiveTab('tomes')} />
                <TabButton title="Codex" icon="edit-3" isActive={ui.activeTab === 'codex'} onPress={() => ui.setActiveTab('codex')} />
                <TabButton title="Mind Defender" icon="zap" isActive={ui.activeTab === 'defender'} onPress={() => ui.setActiveTab('defender')} />
                <TabButton title="Memory Map" icon="map" isActive={ui.activeTab === 'map'} onPress={() => ui.setActiveTab('map')} />
                <TabButton title="Restoration" icon="award" isActive={ui.activeTab === 'restoration'} onPress={() => ui.setActiveTab('restoration')} />
              </ScrollView>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Content */}
        <ScrollView style={theme.styles.archiveTabContentContainer} showsVerticalScrollIndicator={false}>
          
          {/* Entrance Hall Tab */}
          {ui.activeTab === 'entrance' && (
            <View style={theme.styles.tabContentArea}>
              {/* Avatar Showcase Section */}
              <View style={theme.styles.avatarShowcaseSection}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
                  style={theme.styles.avatarShowcaseGradient}
                >
                  {/* Header */}
                  <View style={theme.styles.avatarShowcaseHeader}>
                    <Icon name="user" size={20} color="#A855F7" />
                    <Text style={theme.styles.avatarShowcaseTitle}>Avatar Manifestation</Text>
                    <Icon name="user" size={20} color="#A855F7" />
                  </View>
                  
                  {/* Character Info Bar */}
                  <View style={theme.styles.characterInfoBar}>
                    <View style={theme.styles.characterDetails}>
                      <Text style={theme.styles.characterRarity}>Memory Archivist</Text>
                      <Text style={theme.styles.characterClass}>Keeper of Hidden Knowledge</Text>
                      <Text style={theme.styles.characterName}>
                        {wellness.homeData?.character?.name || character.characterName || 'Unnamed Character'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={theme.styles.researchConditionBadge}
                      onPress={() => ui.setResearchCondition(ui.researchCondition === 'character' ? 'personality' : 'character')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={ui.researchCondition === 'character' 
                          ? ['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']
                          : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']
                        }
                        style={theme.styles.researchConditionGradient}
                      >
                        <Text style={theme.styles.researchConditionText}>
                          {ui.researchCondition === 'character' ? '✦ Avatar Path ✦' : '⧫ Essence Path ⧫'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Main Character Display with Gear */}
                  <View style={theme.styles.characterDisplaySection}>
                    {/* Left Gear Column */}
                    <View style={theme.styles.gearColumn}>
                      {[
                        { type: 'focus' as keyof typeof equipment.equippedItems, label: 'Clarity Relic', icon: '🔮' },
                        { type: 'comfort' as keyof typeof equipment.equippedItems, label: 'Sanctuary Codex', icon: '📜' }
                      ].map((slot, i) => (
                        <TouchableOpacity 
                          key={i}
                          style={theme.styles.gearSlot}
                          onPress={() => {/* Open equipment modal */}}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.7)']}
                            style={theme.styles.gearSlotGradient}
                          >
                            {equipment.equippedItems[slot.type] ? (
                              <Image
                                source={equipment.getItemIcon(equipment.equippedItems[slot.type]!)}
                                style={theme.styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={theme.styles.emptyGearSlot}>
                                <Text style={theme.styles.gearSlotIcon}>{slot.icon}</Text>
                                <Text style={theme.styles.gearSlotLabel}>{slot.label}</Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Central Character Display */}
                    <CharacterDisplay />

                    {/* Right Gear Column */}
                    <View style={theme.styles.gearColumn}>
                      {[
                        { type: 'shield' as keyof typeof equipment.equippedItems, label: 'Guardian Ward', icon: '🛡️' },
                        { type: 'ground' as keyof typeof equipment.equippedItems, label: 'Foundation Stone', icon: '⚓' }
                      ].map((slot, i) => (
                        <TouchableOpacity 
                          key={i}
                          style={theme.styles.gearSlot}
                          onPress={() => {/* Open equipment modal */}}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.7)']}
                            style={theme.styles.gearSlotGradient}
                          >
                            {equipment.equippedItems[slot.type] ? (
                              <Image
                                source={equipment.getItemIcon(equipment.equippedItems[slot.type]!)}
                                style={theme.styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={theme.styles.emptyGearSlot}>
                                <Text style={theme.styles.gearSlotIcon}>{slot.icon}</Text>
                                <Text style={theme.styles.gearSlotLabel}>{slot.label}</Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Research Condition Info */}
                  {ui.researchCondition === 'personality' && (
                    <View style={theme.styles.researchConditionInfo}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.3)']}
                        style={theme.styles.researchConditionInfoGradient}
                      >
                        <Icon name="zap" size={16} color="#FCD34D" />
                        <Text style={theme.styles.researchConditionInfoTitle}>Essence-Calibrated Avatar</Text>
                        <Text style={theme.styles.researchConditionInfoText}>
                          Your avatar's manifestation has been shaped by the deepest readings of your psychological essence patterns
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </LinearGradient>
              </View>

              {/* Archive Foundations Section - Updated to use home_data metrics */}
              <View style={theme.styles.foundationsSection}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={theme.styles.foundationsSectionGradient}
                >
                  <View style={theme.styles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#10B981" />
                    <Text style={theme.styles.foundationsTitle}>Archive Foundations</Text>
                    <Icon name="anchor" size={20} color="#10B981" />
                  </View>
                  <Text style={theme.styles.foundationsSubtitle}>
                    The ethereal pillars that support your mental architecture
                  </Text>
                  
                  <View style={theme.styles.foundationsGrid}>
                    {/* Use home_data wellness_stats if available, otherwise fall back to local archive foundations */}
                    {(wellness.homeData?.character?.wellness_stats || archive.archiveFoundations).map((foundation: any, index: number) => {
                      // Handle both wellness_stats format and archive foundations format
                      const isWellnessStats = 'label' in foundation && 'value' in foundation;
                      
                      if (isWellnessStats) {
                        // Format from home_data endpoint
                        return (
                          <TouchableOpacity
                            key={index}
                            style={theme.styles.foundationCard}
                            onPress={() => Alert.alert(
                              `${foundation.label} - Level ${Math.floor(foundation.value / 5) + 1}`,
                              `Your ${foundation.label.toLowerCase()} foundation\n\n🎯 Current Value: ${foundation.value}/20`
                            )}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.8)']}
                              style={theme.styles.foundationCardGradient}
                            >
                              <View style={theme.styles.foundationIconContainer}>
                                <Text style={theme.styles.foundationIcon}>{foundation.icon}</Text>
                              </View>
                              
                              <View style={theme.styles.foundationValueContainer}>
                                <Text style={theme.styles.foundationValue}>
                                  {foundation.value}<Text style={theme.styles.foundationMaxValue}>/20</Text>
                                </Text>
                                <Text style={theme.styles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>
                              
                              <View style={theme.styles.foundationProgressContainer}>
                                <View style={theme.styles.foundationProgressBar}>
                                  <LinearGradient
                                    colors={[foundation.color, foundation.color]}
                                    style={[theme.styles.foundationProgressFill, { width: `${(foundation.value / 20) * 100}%` }]}
                                  />
                                </View>
                                <Text style={theme.styles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>
                              
                              <Text style={theme.styles.foundationLabel}>{foundation.label}</Text>
                              <Text style={theme.styles.foundationDescription}>
                                Your {foundation.label.toLowerCase()} foundation
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      } else {
                        // Original archive foundations format
                        return (
                          <TouchableOpacity
                            key={index}
                            style={theme.styles.foundationCard}
                            onPress={() => Alert.alert(
                              `${foundation.label} - Level ${Math.floor(foundation.value / 2) + 1}`,
                              `${foundation.description}\n\n🎯 Next Unlock: ${foundation.nextUnlock}`
                            )}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.8)']}
                              style={theme.styles.foundationCardGradient}
                            >
                              <View style={theme.styles.foundationIconContainer}>
                                <Text style={theme.styles.foundationIcon}>{foundation.icon}</Text>
                                {foundation.recentGain > 0 && (
                                  <View style={theme.styles.recentGainBadge}>
                                    <LinearGradient
                                      colors={['#10B981', '#34D399']}
                                      style={theme.styles.recentGainGradient}
                                    >
                                      <Text style={theme.styles.recentGainText}>+{foundation.recentGain}</Text>
                                    </LinearGradient>
                                  </View>
                                )}
                              </View>
                              
                              <View style={theme.styles.foundationValueContainer}>
                                <Text style={theme.styles.foundationValue}>
                                  {foundation.value}<Text style={theme.styles.foundationMaxValue}>/{foundation.maxValue}</Text>
                                </Text>
                                <Text style={theme.styles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>
                              
                              <View style={theme.styles.foundationProgressContainer}>
                                <View style={theme.styles.foundationProgressBar}>
                                  <LinearGradient
                                    colors={foundation.colors as any}
                                    style={[theme.styles.foundationProgressFill, { width: `${(foundation.value / foundation.maxValue) * 100}%` }]}
                                  />
                                </View>
                                <Text style={theme.styles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>
                              
                              <Text style={theme.styles.foundationLabel}>{foundation.label}</Text>
                              <Text style={theme.styles.foundationDescription}>{foundation.description}</Text>
                              
                              <View style={theme.styles.nextUnlockContainer}>
                                <Icon name="lock" size={10} color="#FCD34D" />
                                <Text style={theme.styles.nextUnlockText}>{foundation.nextUnlock}</Text>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Ancient Grimoires Tab - Show grimoire list directly */}
          {ui.activeTab === 'tomes' && (
            <View style={theme.styles.tabContentArea}>
              {isLoadingStories ? (
                <View style={theme.styles.centeredMessageContainer}>
                  <Icon name="loader" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                  <Text style={theme.styles.centeredMessageTitle}>Loading Grimoires...</Text>
                  <Text style={theme.styles.centeredMessageText}>
                    Fetching ancient wisdom from the Archive...
                  </Text>
                </View>
              ) : stories.length > 0 ? (
                stories.map((grimoire, index) => (
                  <TouchableOpacity
                    key={index} 
                    style={theme.styles.chronicleCard}
                    onPress={() => handleOpenGrimoire(grimoire)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)'] as const}
                      style={theme.styles.chronicleGradient}
                    >
                      <View style={theme.styles.chronicleTopBorder} />
                      
                      <View style={theme.styles.chronicleHeader}>
                        <View style={theme.styles.chronicleInfo}>
                          <Text style={theme.styles.chronicleTitle}>{grimoire.title || 'Untitled Story'}</Text>
                          <View style={theme.styles.chronicleBadges}>
                            <View style={theme.styles.categoryBadge}>
                              <Text style={theme.styles.categoryBadgeText}>{grimoire.category || 'Unknown'}</Text>
                            </View>
                            <View style={theme.styles.difficultyBadge}>
                              <Text style={theme.styles.difficultyBadgeText}>{grimoire.difficulty || 'Unknown'}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      
                      <View style={theme.styles.chronicleDescriptionContainer}>
                        <Text style={theme.styles.chronicleDescription}>{grimoire.description || 'No description available'}</Text>
                        <Text style={theme.styles.chronicleAtmosphere}>✦ {grimoire.atmosphere || 'Mysterious atmosphere'} ✦</Text>
                      </View>
                      
                      <View style={theme.styles.explorationContainer}>
                        <View style={theme.styles.explorationHeader}>
                          <Icon name="compass" size={16} color="#06B6D4" />
                          <Text style={theme.styles.explorationLabel}>Exploration Progress</Text>
                          <Text style={theme.styles.explorationValue}>{grimoire.exploration || 0}%</Text>
                        </View>
                        <View style={theme.styles.explorationBar}>
                          <LinearGradient
                            colors={['#06B6D4', '#A855F7', '#4F46E5'] as const}
                            style={[theme.styles.explorationFill, { width: `${grimoire.exploration || 0}%` }]}
                          />
                        </View>
                      </View>
                      
                      <View style={theme.styles.chronicleStats}>
                        <View style={theme.styles.chronicleStat}>
                          <Icon name="key" size={16} color="#FCD34D" />
                          <Text style={theme.styles.chronicleStatText}>{grimoire.revelations || 0} revelations</Text>
                        </View>
                        <View style={theme.styles.chronicleStat}>
                          <Icon name="clock" size={16} color="#FB923C" />
                          <Text style={theme.styles.chronicleStatText}>{grimoire.timeToComplete || 'Unknown time'}</Text>
                        </View>
                      </View>
                      
                      <View style={theme.styles.chronicleButton}>
                        <LinearGradient
                          colors={['#7C3AED', '#4F46E5', '#7C3AED'] as const}
                          style={theme.styles.chronicleButtonGradient}
                        >
                          <Icon name="book-open" size={18} color="#E0E7FF" />
                          <Text style={theme.styles.chronicleButtonText}>
                            {archive.completedStories.has(grimoire.id) 
                              ? 'Restart Exploration' 
                              : grimoire.exploration > 0 
                                ? 'Resume Exploration' 
                                : 'Enter Ancient Grimoire'
                            }
                          </Text>
                        </LinearGradient>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={theme.styles.centeredMessageContainer}>
                  <Icon name="book" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                  <Text style={theme.styles.centeredMessageTitle}>No Grimoires Available</Text>
                  <Text style={theme.styles.centeredMessageText}>
                    The Archive is currently empty. Check back later for new wisdom to discover.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Codex Tab */}
          {ui.activeTab === 'codex' && (
            <View style={theme.styles.tabContentArea}>
              <View style={theme.styles.centeredMessageContainer}>
                <Icon name="edit-3" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                <Text style={theme.styles.centeredMessageTitle}>The Codex</Text>
                <Text style={theme.styles.centeredMessageText}>
                  Your personal journal for reflections, insights, and tracking your journey of self-discovery.
                </Text>
                <TouchableOpacity style={theme.styles.primaryButton} onPress={() => ui.setIsCodexVisible(true)}>
                  <LinearGradient colors={['#7C3AED', '#4F46E5']} style={theme.styles.primaryButtonGradient}>
                    <Icon name="book-open" size={18} color="#E0E7FF" />
                    <Text style={theme.styles.primaryButtonText}>Open Your Journal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mind Defender Tab */}
          {ui.activeTab === 'defender' && (
            <View style={theme.styles.tabContentArea}>
              <View style={theme.styles.centeredMessageContainer}>
                <Icon name="zap" size={40} color="#FCD34D" style={{ marginBottom: 16 }} />
                <Text style={theme.styles.centeredMessageTitle}>Mind Defender</Text>
                <Text style={theme.styles.centeredMessageText}>
                  A mini-game to train your focus and resilience against intrusive thoughts.
                </Text>
                <TouchableOpacity style={theme.styles.primaryButton} onPress={() => ui.setIsThoughtDefenderVisible(true)}>
                  <LinearGradient colors={['#F97316', '#F59E0B']} style={theme.styles.primaryButtonGradient}>
                    <Icon name="zap" size={18} color="#FEF3C7" />
                    <Text style={theme.styles.primaryButtonText}>Play Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Memory Map Tab */}
          {ui.activeTab === 'map' && (
            <View style={theme.styles.tabContentArea}>
              <View style={theme.styles.centeredMessageContainer}>
                <Icon name="map" size={40} color="#06B6D4" style={{ marginBottom: 16 }} />
                <Text style={theme.styles.centeredMessageTitle}>Memory Map</Text>
                <Text style={theme.styles.centeredMessageText}>
                  Explore the vast archive of your mind, unlock new areas, and discover hidden wisdom.
                </Text>
                <TouchableOpacity style={theme.styles.primaryButton} onPress={() => ui.setIsMapVisible(true)}>
                  <LinearGradient colors={['#06B6D4', '#3B82F6']} style={theme.styles.primaryButtonGradient}>
                    <Icon name="map" size={18} color="#E0E7FF" />
                    <Text style={theme.styles.primaryButtonText}>Explore the Map</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Restoration Tab - Updated to use home_data archive_metrics */}
          {ui.activeTab === 'restoration' && (
            <View style={theme.styles.archiveTabContentArea}>
              {/* Restoration metrics from home_data */}
              <View style={theme.styles.archiveRestorationGrid}>
                {(wellness.homeData?.archive_metrics || [
                  { 
                    icon: '📜', 
                    label: 'Memories Explored', 
                    value: `${archive.restorationMetrics.chroniclesExplored}/12`, 
                    progress: archive.restorationMetrics.chroniclesExplored / 12 * 100,
                    description: 'Memory fragments fully integrated'
                  },
                  { 
                    icon: '💎', 
                    label: 'Artifacts Discovered', 
                    value: `${archive.restorationMetrics.artifactsDiscovered}`, 
                    progress: archive.restorationMetrics.artifactsDiscovered / 50 * 100,
                    description: 'Coping mechanisms crystallized into tools'
                  },
                  { 
                    icon: '🗝️', 
                    label: 'Revelations Unlocked', 
                    value: `${archive.restorationMetrics.revelationsUnlocked}`, 
                    progress: archive.restorationMetrics.revelationsUnlocked / 100 * 100,
                    description: 'Hidden chambers of self-knowledge opened'
                  },
                ]).map((metric, index) => (
                  <View key={index} style={theme.styles.archiveRestorationCard}>
                    <LinearGradient
                      colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                      style={theme.styles.archiveRestorationCardGradient}
                    >
                      <Text style={theme.styles.archiveRestorationIcon}>{metric.icon}</Text>
                      <Text style={theme.styles.archiveRestorationLabel}>{metric.label}</Text>
                      <Text style={theme.styles.archiveRestorationValue}>{metric.value}</Text>
                      <Text style={theme.styles.archiveRestorationDescription}>
                        {wellness.homeData?.archive_metrics ? 
                          `Progress: ${metric.progress}%` : 
                          (metric as any).description || 'Archive progress tracking'
                        }
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      
      {/* Modals */}
      <GrimoireScreen
        visible={ui.isStoryVisible}
        onClose={handleCloseStory}
        grimoire={ui.selectedStory}
        onStatGain={() => {}} // This would be handled by the master state
        onArtifactUnlock={archive.handleArtifactUnlock}
        onSkillLearned={archive.handleSkillLearned}
        onStoryComplete={handleStoryCompleteLocal}
      />

      {/* Chapter Selection Modal */}
      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={selectedStory?.id || ''}
        storyTitle={selectedStory?.title || 'Unknown Story'}
        onChapterSelect={handleChapterSelect}
      />

      <CodexModal
        visible={ui.isCodexVisible}
        onClose={() => ui.setIsCodexVisible(false)}
        onSave={handleCodexEntrySubmit}
        unlockedAreas={archive.codexEntries.map(entry => entry.mapArea)}
      />

      <ThoughtDefenderModal
        visible={ui.isThoughtDefenderVisible}
        onClose={() => ui.setIsThoughtDefenderVisible(false)}
        onScoreUpdate={(data: { score: number; level: number; won: boolean }) => 
          handleMiniGameCompleteSubmit('thoughtDefender', data)
        }
      />

      <ArchiveMapModal
        visible={ui.isMapVisible}
        onClose={() => ui.setIsMapVisible(false)}
        onAreaSelect={(area: ArchiveArea) => ui.setCurrentMapRoomId(area.id)}
        completedEntries={archive.codexEntries.length}
        entries={archive.codexEntries}
        currentRoomId={ui.currentMapRoomId}
      />
    </View>
  );
};

export default ArchiveInterface; 