import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
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
import { getPersonalityStyles } from "../../styles/globalStyles";

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

// Helper function to get max value for each wellness stat based on personality type needs
const getMaxValueForPersonalityType = (statLabel: string, personalityType: PersonalityKey): number => {
  const maxValues: Record<string, Record<PersonalityKey, number>> = {
    'Exploration': {
      'Openness': 25,      // High openness needs more exploration
      'Conscientiousness': 15,
      'Extraversion': 20,
      'Agreeableness': 18,
      'Neuroticism': 12,   // Low exploration due to anxiety
    },
    'Courage': {
      'Openness': 20,
      'Conscientiousness': 18,
      'Extraversion': 22,
      'Agreeableness': 16,
      'Neuroticism': 15,   // Lower courage due to stress sensitivity
    },
    'Connection': {
      'Openness': 18,
      'Conscientiousness': 16,
      'Extraversion': 25,  // High extraversion needs more connection
      'Agreeableness': 22, // High agreeableness needs more connection
      'Neuroticism': 20,   // Higher connection needs due to emotional support
    },
    'Fear': {
      'Openness': 15,
      'Conscientiousness': 18,
      'Extraversion': 12,
      'Agreeableness': 16,
      'Neuroticism': 25,   // Higher emotional awareness
    },
  };
  
  return maxValues[statLabel]?.[personalityType] || 20; // Default to 20
};

// Helper function to map personality scores to wellness stats based on actual personality scores
const mapPersonalityToWellnessStats = (personalityScores: any, personalityType: PersonalityKey) => {
  // Base values that all personality types start with
  const baseValues = {
    awareness: 5,    // Base exploration value
    resilience: 5,   // Base courage value  
    connection: 5,   // Base connection value
    balance: 5       // Base fear/balance value
  };
  
  // Extract actual scores from personality profile
  const scores = personalityScores.profile_summary?.scores || personalityScores;
  const openness = scores.openness || 0;
  const conscientiousness = scores.conscientiousness || 0;
  const extraversion = scores.extraversion || 0;
  const agreeableness = scores.agreeableness || 0;
  const neuroticism = scores.neuroticism || 0;
  
  console.log('📊 Personality scores from backend:', {
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism
  });
  
  // Calculate wellness stats based on actual personality scores
  // Higher scores in certain traits affect wellness stats differently
  let wellnessValues = { ...baseValues };
  
  // Neuroticism affects all wellness stats negatively (higher neuroticism = lower wellness)
  const neuroticismImpact = Math.min(neuroticism / 10, 1); // Normalize to 0-1
  wellnessValues.awareness = Math.max(1, wellnessValues.awareness - (neuroticismImpact * 3));
  wellnessValues.resilience = Math.max(1, wellnessValues.resilience - (neuroticismImpact * 4));
  wellnessValues.connection = Math.max(1, wellnessValues.connection - (neuroticismImpact * 2));
  wellnessValues.balance = Math.max(1, wellnessValues.balance + (neuroticismImpact * 3)); // Higher fear/emotional awareness
  
  // Openness affects exploration and connection positively
  const opennessImpact = Math.min(openness / 10, 1);
  wellnessValues.awareness = Math.max(1, Math.min(10, wellnessValues.awareness + (opennessImpact * 2)));
  wellnessValues.connection = Math.max(1, Math.min(10, wellnessValues.connection + (opennessImpact * 1)));
  wellnessValues.balance = Math.max(1, Math.min(10, wellnessValues.balance - (opennessImpact * 1))); // Lower fear
  
  // Conscientiousness affects resilience positively, but can limit exploration
  const conscientiousnessImpact = Math.min(conscientiousness / 10, 1);
  wellnessValues.resilience = Math.max(1, Math.min(10, wellnessValues.resilience + (conscientiousnessImpact * 2)));
  wellnessValues.awareness = Math.max(1, Math.min(10, wellnessValues.awareness - (conscientiousnessImpact * 1)));
  wellnessValues.balance = Math.max(1, Math.min(10, wellnessValues.balance + (conscientiousnessImpact * 1))); // Higher fear of mistakes
  
  // Extraversion affects connection and resilience positively
  const extraversionImpact = Math.min(extraversion / 10, 1);
  wellnessValues.connection = Math.max(1, Math.min(10, wellnessValues.connection + (extraversionImpact * 3)));
  wellnessValues.resilience = Math.max(1, Math.min(10, wellnessValues.resilience + (extraversionImpact * 1)));
  wellnessValues.awareness = Math.max(1, Math.min(10, wellnessValues.awareness - (extraversionImpact * 1))); // Less inner exploration
  
  // Agreeableness affects connection positively but can limit resilience
  const agreeablenessImpact = Math.min(agreeableness / 10, 1);
  wellnessValues.connection = Math.max(1, Math.min(10, wellnessValues.connection + (agreeablenessImpact * 2)));
  wellnessValues.resilience = Math.max(1, Math.min(10, wellnessValues.resilience - (agreeablenessImpact * 1)));
  wellnessValues.awareness = Math.max(1, Math.min(10, wellnessValues.awareness + (agreeablenessImpact * 1))); // Higher empathy
  
  console.log('📊 Calculated wellness values:', wellnessValues);
  
  return wellnessValues;
};

// Helper function to map character attributes to wellness stats display format (legacy support)
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

const DailyCuratorMessage = ({ primaryTrait, characterData, globalStyles, personalityStyles }: { primaryTrait: PersonalityKey; characterData: any; globalStyles: any; personalityStyles: any }) => {
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
      style={personalityStyles.curatorMessageCard}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      <View style={personalityStyles.curatorHeader}>
        <Text style={personalityStyles.curatorAvatar}>🧙‍♂️</Text>
        <View style={personalityStyles.curatorInfo}>
          <Text style={personalityStyles.curatorName}>The Curator</Text>
          <Text style={personalityStyles.curatorTitle}>Keeper of The Archive</Text>
        </View>
        <Text style={personalityStyles.dailyLabel}>Daily Wisdom</Text>
      </View>
      
      <View style={personalityStyles.messageContent}>
        <Text style={personalityStyles.personalizedGreeting}>
          &quot;{getPersonalizedGreeting()}, 
        </Text>
        <Text style={personalityStyles.curatorMessage}>
          {currentMessage}&quot;
        </Text>
      </View>
      
      {isExpanded && (
        <View style={personalityStyles.expandedContent}>
          <Text style={personalityStyles.expandedHint}>
            💡 Tap any wellness attribute to focus your practice today
          </Text>
          <Text style={personalityStyles.expandedFooter}>
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
  characterData?: Character; // Pass the full character data instead of just wellness_stats
  personalityProfile?: any; // Pass personality profile data from backend
  storyProgress?: any;
  globalStyles: any;
  personalityStyles: any;
  theme: any;
};

const WellnessAttributesDisplay = ({ personalityType, characterData, personalityProfile, storyProgress, globalStyles, personalityStyles, theme }: WellnessAttributesDisplayProps) => {
  // Debug: Log what character data is being received
  console.log("=== WELLNESS ATTRIBUTES DISPLAY DEBUG ===");
  console.log("characterData received:", characterData);
  console.log("personalityProfile received:", personalityProfile);
  
  // For personality survey users, always prioritize personality profile data over character data
  // Character data for survey users is just default/placeholder data
  if (personalityProfile) {
    console.log("✅ Using personality profile data to calculate wellness stats");
    
    const wellnessValues = mapPersonalityToWellnessStats(personalityProfile, personalityType);
    console.log("📊 Calculated wellness values from personality:", wellnessValues);
    
    const personalityBasedWellnessStats = [
      {
        icon: "🧘",
        label: "Exploration",
        value: wellnessValues.awareness,
        color: "#4A90E2"
      },
      {
        icon: "💚", 
        label: "Courage",
        value: wellnessValues.resilience,
        color: "#2ECC71"
      },
      {
        icon: "🤝",
        label: "Connection", 
        value: wellnessValues.connection,
        color: "#E74C3C"
      },
      {
        icon: "⚖️",
        label: "Fear",
        value: wellnessValues.balance,
        color: "#F39C12"
      }
    ];
    
    console.log("📊 Generated personality-based wellness stats:", personalityBasedWellnessStats);
    
    const characterAttributes = personalityBasedWellnessStats.map(stat => ({
      label: stat.label,
      value: stat.value,
      color: stat.color,
      icon: stat.icon,
      description: getWellnessDescription(stat.label)
    }));
    
    console.log("Final characterAttributes from personality:", characterAttributes);
    console.log("Final characterAttributes values:", characterAttributes.map(attr => ({ label: attr.label, value: attr.value })));
    
    return (
      <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
        <Text style={{ color: personalityStyles.curatorName?.color || theme.theme.archiveAccent, fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
          Wellness Foundations
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {characterAttributes.map((attr, index) => (
            <View key={index} style={{
              backgroundColor: theme.theme.archiveCard,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              borderWidth: 1,
              borderColor: `${personalityStyles.curatorName?.color || theme.theme.archiveAccent}40`,
              alignItems: 'center',
              shadowColor: personalityStyles.curatorName?.color || theme.theme.archiveAccent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{attr.icon}</Text>
              <Text style={{ color: theme.theme.archiveText, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>{attr.label}</Text>
              
              {/* Progress Bar */}
              <View style={{
                width: '100%',
                height: 6,
                backgroundColor: theme.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                marginVertical: 8,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${Math.min((attr.value / getMaxValueForPersonalityType(attr.label, personalityType)) * 100, 100)}%`,
                  backgroundColor: attr.color,
                  borderRadius: 3,
                }} />
              </View>
              
              <Text style={{ color: personalityStyles.curatorName?.color || theme.theme.archiveAccent, fontSize: 18, fontWeight: 'bold' }}>
                {attr.value}/{getMaxValueForPersonalityType(attr.label, personalityType)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  
  // Fallback: Handle case where characterData is undefined (for survey users without characters)
  if (!characterData) {
    console.log("⚠️ No character data and no personality profile - using default wellness stats");
    
    const defaultWellnessStats = [
      {
        icon: "🧘",
        label: "Exploration",
        value: 5,
        color: "#4A90E2"
      },
      {
        icon: "💚", 
        label: "Courage",
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
        label: "Fear",
        value: 5,
        color: "#F39C12"
      }
    ];
    
    console.log("📊 Generated default wellness stats:", defaultWellnessStats);
    
    const characterAttributes = defaultWellnessStats.map(stat => ({
      label: stat.label,
      value: stat.value,
      color: stat.color,
      icon: stat.icon,
      description: getWellnessDescription(stat.label)
    }));
    
    console.log("Final characterAttributes:", characterAttributes);
    console.log("Final characterAttributes values:", characterAttributes.map(attr => ({ label: attr.label, value: attr.value })));
    
    return (
      <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
        <Text style={{ color: theme.theme.archiveText, fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
          Wellness Foundations
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {characterAttributes.map((attr, index) => (
            <View key={index} style={{
              backgroundColor: theme.theme.archiveCard,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              borderWidth: 1,
              borderColor: `${theme.theme.archiveAccent}40`,
              alignItems: 'center',
              shadowColor: theme.theme.archiveAccent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{attr.icon}</Text>
              <Text style={{ color: theme.theme.archiveText, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>{attr.label}</Text>
              
              {/* Progress Bar */}
              <View style={{
                width: '100%',
                height: 6,
                backgroundColor: theme.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                marginVertical: 8,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${Math.min((attr.value / getMaxValueForPersonalityType(attr.label, personalityType)) * 100, 100)}%`,
                  backgroundColor: attr.color,
                  borderRadius: 3,
                }} />
              </View>
              
              <Text style={{ color: personalityStyles.curatorName?.color || theme.theme.archiveAccent, fontSize: 18, fontWeight: 'bold' }}>
                {attr.value}/{getMaxValueForPersonalityType(attr.label, personalityType)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  
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
    <View style={personalityStyles.wellnessContainer}>
      <Text style={personalityStyles.wellnessTitle}>Wellness Foundations</Text>
      <View style={personalityStyles.wellnessGrid}>
        {characterAttributes.map((attr: any, index: number) => (
          <View key={index} style={personalityStyles.wellnessItem}>
            <Text style={personalityStyles.wellnessIcon}>{attr.icon}</Text>
            <Text style={personalityStyles.wellnessLabel}>{attr.label}</Text>
            <Text style={personalityStyles.wellnessValue}>{attr.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 3. Active Quests (Driven by props)
const QuestAchievements = ({ questProgress, primaryTrait, globalStyles, personalityStyles }: { questProgress: Record<string, number>; primaryTrait: PersonalityKey; globalStyles: any; personalityStyles: any }) => {
  const quests = PersonalityQuests[primaryTrait] || [];

  return (
    <View style={personalityStyles.questsContainer}>
      <Text style={personalityStyles.questsTitle}>Active Quests</Text>
      {quests.map((quest) => {
        const progress = questProgress[quest.id] || 0;
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;

        return (
          <View key={quest.id} style={[personalityStyles.questCard, isCompleted && personalityStyles.questCompleted]}>
            <Text style={personalityStyles.questTitle}>{quest.title}</Text>
            <Text style={personalityStyles.questDescription}>{quest.description}</Text>
            <View style={personalityStyles.questProgress}>
              <View style={personalityStyles.questProgressBar}>
                <View
                  style={[
                    personalityStyles.questProgressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={personalityStyles.questProgressText}>
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
const CopingToolsCollection = ({ unlockedTools, primaryTrait, globalStyles, personalityStyles }: { unlockedTools: string[]; primaryTrait: PersonalityKey; globalStyles: any; personalityStyles: any }) => {
  const allPossibleTools = CopingTools[primaryTrait] || [];

  return (
    <View style={personalityStyles.toolsContainer}>
      <Text style={personalityStyles.toolsTitle}>Coping Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {allPossibleTools.map((tool) => {
          const isUnlocked = unlockedTools.includes(tool.id);
          return (
            <View key={tool.id} style={[personalityStyles.toolCard, !isUnlocked && personalityStyles.toolLocked]}>
              <Text style={personalityStyles.toolIcon}>
                {isUnlocked ? tool.icon : "🔒"}
              </Text>
              <Text style={[personalityStyles.toolName, !isUnlocked && personalityStyles.toolNameLocked]}>
                {isUnlocked ? tool.name : "Locked"}
              </Text>
              <Text style={personalityStyles.toolDescription}>
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
  const { theme, ui, auth } = useMasterState();
  const { authToken, characterId, user } = auth;
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
  const [personalityProfile, setPersonalityProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [gameData, setGameData] = useState<ExtendedGameData | null>(null);

  // Story state - following CharacterHomeScreen pattern
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  
  // Story modal state - use global UI state like CharacterHomeScreen
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [storyRestartCounter, setStoryRestartCounter] = useState(0);

  // Modal state for personality tabs
  const [isCodexModalVisible, setIsCodexModalVisible] = useState(false);
  const [isThoughtDefenderModalVisible, setIsThoughtDefenderModalVisible] = useState(false);
  
  // Codex modal state
  const [codexEntryType, setCodexEntryType] = useState<'journal' | 'draw' | 'voice'>('journal');
  const [isDrawingModalVisible, setIsDrawingModalVisible] = useState(false);
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  // Generate personality-specific styles with theme awareness
  const personalityConfig = PersonalityConfigs[primaryTrait];
  const personalityStyles = getPersonalityStyles(
    personalityConfig.theme.primary,
    personalityConfig.theme.secondary,
    personalityConfig.theme.accent,
    theme.theme
  );

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // ===== STORY LOADING FUNCTIONS =====
  
  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      console.log("Loading personality stories for trait:", primaryTrait);
      
      // Get all available stories first
      const allStories = await apiService.getAvailableStories();
      console.log("All stories loaded:", allStories?.length || 0);
      
      // Filter stories to only show:
      // 1. Introduction (ID 12) - which has empty personality_focus
      // 2. The Whispering Stacks variant that matches the user's personality trait
      const effectivePersonalityTrait = primaryTrait?.toLowerCase();
      console.log("Effective personality trait for filtering:", effectivePersonalityTrait);
      
      const filteredStories = allStories.filter((story: any) => {
        // Only include Introduction (ID 12) - specifically by ID, not by empty personality_focus
        if (story.id === 12) {
          console.log(`✅ Including Introduction story (ID: ${story.id})`);
          return true;
        }
        
        // Include The Whispering Stacks variant that matches the user's personality
        // BUT exclude base character stories (like ID 27 "The Whispering Stacks - Base data")
        if (story.title && story.title.includes('The Whispering Stacks') && story.personality_focus && story.personality_focus.length > 0) {
          const storyPersonalityFocus = story.personality_focus;
          console.log(`Checking Whispering Stacks story "${story.title}" with personality_focus:`, storyPersonalityFocus);
          
          // Check if this story's personality_focus matches the user's trait
          const matchesUserTrait = storyPersonalityFocus.includes(effectivePersonalityTrait);
          console.log(`Story ${story.id} matches user trait (${effectivePersonalityTrait}): ${matchesUserTrait}`);
          
          if (matchesUserTrait) {
            console.log(`✅ Including personality-matched Whispering Stacks story (ID: ${story.id})`);
            return true;
          }
        }
        
        console.log(`❌ Excluding story "${story.title}" (ID: ${story.id}) - doesn't match criteria`);
        return false;
      });
      
      console.log("Filtered stories for personality catalog:", filteredStories.length);
      filteredStories.forEach((story: any) => {
        console.log(`- Story ${story.id}: "${story.title}" (personality_focus: ${JSON.stringify(story.personality_focus)})`);
      });
      
      // Load progress records for all stories
      const allProgressRecords = await apiService.getStoryProgressRecords('');
      const progressMap = new Map(allProgressRecords.map((p: any) => [p.story, p]));

      // Combine stories with their progress. DO NOT load chapters or passages.
      const storiesWithProgress = filteredStories.map((story: any) => {
        const progress = progressMap.get(story.id);
        return {
          ...story,
          exploration: progress?.progress_percentage || 0,
          revelations: progress?.choices_made_count || 0,
        };
      });

      setStories(storiesWithProgress);
    } catch (error) {
      console.error("Failed to load personality stories:", error);
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Load stories from backend on mount
  useEffect(() => {
    if (activeTab === "storys" && primaryTrait) {
      console.log("🔄 Loading stories for primary trait:", primaryTrait);
      loadStories();
    }
  }, [activeTab, primaryTrait]);
  
  // Load personality profile data
  const loadPersonalityProfile = async () => {
    try {
      console.log('🔄 Loading personality profile data...');
      const userProfile = await apiService.getProfile();
      
      console.log('📋 Full user profile from backend:', userProfile);
      console.log('📋 Personality profile data:', userProfile.personality_profile);
      
      if (userProfile.personality_profile) {
        console.log('✅ Personality profile loaded:', userProfile.personality_profile);
        setPersonalityProfile(userProfile.personality_profile);
      } else {
        console.log('⚠️ No personality profile found in user profile');
        console.log('📋 Available profile keys:', Object.keys(userProfile));
        console.log('📋 Profile object keys:', userProfile.profile ? Object.keys(userProfile.profile) : 'No profile object');
      }
    } catch (error: any) {
      console.error('❌ Error loading personality profile:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadStories();
    loadPersonalityProfile();
  }, [primaryTrait]);

  // ===== TAB CONTENT COMPONENTS =====

  // Codex Content Component
  const CodexContent = ({ onSave, unlockedAreas, personalityStyles }: { 
    onSave: (entry: any) => void; 
    unlockedAreas: string[]; 
    personalityStyles: any;
  }) => {
    return (
      <View style={personalityStyles.codexContent}>
        <Text style={personalityStyles.codexTitle}>📖 The Codex</Text>
        <Text style={personalityStyles.codexQuestTitle}>Your Quest</Text>
        <Text style={personalityStyles.codexQuestDescription}>
          Choose your path of wisdom and record your journey through the {PersonalityConfigs[primaryTrait]?.archiveSection || 'Archive'}.
        </Text>
        
        <View style={personalityStyles.codexOptionsContainer}>
          <TouchableOpacity 
            style={personalityStyles.codexOptionButton}
            onPress={() => {
              setCodexEntryType('journal');
              setIsCodexModalVisible(true);
            }}
          >
            <Text style={personalityStyles.codexOptionIcon}>📝</Text>
            <Text style={personalityStyles.codexOptionText}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={personalityStyles.codexOptionButton}
            onPress={() => {
              setCodexEntryType('draw');
              setIsDrawingModalVisible(true);
            }}
          >
            <Text style={personalityStyles.codexOptionIcon}>🎨</Text>
            <Text style={personalityStyles.codexOptionText}>Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={personalityStyles.codexOptionButton}
            onPress={() => {
              setCodexEntryType('voice');
              setIsVoiceModalVisible(true);
            }}
          >
            <Text style={personalityStyles.codexOptionIcon}>🎤</Text>
            <Text style={personalityStyles.codexOptionText}>Voice</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={personalityStyles.codexFooterText}>
          Tap any method to begin your reflection and growth journey.
        </Text>
      </View>
    );
  };

  // Thought Defender Content Component
  const ThoughtDefenderContent = ({ onScoreUpdate, personalityStyles }: { 
    onScoreUpdate: (data: any) => void; 
    personalityStyles: any;
  }) => {
    return (
      <View style={personalityStyles.thoughtDefenderContent}>
        <Text style={personalityStyles.thoughtDefenderTitle}>⚡ Thought Defender</Text>
        <Text style={personalityStyles.thoughtDefenderMainTitle}>
          🧠 Mind Defense Training
        </Text>
        <Text style={personalityStyles.thoughtDefenderDescription}>
          Strengthen your mental resilience by defending against negative thoughts and collecting positive power-ups.
        </Text>
        
        <View style={personalityStyles.thoughtDefenderInstructionsContainer}>
          <View style={personalityStyles.thoughtDefenderInstructionItem}>
            <Text style={personalityStyles.thoughtDefenderInstructionIcon}>💚</Text>
            <Text style={personalityStyles.thoughtDefenderInstructionText} numberOfLines={2}>
              Tap positive thoughts for power-ups
            </Text>
          </View>
          <View style={personalityStyles.thoughtDefenderInstructionItem}>
            <Text style={personalityStyles.thoughtDefenderInstructionIcon}>⚡</Text>
            <Text style={personalityStyles.thoughtDefenderInstructionText} numberOfLines={2}>
              Shoot negative thoughts to defend
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={personalityStyles.thoughtDefenderStartButton}
          onPress={() => {
            // Launch the actual game modal
            setIsThoughtDefenderModalVisible(true);
          }}
        >
          <Text style={personalityStyles.thoughtDefenderStartButtonText}>🚀 Start Training</Text>
        </TouchableOpacity>
        
        <Text style={personalityStyles.thoughtDefenderFooterText}>
          Complete waves to strengthen your mind and unlock new abilities.
        </Text>
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
      // **STEP 1: FETCH PERSONALITY PROFILE DATA FIRST**
      // This is the primary data source for personality survey users
      console.log("=== FETCHING PERSONALITY PROFILE DATA ===");
      const userProfile = await apiService.getProfile();
      console.log("📋 Full user profile from backend:", userProfile);
      console.log("📋 Personality profile data:", userProfile.personality_profile);
      
      const dominantTrait = userProfile.personality_profile?.profile_summary?.dominant_trait;
      console.log("Backend dominant trait:", dominantTrait);
      console.log("Personality profile structure:", userProfile.personality_profile);
      
      // Store the personality profile data for wellness calculations
      if (userProfile.personality_profile) {
        console.log("✅ Storing personality profile data:", userProfile.personality_profile);
        setPersonalityProfile(userProfile.personality_profile);
      } else {
        console.log("⚠️ No personality profile found in user profile");
        console.log("📋 Available profile keys:", Object.keys(userProfile));
        console.log("📋 Profile object keys:", userProfile.profile ? Object.keys(userProfile.profile) : 'No profile object');
      }
      
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
      console.log("Trait mapping details - dominantTrait:", dominantTrait, "mapped to:", userPrimaryTrait);
      
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
      
      // **STEP 2: TRY TO FETCH CHARACTER DATA (OPTIONAL)**
      // Only try to fetch character data if the user might have a character
      // Personality survey users typically don't have characters
      let homeData = null;
      let userCharacterData = null;
      
      try {
        console.log("=== TRYING TO FETCH CHARACTER DATA ===");
        homeData = await apiService.getCharacterHomeData();
        
        // Check if the response has an error indicating no character
        if (homeData && (homeData as any).error === "Character not found") {
          console.log("⚠️ Character not found in home data - user is likely a personality survey user");
          userCharacterData = null;
        } else {
          userCharacterData = homeData?.character;
          console.log("✅ Character home data fetched successfully");
        }
      } catch (characterError: any) {
        console.log("⚠️ Character data not available - user is likely a personality survey user");
        console.log("Character error:", characterError?.message || characterError);
        // This is expected for personality survey users, not an error
      }

      console.log("getProfile: Fetching fresh data from backend (no survey data in params)");
      console.log("=== GET REQUEST DEBUG ===");
      console.log("Endpoint key: userProfile");
      console.log("Base endpoint: users/");

      
      // Debug: Log the wellness stats from backend
      console.log("=== WELLNESS STATS DEBUG ===");
      console.log("Full homeData response:", homeData || 'No homeData available');
      console.log("userCharacterData:", userCharacterData);
      
      // Handle case where user has no character (personality survey users)
      if (!userCharacterData || !homeData) {
        console.log("⚠️ No character data found - user is likely a personality survey user");
        
        // Create default character data for survey users
        const defaultCharacterData: UnifiedCharacterData = {
          id: 1, // Default ID for survey users
          user: 1,
          name: user?.username || 'Scholar',
          level: 1,
          experience: 0,
          experience_needed_for_next_level: 1000,
          awareness: 5, // Will be overridden by personality-based calculation
          resilience: 5, // Will be overridden by personality-based calculation
          connection: 5, // Will be overridden by personality-based calculation
          balance: 5, // Will be overridden by personality-based calculation
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
          wellness_stats: undefined, // Let the component use personality-based mapping
          // Note: Individual character attributes will be overridden by personality-based wellness calculation
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
          unlocked_tools: homeData?.available_tools?.map((tool: any) => tool.id) || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log("✅ Created default character data for survey user:", defaultCharacterData);
        setCharacterData(defaultCharacterData);
        return;
      }
      
      console.log("userCharacterData.wellness_stats:", userCharacterData.wellness_stats);
      console.log("userCharacterData.awareness:", userCharacterData.awareness);
      console.log("userCharacterData.resilience:", userCharacterData.resilience);
      console.log("userCharacterData.connection:", userCharacterData.connection);
      console.log("userCharacterData.balance:", userCharacterData.balance);
      
      // Convert Character to UnifiedCharacterData format using actual character attributes
      const unifiedData: UnifiedCharacterData = {
        ...userCharacterData, // Spread all the existing character data
        experience_needed_for_next_level: userCharacterData.experience_needed_for_next_level || 1000,
        // Always use backend wellness_stats - this is the source of truth
        wellness_stats: userCharacterData.wellness_stats || undefined,
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
        unlocked_tools: homeData?.available_tools?.map((tool: any) => tool.id) || []
      };
      
      console.log("=== FINAL WELLNESS STATS ASSIGNMENT ===");
      console.log("Backend wellness_stats:", userCharacterData.wellness_stats);
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
    ui.closeStory();
    
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

  // Handlers for story navigation - following CharacterHomeScreen pattern
  const handleOpenStory = async (storyToOpen: Story) => {
    if (storyToOpen.chapter_count && storyToOpen.chapter_count > 0) {
      // Story has chapters, so open the chapter selection screen.
      setIsChapterScreenVisible(true);
      // Store the selected story in global state for chapter selection
      ui.setSelectedStory(storyToOpen);
    } else {
      // No chapters, so restart and open the story directly.
      await apiService.restartStory(storyToOpen.id);
      const storyWithoutChapter = {
        ...storyToOpen,
        chapterId: undefined, // Ensure chapterId is not set
      };
      ui.openStory(storyWithoutChapter);
    }
  };
  
  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = (completionData: { storyId: string; }) => {
    // Handle story completion locally
    handleCloseStory();
    loadStories(); // Refresh the story list to show updated progress
    Alert.alert("🎉 Story Completed!", "You have successfully completed this story.");
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      if (!ui.selectedStory?.id) {
        Alert.alert("Error", "No story selected. Please try again.");
        return;
      }
  
      setIsChapterScreenVisible(false);
      console.log(`✅ Chapter ${chapterId} selected for story ${ui.selectedStory.id}`);
  
      // Create a NEW story object with the chapterId attached.
      const storyWithChapterInfo = {
        ...ui.selectedStory,
        chapterId: chapterId,
        passages: undefined, // Explicitly remove any pre-loaded passage data
      };
      
      // Open the story screen, passing the updated story object.
      ui.openStory(storyWithChapterInfo);
  
    } catch (error) {
      console.error("Failed to handle chapter selection:", error);
      Alert.alert("Error", "Failed to load chapter. Please try again.");
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

  // Fetch data from backend if no survey data
  useEffect(() => {
    if (!params.surveyData && authToken) {
      console.log("🔄 No survey data found, fetching from backend...");
      fetchHomeScreenData();
      fetchGameData();
    }
  }, [params.surveyData, authToken, fetchHomeScreenData, fetchGameData]);


  if (isLoading || !characterData) {
    return (
      <View style={globalStyles.personalityCentered}>
        <ActivityIndicator size="large" color={theme.theme.archiveAccent} />
        <Text style={{ color: theme.theme.archiveText, marginTop: 16 }}>Loading Your Archive...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Text style={{ color: theme.theme.statusError, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={fetchHomeScreenData} style={globalStyles.personalityRetryButton}>
            <Text style={{ color: theme.theme.archiveText }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

      return (
      <View style={{ flex: 1, backgroundColor: theme.theme.archiveBackground }}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.theme.archiveBackground} />
        

        
        {/* Header with Personality-Specific Styling */}
        <PersonalizedArchiveHeader 
          primaryTrait={primaryTrait}
          traitScores={traitScores}
          characterData={characterData}
        />

        {/* Personality-Specific Tab Navigation */}
        <View style={personalityStyles.tabBar}>
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
                activeTab === tab.key && personalityStyles.tabButtonActive
              ]}
            >
              <Text style={{ 
                fontSize: 22, 
                marginBottom: 6,
                textShadowColor: activeTab === tab.key ? personalityConfig.theme.primary : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3
              }}>
                {tab.icon}
              </Text>
              <Text style={[
                { 
                  fontSize: 11,
                  fontWeight: '500',
                  textAlign: 'center',
                },
                activeTab === tab.key ? personalityStyles.tabTextActive : { color: '#ccc' }
              ]}>
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
            <LinearGradient
              colors={[
                hexToRgba(personalityConfig.theme.primary, 0.1),
                hexToRgba(personalityConfig.theme.secondary, 0.1)
              ]}
              style={globalStyles.curatorMessageCard}
            >
              <DailyCuratorMessage 
                  primaryTrait={primaryTrait} 
                  characterData={characterData}
                  globalStyles={globalStyles} 
                  personalityStyles={personalityStyles}
              />
            </LinearGradient>
            
            {/* **STEP 2, 3, & 4: CONNECT THE COMPONENTS** */}
            <WellnessAttributesDisplay
                personalityType={primaryTrait}
                characterData={characterData || undefined}
                personalityProfile={personalityProfile}
                globalStyles={globalStyles}
                personalityStyles={personalityStyles}
                theme={theme}
            />
            <QuestAchievements
                primaryTrait={primaryTrait}
                questProgress={characterData.quest_progress}
                globalStyles={globalStyles}
                personalityStyles={personalityStyles}
            />
            <CopingToolsCollection
                primaryTrait={primaryTrait}
                unlockedTools={characterData.unlocked_tools}
                globalStyles={globalStyles}
                personalityStyles={personalityStyles}
            />
        </ScrollView>
      )}

      {activeTab === 'storys' && (
          <PersonalityStoryCatalog 
            primaryTrait={primaryTrait}
            stories={stories}
            isLoading={isLoadingStories}
            onStorySelect={handleOpenStory}
            globalStyles={globalStyles}
            personalityStyles={personalityStyles}
            setStories={setStories}
            setIsLoading={setIsLoadingStories}
            onStoryRestart={() => setStoryRestartCounter(prev => prev + 1)}
            // Pass the survey-based personality trait to override backend fetching
            userPersonalityTrait={params.surveyData ? primaryTrait?.toLowerCase() : undefined}
            debugPersonalityMatching={() => {
              console.log('=== PERSONALITY MATCHING DEBUG ===');
              console.log('Primary trait:', primaryTrait);
              console.log('Survey data:', params.surveyData);
              console.log('Effective personality trait:', params.surveyData ? primaryTrait?.toLowerCase() : 'None');
              console.log('Stories loaded:', stories.length);
            }}
          />
      )}

      {activeTab === 'codex' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={personalityStyles.codexContainer}>
            <CodexContent
              onSave={(entry) => {
                console.log('Codex entry saved:', entry);
                // Handle codex entry save
              }}
              unlockedAreas={['journal', 'draw', 'voice']}
              personalityStyles={personalityStyles}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'defender' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={personalityStyles.thoughtDefenderContainer}>
            <ThoughtDefenderContent
              onScoreUpdate={(data) => {
                console.log('Thought Defender score update:', data);
                // Handle score update
              }}
              personalityStyles={personalityStyles}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'restoration' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={globalStyles.personalityRestorationContainer}>
            <Text style={personalityStyles.restorationTitle}>
              🌱 Growth & Restoration
            </Text>
            <Text style={globalStyles.personalityRestorationSubtitle}>
              Track your progress and celebrate your journey through {PersonalityConfigs[primaryTrait].scholarClass}
            </Text>
            
            {/* Progress Overview */}
            <View style={globalStyles.personalityProgressSection}>
              <Text style={globalStyles.personalitySectionTitle}>Your Journey Progress</Text>
              
              {/* Game Level Progress */}
              <View style={personalityStyles.progressCard}>
                <Text style={personalityStyles.progressLabel}>Game Level</Text>
                <Text style={globalStyles.personalityProgressValue}>Level {gameData?.level || 1}</Text>
                <View style={globalStyles.personalityProgressBar}>
                  <View 
                    style={[
                      globalStyles.personalityProgressFill,
                      { 
                        width: `${((gameData?.score || 0) / 1000) * 100}%`, // Using score as progress indicator
                        backgroundColor: personalityConfig.theme.primary
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
                        personalityStyles.wellnessFill,
                        { 
                          width: `${Math.min((gameData?.story_data?.stories_completed || 0) / 3, 100)}%`,
                          backgroundColor: personalityConfig.theme.accent
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
                        personalityStyles.wellnessFill,
                        { 
                          width: `${Math.min((gameData?.journal_data?.total_entries || 0) / 5, 100)}%`,
                          backgroundColor: personalityConfig.theme.accent
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
                        personalityStyles.wellnessFill,
                        { 
                          width: `${Math.min((gameData?.completed_prompts?.length || 0) / 10, 100)}%`,
                          backgroundColor: personalityConfig.theme.accent
                        }
                      ]}
                    />
                  </View>
                  <Text style={globalStyles.personalityWellnessValue}>{gameData?.completed_prompts?.length || 0} completed</Text>
                </View>
              </View>

                  {/* Mental Health Resources Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: theme.theme.archiveText,
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 1,
                          textShadowColor: 'rgba(0, 0, 0, 0.3)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          💙Mental Health Support💙
                        </Text>
                     
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: theme.theme.archiveSubtext,
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(0, 0, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        If you're struggling, these resources are here to help
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: theme.theme.statusInfo,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.statusInfo,
                            shadowColor: theme.theme.statusInfo,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
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
                            backgroundColor: theme.theme.statusError,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.statusError,
                            shadowColor: theme.theme.statusError,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services/crisis-and-mental-health-emergency';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
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
                            backgroundColor: theme.theme.statusSuccess,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.statusSuccess,
                            shadowColor: theme.theme.statusSuccess,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://www.sph.umn.edu/current/resources/mental-health/';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
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
                            backgroundColor: theme.theme.statusWarning,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.statusWarning,
                            shadowColor: theme.theme.statusWarning,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://mentalhealth.umn.edu/';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
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
       

              {/* Recent Activity */}
              <View style={globalStyles.personalityAchievementsSection}>
                <Text style={globalStyles.personalitySectionTitle}>Recent Activity</Text>
                
                {gameData?.progress_summary?.story_summary?.recent_activity?.slice(0, 3).map((activity, index) => (
                  <View key={index} style={personalityStyles.achievementCard}>
                    <Text style={globalStyles.personalityAchievementIcon}>📖</Text>
                    <Text style={personalityStyles.achievementTitle}>Story Progress</Text>
                    <Text style={globalStyles.personalityAchievementDesc}>
                      Completed passage in story {activity.story_id} on {new Date(activity.completed_at).toLocaleDateString()}
                    </Text>
                  </View>
                )) || (
                  <>
                    <View style={personalityStyles.achievementCard}>
                      <Text style={globalStyles.personalityAchievementIcon}>🏆</Text>
                      <Text style={personalityStyles.achievementTitle}>Story Explorer</Text>
                      <Text style={globalStyles.personalityAchievementDesc}>
                        Start your first story to begin your journey
                      </Text>
                    </View>
                    <View style={personalityStyles.achievementCard}>
                      <Text style={globalStyles.personalityAchievementIcon}>📚</Text>
                      <Text style={personalityStyles.achievementTitle}>Knowledge Seeker</Text>
                      <Text style={globalStyles.personalityAchievementDesc}>
                        Complete stories to unlock new areas of wisdom
                      </Text>
                    </View>
                  </>
                )}
              </View>

          {/* Settings Section */}
          <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="settings" size={20} color={theme.theme.archiveText} />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: theme.theme.archiveText,
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(0, 0, 0, 0.3)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Archive Settings
                        </Text>
                        <Icon name="settings" size={20} color={theme.theme.archiveText} />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: theme.theme.archiveSubtext,
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(0, 0, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Customize your journey through The Archive
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                       

                        <TouchableOpacity
                          style={{
                            backgroundColor: theme.theme.archiveAccent,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.archiveAccent,
                            shadowColor: theme.theme.archiveAccent,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            theme.toggleTheme();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: theme.theme.isDark ? '#ffffff' : '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            {theme.isDark ? 'Light Mode' : 'Dark Mode'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: theme.theme.statusError,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: theme.theme.statusError,
                            shadowColor: theme.theme.statusError,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            Alert.alert(
                              "Logout",
                              "Are you sure you want to leave The Archive?",
                              [
                                { text: "Cancel", style: "cancel" },
                                { 
                                  text: "Logout", 
                                  style: "destructive",
                                  onPress: () => auth.logout()
                                }
                              ]
                            );
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

              {/* Last Played */}
              {gameData?.last_played && (
                <View style={globalStyles.personalityAchievementsSection}>
                  <Text style={globalStyles.personalitySectionTitle}>Last Activity</Text>
                  <View style={personalityStyles.achievementCard}>
                    <Text style={globalStyles.personalityAchievementIcon}>🕒</Text>
                    <Text style={personalityStyles.achievementTitle}>Last Session</Text>
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
      {ui.selectedStory && (
        <StoryScreen
          visible={ui.isStoryVisible}
          onClose={handleCloseStory}
          story={ui.selectedStory as any}
          chapter={{} as any} // The StoryScreen component doesn't actually use this prop
          passage={{} as any} // The StoryScreen component doesn't actually use this prop
          choices={[]} // The StoryScreen component doesn't actually use this prop
          onStatGain={() => {}} // This would be handled by the master state
          onArtifactUnlock={(artifact: string) => console.log('Artifact unlocked:', artifact)}
          onSkillLearned={(skill: string) => console.log('Skill learned:', skill)}
          onStoryComplete={handleStoryComplete as any}
        />
      )}

      {/* Chapter Selection Modal */}
      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={ui.selectedStory?.id?.toString() || ""} 
        storyTitle={ui.selectedStory?.title || "Unknown Story"}
        onChapterSelect={handleChapterSelect}
      />

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