import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CodexModal from '../../components/CodexModal';
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
import { usePersonalityHomeData } from '../../hooks/usePersonalityHomeData';
import { createGlobalStyles, PersonalityConfigs, useMasterState } from '../../imports';
import { apiService } from '../../services/apiService';

// Import story components
import ChapterScreen from '../characterStory/ChapterScreen';
import StoryScreen from '../characterStory/StoryScreen';
import PersonalityStoryCatalog from './PersonalityStoryCatalog';

// Import personality reward utilities
import {
  applyPersonalityQuestBonuses,
  applyPersonalityStatBonuses,
  getPersonalityCompletionMessage,
  getPersonalityRewardMultiplier,
  isToolPreferredForPersonality
} from '../../utils/personalityRewards';

// Import test functions for debugging
import { runAllQuestTests } from '../../utils/questProgressTest';
import { testCompleteFilteringLogicWithTools, testFilteringWithActualData } from '../../utils/rewardsUtils';

/**
 * Refactored PersonalityHomeScreen with improved component architecture
 * 
 * Key improvements:
 * 1. Extracted large inline components into reusable components
 * 2. Centralized data management in custom hook
 * 3. Simplified state management
 * 4. Improved code organization and maintainability
 * 5. Removed code duplication
 * 6. Added comprehensive tutorial system for personality path
 */
export default function PersonalityHomeScreen() {
  const { theme, auth } = useMasterState();
  const { authToken, user } = auth;
  const globalStyles = createGlobalStyles(theme.theme);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Tutorial steps specific to personality path
  const TUTORIAL_STEPS = [
    {
      id: 1,
      title: "🌟 Welcome to Your Personalized Archive!",
      message: "This is your unique stress management journey based on your personality. Let's explore how to navigate and grow!",
      highlight: "header",
      tip: "Your personality traits shape your experience - embrace what makes you unique!"
    },
    {
      id: 2,
      title: "🎯 Daily Curator & Wellness Attributes",
      message: "Check your daily curator message for personalized guidance, and track your wellness attributes to see your growth over time.",
      highlight: "wellness",
      tip: "Wellness attributes show your progress in different areas of mental health and stress management."
    },
    {
      id: 3,
      title: "🏆 Quest Achievements & Progress",
      message: "Complete daily quests and track your achievements. Each completed quest brings you closer to unlocking new tools and stories.",
      highlight: "quests",
      tip: "Quests are designed to match your personality type and help you build healthy habits."
    },
    {
      id: 4,
      title: "🛠️ Coping Tools Collection",
      message: "Access your personalized collection of coping strategies and wellness tools. Unlock new tools by completing stories and quests.",
      highlight: "coping",
      tip: "Different tools work for different people - experiment to find what helps you most."
    },
    {
      id: 5,
      title: "📚 Stories & Personal Growth",
      message: "Explore stories tailored to your personality type. Each story helps you develop new skills and understanding.",
      highlight: "stories",
      tip: "Stories are designed to resonate with your unique way of thinking and feeling."
    },
    {
      id: 6,
      title: "🧠 Thought Defender & Codex",
      message: "Use the Thought Defender to practice challenging negative thoughts, and the Codex to reflect on your journey through journaling.",
      highlight: "tools",
      tip: "Regular practice with these tools builds resilience and self-awareness."
    },
    {
      id: 7,
      title: "🌱 Restoration & Self-Care",
      message: "Access restoration activities and track your overall progress. This is your space for reflection and renewal.",
      highlight: "restoration",
      tip: "Restoration is just as important as growth - take time to recharge and reflect."
    },
    {
      id: 8,
      title: "🎉 You're Ready to Begin!",
      message: "You now know how to navigate your personalized archive. Remember, this journey is about progress, not perfection.",
      highlight: "complete",
      tip: "Start with small steps and celebrate every bit of progress you make!"
    }
  ];

  // Tutorial functions
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
      console.error('Failed to save tutorial status:', error);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    AsyncStorage.setItem('personalityHasSeenTutorial', 'true').catch(console.error);
  };

  // Test the new quest progress calculation method
  const testNewQuestMethod = async () => {
    console.log('🧪 TESTING NEW QUEST PROGRESS METHOD');
    try {
      const questProgress = await apiService.getQuestProgress();
      console.log('✅ New quest method result:', questProgress);
      console.log('✅ Quest count:', Object.keys(questProgress).length);
      
      if (Object.keys(questProgress).length > 0) {
        console.log('✅ Found quest progress! The new method works!');
        Object.entries(questProgress).forEach(([questId, progress]) => {
          console.log(`  ${questId}: ${progress}`);
        });
      } else {
        console.log('⚠️ No quest progress found with new method');
      }
    } catch (error) {
      console.error('❌ New quest method failed:', error);
    }
    console.log('🧪 NEW QUEST METHOD TEST COMPLETE');
  };

  // Test function to simulate quest progress (for debugging)
  const testQuestProgress = async () => {
    try {
      console.log('=== TESTING QUEST PROGRESS ===');
      
      // Simulate quest progress data - including the "Possibility Pioneer" quest that showed in notifications
      const testQuestProgress = {
        openness_3: 1, // This is the "Possibility Pioneer" quest from the notification
        neuroticism_1: 1,
        openness_2: 1
      };
      
      console.log('Saving test quest progress:', testQuestProgress);
      
      // Save quest progress - one call per quest
      for (const [questId, progress] of Object.entries(testQuestProgress)) {
        await apiService.saveQuestProgress({
          storyId: 'test',
          questSlug: questId,
          storyVariables: {
            progress: progress,
            source: 'test_button'
          },
          playerState: {
            quest_progress: { [questId]: progress }
          }
        });
        console.log(`✅ Test quest progress saved for ${questId}: ${progress}`);
      }
      console.log('✅ All test quest progress saved');
      
      // Refresh data to see the changes
      await fetchHomeScreenData();
      console.log('✅ Data refreshed');
      
    } catch (error) {
      console.error('❌ Test quest progress failed:', error);
    }
  };

  // Test function for personality reward system
  const testPersonalityRewards = async () => {
    try {
      console.log('=== TESTING PERSONALITY REWARD SYSTEM ===');
      console.log('Primary trait:', primaryTrait);
      
      if (!primaryTrait) {
        Alert.alert('Error', 'Primary trait not available');
        return;
      }
      
      // Test reward multiplier
      const multiplier = getPersonalityRewardMultiplier(primaryTrait, '1');
      console.log('Reward multiplier for', primaryTrait, ':', multiplier);
      
      // Test stat bonuses
      const testStats = { awareness: 10, resilience: 8, connection: 6, balance: 4 };
      const adjustedStats = applyPersonalityStatBonuses(testStats, primaryTrait, multiplier);
      console.log('Original stats:', testStats);
      console.log('Adjusted stats:', adjustedStats);
      
      // Test quest bonuses
      const testQuests = { [`${primaryTrait}_1`]: 1, 'general_quest': 1 };
      const adjustedQuests = applyPersonalityQuestBonuses(testQuests, primaryTrait);
      console.log('Original quests:', testQuests);
      console.log('Adjusted quests:', adjustedQuests);
      
      // Test tool preferences
      const testTools = ['Meditation', 'Goal Tracker', 'Social Support', 'Anxiety Management'];
      testTools.forEach(tool => {
        const isPreferred = isToolPreferredForPersonality(tool, primaryTrait);
        console.log(`Tool "${tool}" preferred for ${primaryTrait}:`, isPreferred);
      });
      
      // Test completion message
      const message = getPersonalityCompletionMessage(primaryTrait, false);
      console.log('Completion message:', message);
      
      // Test API service method
      const testRewards = {
        experienceGained: 100,
        totalStatGains: testStats,
        skillsLearned: testTools,
        questsUpdated: testQuests
      };
      
      const processedResult = await apiService.processPersonalityStoryRewards('test', testRewards, primaryTrait);
      console.log('API processed result:', processedResult);
      
      Alert.alert(
        'Personality Reward Test Complete',
        `Multiplier: ${multiplier}x\nCheck console for detailed results`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('❌ Personality reward test failed:', error);
      Alert.alert('Test Failed', error.message || 'Unknown error');
    }
  };

  // Test quest progress system
  const testQuestProgressSystem = async () => {
    try {
      console.log('🧪 Testing quest progress system...');
      
      // First, test loading quest progress directly
      console.log('🔍 Testing quest progress loading...');
      const directQuestProgress = await apiService.getQuestProgress();
      console.log('🔍 Direct quest progress result:', directQuestProgress);
      
      if (primaryTrait) {
        const questId = primaryTrait.toLowerCase() + '_1'; // e.g., 'openness_1'
        await runAllQuestTests(primaryTrait, questId);
        
        Alert.alert(
          'Quest Progress Test Complete',
          `Tested quest: ${questId}\nDirect quest progress: ${JSON.stringify(directQuestProgress)}\nCheck console for detailed results`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No primary trait available for testing');
      }
    } catch (error: any) {
      console.error('❌ Quest progress test failed:', error);
      Alert.alert('Test Failed', error.message || 'Unknown error');
    }
  };

  // Check tutorial status on mount
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialSeen = await AsyncStorage.getItem('personalityHasSeenTutorial');
        setHasSeenTutorial(tutorialSeen === 'true');
      } catch (error) {
        console.error('Failed to check tutorial status:', error);
      }
    };
    checkTutorialStatus();
  }, []);

  // Centralized data management
  const {
    isLoading,
    error,
    primaryTrait,
    userProfile,
    stories,
    isLoadingStories,
    fetchHomeScreenData
  } = usePersonalityHomeData({ authToken, user });

  // Debug logging
  console.log("=== PersonalityHomeScreen Debug ===");
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("primaryTrait:", primaryTrait);
  console.log("userProfile:", userProfile);
  console.log("Quest progress:", userProfile?.quest_progress);
  console.log("=== End Debug ===");

  // UI state
  const [activeTab, setActiveTab] = useState("entrance");
  const [showCodexModal, setShowCodexModal] = useState(false);
  
  // Ref for CodexContent to refresh entries
  const codexContentRef = useRef<CodexContentRef>(null);
  
  // Debug tab changes
  const handleTabChange = (tab: string) => {
    console.log('Tab change requested:', tab, 'from:', activeTab);
    setActiveTab(tab);
  };
  
  // Story modal state
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);

  // Story completion handler
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
    
    if (!userProfile) return;

    try {
      console.log("=== PROCESSING PERSONALITY USER STORY REWARDS ===");
      console.log("Story ID:", completionData.storyId);
      console.log("Primary trait:", primaryTrait);
      console.log("Completion data:", completionData);
      console.log("Completion data keys:", Object.keys(completionData));
      console.log("questProgress field:", completionData.questProgress);
      console.log("questProgress field (cast):", (completionData as any).questProgress);
      console.log("finalRewards field (cast):", (completionData as any).finalRewards);
      
      // Log all properties to see what's actually there
      console.log("=== ALL COMPLETION DATA PROPERTIES ===");
      for (const [key, value] of Object.entries(completionData)) {
        console.log(`${key}:`, value);
      }
      
      // SPECIAL DEBUG: Check quest progress specifically
      console.log("=== QUEST PROGRESS DEBUG ===");
      console.log("questProgress field exists:", 'questProgress' in completionData);
      console.log("questProgress type:", typeof completionData.questProgress);
      console.log("questProgress value:", completionData.questProgress);
      console.log("questProgress keys:", completionData.questProgress ? Object.keys(completionData.questProgress) : 'N/A');
      if (completionData.questProgress) {
        console.log("questProgress entries:");
        Object.entries(completionData.questProgress).forEach(([key, value]) => {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        });
      }
      console.log("=== END QUEST PROGRESS DEBUG ===");

      const isIntroStory = completionData.storyId === '12';
      
      if (!primaryTrait) {
        console.error("Primary trait not available for story completion");
        return;
      }
      
      // Apply personality-specific reward multipliers
      const personalityMultiplier = getPersonalityRewardMultiplier(primaryTrait, completionData.storyId);
      console.log("Personality reward multiplier:", personalityMultiplier);

      // Process experience gains with personality bonus
      if (completionData.experienceGained > 0) {
        const adjustedExperience = Math.floor(completionData.experienceGained * personalityMultiplier);
        console.log(`Experience: ${completionData.experienceGained} → ${adjustedExperience} (${personalityMultiplier}x)`);
        
        // For personality users, experience should be saved to their profile/character
        // This is handled through the story completion system
      }

      // Process wellness stat gains with personality bonuses
      if (Object.keys(completionData.totalStatGains).length > 0) {
        console.log("Processing wellness stat gains for personality user...");
        
        // Apply personality-specific stat bonuses
        const adjustedStatGains = applyPersonalityStatBonuses(
          completionData.totalStatGains, 
          primaryTrait!, 
          personalityMultiplier
        );
        
        console.log("Original stat gains:", completionData.totalStatGains);
        console.log("Adjusted stat gains:", adjustedStatGains);
      }

      // Process coping tools/skills with personality preferences
      if (completionData.skillsLearned && completionData.skillsLearned.length > 0) {
        console.log("Processing coping tools for personality user...");
        
        for (const toolId of completionData.skillsLearned) {
          try {
            // Check if this tool is preferred for this personality type
            const isPreferred = isToolPreferredForPersonality(toolId, primaryTrait!);
            console.log(`Tool ${toolId} preferred for ${primaryTrait}:`, isPreferred);
            
            // Attempt to acquire the coping tool
            await apiService.acquireCopingToolByName(toolId);
            console.log(`✅ Coping tool acquired: ${toolId}`);
            
            // If it's a preferred tool, automatically equip it
            if (isPreferred) {
              try {
                const tool = await apiService.findCopingToolByName(toolId);
                if (tool) {
                  await apiService.equipTool(tool.id);
                  console.log(`✅ Preferred tool auto-equipped: ${toolId}`);
                }
              } catch (equipError) {
                console.warn(`Could not auto-equip preferred tool ${toolId}:`, equipError);
              }
            }
          } catch (toolError) {
            console.warn(`Failed to process tool ${toolId}:`, toolError);
          }
        }
      }

      // Process quest progress with personality-specific bonuses
      // Handle different possible field names for quest progress data
      const questData = completionData.questProgress || {};
      console.log("=== QUEST PROCESSING SECTION ===");
      console.log("Raw questData:", questData);
      console.log("questData type:", typeof questData);
      console.log("questData is empty object:", Object.keys(questData).length === 0);
      console.log("questData keys:", Object.keys(questData));
      
      if (questData && Object.keys(questData).length > 0) {
        console.log("✅ Quest data found! Processing quest progress for personality user...");
        console.log("Quest progress data:", questData);
        
        // Apply personality-specific quest progress bonuses
        const adjustedQuestProgress = applyPersonalityQuestBonuses(
          questData,
          primaryTrait!
        );
        
        console.log("Original quest progress:", questData);
        console.log("Adjusted quest progress:", adjustedQuestProgress);
        
        try {
          // Save quest progress - one call per quest
          for (const [questId, progress] of Object.entries(adjustedQuestProgress)) {
            console.log(`=== SAVING QUEST PROGRESS: ${questId} ===`);
            console.log(`Quest ID: ${questId}`);
            console.log(`Progress value: ${progress}`);
            console.log(`Story ID: ${completionData.storyId}`);
            console.log(`Primary trait: ${primaryTrait}`);
            
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
            console.log(`✅ Quest progress saved with personality bonuses for ${questId}: ${progress}`);
          }
          console.log("✅ All quest progress saved with personality bonuses");
        } catch (questError) {
          console.error("❌ Failed to save quest progress:", questError);
        }
      } else {
        console.log("❌ No quest progress to process");
        console.log("completionData.questProgress:", completionData.questProgress);
        console.log("Reason: questData is empty or undefined");
        
        // ENHANCED DEBUG: Check if quest data exists in other fields
        console.log("=== SEARCHING FOR QUEST DATA IN OTHER FIELDS ===");
        console.log("completionData.questProgress:", completionData.questProgress);
        console.log("Checking all completion data fields for quest-related data...");
        Object.entries(completionData).forEach(([key, value]) => {
          if (key.toLowerCase().includes('quest')) {
            console.log(`  Found quest-related field: ${key}:`, value);
          }
        });
      }

      // Show personality-specific completion message
      const completionMessage = getPersonalityCompletionMessage(primaryTrait!, isIntroStory);
      
      Alert.alert(
        "📚 Story Mastered! ✨",
        completionMessage,
        [{ text: "Continue Exploring", style: "default" }]
      );

    } catch (e) {
      console.error("Failed to process personality story rewards:", e);
      Alert.alert("Error", "There was an issue saving your story progress.");
    } finally {
      // Add a longer delay to ensure backend has processed all the quest progress
      console.log("💤 Waiting 3 seconds before refreshing data to ensure backend processing is complete...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log("🔄 Refreshing home screen data to show updated quest progress...");
      await fetchHomeScreenData();
      console.log("✅ Home screen data refresh complete");
    }
  };

  // Story navigation handlers
  const handleOpenStory = (story: any) => {
    console.log("=== handleOpenStory called ===");
    console.log("Story data:", story);
    
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
  };

  const handleChapterSelect = () => {
    setIsChapterScreenVisible(false);
    setIsStoryVisible(true);
  };

  // Loading state (simplified version)
  if (isLoading || !userProfile || !primaryTrait) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#181A20" }}>
        <StatusBar barStyle="light-content" backgroundColor="#181A20" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, backgroundColor: '#4ee6e6', borderRadius: 20, marginBottom: 10 }} />
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {isLoading ? 'Loading your personality profile...' : 'Setting up your profile...'}
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

  // Tutorial Highlight Component
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

  // Main render
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#181A20" }}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      
      {/* Header with Personality-Specific Styling */}
      <PersonalizedArchiveHeader
        primaryTrait={primaryTrait}
        characterData={userProfile}
        traitScores={{
          Openness: 5,
          Conscientiousness: 5,
          Extraversion: 5,
          Agreeableness: 5,
          Neuroticism: 5
        }}
      />
      
      {/* Debug buttons for testing (remove in production) */}
      {__DEV__ && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 100,
              right: 20,
              backgroundColor: '#4ee6e6',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={testQuestProgress}
          >
            <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>
              Test Quest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 150,
              right: 20,
              backgroundColor: '#ff6b6b',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={testPersonalityRewards}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Test Rewards
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 200,
              right: 20,
              backgroundColor: '#4ecdc4',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={() => testCompleteFilteringLogicWithTools()}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Test Filtering
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 350,
              right: 20,
              backgroundColor: '#9b59b6',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={testQuestProgressSystem}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Test Quest Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 190,
              right: 20,
              backgroundColor: '#FF6B9D',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={testNewQuestMethod}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              🧪 New Quest Method
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 250,
              right: 20,
              backgroundColor: '#ff6b9d',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={() => testFilteringWithActualData()}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Test Actual Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 300,
              right: 20,
              backgroundColor: '#4ecdc4',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={() => {
              console.log('Manual tab change test - setting to entrance');
              setActiveTab('entrance');
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Test Tab Nav
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 400,
              right: 20,
              backgroundColor: '#e67e22',
              padding: 8,
              borderRadius: 4,
              zIndex: 1000
            }}
            onPress={async () => {
              console.log('🔄 Manual refresh triggered...');
              console.log('📊 Current userProfile before refresh:', userProfile);
              console.log('📊 Current quest_progress before refresh:', userProfile?.quest_progress);
              
              try {
                await fetchHomeScreenData();
                console.log('✅ Manual refresh complete');
                
                // Show immediate result
                setTimeout(() => {
                  console.log('📊 userProfile after refresh:', userProfile);
                  console.log('📊 quest_progress after refresh:', userProfile?.quest_progress);
                  Alert.alert('Refresh Complete', `Before: ${JSON.stringify(userProfile?.quest_progress)}\n\nAfter: Check console for updated data`);
                }, 1000);
              } catch (error) {
                console.error('❌ Manual refresh failed:', error);
                Alert.alert('Refresh Failed', String(error));
              }
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              Manual Refresh
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Tutorial Buttons */}
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
        <TouchableOpacity
          style={styles.debugTutorialButton}
          onPress={testQuestProgress}
        >
          <Text style={styles.debugButtonText}>Q</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.debugTutorialButton, { backgroundColor: '#27ae60', marginLeft: 5 }]}
          onPress={fetchHomeScreenData}
        >
          <Text style={styles.debugButtonText}>R</Text>
        </TouchableOpacity>
      </View>

      {/* Personality-Specific Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryTrait={primaryTrait}
        globalStyles={globalStyles}
      />

      {/* Tab Content */}
      {console.log('Current activeTab:', activeTab)}
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
              debugPersonalityMatching={() => {}}
            />
          </TutorialHighlight>
        </View>
      )}

      {activeTab === 'codex' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'tools'}>
            <CodexContent
              ref={codexContentRef}
              onClose={() => {
                console.log('CodexContent onClose called - navigating to entrance tab');
                setActiveTab('entrance');
              }}
              onSave={(entry: any) => {
                console.log('Codex entry saved:', entry);
              }}
              onCreateEntry={() => {
                console.log('CodexContent onCreateEntry called - opening CodexModal');
                setShowCodexModal(true);
              }}
              unlockedAreas={['journal', 'draw', 'voice']}
              primaryTrait={primaryTrait}
            />
          </TutorialHighlight>
        </View>
      )}

      {activeTab === 'defender' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'tools'}>
            <ThoughtDefenderContent
              onClose={() => setActiveTab('entrance')}
              onScoreUpdate={(data: any) => {
                console.log('Thought defender score update:', data);
              }}
              onStartGame={() => {
                console.log('Starting thought defender game');
              }}
            />
          </TutorialHighlight>
        </View>
      )}

      {activeTab === 'restoration' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <TutorialHighlight isHighlighted={showTutorial && TUTORIAL_STEPS[currentTutorialStep]?.highlight === 'restoration'}>
            <PersonalityRestoration
              primaryTrait={primaryTrait}
              userProfile={userProfile}
              stories={stories}
              globalStyles={globalStyles}
              onThemeToggle={() => theme.toggleTheme()}
              onLogout={() => auth.logout()}
              currentTheme={theme.themeMode}
            />
          </TutorialHighlight>
        </View>
      )}

      {/* Story Modals */}
      {selectedStory && isStoryVisible && (
        <StoryScreen
          visible={isStoryVisible}
          onClose={handleCloseStory}
          story={selectedStory}
          chapter={{ id: 1, title: 'Chapter 1', passages: [] } as any}
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

      {/* Tutorial Modal Component */}
      {showTutorial && (
        <Modal
          visible={showTutorial}
          transparent={true}
          animationType="fade"
          onRequestClose={skipTutorial}
        >
          <View style={styles.tutorialOverlay}>
            <View style={styles.tutorialContent}>
              {/* Tutorial Header */}
              <View style={styles.tutorialHeader}>
                <Text style={styles.tutorialTitle}>{TUTORIAL_STEPS[currentTutorialStep].title}</Text>
                <Text style={styles.tutorialMessage}>{TUTORIAL_STEPS[currentTutorialStep].message}</Text>
                {TUTORIAL_STEPS[currentTutorialStep].tip && (
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipText}>💡 Pro Tip: {TUTORIAL_STEPS[currentTutorialStep].tip}</Text>
                  </View>
                )}
              </View>

              {/* Progress Indicators */}
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

              {/* Navigation Buttons */}
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

      {/* CodexModal for journal creation */}
      <CodexModal
        visible={showCodexModal}
        onClose={() => {
          console.log('CodexModal closed');
          setShowCodexModal(false);
        }}
        onSave={async (entry: any) => {
          console.log('CodexModal entry saved:', entry);
          setShowCodexModal(false);
          // Refresh the CodexContent entries after saving
          if (codexContentRef.current) {
            try {
              await codexContentRef.current.refreshEntries();
              console.log('✅ Refreshed CodexContent entries after saving');
            } catch (error) {
              console.warn('Failed to refresh CodexContent entries:', error);
            }
          }
        }}
        selectedType="journal"
      />
    </SafeAreaView>
  );
}

// Styles
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
  debugTutorialButton: {
    backgroundColor: '#444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
