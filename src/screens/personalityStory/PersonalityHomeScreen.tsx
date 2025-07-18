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
  View
} from "../../imports";

// Import StoryScreen and ChapterScreen for story navigation
import ChapterScreen from "../../screens/characterStory/ChapterScreen";
import StoryScreen from "../../screens/characterStory/StoryScreen";
import PersonalityStoryCatalog from "./PersonalityStoryCatalog";

// Import modals for personality tabs
import CodexModal from "../../components/CodexModal";
import DrawingCanvas from "../../components/DrawingCanvas";
import ThoughtDefenderModal from "../../components/ThoughtDefenderModal";
import VoiceMemoRecorder from "../../components/VoiceMemoRecorder";

// Dummy Icon and LinearGradient for now (replace with your UI lib)
const Icon = ({ name, size, color }: any) => <Text style={{ fontSize: size, color }}>{name}</Text>;
const LinearGradient = ({ children, style }: any) => <View style={style}>{children}</View>;

// Import the centralized data models
import {
  CopingTools,
  PersonalityQuests
} from '../../models/Personality';

// ===== DATA TYPES FOR THIS SCREEN =====

// Use the existing Character interface from user.ts
import { Character } from '../../types/user';

// Extended interface for additional data we need
interface UnifiedCharacterData extends Character {
  quest_progress: Record<string, number>; // e.g., {"openness_1": 2}
  unlocked_tools: string[];
}

// Helper function to map character attributes to wellness stats display format
const mapCharacterAttributesToWellnessStats = (characterData: Character, personalityType: PersonalityKey) => {
  // Use reasonable default values for wellness stats instead of personality scores
  // Personality scores have decimal values and are not the same as wellness stats
  const defaultWellnessValues = {
    awareness: 5,    // Default exploration value
    resilience: 5,   // Default courage value  
    connection: 5,   // Default connection value
    balance: 5       // Default fear/balance value
  };
  
  // Map the character's wellness attributes to display format
  const wellnessStats = [
    {
      icon: "🧘",
      label: "Exploration",
      value: defaultWellnessValues.awareness,
      color: "#4A90E2"
    },
    {
      icon: "💚", 
      label: "Courage",
      value: defaultWellnessValues.resilience,
      color: "#2ECC71"
    },
    {
      icon: "🤝",
      label: "Connection", 
      value: defaultWellnessValues.connection,
      color: "#E74C3C"
    },
    {
      icon: "⚖️",
      label: "Fear",
      value: defaultWellnessValues.balance,
      color: "#F39C12"
    }
  ];
  
  return wellnessStats;
};

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
  characterData: Character; // Pass the full character data instead of just wellness_stats
  storyProgress?: any;
  globalStyles: any;
};

const WellnessAttributesDisplay = ({ personalityType, characterData, storyProgress, globalStyles }: WellnessAttributesDisplayProps) => {
  // Debug: Log what character data is being received
  console.log("=== WELLNESS ATTRIBUTES DISPLAY DEBUG ===");
  console.log("characterData received:", characterData);
  console.log("characterData.wellness_stats:", characterData.wellness_stats);
  console.log("characterData.awareness:", characterData.awareness);
  console.log("characterData.resilience:", characterData.resilience);
  console.log("characterData.connection:", characterData.connection);
  console.log("characterData.balance:", characterData.balance);
  
  // Use the actual wellness_stats from backend if available, otherwise fall back to mapping
  let wellnessStats;
  if (characterData.wellness_stats && characterData.wellness_stats.length > 0) {
    console.log("✅ Using backend wellness_stats:", characterData.wellness_stats);
    wellnessStats = characterData.wellness_stats;
  } else {
    console.log("⚠️ No backend wellness_stats, using mapped character attributes with defaults");
    wellnessStats = mapCharacterAttributesToWellnessStats(characterData, personalityType);
    console.log("📊 Generated wellness stats with defaults:", wellnessStats);
    console.log("📊 Wellness stats values:", wellnessStats.map(stat => ({ label: stat.label, value: stat.value })));
  }
  
  // Use the wellness stats
  const characterAttributes = wellnessStats.map(stat => {
    console.log("Processing stat:", stat);
    return {
      label: stat.label,
      value: stat.value,
      color: stat.color,
      icon: stat.icon,
      description: getWellnessDescription(stat.label)
    };
  });
  
  console.log("Final characterAttributes:", characterAttributes);
  console.log("Final characterAttributes values:", characterAttributes.map(attr => ({ label: attr.label, value: attr.value })));

  // Helper function to get descriptions for wellness attributes
  function getWellnessDescription(label: string): string {
    const descriptions: Record<string, string> = {
      "Exploration": "Your ability to discover new perspectives and embrace the unknown.",
      "Courage": "Your strength to face challenges and overcome fears.",
      "Connection": "Your ability to form meaningful relationships and connect with others.",
      "Fear": "Your awareness of emotional challenges and growth opportunities.",
      "Awareness": "Your ability to perceive and understand your inner world and external environment.",
      "Resilience": "Your capacity to adapt and recover from challenges and setbacks.",
      "Balance": "Your sense of inner harmony and emotional equilibrium."
    };
    return descriptions[label] || "A measure of your personal growth and development.";
  }

  return (
    <View style={globalStyles.personalityAttributesContainer}>
      <Text style={globalStyles.personalityEchoesTitle}>Echoes of the Self</Text>
      <View style={globalStyles.personalityAttributesGrid}>
        {characterAttributes.map((attr: any, index: number) => (
          <View key={index} style={globalStyles.personalityAttributeCardParchment}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>{attr.icon}</Text>
              <Text style={globalStyles.personalityAttributeLabel}>{attr.label}</Text>
            </View>
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

// Extended Game data interface from backend (extends the basic one from types)
interface ExtendedGameData {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    date_joined: string;
    research_group: {
      id: number;
      condition: string;
      name: string;
    };
  };
  research_group: {
    condition: string;
    name: string;
  };
  player_name: string;
  score: number;
  level: number;
  last_played: string;
  current_story_id: string | null;
  current_passage_id: string | null;
  completed_prompts: string[];
  total_entries: number;
  difficulty_levels: any[];
  unlocked_areas: any[];
  character_data: any;
  personality_data: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  journal_data: {
    total_entries: number;
    recent_entries: any[];
    entries_by_type: any[];
  };
  story_data: {
    stories_started: number;
    stories_completed: number;
    current_stories: Array<{
      story_id: number;
      story_title: string;
      current_passage: string;
      is_completed: boolean;
      last_played: string;
    }>;
    completed_stories: any[];
  };
  progress_summary: {
    basic_progress: {
      level: number;
      score: number;
      total_entries: number;
      completed_prompts_count: number;
      difficulty_levels_unlocked: number;
      areas_unlocked: number;
    };
    story_summary: {
      total_progress_records: number;
      unique_stories_played: number;
      recent_activity: Array<{
        story_id: string;
        passage_id: string;
        completed_at: string;
      }>;
    };
    research_info: {
      research_group: string;
      is_group_a: boolean;
      is_group_b: boolean;
    };
    last_activity: string;
    current_activity: {
      story_id: string;
      passage_id: string;
    };
  };
}



// ===== MAIN HOME SCREEN COMPONENT =====

export default function PersonalityHomeScreen() {
  const { theme, ui } = useMasterState();
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

  const [gameData, setGameData] = useState<ExtendedGameData | null>(null);


  
  // Story modal state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [storyRestartCounter, setStoryRestartCounter] = useState(0);

  // Modal state for personality tabs
  const [isCodexModalVisible, setIsCodexModalVisible] = useState(false);
  const [isThoughtDefenderModalVisible, setIsThoughtDefenderModalVisible] = useState(false);
  
  // Codex modal state
  const [codexEntryType, setCodexEntryType] = useState<'journal' | 'draw' | 'voice'>('journal');
  const [isDrawingModalVisible, setIsDrawingModalVisible] = useState(false);
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  // ===== TAB CONTENT COMPONENTS =====

  // Codex Content Component
  const CodexContent = ({ onClose, onSave, unlockedAreas }: { 
    onClose: () => void; 
    onSave: (entry: any) => void; 
    unlockedAreas: string[]; 
  }) => {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>📖 The Codex</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
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
                setCodexEntryType('journal');
                setIsCodexModalVisible(true);
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>📝</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ alignItems: 'center', padding: 16, backgroundColor: '#2a2d35', borderRadius: 8 }}
              onPress={() => {
                setCodexEntryType('draw');
                setIsDrawingModalVisible(true);
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🎨</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Draw</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ alignItems: 'center', padding: 16, backgroundColor: '#2a2d35', borderRadius: 8 }}
              onPress={() => {
                setCodexEntryType('voice');
                setIsVoiceModalVisible(true);
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
    );
  };

  // Thought Defender Content Component
  const ThoughtDefenderContent = ({ onClose, onScoreUpdate }: { 
    onClose: () => void; 
    onScoreUpdate: (data: any) => void; 
  }) => {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>⚡ Thought Defender</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
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
              // Launch the actual game modal
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
    );
  };

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
          console.log("NOTE: These are personality scores, not wellness stats. Wellness stats should come from backend.");
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
            user: 1,
            name: user?.username || 'Scholar',
            level: 1,
            experience: 0,
            experience_needed_for_next_level: 1000,
            awareness: 5, // Use default wellness value instead of personality score
            resilience: 5, // Use default wellness value instead of personality score
            connection: 5, // Use default wellness value instead of personality score
            balance: 5, // Use default wellness value instead of personality score
            coins: 0,
            crystals: 0,
            memories_explored: 0,
            coping_skills_learned: 0,
            insights_discovered: 0,
            selected_base_model: 1,
            selected_skin_color: 1,
            selected_hair_style: 1,
            selected_hair_color: 1,
            selected_eye_type: 1,
            selected_eye_color: 1,
            selected_eyebrow_style: 1,
            selected_eyebrow_color: 1,
            selected_mouth_type: 1,
            selected_shirt_type: 1,
            selected_background_type: 1,
            wellness_stats: undefined, // Let the component use mapping function with proper defaults
            // Note: Individual character attributes (awareness, resilience, etc.) are set to default wellness values (5)
            // not personality scores, to avoid decimal values in the UI
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
            unlocked_tools: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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


  // Fetch game data from backend
  const fetchGameData = useCallback(async () => {
    if (!authToken) return;
    
    try {
      console.log("=== FETCHING GAME DATA ===");
      const gameDataResponse = await apiService.getGameData();
      console.log("Game data received:", gameDataResponse);
      setGameData(gameDataResponse as unknown as ExtendedGameData);
    } catch (e: any) {
      console.error("Failed to fetch game data:", e);
      // Don't set error here as game data is not critical for basic functionality
    }
  }, [authToken]);

  // Fetch all necessary data for the personality home screen from the backend
  const fetchHomeScreenData = useCallback(async () => {
    if (!authToken) return;
    
    // Always fetch backend data to get current wellness stats, even if we have survey data
    // Survey data is only used for initial setup, not for ongoing wellness stats
    
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
      
      // Also try to get character stats which might contain wellness data
      let characterStats = null;
      try {
        characterStats = await apiService.getCharacterStats();
        console.log("Character stats from getCharacterStats():", characterStats);
      } catch (statsError) {
        console.log("Failed to get character stats:", statsError);
      }

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
      
      // If we have survey data, use it to set the primary trait, but still use backend data for everything else
      if (params.surveyData) {
        try {
          const surveyData = JSON.parse(params.surveyData as string);
          if (surveyData.primary_trait) {
            const primary = surveyData.primary_trait as PersonalityKey;
            console.log("Using primary trait from survey data:", primary);
            setPrimaryTrait(primary);
          } else {
            setPrimaryTrait(userPrimaryTrait);
          }
        } catch (parseError) {
          console.log("Failed to parse survey data, using backend primary trait");
          setPrimaryTrait(userPrimaryTrait);
        }
      } else {
        setPrimaryTrait(userPrimaryTrait);
      }
      
      // Debug: Log the wellness stats from backend
      console.log("=== WELLNESS STATS DEBUG ===");
      console.log("Full homeData response:", homeData);
      console.log("userCharacterData:", userCharacterData);
      console.log("userCharacterData.wellness_stats:", userCharacterData.wellness_stats);
      console.log("userCharacterData.awareness:", userCharacterData.awareness);
      console.log("userCharacterData.resilience:", userCharacterData.resilience);
      console.log("userCharacterData.connection:", userCharacterData.connection);
      console.log("userCharacterData.balance:", userCharacterData.balance);
      console.log("characterStats:", characterStats);
      console.log("characterStats?.character_config?.wellness_stats:", characterStats?.character_config?.wellness_stats);
      
      // Convert Character to UnifiedCharacterData format using actual character attributes
      const unifiedData: UnifiedCharacterData = {
        ...userCharacterData, // Spread all the existing character data
        experience_needed_for_next_level: userCharacterData.experience_needed_for_next_level || 1000,
              // Always use backend wellness_stats - this is the source of truth
      wellness_stats: userCharacterData.wellness_stats || characterStats?.character_config?.wellness_stats || undefined,
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
      
      console.log("=== FINAL WELLNESS STATS ASSIGNMENT ===");
      console.log("Backend wellness_stats:", userCharacterData.wellness_stats);
      console.log("Character stats wellness_stats:", characterStats?.character_config?.wellness_stats);
      console.log("Final wellness_stats being set:", unifiedData.wellness_stats);
      
      setCharacterData(unifiedData);

    } catch (e: any) {
      setError("Failed to load your profile. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // Fetch data on screen focus (always fetch backend data to get current wellness stats)
  useFocusEffect(
    useCallback(() => {
      // Always fetch backend data to get current wellness stats, even if we have survey data
      fetchHomeScreenData();
      // Always fetch game data regardless of survey data
      fetchGameData();
    }, [fetchHomeScreenData, fetchGameData])
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
    console.log("=== handleOpenStory called ===");
    console.log("Story data:", story);
    console.log("Story ID:", story.id);
    console.log("Story title:", story.title);
    console.log("Chapter count:", story.chapter_count);
    
    try {
      // Always restart the story to ensure we start from the beginning
      try {
        await apiService.restartStory(story.id);
        console.log(`✅ Story ${story.id} restarted successfully from personality screen`);
      } catch (restartError) {
        console.warn(`⚠️ Story restart failed, continuing anyway:`, restartError);
      }
      
      setSelectedStory(story);
      if (story.chapter_count && story.chapter_count > 0) {
          setIsChapterScreenVisible(true);
      } else {
          setIsStoryVisible(true); 
      }
    } catch (error) {
      console.error("Failed to open story:", error);
      Alert.alert("Error", "Failed to open story. Please try again.", [
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
      // Make sure you have the selectedStory object available
      if (!selectedStory?.id) {
        Alert.alert("Error", "No story selected. Please try again.");
        return;
      }
  
      // 1. Close the chapter selection modal
      setIsChapterScreenVisible(false);
  
      // 2. Chapter selected, will be handled by useStoryEngine
      console.log(`✅ Chapter ${chapterId} selected for story ${selectedStory.id}`);
  
      // 3. Create a NEW story object with the chapterId attached
      //    This is the crucial step that fixes the bug.
      const storyWithChapterInfo = {
        ...selectedStory,
        chapterId: chapterId, // Attach the selected chapter's ID
        passages: undefined,  // Explicitly remove any pre-loaded passage data
      };
      
      // 4. Open the story screen, passing the updated story object
      //    The useStoryEngine will now receive the correct chapterId.
      //    (You might use ui.openStory or another function here depending on the component)
      ui.openStory(storyWithChapterInfo);
  
    } catch (error) {
      console.error("Failed to handle chapter selection:", error);
      Alert.alert(
        "Error",
        "Failed to load chapter. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Handle Thought Defender score updates
  const handleThoughtDefenderScoreUpdate = (data: { score: number; level: number; won: boolean; difficulty: string }) => {
    console.log('Thought Defender score update:', data);
    
    // You can add logic here to:
    // - Update character wellness stats based on performance
    // - Unlock new coping tools
    // - Add experience points
    // - Update quest progress
    
    if (data.won) {
      Alert.alert(
        '🏆 Victory!',
        `Congratulations! You've completed ${data.difficulty} difficulty at level ${data.level} with a score of ${data.score}!`,
        [{ text: 'Continue', style: 'default' }]
      );
    } else {
      Alert.alert(
        '💪 Good Effort!',
        `You reached level ${data.level} with a score of ${data.score} on ${data.difficulty} difficulty. Keep practicing!`,
        [{ text: 'Continue', style: 'default' }]
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
              onPress={() => setActiveTab(tab.key)} 
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
            {/* **STEP 2, 3, & 4: CONNECT THE COMPONENTS** */}
            <WellnessAttributesDisplay
                personalityType={primaryTrait}
                characterData={characterData}
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
            onStoryRestart={() => setStoryRestartCounter(prev => prev + 1)}
            // Pass the survey-based personality trait to override backend fetching
            userPersonalityTrait={params.surveyData ? primaryTrait?.toLowerCase() : undefined}
          />
      )}

      {activeTab === 'codex' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <CodexContent
            onClose={() => setActiveTab('entrance')}
            onSave={(entry) => {
              console.log('Codex entry saved:', entry);
              // Handle codex entry save
            }}
            unlockedAreas={['journal', 'draw', 'voice']}
          />
        </View>
      )}

      {activeTab === 'defender' && (
        <View style={{ flex: 1, backgroundColor: '#0a0b0f' }}>
          <ThoughtDefenderContent
            onClose={() => setActiveTab('entrance')}
            onScoreUpdate={(data) => {
              console.log('Thought Defender score update:', data);
              // Handle score update
            }}
          />
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
              
              {/* Game Level Progress */}
              <View style={globalStyles.personalityProgressCard}>
                <Text style={globalStyles.personalityProgressLabel}>Game Level</Text>
                <Text style={globalStyles.personalityProgressValue}>Level {gameData?.level || 1}</Text>
                <View style={globalStyles.personalityProgressBar}>
                  <View 
                    style={[
                      globalStyles.personalityProgressFill,
                      { 
                        width: `${((gameData?.score || 0) / 1000) * 100}%`, // Using score as progress indicator
                        backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6'
                      }
                    ]}
                  />
                </View>
                <Text style={globalStyles.personalityProgressText}>
                  {gameData?.score || 0} / 1000 Points
                </Text>
              </View>

              {/* Personality-Specific Progress */}
              <View style={globalStyles.personalityWellnessProgress}>
                <Text style={globalStyles.personalitySectionTitle}>
                  {primaryTrait === 'Openness' && '🌌 Explorations & Discoveries'}
                  {primaryTrait === 'Conscientiousness' && '📋 Mastery & Achievement'}
                  {primaryTrait === 'Extraversion' && '🌟 Connections & Sharing'}
                  {primaryTrait === 'Agreeableness' && '💚 Compassion & Growth'}
                  {primaryTrait === 'Neuroticism' && '🧘 Reflection & Balance'}
                  {!['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].includes(primaryTrait) && '📊 Your Progress'}
                </Text>
                
                <View style={globalStyles.personalityWellnessItem}>
                  <Text style={globalStyles.personalityWellnessLabel}>
                    {primaryTrait === 'Openness' && 'Stories Explored'}
                    {primaryTrait === 'Conscientiousness' && 'Stories Mastered'}
                    {primaryTrait === 'Extraversion' && 'Stories Shared'}
                    {primaryTrait === 'Agreeableness' && 'Stories Completed'}
                    {primaryTrait === 'Neuroticism' && 'Stories Reflected'}
                    {!['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].includes(primaryTrait) && 'Stories Completed'}
                  </Text>
                  <View style={globalStyles.personalityWellnessBar}>
                    <View 
                      style={[
                        globalStyles.personalityWellnessFill,
                        { 
                          width: `${Math.min((gameData?.story_data?.stories_completed || 0) / 3, 100)}%`,
                          backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.accent || '#f72585'
                        }
                      ]}
                    />
                  </View>
                  <Text style={globalStyles.personalityWellnessValue}>{gameData?.story_data?.stories_completed || 0} completed</Text>
                </View>

                <View style={globalStyles.personalityWellnessItem}>
                  <Text style={globalStyles.personalityWellnessLabel}>
                    {primaryTrait === 'Openness' && 'Journal Insights'}
                    {primaryTrait === 'Conscientiousness' && 'Journal Records'}
                    {primaryTrait === 'Extraversion' && 'Journal Shares'}
                    {primaryTrait === 'Agreeableness' && 'Journal Reflections'}
                    {primaryTrait === 'Neuroticism' && 'Journal Entries'}
                    {!['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].includes(primaryTrait) && 'Journal Entries'}
                  </Text>
                  <View style={globalStyles.personalityWellnessBar}>
                    <View 
                      style={[
                        globalStyles.personalityWellnessFill,
                        { 
                          width: `${Math.min((gameData?.journal_data?.total_entries || 0) / 5, 100)}%`,
                          backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.accent || '#f72585'
                        }
                      ]}
                    />
                  </View>
                  <Text style={globalStyles.personalityWellnessValue}>{gameData?.journal_data?.total_entries || 0} entries</Text>
                </View>

                <View style={globalStyles.personalityWellnessItem}>
                  <Text style={globalStyles.personalityWellnessLabel}>
                    {primaryTrait === 'Openness' && 'Prompts Completed'}
                    {primaryTrait === 'Conscientiousness' && 'Tasks Completed'}
                    {primaryTrait === 'Extraversion' && 'Interactions Made'}
                    {primaryTrait === 'Agreeableness' && 'Acts of Kindness'}
                    {primaryTrait === 'Neuroticism' && 'Moments Captured'}
                    {!['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].includes(primaryTrait) && 'Activities Completed'}
                  </Text>
                  <View style={globalStyles.personalityWellnessBar}>
                    <View 
                      style={[
                        globalStyles.personalityWellnessFill,
                        { 
                          width: `${Math.min((gameData?.completed_prompts?.length || 0) / 10, 100)}%`,
                          backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.accent || '#f72585'
                        }
                      ]}
                    />
                  </View>
                  <Text style={globalStyles.personalityWellnessValue}>{gameData?.completed_prompts?.length || 0} completed</Text>
                </View>
              </View>

              {/* Recent Activity */}
              <View style={globalStyles.personalityAchievementsSection}>
                <Text style={globalStyles.personalitySectionTitle}>Recent Activity</Text>
                
                {gameData?.progress_summary?.story_summary?.recent_activity?.slice(0, 3).map((activity, index) => (
                  <View key={index} style={globalStyles.personalityAchievementCard}>
                    <Text style={globalStyles.personalityAchievementIcon}>📖</Text>
                    <Text style={globalStyles.personalityAchievementTitle}>Story Progress</Text>
                    <Text style={globalStyles.personalityAchievementDesc}>
                      Completed passage in story {activity.story_id} on {new Date(activity.completed_at).toLocaleDateString()}
                    </Text>
                  </View>
                )) || (
                  <>
                    <View style={globalStyles.personalityAchievementCard}>
                      <Text style={globalStyles.personalityAchievementIcon}>🏆</Text>
                      <Text style={globalStyles.personalityAchievementTitle}>Story Explorer</Text>
                      <Text style={globalStyles.personalityAchievementDesc}>
                        Start your first story to begin your journey
                      </Text>
                    </View>
                    <View style={globalStyles.personalityAchievementCard}>
                      <Text style={globalStyles.personalityAchievementIcon}>📚</Text>
                      <Text style={globalStyles.personalityAchievementTitle}>Knowledge Seeker</Text>
                      <Text style={globalStyles.personalityAchievementDesc}>
                        Complete stories to unlock new areas of wisdom
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Last Played */}
              {gameData?.last_played && (
                <View style={globalStyles.personalityAchievementsSection}>
                  <Text style={globalStyles.personalitySectionTitle}>Last Activity</Text>
                  <View style={globalStyles.personalityAchievementCard}>
                    <Text style={globalStyles.personalityAchievementIcon}>🕒</Text>
                    <Text style={globalStyles.personalityAchievementTitle}>Last Session</Text>
                    <Text style={globalStyles.personalityAchievementDesc}>
                      {new Date(gameData.last_played).toLocaleDateString()} at {new Date(gameData.last_played).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Story Modals */}
      {selectedStory && isStoryVisible && (
        <StoryScreen
          key={`story-${selectedStory.id}-${storyRestartCounter}`}
          visible={isStoryVisible}
          onClose={handleCloseStory}
          story={selectedStory}
          chapter={{ id: 1, title: 'Chapter 1', passages: [] } as any}
          passage={{ id: 'start', text: 'The story begins...' } as any}
          choices={[]}
          onStoryComplete={handleStoryComplete as any} // Cast as any to match expected type
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

      {/* Codex Modal */}
      <CodexModal
        visible={isCodexModalVisible}
        onClose={() => setIsCodexModalVisible(false)}
        onSave={async (entry) => {
          console.log('Codex entry saved:', entry);
          setIsCodexModalVisible(false);
          
          // Refresh the home screen data to update wellness stats
          try {
            console.log('=== REFRESHING DATA AFTER CODEX ENTRY ===');
            console.log('=== EXPECTING WELLNESS STATS TO BE UPDATED ===');
            await fetchHomeScreenData();
            console.log('=== DATA REFRESHED SUCCESSFULLY ===');
            console.log('=== WELLNESS STATS SHOULD NOW BE UPDATED ===');
            console.log('=== CHECK CONSOLE FOR WELLNESS STATS DEBUG LOGS ===');
          } catch (refreshError) {
            console.error('Failed to refresh data after codex entry:', refreshError);
          }
          
          // Handle codex entry save
          Alert.alert('Success', 'Your journal entry has been saved to the Codex.');
        }}
        selectedType={codexEntryType}
        isFullScreen={true}
      />

      {/* Drawing Modal */}
      {isDrawingModalVisible && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#23242b',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            height: '90%',
            position: 'relative'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>🎨 Drawing Canvas</Text>
              <TouchableOpacity onPress={() => setIsDrawingModalVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <DrawingCanvas
              onSave={async (paths) => {
                console.log('Drawing saved:', paths);
                setIsDrawingModalVisible(false);
                
                // Refresh the home screen data to update wellness stats
                try {
                  console.log('=== REFRESHING DATA AFTER DRAWING SAVE ===');
                  await fetchHomeScreenData();
                  console.log('=== DATA REFRESHED SUCCESSFULLY ===');
                } catch (refreshError) {
                  console.error('Failed to refresh data after drawing save:', refreshError);
                }
                
                Alert.alert('Success', 'Your drawing has been saved to the Codex.');
              }}
              onCancel={() => {
                setIsDrawingModalVisible(false);
              }}
            />
          </View>
        </View>
      )}

      {/* Voice Recording Modal */}
      {isVoiceModalVisible && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#23242b',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            height: '60%',
            position: 'relative'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>🎤 Voice Memo</Text>
              <TouchableOpacity onPress={() => setIsVoiceModalVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <VoiceMemoRecorder
              onSave={async (audioUri) => {
                console.log('Voice memo saved:', audioUri);
                setIsVoiceModalVisible(false);
                
                // Refresh the home screen data to update wellness stats
                try {
                  console.log('=== REFRESHING DATA AFTER VOICE MEMO SAVE ===');
                  await fetchHomeScreenData();
                  console.log('=== DATA REFRESHED SUCCESSFULLY ===');
                } catch (refreshError) {
                  console.error('Failed to refresh data after voice memo save:', refreshError);
                }
                
                Alert.alert('Success', 'Your voice memo has been saved to the Codex.');
              }}
              theme={theme.theme}
            />
          </View>
        </View>
      )}

      {/* Thought Defender Modal */}
      <ThoughtDefenderModal
        visible={isThoughtDefenderModalVisible}
        onClose={() => setIsThoughtDefenderModalVisible(false)}
        onScoreUpdate={handleThoughtDefenderScoreUpdate}
      />
    </View>
  );
}