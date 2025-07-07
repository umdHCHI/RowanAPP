import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    apiService,
    CodexModal,
    createGlobalStyles,
    PERSONALITY_BUILDS,
    PERSONALITY_TABS,
    PersonalityConfigs,
    PersonalityKey,
    PersonalityWellnessAttributes,
    ScrollView,
    StatusBar,
    Story,
    Text,
    ThoughtDefenderModal,
    TouchableOpacity,
    useMasterState,
    UserProfile,
    View
} from "../../imports";

// Import StoryScreen and ChapterScreen for story navigation
import ChapterScreen from "../../screens/characterStory/ChapterScreen";
import StoryScreen from "../../screens/characterStory/StoryScreen";
import PersonalityStoryCatalog from "./PersonalityStoryCatalog";

// Dummy Icon and LinearGradient for now (replace with your UI lib)
const Icon = ({ name, size, color }: any) => <Text style={{ fontSize: size, color }}>{name}</Text>;
const LinearGradient = ({ children, style }: any) => <View style={style}>{children}</View>;



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

// 2. CHARACTER PROGRESSION SYSTEM
const CharacterProgression = ({ characterData, primaryTrait, globalStyles }: { characterData: any; primaryTrait: PersonalityKey; globalStyles: any }) => {
  const level = characterData?.level || 1;
  const experience = characterData?.experience || 0;
  const experienceNeeded = characterData?.experience_needed_for_next_level || 1000;
  const progressPercentage = characterData?.experience_progress_percentage || 0;
  
  const getNextLevelBenefit = () => {
    const benefits = {
      Openness: "Unlock new creative exploration paths",
      Conscientiousness: "Gain access to advanced organization techniques", 
      Extraversion: "Discover powerful social connection methods",
      Agreeableness: "Learn deeper empathy and harmony skills",
      Neuroticism: "Master advanced emotional regulation practices"
    };
    return benefits[primaryTrait];
  };

  const getLevelTitle = () => {
    if (level >= 15) return "Archive Master";
    if (level >= 10) return "Wise Scholar";
    if (level >= 5) return "Skilled Apprentice";
    return "Novice Explorer";
  };

  return (
    <View style={globalStyles.personalityProgressionCard}>
      <View style={globalStyles.personalityProgressionHeader}>
        <Text style={globalStyles.personalityProgressionTitle}>Scholar's Journey</Text>
        <View style={globalStyles.personalityLevelBadge}>
          <Text style={globalStyles.personalityLevelText}>Level {level}</Text>
        </View>
      </View>
      
      <Text style={globalStyles.personalityLevelTitle}>{getLevelTitle()}</Text>
      
      <View style={globalStyles.personalityExperienceSection}>
        <View style={globalStyles.personalityExperienceBar}>
          <View 
            style={[globalStyles.personalityExperienceProgress, { width: `${progressPercentage}%` as const }]}
          />
          <Text style={globalStyles.personalityExperienceText}>
            {experience} / {experienceNeeded} XP
          </Text>
        </View>
      </View>
      
      <View style={globalStyles.personalityProgressStats}>
        <View style={globalStyles.personalityProgressStat}>
          <Text style={globalStyles.personalityStatIcon}>📚</Text>
          <Text style={globalStyles.personalityStatLabel}>Memories</Text>
          <Text style={globalStyles.personalityStatValue}>{characterData?.memories_explored || 0}</Text>
        </View>
        <View style={globalStyles.personalityProgressStat}>
          <Text style={globalStyles.personalityStatIcon}>🛠️</Text>
          <Text style={globalStyles.personalityStatLabel}>Coping Skills</Text>
          <Text style={globalStyles.personalityStatValue}>{characterData?.coping_skills_learned || 0}</Text>
        </View>
        <View style={globalStyles.personalityProgressStat}>
          <Text style={globalStyles.personalityStatIcon}>💡</Text>
          <Text style={globalStyles.personalityStatLabel}>Insights</Text>
          <Text style={globalStyles.personalityStatValue}>{characterData?.insights_discovered || 0}</Text>
        </View>
      </View>
      
      <View style={globalStyles.personalityNextLevelPreview}>
        <Text style={globalStyles.personalityNextLevelLabel}>Next Level Unlock:</Text>
        <Text style={globalStyles.personalityNextLevelBenefit}>{getNextLevelBenefit()}</Text>
      </View>
    </View>
  );
};

// 3. PERSONALITY-SPECIFIC QUEST ACHIEVEMENTS
const PersonalityQuests = {
  Openness: [
    { id: 1, title: "Curiosity Catalyst", description: "Complete 3 exploration stories", reward: "🔮 Imagination Boost", progress: 0, total: 3 },
    { id: 2, title: "Creative Alchemist", description: "Try 5 new coping techniques", reward: "✨ Innovation Badge", progress: 0, total: 5 },
    { id: 3, title: "Possibility Pioneer", description: "Explore different story paths", reward: "🌟 Pathfinder Title", progress: 0, total: 10 }
  ],
  Conscientiousness: [
    { id: 1, title: "Steady Scholar", description: "Complete daily practice for 7 days", reward: "🏆 Discipline Medal", progress: 0, total: 7 },
    { id: 2, title: "Organization Oracle", description: "Master 5 structure techniques", reward: "📋 Planner's Pride", progress: 0, total: 5 },
    { id: 3, title: "Persistence Paragon", description: "Finish 10 challenging stories", reward: "⚖️ Steadfast Seal", progress: 0, total: 10 }
  ],
  Extraversion: [
    { id: 1, title: "Social Spark", description: "Connect with archive community", reward: "🌟 People's Champion", progress: 0, total: 1 },
    { id: 2, title: "Energy Enthusiast", description: "Boost connection skills 10 times", reward: "⚡ Vitality Badge", progress: 0, total: 10 },
    { id: 3, title: "Communication Catalyst", description: "Share insights with others", reward: "🎭 Expression Expert", progress: 0, total: 5 }
  ],
  Agreeableness: [
    { id: 1, title: "Harmony Healer", description: "Resolve 5 conflict scenarios", reward: "🕊️ Peace Keeper", progress: 0, total: 5 },
    { id: 2, title: "Empathy Expert", description: "Show compassion in 10 situations", reward: "💚 Heart of Gold", progress: 0, total: 10 },
    { id: 3, title: "Boundary Builder", description: "Practice assertiveness 8 times", reward: "🛡️ Gentle Guardian", progress: 0, total: 8 }
  ],
  Neuroticism: [
    { id: 1, title: "Emotion Explorer", description: "Track feelings for 14 days", reward: "🧘 Mindfulness Master", progress: 0, total: 14 },
    { id: 2, title: "Resilience Researcher", description: "Overcome 7 anxiety challenges", reward: "🌊 Calm Cultivator", progress: 0, total: 7 },
    { id: 3, title: "Depth Diver", description: "Complete introspective journeys", reward: "🌙 Inner Wisdom", progress: 0, total: 12 }
  ]
};

const QuestAchievements = ({ primaryTrait, characterData, globalStyles }: { primaryTrait: PersonalityKey; characterData: any; globalStyles: any }) => {
  const quests = PersonalityQuests[primaryTrait] || [];
  const [expandedQuest, setExpandedQuest] = useState<number | null>(null);

  const getQuestProgress = (quest: any) => {
    // Map quest progress to character data
    switch(quest.id) {
      case 1: return Math.min(characterData?.memories_explored || 0, quest.total);
      case 2: return Math.min(characterData?.coping_skills_learned || 0, quest.total);
      case 3: return Math.min(characterData?.insights_discovered || 0, quest.total);
      default: return quest.progress;
    }
  };

  return (
    <View style={globalStyles.personalityQuestsContainer}>
      <Text style={globalStyles.personalityQuestsTitle}>Archive Quests</Text>
      <Text style={globalStyles.personalityQuestsSubtitle}>Challenges for the {primaryTrait} Scholar</Text>
      
      {quests.map((quest) => {
        const progress = getQuestProgress(quest);
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;
        
        return (
          <TouchableOpacity
            key={quest.id}
            style={[globalStyles.personalityQuestCard, isCompleted && globalStyles.personalityQuestCompleted]}
            onPress={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
          >
            <View style={globalStyles.personalityQuestHeader}>
              <Text style={globalStyles.personalityQuestTitle}>{quest.title}</Text>
              <View style={globalStyles.personalityQuestRewardBadge}>
                <Text style={globalStyles.personalityQuestReward}>{quest.reward}</Text>
              </View>
            </View>
            
            <Text style={globalStyles.personalityQuestDescription}>{quest.description}</Text>
            
            <View style={globalStyles.personalityQuestProgress}>
              <View style={globalStyles.personalityQuestProgressBar}>
                <View 
                  style={[
                    globalStyles.personalityQuestProgressFill, 
                    { width: `${progressPercentage}%` },
                    isCompleted && globalStyles.personalityQuestProgressCompleted
                  ]}
                />
              </View>
              <Text style={globalStyles.personalityQuestProgressText}>
                {progress}/{quest.total} {isCompleted ? "✅" : ""}
              </Text>
            </View>
            
            {expandedQuest === quest.id && (
              <View style={globalStyles.personalityQuestExpanded}>
                <Text style={globalStyles.personalityQuestHint}>
                  💡 Complete stories and practice coping skills to advance this quest
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// 4. COPING TOOLS COLLECTION
const CopingToolsCollection = ({ characterData, primaryTrait, globalStyles }: { characterData: any; primaryTrait: PersonalityKey; globalStyles: any }) => {
  const copingTools = characterData?.coping_tools || [];
  const toolsLearned = characterData?.coping_skills_learned || 0;
  
  // Sample coping tools based on personality type
  const availableTools = {
    Openness: [
      { id: 1, name: "Creative Visualization", icon: "🎨", description: "Paint your feelings with imagination" },
      { id: 2, name: "Curiosity Meditation", icon: "🔍", description: "Explore thoughts without judgment" },
      { id: 3, name: "Possibility Mapping", icon: "🗺️", description: "Chart new paths forward" }
    ],
    Conscientiousness: [
      { id: 1, name: "Structured Breathing", icon: "🧘", description: "4-7-8 breathing technique" },
      { id: 2, name: "Goal Laddering", icon: "📋", description: "Break big goals into steps" },
      { id: 3, name: "Routine Anchor", icon: "⚓", description: "Create stability in chaos" }
    ],
    Extraversion: [
      { id: 1, name: "Social Recharging", icon: "🔋", description: "Connect with others mindfully" },
      { id: 2, name: "Energy Mapping", icon: "⚡", description: "Track your energy patterns" },
      { id: 3, name: "Boundary Setting", icon: "🛡️", description: "Protect your social energy" }
    ],
    Agreeableness: [
      { id: 1, name: "Assertiveness Scripts", icon: "💬", description: "Practice saying no kindly" },
      { id: 2, name: "Empathy Boundaries", icon: "🌊", description: "Feel without drowning" },
      { id: 3, name: "Conflict Resolution", icon: "🤝", description: "Navigate disagreements peacefully" }
    ],
    Neuroticism: [
      { id: 1, name: "Emotion Surfing", icon: "🏄", description: "Ride the waves of feeling" },
      { id: 2, name: "Worry Time", icon: "⏰", description: "Schedule time for anxious thoughts" },
      { id: 3, name: "Grounding Techniques", icon: "🌱", description: "5-4-3-2-1 sensory grounding" }
    ]
  };

  const tools = availableTools[primaryTrait] || [];
  const unlockedTools = tools.slice(0, Math.min(toolsLearned, tools.length));

  return (
    <View style={globalStyles.personalityToolsContainer}>
      <Text style={globalStyles.personalityToolsTitle}>Coping Tools Collected</Text>
      <Text style={globalStyles.personalityToolsCounter}>
        {unlockedTools.length} of {tools.length} tools unlocked
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={globalStyles.personalityToolsScroll}>
        {tools.map((tool, index) => {
          const isUnlocked = index < toolsLearned;
          return (
            <View key={tool.id} style={[globalStyles.personalityToolCard, !isUnlocked && globalStyles.personalityToolLocked]}>
              <Text style={[globalStyles.personalityToolIcon, !isUnlocked && globalStyles.personalityToolIconLocked]}>
                {isUnlocked ? tool.icon : "🔒"}
              </Text>
              <Text style={[globalStyles.personalityToolName, !isUnlocked && globalStyles.personalityToolNameLocked]}>
                {isUnlocked ? tool.name : "???"}
              </Text>
              <Text style={[globalStyles.personalityToolDescription, !isUnlocked && globalStyles.personalityToolDescriptionLocked]}>
                {isUnlocked ? tool.description : "Complete more stories to unlock"}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// MAIN COMPONENT COMBINING ALL ELEMENTS
const RPGHomeAdditions = ({ primaryTrait, characterData, globalStyles }: { primaryTrait: PersonalityKey; characterData: any; globalStyles: any }) => {
  return (
    <View style={globalStyles.personalityRpgContainer}>
      <DailyCuratorMessage primaryTrait={primaryTrait} characterData={characterData} globalStyles={globalStyles} />
      <QuestAchievements primaryTrait={primaryTrait} characterData={characterData} globalStyles={globalStyles} />
      <CopingToolsCollection characterData={characterData} primaryTrait={primaryTrait} globalStyles={globalStyles} />
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

// Personalized Archive Header Component
const PersonalizedArchiveHeader = ({ 
  primaryTrait, 
  userProfile, 
  traitScores,
  theme,
  devMode,
  showPersonalitySwitcher,
  setShowPersonalitySwitcher,
  switchPersonality,
  activeTab,
  setActiveTab,
  allTabs,
  globalStyles
}: {
  primaryTrait: PersonalityKey;
  userProfile: UserProfile | null;
  traitScores: Record<PersonalityKey, number>;
  theme: any;
  devMode: boolean;
  showPersonalitySwitcher: boolean;
  setShowPersonalitySwitcher: (show: boolean) => void;
  switchPersonality: (trait: PersonalityKey) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  allTabs: Array<{ key: string; icon: string; label: string }>;
  globalStyles: any;
}) => {
  const config = PersonalityConfigs[primaryTrait];
  
  // Calculate mind state values based on personality type
  const calculateMindState = (stateKey: string) => {
    switch(stateKey) {
      case 'awareness':
      case 'curiosity':
        return (traitScores.Openness + traitScores.Conscientiousness) / 2;
      case 'imagination':
      case 'creativity':
        return traitScores.Openness;
      case 'openness':
      case 'adventure':
        return (traitScores.Openness + traitScores.Extraversion) / 2;
      case 'discipline':
      case 'focus':
        return traitScores.Conscientiousness;
      case 'persistence':
      case 'resilience':
        return (traitScores.Conscientiousness + (10 - traitScores.Neuroticism)) / 2;
      case 'achievement':
      case 'progress':
        return (traitScores.Conscientiousness + traitScores.Extraversion) / 2;
      case 'vitality':
      case 'energy':
        return traitScores.Extraversion;
      case 'social':
      case 'connection':
        return (traitScores.Extraversion + traitScores.Agreeableness) / 2;
      case 'communication':
      case 'expression':
        return traitScores.Extraversion;
      case 'compassion':
      case 'empathy':
        return traitScores.Agreeableness;
      case 'peace':
      case 'harmony':
        return (traitScores.Agreeableness + (10 - traitScores.Neuroticism)) / 2;
      case 'healing':
      case 'growth':
        return (traitScores.Agreeableness + traitScores.Openness) / 2;
      case 'mindfulness':
        return (traitScores.Neuroticism + traitScores.Openness) / 2;
      case 'introspection':
      case 'depth':
        return traitScores.Neuroticism;
      case 'emotional_balance':
      case 'flow':
        return (10 - traitScores.Neuroticism + traitScores.Agreeableness) / 2;
      default:
        return traitScores[primaryTrait];
    }
  };
  
  const dynamicStyles = {
    headerContainer: {
      ...globalStyles.personalityHeaderContainer,
      backgroundColor: config.theme.background,
      borderBottomColor: config.theme.primary,
      shadowColor: config.theme.primary,
    },
    avatarGlow: {
      ...globalStyles.personalityAvatarGlow,
      backgroundColor: config.mysticalElements.avatarGlow,
    },
    mysticalBorder: {
      ...globalStyles.personalityMysticalBorder,
      backgroundColor: config.mysticalElements.borderGlow,
    },
    backgroundRune: {
      ...globalStyles.personalityBackgroundRune,
      color: config.theme.secondary,
    },
    scholarRank: {
      ...globalStyles.personalityScholarRank,
      color: config.theme.primary,
    },
    scholarClass: {
      ...globalStyles.personalityScholarClass,
      color: config.theme.accent,
    },
    archiveLabel: {
      ...globalStyles.personalityArchiveLabel,
      color: config.theme.primary,
    },
    journeyIndicator: {
      ...globalStyles.personalityJourneyIndicator,
      backgroundColor: `${config.theme.primary}20`,
      borderLeftColor: config.theme.primary,
    },
  };
  
  return (
    <View style={dynamicStyles.headerContainer}>
      {/* Personality-specific background elements */}
      <View style={globalStyles.personalityBackgroundElements}>
        {config.backgroundRunes.map((rune, index) => (
          <Text key={index} style={dynamicStyles.backgroundRune}>
            {rune}
          </Text>
        ))}
      </View>
      
      {/* Main header content */}
      <View style={globalStyles.personalityHeaderContent}>
        {/* Left side - Avatar and Scholar Info */}
        <View style={globalStyles.personalityLeftSection}>
          <View style={globalStyles.personalityAvatarContainer}>
            <Text style={globalStyles.personalityAvatarIcon}>{config.avatar}</Text>
            <View style={dynamicStyles.avatarGlow} />
          </View>
          
          <View style={globalStyles.personalityScholarInfo}>
            <Text style={dynamicStyles.scholarRank}>Archive Scholar</Text>
            <Text style={dynamicStyles.scholarClass}>{config.scholarClass}</Text>
            <Text style={globalStyles.personalityScholarLevel}>
              Level {Math.floor(traitScores[primaryTrait] / 2) + 1}
            </Text>
          </View>
        </View>
        
        {/* Right side - Game Title and Description */}
        <View style={globalStyles.personalityRightSection}>
          <View style={globalStyles.personalityGameInfo}>
            <Text style={dynamicStyles.archiveLabel}>THE ARCHIVE</Text>
            <Text style={globalStyles.personalityGameTitle}>{config.gameTitle}</Text>
            <Text style={globalStyles.personalityArchiveSection}>{config.archiveSection}</Text>
            <Text style={globalStyles.personalityHeaderCuratorNote}>{config.curatorNote}</Text>
          </View>
        </View>
      </View>
      
      {/* Journey section with personality-specific content */}
      <View style={globalStyles.personalityJourneySection}>
        <View style={dynamicStyles.journeyIndicator}>
          <Text style={globalStyles.personalityJourneyIcon}>🗝️</Text>
          <Text style={globalStyles.personalityJourneyText}>{config.journeyDesc}</Text>
        </View>
        

        
        {/* Tab Navigation */}
        <View style={globalStyles.personalityMindStateTabBar}>
          {allTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[globalStyles.personalityMindStateTab, activeTab === tab.key && globalStyles.personalityMindStateTabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={globalStyles.personalityMindStateTabIcon}>{tab.icon}</Text>
              <Text style={[globalStyles.personalityMindStateTabLabel, activeTab === tab.key && globalStyles.personalityMindStateTabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Developer Mode Toggle - Hidden tap area */}
      {devMode && (
        <TouchableOpacity
          style={globalStyles.personalityDevToggle}
          onPress={() => setShowPersonalitySwitcher(!showPersonalitySwitcher)}
        >
          <Text style={globalStyles.personalityDevToggleText}>🧪 DEV MODE</Text>
        </TouchableOpacity>
      )}

      {/* Personality Switcher for Development */}
      {showPersonalitySwitcher && (
        <View style={globalStyles.personalitySwitcher}>
          <Text style={globalStyles.personalitySwitcherTitle}>Switch Personality Type</Text>
          {Object.keys(PersonalityConfigs).map((trait) => (
            <TouchableOpacity
              key={trait}
              style={[
                globalStyles.personalitySwitcherButton,
                primaryTrait === trait && globalStyles.personalitySwitcherButtonActive
              ]}
              onPress={() => switchPersonality(trait as PersonalityKey)}
            >
              <Text style={globalStyles.personalitySwitcherButtonText}>
                {PersonalityConfigs[trait as PersonalityKey].avatar} {PersonalityConfigs[trait as PersonalityKey].scholarClass}
              </Text>
              {primaryTrait === trait && (
                <Text style={globalStyles.personalitySwitcherActiveText}>✓ Current</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={globalStyles.personalitySwitcherCloseButton}
            onPress={() => setShowPersonalitySwitcher(false)}
          >
            <Text style={globalStyles.personalitySwitcherCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mystical border with personality color */}
      <View style={dynamicStyles.mysticalBorder} />
    </View>
  );
};

const getWellnessAttributes = (personalityType: PersonalityKey) => {
  return PersonalityWellnessAttributes[personalityType] || PersonalityWellnessAttributes.Openness;
};

type WellnessAttributesDisplayProps = {
  personalityType: PersonalityKey;
  personalityScores: Record<PersonalityKey, number>;
  storyProgress?: any;
  globalStyles: any;
};

const WellnessAttributesDisplay = ({ personalityType, personalityScores, storyProgress, globalStyles }: WellnessAttributesDisplayProps) => {
  const attributes = getWellnessAttributes(personalityType);
  return (
    <View style={globalStyles.personalityAttributesContainer}>
      <Text style={globalStyles.personalityEchoesTitle}>Echoes of the Self</Text>
      <View style={globalStyles.personalityAttributesGrid}>
        {attributes.attributes.map((attr: any, index: number) => (
          <View key={index} style={globalStyles.personalityAttributeCardParchment}>
            <Text style={globalStyles.personalityAttributeLabel}>{attr.label}</Text>
            <View style={globalStyles.personalityAttributeBarMagic}>
              <View 
                style={[
                  globalStyles.personalityAttributeProgressMagic,
                  { 
                    width: `${(attr.value / 10) * 100}%`,
                    backgroundColor: attr.color
                  }
                ]}
              />
            </View>
            <Text style={globalStyles.personalityAttributeValue}>{attr.value}/10</Text>
            <Text style={globalStyles.personalityCuratorNote}>
              Curator&apos;s Note: <Text style={globalStyles.personalityCuratorNoteText}>{attr.description}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function PersonalityHomeScreen() {
  const { theme } = useMasterState();
  const { authToken, characterId, user } = useMasterState().auth;
  const globalStyles = createGlobalStyles(theme.theme);
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

  // Development mode toggle (tap the header title 5 times)
  const handleDevModeToggle = () => {
    const newCount = devTapCount + 1;
    setDevTapCount(newCount);
    
    if (newCount >= 5) {
      setDevMode(!devMode);
      setDevTapCount(0);
      Alert.alert(
        "Developer Mode",
        devMode ? "Developer mode disabled" : "Developer mode enabled! Tap the header again to switch personalities.",
        [{ text: "OK" }]
      );
    }
  };

  // Quick personality switcher for testing
  const switchPersonality = (newTrait: PersonalityKey) => {
    // Generate realistic scores for the new personality type
    const newScores: Record<PersonalityKey, number> = {
      Openness: 5,
      Conscientiousness: 5,
      Extraversion: 5,
      Agreeableness: 5,
      Neuroticism: 5,
    };

    // Set the dominant trait to a high score
    newScores[newTrait] = 8;

    // Set complementary traits to moderate scores
    switch (newTrait) {
      case "Openness":
        newScores.Conscientiousness = 4;
        newScores.Extraversion = 6;
        newScores.Agreeableness = 7;
        newScores.Neuroticism = 3;
        break;
      case "Conscientiousness":
        newScores.Openness = 4;
        newScores.Extraversion = 5;
        newScores.Agreeableness = 6;
        newScores.Neuroticism = 2;
        break;
      case "Extraversion":
        newScores.Openness = 6;
        newScores.Conscientiousness = 4;
        newScores.Agreeableness = 7;
        newScores.Neuroticism = 3;
        break;
      case "Agreeableness":
        newScores.Openness = 6;
        newScores.Conscientiousness = 5;
        newScores.Extraversion = 7;
        newScores.Neuroticism = 2;
        break;
      case "Neuroticism":
        newScores.Openness = 7;
        newScores.Conscientiousness = 3;
        newScores.Extraversion = 4;
        newScores.Agreeableness = 6;
        break;
    }

    setTraitScores(newScores);
    setPrimaryTrait(newTrait);
    setShowPersonalitySwitcher(false);
    
    Alert.alert(
      "Personality Switched",
      `Now testing as: ${PersonalityConfigs[newTrait].scholarClass}`,
      [{ text: "OK" }]
    );
  };

  // Function to fetch personality profile from backend
  const fetchPersonalityProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("=== FETCHING PERSONALITY PROFILE ===");
      console.log("Auth token present:", authToken ? "Yes" : "No");
      console.log("Character ID:", characterId);
      console.log("User:", user);

      // Initialize API service
      await apiService.initialize();

      // Check if user is authenticated - use authToken from context instead of validateToken
      if (!authToken) {
        console.log("No auth token in context, trying to re-authenticate...");
        
        // Try to re-authenticate by checking if we have stored credentials
        try {
          // This is a fallback - in a real app you might want to redirect to login
          console.log("Attempting to re-authenticate...");
          // For now, we'll use fallback data and show a warning
          setError("Authentication token expired. Please log in again to view your full profile.");
          setIsLoading(false);
          return;
        } catch (reauthError) {
          console.log("Re-authentication failed, using fallback data");
          setError("Please log in to view your personality profile");
          setIsLoading(false);
          return;
        }
      }

      // Fetch user profile which includes personality data
      let profile;
      try {
        profile = await apiService.getProfile();
        setUserProfile(profile);
      } catch (profileError) {
        console.log("First profile fetch failed, retrying once...");
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        profile = await apiService.getProfile();
        setUserProfile(profile);
      }

      if (profile.personality_profile) {
        // Convert backend format to frontend format
        const personalityData = profile.personality_profile as PersonalityProfile;
        const scores: Record<PersonalityKey, number> = {
          Openness: personalityData.openness,
          Conscientiousness: personalityData.conscientiousness,
          Extraversion: personalityData.extraversion,
          Agreeableness: personalityData.agreeableness,
          Neuroticism: personalityData.neuroticism,
        };

        setTraitScores(scores);

        // Use dominant trait from backend if available, otherwise calculate from scores
        let primary: PersonalityKey;
        if (personalityData.profile_summary?.dominant_trait) {
          // Map backend trait names to frontend format
          const traitMap: Record<string, PersonalityKey> = {
            'openness': 'Openness',
            'conscientiousness': 'Conscientiousness',
            'extraversion': 'Extraversion',
            'agreeableness': 'Agreeableness',
            'neuroticism': 'Neuroticism'
          };
          primary = traitMap[personalityData.profile_summary.dominant_trait] || 'Openness';
        } else {
          // Fallback: Find primary trait (highest score)
          primary = Object.entries(scores).reduce((a, b) =>
            scores[a[0] as PersonalityKey] > scores[b[0] as PersonalityKey] ? a : b
          )[0] as PersonalityKey;
        }

        setPrimaryTrait(primary);
        console.log("Personality profile loaded:", { scores, primary, dominantTrait: personalityData.profile_summary?.dominant_trait });
      } else {
        console.log("No personality profile found, using fallback data");
        // Use fallback data if no personality profile exists
        const fallbackScores: Record<PersonalityKey, number> = {
          Openness: 7,
          Conscientiousness: 6,
          Extraversion: 5,
          Agreeableness: 8,
          Neuroticism: 4,
        };
        setTraitScores(fallbackScores);
        setPrimaryTrait("Agreeableness");
      }
    } catch (error: any) {
      console.error("Error fetching personality profile:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.log("Authentication error - using fallback data with warning");
        setError("Authentication token may have expired. Showing fallback profile data.");
      } else if (error.response?.status === 404) {
        console.log("Profile not found - using fallback data");
        setError("Personality profile not found. Showing fallback profile data.");
      } else if (error.message?.includes('network')) {
        console.log("Network error - using fallback data");
        setError("Network error. Showing fallback profile data.");
      } else {
        console.log("Unknown error - using fallback data");
        setError("Failed to load personality profile. Showing fallback profile data.");
      }

      // Use fallback data on error - but don't block the user from seeing their profile
      const fallbackScores: Record<PersonalityKey, number> = {
        Openness: 7,
        Conscientiousness: 6,
        Extraversion: 5,
        Agreeableness: 8,
        Neuroticism: 4,
      };
      setTraitScores(fallbackScores);
      setPrimaryTrait("Agreeableness");
      
      // Set a mock user profile so the UI can still render
      setUserProfile({
        id: 1,
        username: user?.username || 'Scholar',
        profile: {
          completion_type: 'survey',
          research_group: { condition: 'B' },
          has_completed_onboarding: true
        }
      } as any);
      
      // Clear the error after 5 seconds so the user can still use the app
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    setError(null); // Clear any existing errors
    fetchPersonalityProfile();
  };

  // Fetch personality profile from backend on mount
  useEffect(() => {
    fetchPersonalityProfile();
  }, []);

  // Refresh personality profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("PersonalityHomeScreen focused - refreshing profile data");
      fetchPersonalityProfile();
    }, [])
  );

  const currentBuild = PERSONALITY_BUILDS[primaryTrait];

  // Get personality tabs for the current personality type
  const personalityTabs = PERSONALITY_TABS[primaryTrait];

  // Guard: If tabs are not ready, show loading
  if (!personalityTabs || personalityTabs.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181A20' }}>
        <ActivityIndicator size="large" color="#4ee6e6" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading personality tabs...</Text>
      </View>
    );
  }

  // Set the default active tab to the first tab
  useEffect(() => {
    setActiveTab(personalityTabs[0].key);
  }, [primaryTrait]);

  // Handle tab selection and modal opening
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    
    // Open appropriate modal based on tab
    switch (tabKey) {
      case "codex":
        setIsCodexModalVisible(true);
        break;
      case "defender":
        setIsThoughtDefenderModalVisible(true);
        break;
      case "storys":
        // This will show the story catalog in the main content area
        break;
      case "entrance":
        // This will show the main personality content
        break;
      case "restoration":
        // This will show growth/progress content
        break;
    }
  };

  // Modal handlers
  const handleCodexModalClose = () => {
    setIsCodexModalVisible(false);
  };

  const handleCodexModalSave = (entry: any) => {
    console.log("Codex entry saved:", entry);
    // Handle saving codex entry
    Alert.alert("Entry Saved", "Your wisdom has been recorded in the Codex.");
  };

  const handleThoughtDefenderModalClose = () => {
    setIsThoughtDefenderModalVisible(false);
  };

  const handleThoughtDefenderScoreUpdate = (data: { score: number; level: number; won: boolean }) => {
    console.log("Thought Defender score update:", data);
    // Handle thought defender completion
    Alert.alert(
      "Mind Defense Complete!",
      `Score: ${data.score}\nLevel: ${data.level}\n${data.won ? "Victory!" : "Good effort!"}`
    );
  };

  // Fetch and filter stories based on personality
  useEffect(() => {
    const fetchStories = async () => {
      // Check if current tab is the stories tab
      const isStoriesTab = activeTab === "storys";

      if (!isStoriesTab) return;

      try {
        setIsLoadingStories(true);
        setStoryError(null);

        // Fetch available stories from backend using archiveService
        const availableStories = await apiService.getAvailableStories();
        setStories(availableStories);

        // Filter stories based on primary personality trait
        const filtered = availableStories.filter((story: any) => {
          // Check if story category matches personality preferences
          if (story.category && currentBuild.storyCategories.includes(story.category)) {
            return true;
          }

          // Check if story skillFocus matches personality themes
          if (story.skillFocus && Array.isArray(story.skillFocus)) {
            const hasMatchingSkill = story.skillFocus.some((skill: any) => 
              currentBuild.storyThemes.includes(skill.toLowerCase())
            );
            if (hasMatchingSkill) return true;
          }

          // Check if story description contains personality-relevant keywords
          const description = story.description?.toLowerCase() || "";
          const hasRelevantKeywords = currentBuild.storyThemes.some(theme =>
            description.includes(theme.toLowerCase())
          );
          if (hasRelevantKeywords) return true;

          // Check if story atmosphere matches personality themes
          if (story.atmosphere) {
            const atmosphere = story.atmosphere.toLowerCase();
            const hasMatchingAtmosphere = currentBuild.storyThemes.some(theme =>
              atmosphere.includes(theme.toLowerCase())
            );
            if (hasMatchingAtmosphere) return true;
          }

          // If no specific matches, include stories that might be generally suitable
          return story.difficulty === "Beginner" || story.difficulty === "Intermediate";
        });

        setFilteredStories(filtered);
        console.log(`Filtered ${filtered.length} stories for ${primaryTrait} personality`);
      } catch (error: any) {
        console.error("Error fetching stories:", error);
        setStoryError("Failed to load stories. Please try again.");
        setFilteredStories([]);
      } finally {
        setIsLoadingStories(false);
      }
    };

    fetchStories();
  }, [activeTab, primaryTrait]);

  // Story selection handler
  const handleStorySelect = (story: Story) => {
    Alert.alert(
      `Start "${story.title}"?`,
      `This story is matched to your ${primaryTrait.toLowerCase()} personality. Ready to begin your journey?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Begin Story", 
          style: "default",
          onPress: () => {
            // TODO: Navigate to story screen
            console.log("Starting story:", story);
            Alert.alert("Story Navigation", "Story navigation will be implemented next!");
          }
        }
      ]
    );
  };

  // Story handlers similar to CharacterHomeScreen
  const handleOpenStory = async (story: any) => {
    try {
      console.log("=== handleOpenStory called ===");
      console.log("Story data:", story);
      console.log("Story ID:", story?.id);
      console.log("Story title:", story?.title);
      console.log("Chapter count:", story?.chapter_count);

      // Check if story has chapters
      if (story?.chapter_count && story.chapter_count > 0) {
        // Chapter-based story - show chapter selection
        setSelectedStory(story);
        setIsChapterScreenVisible(true);
      } else {
        // Non-chapter story - open directly
        await handleDirectStoryOpen(story);
      }
    } catch (error) {
      console.error("Error in handleOpenStory:", error);
      Alert.alert("Error", "Failed to open story. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };

  const handleDirectStoryOpen = async (story: any) => {
    try {
      if (!story?.id) {
        console.error("Story is undefined or missing id:", story);
        Alert.alert("Error", "Invalid story data. Please try again.", [
          { text: "OK", style: "default" },
        ]);
        return;
      }
      
      // Get story passages from backend
      const storypassages = await apiService.getStorypassages(story.id);
      if (storypassages) {
        // Get user's progress for this story
        const progressRecords = await apiService.getStoryProgressRecords(String(story.id));
        console.log("User progress for story:", progressRecords);
        
        // Calculate exploration percentage based on progress
        let exploration = 0;
        if (progressRecords.length > 0) {
          const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
          const totalPassages = storypassages.passages?.length || 1;
          exploration = Math.round((uniquePassages.size / totalPassages) * 100);
        }
        
        // Update story with progress information
        const storyWithProgress = {
          ...story,
          passages: storypassages,
          exploration: exploration
        };
        
        setSelectedStory(storyWithProgress);
        setIsStoryVisible(true);
      } else {
        Alert.alert(
          "No passages Available",
          "This story does not have any passages yet.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error opening story:", error);
      Alert.alert("Error", "Failed to load story passages. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      console.log("=== handleChapterSelect called ===");
      console.log("Chapter ID:", chapterId);
      console.log("Selected story:", selectedStory);

      setIsChapterScreenVisible(false);

      if (selectedStory?.id) {
        console.log("Opening story with chapter:", selectedStory.id, "chapter:", chapterId);

        const storypassages = await apiService.getStorypassagesFromChapter(
          selectedStory.id,
          chapterId
        );

        if (storypassages) {
          const progressRecords = await apiService.getStoryProgressRecords(String(selectedStory.id));
          
          let exploration = 0;
          if (progressRecords.length > 0) {
            const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
            const totalPassages = storypassages.passages?.length || 1;
            exploration = Math.round((uniquePassages.size / totalPassages) * 100);
          }

          const storyWithChapter = {
            ...selectedStory,
            passages: storypassages,
            exploration: exploration
          };

          setSelectedStory(storyWithChapter);
          setIsStoryVisible(true);
        } else {
          Alert.alert(
            "No passages Available",
            "This chapter does not have any passages yet.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        Alert.alert("Error", "No story selected. Please try again.", [
          { text: "OK", style: "default" },
        ]);
      }
    } catch (error) {
      console.error("Error opening chapter:", error);
      Alert.alert("Error", "Failed to load chapter passages. Please try again.", [
        { text: "OK", style: "default" }]
      );
    }
  };

  const handleCloseStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
  };

  const handleStoryComplete = async (completionData: {
    storyId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: { [key: string]: number };
  }) => {
    try {
      setIsStoryVisible(false);
      setSelectedStory(null);

      // Try to save completion to backend
      if (characterId) {
        await apiService.completeStory(
          characterId,
          [completionData.storyId],
          [completionData.storyId],
          {
            finalRewards: completionData.finalRewards.map(Number)[0], // Take first number
            skillsLearned: completionData.skillsLearned.map(Number)[0], // Take first number 
            totalStatGains: Object.values(completionData.totalStatGains).reduce((sum, value) => sum + value, 0),
          }
        );
      }

      Alert.alert(
        "📚 Story Mastered! ✨",
        `Your journey has transformed your understanding.`,
        [{ text: "Continue Exploring", style: "default" }]
      );
    } catch (error) {
      Alert.alert(
        "📚 Story Mastered! ✨",
        `Your journey has transformed your understanding.`,
        [{ text: "Continue Exploring", style: "default" }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.personalityCentered}>
        <ActivityIndicator size="large" color="#4ee6e6" />
        <Text style={{ color: "#fff", marginTop: 16 }}>
          Loading your personality profile...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#181A20" }}>
        <StatusBar barStyle="light-content" backgroundColor="#181A20" />
        
        {/* Error banner at the top */}
        <View style={{
          backgroundColor: "#ff6b6b",
          padding: 12,
          margin: 16,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ color: "#fff", flex: 1, fontSize: 14 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => setError(null)}
            style={{ padding: 4 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Continue with the rest of the UI */}
        <PersonalizedArchiveHeader 
          primaryTrait={primaryTrait}
          userProfile={userProfile}
          traitScores={traitScores}
          theme={theme}
          devMode={devMode}
          showPersonalitySwitcher={showPersonalitySwitcher}
          setShowPersonalitySwitcher={setShowPersonalitySwitcher}
          switchPersonality={switchPersonality}
          activeTab={activeTab}
          setActiveTab={handleTabPress}
          allTabs={personalityTabs}
          globalStyles={globalStyles}
        />

        {/* Rest of the content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {activeTab === "entrance" && (
            <View>
              <RPGHomeAdditions 
                primaryTrait={primaryTrait} 
                characterData={{
                  name: userProfile?.username || 'Scholar',
                  level: Math.floor((traitScores[primaryTrait] || 5) / 2) + 1,
                  experience: (traitScores[primaryTrait] || 5) * 100,
                  experience_needed_for_next_level: 1000,
                  experience_progress_percentage: ((traitScores[primaryTrait] || 5) * 100) % 1000 / 10,
                  memories_explored: 0,
                  coping_skills_learned: Math.min(2, 3),
                  insights_discovered: 1,
                  coping_tools: []
                }}
                globalStyles={globalStyles}
              />
              
              <View style={globalStyles.personalityMoodBubble}>
                <Text style={globalStyles.personalityMoodText}>
                  {`"Ready to explore your story as a ${PersonalityConfigs[primaryTrait].scholarClass}..."`}
                </Text>
              </View>
              <WellnessAttributesDisplay
                personalityType={primaryTrait}
                personalityScores={traitScores}
                globalStyles={globalStyles}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#181A20" }}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      
      {/* New Personalized Archive Header */}
      <PersonalizedArchiveHeader 
        primaryTrait={primaryTrait}
        userProfile={userProfile}
        traitScores={traitScores}
        theme={theme}
        devMode={devMode}
        showPersonalitySwitcher={showPersonalitySwitcher}
        setShowPersonalitySwitcher={setShowPersonalitySwitcher}
        switchPersonality={switchPersonality}
        activeTab={activeTab}
        setActiveTab={handleTabPress}
        allTabs={personalityTabs}
        globalStyles={globalStyles}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 120,
          right: 20,
          backgroundColor: '#4ee6e6',
          borderRadius: 20,
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onPress={handleRefresh}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>🔄</Text>
      </TouchableOpacity>

      {/* Tab Content - keyed by personality tab */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {activeTab === "entrance" && (
          <View>
            {/* RPG-Style Components */}
            <RPGHomeAdditions 
              primaryTrait={primaryTrait} 
              characterData={{
                name: userProfile?.username || 'Scholar',
                level: Math.floor((traitScores[primaryTrait] || 5) / 2) + 1,
                experience: (traitScores[primaryTrait] || 5) * 100,
                experience_needed_for_next_level: 1000,
                experience_progress_percentage: ((traitScores[primaryTrait] || 5) * 100) % 1000 / 10,
                memories_explored: 0,
                coping_skills_learned: Math.min(2, 3),
                insights_discovered: 1,
                coping_tools: []
              }}
              globalStyles={globalStyles}
            />
            
            {/* Original Content */}
            <View style={globalStyles.personalityMoodBubble}>
              <Text style={globalStyles.personalityMoodText}>
                {`"Ready to explore your story as a ${currentBuild.class}..."`}
              </Text>
            </View>
            <WellnessAttributesDisplay
              personalityType={primaryTrait}
              personalityScores={traitScores}
              globalStyles={globalStyles}
            />
          </View>
        )}
        
        {activeTab === "storys" && (
          <PersonalityStoryCatalog
            primaryTrait={primaryTrait}
            onStorySelect={handleOpenStory}
            globalStyles={globalStyles}
          />
        )}
        
        {activeTab === "codex" && (
          <View>
            <Text style={globalStyles.personalitySectionTitle}>
              {personalityTabs.find(tab => tab.key === "codex")?.label} - {PersonalityConfigs[primaryTrait].scholarClass}
            </Text>
            <Text style={{ color: "#fff", marginTop: 20, textAlign: "center" }}>
              Tap the Codex tab above to open your wisdom journal
            </Text>
          </View>
        )}
        
        {activeTab === "defender" && (
          <View>
            <Text style={globalStyles.personalitySectionTitle}>
              {personalityTabs.find(tab => tab.key === "defender")?.label} - Mind Defense
            </Text>
            <Text style={{ color: "#fff", marginTop: 20, textAlign: "center" }}>
              Tap the Defender tab above to start your mental training
            </Text>
          </View>
        )}
        
        {activeTab === "restoration" && (
          <View>
            <Text style={globalStyles.personalitySectionTitle}>Growth & Progress</Text>
            <CharacterProgression 
              characterData={{
                name: userProfile?.username || 'Scholar',
                level: Math.floor((traitScores[primaryTrait] || 5) / 2) + 1,
                experience: (traitScores[primaryTrait] || 5) * 100,
                experience_needed_for_next_level: 1000,
                experience_progress_percentage: ((traitScores[primaryTrait] || 5) * 100) % 1000 / 10,
                memories_explored: 0,
                coping_skills_learned: Math.min(2, 3),
                insights_discovered: 1,
                coping_tools: []
              }}
              primaryTrait={primaryTrait}
              globalStyles={globalStyles}
            />
          </View>
        )}
      </ScrollView>

      {/* Hidden Developer Mode Trigger - Tap the header title area 5 times */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: 'transparent',
        }}
        onPress={handleDevModeToggle}
      />

      {/* Codex Modal */}
      <CodexModal
        visible={isCodexModalVisible}
        onClose={handleCodexModalClose}
        onSave={handleCodexModalSave}
        unlockedAreas={["general", "personality", primaryTrait.toLowerCase()]}
      />

      {/* Thought Defender Modal */}
      <ThoughtDefenderModal
        visible={isThoughtDefenderModalVisible}
        onClose={handleThoughtDefenderModalClose}
        onScoreUpdate={handleThoughtDefenderScoreUpdate}
      />

      {/* Story Modal */}
      {selectedStory && (
        <StoryScreen
          visible={isStoryVisible}
          onClose={handleCloseStory}
          story={selectedStory as any}
          chapter={{ 
            id: 1, 
            title: selectedStory?.title || "Chapter 1",
            content: selectedStory?.description || "",
            chapter_number: 1,
            is_starting_chapter: true,
            variables: {},
            requirements: {},
            rewards: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passages: (selectedStory?.passages as any)?.passages || []
          } as any}
          passage={(selectedStory?.passages as any)?.passages?.[0] || {} as any}
          choices={(selectedStory?.passages as any)?.passages?.[0]?.choices || []}
          onStatGain={() => {}} // This would be handled by the master state
          onArtifactUnlock={(artifact: string) => {
            console.log("Artifact unlocked:", artifact);
          }}
          onSkillLearned={(skills: string[]) => {
            console.log("Skills learned:", skills);
          }}
          onStoryComplete={handleStoryComplete}
        />
      )}

      {/* Chapter Selection Modal */}
      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={String(selectedStory?.id || "")}
        storyTitle={selectedStory?.title || "Unknown Story"}
        onChapterSelect={handleChapterSelect}
      />
    </View>
  );
}