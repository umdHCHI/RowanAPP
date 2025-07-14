import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  apiService,
  createGlobalStyles,
  PERSONALITY_TABS,
  PersonalityConfigs,
  PersonalityKey,
  PersonalityWellnessAttributes,
  PersonalizedArchiveHeader,
  ScrollView,
  StatusBar,
  Story,
  Text,
  TouchableOpacity,
  useMasterState,
  UserProfile,
  View
} from "../../imports";

// Import StoryScreen and ChapterScreen for story navigation
import ChapterScreen from "../../screens/characterStory/ChapterScreen";
import StoryScreen from "../../screens/characterStory/StoryScreen";
import PersonalityStoryCatalog from "./PersonalityStoryCatalog";

// Import modals for personality tabs
import CodexModal from "../../components/CodexModal";
import ThoughtDefenderModal from "../../components/ThoughtDefenderModal";

// Dummy Icon and LinearGradient for now (replace with your UI lib)
const Icon = ({ name, size, color }: any) => <Text style={{ fontSize: size, color }}>{name}</Text>;
const LinearGradient = ({ children, style }: any) => <View style={style}>{children}</View>;

// Import the centralized data models
import {
  CopingTools,
  PersonalityQuests
} from '../../models/Personality';

// ===== DATA TYPES FOR THIS SCREEN =====

// This mirrors the unified Character model from your backend,
// including the flexible JSON fields.
interface UnifiedCharacterData {
  id: number;
  name: string;
  level: number;
  experience: number;
  experience_needed: number;
  wellness_stats: Record<string, number>; // e.g., {"Creativity": 5, "Resilience": 3}
  quest_progress: Record<string, number>; // e.g., {"openness_1": 2}
  // This assumes your CharacterSerializer includes a list of unlocked tool IDs.
  // You may need to add this to your backend serializer.
  unlocked_tools: string[];
}

// ===== REFACTORED & DATA-DRIVEN COMPONENTS =====

// 1. DAILY CURATOR MESSAGES (Personality-Specific)
const DailyCuratorMessages = {
  Openness: [
    "The library whispers of new discoveries today. What unexplored corner of your mind calls to you?",
    "Curiosity is the key that unlocks every door. Let your imagination guide your journey today.",
    "The ancient texts speak of those who see beyond the veil. Trust your creative instincts.",
    "Today, embrace the unknown. Your willingness to explore will reveal hidden treasures.",
    "The Dreamscape Library shimmers with possibilities. What will you create today?"
  ],
  Conscientiousness: [
    "A well-ordered mind conquers chaos. Your dedication to structure serves you well today.",
    "The methodical path leads to mastery. Trust in your disciplined approach.",
    "Excellence is not an act, but a habit. Your consistency builds lasting strength.",
    "The Structured Sanctum honors your commitment. Each step forward is progress.",
    "Patience and persistence unlock the deepest wisdom. Stay the course, Scholar."
  ],
  Extraversion: [
    "The Assembly Hall buzzes with energy. Your light brightens the path for others.",
    "Connection is the bridge between souls. Share your vibrant spirit today.",
    "The strongest bonds are forged in conversation. Reach out and make new allies.",
    "Your enthusiasm ignites inspiration in others. Let your inner fire shine bright.",
    "The Grand Assembly awaits your voice. Speak boldly and with confidence."
  ],
  Agreeableness: [
    "The Healing Gardens bloom with compassion. Your gentle wisdom nurtures growth.",
    "Harmony is found in understanding. Your empathy creates bridges where others see walls.",
    "The kindest hearts carry the greatest strength. Your compassion is your power.",
    "Peace begins within and radiates outward. Your calming presence heals the world.",
    "The Garden of Understanding flourishes under your care. Tend it with love."
  ],
  Neuroticism: [
    "The Reflection Chambers hold space for all emotions. Your depth creates profound wisdom.",
    "Sensitivity is not weakness—it is the ability to feel the truth others cannot see.",
    "The shadows hold lessons as valuable as the light. Embrace your full spectrum.",
    "Your emotional awareness is a gift. Use it to understand the mysteries within.",
    "The Inner Sanctum honors your journey through complexity. You are braver than you know."
  ]
};

const DailyCuratorMessage = ({ primaryTrait, characterData, globalStyles }: { primaryTrait: PersonalityKey; characterData: any; globalStyles: any }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get today's message (could be based on date, character progress, etc.)
    const messages = DailyCuratorMessages[primaryTrait];
    const today = new Date().getDate();
    const messageIndex = today % messages.length;
    setCurrentMessage(messages[messageIndex]);
  }, [primaryTrait]);

  const getPersonalizedGreeting = () => {
    const level = characterData?.level || 1;
    const name = characterData?.name || 'Scholar';
    
    if (level >= 10) return `Master ${name}`;
    if (level >= 5) return `Skilled ${name}`;
    return `Young ${name}`;
  };

  return (
    <TouchableOpacity 
      style={globalStyles.personalityCuratorMessageCard}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      <View style={globalStyles.personalityCuratorHeader}>
        <Text style={globalStyles.personalityCuratorAvatar}>🧙‍♂️</Text>
        <View style={globalStyles.personalityCuratorInfo}>
          <Text style={globalStyles.personalityCuratorName}>The Curator</Text>
          <Text style={globalStyles.personalityCuratorTitle}>Keeper of The Archive</Text>
        </View>
        <Text style={globalStyles.personalityDailyLabel}>Daily Wisdom</Text>
      </View>
      
      <View style={globalStyles.personalityMessageContent}>
        <Text style={globalStyles.personalityPersonalizedGreeting}>
          &quot;{getPersonalizedGreeting()}, 
        </Text>
        <Text style={globalStyles.personalityCuratorMessage}>
          {currentMessage}&quot;
        </Text>
      </View>
      
      {isExpanded && (
        <View style={globalStyles.personalityExpandedContent}>
          <Text style={globalStyles.personalityExpandedHint}>
            💡 Tap any wellness attribute to focus your practice today
          </Text>
          <Text style={globalStyles.personalityExpandedFooter}>
            ~ Written in the {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} entry of the Daily Chronicle
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getWellnessAttributes = (personalityType: PersonalityKey) => {
  return PersonalityWellnessAttributes[personalityType] || PersonalityWellnessAttributes.Openness;
};

type WellnessAttributesDisplayProps = {
  personalityType: PersonalityKey;
  personalityScores: Record<string, number>; // Changed to accept any string keys for wellness stats
  storyProgress?: any;
  globalStyles: any;
};

const WellnessAttributesDisplay = ({ personalityType, personalityScores, storyProgress, globalStyles }: WellnessAttributesDisplayProps) => {
  // Define the actual character attributes with personality-specific descriptions
  const characterAttributes = [
    {
      label: "Awareness",
      value: personalityScores.Awareness || 0, // Use actual character wellness stat
      color: "#4ee6e6",
      description: "Your ability to perceive and understand your inner world and external environment."
    },
    {
      label: "Resilience", 
      value: personalityScores.Resilience || 0, // Use actual character wellness stat
      color: "#2a9d8f",
      description: "Your capacity to adapt and recover from challenges and setbacks."
    },
    {
      label: "Connection",
      value: personalityScores.Connection || 0, // Use actual character wellness stat
      color: "#f72585",
      description: "Your ability to form meaningful relationships and connect with others."
    },
    {
      label: "Balance",
      value: personalityScores.Balance || 0, // Use actual character wellness stat
      color: "#ffd60a",
      description: "Your sense of inner harmony and emotional equilibrium."
    }
  ];

  return (
    <View style={globalStyles.personalityAttributesContainer}>
      <Text style={globalStyles.personalityEchoesTitle}>Echoes of the Self</Text>
      <View style={globalStyles.personalityAttributesGrid}>
        {characterAttributes.map((attr: any, index: number) => (
          <View key={index} style={globalStyles.personalityAttributeCardParchment}>
            <Text style={globalStyles.personalityAttributeLabel}>{attr.label}</Text>
            <View style={globalStyles.personalityAttributeBarMagic}>
              <View 
                style={[
                  globalStyles.personalityAttributeProgressMagic,
                  { 
                    width: `${(attr.value / 20) * 100}%`, // Assuming max value of 20
                    backgroundColor: attr.color
                  }
                ]}
              />
            </View>
            <Text style={globalStyles.personalityAttributeValue}>{attr.value}/20</Text>
            <Text style={globalStyles.personalityCuratorNote}>
              Curator&apos;s Note: <Text style={globalStyles.personalityCuratorNoteText}>{attr.description}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 3. Active Quests (Driven by props)
const QuestAchievements = ({ questProgress, primaryTrait, globalStyles }: { questProgress: Record<string, number>; primaryTrait: PersonalityKey; globalStyles: any }) => {
  const quests = PersonalityQuests[primaryTrait] || [];

  return (
    <View style={globalStyles.personalityQuestsContainer}>
      <Text style={globalStyles.personalityQuestsTitle}>Active Quests</Text>
      {quests.map((quest) => {
        const progress = questProgress[quest.id] || 0;
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;

        return (
          <View key={quest.id} style={[globalStyles.personalityQuestCard, isCompleted && globalStyles.personalityQuestCompleted]}>
            <Text style={globalStyles.personalityQuestTitle}>{quest.title}</Text>
            <Text style={globalStyles.personalityQuestDescription}>{quest.description}</Text>
            <View style={globalStyles.personalityQuestProgress}>
              <View style={globalStyles.personalityQuestProgressBar}>
                <View
                  style={[
                    globalStyles.personalityQuestProgressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={globalStyles.personalityQuestProgressText}>
                {progress}/{quest.total} {isCompleted ? "✅" : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// 4. Coping Tools (Driven by props)
const CopingToolsCollection = ({ unlockedTools, primaryTrait, globalStyles }: { unlockedTools: string[]; primaryTrait: PersonalityKey; globalStyles: any }) => {
  const allPossibleTools = CopingTools[primaryTrait] || [];

  return (
    <View style={globalStyles.personalityToolsContainer}>
      <Text style={globalStyles.personalityToolsTitle}>Coping Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {allPossibleTools.map((tool) => {
          const isUnlocked = unlockedTools.includes(tool.id);
          return (
            <View key={tool.id} style={[globalStyles.personalityToolCard, !isUnlocked && globalStyles.personalityToolLocked]}>
              <Text style={globalStyles.personalityToolIcon}>
                {isUnlocked ? tool.icon : "🔒"}
              </Text>
              <Text style={globalStyles.personalityToolName}>
                {isUnlocked ? tool.name : "Locked"}
              </Text>
              <Text style={globalStyles.personalityToolDescription}>
                  {isUnlocked ? tool.description : "Unlock through stories"}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};


// Backend personality profile interface
interface PersonalityProfile {
  id: number;
  user: number;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  profile_summary?: {
    dominant_trait: string;
    scores: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    last_updated: string;
  };
  last_updated: string;
}



// ===== MAIN HOME SCREEN COMPONENT =====

export default function PersonalityHomeScreen() {
  const { theme } = useMasterState();
  const { authToken, characterId, user } = useMasterState().auth;
  const globalStyles = createGlobalStyles(theme.theme);
  const params = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState("entrance");
  const [isLoading, setIsLoading] = useState(true);
  const [traitScores, setTraitScores] = useState<Record<PersonalityKey, number>>({
    Openness: 5,
    Conscientiousness: 5,
    Extraversion: 5,
    Agreeableness: 5,
    Neuroticism: 5,
  });
  const [primaryTrait, setPrimaryTrait] = useState<PersonalityKey>("Openness");
  const [characterData, setCharacterData] = useState<UnifiedCharacterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Development/testing state
  const [devMode, setDevMode] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);
  const [showPersonalitySwitcher, setShowPersonalitySwitcher] = useState(false);

  // Story-related state
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  
  // Story modal state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);

  // Modal state for personality tabs
  const [isCodexModalVisible, setIsCodexModalVisible] = useState(false);
  const [isThoughtDefenderModalVisible, setIsThoughtDefenderModalVisible] = useState(false);
  const [selectedCodexType, setSelectedCodexType] = useState<'journal' | 'draw' | 'voice'>('journal');

  // ===== TAB CONTENT COMPONENTS =====





  // Check for survey data passed via navigation params
  useEffect(() => {
    if (params.surveyData) {
      try {
        console.log("=== FOUND SURVEY DATA IN NAVIGATION PARAMS ===");
        const surveyData = JSON.parse(params.surveyData as string);
        console.log("Parsed survey data:", surveyData);
        
        if (surveyData.big_five_scores) {
          console.log("Survey data big_five_scores:", surveyData.big_five_scores);
          console.log("Survey data primary_trait:", surveyData.primary_trait);
          
          // Convert backend format to frontend format (mapping BFI-2-XS to existing frontend names)
          const scores: Record<PersonalityKey, number> = {
            Openness: surveyData.big_five_scores.openMindedness || 5, // BFI-2-XS openMindedness maps to frontend Openness
            Conscientiousness: surveyData.big_five_scores.conscientiousness || 5,
            Extraversion: surveyData.big_five_scores.extraversion || 5,
            Agreeableness: surveyData.big_five_scores.agreeableness || 5,
            Neuroticism: surveyData.big_five_scores.negativeEmotionality || 5, // BFI-2-XS negativeEmotionality maps to frontend Neuroticism
          };
          
          console.log("Setting trait scores from navigation params:", scores);
          setTraitScores(scores);
          
          // Set primary trait - now expecting capitalized format from survey
          if (surveyData.primary_trait) {
            // The survey now sends capitalized trait names, so we can use them directly
            const primary = surveyData.primary_trait as PersonalityKey;
            console.log("Setting primary trait from navigation params:", primary);
            console.log("Original survey trait:", surveyData.primary_trait);
            setPrimaryTrait(primary);
          } else {
            // Calculate primary trait from scores
            const primary = Object.entries(scores).reduce((a, b) =>
              scores[a[0] as PersonalityKey] > scores[b[0] as PersonalityKey] ? a : b
            )[0] as PersonalityKey;
            console.log("Calculated primary trait from scores:", primary);
            setPrimaryTrait(primary);
          }
          
          // Create default character data for survey users
          const defaultCharacterData: UnifiedCharacterData = {
            id: 1, // Default ID for survey users
            name: user?.username || 'Scholar',
            level: 1,
            experience: 0,
            experience_needed: 1000,
            wellness_stats: {
              "Awareness": scores.Openness || 5,
              "Resilience": scores.Conscientiousness || 5,
              "Connection": scores.Extraversion || 5,
              "Balance": scores.Agreeableness || 5
            },
            quest_progress: {
              "openness_1": 0,
              "openness_2": 0,
              "openness_3": 0,
              "conscientiousness_1": 0,
              "conscientiousness_2": 0,
              "conscientiousness_3": 0,
              "extraversion_1": 0,
              "extraversion_2": 0,
              "extraversion_3": 0,
              "agreeableness_1": 0,
              "agreeableness_2": 0,
              "agreeableness_3": 0,
              "neuroticism_1": 0,
              "neuroticism_2": 0,
              "neuroticism_3": 0
            },
            unlocked_tools: []
          };
          
          setCharacterData(defaultCharacterData);
          setIsLoading(false);
          console.log("=== SUCCESSFULLY LOADED SURVEY DATA FROM NAVIGATION PARAMS ===");
          console.log("=== SKIPPING BACKEND FETCH - USING SURVEY DATA ===");
          return; // Skip the normal profile loading
        }
      } catch (parseError) {
        console.error("Failed to parse survey data from navigation params:", parseError);
      }
    }
  }, [params.surveyData, user]);


  // Fetch all necessary data for the personality home screen from the backend
  const fetchHomeScreenData = useCallback(async () => {
    if (!authToken) return;
    
    // If we have survey data from navigation params, don't override it with backend data
    if (params.surveyData) {
      console.log("=== SKIPPING BACKEND FETCH - SURVEY DATA ALREADY LOADED FROM NAVIGATION PARAMS ===");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("=== GET REQUEST DEBUG ===");
      console.log("Endpoint key: characterHomeData");
      console.log("Base endpoint: characters/characters/home_data/");
      console.log("URL suffix: ");
      console.log("Final URL: characters/characters/home_data/");
      console.log("=== END GET REQUEST DEBUG ===");
      
      // **STEP 1: FETCH REAL DATA**
      // Use characterHomeData endpoint which contains character + additional data
      const homeData = await apiService.getCharacterHomeData();
      const userCharacterData = homeData.character;

      console.log("getProfile: Fetching fresh data from backend (no survey data in params)");
      console.log("=== GET REQUEST DEBUG ===");
      console.log("Endpoint key: userProfile");
      console.log("Base endpoint: users/me/");
      console.log("URL suffix: ");
      console.log("Final URL: users/me/");
      console.log("=== END GET REQUEST DEBUG ===");
      
      // The user's primary trait should be part of the user profile data.
      // We fetch that separately.
      const userProfile = await apiService.getProfile();
      const dominantTrait = userProfile.personality_profile?.profile_summary?.dominant_trait;
      console.log("Backend dominant trait:", dominantTrait);
      
      // Map backend lowercase to frontend trait names (BFI-2-XS maps to existing frontend names)
      const traitMap: Record<string, PersonalityKey> = {
        'openness': 'Openness', // BFI-2-XS openMindedness maps to frontend Openness
        'conscientiousness': 'Conscientiousness',
        'extraversion': 'Extraversion', 
        'agreeableness': 'Agreeableness', 
        'neuroticism': 'Neuroticism' // BFI-2-XS negativeEmotionality maps to frontend Neuroticism
      };
      const userPrimaryTrait = traitMap[dominantTrait || 'openness'] || 'Openness';
      console.log("Mapped frontend trait from backend:", userPrimaryTrait);
      
      setPrimaryTrait(userPrimaryTrait);
      
      // Convert Character to UnifiedCharacterData format using actual character attributes
      const unifiedData: UnifiedCharacterData = {
        id: userCharacterData.id,
        name: userCharacterData.name,
        level: userCharacterData.level,
        experience: userCharacterData.experience,
        experience_needed: userCharacterData.experience_needed_for_next_level || 1000,
        wellness_stats: {
          // Map the actual character attributes to personality-specific names
          "Awareness": userCharacterData.awareness || 0,
          "Resilience": userCharacterData.resilience || 0,
          "Connection": userCharacterData.connection || 0,
          "Balance": userCharacterData.balance || 0
        },
        quest_progress: {
          "openness_1": userCharacterData.memories_explored || 0,
          "openness_2": userCharacterData.coping_skills_learned || 0,
          "openness_3": userCharacterData.insights_discovered || 0,
          "conscientiousness_1": userCharacterData.memories_explored || 0,
          "conscientiousness_2": userCharacterData.coping_skills_learned || 0,
          "conscientiousness_3": userCharacterData.insights_discovered || 0,
          "extraversion_1": userCharacterData.memories_explored || 0,
          "extraversion_2": userCharacterData.coping_skills_learned || 0,
          "extraversion_3": userCharacterData.insights_discovered || 0,
          "agreeableness_1": userCharacterData.memories_explored || 0,
          "agreeableness_2": userCharacterData.coping_skills_learned || 0,
          "agreeableness_3": userCharacterData.insights_discovered || 0,
          "neuroticism_1": userCharacterData.memories_explored || 0,
          "neuroticism_2": userCharacterData.coping_skills_learned || 0,
          "neuroticism_3": userCharacterData.insights_discovered || 0
        },
        unlocked_tools: homeData.available_tools?.map((tool: any) => tool.id) || []
      };
      setCharacterData(unifiedData);

    } catch (e: any) {
      setError("Failed to load your profile. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // Fetch data on screen focus (but not if we have survey data from navigation params)
  useFocusEffect(
    useCallback(() => {
      if (!params.surveyData) {
        fetchHomeScreenData();
      } else {
        console.log("=== SKIPPING FOCUS EFFECT FETCH - USING SURVEY DATA FROM NAVIGATION PARAMS ===");
      }
    }, [fetchHomeScreenData, params.surveyData])
  );

  // **STEP 5: IMPLEMENT THE REWARD LOOP**
  const handleStoryComplete = async (completionData: {
    storyId: string;
    totalStatGains: Record<string, number>;
    skillsLearned: string[]; // These are the IDs of coping tools to unlock
    questsUpdated: Record<string, number>; // e.g., {"openness_1": 1}
    experienceGained: number;
  }) => {
    setIsStoryVisible(false);
    setSelectedStory(null);
    
    if (!characterData) return;

    try {
        // Here you would make PATCH requests to your backend to update the Character model
        console.log("Processing rewards for story:", completionData.storyId);

        // Example: Update experience
        if (completionData.experienceGained > 0) {
            await apiService.gainExperience(characterData.id, completionData.experienceGained);
        }

        // Example: Update wellness stats
        if (Object.keys(completionData.totalStatGains).length > 0) {
            // Your apiService would need a method to patch wellness_stats
            // await apiService.updateWellnessStats(characterData.id, completionData.totalStatGains);
        }

        // Example: Unlock coping tools
        for (const toolId of completionData.skillsLearned) {
            // Your apiService would need a method to create a CharacterTool link
            // await apiService.acquireCopingTool(toolId);
        }

        Alert.alert(
            "📚 Story Mastered! ✨",
            `Your journey has transformed your understanding.`,
            [{ text: "Continue Exploring", style: "default" }]
        );

    } catch (e) {
        console.error("Failed to process story rewards:", e);
        Alert.alert("Error", "There was an issue saving your story progress.");
    } finally {
        // After processing rewards, refetch all data to update the UI
        fetchHomeScreenData();
    }
  };

  // Handlers for story navigation (no changes needed here)
  const handleOpenStory = async (story: Story) => {
    try {
      console.log("=== handleOpenStory called ===");
      console.log("Story data:", story);
      console.log("Story ID:", story?.id);
      console.log("Story title:", story?.title);

      // First, check if this story has chapters
      try {
        console.log("Checking for chapters in story:", story.id);
        const chapters = await apiService.getChapters(String(story.id));
        console.log("Chapters found:", chapters);
        
        if (chapters && chapters.length > 0) {
          console.log("Story has chapters, showing chapter selection");
          // Story has chapters, show chapter selection
          setSelectedStory(story);
          setIsChapterScreenVisible(true);
          return;
        }
      } catch (chapterError) {
        console.warn("Could not get chapters, assuming no chapters:", chapterError);
      }

      // No chapters or chapter check failed, proceed with direct story opening
      console.log("No chapters found, opening story directly");
      await handleDirectStoryOpen(story);
    } catch (error) {
      console.error("Error in handleOpenStory:", error);
      // Show error to user
      Alert.alert("Error", "Failed to open story. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };

  const handleDirectStoryOpen = async (story: Story) => {
    try {
      // Check if Story is defined and has an id
      if (!story?.id) {
        console.error("Story is undefined or missing id:", story);
        Alert.alert("Error", "Invalid story data. Please try again.", [
          { text: "OK", style: "default" },
        ]);
        return;
      }
      
      console.log("=== handleDirectStoryOpen called ===");
      console.log("Story ID:", story.id);
      console.log("Chapter count:", story.chapter_count);
      
      // For non-chapter stories, try to get passages directly
      if (story.chapter_count === 0) {
        console.log("Non-chapter story, getting passages directly");
        try {
          // Try to get passages directly from the story
          const passages = await apiService.get<any[]>('storyRoot', { urlSuffix: `stories/${story.id}/passages/` });
          console.log("Direct passages for story:", passages);
          
          if (passages && passages.length > 0) {
            // Transform to frontend format
            const storypassages = {
              id: story.id.toString(),
              title: story.title || 'Unknown Story',
              subtitle: 'main',
              atmosphere: 'Mysterious',
              difficulty: 'Intermediate',
              rarity: 'Common',
              skillFocus: ['General'],
              passages: passages.map((passage: any) => ({
                id: passage.id,
                chapter: null, // Add required chapter property
                passage_id: passage.passage_id,
                content: passage.content,
                passage_type: passage.passage_type,
                speaker: passage.speaker,
                required_conditions: passage.required_conditions || {},
                story_effects: passage.story_effects || {},
                mood: passage.mood,
                background_music: passage.background_music,
                background_image: passage.background_image,
                order: passage.order,
                choices: [] // Will be populated per passage
              })),
              currentPassage: passages[0] ? {
                id: passages[0].id,
                passage_id: passages[0].passage_id,
                content: passages[0].content,
                passage_type: passages[0].passage_type,
                speaker: passages[0].speaker,
                required_conditions: passages[0].required_conditions || {},
                story_effects: passages[0].story_effects || {},
                mood: passages[0].mood,
                background_music: passages[0].background_music,
                background_image: passages[0].background_image,
                order: passages[0].order,
                choices: []
              } : null,
              progress: {
                passagesVisited: 0,
                isCompleted: false,
                progressPercentage: 0
              },
              isChapterBased: false,
              chapterId: null,
              chapterTitle: null
            };
            
            // Get user's progress for this story
            const progressRecords = await apiService.getStoryProgressRecords(String(story.id));
            console.log("User progress for story:", progressRecords);
            
            // Calculate exploration percentage based on progress
            let exploration = 0;
            if (progressRecords.length > 0) {
              // Count unique passages visited
              const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
              const totalPassages = storypassages.passages?.length || 1;
              exploration = Math.round((uniquePassages.size / totalPassages) * 100);
            }
            
            // Update story with progress information
            const storyWithProgress = {
              ...story,
              passages: storypassages.passages, // Pass the passages array directly
              exploration: exploration,
              chapterId: null // Non-chapter story
            };
            
            setSelectedStory(storyWithProgress);
            setIsStoryVisible(true);
            return;
          }
        } catch (directError: any) {
          console.error("Failed to get direct passages:", directError);
          console.error("Direct error details:", {
            message: directError.message,
            status: directError.response?.status,
            data: directError.response?.data,
            url: directError.config?.url
          });
        }
      }
      
      // For chapter-based stories, we need to determine the correct chapter ID
      // Try to get the first available chapter
      try {
        console.log("Chapter-based story, getting first available chapter");
        const chapters = await apiService.getChapters(String(story.id));
        console.log("Available chapters:", chapters);
        
        if (chapters && chapters.length > 0) {
          // Use the first chapter as default
          const firstChapter = chapters[0];
          console.log("Using first chapter:", firstChapter);
          
          // Get passages for the first chapter
          const chapterPassages = await apiService.getChapterPassages(story.id, firstChapter.id);
          console.log("First chapter passages:", chapterPassages);
          
          if (chapterPassages && chapterPassages.length > 0) {
            // Get user's progress for this story
            const progressRecords = await apiService.getStoryProgressRecords(String(story.id));
            console.log("User progress for story:", progressRecords);
            
            // Calculate exploration percentage based on progress
            let exploration = 0;
            if (progressRecords.length > 0) {
              // Count unique passages visited
              const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
              const totalPassages = chapterPassages.length || 1;
              exploration = Math.round((uniquePassages.size / totalPassages) * 100);
            }
            
            // Update story with chapter information and progress
            const storyWithChapter = {
              ...story,
              passages: chapterPassages, // Pass the passages array directly
              chapterId: firstChapter.id, // Set the actual chapter ID
              chapterTitle: firstChapter.title || `Chapter ${firstChapter.id}`,
              exploration: exploration
            };
            
            console.log("Opening story with first chapter:", storyWithChapter);
            setSelectedStory(storyWithChapter);
            setIsStoryVisible(true);
            return;
          }
        }
      } catch (chapterError) {
        console.warn("Could not get chapters, trying fallback method:", chapterError);
      }
      
      // Fallback: try the original getStorypassages method
      console.log("Trying fallback getStorypassages method");
      const storypassages = await apiService.getStorypassages(story.id);
      if (storypassages && storypassages.passages && storypassages.passages.length > 0) {
        // Get user's progress for this story
        const progressRecords = await apiService.getStoryProgressRecords(String(story.id));
        console.log("User progress for story:", progressRecords);
        
        // Calculate exploration percentage based on progress
        let exploration = 0;
        if (progressRecords.length > 0) {
          // Count unique passages visited
          const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
          const totalPassages = storypassages.passages?.length || 1;
          exploration = Math.round((uniquePassages.size / totalPassages) * 100);
        }
        
        // Update story with progress information
        const storyWithProgress = {
          ...story,
          passages: storypassages.passages, // Pass the passages array directly
          exploration: exploration,
          chapterId: null // Fallback - no specific chapter
        };
        
        setSelectedStory(storyWithProgress);
        setIsStoryVisible(true);
      } else {
        // Show error if no passages found
        Alert.alert(
          "No passages Available",
          "This story does not have any passages yet.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error: any) {
      console.error("Error opening story:", error);
      Alert.alert("Error", "Failed to load story passages. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };
  
  const handleCloseStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      console.log("=== handleChapterSelect called ===");
      console.log("Chapter ID:", chapterId);
      console.log("Selected story:", selectedStory);
      console.log("Selected story ID:", selectedStory?.id);

      // Close the chapter selection modal first
      setIsChapterScreenVisible(false);

      // For chapter-based stories, we need to get the story passages with the specific chapter
      if (selectedStory?.id) {
        console.log(
          "Opening story with chapter:",
          selectedStory.id,
          "chapter:",
          chapterId
        );

        // Get story passages from the selected chapter
        console.log("Calling getStorypassagesFromChapter with:", {
          storyId: selectedStory.id,
          chapterId: chapterId
        });
        
        console.log("=== ATTEMPTING TO LOAD CHAPTER PASSAGES ===");
        console.log("Story ID:", selectedStory.id);
        console.log("Chapter ID:", chapterId);
        console.log("Selected story structure:", selectedStory);
        
        // First, let's check if the story already has chapter data with passages
        if (selectedStory.chapters && selectedStory.chapters.length > 0) {
          console.log("Story already has chapters data, checking for target chapter");
          const targetChapter = selectedStory.chapters.find((ch: any) => ch.id === chapterId);
          
          if (targetChapter && targetChapter.passages) {
            console.log("Found target chapter with passages:", targetChapter.passages.length);
            const storypassages = {
              id: selectedStory.id.toString(),
              title: targetChapter.title || `Chapter ${chapterId}`,
              passages: targetChapter.passages
            };
            
            // Get user's progress for this story
            const progressRecords = await apiService.getStoryProgressRecords(String(selectedStory.id));
            console.log("User progress for story:", progressRecords);
            
            // Calculate exploration percentage based on progress
            let exploration = 0;
            if (progressRecords.length > 0) {
              // Count unique passages visited
              const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
              const totalPassages = storypassages.passages?.length || 1;
              exploration = Math.round((uniquePassages.size / totalPassages) * 100);
            }

            // Create a modified story object with chapter information and progress
            const storyWithChapter = {
              ...selectedStory,
              passages: storypassages.passages, // Pass the passages array directly
              chapterId: chapterId, // Add the chapter ID to the story object
              exploration: exploration
            };
            
            console.log("Opening story with existing chapter data");
            setIsStoryVisible(true);
            return;
          }
        }
        
        // Fallback: try to get chapters from API
        console.log("No existing chapter data, fetching from API");
        const storypassages = await apiService.getStorypassagesFromChapter(
          selectedStory.id,
          chapterId
        );
        console.log("Story passages result:", storypassages);
        console.log("Story passages passages:", storypassages?.passages);
        console.log(
          "Story passages passages length:",
          storypassages?.passages?.length
        );

        if (storypassages) {
          console.log("Opening story with chapter passages:", storypassages);
          console.log("Story passages passages:", storypassages.passages);
          console.log(
            "Number of passages in story passages:",
            storypassages.passages?.length
          );

          // Get user's progress for this story
          const progressRecords = await apiService.getStoryProgressRecords(String(selectedStory.id));
          console.log("User progress for story:", progressRecords);
          
          // Calculate exploration percentage based on progress
          let exploration = 0;
          if (progressRecords.length > 0) {
            // Count unique passages visited
            const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
            const totalPassages = storypassages.passages?.length || 1;
            exploration = Math.round((uniquePassages.size / totalPassages) * 100);
          }

          // Create a modified story object with chapter information and progress
          const storyWithChapter = {
            ...selectedStory,
            passages: storypassages.passages, // Pass the passages array directly
            chapterId: chapterId, // Add the chapter ID to the story object
            exploration: exploration
          };
          console.log(
            "Final story object being passed to StoryScreen:",
            storyWithChapter
          );
          console.log(
            "Final story object passages passages:",
            storyWithChapter.passages?.passages
          );
          console.log(
            "Final story object passages passages length:",
            storyWithChapter.passages?.passages?.length
          );
          setIsStoryVisible(true);
        } else {
          console.log("No passages found for chapter");
          Alert.alert(
            "No passages Available",
            "This chapter does not have any passages yet.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        console.log("No selected story");
        Alert.alert("Error", "No story selected. Please try again.", [
          { text: "OK", style: "default" },
        ]);
      }
    } catch (error) {
      console.error("Error opening chapter:", error);
      Alert.alert(
        "Error",
        "Failed to load chapter passages. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };


  if (isLoading || !characterData) {
    return (
      <View style={globalStyles.personalityCentered}>
        <ActivityIndicator size="large" color="#4ee6e6" />
        <Text style={{ color: "#fff", marginTop: 16 }}>Loading Your Archive...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Text style={{ color: "#ff6b6b", textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={fetchHomeScreenData} style={globalStyles.personalityRetryButton}>
            <Text>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

      return (
      <View style={{ flex: 1, backgroundColor: "#181A20" }}>
        <StatusBar barStyle="light-content" backgroundColor="#181A20" />
        

        
        {/* Header with Personality-Specific Styling */}
        <PersonalizedArchiveHeader 
          primaryTrait={primaryTrait}
          traitScores={traitScores}
          characterData={characterData}
        />

        {/* Personality-Specific Tab Navigation */}
        <View style={globalStyles.personalityTabBar || { 
          flexDirection: 'row', 
          backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.background || '#1a1a1a', 
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
          shadowColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3
        }}>
          {PERSONALITY_TABS[primaryTrait]?.map((tab) => (
            <TouchableOpacity 
              key={tab.key}
              onPress={() => {
                if (tab.key === 'defender') {
                  setIsThoughtDefenderModalVisible(true);
                } else {
                  setActiveTab(tab.key);
                }
              }} 
              style={[
                globalStyles.personalityTabButton || { 
                  flex: 1, 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  marginHorizontal: 3,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'transparent'
                }, 
                activeTab === tab.key && (globalStyles.personalityTabButtonActive || { 
                  backgroundColor: `rgba(${PersonalityConfigs[primaryTrait]?.theme?.primary?.replace('#', '')}, 0.2)`,
                  borderColor: PersonalityConfigs[primaryTrait]?.theme?.primary,
                  shadowColor: PersonalityConfigs[primaryTrait]?.theme?.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 4
                })
              ]}
            >
              <Text style={{ 
                fontSize: 22, 
                marginBottom: 6,
                textShadowColor: activeTab === tab.key ? PersonalityConfigs[primaryTrait]?.theme?.primary : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3
              }}>
                {tab.icon}
              </Text>
              <Text style={{ 
                color: activeTab === tab.key ? PersonalityConfigs[primaryTrait]?.theme?.primary || '#fff' : '#ccc',
                fontSize: 11,
                fontWeight: activeTab === tab.key ? '700' : '500',
                textAlign: 'center',
                textShadowColor: activeTab === tab.key ? PersonalityConfigs[primaryTrait]?.theme?.primary : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )) || (
            // Fallback tabs if PERSONALITY_TABS is not available
            <>
              <TouchableOpacity 
                onPress={() => setActiveTab('entrance')} 
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
              >
                <Text style={{ color: activeTab === 'entrance' ? '#fff' : '#ccc' }}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('storys')} 
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
              >
                <Text style={{ color: activeTab === 'storys' ? '#fff' : '#ccc' }}>Stories</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      {activeTab === 'entrance' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <DailyCuratorMessage 
                primaryTrait={primaryTrait} 
                characterData={characterData}
                globalStyles={globalStyles} 
            />
            
            {/* Debug Button */}
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#ff6b6b', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
                alignItems: 'center'
              }}
              onPress={async () => {
                try {
                  const debugResult = await apiService.debugStoryLoading();
                  console.log('Debug result:', debugResult);
                  
                  if (debugResult.success) {
                    Alert.alert(
                      "Debug Success", 
                      `All story loading tests passed!\n\nResults:\n- Profile: ✅\n- User Trait: ${debugResult.results.userTrait}\n- Admin Stories: ${debugResult.results.adminStories?.stories?.length || 0}\n- Catalog Stories: ${debugResult.results.catalogStories?.length || 0}\n- Personality Stories: ${debugResult.results.personalityStories?.stories?.length || 0}\n- Filtered Stories: ${debugResult.results.filteredStories?.length || 0}`,
                      [{ text: "OK", style: "default" }]
                    );
                  } else {
                    Alert.alert(
                      "Debug Failed", 
                      `Story loading tests failed:\n\nErrors:\n${debugResult.errors.join('\n')}`,
                      [{ text: "OK", style: "default" }]
                    );
                  }
                } catch (error) {
                  console.error('Debug function failed:', error);
                  Alert.alert("Debug Error", "Failed to run debug function", [{ text: "OK", style: "default" }]);
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>🐛 Debug Story Loading</Text>
            </TouchableOpacity>
            
            {/* Simple Test Button */}
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#4ecdc4', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
                alignItems: 'center'
              }}
              onPress={async () => {
                try {
                  const testResult = await apiService.testBasicStoryLoading();
                  console.log('Test result:', testResult);
                  
                  Alert.alert(
                    testResult.success ? "Test Success" : "Test Failed",
                    testResult.message,
                    [{ text: "OK", style: "default" }]
                  );
                } catch (error) {
                  console.error('Simple test failed:', error);
                  Alert.alert("Test Error", "Failed to run simple test", [{ text: "OK", style: "default" }]);
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>🧪 Simple Test</Text>
            </TouchableOpacity>
            
            {/* **STEP 2, 3, & 4: CONNECT THE COMPONENTS** */}
            <WellnessAttributesDisplay
                personalityType={primaryTrait}
                personalityScores={characterData.wellness_stats}
                globalStyles={globalStyles}
              />
            <QuestAchievements
                primaryTrait={primaryTrait}
                questProgress={characterData.quest_progress}
                globalStyles={globalStyles}
            />
            <CopingToolsCollection
                primaryTrait={primaryTrait}
                unlockedTools={characterData.unlocked_tools}
                globalStyles={globalStyles}
            />
        </ScrollView>
      )}

      {activeTab === 'storys' && (
          <PersonalityStoryCatalog 
            primaryTrait={primaryTrait}
            onStorySelect={handleOpenStory}
            globalStyles={globalStyles}
          />
      )}

      {activeTab === 'codex' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <View style={{ flex: 1, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>📖 The Codex</Text>
              <TouchableOpacity onPress={() => setActiveTab('entrance')} style={{ padding: 8 }}>
                <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flex: 1, backgroundColor: '#23242b', borderRadius: 12, padding: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>Your Quest</Text>
              <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                Choose your path of wisdom and record your journey through the {PersonalityConfigs[primaryTrait]?.archiveSection || 'Archive'}.
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ alignItems: 'center', padding: 16, backgroundColor: '#2a2d35', borderRadius: 8 }}
                  onPress={() => {
                    setIsCodexModalVisible(true);
                    setSelectedCodexType('journal');
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>📝</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Journal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ alignItems: 'center', padding: 16, backgroundColor: '#2a2d35', borderRadius: 8 }}
                  onPress={() => {
                    setIsCodexModalVisible(true);
                    setSelectedCodexType('draw');
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>🎨</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Draw</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ alignItems: 'center', padding: 16, backgroundColor: '#2a2d35', borderRadius: 8 }}
                  onPress={() => {
                    setIsCodexModalVisible(true);
                    setSelectedCodexType('voice');
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>🎤</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Voice</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>
                Tap any method to begin your reflection and growth journey.
              </Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'defender' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <View style={{ flex: 1, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>⚡ Thought Defender</Text>
              <TouchableOpacity onPress={() => setActiveTab('entrance')} style={{ padding: 8 }}>
                <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flex: 1, backgroundColor: '#23242b', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
                🧠 Mind Defense Training
              </Text>
              <Text style={{ color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                Strengthen your mental resilience by defending against negative thoughts and collecting positive power-ups.
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>💚</Text>
                  <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>Tap positive thoughts for power-ups</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>⚡</Text>
                  <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>Shoot negative thoughts to defend</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#4ee6e6', 
                  paddingHorizontal: 32, 
                  paddingVertical: 16, 
                  borderRadius: 8,
                  shadowColor: '#4ee6e6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5
                }}
                onPress={() => {
                  setIsThoughtDefenderModalVisible(true);
                }}
              >
                <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>🚀 Start Training</Text>
              </TouchableOpacity>
              
              <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', marginTop: 16, fontStyle: 'italic' }}>
                Complete waves to strengthen your mind and unlock new abilities.
              </Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'restoration' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={globalStyles.personalityRestorationContainer}>
            <Text style={globalStyles.personalityRestorationTitle}>
              🌱 Growth & Restoration
            </Text>
            <Text style={globalStyles.personalityRestorationSubtitle}>
              Track your progress and celebrate your journey through {PersonalityConfigs[primaryTrait].scholarClass}
            </Text>
            
            {/* Progress Overview */}
            <View style={globalStyles.personalityProgressSection}>
              <Text style={globalStyles.personalitySectionTitle}>Your Journey Progress</Text>
              
              {/* Character Level Progress */}
              <View style={globalStyles.personalityProgressCard}>
                <Text style={globalStyles.personalityProgressLabel}>Character Level</Text>
                <Text style={globalStyles.personalityProgressValue}>Level {characterData?.level || 1}</Text>
                <View style={globalStyles.personalityProgressBar}>
                  <View 
                    style={[
                      globalStyles.personalityProgressFill,
                      { 
                        width: `${((characterData?.experience || 0) / (characterData?.experience_needed || 1000)) * 100}%`,
                        backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6'
                      }
                    ]}
                  />
                </View>
                <Text style={globalStyles.personalityProgressText}>
                  {characterData?.experience || 0} / {characterData?.experience_needed || 1000} XP
                </Text>
              </View>

              {/* Wellness Attributes Progress */}
              <View style={globalStyles.personalityWellnessProgress}>
                <Text style={globalStyles.personalitySectionTitle}>Wellness Growth</Text>
                {Object.entries(characterData?.wellness_stats || {}).map(([key, value]) => (
                  <View key={key} style={globalStyles.personalityWellnessItem}>
                    <Text style={globalStyles.personalityWellnessLabel}>{key}</Text>
                    <View style={globalStyles.personalityWellnessBar}>
                      <View 
                        style={[
                          globalStyles.personalityWellnessFill,
                          { 
                            width: `${(value / 20) * 100}%`,
                            backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.accent || '#f72585'
                          }
                        ]}
                      />
                    </View>
                    <Text style={globalStyles.personalityWellnessValue}>{value}/20</Text>
                  </View>
                ))}
              </View>

              {/* Recent Achievements */}
              <View style={globalStyles.personalityAchievementsSection}>
                <Text style={globalStyles.personalitySectionTitle}>Recent Achievements</Text>
                <View style={globalStyles.personalityAchievementCard}>
                  <Text style={globalStyles.personalityAchievementIcon}>🏆</Text>
                  <Text style={globalStyles.personalityAchievementTitle}>Story Explorer</Text>
                  <Text style={globalStyles.personalityAchievementDesc}>
                    Completed your first story in the {PersonalityConfigs[primaryTrait].archiveSection}
                  </Text>
                </View>
                <View style={globalStyles.personalityAchievementCard}>
                  <Text style={globalStyles.personalityAchievementIcon}>📚</Text>
                  <Text style={globalStyles.personalityAchievementTitle}>Knowledge Seeker</Text>
                  <Text style={globalStyles.personalityAchievementDesc}>
                    Unlocked new areas of wisdom and understanding
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Story Modals */}
      {selectedStory && isStoryVisible && (
        <StoryScreen
          visible={isStoryVisible}
          onClose={handleCloseStory}
          story={selectedStory}
          chapter={{ 
            id: (selectedStory as any)?.chapterId || null, 
            title: (selectedStory as any)?.chapterTitle || selectedStory?.title || "Story",
            content: selectedStory?.description || "",
            chapter_number: (selectedStory as any)?.chapterId || null,
            is_starting_chapter: (selectedStory as any)?.chapterId === 1 || (selectedStory as any)?.chapterId === null,
            variables: {},
            requirements: {},
            rewards: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passages: selectedStory?.passages || []
          } as any}
          passage={selectedStory?.passages?.[0] || {} as any}
          choices={selectedStory?.passages?.[0]?.choices || []}
          onStatGain={() => {}} // This would be handled by the master state
          onArtifactUnlock={(artifact: string) => console.log('Artifact unlocked:', artifact)}
          onSkillLearned={(skills: string[]) => console.log('Skills learned:', skills)}
          onStoryComplete={(completionData) => {
            // Convert the StoryScreen completion data to our handleStoryComplete format
            handleStoryComplete({
              storyId: completionData.storyId,
              totalStatGains: completionData.totalStatGains,
              skillsLearned: completionData.skillsLearned,
              questsUpdated: {}, // Not provided by StoryScreen
              experienceGained: 0 // Not provided by StoryScreen
            });
          }}
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

      {/* Thought Defender Modal */}
      <ThoughtDefenderModal
        visible={isThoughtDefenderModalVisible}
        onClose={() => setIsThoughtDefenderModalVisible(false)}
        onScoreUpdate={(data) => {
          console.log('Thought Defender score update:', data);
          // Handle score update - could update character stats here
          if (data.won) {
            // Player won the game, could give rewards
            console.log('Player won Thought Defender!');
          }
        }}
      />

      {/* Codex Modal */}
      <CodexModal
        visible={isCodexModalVisible}
        onClose={() => setIsCodexModalVisible(false)}
        onSave={(entry) => {
          console.log('Codex entry saved:', entry);
          // Handle codex entry save - could update character stats here
          if (entry.type === 'journal') {
            console.log('Journal entry saved:', entry.passages);
          } else if (entry.type === 'draw') {
            console.log('Drawing saved:', entry.passages);
          } else if (entry.type === 'voice') {
            console.log('Voice memo saved:', entry.passages);
          }
        }}
        selectedType={selectedCodexType}
      />
    </View>
  );
}