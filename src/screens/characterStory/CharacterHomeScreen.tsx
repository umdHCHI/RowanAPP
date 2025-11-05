import { createCharacterHomeStyles } from "@/src/styles/screens/characterHome";
import { getStoryStyles } from "@/src/styles/globalStyles";
import { useRouter } from "expo-router";
import React from "react";
import { Linking } from "react-native";
import { MattAvatar, ReganAvatar, TrevorAvatar } from "../../assets";
import { archiveHeaderIcon, equipmentIcons } from "../../assets/equipment";
import { RowanAvatar, uiIcons } from "../../assets/ui";
import AttributeInfoModal from "../../components/AttributeInfoModal";
import EquipmentModal from "../../components/EquipmentModal";
import { useMasterState } from "../../context/MasterStateContext";
import {
  Alert,
  AsyncStorage,
  BlurView,
  CharacterPreview,
  CodexModal,
  Dimensions,
  EquipmentItem,
  EquippedItems,
  Icon,
  Image,
  LinearGradient,
  ScrollView,
  StatusBar,
  Story,
  StyleSheet,
  Text,
  ThoughtDefenderModal,
  TouchableOpacity,
  View,
  useEffect,
  useState
} from "../../imports";
import { CodexEntry } from "../../types/journal";

import { apiService } from "../../services/apiService";
import { getResearchCondition } from "../../utils/researchCondition";
import ChapterScreen from "./ChapterScreen";
import StoryScreen from "./StoryScreen";

const { width, height } = Dimensions.get("window");

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "📜 Orientation, Part I: An Introduction",
    message: "Ah, you're finally semi-corporeal. Welcome to The Archive,the grand, un-asked-for repository of... well, you. Every thought you've had, every book you were meant to read. This is your induction. Pay attention.",
    highlight: "header",
    tip: "A note from the Curator: Don't rush. The stacks are infinite; your sanity is not."
  },
  {
    id: 2,
    title: "🧐 The Archivist's Folio",
    message: "This is you, or the current draft, anyway. These foundations—Exploration, Courage, Connection, and Fear—are the core subjects of this library. Each is a tome waiting for you to read and understand it. In helping them heal, you strengthen yourself.",
    highlight: "character",
    tip: "A note from the Curator: Your foundations dictate which forgotten corridors you can navigate. Neglect one at your peril."
  },
  {
    id: 3,
    title: "✒️ Scholarly Implements",
    message: "Every scholar requires tools. These artifacts are... unconventional. Tomes to focus the mind, cloaks to endure tedious social gatherings, and boots to keep you from floating away into abstraction. Equip them. They might even help.",
    highlight: "equipment",
    tip: "A note from the Curator: The proper attire can make all the difference between a breakthrough and a breakdown. Choose your 'loadout' with care."
  },
  {
    id: 4,
    title: "📖 Accessing the Stacks",
    message: "The 'Passages' are where the real work begins. These are unread tomes, whispering narratives of past trials. Your choices are your annotations; they dictate the outcome of the research. Your first assignment awaits in 'The Whispering Stacks'.",
    highlight: "passages",
    tip: "A note from the Curator: There are no 'wrong' choices, only poorly supported arguments. Re-read the material to explore alternative conclusions."
  },
  {
    id: 5,
    title: "✨ Illuminated Manuscripts",
    message: "This is your 'Restoration' shelf, where you'll find a record of your completed works. As you restore color and meaning to the forgotten tomes you encounter, your own scholarship will deepen, unlocking further sections of the library.",
    highlight: "restoration",
    tip: "A note from the Curator: Progress here is a measure of insight, not speed. Unlike your undergraduate career."
  },
  {
    id: 6,
    title: "✍️ Your Inscriptions",
    message: "Within The Archive,'Inscriptions' are all your personal marginalia on the text of your own life. Scribe your thoughts, sketch your conclusions, or record your frustrated muttering. A good scholar keeps meticulous field notes.",
    highlight: "codex",
    tip: "A note from the Curator: Don't neglect your notes. You'll be surprised what patterns emerge when you're not looking for them."
  },
  {
    id: 7,
    title: "🎓 The Orientation Concludes",
    message: "Congratulations, you now possess the basic competencies to not get immediately lost. The Archive is vast, and the whispers are waiting. Now, get to it. The books won't read themselves.",
    highlight: "none",
    tip: "A note from the Curator: Should you require this lecture again, the question mark is your friend. Do try not to need it."
  }
];

const ResearchConditions = {
  A: {
    avatars: ['⚔️', '🛡️', '🏹', '🔮', '⚡', '💥'],
    titles: [
      'Seeker of Truths',
      'Bearer of Burdens', 
      'Keeper of Bonds',
      'Weaver of Change',
      'Watcher Between Worlds',
      'Marked by Fate'
    ],
    theme: 'Character Creation Realm',
    description: 'Forge your avatar and customize your path through The Archive'
  }
};

const getUserTitle = (userId?: string | number): string => {
  if (!userId) {
    return 'Curator of Hidden Knowledge';
  }
  
  let hash = 0;
  const userIdStr = String(userId);
  
  for (let i = 0; i < userIdStr.length; i++) {
    const char = userIdStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const titleIndex = Math.abs(hash) % ResearchConditions.A.titles.length;
  const selectedTitle = ResearchConditions.A.titles[titleIndex];
  
  return selectedTitle;
};

const selectProfileAndCharacter = (homeData?: any) => {
  const hd = homeData ?? null;
  const profile = hd?.userProfile ?? hd ?? null;
  const backendCharacter = hd?.character ?? profile?.character ?? null;
  return { profile, backendCharacter };
};

const ArchiveInterface: React.FC = () => {
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

  const router = useRouter();
  const homeStyles = createCharacterHomeStyles(theme.characterHomeScreenTheme);
  const homeTheme = theme.characterHomeScreenTheme;
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState(false);

  const [journalStats, setJournalStats] = useState<{
    total_entries: number;
    entries_by_type: { journal: number; draw: number; voice: number };
    total_prompts_completed: number;
    streak_days: number;
    last_entry_date: string | null;
  } | null>(null);
  const [isLoadingJournalStats, setIsLoadingJournalStats] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const storyStyles = getStoryStyles(theme.theme);

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
      await AsyncStorage.setItem('hasSeenTutorial', 'true');
    } catch (error) {
      // Silent error handling
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    AsyncStorage.setItem('hasSeenTutorial', 'true').catch(() => {});
  };

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialSeen = await AsyncStorage.getItem('hasSeenTutorial');
        if (tutorialSeen === 'true') {
          setHasSeenTutorial(true);
        } else {
          setTimeout(() => {
            if (!hasSeenTutorial) {
              startTutorial();
            }
          }, 2000);
        }
      } catch (error) {
        // Silent error handling
      }
    };
    
    checkTutorialStatus();
  }, []);

  const getEquippedGearForSlot = (slot: 'weapon' | 'armor' | 'helmet' | 'boots') => {
    const foundGear = equipment.equippedGear.find(gear => gear.gear_type.slot === slot);
    return foundGear;
  };

  const getGearSlotImage = (gear: any) => {
    const slot = gear.gear_type.slot;
    const name = gear.gear_type.name.toLowerCase();
    let equipmentType: string;
    let subtype: string;
    
    switch (slot) {
      case 'weapon':
        if (name.includes('scroll') || name.includes('stillness')) {
          equipmentType = 'focus';
          subtype = 'scroll';
        } else if (name.includes('wand') || name.includes('magic')) {
          equipmentType = 'focus';
          subtype = 'magicWand';
        } else if (name.includes('staff') || name.includes('topaz')) {
          equipmentType = 'focus';
          subtype = 'topazStaff';
        } else if (name.includes('sapphire')) {
          equipmentType = 'focus';
          subtype = 'sapphireStaff';
        } else if (name.includes('torch')) {
          equipmentType = 'focus';
          subtype = 'torch';
        } else if (name.includes('sword') || name.includes('iron')) {
          equipmentType = 'combat';
          subtype = 'ironSword';
        } else if (name.includes('golden') || name.includes('gold')) {
          equipmentType = 'combat';
          subtype = 'goldenSword';
        } else if (name.includes('shield')) {
          if (name.includes('iron')) {
            equipmentType = 'combat';
            subtype = 'ironShield';
          } else {
            equipmentType = 'combat';
            subtype = 'woodenShield';
          }
        } else {
          equipmentType = 'focus';
          if (name.includes('breathing') || name.includes('breath')) {
            subtype = 'breathing';
          } else if (name.includes('journal') || name.includes('notebook')) {
            subtype = 'journaling';
          } else {
            subtype = 'meditation';
          }
        }
        break;
        
      case 'armor':
        if (name.includes('item_27') || name.includes('item27')) {
          equipmentType = 'comfort';
          subtype = 'item27';
        } else if (name.includes('item_29') || name.includes('item29')) {
          equipmentType = 'comfort';
          subtype = 'item29';
        } else if (name.includes('item_31') || name.includes('item31')) {
          equipmentType = 'comfort';
          subtype = 'item31';
        } else {
          equipmentType = 'comfort';
          if (name.includes('social') || name.includes('friend') || name.includes('style')) {
            subtype = 'social';
          } else if (name.includes('hobby') || name.includes('activity')) {
            subtype = 'hobby';
          } else if (name.includes('nature') || name.includes('outdoor')) {
            subtype = 'nature';
          } else {
            subtype = 'social';
          }
        }
        break;
        
      case 'helmet':
        if (name.includes('wizard') || name.includes('hat')) {
          equipmentType = 'shield';
          subtype = 'wizardHat';
        } else if (name.includes('helm') && !name.includes('iron') && !name.includes('leather')) {
          equipmentType = 'shield';
          subtype = 'helm';
        } else if (name.includes('iron')) {
          equipmentType = 'shield';
          subtype = 'ironHelmet';
        } else if (name.includes('leather')) {
          equipmentType = 'shield';
          subtype = 'leatherHelmet';
        } else {
          equipmentType = 'shield';
          if (name.includes('boundary') || name.includes('limit')) {
            subtype = 'boundary';
          } else if (name.includes('affirmation') || name.includes('positive')) {
            subtype = 'affirmation';
          } else if (name.includes('routine') || name.includes('habit')) {
            subtype = 'routine';
          } else {
            subtype = 'boundary';
          }
        }
        break;
        
      case 'boots':
        if (name.includes('iron')) {
          equipmentType = 'ground';
          subtype = 'ironBoot';
        } else if (name.includes('leather')) {
          equipmentType = 'ground';
          subtype = 'leatherBoot';
        } else {
          equipmentType = 'ground';
          if (name.includes('exercise') || name.includes('movement')) {
            subtype = 'exercise';
          } else if (name.includes('sleep') || name.includes('rest')) {
            subtype = 'sleep';
          } else if (name.includes('nutrition') || name.includes('food')) {
            subtype = 'nutrition';
          } else {
            subtype = 'exercise';
          }
        }
        break;
        
      default:
        equipmentType = 'focus';
        subtype = 'meditation';
    }
    
    try {
      const asset = (equipmentIcons as any)[equipmentType][subtype];
      if (asset) {
        return asset;
      }
    } catch (error) {
      // Silent error handling
    }
    
    switch (slot) {
      case 'weapon':
        return equipmentIcons.focus.meditation;
      case 'armor':
        return equipmentIcons.comfort.social;
      case 'helmet':
        return equipmentIcons.shield.boundary;
      case 'boots':
        return equipmentIcons.ground.exercise;
      default:
        return equipmentIcons.focus.meditation;
    }
  };

  const getFoundationIcon = (foundation: any) => {
    const foundationLabel = foundation.label?.toLowerCase() || '';
    
    if (foundationLabel.includes('connection')) {
      return uiIcons.sectionIcons.bluegloveofthanos;
    } else if (foundationLabel.includes('exploration')) {
      return uiIcons.sectionIcons.exploration;
    } else if (foundationLabel.includes('courage')) {
      return uiIcons.sectionIcons.courage;
    } else if (foundationLabel.includes('fear')) {
      return uiIcons.sectionIcons.fear;
    } else {
      return uiIcons.sectionIcons.greenslug;
    }
  };

  const wellnessStatsForDisplay = (() => {
    const homeData = wellness.homeData;
    const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);
    
    const normalizedBackendCharacter = (() => {
      let char: any = character.backendCharacter;
      
      if (Array.isArray(char)) {
        char = char[0];
      }
      
      if (char && typeof char === 'object' && 'character' in char) {
        char = char.character;
      }
      
      return char;
    })();
    
    const characterWellnessStats = (normalizedBackendCharacter as any)?.wellness_stats || backendCharacterData?.wellness_stats;
    if (characterWellnessStats && Array.isArray(characterWellnessStats) && characterWellnessStats.length > 0) {
      return characterWellnessStats;
    }
    
    if (normalizedBackendCharacter && (
      (normalizedBackendCharacter as any).awareness !== undefined || 
      (normalizedBackendCharacter as any).resilience !== undefined ||
      (normalizedBackendCharacter as any).connection !== undefined ||
      (normalizedBackendCharacter as any).balance !== undefined
    )) {
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: (normalizedBackendCharacter as any).awareness || 0, 
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: (normalizedBackendCharacter as any).resilience || 0, 
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: (normalizedBackendCharacter as any).connection || 0, 
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: (normalizedBackendCharacter as any).balance || 0, 
          color: "#F39C12" 
        }
      ];
    }
    
    const wellnessAverage = (normalizedBackendCharacter as any)?.wellness_average || backendCharacterData?.wellness_average;
    if (wellnessAverage !== undefined) {
      const baseValue = Math.floor(wellnessAverage * 5);
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: baseValue, 
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: baseValue, 
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: baseValue, 
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: baseValue, 
          color: "#F39C12" 
        }
      ];
    }
    
    // Determine user type based on research condition
    // Pass profile directly since we have it in this context
    const researchCondition = getResearchCondition({ profile: userProfile });
    const hasCompletionDataId = !!(userProfile?.completion_data_id || (normalizedBackendCharacter as any)?.completion_data_id);

    if (researchCondition === 'character' && hasCompletionDataId && !normalizedBackendCharacter && !backendCharacterData) {
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: 5,
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: 5,
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: 5,
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: 5,
          color: "#F39C12" 
        }
      ];
    }
    
    return archive.archiveFoundations;
  })();

  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      const backendStories = await apiService.getCharacterStories();
      const allProgressRecords = await apiService.getStoryProgressRecords('');
      const progressMap = new Map(allProgressRecords.map((p: any) => [p.story, p]));

      const storiesWithProgress = backendStories.map((story: any) => {
        const progress = progressMap.get(story.id);
        return {
          ...story,
          exploration: progress?.progress_percentage || 0,
          revelations: progress?.choices_made_count || 0,
        };
      });

      setStories(storiesWithProgress);
      ui.setMemoryStories(storiesWithProgress);
    } catch (error) {
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const loadGameData = async () => {
    setIsLoadingGameData(true);
    try {
      const comprehensiveGameData = await apiService.getComprehensiveGameData();
      setGameData(comprehensiveGameData);
      await loadStories();
    } catch (error) {
      setGameData(null);
    } finally {
      setIsLoadingGameData(false);
    }
  };

  const calculateOverallArchiveProgress = () => {
    try {
      if (!stories || stories.length === 0) {
        const completedStories = Array.from(archive.completedStories || []).length;
        return {
          overallProgress: completedStories > 0 ? 100 : 0,
          totalStories: 0,
          storiesWithProgress: completedStories,
          averageProgress: completedStories > 0 ? 100 : 0,
          completedStories
        };
      }

      let totalProgress = 0;
      let storiesWithProgress = 0;
      let completedStories = 0;

      stories.forEach(story => {
        if (story.exploration !== undefined && story.exploration > 0) {
          totalProgress += story.exploration;
          storiesWithProgress++;
          
          // Consider story completed if exploration is 100%
          if (story.exploration >= 100) {
            completedStories++;
          }
        }
      });

      // If no exploration data found, fall back to archive completed stories
      if (storiesWithProgress === 0) {
        const archiveCompleted = Array.from(archive.completedStories || []).length;
        if (archiveCompleted > 0) {
          return {
            overallProgress: 100,
            totalStories: stories.length,
            storiesWithProgress: archiveCompleted,
            averageProgress: 100,
            completedStories: archiveCompleted
          };
        }
      }

      const averageProgress = storiesWithProgress > 0 ? Math.round(totalProgress / storiesWithProgress) : 0;
      const overallProgress = stories.length > 0 ? Math.round(totalProgress / stories.length) : 0;

      return {
        overallProgress,
        totalStories: stories.length,
        storiesWithProgress,
        averageProgress,
        completedStories
      };
    } catch (error) {
      return {
        overallProgress: 0,
        totalStories: 0,
        storiesWithProgress: 0,
        averageProgress: 0,
        completedStories: 0
      };
    }
  };

  const loadJournalStats = async () => {
    try {
      setIsLoadingJournalStats(true);
      
      let entries = await apiService.getMyCodexEntries();
      
      if (!entries || (Array.isArray(entries) && entries.length === 0)) {
        entries = await apiService.getAllCodexEntries();
      }
      
      const entriesByType = {
        journal: 0,
        draw: 0,
        voice: 0
      };
      
      let totalEntries = 0;
      
      if (Array.isArray(entries)) {
        entries.forEach((entry: any) => {
          totalEntries++;
          if (entry.entry_type === 'journal') {
            entriesByType.journal++;
          } else if (entry.entry_type === 'draw') {
            entriesByType.draw++;
          } else if (entry.entry_type === 'voice') {
            entriesByType.voice++;
          }
        });
      } else {
        if (entries && typeof entries === 'object') {
          const entriesArray = (entries as any).entries || (entries as any).data || entries;
          if (Array.isArray(entriesArray)) {
            entriesArray.forEach((entry: any) => {
              totalEntries++;
              if (entry.entry_type === 'journal') {
                entriesByType.journal++;
              } else if (entry.entry_type === 'draw') {
                entriesByType.draw++;
              } else if (entry.entry_type === 'voice') {
                entriesByType.voice++;
              }
            });
          }
        }
      }
      
      const streakDays = 0;
      
      const stats = {
        total_entries: totalEntries,
        entries_by_type: entriesByType,
        total_prompts_completed: totalEntries,
        streak_days: streakDays,
        last_entry_date: entries && entries.length > 0 ? entries[0].created_at : null
      };
      
      setJournalStats(stats);
      
    } catch (error) {
      setJournalStats(null);
    } finally {
      setIsLoadingJournalStats(false);
    }
  };

  useEffect(() => {
    if (ui.activeTab === "tomes" || ui.activeTab === "restoration") {
      loadStories();
      loadGameData();
    }
  }, [ui.activeTab]);
  
  useEffect(() => {
    loadStories();
    loadGameData();
    loadJournalStats();
    equipment.loadBackendGear();
    
    const validTabs = ["atrium", "passages", "inscriptions", "defender", "restoration"];
    if (!validTabs.includes(ui.activeTab)) {
      ui.setActiveTab("atrium");
    }
  }, []);

  const handleOpenStory = async (storyToOpen: Story) => {
    setSelectedStory(storyToOpen);
    if (storyToOpen.chapter_count && storyToOpen.chapter_count > 0) {
      setIsChapterScreenVisible(true);
    } else {
      await apiService.restartStory(storyToOpen.id);
      const storyWithoutChapter = {
        ...storyToOpen,
        chapterId: undefined,
      };
      ui.openStory(storyWithoutChapter);
    }
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      if (!selectedStory?.id) {
        Alert.alert("Error", "No story selected. Please try again.");
        return;
      }
  
      setIsChapterScreenVisible(false);
  
      const storyWithChapterInfo = {
        ...selectedStory,
        chapterId: chapterId,
        passages: undefined,
      };
      
      ui.openStory(storyWithChapterInfo);
  
    } catch (error) {
      Alert.alert("Error", "Failed to load chapter. Please try again.");
    }
  };

  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = async (completionData: any) => {
    archive.handleStoryComplete(completionData.storyId);
    handleCloseStory();
    
    // ✅ REWARDS ALREADY SAVED BY StoryRewardManager
    // Just refresh UI data to show updated stats
    try {
      if (isRefreshingData) {
        return;
      }
      
      setIsRefreshingData(true);
      
      // Refresh data from backend to show updated values
      await wellness.loadHomeData();
      await equipment.loadBackendGear();
      
      // Update local archive state for UI display
      if (completionData?.finalRewards?.length > 0) {
        completionData.finalRewards.forEach((reward: string) => {
          archive.handleArtifactUnlock({
            name: reward,
            type: 'story_reward',
            equipped: false,
            resonance: 1,
            description: `Earned from completing story ${completionData.storyId}`,
            rarity: 'Common'
          });
        });
      }
      
      if (completionData?.skillsLearned?.length > 0) {
        archive.handleSkillLearned(completionData.skillsLearned);
      }
      
    } catch (error) {
      // Silent error handling
    } finally {
      setIsRefreshingData(false);
    }
    
    Alert.alert(
      "🎉 Story Completed!", 
      "You have successfully completed this story and earned rewards!"
    );
  };

  const handleCodexEntrySubmit = (entry: {
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    const transformedEntry: Omit<CodexEntry, "id" | "created_at" | "updated_at"> = {
      prompt: parseInt(entry.prompt) || 1,
      prompt_id: entry.prompt || "legacy_prompt",
      prompt_text: entry.prompt || "Legacy prompt",
      entry_type: (entry.type as 'journal' | 'draw' | 'voice') || 'journal',
      content: entry.passages || "",
      content_preview: entry.passages ? entry.passages.substring(0, 100) : "",
      skill_category: entry.skillCategory || "general",
      difficulty: entry.difficulty || "medium",
      word_count: entry.passages ? entry.passages.split(' ').length : 0,
      duration_seconds: null,
      username: "user",
    };

    archive.handleCodexEntry(transformedEntry);

    Alert.alert(
      "📝 Reflection Recorded",
      `Your ${entry.skillCategory} reflection has been added to the Archive.`,
      [{ text: "Continue Exploring", style: "default" }]
    );
  };

  const handleMiniGameCompleteSubmit = (
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => {
    archive.handleMiniGameComplete(gameType, data);

    // Only handle drawing alerts - ThoughtDefenderModal handles its own alerts
    if (gameType === "drawing") {
      Alert.alert(
        "🎨 Creative Expression Recorded",
        "Your drawing has been added to the Archive.",
        [{ text: "Continue Creating", style: "default" }]
      );
    }
    // Remove thoughtDefender alert handling - it's handled in the modal itself
  };

  const handleEquip = async (item: EquipmentItem) => {
    try {
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.id.toString() === item.id
      );
      
      if (backendGearItem) {
        await equipment.equipBackendGear(backendGearItem.id);
        await wellness.loadHomeData();
      } else {
        equipment.equipItem(item.type, item);
        await wellness.loadHomeData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to equip item. Please try again.');
    }
  };
  
  const handleUnequip = async (item: EquipmentItem) => {
    try {
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.id.toString() === item.id
      );
      
      if (backendGearItem) {
        await equipment.unequipBackendGear(backendGearItem.id);
        await wellness.loadHomeData();
      } else {
        equipment.unequipItem(item.type);
        await wellness.loadHomeData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unequip item. Please try again.');
    }
  };

  const TabButton: React.FC<{
    title: string;
    icon: string | any;
    isActive: boolean;
    onPress: () => void;
  }> = ({ title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[homeStyles.tabButton, isActive && homeStyles.activeTab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <LinearGradient
          colors={[homeTheme.tabIsActiveGradient, homeTheme.tabIsActiveSecondaryGradient]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {typeof icon === 'string' ? (
        <Icon name={icon} size={18} color={isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor} />
      ) : (
        <Image 
          source={icon} 
          style={{
            width: 18,
            height: 18,
            opacity: isActive ? 1 : 0.7
          }}
          resizeMode="contain"
        />
      )}
      <Text
        style={[
          homeStyles.tabText,
          isActive ? homeStyles.tabTextActive : homeStyles.tabTextInactive,
          { color: isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const CharacterDisplay = () => {
    const homeData = wellness.homeData;
    const backendCharacter = character.backendCharacter;

    const isPersonalityHomeData = homeData && 'userProfile' in homeData;
    const hasHomeData = homeData;
    const hasBackendCharacter = backendCharacter;

    if (!hasHomeData && !hasBackendCharacter) {
      return (
        <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={homeStyles.characterFrame}
          >
            <View style={homeStyles.characterFrameInner}>
              <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
                No character created yet
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    let characterData, characterAppearanceData, wellnessStats, characterName;
    const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);
    
    if (isPersonalityHomeData) {
      characterName = userProfile?.username || userProfile?.email || "Admin User";
      characterData = {
        name: characterName,
        level: 1,
        selected_hair_style: 0,
        selected_shirt_type: 0,
        selected_eye_type: 0,
        selected_eyebrow_style: 0,
        selected_mouth_type: 0
      };
      characterAppearanceData = characterData;
      wellnessStats = null;
    } else {
      if (backendCharacterData) {
        characterData = {
          name: backendCharacterData.name || userProfile?.username || character.getCharacterName(),
          level: backendCharacterData.level || 1,
          experience: backendCharacterData.experience || 0,
          experience_progress_percentage: backendCharacterData.experience_needed || 0,
          wellness_average: backendCharacterData.wellness_average || 0,
          character_config: backendCharacterData.character_config || null,
          equipped_gear: backendCharacterData.equipped_gear || []
        };
        characterAppearanceData = backendCharacterData.character_config || backendCharacterData;
        characterName = backendCharacterData?.name || userProfile?.username || userProfile?.email || character.getCharacterName();
      } else {
        characterData = {
          name: userProfile?.username || character.getCharacterName(),
          level: 1,
          experience: 100,
          experience_progress_percentage: userProfile?.experience_needed || 1000,
          wellness_average: userProfile?.wellness_average || 0.25,
          character_config: userProfile?.character_config || null,
          equipped_gear: userProfile?.equipped_gear || []
        };
        characterAppearanceData = userProfile?.character_config || characterData;
        characterName = characterData.name;
      }
      
      wellnessStats = null;
    }

    if (!characterData) {
      return (
        <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={homeStyles.characterFrame}
          >
            <View style={homeStyles.characterFrameInner}>
              <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
                Character data unavailable
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(78, 230, 230, 0.3)",
            "rgba(6, 182, 212, 0.2)",
            "rgba(78, 230, 230, 0.3)",
          ]}
          style={homeStyles.characterFrame}
        >
          <View style={homeStyles.characterFrameInner}>
            <CharacterPreview
                selectedName={characterName}
                baseAsset={character.getBaseAsset(false)}
                background={character.getCurrentBackgroundAsset(false)}
                hairSheet={character.getHairAsset(false)}
                clothesSheet={character.getClothesAsset(false)}
                eyesSheet={character.getEyesAsset(false)}
                eyebrowsSheet={character.getEyebrowsAsset(false)}
                mouthSheet={character.getMouthAsset(false)}
                hairIndex={(characterAppearanceData as any)?.selected_hair_style || character.getHairIndex() || 0}
                clothesIndex={(characterAppearanceData as any)?.selected_shirt_type || character.getClothesIndex() || 0}
                eyesIndex={(characterAppearanceData as any)?.selected_eye_type || character.getEyesIndex() || 0}
                eyebrowsIndex={(characterAppearanceData as any)?.selected_eyebrow_style || character.getEyebrowsIndex() || 0}
                mouthIndex={(characterAppearanceData as any)?.selected_mouth_type || character.selectedMouthType || 0}
                size={homeStyles.characterFrame?.height}
                fitToFrame
              />

            <View style={homeStyles.characterLevelBadge}>
              <LinearGradient
                colors={["#4ee6e6", "#06b6d4"]}
                style={homeStyles.levelBadgeGradient}
              >
                <Text style={homeStyles.levelBadgeText}>
                  Lv.{characterData?.level || 1}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        <View style={homeStyles.characterMoodBubble}>
          <LinearGradient
            colors={["rgba(244, 241, 232, 0.95)", "rgba(212, 175, 55, 0.8)"]}
            style={homeStyles.moodBubbleGradient}
          >
            <Text style={homeStyles.moodBubbleText}>
              "Ready to explore the depths of memory..."
            </Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const TutorialModal = () => {
    if (!showTutorial) return null;
    
    const currentStep = TUTORIAL_STEPS[currentTutorialStep];
    const isFirstStep = currentTutorialStep === 0;
    const isLastStep = currentTutorialStep === TUTORIAL_STEPS.length - 1;
    
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
        }} />

        <View style={{
          position: 'absolute',
          top: '15%',
          left: 12,
          right: 12,
          backgroundColor: 'rgba(10, 11, 15, 0.95)',
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#4ee6e6',
          padding: 16,
          zIndex: 1001,
          shadowColor: '#4ee6e6',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
          maxHeight: '70%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: index === currentTutorialStep ? '#4ee6e6' : 'rgba(78, 230, 230, 0.3)',
                  marginHorizontal: 3,
                }}
              />
            ))}
          </View>

          <Text style={{
            color: '#4ee6e6',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 12,
            textShadowColor: 'rgba(78, 230, 230, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            {currentStep.title}
          </Text>

          <Text style={{
            color: '#ffffff',
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            marginBottom: 12,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            {currentStep.message}
          </Text>

          {currentStep.tip && (
            <View style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(212, 175, 55, 0.3)',
              borderRadius: 10,
              padding: 10,
              marginBottom: 16,
            }}>
              <Text style={{
                color: '#d4af37',
                fontSize: 12,
                fontStyle: 'italic',
                textAlign: 'center',
                textShadowColor: 'rgba(212, 175, 55, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                💡 {currentStep.tip}
              </Text>
            </View>
          )}

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}>
            <TouchableOpacity
              onPress={skipTutorial}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                flex: 1,
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: '500',
                textAlign: 'center',
              }}>
                Skip
              </Text>
            </TouchableOpacity>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              flex: 2,
            }}>
              {!isFirstStep && (
                <TouchableOpacity
                  onPress={previousTutorialStep}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: 'rgba(78, 230, 230, 0.2)',
                    borderWidth: 1,
                    borderColor: '#4ee6e6',
                    flex: 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: '#4ee6e6',
                    fontSize: 12,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    ← Prev
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={nextTutorialStep}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: '#4ee6e6',
                  shadowColor: '#4ee6e6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                  flex: 1,
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#0a0b0f',
                  fontSize: 12,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  {isLastStep ? 'Start!' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const TutorialHighlight = ({ children, isHighlighted, style }: { 
    children: React.ReactNode; 
    isHighlighted: boolean; 
    style?: any;
  }) => {
    const [pulseOpacity, setPulseOpacity] = useState(0.3);
    
    useEffect(() => {
      if (isHighlighted) {
        const pulseInterval = setInterval(() => {
          setPulseOpacity(prev => prev === 0.3 ? 0.8 : 0.3);
        }, 800);
        
        return () => clearInterval(pulseInterval);
      }
    }, [isHighlighted]);
    
    if (!isHighlighted) return <>{children}</>;
    
    return (
      <View style={[style, { position: 'relative' }]}>
        {children}
        <View style={{
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderWidth: 3,
          borderColor: '#4ee6e6',
          borderRadius: 8,
          opacity: pulseOpacity,
          zIndex: 999,
        }} />
      </View>
    );
  };

  return (
    <View style={[homeStyles.archiveContainer, { paddingTop: 20 }]}>
      <StatusBar
        barStyle={
          theme.themeMode === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor="#0a0b0f"
      />

      <LinearGradient
        colors={[
          theme.theme.archiveGradientStart,
          theme.theme.archiveGradientMiddle,
          theme.theme.archiveGradientEnd,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[homeStyles.atmosphericOverlay, { opacity: 0.15 }]} />

      <View style={homeStyles.archivepassages}>
        <View style={homeStyles.archiveHeader}>
          <LinearGradient
            colors={[
              "rgba(10, 11, 15, 0.9)",
              "rgba(30, 41, 59, 0.8)",
              "rgba(10, 11, 15, 0.9)",
            ]}
            style={homeStyles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={homeStyles.archiveHeaderpassages}>
              <View style={homeStyles.archiveHeaderLeft}>
                <LinearGradient
                  colors={["#4ee6e6", "#06b6d4", "#0891b2"]}
                  style={homeStyles.archiveHeaderIcon}
                >
                  <Image 
                    source={archiveHeaderIcon}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                    resizeMode="contain"
                  />
                </LinearGradient>
                
                <View style={homeStyles.archiveHeaderTextContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{
                      ...homeStyles.archiveHeaderTitle,
                      color: '#4ee6e6',
                      fontSize: 24,
                      fontWeight: 'bold',
                      letterSpacing: 3,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                    }}>
                      The Archive
                    </Text>
                    
                    {/* Tutorial Button */}
                    <TouchableOpacity
                      onPress={startTutorial}
                      style={{
                        backgroundColor: 'rgba(78, 230, 230, 0.8)',
                        borderRadius: 12,
                        width: 26,
                        height: 26,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10,
                        shadowColor: '#4ee6e6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Text style={{ color: '#0a0b0f', fontSize: 14, fontWeight: 'bold' }}>?</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{
                    ...homeStyles.archiveHeaderSubtitle,
                    color: '#d4af37',
                    fontSize: 16,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}>
                    {(() => {
                      // Get user ID from auth context or character data
                      const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(wellness.homeData);
                      const userId = (auth.user as any)?.id || 
                                   (userProfile as any)?.id || 
                                   (backendCharacter as any)?.id || 
                                   auth.characterId ||
                                   (auth.user as any)?.username?.length || 1;
                      
                      const title = getUserTitle(userId);
                      const name = backendCharacter?.name || userProfile?.username || userProfile?.email || character.getCharacterName() || "Unnamed Character";
                      
                      
                      return `${title || 'NO TITLE RETURNED'} ${name}`;
                    })()}
                  </Text>
                  <View style={homeStyles.archiveStatusIndicator}>
                    <View style={[homeStyles.archiveStatusDot, { backgroundColor: '#4ee6e6' }]} />
                    <Text style={{
                      ...homeStyles.archiveStatusText,
                      color: '#4ee6e6',
                      fontSize: 12,
                      fontStyle: 'italic',
                      opacity: 0.8,
                    }}>
                      Archive systems active
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        <View style={homeStyles.archiveTabContainer}>

            <BlurView intensity={20} style={homeStyles.archiveTabpassages}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={homeStyles.archiveTabScrollpassages}
              >
                <TabButton
                  title="The Atrium"
                  icon={uiIcons.sectionIcons.atrium}
                  isActive={ui.activeTab === "atrium"}
                  onPress={() => ui.setActiveTab("atrium")}
                />
                <TabButton
                  title="Passages"
                  icon={uiIcons.sectionIcons.passages}
                  isActive={ui.activeTab === "passages"}
                  onPress={() => ui.setActiveTab("passages")}
                />
                <TabButton
                  title="Inscriptions"
                  icon={uiIcons.sectionIcons.inscriptions}
                  isActive={ui.activeTab === "inscriptions"}
                  onPress={() => ui.setActiveTab("inscriptions")}
                />
                <TabButton
                  title="Mind Defender"
                  icon={uiIcons.sectionIcons.defender}
                  isActive={ui.activeTab === "defender"}
                  onPress={() => ui.setActiveTab("defender")}
                />

                <TabButton
                  title="Restoration"
                  icon={uiIcons.sectionIcons.restoration}
                  isActive={ui.activeTab === "restoration"}
                  onPress={() => ui.setActiveTab("restoration")}
                />

              </ScrollView>
            </BlurView>
        </View>

        <ScrollView
          style={homeStyles.archiveTabpassagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {ui.activeTab === "atrium" && (
            <View style={homeStyles.tabpassagesArea}>
              <View style={homeStyles.avatarShowcaseHeader}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.archiveHeaderGradient, {
                    borderColor: '#9e8532ff',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={homeStyles.experienceProgressContainer}>
                      <LinearGradient
                        colors={["rgba(78, 230, 230, 0.8)", "rgba(6, 182, 212, 0.8)"]}
                        style={homeStyles.experienceProgressGradient}
                      >
                        <Icon name="zap" size={14} color="#0a0b0f" />
                        <Text style={homeStyles.experienceProgressText}>
                          {(() => {
                            // Extract experience data from the proper backend structure using the helper
                            const homeData = wellness.homeData;
                            const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(homeData);

                            const currentExperience = backendCharacter?.experience ?? 100; // Default to 100 XP for new users
                            const experienceNeeded = backendCharacter?.experience_needed_for_next_level || backendCharacter?.experience_needed || 1000;
                            const progressPercentage = backendCharacter?.experience_progress_percentage ?? 10; // Default to 10% progress
                            
                            if (progressPercentage !== undefined) {
                              return `${Math.round(progressPercentage)}% (${currentExperience}/${experienceNeeded} XP)`;
                            } else if (currentExperience !== undefined && experienceNeeded !== undefined) {
                              const calculatedPercentage = Math.round((currentExperience / experienceNeeded) * 100);
                              return `${calculatedPercentage}% (${currentExperience}/${experienceNeeded} XP)`;
                            } else {
                              return 'Experience data loading...';
                            }
                          })()}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={homeStyles.characterDisplaySection}>
                    <View style={homeStyles.gearColumnLeft}>
                      {[
                        {
                          type: "focus" as keyof EquippedItems,
                          label: "Focus Item",
                          icon: uiIcons.sectionIcons.staffwithgreengem,
                          slot: "weapon" as const,
                        },
                        {
                          type: "shield" as keyof EquippedItems,
                          label: "Mind Shield",
                          icon: uiIcons.sectionIcons.bluejewel,
                          slot: "helmet" as const,
                        },
                      ].map((slot, i) => (
                        <TouchableOpacity
                          key={i}
                          style={homeStyles.gearSlot}
                          onPress={async () => {
                            try {
                              await equipment.loadBackendGear();
                              setShowEquipmentModal(true);
                            } catch (error) {
                              Alert.alert('Error', 'Failed to load equipment data. Please try again.');
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              homeTheme.gearSlotGradientStart || 'rgba(10, 11, 15, 0.9)',
                              homeTheme.gearSlotGradientEnd || 'rgba(30, 41, 59, 0.7)',
                            ]}
                            style={homeStyles.gearSlotGradient}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={homeStyles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
                                  <View style={homeStyles.emptyGearSlot}>
                                    {typeof slot.icon === 'string' ? (
                                      <Text style={homeStyles.gearSlotIcon}>
                                        {slot.icon}
                                      </Text>
                                    ) : slot.icon && (typeof slot.icon === 'object' || typeof slot.icon === 'number') ? (
                                      <Image 
                                        source={slot.icon}
                                        style={{
                                          width: 24,
                                          height: 24,
                                          marginBottom: 4,
                                        }}
                                        resizeMode="contain"
                                      />
                                    ) : (
                                      <Text style={homeStyles.gearSlotIcon}>
                                        ?
                                      </Text>
                                    )}
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {slot.label}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLockedText}>
                                      Locked
                                    </Text>
                                  </View>
                                );
                              }
                            })()}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <CharacterDisplay />

                    <View style={homeStyles.gearColumnRight}>
                      {[
                        {
                          type: "comfort" as keyof EquippedItems,
                          label: "Comfort Layer",
                          icon: uiIcons.sectionIcons.purplebottle,
                          slot: "armor" as const,
                        },
                        {
                          type: "ground" as keyof EquippedItems,
                          label: "Ground Stone",
                          icon: uiIcons.sectionIcons.bluegloveofthanos,
                          slot: "boots" as const,
                        },
                      ].map((slot, i) => (
                        <TouchableOpacity
                          key={i}
                          style={homeStyles.gearSlot}
                          onPress={async () => {
                            try {
                              await equipment.loadBackendGear();
                              setShowEquipmentModal(true);
                            } catch (error) {
                              Alert.alert('Error', 'Failed to load equipment data. Please try again.');
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              homeTheme.gearSlotGradientStart || 'rgba(10, 11, 15, 0.9)',
                              homeTheme.gearSlotGradientEnd || 'rgba(30, 41, 59, 0.7)',
                            ]}
                            style={homeStyles.gearSlotGradient}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={homeStyles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
                                  <View style={homeStyles.emptyGearSlot}>
                                    {typeof slot.icon === 'string' ? (
                                      <Text style={homeStyles.gearSlotIcon}>
                                        {slot.icon}
                                      </Text>
                                    ) : slot.icon && (typeof slot.icon === 'object' || typeof slot.icon === 'number') ? (
                                      <Image 
                                        source={slot.icon}
                                        style={{
                                          width: 24,
                                          height: 24,
                                          marginBottom: 4,
                                        }}
                                        resizeMode="contain"
                                      />
                                    ) : (
                                      <Text style={homeStyles.gearSlotIcon}>
                                        ?
                                      </Text>
                                    )}
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {slot.label}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLockedText}>
                                      Locked
                                    </Text>
                                  </View>
                                );
                              }
                            })()}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={homeStyles.foundationsSectionGradient}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                    <Text style={homeStyles.foundationsTitle}>
                      Moments of Reflection
                    </Text>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={homeStyles.foundationsSubtitle}>
                    The ethereal pillars that support your mental architecture
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    {wellnessStatsForDisplay.map((foundation: any, index: number) => {
                      const isWellnessStats = "label" in foundation && "value" in foundation;

                      if (isWellnessStats) {
                        const currentValue = foundation.value || 0;
                        const maxValue = 20;
                        const currentLevel = Math.floor(currentValue / 5) + 1;
                        const progressInCurrentLevel = currentValue % 5;
                        const xpToNextLevel = currentValue >= maxValue ? 0 : 5 - progressInCurrentLevel;
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            style={homeStyles.foundationCard}
                            onPress={() => {
                              setSelectedAttribute({
                                label: foundation.label,
                                value: currentValue,
                                maxValue: maxValue,
                                color: foundation.color,
                              });
                              setShowAttributeModal(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={[
                                homeTheme.foundationCardGradientStart,
                                homeTheme.foundationCardGradientMiddle,
                                homeTheme.foundationCardGradientEnd,
                              ]}
                              style={homeStyles.foundationCardGradient}
                              pointerEvents="none"
                            >
                              <View
                                style={homeStyles.foundationIconContainer}
                              >
                                <Image 
                                  source={getFoundationIcon(foundation)}
                                  style={{
                                    width: 32,
                                    height: 32,
                                  }}
                                  resizeMode="contain"
                                />
                              </View>

                              <View
                                style={homeStyles.foundationValueContainer}
                              >
                                <Text style={homeStyles.foundationValue}>
                                  {currentValue}
                                  <Text style={homeStyles.foundationMaxValue}>
                                    /{maxValue}
                                  </Text>
                                </Text>
                                <Text style={homeStyles.foundationLevel}>
                                  Level {currentLevel}
                                </Text>
                              </View>

                              <View
                                style={homeStyles.foundationProgressContainer}
                              >
                                <View
                                  style={homeStyles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={[
                                      foundation.color,
                                      foundation.color,
                                    ]}
                                    style={[
                                      homeStyles.foundationProgressFill,
                                      {
                                        width: `${Math.min((currentValue / maxValue) * 100, 100)}%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={homeStyles.xpToNext}>
                                  {currentValue >= maxValue ? "Max Level!" : `${xpToNextLevel} XP to next level`}
                                </Text>
                              </View>

                              <Text style={homeStyles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={homeStyles.foundationDescription}>
                                Your {foundation.label.toLowerCase()} foundation
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      } else {
                        return (
                          <TouchableOpacity
                            key={index}
                            style={homeStyles.foundationCard}
                            onPress={() => {
                              setSelectedAttribute({
                                label: foundation.label,
                                value: foundation.value,
                                maxValue: foundation.maxValue,
                                color: foundation.colors?.[0] || '#4ee6e6',
                              });
                              setShowAttributeModal(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={[
                                homeTheme.foundationCardGradientStart,
                                homeTheme.foundationCardGradientMiddle,
                                homeTheme.foundationCardGradientEnd,
                              ]}
                              style={homeStyles.foundationCardGradient}
                              pointerEvents="none"
                            >
                              <View
                                style={homeStyles.foundationIconContainer}
                              >
                                <Image 
                                  source={getFoundationIcon(foundation)}
                                  style={{
                                    width: 32,
                                    height: 32,
                                  }}
                                  resizeMode="contain"
                                />
                                {foundation.recentGain > 0 && (
                                  <View style={homeStyles.recentGainBadge}>
                                    <LinearGradient
                                      colors={["#10B981", "#34D399"]}
                                      style={homeStyles.recentGainGradient}
                                    >
                                      <Text style={homeStyles.recentGainText}>
                                        +{foundation.recentGain}
                                      </Text>
                                    </LinearGradient>
                                  </View>
                                )}
                              </View>

                              <View
                                style={homeStyles.foundationValueContainer}
                              >
                                <Text style={homeStyles.foundationValue}>
                                  {foundation.value}
                                  <Text style={homeStyles.foundationMaxValue}>
                                    /{foundation.maxValue}
                                  </Text>
                                </Text>
                                <Text style={homeStyles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>

                              <View
                                style={homeStyles.foundationProgressContainer}
                              >
                                <View
                                  style={homeStyles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={foundation.colors as any}
                                    style={[
                                      homeStyles.foundationProgressFill,
                                      {
                                        width: `${
                                          (foundation.value /
                                            foundation.maxValue) *
                                          100
                                        }%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={homeStyles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>

                              <Text style={homeStyles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={homeStyles.foundationDescription}>
                                {foundation.description}
                              </Text>

                              <View style={homeStyles.nextUnlockContainer}>
                                <Icon name="lock" size={10} color="#FCD34D" />
                                <Text style={homeStyles.nextUnlockText}>
                                  {foundation.nextUnlock}
                                </Text>
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

          {ui.activeTab === "passages" && (
            <View style={homeStyles.tabpassagesArea}>
              {isLoadingStories ? (
                <View style={storyStyles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={storyStyles.centeredMessageTitle}>
                    Loading Stories...
                  </Text>
                  <Text style={storyStyles.centeredMessageText}>
                    Fetching ancient wisdom from the Archive...
                  </Text>
                </View>
              ) : stories.length > 0 ? (
                stories.map((Story, index) => (
                  <TouchableOpacity
                    key={index}
                    style={storyStyles.chronicleCard}
                        onPress={() => {
                          handleOpenStory(Story);
                        }}
                        activeOpacity={0.8}
                      >
                    <LinearGradient
                      colors={
                        [
                          "rgba(10, 11, 15, 0.95)",
                          "rgba(30, 41, 59, 0.8)",
                          "rgba(10, 11, 15, 0.95)",
                        ] as const
                      }
                      style={[storyStyles.chronicleGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={storyStyles.chronicleTopBorder} />

                      <View style={storyStyles.chronicleHeader}>
                        <View style={storyStyles.chronicleInfo}>
                          <Text style={storyStyles.chronicleTitle}>
                            {Story.title || "Untitled Story"}
                          </Text>
                          <View style={storyStyles.chronicleBadges}>
                            <View style={storyStyles.categoryBadge}>
                              <Text style={storyStyles.categoryBadgeText}>
                                {Story.category || "Unknown"}
                              </Text>
                            </View>
                            <View style={storyStyles.difficultyBadge}>
                              <Text style={storyStyles.difficultyBadgeText}>
                                {Story.difficulty || "Unknown"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={storyStyles.chronicleDescriptionContainer}>
                        <Text style={storyStyles.chronicleDescription}>
                          {Story.description || "No description available"}
                        </Text>
                        <Text style={storyStyles.chronicleAtmosphere}>
                          ✦ {Story.atmosphere || "Mysterious atmosphere"} ✦
                        </Text>
                      </View>

                      <View style={storyStyles.explorationContainer}>
                        <View style={storyStyles.explorationHeader}>
                          <Image 
                            source={uiIcons.sectionIcons.explorationProgress} 
                            style={{ width: 16, height: 16 }} 
                            resizeMode="contain"
                          />
                          <Text style={storyStyles.explorationLabel}>
                            Exploration Progress
                          </Text>
                          <Text style={storyStyles.explorationValue}>
                            {Story.exploration || 0}%
                          </Text>
                        </View>
                        <View style={storyStyles.explorationBar}>
                          <LinearGradient
                            colors={["#06B6D4", "#A855F7", "#4F46E5"] as const}
                            style={[
                              storyStyles.explorationFill,
                              { width: `${Story.exploration || 0}%` },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={storyStyles.chronicleStats}>
                        <View style={storyStyles.chronicleStat}>
                          <Icon name="key" size={16} color="#FCD34D" />
                          <Text style={storyStyles.chronicleStatText}>
                            {Story.revelations || 0} revelations
                          </Text>
                        </View>
                        <View style={storyStyles.chronicleStat}>
                          <Icon name="clock" size={16} color="#FB923C" />
                          <Text style={storyStyles.chronicleStatText}>
                            {Story.timeToComplete || "Unknown time"}
                          </Text>
                        </View>
                      </View>

                      <View style={storyStyles.chronicleButton}>
                        <LinearGradient
                          colors={["rgba(78, 230, 230, 0.4)", "rgba(6, 182, 212, 0.4)", "rgba(78, 230, 230, 0.4)"] as const}
                          style={[storyStyles.chronicleButtonGradient, {
                            shadowColor: 'rgba(78, 230, 230, 0.2)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 4,
                          }]}
                        >
                          <Image 
                            source={uiIcons.sectionIcons.bookOpen} 
                            style={{ width: 18, height: 18 }} 
                            resizeMode="contain"
                          />
                          <Text style={{
                            ...storyStyles.chronicleButtonText,
                            color: 'rgba(78, 230, 230, 0.9)',
                            fontWeight: '600',
                          }}>
                            {archive.completedStories.has(Story?.id || "")
                              ? "Restart Exploration"
                              : Story.exploration > 0
                                ? "Resume Exploration"
                                : "Enter Ancient Story"}
                          </Text>
                        </LinearGradient>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={storyStyles.centeredMessageContainer}>
                  <Icon
                    name="book"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={storyStyles.centeredMessageTitle}>
                    No Stories Available
                  </Text>
                  <Text style={storyStyles.centeredMessageText}>
                    The Archive is currently empty. Check back later for new
                    wisdom to discover.
                  </Text>
                </View>
              )}
            </View>
          )}

          {ui.activeTab === "inscriptions" && (
            <View style={homeStyles.tabpassagesArea}>
              <View style={[storyStyles.centeredMessageContainer, {
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                overflow: 'hidden',
              }]}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />

                <Text style={[storyStyles.centeredMessageTitle, { 
                  fontSize: 18, 
                  marginBottom: 12,
                  color: 'rgba(78, 230, 230, 0.8)',
                  fontWeight: '600',
                  letterSpacing: 2,
                  textShadowColor: 'rgba(78, 230, 230, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  📝Current Journal Prompts
                </Text>
                <TouchableOpacity
                  style={{
                    marginBottom: 16,
                    backgroundColor: 'rgba(78, 230, 230, 0.3)',
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.5)',
                    shadowColor: 'rgba(78, 230, 230, 0.2)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {
                    const unlockedAreas = ["entrance"]; // Add more areas as needed
                    const completedStories = Array.from(archive.completedStories);
                    wellness.loadCategoryPrompts(unlockedAreas, completedStories);
                  }}
                >
                  <Text style={{
                    color: 'rgba(78, 230, 230,  0.9)',
                    fontSize: 14,
                    fontWeight: '600',
                    textShadowColor: 'rgba(78, 230, 230, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Load Prompts
                  </Text>
                </TouchableOpacity>

                <View style={{ width: '100%', marginBottom: 20 }}>
                  {['journal', 'draw', 'voice'].map((category) => {
                    const prompt = wellness.categoryPrompts[category as keyof typeof wellness.categoryPrompts];
                    return (
                      <View key={category} style={{
                        backgroundColor: 'rgba(78, 230, 230, 0.1)',
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#4ee6e6',
                        shadowColor: '#4ee6e6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      }}>
                        <Text style={{
                          color: 'rgba(78, 230, 230, 0.7)',
                          fontSize: 14,
                          fontWeight: '600',
                          marginBottom: 4,
                          textTransform: 'capitalize',
                          textShadowColor: 'rgba(78, 230, 230, 0.2)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          {category} Quest:
                        </Text>
                        <Text style={{
                          color: '#ffe066',
                          fontSize: 12,
                          lineHeight: 16,
                          textShadowColor: 'rgba(255, 224, 102, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          {prompt 
                            ? `${prompt.text} (${prompt.skill_category} - ${prompt.difficulty})`
                            : "No quest available yet"
                          }
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              <View style={[storyStyles.centeredMessageContainer, {
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                overflow: 'hidden',
              }]}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Icon
                    name="edit-3"
                    size={40}
                    color="#4ee6e6"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[storyStyles.centeredMessageTitle, {
                    color: 'rgba(78, 230, 230, 0.8)',
                    fontSize: 24,
                    fontWeight: '600',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }]}>The Codex</Text>
                </View>
                <Text style={[storyStyles.centeredMessageText, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your personal journal for reflections, insights, and tracking
                  your journey of self-discovery.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.3)',
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.5)',
                    shadowColor: 'rgba(78, 230, 230, 0.2)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    marginTop: 16,
                  }}
                  onPress={() => ui.setIsCodexVisible(true)}
                >
                  <Text style={{
                    color: 'rgba(78, 230, 230, 0.9)',
                    fontSize: 16,
                    fontWeight: '600',
                    textShadowColor: 'rgba(78, 230, 230, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Open Your Journal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {ui.activeTab === "defender" && (
            <View style={homeStyles.tabpassagesArea}>
              <View style={[
                storyStyles.centeredMessageContainer,
                {
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: 'rgba(10, 11, 15, 0.95)',
                  borderWidth: 2,
                  borderColor: '#d4af37',
                  shadowColor: '#d4af37',
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                  alignSelf: 'center',
                  maxWidth: '100%'
                }
              ]}>
                <Text style={[storyStyles.centeredMessageTitle, {
                  color: '#4ee6e6',
                  fontSize: 24,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textShadowColor: 'rgba(78, 230, 230, 0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }]}>
                  ⚡ Mind Defender
                </Text>
                <Text style={[storyStyles.centeredMessageText, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  A mini-game to train your focus and resilience against intrusive thoughts.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2a8a8a',
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 2,
                    borderColor: '#2a8a8a',
                    shadowColor: '#2a8a8a',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginTop: 16,
                  }}
                  onPress={() => ui.setIsThoughtDefenderVisible(true)}
                >
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Play Now
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[homeStyles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[homeStyles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="target" size={20} color="#4ee6e6" />
                  <Text style={[homeStyles.foundationsTitle, {
                    color: '#4ee6e6',
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.5)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }]}>
                    Skill Progression Levels
                  </Text>
                  <Icon name="target" size={20} color="#4ee6e6" />
                </View>
                <Text style={[homeStyles.foundationsSubtitle, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your performance contributes to overall foundation growth
                </Text>

                  <View style={homeStyles.foundationsGrid}>
                    {/* Excellent Performance */}
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => Alert.alert(
                        "🏆 Master Level Performance",
                        "High score + Win + Long survival\n\n✨ Experience: +400+\n🧠 Awareness: +3\n💪 Resilience: +3\n🤝 Connection: +2\n⚖️ Balance: +2\n\n🎯 Strategy: Focus on accuracy, survive long, clear positive thoughts!\n\n📈 Contributes significantly to foundation growth"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🏆
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            12
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Master Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#FCD34D", "#F59E0B"]}
                              style={[homeStyles.foundationProgressFill, { width: "100%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            Maximum performance achieved
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Master
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Contributes to foundation growth
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => Alert.alert(
                        "🔄 Adept Level Performance",
                        "Decent score + Loss + Moderate effort\n\n✨ Experience: +200\n🧠 Awareness: +1\n💪 Resilience: +1\n🤝 Connection: +2\n⚖️ Balance: 0\n\n🎯 Strategy: Focus on positive thoughts, improve accuracy!\n\n📈 Steady foundation building progress"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🔄
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            4
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Adept Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#06B6D4", "#0891B2"]}
                              style={[homeStyles.foundationProgressFill, { width: "33%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            8 XP to next level
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Adept
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Steady foundation building
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={homeStyles.foundationCard}
                      onPress={() => Alert.alert(
                        "⚠️ Novice Level Performance",
                        "Low score + Quick loss + Low accuracy\n\n✨ Experience: +50\n🧠 Awareness: -1\n💪 Resilience: -1\n🤝 Connection: +1\n⚖️ Balance: -1\n\n🎯 Strategy: Practice accuracy, focus on survival time!\n\n📈 Learning phase - every attempt builds experience"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            ⚠️
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            -2
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Novice Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#EF4444", "#DC2626"]}
                              style={[homeStyles.foundationProgressFill, { width: "8%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            14 XP to next level
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Novice
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Learning and growing
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
              </View>

              <View style={[homeStyles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[homeStyles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="lightbulb" size={20} color="#4ee6e6" />
                  <Text style={[homeStyles.foundationsTitle, {
                    color: '#4ee6e6',
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.5)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }]}>
                    Progression Tips
                  </Text>
                  <Icon name="lightbulb" size={20} color="#4ee6e6" />
                </View>
                <Text style={[homeStyles.foundationsSubtitle, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Maximize your mental wellness gains
                </Text>

                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12
                  }}>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#FCD34D',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        🎯 Accuracy First
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Focus on hitting negative thoughts accurately. High accuracy boosts Awareness and Balance.
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#10B981',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        💚 Prioritize Positive Thoughts
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Tap green thoughts for power-ups and Connection gains. They're always beneficial!
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#06B6D4',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        ⏱️ Survive Longer
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Focus on survival time to boost Resilience. Even losses can be valuable with good effort.
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#A855F7',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        🎮 Practice Makes Progress
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Don't worry about losses - they're part of learning. Focus on gradual improvement over time.
                      </Text>
                    </View>
                  </View>
              </View>
            </View>
          )}

          {ui.activeTab === "restoration" && (
            <View style={homeStyles.archiveTabpassagesArea}>
              {isLoadingStories ? (
                <View style={storyStyles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={storyStyles.centeredMessageTitle}>
                    Loading Archive Data...
                  </Text>
                  <Text style={storyStyles.centeredMessageText}>
                    Retrieving your journey statistics from the Archive...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="book-open" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: 'rgba(78, 230, 230, 0.8)',
                          fontSize: 20,
                          fontWeight: '600',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          Story Progress
                        </Text>
                        <Icon name="book-open" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your journey through the ancient stories
                      </Text>

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const completedCount = stories.filter(story => story.exploration >= 100).length;
                            const totalStories = stories.length;
                            const completionRate = totalStories > 0 ? Math.round((completedCount / totalStories) * 100) : 0;
                            Alert.alert(
                              "Stories Completed",
                              `You have completed ${completedCount} out of ${totalStories} available stories.\n\nCompletion Rate: ${completionRate}%`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🏆
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.filter(story => story.exploration >= 100).length}
                                <Text style={homeStyles.foundationMaxValue}>
                                  /{stories.length}
                                </Text>
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                {stories.length > 0 ? Math.round((stories.filter(story => story.exploration >= 100).length / stories.length) * 100) : 0}% Complete
                              </Text>
                            </View>
                            <View style={homeStyles.foundationProgressContainer}>
                              <View style={homeStyles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#10B981", "#059669"]}
                                  style={[
                                    homeStyles.foundationProgressFill,
                                    {
                                      width: `${stories.length > 0 ? (stories.filter(story => story.exploration >= 100).length / stories.length) * 100 : 0}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Stories Completed
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Tales you've fully explored and mastered
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(78, 230, 230, 0.6)',
                              shadowColor: 'rgba(78, 230, 230, 0.3)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.4,
                              shadowRadius: 2,
                              elevation: 2,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                            const exploredChapters = stories.reduce((total, story) => {
                              if (story.exploration > 0) {
                                // Estimate chapters explored based on progress
                                const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                return total + chaptersExplored;
                              }
                              return total;
                            }, 0);
                            Alert.alert(
                              "Chapters Explored",
                              `You have explored approximately ${exploredChapters} out of ${totalChapters} total chapters across all stories.`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📖
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.reduce((total, story) => {
                                  if (story.exploration > 0) {
                                    const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                    return total + chaptersExplored;
                                  }
                                  return total;
                                }, 0)}
                                <Text style={homeStyles.foundationMaxValue}>
                                  /{stories.reduce((total, story) => total + (story.chapter_count || 0), 0)}
                                </Text>
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Chapters Explored
                              </Text>
                            </View>
                            <View style={homeStyles.foundationProgressContainer}>
                              <View style={homeStyles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#06B6D4", "#0891B2"]}
                                  style={[
                                    homeStyles.foundationProgressFill,
                                    {
                                      width: `${(() => {
                                        const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                                        const exploredChapters = stories.reduce((total, story) => {
                                          if (story.exploration > 0) {
                                            const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                            return total + chaptersExplored;
                                          }
                                          return total;
                                        }, 0);
                                        return totalChapters > 0 ? (exploredChapters / totalChapters) * 100 : 0;
                                      })()}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Chapters Explored
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Story chapters you've ventured through
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(78, 230, 230, 0.6)',
                              shadowColor: 'rgba(78, 230, 230, 0.3)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.4,
                              shadowRadius: 2,
                              elevation: 2,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const totalRevelations = stories.reduce((total, story) => total + (story.revelations || 0), 0);
                            Alert.alert(
                              "Revelations Unlocked",
                              `You have unlocked ${totalRevelations} profound revelations across all your story explorations.`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.reduce((total, story) => total + (story.revelations || 0), 0)}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Revelations Found
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Hidden Truths
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Profound insights you've discovered
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="edit-3" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Journal Progress
                        </Text>
                        <Icon name="edit-3" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your reflections and insights captured in the Archive
                      </Text>

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const journalEntries = journalStats?.entries_by_type?.journal || 0;
                            const drawEntries = journalStats?.entries_by_type?.draw || 0;
                            const voiceEntries = journalStats?.entries_by_type?.voice || 0;
                            const totalEntries = journalStats?.total_entries || 0;
                            const streakDays = journalStats?.streak_days || 0;
                            
                            Alert.alert(
                              "Journal Entries",
                              `📝 Journal entries: ${journalEntries}\n🎨 Drawing entries: ${drawEntries}\n🎤 Voice entries: ${voiceEntries}\n\nTotal entries: ${totalEntries}\nCurrent streak: ${streakDays} days`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📝
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {journalStats?.total_entries || 0}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Total Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Reflections
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Your captured thoughts and insights
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={async () => {
                            try {
                              // Get the latest journal entries from API
                              const entries = await apiService.getMyCodexEntries();
                              const journalEntries = entries.filter((entry: any) => entry.entry_type === 'journal');
                              const latestEntry = journalEntries[0];
                              
                              if (latestEntry) {
                                Alert.alert(
                                  "Latest Journal Entry",
                                  `"${latestEntry.prompt_text}"`,
                                  [{ text: "Continue Exploring", style: "default" }]
                                );
                              } else {
                                Alert.alert(
                                  "No Journal Entries",
                                  "You haven't written any journal entries yet. Start reflecting to capture your thoughts!",
                                  [{ text: "Continue Exploring", style: "default" }]
                                );
                              }
                            } catch (error) {
                              Alert.alert(
                                "Error",
                                "Could not load journal entries. Please try again.",
                                [{ text: "OK", style: "default" }]
                              );
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {journalStats?.entries_by_type?.journal || 0}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Journal Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Written Reflections
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Your thoughts captured in words
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const drawEntries = journalStats?.entries_by_type?.draw || 0;
                            const voiceEntries = journalStats?.entries_by_type?.voice || 0;
                            const totalCreative = drawEntries + voiceEntries;
                            const totalEntries = journalStats?.total_entries || 0;
                            const streakDays = journalStats?.streak_days || 0;
                            
                            Alert.alert(
                              "Creative Expressions",
                              `🎨 Drawing entries: ${drawEntries}\n🎤 Voice entries: ${voiceEntries}\n\nTotal creative expressions: ${totalCreative}\nTotal journal entries: ${totalEntries}\nCurrent streak: ${streakDays} days`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🎨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {(journalStats?.entries_by_type?.draw || 0) + (journalStats?.entries_by_type?.voice || 0)}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Artistic Expression
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Your drawings and voice recordings
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Creative works captured in the Archive
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="archive" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Archive Progress
                        </Text>
                        <Icon name="archive" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your discoveries and insights within the Archive
                      </Text>

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const progressData = calculateOverallArchiveProgress();
                            
                            Alert.alert(
                              "Overall Progress",
                              `Archive Progress: ${progressData.overallProgress}%\n\nStories with progress: ${progressData.storiesWithProgress}/${progressData.totalStories}\nCompleted stories: ${progressData.completedStories}\nAverage progress: ${progressData.averageProgress}%`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📊
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {calculateOverallArchiveProgress().overallProgress}%
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Archive Progress
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Overall Progress
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Your journey through all stories
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const progressData = calculateOverallArchiveProgress();
                            const storiesInProgress = progressData.storiesWithProgress - progressData.completedStories;
                            
                            Alert.alert(
                              "Active Explorations",
                              `Stories in progress: ${storiesInProgress}\n\nStories with progress: ${progressData.storiesWithProgress}\nCompleted stories: ${progressData.completedStories}\nTotal stories: ${progressData.totalStories}`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🔄
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {(() => {
                                  const progressData = calculateOverallArchiveProgress();
                                  return Math.max(0, progressData.storiesWithProgress - progressData.completedStories);
                                })()}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                In Progress
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Active Explorations
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Stories you're currently exploring
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const progressData = calculateOverallArchiveProgress();
                            const completedStories = Array.from(archive.completedStories || []).length;
                            const unstartedStories = progressData.totalStories - progressData.storiesWithProgress;
                            const memoriesExplored = archive.codexEntries?.length || 0;
                            const artifactsDiscovered = archive.discoveredArtifacts?.length || 0;
                            
                            Alert.alert(
                              "Archive Discoveries",
                              `Unstarted stories: ${unstartedStories}\n\nCodex entries: ${memoriesExplored}\nArtifacts discovered: ${artifactsDiscovered}\n\nBegin your journey to unlock new wisdom!`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🔓
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {archive.codexEntries?.length || 0}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Codex Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Archive Discoveries
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Entries you've created in the Archive
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="settings" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Archive Settings
                        </Text>
                        <Icon name="settings" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Customize your journey through The Archive
                      </Text>

                      <View style={[homeStyles.foundationsGrid, {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }]}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                            minHeight: 50,
                          }}
                          onPress={() => {
                            try {
                              router.push('/(onboarding)/character-creator');
                            } catch (error) {
                              Alert.alert('Navigation Error', `Failed to navigate: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Customize Avatar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                            minHeight: 50,
                          }}
                          onPress={() => {
                            theme.toggleTheme();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            {theme.themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                            minHeight: 50,
                          }}
                          onPress={() => {
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
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Leave Archive
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Mental Health Resources Section */}
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="heart" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Mental Health Support
                        </Text>
                        <Icon name="heart" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        If you're struggling, these resources are here to help
                      </Text>

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services';
                            Linking.openURL(url).catch((err: any) => {});
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            University Counseling
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services/crisis-and-mental-health-emergency';
                            Linking.openURL(url).catch((err: any) => {});
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Crisis Hotline
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                          }}
                          onPress={() => {
                            const url = 'https://www.sph.umn.edu/current/resources/mental-health/';
                            Linking.openURL(url).catch((err: any) => {});
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Student Wellness
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://mentalhealth.umn.edu/';
                            Linking.openURL(url).catch((err: any) => {});
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Mental Health Info
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                        <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="users" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                         -- Game Credits --
                        </Text>
                        <Icon name="users" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...homeStyles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        The brave souls who brought this adventure to life
                      </Text>

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            Alert.alert(
                              "🖋️ Master of Tales",
                              "Our talented story writer crafted the immersive narratives and compelling characters that guide your journey through The Archive. Every choice, every revelation, and every moment of discovery was carefully woven to support your wellness adventure.",
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(139, 92, 246, 0.6)',
                              borderWidth: 2,
                              shadowColor: 'rgba(139, 92, 246, 0.4)',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🖋️
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationLevel}>
                                Master of Tales
                              </Text>
                              
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Story Writer:{'\n'}
                            </Text>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 8,
                              width: '100%',
                              justifyContent: 'center',
                            }}>
                              <Image 
                                source={MattAvatar}
                                style={{
                                  width: 48,
                                  height: 48,
                                  marginRight: 8,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: 'rgba(78, 230, 230, 0.3)',
                                }}
                                resizeMode="cover"
                              />
                              <Text style={[homeStyles.foundationDescription, {
                                color: '#4ee6e6',
                                fontSize: 14,
                                fontWeight: '500',
                              }]}>
                                Matthew Wilson
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationDescription}>
                              Crafted immersive narratives for your journey
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(139, 92, 246, 0.8)',
                              shadowColor: 'rgba(139, 92, 246, 0.5)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            Alert.alert(
                              "⚔️ Code Guardians",
                              "Two skilled developers who transformed ideas into reality. They built the magical systems, crafted the user experience, and ensured every interaction feels smooth and engaging. Their dedication brought The Archive's mystical atmosphere to life.",
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(34, 197, 94, 0.6)',
                              borderWidth: 2,
                              shadowColor: 'rgba(34, 197, 94, 0.4)',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                ⚔️
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationLevel}>
                                Code Guardians
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Development Team:
                            </Text>

                            <View style={{
                              width: '100%',
                              alignItems: 'center',
                              marginTop: 8,
                              marginBottom: 8,
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 6,
                                width: '100%',
                                justifyContent: 'center',
                              }}>
                                <Image 
                                  source={ReganAvatar}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    marginRight: 8,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(78, 230, 230, 0.3)',
                                  }}
                                  resizeMode="cover"
                                />
                                <Text style={[homeStyles.foundationDescription, {
                                  color: '#4ee6e6',
                                  fontSize: 12,
                                  fontWeight: '500',
                                }]}>
                                  Regan Gross
                                </Text>
                              </View>

                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 6,
                                width: '100%',
                                justifyContent: 'center',
                              }}>
                                <Image 
                                  source={TrevorAvatar}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    marginRight: 8,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(78, 230, 230, 0.3)',
                                  }}
                                  resizeMode="cover"
                                />
                                <Text style={[homeStyles.foundationDescription, {
                                  color: '#4ee6e6',
                                  fontSize: 12,
                                  fontWeight: '500',
                                }]}>
                                  Trevor Schmidt
                                </Text>
                              </View>

                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 6,
                                width: '100%',
                                justifyContent: 'center',
                              }}>
                                <Image 
                                  source={RowanAvatar}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    marginRight: 8,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(78, 230, 230, 0.3)',
                                  }}
                                  resizeMode="cover"
                                />
                                <Text style={[homeStyles.foundationDescription, {
                                  color: '#4ee6e6',
                                  fontSize: 12,
                                  fontWeight: '500',
                                }]}>
                                  Rowan Stratton
                                </Text>
                              </View>
                            </View>
                            
                            <Text style={homeStyles.foundationDescription}>
                              Built the magical systems that power The Archive
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(34, 197, 94, 0.8)',
                              shadowColor: 'rgba(34, 197, 94, 0.5)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            Alert.alert(
                              "🧙 Wise Mentor",
                              "Our faculty advisor provided invaluable guidance, ensuring this project meets the highest academic standards while remaining true to its mission of supporting mental wellness. Their wisdom shaped both the research foundation and practical implementation.",
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(251, 146, 60, 0.6)',
                              borderWidth: 2,
                              shadowColor: 'rgba(251, 146, 60, 0.4)',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🧙
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationLevel}>
                                Wise Mentor
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Faculty Advisor:{'\n'}
                              Dr. Jomara Sandbulte
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Provided guidance and wisdom throughout the quest
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(251, 146, 60, 0.8)',
                              shadowColor: 'rgba(251, 146, 60, 0.5)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            Alert.alert(
                              "🏛️ The Archive Origins",
                              "Born in the Human Computer Interaction Laboratory, this project represents cutting-edge research in digital wellness tools. Visual assets and creative elements were sourced from talented artists on Itch.io, bringing depth and beauty to your adventure.",
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🏛️
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationLevel}>
                                Origins & Assets
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              HCI Lab{'\n'}Itch.io
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
                              Research foundation and artistic contributions
                            </Text>
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>

                      <View style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: 'rgba(78, 230, 230, 0.1)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(78, 230, 230, 0.3)',
                      }}>
                        <Text style={{
                          color: '#4ee6e6',
                          fontSize: 16,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: 8,
                          letterSpacing: 1,
                          textShadowColor: 'rgba(78, 230, 230, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          ✨ A Special Thanks ✨
                        </Text>
                        <Text style={{
                          color: '#d4af37',
                          fontSize: 14,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          lineHeight: 20,
                          textShadowColor: 'rgba(212, 175, 55, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          To every explorer who ventures into The Archive, your journey matters. 
                          This project exists to support your wellness adventure, and we're honored 
                          to be part of your story of growth and discovery.
                        </Text>
                      </View>
                    </LinearGradient>
             
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {ui.selectedStory && (
        <StoryScreen
          visible={ui.isStoryVisible}
          onClose={handleCloseStory}
          story={ui.selectedStory as any}
          chapter={{ 
            id: (ui.selectedStory as any)?.chapterId || null, 
            title: (ui.selectedStory as any)?.chapterTitle || ui.selectedStory?.title || "Story",
            content: ui.selectedStory?.description || "",
            chapter_number: (ui.selectedStory as any)?.chapterId || null,
            is_starting_chapter: (ui.selectedStory as any)?.chapterId === 1 || (ui.selectedStory as any)?.chapterId === null,
            variables: {},
            requirements: {},
            rewards: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passages: (ui.selectedStory?.passages as any)?.passages || []
          } as any}
          passage={(ui.selectedStory?.passages as any)?.passages?.[0] || {} as any}
          choices={(ui.selectedStory?.passages as any)?.passages?.[0]?.choices || []}
          onStatGain={() => {}}
          onArtifactUnlock={(artifact: string) => archive.handleArtifactUnlock({ name: artifact } as any)}
          onSkillLearned={(skill: string) => archive.handleSkillLearned([skill])}
          onStoryComplete={handleStoryCompleteLocal as any}
        />
      )}

      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={selectedStory?.id?.toString() || ""} 
        storyTitle={selectedStory?.title || "Unknown Story"}
        onChapterSelect={handleChapterSelect}
      />

      <CodexModal
        visible={ui.isCodexVisible}
        onClose={() => ui.setIsCodexVisible(false)}
        onSave={handleCodexEntrySubmit}
      />

      <ThoughtDefenderModal
        visible={ui.isThoughtDefenderVisible}
        onClose={() => ui.setIsThoughtDefenderVisible(false)}
        onScoreUpdate={(data: { score: number; level: number; won: boolean }) =>
          handleMiniGameCompleteSubmit("thoughtDefender", data)
        }
      />
      <EquipmentModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        inventory={equipment.inventory ?? []}
        equippedItems={equipment.equippedItems}
        backendGear={equipment.backendGear}
        equippedGear={equipment.equippedGear}
      />

      <TutorialModal />

      <AttributeInfoModal
        visible={showAttributeModal}
        onClose={() => setShowAttributeModal(false)}
        attribute={selectedAttribute}
      />

    </View>
  );
};

export default ArchiveInterface;
