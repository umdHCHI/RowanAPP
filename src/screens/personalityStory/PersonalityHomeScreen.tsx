import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { usePersonalityHomeData } from '../../hooks/usePersonalityHomeData';
import { createGlobalStyles, PersonalityConfigs } from '../../imports';
import { ThoughtDefenderGameData } from '../../types/thoughtDefender';
import type { CodexContentRef } from '../personality';
import {
  CodexContent,
  CopingToolsCollection,
  DailyCuratorMessage,
  PersonalityRestoration,
  QuestAchievements,
  TabNavigation,
  ThoughtDefenderContent,
  WellnessAttributesDisplay
} from '../personality';
import PersonalizedArchiveHeader from '../personality/PersonalizedArchiveHeader';
import CodexModal from '../shared/CodexModal';
import ThoughtDefenderModal from '../shared/ThoughtDefenderModal';

import {
  getPersonalityCompletionMessage
} from '../../utils/personalityRewards';
import ChapterScreen from '../characterStory/ChapterScreen';
import StoryScreen from '../characterStory/StoryScreen';
import PersonalityStoryCatalog from './PersonalityStoryCatalog';

export default function PersonalityHomeScreen() {
  const router = useRouter();
  const { theme, auth, wellness } = useMasterState();
  const { authToken, user } = auth;
  const globalStyles = createGlobalStyles(theme.theme);

  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "🌑 The Archive Beckons",
    message:
      "Welcome, Archivist. You have crossed a threshold few remember. The Archive is not built of stone or paper. It breathes within you. Shelves grow where memories settle, and corridors open where you dare to look inward. I am the Curator, the one who remembers when you cannot.",
    highlight: "header",
    tip:
      "Curator’s margin note: The Archive rearranges itself according to your fears and fascinations. Do not mistake the shifting for chaos—it is translation.",
  },
  {
    id: 2,
    title: "🔥 The Echoes of the Self",
    message:
      "Four lights burn in these halls shaped by you. They are not virtues or vices, but the pulse of your inner geography. As you act, they waver. Brightening when you confront, dimming when you retreat. Watch them closely; they will guide you home.",
    highlight: "wellness",
    tip:
      "Curator’s margin note: When Fear glows strongest, it means the Archive is speaking plainly. Few ever listen.",
  },
  {
  id: 3,
  title: "📖 The Living Pages",
  message:
    "In the deeper chambers of the Archive lie the Living Pages — fragments of story that breathe and bend as you read. They do not wait to be told; they respond. Every line of dialogue you choose, every silence you hold, leaves a trace upon these halls. Some tales will mirror your gentlest thoughts; others will test the limits of your resolve. Remember, the Archive does not seek endings — it seeks understanding.",
  highlight: "stories",
  tip:
    "Curator’s margin note: The stories are reflections, not riddles. When a character speaks, it may only be another version of you whispering from a different shelf.",
},
  {
    id: 4,
    title: "📜 The Whispered Codex",
    message:
      "Each dawn, a sealed note materializes upon your desk—ink still wet. It bears a small task, a whisper meant to steady your thoughts or remind you of forgotten strength. Answer them, and the Archive quiets. Ignore them, and the shelves begin to murmur.",
    highlight: "quests",
    tip:
      "Curator’s margin note: Even small restorations stave off decay. The Archive rewards the attentive.",
  },
  {
    id: 5,
    title: "🕯️ The Mind’s Defense",
    message:
      "Beyond the study lies the Hall of Dissonance, where stray thoughts take shape. Here, you’ll train with the Mind Defender, learning to still the echoes before they unravel you. When peace returns, record what remains in the Codex—your testament against forgetting.",
    highlight: "tools",
    tip:
      "Curator’s margin note: Reflection is not retreat. It is reconnaissance.",
  },
  {
    id: 6,
    title: "🌿 The Wing of Restoration",
    message:
      "Every mended story rekindles a lamp in your personal wing. This is the gentler side of the Archive—your proof that light persists, even in shadowed corridors. Over time, the air will hum with what you’ve healed.",
    highlight: "restoration",
    tip:
      "Curator’s margin note: The Wing reflects you. Should it darken, it only means a new story awaits repair.",
  },
  {
    id: 7,
    title: "🕰️ The Circle of Return",
    message:
      "The orientation ends, but the wandering begins. Within these walls you may rewrite endings, confront the echoes of yourself, and practice the alchemy of calm. Outside, you will find the same stories—but written in flesh instead of ink.",
    highlight: "complete",
    tip:
      "Curator’s margin note: Return often. The Archive dreams through you, and dreams are fragile when left unattended.",
  },
];


  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    try {
      await AsyncStorage.setItem('personalityHasSeenTutorial', 'true');
    } catch (error) {
      // Silently handle tutorial status save error
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    AsyncStorage.setItem('personalityHasSeenTutorial', 'true').catch(() => {});
  };

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialSeen = await AsyncStorage.getItem('personalityHasSeenTutorial');
        setHasSeenTutorial(tutorialSeen === 'true');
      } catch (error) {
        // Silently handle tutorial status check error
      }
    };
    checkTutorialStatus();
  }, []);

  const {
    isLoading,
    error,
    primaryTrait,
    userProfile,
    stories,
    isLoadingStories,
    fetchHomeScreenData,
    loadPersonalityStories
  } = usePersonalityHomeData({ authToken, user });

  useEffect(() => {
    if (!isLoading && error && !primaryTrait) {
      setTimeout(() => {
        router.replace('/(onboarding)/personality-test');
      }, 1000);
    }
  }, [isLoading, error, primaryTrait, router]);

  const [activeTab, setActiveTab] = useState("entrance");
  const [showCodexModal, setShowCodexModal] = useState(false);
  const [showThoughtDefenderModal, setShowThoughtDefenderModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const codexContentRef = useRef<CodexContentRef>(null);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [sessionGains, setSessionGains] = useState<Array<{type: string, value: string}>>([]);

  const handleStoryComplete = async (completionData: {
    storyId: string;
    totalStatGains: Record<string, number>;
    skillsLearned: string[];
    questProgress: Record<string, number>;
    finalRewards: string[];
    journalEntries: string[];
    experienceGained: number;
  }) => {
    setIsStoryVisible(false);
    setSelectedStory(null);
    
    if (!userProfile || !primaryTrait) return;

    // ✅ REWARDS ALREADY SAVED BY StoryRewardManager
    // Just show completion message and refresh UI
    try {
      const isIntroStory = completionData.storyId === '12';
      const completionMessage = getPersonalityCompletionMessage(primaryTrait, isIntroStory);
      
      Alert.alert(
        "📚 Story Mastered! ✨",
        completionMessage,
        [{ text: "Continue Exploring", style: "default" }]
      );

      // **FIX: Refresh quest progress specifically after story completion**
      
      // Wait a moment for backend to process the quest progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh data from backend to show updated values
      await fetchHomeScreenData();
      
      if (wellness.loadHomeData) {
        await wellness.loadHomeData();
      }
      

    } catch (e) {
      Alert.alert("Error", "There was an issue refreshing your progress.");
    }
  };

  const handleOpenStory = (story: any) => {
    setSelectedStory(story);
    if (story.chapter_count && story.chapter_count > 0) {
      setIsChapterScreenVisible(true);
    } else {
      setIsStoryVisible(true); 
    }
  };
  
  const handleCloseStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
    setSelectedChapter(null);
  };

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter({ id: chapterId, title: `Chapter ${chapterId}`, passages: [] });
    setIsChapterScreenVisible(false);
    setIsStoryVisible(true);
  };

  if (isLoading || !userProfile || !primaryTrait) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#181A20" }}>
        <StatusBar barStyle="light-content" backgroundColor="#181A20" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, backgroundColor: '#4ee6e6', borderRadius: 20, marginBottom: 10 }} />
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {isLoading ? 'Loading your personality profile...' : 
               error && !primaryTrait ? 'Redirecting to survey...' : 'Setting up your profile...'}
            </Text>
            {error && (
              <Text style={{ color: '#ff6b6b', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                {error}
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const TutorialHighlight = ({ 
    children, 
    isHighlighted, 
    style 
  }: { 
    children: React.ReactNode; 
    isHighlighted: boolean; 
    style?: any;
  }) => {
    const [pulseOpacity] = useState(new Animated.Value(0));

    useEffect(() => {
      if (isHighlighted) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: false,
            }),
          ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
      }
    }, [isHighlighted, pulseOpacity]);

    return (
      <View style={[style, { position: 'relative' }]}>
        {children}
        {isHighlighted && (
          <Animated.View style={[styles.highlightBorder, { opacity: pulseOpacity }]} />
        )}
      </View>
    );
  };

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: "#181A20" }}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      <PersonalizedArchiveHeader
        primaryTrait={primaryTrait}
        characterData={userProfile}
        traitScores={{
          Openness: userProfile?.personalityProfile?.openness || 0,
          Conscientiousness: userProfile?.personalityProfile?.conscientiousness || 0,
          Extraversion: userProfile?.personalityProfile?.extraversion || 0,
          Agreeableness: userProfile?.personalityProfile?.agreeableness || 0,
          Neuroticism: userProfile?.personalityProfile?.neuroticism || 0
        }}
        onTutorialPress={startTutorial}
        hasSeenTutorial={hasSeenTutorial}
      />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          primaryTrait={primaryTrait}
          globalStyles={globalStyles}
        />

      {activeTab === 'entrance' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
          {/* Session Gains Chip Row */}
          {sessionGains.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {sessionGains.map((gain, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.12)',
                    borderWidth: 1,
                    borderColor: '#4ee6e6',
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#4ee6e6', fontWeight: '600' }}>
                    {gain.type === 'xp' && '✨ '}{gain.type === 'stat' && '⚡ '}{gain.type === 'unlock' && '🔓 '}{gain.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Curator's Brief */}
          <DailyCuratorMessage
            primaryTrait={primaryTrait}
            characterData={userProfile}
            globalStyles={globalStyles}
          />

          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'wellness'}>
            <WellnessAttributesDisplay
              personalityType={primaryTrait}
              personalityScores={userProfile?.wellness_stats || []}
              globalStyles={globalStyles}
            />
          </TutorialHighlight>

          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'quests'}>
            <QuestAchievements
              primaryTrait={primaryTrait}
              questProgress={userProfile?.quest_progress || {}}
              globalStyles={globalStyles}
            />
          </TutorialHighlight>

          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'coping'}>
            <CopingToolsCollection
              primaryTrait={primaryTrait}
              unlockedTools={userProfile?.unlocked_tools || []}
              authToken={authToken}
              globalStyles={globalStyles}
            />
          </TutorialHighlight>
        </ScrollView>
      )}

        {activeTab === 'stories' && (
          <View style={{ flex: 1 }}>
            <TutorialHighlight
              isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'stories'}
              style={{ flex: 1 }}
            >
              <PersonalityStoryCatalog
                primaryTrait={primaryTrait}
                onStorySelect={handleOpenStory}
                globalStyles={globalStyles}
                stories={stories}
                isLoading={isLoadingStories}
                setStories={() => {}}
                setIsLoading={() => {}}
                personalityStyles={primaryTrait ? PersonalityConfigs[primaryTrait]?.theme : undefined}
                userPersonalityTrait={primaryTrait}
              />
            </TutorialHighlight>
          </View>
        )}

      {activeTab === 'codex' && (
        <ScrollView style={{ flex: 1, backgroundColor: '#0a0b0f' }} contentContainerStyle={{ flexGrow: 1 }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'tools'}>
            <CodexContent
              ref={codexContentRef}
              onClose={() => {
                setActiveTab('entrance');
              }}
              onSave={(entry: any) => {}}
              onCreateEntry={() => {
                setEditingEntry(null);
                setShowCodexModal(true);
              }}
              onEditEntry={(entry: any) => {
                setEditingEntry(entry);
                setShowCodexModal(true);
              }}
              unlockedAreas={['journal', 'draw', 'voice']}
              primaryTrait={primaryTrait}
            />
          </TutorialHighlight>
        </ScrollView>
      )}

      {activeTab === 'defender' && (
        <ScrollView style={{ flex: 1, backgroundColor: '#0a0b0f' }} contentContainerStyle={{ flexGrow: 1 }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'tools'}>
            <ThoughtDefenderContent
              onClose={() => setActiveTab('entrance')}
              onScoreUpdate={(data: ThoughtDefenderGameData) => {}}
              onStartGame={() => setShowThoughtDefenderModal(true)}
              primaryTrait={primaryTrait}
            />
          </TutorialHighlight>
        </ScrollView>
      )}

        {activeTab === 'restoration' && (
          <ScrollView style={{ flex: 1, backgroundColor: '#0a0b0f' }} contentContainerStyle={{ flexGrow: 1 }}>
            <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'restoration'}>
              <PersonalityRestoration
                primaryTrait={primaryTrait}
                userProfile={userProfile}
                stories={stories}
                globalStyles={globalStyles}
                onThemeToggle={() => theme.toggleTheme()}
                onLogout={() => {
                  if (auth && auth.logout) {
                    try {
                      auth.logout();
                    } catch (error) {
                      Alert.alert('Logout Error', `Failed to logout: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  } else {
                    Alert.alert('Error', 'Logout function not available');
                  }
                }}
                currentTheme={theme.themeMode}
              />
            </TutorialHighlight>
          </ScrollView>
        )}

        {selectedStory && isStoryVisible && (
          <StoryScreen
            visible={isStoryVisible}
            onClose={handleCloseStory}
            story={selectedStory}
            chapter={selectedChapter || { id: 1, title: 'Chapter 1', passages: [] }}
            passage={{ id: 'start', text: 'The story begins...' } as any}
            choices={[]}
            onStoryComplete={handleStoryComplete as any}
            onStatGain={() => {}}
            onArtifactUnlock={() => {}}
            onSkillLearned={() => {}}
          />
        )}

        {selectedStory && isChapterScreenVisible && (
          <ChapterScreen
            visible={isChapterScreenVisible}
            onClose={() => setIsChapterScreenVisible(false)}
            storyId={String(selectedStory.id)}
            storyTitle={selectedStory.title}
            onChapterSelect={handleChapterSelect}
          />
        )}

        {showTutorial && (
          <Modal
            visible={showTutorial}
            transparent={true}
            animationType="fade"
            onRequestClose={skipTutorial}
          >
            <View style={styles.tutorialOverlay}>
              <View style={styles.tutorialContent}>
                <View style={styles.tutorialHeader}>
                  <Text style={styles.tutorialTitle}>{TUTORIAL_STEPS[currentTutorialStep].title}</Text>
                  <Text style={styles.tutorialMessage}>{TUTORIAL_STEPS[currentTutorialStep].message}</Text>
                  {TUTORIAL_STEPS[currentTutorialStep].tip && (
                    <View style={styles.tipContainer}>
                      <Text style={styles.tipText}>💡 Pro Tip: {TUTORIAL_STEPS[currentTutorialStep].tip}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressContainer}>
                  {TUTORIAL_STEPS.map((_, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        index === currentTutorialStep && styles.progressDotActive,
                        index < currentTutorialStep && styles.progressDotCompleted
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.buttonContainer}>
                  {currentTutorialStep > 0 && (
                    <TouchableOpacity
                      style={[styles.tutorialButton, styles.previousButton]}
                      onPress={previousTutorialStep}
                    >
                      <Text style={styles.buttonText}>← Previous</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.tutorialButton, styles.skipButton]}
                    onPress={skipTutorial}
                  >
                    <Text style={styles.buttonText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tutorialButton, styles.nextButton]}
                    onPress={nextTutorialStep}
                  >
                    <Text style={styles.buttonText}>
                      {currentTutorialStep === TUTORIAL_STEPS.length - 1 ? 'Get Started!' : 'Next →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

      <CodexModal
        visible={showCodexModal}
        onClose={() => {
          setShowCodexModal(false);
          setEditingEntry(null);
        }}
        onSave={async (entry: any) => {
          setShowCodexModal(false);
          setEditingEntry(null);
          if (codexContentRef.current) {
            try {
              await codexContentRef.current.refreshEntries();
            } catch (error) {
              // Silently handle refresh error
            }
          }
        }}
        selectedType={editingEntry?.entry_type || "journal"}
      />

        <ThoughtDefenderModal
          visible={showThoughtDefenderModal}
          onClose={() => setShowThoughtDefenderModal(false)}
          onScoreUpdate={(data: ThoughtDefenderGameData) => {}}
          primaryTrait={primaryTrait}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContent: {
    backgroundColor: '#1a1d26',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  tutorialHeader: {
    marginBottom: 25,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  tutorialMessage: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  tipContainer: {
    backgroundColor: 'rgba(78, 230, 230, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4ee6e6',
  },
  tipText: {
    fontSize: 14,
    color: '#4ee6e6',
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#4ee6e6',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: '#4ee6e6',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tutorialButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#666',
  },
  skipButton: {
    backgroundColor: '#444',
  },
  nextButton: {
    backgroundColor: '#4ee6e6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  highlightBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: '#4ee6e6',
    borderRadius: 8,
    zIndex: 1000,
  },
});
