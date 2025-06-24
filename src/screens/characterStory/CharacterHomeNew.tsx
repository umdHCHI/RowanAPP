import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Import your existing types and services
import {
    baseOptions,
    bgOptions,
    clothesOptions,
    eyesOptions,
    hairOptions,
    mouthOptions,
} from '../../assets/characterOptions';
import ArchiveMapModal, { ArchiveArea } from '../../components/ArchiveMapModal';
import CodexModal from '../../components/CodexModal';
import ThoughtDefenderModal from '../../components/ThoughtDefenderModal';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { sampleInventory } from '../../data/sampleEquipment';
import { appearanceService } from '../../services/appearanceService';
import { createGlobalStyles } from '../../styles/globalStyles';
import { Appearance } from '../../types/appearance';
import { EquipmentItem, EquipmentType, EquippedItems } from '../../types/equipment';
import { Grimoire } from './StoryCatalogScreen';
import GrimoireScreen from './StoryScreen';

// Import availableGrimoires from StoryCatalogScreen
import { availableGrimoires } from './StoryCatalogScreen';

const { width, height } = Dimensions.get('window');

interface ArchiveFoundation {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  colors: string[];
  description: string;
  recentGain: number;
  nextUnlock: string;
  storyTriggers: string[];
}

interface MentalArtifact {
  name: string;
  type: string;
  equipped: boolean;
  resonance: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface MemoryChronicle {
  title: string;
  category: string;
  exploration: number;
  revelations: number;
  timeToComplete: string;
  difficulty: string;
  description: string;
  atmosphere: string;
  passages?: Array<{
    id: string;
    text: string;
    atmosphere?: string;
    choices: Array<{
      text: string;
      next: string | null;
      statEffects?: { [key: string]: number };
      description?: string;
      isEnding?: boolean;
    }>;
  }>;
}

const ArchiveInterface: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme);
  
  const [activeTab, setActiveTab] = useState('entrance');
  const [researchCondition, setResearchCondition] = useState<'character' | 'personality'>('character');
  const { onboardingState } = useOnboarding();
  const { authToken, characterId } = useAuth();
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const [inventory, setInventory] = useState<EquipmentItem[]>(sampleInventory);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [discoveredArtifacts, setDiscoveredArtifacts] = useState<MentalArtifact[]>([]);
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isThoughtDefenderVisible, setIsThoughtDefenderVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentMapRoomId, setCurrentMapRoomId] = useState('');
  
  // Story Screen state
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Grimoire | null>(null);
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());
  const [finalRewardsArtifacts, setFinalRewardsArtifacts] = useState<MentalArtifact[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  
  const restorationMetrics = {
    chroniclesExplored: completedStories.size,
    artifactsDiscovered: discoveredArtifacts.length + finalRewardsArtifacts.length,
    revelationsUnlocked: learnedSkills.length,
  };

  // Progress tracking for all activities
  const [codexEntries, setCodexEntries] = useState<Array<{
    id: string;
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
    timestamp: number;
  }>>([]);
  
  const [miniGameProgress, setMiniGameProgress] = useState({
    thoughtDefenderLevel: 0,
    thoughtDefenderScore: 0,
    thoughtDefenderWins: 0,
    drawingEntries: 0,
    totalGameTime: 0
  });

  // Calculate foundation values based on actual progress
  const calculateFoundationValues = () => {
    const baseValues = {
      'Sight Beyond Sight': 2,
      'Unbreakable Will': 2, 
      "Heart's Compass": 2,
      'Elemental Harmony': 2
    };

    // Add points from completed stories
    completedStories.forEach(storyId => {
      const story = availableGrimoires.find(g => g.id === storyId);
      if (story) {
        // Each completed story gives points to its skill focus areas
        story.skillFocus.forEach(skill => {
          if (skill.includes('Mindful') || skill.includes('Stress') || skill.includes('Academic')) {
            baseValues['Sight Beyond Sight'] += 3;
          }
          if (skill.includes('Self-Compassion') || skill.includes('Growth') || skill.includes('Inner Critic')) {
            baseValues['Unbreakable Will'] += 3;
          }
          if (skill.includes('Social') || skill.includes('Anxiety') || skill.includes('Authentic')) {
            baseValues["Heart's Compass"] += 3;
          }
          if (skill.includes('Balance') || skill.includes('Time') || skill.includes('Self-Care')) {
            baseValues['Elemental Harmony'] += 3;
          }
        });
      }
    });

    // Add points from codex entries (reflection/journal entries)
    codexEntries.forEach(entry => {
      // Each codex entry gives points based on skill category
      switch (entry.skillCategory) {
        case 'awareness':
        case 'mindfulness':
          baseValues['Sight Beyond Sight'] += 2;
          break;
        case 'resilience':
        case 'perseverance':
          baseValues['Unbreakable Will'] += 2;
          break;
        case 'connection':
        case 'empathy':
          baseValues["Heart's Compass"] += 2;
          break;
        case 'balance':
        case 'harmony':
          baseValues['Elemental Harmony'] += 2;
          break;
        default:
          // Give small points to all foundations for general reflection
          Object.keys(baseValues).forEach(key => {
            baseValues[key as keyof typeof baseValues] += 1;
          });
      }
    });

    // Add points from mini-game achievements
    if (miniGameProgress.thoughtDefenderWins > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderWins * 2;
      baseValues['Sight Beyond Sight'] += miniGameProgress.thoughtDefenderWins;
    }
    
    if (miniGameProgress.thoughtDefenderLevel > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderLevel;
    }

    if (miniGameProgress.drawingEntries > 0) {
      baseValues['Elemental Harmony'] += miniGameProgress.drawingEntries * 2;
      baseValues["Heart's Compass"] += miniGameProgress.drawingEntries;
    }

    // Cap all values at maxValue (20)
    Object.keys(baseValues).forEach(key => {
      baseValues[key as keyof typeof baseValues] = Math.min(20, baseValues[key as keyof typeof baseValues]);
    });

    return baseValues;
  };

  // Archive Foundation Stats - Now dynamically calculated
  const [archiveFoundations, setArchiveFoundations] = useState<ArchiveFoundation[]>([
    {
      icon: '👁️',
      label: 'Sight Beyond Sight',
      value: 2,
      maxValue: 20,
      colors: ['#3B82F6', '#06B6D4'] as const,
      description: 'Your ability to perceive hidden truths and see through illusions of the mind',
      recentGain: 0,
      nextUnlock: 'Enhanced Perception - See through deceptive thoughts',
      storyTriggers: ['mindfulness_practice', 'reflection_moments', 'self_awareness_choices']
    },
    {
      icon: '⚓',
      label: 'Unbreakable Will',
      value: 2,
      maxValue: 20,
      colors: ['#059669', '#10B981'] as const,
      description: 'The fortified strength of your spirit against the storms of adversity',
      recentGain: 0,
      nextUnlock: 'Iron Resolve - Resist overwhelming stress',
      storyTriggers: ['perseverance_choices', 'facing_fears', 'overcoming_obstacles']
    },
    {
      icon: '🔗',
      label: "Heart's Compass",
      value: 2,
      maxValue: 20,
      colors: ['#DC2626', '#F472B6'] as const,
      description: 'Your power to forge meaningful bonds and navigate the realm of emotions',
      recentGain: 0,
      nextUnlock: 'Empathic Mastery - Deep emotional understanding',
      storyTriggers: ['connection_choices', 'helping_others', 'vulnerability_moments']
    },
    {
      icon: '⚖️',
      label: 'Elemental Harmony',
      value: 2,
      maxValue: 20,
      colors: ['#D97706', '#FCD34D'] as const,
      description: 'Mastery over the delicate balance between all aspects of your existence',
      recentGain: 0,
      nextUnlock: 'Life Equilibrium - Perfect work-life balance',
      storyTriggers: ['balance_choices', 'priority_setting', 'self_care_actions']
    },
  ]);

  // Update foundation values whenever progress changes
  useEffect(() => {
    const newValues = calculateFoundationValues();
    
    setArchiveFoundations(prev => prev.map(foundation => {
      const newValue = newValues[foundation.label as keyof typeof newValues] || foundation.value;
      const recentGain = newValue - foundation.value;
      
      return {
        ...foundation,
        value: newValue,
        recentGain: recentGain > 0 ? recentGain : 0,
        nextUnlock: getNextUnlock(foundation.label, newValue)
      };
    }));
  }, [completedStories, codexEntries, miniGameProgress]);

  // Helper function to get next unlock description
  const getNextUnlock = (foundationLabel: string, currentValue: number) => {
    const nextLevel = Math.floor(currentValue / 5) + 1;
    const unlocks = {
      'Sight Beyond Sight': [
        'Enhanced Perception - See through deceptive thoughts',
        'Mindful Awareness - Present moment clarity',
        'Pattern Recognition - Identify thought cycles',
        'Truth Sight - Distinguish reality from illusion'
      ],
      'Unbreakable Will': [
        'Iron Resolve - Resist overwhelming stress',
        'Steadfast Determination - Maintain focus under pressure',
        'Unshakeable Core - Weather emotional storms',
        'Indomitable Spirit - Rise above all challenges'
      ],
      "Heart's Compass": [
        'Empathic Mastery - Deep emotional understanding',
        'Connection Wisdom - Navigate relationships skillfully',
        'Compassionate Leadership - Guide others with heart',
        'Universal Love - Embrace all beings with kindness'
      ],
      'Elemental Harmony': [
        'Life Equilibrium - Perfect work-life balance',
        'Flow State Mastery - Effortless action and presence',
        'Cosmic Alignment - Harmony with universal forces',
        'Transcendent Balance - Beyond duality and conflict'
      ]
    };
    
    const foundationUnlocks = unlocks[foundationLabel as keyof typeof unlocks];
    return foundationUnlocks?.[nextLevel - 1] || 'Mastery achieved';
  };

  // Mental Artifacts (transformed coping tools)
  const mentalArtifacts: MentalArtifact[] = [
    {
      name: 'Clarity Lens of Mindful Sight',
      type: 'Focus Relic',
      equipped: true,
      resonance: 85,
      description: 'An ancient crystalline lens that sharpens awareness of present moment thoughts',
      rarity: 'Legendary',
    },
    {
      name: 'Sanctuary Shroud of Comfort',
      type: 'Comfort Codex',
      equipped: false,
      resonance: 78,
      description: 'A weathered grimoire that wraps the mind in protective solace',
      rarity: 'Rare',
    },
    {
      name: 'Guardian Ward of Boundaries',
      type: 'Protective Seal',
      equipped: true,
      resonance: 92,
      description: 'An ethereal barrier that shields against overwhelming external pressures',
      rarity: 'Epic',
    },
    {
      name: 'Foundation Stone of Grounding',
      type: 'Stability Anchor',
      equipped: false,
      resonance: 67,
      description: 'A mystical stone that connects consciousness to physical reality',
      rarity: 'Common',
    },
  ];





  // Import availableGrimoires from StoryCatalogScreen
  const [memoryGrimoires, setMemoryGrimoires] = useState<Grimoire[]>(availableGrimoires);

  // Create restoration metrics array from state
  const restorationMetricsArray = [
    { 
      icon: '📜', 
      label: 'Chronicles Explored', 
      value: `${restorationMetrics.chroniclesExplored}/12`, 
      description: 'Memory fragments fully integrated' 
    },
    { 
      icon: '💎', 
      label: 'Artifacts Discovered', 
      value: `${restorationMetrics.artifactsDiscovered}`, 
      description: 'Coping mechanisms crystallized into tools' 
    },
    { 
      icon: '🗝️', 
      label: 'Revelations Unlocked', 
      value: `${restorationMetrics.revelationsUnlocked}`, 
      description: 'Hidden chambers of self-knowledge opened' 
    },
  ];

  useEffect(() => {
    const loadAppearance = async () => {
      try {
        if (authToken && characterId) {
          const data = await appearanceService.getAppearance(Number(characterId));
          setAppearance(data);
        } else if (onboardingState.appearance) {
          setAppearance(onboardingState.appearance);
        }
      } catch (error) {
        console.error('Failed to load appearance from API, using fallback:', error);
        // If API fails, use onboarding state as a fallback or a default
        if (onboardingState.appearance) {
          setAppearance(onboardingState.appearance);
        } else {
          // You might want to set a default appearance here if onboarding one isn't available
          console.log("No fallback appearance found in onboarding state.");
        }
      }
    };

    loadAppearance();
  }, [authToken, characterId, onboardingState.appearance]);

  // A placeholder for the actual icon retrieval logic
  const getItemIcon = (item: EquipmentItem) => {
    // This should be replaced with actual logic to get the icon
    return require('../../../assets/equipment/armor/fb1857.png');
  };

  const getRarityColors = (rarity: string): string[] => {
    switch (rarity) {
      case 'Legendary': return ['#F97316', '#FCD34D'];
      case 'Epic': return ['#A855F7', '#F472B6'];
      case 'Rare': return ['#3B82F6', '#06B6D4'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  // Handle stat gains from story choices
  const handleStatGain = (statName: string, amount: number) => {
    setArchiveFoundations(prev => prev.map(foundation =>
      foundation.label === statName
        ? {
            ...foundation,
            value: Math.min(foundation.maxValue, foundation.value + amount),
            recentGain: (foundation.recentGain || 0) + amount
          }
        : foundation
    ));
  };
  const getGrimoireData = (storyId: string) => {
    // Map your story IDs to grimoire data
    if (storyId === '1') {
      return GrimoireScreen; // or import this from GrimoireScreen
    }
    // Add other story mappings
    return null;
  };
  // Handle opening a story/grimoire
  const handleOpenGrimoire = (grimoire: Grimoire) => {
    setSelectedStory(grimoire);
    setIsStoryVisible(true);
  };

  // Handle closing story and updating exploration progress
  const handleCloseStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
    if (selectedStory) {
      setMemoryGrimoires(prev => prev.map(grimoire =>
        grimoire.id === selectedStory.id
          ? { ...grimoire, exploration: Math.min(100, (grimoire.exploration || 0) + 25) }
          : grimoire
      ));
    }
  };

  // Handle story completion
  const handleStoryComplete = (completionData: {
    grimoireId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }) => {
    // 1. Close modal
    setIsStoryVisible(false);
    setSelectedStory(null);

    // 2. Mark story as completed and set progress to 100%
    setCompletedStories(prev => new Set([...prev, completionData.grimoireId]));
    setMemoryGrimoires(prev => prev.map(grimoire =>
      grimoire.id === completionData.grimoireId
        ? { ...grimoire, exploration: 100 }
        : grimoire
    ));

    // 3. Add final rewards as artifacts
    const newArtifacts: MentalArtifact[] = completionData.finalRewards.map((reward, index) => ({
      name: reward,
      type: 'Completion Reward',
      equipped: false,
      resonance: 85 + (index * 5), // Varying resonance based on order
      description: `Awarded for completing the grimoire journey`,
      rarity: 'Epic' as const,
    }));
    setFinalRewardsArtifacts(prev => [...prev, ...newArtifacts]);

    // 4. Add learned skills to wisdom
    setLearnedSkills(prev => [...prev, ...completionData.skillsLearned]);
  };

  // Handle codex entry (reflection/journal entry)
  const handleCodexEntry = (entry: {
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: Date.now(),
    };
    
    setCodexEntries(prev => [...prev, newEntry]);
    
    // Show feedback to player
    Alert.alert(
      '📝 Reflection Recorded',
      `Your ${entry.skillCategory} reflection has been added to the Archive.\n\nFoundation values updated based on your insights.`,
      [{ text: 'Continue Exploring', style: 'default' }]
    );
  };

  // Handle mini-game completion
  const handleMiniGameComplete = (gameType: 'thoughtDefender' | 'drawing', data: any) => {
    if (gameType === 'thoughtDefender') {
      setMiniGameProgress(prev => ({
        ...prev,
        thoughtDefenderLevel: Math.max(prev.thoughtDefenderLevel, data.level || 0),
        thoughtDefenderScore: Math.max(prev.thoughtDefenderScore, data.score || 0),
        thoughtDefenderWins: prev.thoughtDefenderWins + (data.won ? 1 : 0),
        totalGameTime: prev.totalGameTime + (data.gameTime || 0)
      }));
      
      if (data.won) {
        Alert.alert(
          '🏆 Mind Defense Victory!',
          `You've successfully defended your mind!\n\nLevel: ${data.level}\nScore: ${data.score}\n\nYour Unbreakable Will has grown stronger.`,
          [{ text: 'Excellent!', style: 'default' }]
        );
      }
    } else if (gameType === 'drawing') {
      setMiniGameProgress(prev => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1
      }));
      
      Alert.alert(
        '🎨 Creative Expression Recorded',
        'Your drawing has been added to the Archive.\n\nYour Elemental Harmony and Heart\'s Compass have grown stronger.',
        [{ text: 'Continue Creating', style: 'default' }]
      );
    }
  };

  const TabButton: React.FC<{
    title: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
  }> = ({ title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
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
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.archiveContainer}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.archiveBackground} />
      
      {/* Gothic Background */}
      <LinearGradient
        colors={[theme.archiveGradientStart, theme.archiveGradientMiddle, theme.archiveGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Atmospheric Overlay */}
      <View style={styles.atmosphericOverlay} />

      <View style={styles.archiveContent}>
        {/* Archive Header */}
        <View style={styles.archiveHeader}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.6)']}
            style={styles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={styles.archiveHeaderContent}>
              <View style={styles.archiveHeaderLeft}>
                <LinearGradient
                  colors={['#D97706', '#F97316', '#DC2626']}
                  style={styles.archiveHeaderIcon}
                >
                  <Icon name="book" size={20} color="white" />
                  <View style={styles.archiveHeaderIconOverlay}>
                    <Icon name="zap" size={12} color="#FCD34D" />
                  </View>
                </LinearGradient>
                <View style={styles.archiveHeaderTextContainer}>
                  <Text style={styles.archiveHeaderTitle}>The Archive</Text>
                  <Text style={styles.archiveHeaderSubtitle}>Keeper of Memory • Curator of Hidden Knowledge</Text>
                  <View style={styles.archiveStatusIndicator}>
                    <View style={styles.archiveStatusDot} />
                    <Text style={styles.archiveStatusText}>Archive systems active</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.archiveSecondaryButton}
                onPress={() => setResearchCondition(researchCondition === 'character' ? 'personality' : 'character')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={researchCondition === 'character' 
                    ? ['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']
                    : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']
                  }
                  style={styles.archiveSecondaryButtonGradient}
                >
                  <Icon name="shuffle" size={14} color="#FCD34D" />
                  <Text style={styles.archiveSecondaryButtonText}>Switch Paradigm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.archiveTabContainer}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.8)']}
            style={styles.archiveTabGradient}
          >
            <BlurView intensity={20} style={styles.archiveTabContent}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.archiveTabScrollContent}
              >
                <TabButton title="Entrance Hall" icon="home" isActive={activeTab === 'entrance'} onPress={() => setActiveTab('entrance')} />
                <TabButton title="Ancient Grimoires" icon="book-open" isActive={activeTab === 'tomes'} onPress={() => setActiveTab('tomes')} />
                <TabButton title="Codex" icon="edit-3" isActive={activeTab === 'codex'} onPress={() => setActiveTab('codex')} />
                <TabButton title="Mind Defender" icon="zap" isActive={activeTab === 'defender'} onPress={() => setActiveTab('defender')} />
                <TabButton title="Memory Map" icon="map" isActive={activeTab === 'map'} onPress={() => setActiveTab('map')} />
                <TabButton title="Restoration" icon="award" isActive={activeTab === 'restoration'} onPress={() => setActiveTab('restoration')} />
              </ScrollView>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.archiveTabContentContainer} showsVerticalScrollIndicator={false}>
          
          {/* Entrance Hall Tab */}
          {activeTab === 'entrance' && (
            <View style={styles.tabContentArea}>
              
              {/* Avatar Showcase Section */}
              <View style={styles.avatarShowcaseSection}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
                  style={styles.avatarShowcaseGradient}
                >
                  {/* Header */}
                  <View style={styles.avatarShowcaseHeader}>
                    <Icon name="user" size={20} color="#A855F7" />
                    <Text style={styles.avatarShowcaseTitle}>Avatar Manifestation</Text>
                    <Icon name="user" size={20} color="#A855F7" />
                  </View>
                  
                  {/* Character Info Bar */}
                  <View style={styles.characterInfoBar}>
                    <View style={styles.characterDetails}>
                      <Text style={styles.characterRarity}>Memory Archivist</Text>
                      <Text style={styles.characterClass}>Keeper of Hidden Knowledge</Text>
                      <Text style={styles.characterName}>Ira, the Seeker</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.researchConditionBadge}
                      onPress={() => setResearchCondition(researchCondition === 'character' ? 'personality' : 'character')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={researchCondition === 'character' 
                          ? ['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']
                          : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']
                        }
                        style={styles.researchConditionGradient}
                      >
                        <Text style={styles.researchConditionText}>
                          {researchCondition === 'character' ? '✦ Avatar Path ✦' : '⧫ Essence Path ⧫'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Main Character Display with Gear */}
                  <View style={styles.characterDisplaySection}>
                    {/* Left Gear Column */}
                    <View style={styles.gearColumn}>
                      {[
                        { type: 'focus' as EquipmentType, label: 'Clarity Relic', icon: '🔮' },
                        { type: 'comfort' as EquipmentType, label: 'Sanctuary Codex', icon: '📜' }
                      ].map((slot, i) => (
                        <TouchableOpacity 
                          key={i}
                          style={styles.gearSlot}
                          onPress={() => {/* Open equipment modal */}}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.7)']}
                            style={styles.gearSlotGradient}
                          >
                            {equippedItems[slot.type] ? (
                              <Image
                                source={getItemIcon(equippedItems[slot.type]!)}
                                style={styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.emptyGearSlot}>
                                <Text style={styles.gearSlotIcon}>{slot.icon}</Text>
                                <Text style={styles.gearSlotLabel}>{slot.label}</Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Central Character Display */}
                    <View style={styles.centralCharacterDisplay}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.3)']}
                        style={styles.characterFrame}
                      >
                        <View style={styles.characterFrameInner}>
                          {appearance && (
                            <View style={styles.fullCharacterPreview}>
                              <Image source={bgOptions[appearance.background]} style={[styles.fullCharacterLayer, styles.backgroundLayer]} />
                              <Image source={baseOptions[appearance.skin]} style={styles.fullCharacterLayer} />
                              <Image source={hairOptions[appearance.hair]} style={styles.fullCharacterLayer} />
                              <Image source={clothesOptions[appearance.clothes]} style={styles.fullCharacterLayer} />
                              <Image source={eyesOptions[appearance.eyes]} style={styles.fullCharacterLayer} />
                              <Image source={mouthOptions[appearance.mouth]} style={styles.fullCharacterLayer} />
                            </View>
                          )}
                          
                          {/* Character Level and Status */}
                          <View style={styles.characterLevelBadge}>
                            <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.levelBadgeGradient}>
                              <Text style={styles.levelBadgeText}>Lv.3</Text>
                            </LinearGradient>
                          </View>
                          
                          {/* Essence Resonance Indicator */}
                          <View style={styles.essenceResonanceIndicator}>
                            <LinearGradient
                              colors={['rgba(139, 92, 246, 0.8)', 'rgba(79, 70, 229, 0.8)']}
                              style={styles.essenceResonanceGradient}
                            >
                              <Icon name="zap" size={12} color="#FCD34D" />
                              <Text style={styles.essenceResonanceText}>87% Resonance</Text>
                            </LinearGradient>
                          </View>
                        </View>
                      </LinearGradient>
                      
                      {/* Character Mood Bubble */}
                      <View style={styles.characterMoodBubble}>
                        <LinearGradient
                          colors={['#FEF3C7', '#FDE68A']}
                          style={styles.moodBubbleGradient}
                        >
                          <Text style={styles.moodBubbleText}>
                            "Ready to explore the depths of memory..."
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>

                    {/* Right Gear Column */}
                    <View style={styles.gearColumn}>
                      {[
                        { type: 'shield' as EquipmentType, label: 'Guardian Ward', icon: '🛡️' },
                        { type: 'ground' as EquipmentType, label: 'Foundation Stone', icon: '⚓' }
                      ].map((slot, i) => (
                        <TouchableOpacity 
                          key={i}
                          style={styles.gearSlot}
                          onPress={() => {/* Open equipment modal */}}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['rgba(51, 65, 85, 0.9)', 'rgba(30, 41, 59, 0.7)']}
                            style={styles.gearSlotGradient}
                          >
                            {equippedItems[slot.type] ? (
                              <Image
                                source={getItemIcon(equippedItems[slot.type]!)}
                                style={styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.emptyGearSlot}>
                                <Text style={styles.gearSlotIcon}>{slot.icon}</Text>
                                <Text style={styles.gearSlotLabel}>{slot.label}</Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Research Condition Info */}
                  {researchCondition === 'personality' && (
                    <View style={styles.researchConditionInfo}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.3)', 'rgba(79, 70, 229, 0.3)']}
                        style={styles.researchConditionInfoGradient}
                      >
                        <Icon name="zap" size={16} color="#FCD34D" />
                        <Text style={styles.researchConditionInfoTitle}>Essence-Calibrated Avatar</Text>
                        <Text style={styles.researchConditionInfoText}>
                          Your avatar's manifestation has been shaped by the deepest readings of your psychological essence patterns
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </LinearGradient>
              </View>

              {/* Quick Actions Row */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#7C3AED', '#4F46E5', '#7C3AED']}
                    style={styles.quickActionGradient}
                  >
                    <Icon name="book-open" size={18} color="#E0E7FF" />
                    <Text style={styles.quickActionText}>Continue Chronicle</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.8)']}
                    style={styles.quickActionSecondaryGradient}
                  >
                    <Icon name="shield" size={18} color="#06B6D4" />
                    <Text style={styles.quickActionSecondaryText}>Archive Guardian</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Two Column Layout for Additional Info */}
              <View style={styles.twoColumnLayout}>

                {/* Archive Resonance Card */}
                <View style={styles.columnCard}>
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <Icon name="compass" size={16} color="#06B6D4" />
                      <Text style={styles.cardTitle}>Archive Resonance</Text>
                    </View>
                    
                    <View style={styles.resonanceContent}>
                      <View style={styles.speechBubble}>
                        <LinearGradient
                          colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                          style={styles.speechBubbleGradient}
                        >
                          <Icon name="moon" size={12} color="#06B6D4" />
                          <Text style={styles.speechText}>
                            "The corridors whisper with untold stories, their echoes growing stronger..."
                          </Text>
                        </LinearGradient>
                      </View>
                      
                      <View style={styles.statusList}>
                        <View style={styles.statusItem}>
                          <Icon name="clock" size={14} color="#3B82F6" />
                          <Text style={styles.statusItemText}>Last exploration: 2 hours ago</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Icon name="key" size={14} color="#FCD34D" />
                          <Text style={styles.statusItemText}>3 revelations await decoding</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Icon name="zap" size={14} color="#F97316" />
                          <Text style={styles.statusItemText}>Archive energy: Luminous</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Memory Map Card */}
                <View style={styles.columnCard}>
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <Icon name="map" size={16} color="#FCD34D" />
                      <Text style={styles.cardTitle}>Memory Cartography</Text>
                    </View>
                    
                    <View style={styles.mapContent}>
                      <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.8)']}
                          style={styles.mapButtonGradient}
                        >
                          <Icon name="map" size={16} color="#FCD34D" />
                          <Text style={styles.mapButtonText}>Explore Memory Map</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.8)']}
                          style={styles.mapButtonGradient}
                        >
                          <Icon name="book" size={16} color="#06B6D4" />
                          <Text style={styles.mapButtonText}>Open Codex</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.8)']}
                          style={styles.mapButtonGradient}
                        >
                          <Icon name="award" size={16} color="#A855F7" />
                          <Text style={styles.mapButtonText}>View Milestones</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Archive Foundations Section */}
              <View style={styles.foundationsSection}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.foundationsSectionGradient}
                >
                  <View style={styles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#10B981" />
                    <Text style={styles.foundationsTitle}>Archive Foundations</Text>
                    <Icon name="anchor" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.foundationsSubtitle}>
                    The ethereal pillars that support your mental architecture
                  </Text>
                  
                  <View style={styles.foundationsGrid}>
                    {archiveFoundations.map((foundation, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.foundationCard}
                        onPress={() => Alert.alert(
                          `${foundation.label} - Level ${Math.floor(foundation.value / 2) + 1}`,
                          `${foundation.description}\n\n🎯 Next Unlock (${foundation.value + (5 - foundation.value % 5)} pts): ${foundation.nextUnlock}\n\n📈 Improved through: ${foundation.storyTriggers.map(trigger => trigger.replace('_', ' ')).join(', ')}`
                        )}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.8)']}
                          style={styles.foundationCardGradient}
                        >
                          {/* Stat Icon and Recent Gain */}
                          <View style={styles.foundationIconContainer}>
                            <Text style={styles.foundationIcon}>{foundation.icon}</Text>
                            {foundation.recentGain > 0 && (
                              <View style={styles.recentGainBadge}>
                                <LinearGradient
                                  colors={['#10B981', '#34D399']}
                                  style={styles.recentGainGradient}
                                >
                                  <Text style={styles.recentGainText}>+{foundation.recentGain}</Text>
                                </LinearGradient>
                              </View>
                            )}
                          </View>
                          
                          {/* Stat Value and Level */}
                          <View style={styles.foundationValueContainer}>
                            <Text style={styles.foundationValue}>
                              {foundation.value}<Text style={styles.foundationMaxValue}>/{foundation.maxValue}</Text>
                            </Text>
                            <Text style={styles.foundationLevel}>
                              Level {Math.floor(foundation.value / 5) + 1}
                            </Text>
                          </View>
                          
                          {/* Progress Bar with XP-style segments */}
                          <View style={styles.foundationProgressContainer}>
                            <View style={styles.foundationProgressBar}>
                              <LinearGradient
                                colors={foundation.colors as any}
                                style={[styles.foundationProgressFill, { width: `${(foundation.value / foundation.maxValue) * 100}%` }]}
                              />
                              {/* XP segments */}
                              {[1, 2, 3, 4].map((segment, i) => (
                                <View 
                                  key={i} 
                                  style={[
                                    styles.xpSegment, 
                                    { left: `${(segment * 20)}%` },
                                    foundation.value >= segment * 4 && styles.xpSegmentActive
                                  ]} 
                                />
                              ))}
                            </View>
                            <Text style={styles.xpToNext}>
                              {5 - (foundation.value % 5)} XP to next unlock
                            </Text>
                          </View>
                          
                          {/* Stat Label */}
                          <Text style={styles.foundationLabel}>{foundation.label}</Text>
                          
                          {/* Power Description */}
                          <Text style={styles.foundationDescription}>{foundation.description}</Text>
                          
                          {/* Next Unlock Preview */}
                          <View style={styles.nextUnlockContainer}>
                            <Icon name="lock" size={10} color="#FCD34D" />
                            <Text style={styles.nextUnlockText}>{foundation.nextUnlock}</Text>
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
          {activeTab === 'tomes' && (
            <View style={styles.tabContentArea}>
              {memoryGrimoires.map((grimoire, index) => (
                <TouchableOpacity
                  key={index} 
                  style={styles.chronicleCard}
                  onPress={() => handleOpenGrimoire(grimoire)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)'] as const}
                    style={styles.chronicleGradient}
                  >
                    <View style={styles.chronicleTopBorder} />
                    
                    <View style={styles.chronicleHeader}>
                      <View style={styles.chronicleInfo}>
                        <Text style={styles.chronicleTitle}>{grimoire.title}</Text>
                        <View style={styles.chronicleBadges}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{grimoire.category}</Text>
                          </View>
                          <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyBadgeText}>{grimoire.difficulty}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.chronicleDescriptionContainer}>
                      <Text style={styles.chronicleDescription}>{grimoire.description}</Text>
                      <Text style={styles.chronicleAtmosphere}>✦ {grimoire.atmosphere} ✦</Text>
                    </View>
                    
                    <View style={styles.explorationContainer}>
                      <View style={styles.explorationHeader}>
                        <Icon name="compass" size={16} color="#06B6D4" />
                        <Text style={styles.explorationLabel}>Exploration Progress</Text>
                        <Text style={styles.explorationValue}>{grimoire.exploration}%</Text>
                      </View>
                      <View style={styles.explorationBar}>
                        <LinearGradient
                          colors={['#06B6D4', '#A855F7', '#4F46E5'] as const}
                          style={[styles.explorationFill, { width: `${grimoire.exploration}%` }]}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.chronicleStats}>
                      <View style={styles.chronicleStat}>
                        <Icon name="key" size={16} color="#FCD34D" />
                        <Text style={styles.chronicleStatText}>{grimoire.revelations} revelations</Text>
                      </View>
                      <View style={styles.chronicleStat}>
                        <Icon name="clock" size={16} color="#FB923C" />
                        <Text style={styles.chronicleStatText}>{grimoire.timeToComplete}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.chronicleButton}>
                      <LinearGradient
                        colors={['#7C3AED', '#4F46E5', '#7C3AED'] as const}
                        style={styles.chronicleButtonGradient}
                      >
                        <Icon name="book-open" size={18} color="#E0E7FF" />
                        <Text style={styles.chronicleButtonText}>
                          {completedStories.has(grimoire.id) 
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
          {activeTab === 'codex' && (
            <View style={styles.tabContentArea}>
              <View style={styles.centeredMessageContainer}>
                <Icon name="edit-3" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                <Text style={styles.centeredMessageTitle}>The Codex</Text>
                <Text style={styles.centeredMessageText}>
                  Your personal journal for reflections, insights, and tracking your journey of self-discovery.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsCodexVisible(true)}>
                  <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.primaryButtonGradient}>
                    <Icon name="book-open" size={18} color="#E0E7FF" />
                    <Text style={styles.primaryButtonText}>Open Your Journal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mind Defender Tab */}
          {activeTab === 'defender' && (
            <View style={styles.tabContentArea}>
              <View style={styles.centeredMessageContainer}>
                <Icon name="zap" size={40} color="#FCD34D" style={{ marginBottom: 16 }} />
                <Text style={styles.centeredMessageTitle}>Mind Defender</Text>
                <Text style={styles.centeredMessageText}>
                  A mini-game to train your focus and resilience against intrusive thoughts.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsThoughtDefenderVisible(true)}>
                  <LinearGradient colors={['#F97316', '#F59E0B']} style={styles.primaryButtonGradient}>
                    <Icon name="zap" size={18} color="#FEF3C7" />
                    <Text style={styles.primaryButtonText}>Play Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Memory Map Tab */}
          {activeTab === 'map' && (
            <View style={styles.tabContentArea}>
                <View style={styles.centeredMessageContainer}>
                    <Icon name="map" size={40} color="#06B6D4" style={{ marginBottom: 16 }} />
                    <Text style={styles.centeredMessageTitle}>Memory Map</Text>
                    <Text style={styles.centeredMessageText}>
                        Explore the vast archive of your mind, unlock new areas, and discover hidden wisdom.
                    </Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setIsMapVisible(true)}>
                        <LinearGradient colors={['#06B6D4', '#3B82F6']} style={styles.primaryButtonGradient}>
                            <Icon name="map" size={18} color="#E0E7FF" />
                            <Text style={styles.primaryButtonText}>Explore the Map</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
          )}

          {/* Restoration Tab */}
          {activeTab === 'restoration' && (
            <View style={styles.archiveTabContentArea}>
              {/* Dark Mode Toggle */}
              <View style={styles.archiveCard}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.archiveCardGradient}
                >
                  <View style={styles.archiveSectionHeader}>
                    <Icon name={themeMode === 'dark' ? 'moon' : 'sun'} size={20} color={theme.archiveAccent} />
                    <Text style={styles.archiveSectionTitle}>Archive Theme</Text>
                  </View>
                  <Text style={styles.archiveSectionSubtitle}>
                    Switch between light and dark modes to customize your Archive experience
                  </Text>
                  
                  <TouchableOpacity style={styles.archivePrimaryButton} onPress={toggleTheme}>
                    <LinearGradient
                      colors={themeMode === 'dark' 
                        ? ['#FCD34D', '#F59E0B'] 
                        : ['#1E1B4B', '#92400E']
                      }
                      style={styles.archivePrimaryButtonGradient}
                    >
                      <Icon name={themeMode === 'dark' ? 'sun' : 'moon'} size={18} color="#E0E7FF" />
                      <Text style={styles.archivePrimaryButtonText}>
                        Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              <View style={styles.archiveRestorationGrid}>
                {restorationMetricsArray.map((metric, index) => (
                  <View key={index} style={styles.archiveRestorationCard}>
                    <LinearGradient
                      colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                      style={styles.archiveRestorationCardGradient}
                    >
                      <Text style={styles.archiveRestorationIcon}>{metric.icon}</Text>
                      <Text style={styles.archiveRestorationLabel}>{metric.label}</Text>
                      <Text style={styles.archiveRestorationValue}>{metric.value}</Text>
                      <Text style={styles.archiveRestorationDescription}>{metric.description}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
              
              <View style={styles.restorationStatus}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.restorationStatusGradient}
                >
                  <View style={styles.restorationStatusHeader}>
                    <Icon name="book" size={20} color="#A855F7" />
                    <Text style={styles.restorationStatusTitle}>Archive Restoration Status</Text>
                  </View>
                  
                  <View style={styles.restorationStatusGrid}>
                    <View style={styles.restorationStatusCard}>
                      <Text style={styles.restorationStatusLabel}>Foundation Stability</Text>
                      <Text style={styles.restorationStatusValue}>Stable</Text>
                      <Text style={styles.restorationStatusSubtext}>Core systems functioning well</Text>
                    </View>
                    <View style={styles.restorationStatusCard}>
                      <Text style={styles.restorationStatusLabel}>Exploration Depth</Text>
                      <Text style={styles.restorationStatusValue}>
                        {Math.round((completedStories.size / availableGrimoires.length) * 100)}%
                      </Text>
                      <Text style={styles.restorationStatusSubtext}>Many chambers remain unexplored</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Progress Tracking Section */}
              <View style={styles.archiveProgressTrackingSection}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.archiveProgressTrackingGradient}
                >
                  <View style={styles.archiveProgressTrackingHeader}>
                    <Icon name="trending-up" size={20} color="#10B981" />
                    <Text style={styles.archiveProgressTrackingTitle}>Activity Progress Breakdown</Text>
                  </View>
                  
                  <View style={styles.archiveProgressTrackingContent}>
                    {/* Stories Completed */}
                    <View style={styles.archiveProgressTrackingItem}>
                      <View style={styles.archiveProgressTrackingItemHeader}>
                        <Icon name="book-open" size={16} color="#06B6D4" />
                        <Text style={styles.archiveProgressTrackingItemTitle}>Stories Completed</Text>
                        <Text style={styles.archiveProgressTrackingItemValue}>{completedStories.size}</Text>
                      </View>
                      <Text style={styles.archiveProgressTrackingItemDescription}>
                        Each completed story strengthens your foundations based on its focus areas
                      </Text>
                    </View>

                    {/* Codex Entries */}
                    <View style={styles.archiveProgressTrackingItem}>
                      <View style={styles.archiveProgressTrackingItemHeader}>
                        <Icon name="edit-3" size={16} color="#A855F7" />
                        <Text style={styles.archiveProgressTrackingItemTitle}>Reflection Entries</Text>
                        <Text style={styles.archiveProgressTrackingItemValue}>{codexEntries.length}</Text>
                      </View>
                      <Text style={styles.archiveProgressTrackingItemDescription}>
                        Personal reflections and journal entries contribute to foundation growth
                      </Text>
                    </View>

                    {/* Mini-Game Achievements */}
                    <View style={styles.archiveProgressTrackingItem}>
                      <View style={styles.archiveProgressTrackingItemHeader}>
                        <Icon name="zap" size={16} color="#FCD34D" />
                        <Text style={styles.archiveProgressTrackingItemTitle}>Mind Defense Wins</Text>
                        <Text style={styles.archiveProgressTrackingItemValue}>{miniGameProgress.thoughtDefenderWins}</Text>
                      </View>
                      <Text style={styles.archiveProgressTrackingItemDescription}>
                        Successfully defending your mind strengthens Unbreakable Will
                      </Text>
                    </View>

                    {/* Drawing Entries */}
                    <View style={styles.archiveProgressTrackingItem}>
                      <View style={styles.archiveProgressTrackingItemHeader}>
                        <Icon name="image" size={16} color="#F472B6" />
                        <Text style={styles.archiveProgressTrackingItemTitle}>Creative Expressions</Text>
                        <Text style={styles.archiveProgressTrackingItemValue}>{miniGameProgress.drawingEntries}</Text>
                      </View>
                      <Text style={styles.archiveProgressTrackingItemDescription}>
                        Creative activities enhance Elemental Harmony and Heart's Compass
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* MOVED FROM ARTIFACTS TAB */}
              <View style={[styles.artifactsSection, {marginTop: 24}]}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.artifactsSectionGradient}
                >
                  <View style={styles.artifactsHeader}>
                    <Icon name="star" size={20} color="#A855F7" />
                    <Text style={styles.artifactsTitle}>Mental Artifacts Collection</Text>
                    <Icon name="star" size={20} color="#A855F7" />
                  </View>
                  <Text style={styles.artifactsSubtitle}>
                    Crystallized coping mechanisms and wisdom gathered from the depths of memory
                  </Text>
                  
                  <View style={styles.artifactsGrid}>
                    {[...mentalArtifacts, ...finalRewardsArtifacts, ...discoveredArtifacts].map((artifact, index) => (
                      <View key={index} style={styles.artifactCard}>
                        <LinearGradient
                          colors={['rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.6)', 'rgba(51, 65, 85, 0.8)']}
                          style={styles.artifactCardGradient}
                        >
                          <View style={styles.artifactHeader}>
                            <View style={styles.artifactInfo}>
                              <Text style={styles.artifactName}>{artifact.name}</Text>
                              <View style={styles.artifactBadges}>
                                <View style={styles.typeBadge}>
                                  <Text style={styles.typeBadgeText}>{artifact.type}</Text>
                                </View>
                                <LinearGradient
                                  colors={getRarityColors(artifact.rarity) as any}
                                  style={styles.rarityBadge}
                                >
                                  <Text style={styles.rarityBadgeText}>{artifact.rarity}</Text>
                                </LinearGradient>
                              </View>
                            </View>
                            
                            <View style={[styles.statusBadge, artifact.equipped && styles.equippedBadge]}>
                              <Text style={[styles.statusItemText, artifact.equipped && styles.equippedText]}>
                                {artifact.equipped ? '⟡ Attuned ⟡' : 'Available'}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={styles.artifactDescriptionContainer}>
                            <Text style={styles.artifactDescription}>{artifact.description}</Text>
                          </View>
                          
                          <View style={styles.resonanceContainer}>
                            <View style={styles.resonanceHeader}>
                              <Icon name="zap" size={14} color="#FCD34D" />
                              <Text style={styles.resonanceLabel}>Resonance</Text>
                              <Text style={styles.resonanceValue}>{artifact.resonance}%</Text>
                            </View>
                            <View style={styles.resonanceBar}>
                              <LinearGradient
                                colors={getRarityColors(artifact.rarity) as any}
                                style={[styles.resonanceFill, { width: `${artifact.resonance}%` }]}
                              />
                            </View>
                          </View>
                          
                          <TouchableOpacity style={styles.artifactButton} activeOpacity={0.8}>
                            <LinearGradient
                              colors={artifact.equipped 
                                ? ['#374151', '#4B5563'] 
                                : ['#7C3AED', '#4F46E5']
                              }
                              style={styles.artifactButtonGradient}
                            >
                              <Text style={styles.artifactButtonText}>
                                {artifact.equipped ? 'Release Attunement' : 'Attune Artifact'}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>

              {/* MOVED FROM WISDOM TAB */}
              <View style={[styles.wisdomSection, {marginTop: 24}]}>
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.9)']}
                  style={styles.wisdomSectionGradient}
                >
                  <View style={styles.wisdomHeader}>
                    <Icon name="cpu" size={20} color="#A855F7" />
                    <Text style={styles.wisdomTitle}>
                      {researchCondition === 'personality' ? 'Essence Analysis Results' : 'Avatar Development Insights'}
                    </Text>
                  </View>
                  <Text style={styles.wisdomSubtitle}>
                    {researchCondition === 'personality' 
                      ? 'Deep readings of your psychological essence patterns'
                      : 'Wisdom emerging from your character\'s journey through memory'
                    }
                  </Text>
                  
                  {researchCondition === 'personality' ? (
                    <View style={styles.wisdomContent}>
                      {[
                        { trait: 'Introversion Depth', score: 72, guidance: 'Your archive thrives in solitary exploration - honor this sacred space' },
                        { trait: 'Stress Echo Patterns', score: 45, guidance: 'Progressive unwinding techniques align with your mental architecture' },
                        { trait: 'Connection Frequencies', score: 88, guidance: 'Your network of memory threads runs strong - weave them wisely' }
                      ].map((insight, index) => (
                        <View key={index} style={styles.insightCard}>
                          <LinearGradient
                            colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                            style={styles.insightCardGradient}
                          >
                            <View style={styles.insightHeader}>
                              <Text style={styles.insightTrait}>{insight.trait}</Text>
                              <View style={styles.clarityBadge}>
                                <Text style={styles.clarityBadgeText}>{insight.score}% Clarity</Text>
                              </View>
                            </View>
                            <View style={styles.insightProgressBar}>
                              <LinearGradient
                                colors={['#A855F7', '#F472B6']}
                                style={[styles.insightProgressFill, { width: `${insight.score}%` }]}
                              />
                            </View>
                            <Text style={styles.insightGuidance}>"{insight.guidance}"</Text>
                          </LinearGradient>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.wisdomContent}>
                      {learnedSkills.length > 0 ? (
                        <>
                          <View style={styles.insightCard}>
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                              style={styles.insightCardGradient}
                            >
                              <Text style={styles.insightTitle}>Skills Mastered Through Journey</Text>
                              <View style={styles.skillsGrid}>
                                {learnedSkills.map((skill, index) => (
                                  <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillBadgeText}>{skill}</Text>
                                  </View>
                                ))}
                              </View>
                            </LinearGradient>
                          </View>
                          <View style={styles.insightCard}>
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                              style={styles.insightCardGradient}
                            >
                              <Text style={styles.insightTitle}>Reflection Synthesis</Text>
                              <Text style={styles.insightText}>
                                New coping mechanisms have manifested as artifacts through your journey's choices, each one a crystallized moment of growth.
                              </Text>
                            </LinearGradient>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.insightCard}>
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                              style={styles.insightCardGradient}
                            >
                              <Text style={styles.insightTitle}>Recent Echo Discovered</Text>
                              <Text style={styles.insightText}>
                                Your avatar's stress management patterns have crystallized through narrative exploration, revealing hidden strengths in your mental architecture.
                              </Text>
                            </LinearGradient>
                          </View>
                          <View style={styles.insightCard}>
                            <LinearGradient
                              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.6)']}
                              style={styles.insightCardGradient}
                            >
                              <Text style={styles.insightTitle}>Reflection Synthesis</Text>
                              <Text style={styles.insightText}>
                                New coping mechanisms have manifested as artifacts through your journey's choices, each one a crystallized moment of growth.
                              </Text>
                            </LinearGradient>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </LinearGradient>
              </View>

            </View>
          )}
        </ScrollView>
      </View>
      
      {/* StoryScreen modal for playing the selected grimoire */}
      <GrimoireScreen
        visible={isStoryVisible}
        onClose={() => setIsStoryVisible(false)}
        grimoire={selectedStory}
        onStatGain={handleStatGain}
        onArtifactUnlock={(artifact) => {
          if (!discoveredArtifacts.find(a => a.name === artifact.name) && !finalRewardsArtifacts.find(a => a.name === artifact.name)) {
            setDiscoveredArtifacts(prev => [...prev, artifact]);
          }
        }}
        onSkillLearned={(skills) => {
          setLearnedSkills(prev => [...new Set([...prev, ...skills])]);
        }}
        onStoryComplete={handleStoryComplete}
      />

      <CodexModal
        visible={isCodexVisible}
        onClose={() => setIsCodexVisible(false)}
        onSave={handleCodexEntry}
        unlockedAreas={codexEntries.map(entry => entry.mapArea)}
      />

      <ThoughtDefenderModal
        visible={isThoughtDefenderVisible}
        onClose={() => setIsThoughtDefenderVisible(false)}
        onScoreUpdate={(data: { score: number; level: number; won: boolean }) => handleMiniGameComplete('thoughtDefender', data)}
      />

      <ArchiveMapModal
        visible={isMapVisible}
        onClose={() => setIsMapVisible(false)}
        onAreaSelect={(area: ArchiveArea) => setCurrentMapRoomId(area.id)}
        completedEntries={codexEntries.length}
        entries={codexEntries}
        currentRoomId={currentMapRoomId}
      />
    </View>
  );
};

export default ArchiveInterface;