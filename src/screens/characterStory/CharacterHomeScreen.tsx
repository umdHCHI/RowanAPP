import { useMasterState } from '../../context/MasterStateContext';
import {
  Alert,
  ArchiveArea,
  ArchiveMapModal,
  BlurView,
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
  baseOptions,
  bgOptions,
  clothesOptions,
  eyesOptions,
  hairOptions,
  mouthOptions
} from '../../imports';

import GrimoireScreen from './StoryScreen';

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
    loading 
  } = useMasterState();
  
  // Story handlers
  const handleOpenGrimoire = (grimoire: any) => {
    ui.openGrimoire(grimoire);
  };

  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = (completionData: {
    grimoireId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }) => {
    // Close modal
    ui.closeStory();

    // Update progress using the master state
    archive.handleStoryComplete(completionData.grimoireId);

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
      `Your journey through the ${ui.selectedStory?.title} has transformed your understanding.`,
      [{ text: 'Continue Exploring', style: 'default' }]
    );
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
              
              <TouchableOpacity
                style={theme.styles.archiveSecondaryButton}
                onPress={() => ui.setResearchCondition(ui.researchCondition === 'character' ? 'personality' : 'character')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={ui.researchCondition === 'character' 
                    ? ['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']
                    : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']
                  }
                  style={theme.styles.archiveSecondaryButtonGradient}
                >
                  <Icon name="shuffle" size={14} color="#FCD34D" />
                  <Text style={theme.styles.archiveSecondaryButtonText}>Switch Paradigm</Text>
                </LinearGradient>
              </TouchableOpacity>
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
                      <Text style={theme.styles.characterName}>Ira, the Seeker</Text>
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
                    <View style={theme.styles.centralCharacterDisplay}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.3)']}
                        style={theme.styles.characterFrame}
                      >
                        <View style={theme.styles.characterFrameInner}>
                          {character.appearance && (
                            <View style={theme.styles.fullCharacterPreview}>
                              <Image source={bgOptions[character.appearance.background]} style={[theme.styles.fullCharacterLayer, theme.styles.backgroundLayer]} />
                              <Image source={baseOptions[character.appearance.skin]} style={theme.styles.fullCharacterLayer} />
                              <Image source={hairOptions[character.appearance.hair]} style={theme.styles.fullCharacterLayer} />
                              <Image source={clothesOptions[character.appearance.clothes]} style={theme.styles.fullCharacterLayer} />
                              <Image source={eyesOptions[character.appearance.eyes]} style={theme.styles.fullCharacterLayer} />
                              <Image source={mouthOptions[character.appearance.mouth]} style={theme.styles.fullCharacterLayer} />
                            </View>
                          )}
                          
                          {/* Character Level and Status */}
                          <View style={theme.styles.characterLevelBadge}>
                            <LinearGradient colors={['#FCD34D', '#F59E0B']} style={theme.styles.levelBadgeGradient}>
                              <Text style={theme.styles.levelBadgeText}>Lv.3</Text>
                            </LinearGradient>
                          </View>
                          
                          {/* Essence Resonance Indicator */}
                          <View style={theme.styles.essenceResonanceIndicator}>
                            <LinearGradient
                              colors={['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']}
                              style={theme.styles.essenceResonanceGradient}
                            >
                              <Icon name="zap" size={12} color="#FCD34D" />
                              <Text style={theme.styles.essenceResonanceText}>87% Resonance</Text>
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

              {/* Archive Foundations Section */}
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
                    {archive.archiveFoundations.map((foundation, index) => (
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
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Ancient Grimoires Tab - Show grimoire list directly */}
          {ui.activeTab === 'tomes' && (
            <View style={theme.styles.tabContentArea}>
              {ui.memoryGrimoires.map((grimoire, index) => (
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
                        <Text style={theme.styles.chronicleTitle}>{grimoire.title}</Text>
                        <View style={theme.styles.chronicleBadges}>
                          <View style={theme.styles.categoryBadge}>
                            <Text style={theme.styles.categoryBadgeText}>{grimoire.category}</Text>
                          </View>
                          <View style={theme.styles.difficultyBadge}>
                            <Text style={theme.styles.difficultyBadgeText}>{grimoire.difficulty}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={theme.styles.chronicleDescriptionContainer}>
                      <Text style={theme.styles.chronicleDescription}>{grimoire.description}</Text>
                      <Text style={theme.styles.chronicleAtmosphere}>✦ {grimoire.atmosphere} ✦</Text>
                    </View>
                    
                    <View style={theme.styles.explorationContainer}>
                      <View style={theme.styles.explorationHeader}>
                        <Icon name="compass" size={16} color="#06B6D4" />
                        <Text style={theme.styles.explorationLabel}>Exploration Progress</Text>
                        <Text style={theme.styles.explorationValue}>{grimoire.exploration}%</Text>
                      </View>
                      <View style={theme.styles.explorationBar}>
                        <LinearGradient
                          colors={['#06B6D4', '#A855F7', '#4F46E5'] as const}
                          style={[theme.styles.explorationFill, { width: `${grimoire.exploration}%` }]}
                        />
                      </View>
                    </View>
                    
                    <View style={theme.styles.chronicleStats}>
                      <View style={theme.styles.chronicleStat}>
                        <Icon name="key" size={16} color="#FCD34D" />
                        <Text style={theme.styles.chronicleStatText}>{grimoire.revelations} revelations</Text>
                      </View>
                      <View style={theme.styles.chronicleStat}>
                        <Icon name="clock" size={16} color="#FB923C" />
                        <Text style={theme.styles.chronicleStatText}>{grimoire.timeToComplete}</Text>
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
              ))}
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

          {/* Restoration Tab */}
          {ui.activeTab === 'restoration' && (
            <View style={theme.styles.archiveTabContentArea}>
              {/* Restoration metrics */}
              <View style={theme.styles.archiveRestorationGrid}>
                {[
                  { 
                    icon: '📜', 
                    label: 'Chronicles Explored', 
                    value: `${archive.restorationMetrics.chroniclesExplored}/12`, 
                    description: 'Memory fragments fully integrated' 
                  },
                  { 
                    icon: '💎', 
                    label: 'Artifacts Discovered', 
                    value: `${archive.restorationMetrics.artifactsDiscovered}`, 
                    description: 'Coping mechanisms crystallized into tools' 
                  },
                  { 
                    icon: '🗝️', 
                    label: 'Revelations Unlocked', 
                    value: `${archive.restorationMetrics.revelationsUnlocked}`, 
                    description: 'Hidden chambers of self-knowledge opened' 
                  },
                ].map((metric, index) => (
                  <View key={index} style={theme.styles.archiveRestorationCard}>
                    <LinearGradient
                      colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                      style={theme.styles.archiveRestorationCardGradient}
                    >
                      <Text style={theme.styles.archiveRestorationIcon}>{metric.icon}</Text>
                      <Text style={theme.styles.archiveRestorationLabel}>{metric.label}</Text>
                      <Text style={theme.styles.archiveRestorationValue}>{metric.value}</Text>
                      <Text style={theme.styles.archiveRestorationDescription}>{metric.description}</Text>
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