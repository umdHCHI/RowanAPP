import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { equipmentIcons } from '../../assets/equipment';
import {
  clothesOptionsF,
  clothesOptionsM,
  eyesOptionsF,
  eyesOptionsM,
  glassesOptionsF,
  glassesOptionsM,
  hairOptionsF,
  hairOptionsM,
  mouthOptionsF,
  mouthOptionsM,
  skinOptionsF,
  skinOptionsM,
} from '../assets/characterOptions';
import ArchiveMapModal, { ArchiveArea } from '../components/ArchiveMapModal';
import CodexModal from '../components/CodexModal';
import EquipmentModal from '../components/EquipmentModal';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { sampleInventory } from '../data/sampleEquipment';
import { getAppearance } from '../services/appearanceService';
import { EquipmentItem, EquippedItems } from '../types/equipment';
import type { Story } from './StoryCatalogScreen';
import StoryCatalogModal from './StoryCatalogScreen';
import StoryScreen from './StoryScreen';

const { width, height } = Dimensions.get('window');

const gearSlots = [
  { type: 'weapons', label: 'Focus Item' }, // Personal grounding object
  { type: 'armor', label: 'Comfort Layer' }, // Coping strategy/comfort item
  { type: 'helmets', label: 'Mind Shield' }, // Mental protection/boundary tool
  { type: 'boots', label: 'Ground Stone' }, // Grounding/stability tool
];

// Wellness attributes that affect story navigation and coping skill effectiveness
const wellnessStats = [
  { icon: '🧘', label: 'AWR', value: '14', color: '#4A90E2' }, // Awareness (mindfulness, self-reflection)
  { icon: '💚', label: 'RES', value: '12', color: '#2ECC71' }, // Resilience (stress management, bounce-back)
  { icon: '🤝', label: 'CON', value: '10', color: '#E74C3C' }, // Connection (social support, relationships)
  { icon: '⚖️', label: 'BAL', value: '8', color: '#F39C12' },  // Balance (work-life, self-care)
];

// Archive exploration and skill development metrics
const archiveMetrics = [
  { icon: '📜', label: 'Memories Explored', value: '3/12' },
  { icon: '🛠️', label: 'Coping Skills Learned', value: '7' },
  { icon: '🔍', label: 'Insights Discovered', value: '15/23' },
];

// Archive-themed navigation
const bottomNav = [
  { icon: '📚', label: 'Codex' },       // Personal growth journal, skill tracker
  { icon: '🗺️', label: 'Memory Map' },  // Progress through memory categories
  { icon: '⭐', label: 'Milestones' },  // Achievements in coping skill development
];

const sampleStories = [
  {
    id: '1',
    title: 'The Overwhelmed Mind',
    image: require('../../assets/images/story1.jpg'),
    description: 'Navigate through a memory of exam stress and discover breathing techniques hidden in an enchanted forest.',
    progress: 65,
    difficulty: 'Stress Management',
    skillCategory: 'Anxiety & Stress'
  },
  {
    id: '2',
    title: 'The Lonely Desert', 
    image: require('../../assets/images/story2.jpg'),
    description: 'Explore feelings of isolation and learn connection strategies while crossing vast, symbolic landscapes.',
    progress: 0,
    difficulty: 'Social Connection',
    skillCategory: 'Relationships'
  },
  {
    id: '3',
    title: 'The Perfect Storm',
    image: require('../../assets/images/story3.jpg'),
    description: 'Confront perfectionism and imposter syndrome in a city where every smile hides self-doubt.',
    progress: 100,
    difficulty: 'Self-Compassion',
    skillCategory: 'Self-Esteem'
  },
];

type CodexEntry = {
  id: string;
  type: string;
  content: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
  timestamp: number;
};

// Add skill level thresholds
const SKILL_LEVEL_THRESHOLDS = {
  'Novice': 1,
  'Apprentice': 3,
  'Practitioner': 5,
  'Master': 8,
  'Grandmaster': 12
};

type AreaRequirements = {
  totalEntries: number;
  skillRequirements: Record<string, number>;
};

const AREA_UNLOCK_REQUIREMENTS: Record<string, AreaRequirements> = {
  'entrance': { totalEntries: 0, skillRequirements: {} },
  'garden': { 
    totalEntries: 2, 
    skillRequirements: { 
      'Stress Management': 1, 
      'Emotional Awareness': 1 
    } 
  },
  'library': { 
    totalEntries: 3, 
    skillRequirements: { 
      'Social Connection': 1, 
      'Personal Growth': 1 
    } 
  },
  'sanctuary': { 
    totalEntries: 5, 
    skillRequirements: { 
      'Self-Compassion': 2, 
      'Stress Management': 1 
    } 
  },
  'archive': { 
    totalEntries: 8, 
    skillRequirements: { 
      'Personal Growth': 2, 
      'Self-Compassion': 1, 
      'Social Connection': 1 
    } 
  },
  'summit': { 
    totalEntries: 12, 
    skillRequirements: { 
      'Personal Growth': 3, 
      'Self-Compassion': 2, 
      'Social Connection': 2, 
      'Stress Management': 2 
    } 
  },
};

const GameHomeScreen = () => {
  const { onboardingState } = useOnboarding();
  const [appearance, setAppearance] = useState(onboardingState.characterAppearance);
  const { authToken, characterId } = useAuth();
  const [isEquipmentModalVisible, setIsEquipmentModalVisible] = useState(false);
  const [inventory, setInventory] = useState<EquipmentItem[]>(sampleInventory);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryScreenVisible, setIsStoryScreenVisible] = useState(false);
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [completedEntries, setCompletedEntries] = useState(0);
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [selectedArea, setSelectedArea] = useState<ArchiveArea | null>(null);

  // Choose correct options based on gender
  let skinOptions = skinOptionsF;
  let hairOptions = hairOptionsF;
  let clothesOptions = clothesOptionsF;
  let glassesOptions = glassesOptionsF;
  let eyesOptions = eyesOptionsF;
  let mouthOptions = mouthOptionsF;
  if (appearance?.gender === 'masculine') {
    skinOptions = skinOptionsM;
    hairOptions = hairOptionsM;
    clothesOptions = clothesOptionsM;
    glassesOptions = glassesOptionsM;
    eyesOptions = eyesOptionsM;
    mouthOptions = mouthOptionsM;
  }
  // For 'nonbinary', use feminine assets for now (or add custom logic/assets later)

  const characterStats = [
    { label: 'Level', value: '12', color: '#FFD700' },
    { label: 'Health', value: '285/320', color: '#FF4444' },
    { label: 'Mana', value: '180/200', color: '#4488FF' },
    { label: 'Experience', value: '2,847/3,200', color: '#00FF88' },
  ];

  useEffect(() => {
    const loadAppearance = async () => {
      try {
        if (authToken && characterId) {
          console.log('Loading appearance for character:', characterId);
          const data = await getAppearance(authToken, characterId);
          console.log('Loaded appearance data:', data);
          setAppearance(data);
        } else {
          console.log('No auth token or character ID available');
          // If we have appearance data in onboarding state, use that
          if (onboardingState.characterAppearance) {
            console.log('Using appearance from onboarding state');
            setAppearance(onboardingState.characterAppearance);
          }
        }
      } catch (error) {
        console.error('Failed to load appearance:', error);
        // If loading fails, try to use onboarding state
        if (onboardingState.characterAppearance) {
          console.log('Using appearance from onboarding state after error');
          setAppearance(onboardingState.characterAppearance);
        }
      }
    };

    loadAppearance();
  }, [authToken, characterId, onboardingState.characterAppearance]);

  // useEffect(() => {
  //   const loadEquipment = async () => {
  //     if (authToken && characterId) {
  //       try {
  //         const [inventoryData, equippedData] = await Promise.all([
  //           getInventory(authToken, characterId),
  //           getEquippedItems(authToken, characterId)
  //         ]);
  //         setInventory(inventoryData);
  //         setEquippedItems(equippedData);
  //       } catch (error) {
  //         console.error('Error loading equipment:', error);
  //       }
  //     }
  //   };
  //   loadEquipment();
  // }, [authToken, characterId]);

  const handleEquip = (item: EquipmentItem) => {
    setEquippedItems(prev => ({
      ...prev,
      [item.type.slice(0, -1)]: item // Remove 's' from the end of type
    }));
    setInventory(prev => prev.filter(i => i.id !== item.id));
  };

  const handleUnequip = (item: EquipmentItem) => {
    setEquippedItems(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[item.type.slice(0, -1) as keyof EquippedItems];
      return newEquipped;
    });
    setInventory(prev => [...prev, item]);
  };

  const getItemIcon = (item: EquipmentItem) => {
    switch (item.type) {
      case 'weapons':
        return equipmentIcons.weapons[item.subtype as 'sword'];
      case 'armor':
        return equipmentIcons.armor[item.subtype as 'leather' | 'plate'];
      case 'helmets':
        return equipmentIcons.helmets[item.subtype as 'plate_helm'];
      case 'boots':
        return equipmentIcons.boots[item.subtype as 'plate_boots'];
      default:
        return undefined;
    }
  };

  // Function to get story progress color
  const getProgressColor = (progress: number) => {
    if (progress === 0) return '#666';
    if (progress === 100) return '#2ECC71';
    return '#F39C12';
  };

  const handleCodexSave = (entry: {
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    const newEntry: CodexEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: Date.now(),
    };
    setCodexEntries(prev => [...prev, newEntry]);
    setIsCodexVisible(false);
  };

  const handleMapPress = () => {
    setIsMapVisible(true);
  };

  const handleMapClose = () => {
    setIsMapVisible(false);
    setSelectedArea(null);
  };

  const handleAreaSelect = (area: ArchiveArea) => {
    setSelectedArea(area);
  };

  // Calculate unlocked areas based on skill requirements
  const getUnlockedAreas = () => {
    const skillCounts = codexEntries.reduce((acc, entry) => {
      acc[entry.skillCategory] = (acc[entry.skillCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const unlockedAreas = ['entrance']; // Always start with entrance

    Object.entries(AREA_UNLOCK_REQUIREMENTS).forEach(([areaId, requirements]) => {
      if (areaId === 'entrance') return; // Skip entrance as it's always unlocked

      // Check if total entries requirement is met
      const totalEntriesMet = codexEntries.length >= requirements.totalEntries;

      // Check if skill requirements are met
      const skillRequirementsMet = Object.entries(requirements.skillRequirements).every(
        ([skill, required]) => (skillCounts[skill] || 0) >= required
      );

      if (totalEntriesMet && skillRequirementsMet) {
        unlockedAreas.push(areaId);
      }
    });

    return unlockedAreas;
  };

  // Add to existing getSkillMetrics function
  const getSkillMetrics = () => {
    const skillCounts = codexEntries.reduce((acc, entry) => {
      acc[entry.skillCategory] = (acc[entry.skillCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate skill levels
    const skillLevels = Object.entries(skillCounts).map(([skill, count]) => {
      let level = 'Novice';
      for (const [levelName, threshold] of Object.entries(SKILL_LEVEL_THRESHOLDS)) {
        if (count >= threshold) {
          level = levelName;
        }
      }
      return { skill, count, level };
    });

    return [
      { 
        icon: '📜', 
        label: 'Areas Unlocked', 
        value: `${getUnlockedAreas().length}/6` 
      },
      { 
        icon: '🛠️', 
        label: 'Skills Mastered', 
        value: skillLevels.filter(s => s.level === 'Master' || s.level === 'Grandmaster').length.toString() 
      },
      { 
        icon: '🔍', 
        label: 'Total Reflections', 
        value: codexEntries.length.toString() 
      },
    ];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView style={styles.content} contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}>
        
        {/* Top: Rarity, Class, Name */}
        <View style={styles.topInfo}>
          <Text style={styles.rarity}>Archivist</Text>
          <Text style={styles.class}>Memory Keeper</Text>
          <Text style={styles.heroName}>Ira</Text>
        </View>

        {/* Character and Gear */}
        <View style={styles.gearRow}>
          <View style={styles.gearCol}>
            {gearSlots.slice(0, 2).map((slot, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.gearSlot}
                onPress={() => setIsEquipmentModalVisible(true)}
              >
                {equippedItems[slot.type.slice(0, -1) as keyof EquippedItems] ? (
                  <Image 
                    source={getItemIcon(equippedItems[slot.type.slice(0, -1) as keyof EquippedItems]!)}
                    style={styles.gearIcon}
                  />
                ) : (
                  <View style={styles.emptySlot}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.characterCard}>
            {appearance && (
              <View style={styles.characterPreview}>
                <Image source={skinOptions[appearance.skin]} style={styles.layer} />
                <Image source={hairOptions[appearance.hair]} style={styles.layer} />
                <Image source={clothesOptions[appearance.clothes]} style={styles.layer} />
                <Image source={glassesOptions[appearance.glasses]} style={styles.layer} />
                <Image source={eyesOptions[appearance.eyes]} style={styles.layer} />
                <Image source={mouthOptions[appearance.mouth]} style={styles.layer} />
              </View>
            )}
          </View>

          <View style={styles.gearCol}>
            {gearSlots.slice(2).map((slot, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.gearSlot}
                onPress={() => setIsEquipmentModalVisible(true)}
              >
                {equippedItems[slot.type.slice(0, -1) as keyof EquippedItems] ? (
                  <Image 
                    source={getItemIcon(equippedItems[slot.type.slice(0, -1) as keyof EquippedItems]!)}
                    style={styles.gearIcon}
                  />
                ) : (
                  <View style={styles.emptySlot}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Mood/State */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Ready to explore the depths of memory...</Text>
        </View>

        {/* Wellness Attributes */}
        <View style={styles.attributesSection}>
          <Text style={styles.sectionTitle}>Wellness Attributes</Text>
          <View style={styles.attributesRow}>
            {wellnessStats.map((stat, i) => (
              <View key={i} style={[styles.attributeBox, { borderColor: stat.color }]}>
                <Text style={styles.attributeIcon}>{stat.icon}</Text>
                <Text style={[styles.attributeValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.attributeLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Archive Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Archive Progress</Text>
          <View style={styles.progressRow}>
            {archiveMetrics.map((metric, i) => (
              <View key={i} style={styles.progressBox}>
                <Text style={styles.progressIcon}>{metric.icon}</Text>
                <Text style={styles.progressValue}>{metric.value}</Text>
                <Text style={styles.progressLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Memory Collection */}
        <View style={styles.storiesSection}>
          <View style={styles.storiesHeader}>
            <Text style={styles.sectionTitle}>Memory Vault</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setIsStoryCatalogVisible(true)}
            >
              <Text style={styles.viewAllText}>Browse All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ width: '100%' }}
          >
            {sampleStories.map(story => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => {
                  setSelectedStory(story);
                  setIsStoryScreenVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Image source={story.image} style={styles.storyImage} />
                
                {/* Progress indicator */}
                {story.progress > 0 && (
                  <View style={styles.progressIndicator}>
                    <View style={[styles.progressBar, { backgroundColor: getProgressColor(story.progress) }]}>
                      <View style={[styles.progressFill, { width: `${story.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{story.progress}%</Text>
                  </View>
                )}
                
                <View style={styles.storyContent}>
                  <View style={styles.storyHeader}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <Text style={styles.storyDifficulty}>{story.difficulty}</Text>
                    <Text style={styles.skillCategory}>{story.skillCategory}</Text>
                  </View>
                  <Text style={styles.storyDesc}>{story.description}</Text>
                  
                  <View style={styles.storyAction}>
                    <Text style={styles.actionText}>
                      {story.progress === 0 ? 'Begin' : story.progress === 100 ? 'Revisit' : 'Continue'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setIsEquipmentModalVisible(true)}
          >
            <Text style={styles.quickActionText}>🎒 Manage Coping Tools</Text>
          </TouchableOpacity>
        </View>

        {/* Skill Breakdown */}
        <View style={styles.skillBreakdown}>
          <Text style={styles.skillBreakdownTitle}>🎯 Skills Developed</Text>
          {Object.entries(
            codexEntries.reduce((acc, entry) => {
              acc[entry.skillCategory] = (acc[entry.skillCategory] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([skill, count]) => {
            let level = 'Novice';
            for (const [levelName, threshold] of Object.entries(SKILL_LEVEL_THRESHOLDS)) {
              if (count >= threshold) {
                level = levelName;
              }
            }
            return (
              <View key={skill} style={styles.skillProgressItem}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill}</Text>
                  <Text style={styles.skillLevel}>{level}</Text>
                </View>
                <Text style={styles.skillCount}>{count} entries</Text>
              </View>
            );
          })}
          {codexEntries.length === 0 && (
            <Text style={styles.noSkillsText}>Complete Codex entries to develop skills</Text>
          )}
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Equipment Modal */}
      <EquipmentModal
        visible={isEquipmentModalVisible}
        onClose={() => setIsEquipmentModalVisible(false)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        inventory={inventory}
        equippedItems={equippedItems}
      />

      {/* Simplified Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setIsCodexVisible(true)}
        >
          <Ionicons name="book" size={24} color="#fff" />
          <Text style={styles.navText}>Codex</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleMapPress}
        >
          <Ionicons name="map" size={24} color="#fff" />
          <Text style={styles.navText}>Memory Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={styles.navText}>Milestones</Text>
        </TouchableOpacity>
      </View>

      <StoryCatalogModal
        visible={isStoryCatalogVisible}
        onClose={() => setIsStoryCatalogVisible(false)}
        onSelectStory={story => {
          setSelectedStory(story);
          setIsStoryCatalogVisible(false);
          setIsStoryScreenVisible(true);
        }}
      />

      <StoryScreen
        visible={isStoryScreenVisible}
        onClose={() => setIsStoryScreenVisible(false)}
        story={selectedStory ?? undefined}
      />

      <CodexModal
        visible={isCodexVisible}
        onClose={() => setIsCodexVisible(false)}
        onSave={handleCodexSave}
        unlockedAreas={codexEntries.map(entry => entry.mapArea)}
      />

      <ArchiveMapModal
        visible={isMapVisible}
        onClose={handleMapClose}
        onAreaSelect={handleAreaSelect}
        completedEntries={codexEntries.length}
        entries={codexEntries}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  content: {
    flex: 1,
  },
  topInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rarity: {
    color: '#4ee6e6',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  class: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  heroName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 6,
  },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gearCol: {
    justifyContent: 'space-between',
    height: 180,
  },
  gearSlot: {
    width: 48,
    height: 48,
    backgroundColor: '#23242b',
    borderRadius: 10,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  gearIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  slotLabel: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },
  speechBubble: {
    backgroundColor: '#f5e6c4',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#e2c48d',
    maxWidth: 320,
  },
  speechText: {
    color: '#5a4a2c',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  attributesSection: {
    width: '90%',
    marginVertical: 15,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attributeBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#23242b',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  attributeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  attributeValue: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  attributeLabel: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressSection: {
    width: '90%',
    marginVertical: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1b1f',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  progressIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  progressValue: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  progressLabel: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
  },
  storiesSection: {
    width: '100%',
    marginVertical: 20,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewAllButton: {
    backgroundColor: '#4ee6e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewAllText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  storyCard: {
    width: 200,
    backgroundColor: '#23242b',
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  storyImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  progressIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    padding: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: 30,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  storyContent: {
    padding: 12,
  },
  storyHeader: {
    marginBottom: 8,
  },
  storyTitle: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  storyDifficulty: {
    color: '#4ee6e6',
    fontSize: 12,
    fontStyle: 'italic',
  },
  skillCategory: {
    color: '#ffe066',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  storyDesc: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  storyAction: {
    alignItems: 'center',
    backgroundColor: '#1a1b1f',
    borderRadius: 6,
    paddingVertical: 8,
  },
  actionText: {
    color: '#4ee6e6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  quickActionsSection: {
    width: '90%',
    marginVertical: 10,
  },
  quickActionButton: {
    backgroundColor: '#23242b',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#23242b',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  characterCard: {
    width: 140,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 12,
    marginRight: 28,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  characterPreview: {
    width: 120,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    position: 'absolute',
    width: 120,
    height: 220,
    resizeMode: 'contain',
  },
  skillBreakdown: {
    width: '90%',
    marginVertical: 15,
  },
  skillBreakdownTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  skillProgressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  skillLevel: {
    color: '#4ee6e6',
    fontSize: 10,
    fontStyle: 'italic',
  },
  skillCount: {
    color: '#fff',
    fontSize: 12,
  },
  noSkillsText: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default GameHomeScreen;