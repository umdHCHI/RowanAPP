import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CodexModal from '../../components/CodexModal';
import ThoughtDefenderModal from '../../components/ThoughtDefenderModal';
import type { CodexContentRef } from '../../components/personality';
import {
  CodexContent,
  CopingToolsCollection,
  DailyCuratorMessage,
  PersonalityRestoration,
  QuestAchievements,
  TabNavigation,
  ThoughtDefenderContent,
  WellnessAttributesDisplay
} from '../../components/personality';
import PersonalizedArchiveHeader from '../../components/personality/PersonalizedArchiveHeader';
import { useMasterState } from '../../context/MasterStateContext';
import { usePersonalityHomeData } from '../../hooks/usePersonalityHomeData';
import { createGlobalStyles, PersonalityConfigs } from '../../imports';
import { apiService } from '../../services/apiService';

import {
  applyPersonalityQuestBonuses,
  applyPersonalityStatBonuses,
  getPersonalityCompletionMessage,
  getPersonalityRewardMultiplier,
  isToolPreferredForPersonality
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
      title: "🌟 A Personalized Introduction",
      message: "Welcome, Archivist. I've had a moment to consult the records. It seems your approach to scholarship is... unique. This Archive will arrange itself to suit your particular way of seeing the world. Let us begin your tailored orientation.",
      highlight: "header",
      tip: "A note from the Curator: Your specific inclinations are not a flaw; they are simply the primary lens through which you will read these halls."
    },
    {
      id: 2,
      title: "🎯 The Curator's Missive & Your Foundations",
      message: "Each day, I will leave a short missive for you here, with guidance suited to your disposition. Below, you can track your Foundations. They will grow as you tend to the tomes that resonate most strongly with you.",
      highlight: "wellness",
      tip: "A note from the Curator: These attributes reflect the core narratives of the library. Pay attention to the ones that feel most familiar."
    },
    {
      id: 3,
      title: "🏆 Daily Inquiries & Achievements",
      message: "These are your Daily Inquiries—small, suggested tasks to help maintain the order of your Archive. Completing them is a quiet act of scholarship that will be noted in your personal log of achievements.",
      highlight: "quests",
      tip: "A note from the Curator: These tasks are chosen for you. They are designed to be a gentle practice, not a chore."
    },
    {
      id: 4,
      title: "🛠️ The Archivist's Toolkit",
      message: "Here you will find your collection of Restoration Implements. As you complete stories and inquiries, you will acquire new tools specialized for the kinds of narratives you find most challenging.",
      highlight: "coping",
      tip: "A note from the Curator: The right tool can mend a torn page or clarify a faded passage. Experiment to find what works for you."
    },
    {
      id: 5,
      title: "📚 Passages Written for You",
      message: "The stories within these Passages will speak to you in a unique way. You may find the dialogue shifts, or that certain paths feel more intuitive. This is the Archive adapting to its reader.",
      highlight: "stories",
      tip: "A note from the Curator: Do not be surprised if I address you differently within a story; I am simply speaking your language."
    },
    {
      id: 6,
      title: "🧠 The Mind Defender & The Codex",
      message: "Here you will find the 'Mind Defender,' a training ground to guard the stacks against dissonant whispers (or 'Negative Thoughts,' as they're known outside). Your Codex, as always, is here for your personal 'Inscriptions.'",
      highlight: "tools",
      tip: "A note from the Curator: Defending the mind is a practical skill; reflecting in the Codex is a scholarly art. Both are necessary."
    },
    {
      id: 7,
      title: "🌱 The Restoration Wing",
      message: "This is your personal wing of the Archive, where your illuminated manuscripts are shelved. Every story you help to heal adds its light to this space, making it uniquely your own.",
      highlight: "restoration",
      tip: "A note from the Curator: Restoration is a quiet, steady process. It is just as important as new discovery."
    },
    {
      id: 8,
      title: "🎉 Your Path is Your Own",
      message: "Your personalized orientation is complete. No two Archivists walk the same path through these halls. The journey ahead is yours alone to chart. Read well.",
      highlight: "complete",
      tip: "A note from the Curator: Remember that progress is not a straight line, but a meandering path through the stacks. Enjoy the walk."
    }
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
  const codexContentRef = useRef<CodexContentRef>(null);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);

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

    try {
      const isIntroStory = completionData.storyId === '12';
      const personalityMultiplier = getPersonalityRewardMultiplier(primaryTrait, completionData.storyId);

      if (completionData.experienceGained > 0) {
        const adjustedExperience = Math.floor(completionData.experienceGained * personalityMultiplier);
      }

      if (Object.keys(completionData.totalStatGains).length > 0) {
        const adjustedStatGains = applyPersonalityStatBonuses(
          completionData.totalStatGains, 
          primaryTrait, 
          personalityMultiplier
        );
      }

      if (completionData.skillsLearned && completionData.skillsLearned.length > 0) {
        for (const toolId of completionData.skillsLearned) {
          try {
            const isPreferred = isToolPreferredForPersonality(toolId, primaryTrait);
            await apiService.acquireCopingToolByName(toolId);
            
            if (isPreferred) {
              try {
                const tool = await apiService.findCopingToolByName(toolId);
                if (tool) {
                  await apiService.equipTool(tool.id);
                }
              } catch (equipError) {
                // Silently handle tool equip error
              }
            }
          } catch (toolError) {
            // Silently handle tool acquisition error
          }
        }
      }

      const questData = completionData.questProgress || {};
      
      if (questData && Object.keys(questData).length > 0) {
        const adjustedQuestProgress = applyPersonalityQuestBonuses(questData, primaryTrait);
        
        try {
          for (const [questId, progress] of Object.entries(adjustedQuestProgress)) {
            await apiService.saveQuestProgress({
              storyId: completionData.storyId,
              questSlug: questId,
              storyVariables: {
                progress: progress,
                source: 'story_completion',
                personality_bonus: true
              },
              playerState: {
                quest_progress: { [questId]: progress }
              }
            });
          }
        } catch (questError) {
          // Silently handle quest progress save error
        }
      }

      const completionMessage = getPersonalityCompletionMessage(primaryTrait, isIntroStory);
      
      Alert.alert(
        "📚 Story Mastered! ✨",
        completionMessage,
        [{ text: "Continue Exploring", style: "default" }]
      );

    } catch (e) {
      Alert.alert("Error", "There was an issue saving your story progress.");
    } finally {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchHomeScreenData();
      
      try {
        if (wellness.loadHomeData) {
          await wellness.loadHomeData();
        }
      } catch (refreshError) {
        // Silently handle refresh error
      }
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
          <View style={[styles.highlightBorder, { opacity: pulseOpacity }]} />
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
      />

      <View style={styles.tutorialButtonContainer}>
        {!hasSeenTutorial ? (
          <TouchableOpacity
            style={styles.startTutorialButton}
            onPress={startTutorial}
          >
            <Text style={styles.tutorialButtonText}>🎮 Start Tutorial</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.restartTutorialButton}
            onPress={startTutorial}
          >
            <Text style={styles.tutorialButtonText}>📚 Tutorial</Text>
          </TouchableOpacity>
        )}
      </View>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryTrait={primaryTrait}
        globalStyles={globalStyles}
      />

      {activeTab === 'entrance' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'wellness'}>
            <DailyCuratorMessage 
              primaryTrait={primaryTrait} 
              characterData={userProfile}
              globalStyles={globalStyles} 
            />
            
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
              onCreateEntry={() => setShowCodexModal(true)}
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
              onScoreUpdate={(data: any) => {}}
              onStartGame={() => setShowThoughtDefenderModal(true)}
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
        }}
        onSave={async (entry: any) => {
          setShowCodexModal(false);
          if (codexContentRef.current) {
            try {
              await codexContentRef.current.refreshEntries();
            } catch (error) {
              // Silently handle refresh error
            }
          }
        }}
        selectedType="journal"
      />

      <ThoughtDefenderModal
        visible={showThoughtDefenderModal}
        onClose={() => setShowThoughtDefenderModal(false)}
        onScoreUpdate={(data: any) => {}}
        primaryTrait={primaryTrait}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tutorialButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(26, 29, 38, 0.8)',
  },
  startTutorialButton: {
    backgroundColor: '#4ee6e6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  restartTutorialButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  tutorialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
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
