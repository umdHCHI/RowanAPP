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
    View
} from 'react-native';
import {
    baseOptions,
    clothesOptionsF,
    eyesOptionsF,
    hairOptionsF,
    mouthOptionsF,
} from '../../assets/characterOptions';
import { equipmentIcons } from '../../assets/equipment';
import ArchiveMapModal, { ArchiveArea } from '../../components/ArchiveMapModal';
import Button from '../../components/Button';
import CodexModal from '../../components/CodexModal';
import EquipmentModal from '../../components/EquipmentModal';
import PixelButton from '../../components/PixelButton';
import ThoughtDefenderModal from '../../components/ThoughtDefenderModal';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { sampleInventory } from '../../data/sampleEquipment';
import { STARTING_WELLNESS_STATS, STAT_MEANINGS, analyzeReflection, createGearItem } from '../../data/wellnessSystem';
import { appearanceService } from '../../services/appearanceService';
import { Appearance } from '../../types/appearance';
import { EquipmentItem, EquippedItems } from '../../types/equipment';
import type { Story } from './StoryCatalogScreen';
import StoryCatalogModal from './StoryCatalogScreen';
import StoryScreen from './StoryScreen';

const { width, height } = Dimensions.get('window');

const gearSlots = [
  { type: 'focus', label: 'Focus Item' },    // Personal grounding object
  { type: 'comfort', label: 'Comfort Layer' }, // Coping strategy/comfort item
  { type: 'shield', label: 'Mind Shield' },   // Mental protection/boundary tool
  { type: 'ground', label: 'Ground Stone' },  // Grounding/stability tool
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
  { icon: '🎮', label: 'Thought Defender' }, // Mental wellness mini-game
  { icon: '⭐', label: 'Milestones' },  // Achievements in coping skill development
];

const sampleStories = [
  {
    id: '1',
    title: 'The Overwhelmed Mind',
    image: require('../../../assets/images/story1.jpg'),
    description: 'Explore different approaches to academic stress - which feels right for YOUR personality and situation?',
    progress: 0,
    difficulty: 'Personal Discovery',
    skillCategory: 'Stress & Overwhelm',
    reflection_focus: 'What approaches resonated with you? What felt wrong for your style?'
  },
  {
    id: '2',
    title: 'The Lonely Desert', 
    image: require('../../../assets/images/story2.jpg'),
    description: 'Navigate isolation and discover that meaningful connection looks different for everyone.',
    progress: 0,
    difficulty: 'Social Exploration',
    skillCategory: 'Connection & Support',
    reflection_focus: 'How do YOU naturally seek and offer support?'
  },
  {
    id: '3',
    title: 'The Perfect Storm',
    image: require('../../../assets/images/story3.jpg'),
    description: 'Face perfectionism while learning that self-compassion has many forms - find yours.',
    progress: 0,
    difficulty: 'Self-Understanding',
    skillCategory: 'Self-Relationship',
    reflection_focus: 'What does being kind to yourself look like in YOUR voice?'
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

// Add type definitions for stat gains and descriptions
type StatGains = {
  [key: string]: number;
};

type StatDescriptions = {
  [key: string]: {
    [key: number]: string;
  };
};

const GameHomeScreen = () => {
  const { onboardingState } = useOnboarding();
  const [appearance, setAppearance] = useState<Appearance | null>();
  const { authToken, characterId } = useAuth();
  const [isEquipmentModalVisible, setIsEquipmentModalVisible] = useState(false);
  const [inventory, setInventory] = useState<EquipmentItem[]>(sampleInventory);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryScreenVisible, setIsStoryScreenVisible] = useState(false);
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isThoughtDefenderVisible, setIsThoughtDefenderVisible] = useState(false);
  const [completedEntries, setCompletedEntries] = useState(0);
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [selectedArea, setSelectedArea] = useState<ArchiveArea | null>(null);

  // Initialize wellness stats with starting values
  const [wellnessStats, setWellnessStats] = useState([
    { icon: '🧘', label: 'AWR', value: STARTING_WELLNESS_STATS.awareness, color: '#4A90E2' },
    { icon: '💚', label: 'RES', value: STARTING_WELLNESS_STATS.resilience, color: '#2ECC71' },
    { icon: '🤝', label: 'CON', value: STARTING_WELLNESS_STATS.connection, color: '#E74C3C' },
    { icon: '⚖️', label: 'BAL', value: STARTING_WELLNESS_STATS.balance, color: '#F39C12' },
  ]);

  // Choose correct options based on gender
  let baseOptionsVar = baseOptions;
  let hairOptions = hairOptionsF;
  let clothesOptions = clothesOptionsF;
  let eyesOptions = eyesOptionsF;
  let mouthOptions = mouthOptionsF;

  // Background options
  const bgOptions = [
    require('../../../assets/character-creator/BGs/Dark.png'),
    require('../../../assets/character-creator/BGs/Light Brown.png'),
    require('../../../assets/character-creator/BGs/Brown.png'),
    require('../../../assets/character-creator/BGs/Dark Brown.png'),
    require('../../../assets/character-creator/BGs/Blonde.png'),
    require('../../../assets/character-creator/BGs/Orange.png'),
    require('../../../assets/character-creator/BGs/Red.png'),
    require('../../../assets/character-creator/BGs/Magent.png'),
    require('../../../assets/character-creator/BGs/Pink.png'),
    require('../../../assets/character-creator/BGs/Lilac.png'),
    require('../../../assets/character-creator/BGs/Blue.png'),
    require('../../../assets/character-creator/BGs/Dark Blue.png'),
    require('../../../assets/character-creator/BGs/Green.png'),
    require('../../../assets/character-creator/BGs/Light Green.png'),
    require('../../../assets/character-creator/BGs/Blue-Green.png'),
    require('../../../assets/character-creator/BGs/White.png'),
  ];

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
          const data = await appearanceService.getAppearance(Number(characterId));
          console.log('Loaded appearance data:', data);
          setAppearance(data);
        } else {
          console.log('No auth token or character ID available');
          if (onboardingState.appearance) {
            console.log('Using appearance from onboarding state');
            setAppearance(onboardingState.appearance);
          }
        }
      } catch (error) {
        console.error('Failed to load appearance:', error);
        if (onboardingState.appearance) {
          console.log('Using appearance from onboarding state after error');
          setAppearance(onboardingState.appearance);
        }
      }
    };

    loadAppearance();
  }, [authToken, characterId, onboardingState.appearance]);

  const handleEquip = (item: EquipmentItem) => {
    setEquippedItems(prev => ({
      ...prev,
      [item.type.slice(0, -1)]: item
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
      case 'focus':
        return equipmentIcons.focus[item.subtype as 'meditation' | 'breathing' | 'journaling'];
      case 'comfort':
        return equipmentIcons.comfort[item.subtype as 'social' | 'hobby' | 'nature'];
      case 'shield':
        return equipmentIcons.shield[item.subtype as 'boundary' | 'affirmation' | 'routine'];
      case 'ground':
        return equipmentIcons.ground[item.subtype as 'exercise' | 'sleep' | 'nutrition'];
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

  // Enhanced Codex save handler with reflection analysis
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
    
    // Analyze the reflection for personal insights
    const analysis = analyzeReflection(entry.content, entry.prompt);
    
    // Update wellness stats based on analysis
    if (Object.keys(analysis.stat_gains).length > 0) {
      setWellnessStats(prev => prev.map(stat => {
        const statKey = stat.label.toLowerCase().substring(0, 3);
        const gain = (analysis.stat_gains as StatGains)[statKey] || 0;
        return {
          ...stat,
          value: Math.min(20, stat.value + gain) // Cap at 20
        };
      }));
    }

    // Check for gear unlocks
    if (analysis.gear_unlocks.length > 0) {
      // Add new gear to inventory
      const newGear = analysis.gear_unlocks.map(gearName => createGearItem(gearName));
      setInventory(prev => [...prev, ...newGear]);
      
      // Show unlock notification
      Alert.alert(
        'New Coping Tool Unlocked!',
        `Your self-discovery has unlocked: ${analysis.gear_unlocks.join(', ')}\n\n${analysis.recognition_message}`,
        [{ text: 'Amazing!', style: 'default' }]
      );
    } else if (analysis.recognition_message) {
      // Show recognition without gear unlock
      Alert.alert(
        'Growth Recognized',
        analysis.recognition_message,
        [{ text: 'Continue Exploring', style: 'default' }]
      );
    }

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

  // Get stat description based on current value
  const getStatDescription = (statLabel: string, value: number) => {
    const statKey = statLabel.toLowerCase().substring(0, 3);
    const descriptions = (STAT_MEANINGS as StatDescriptions)[statKey];
    if (!descriptions) return 'Developing...';

    const relevantKey = Math.floor(value / 3) * 3;
    return descriptions[relevantKey] || descriptions[18] || 'Developing...';
  };

  // Wellness tooltip component
  const WellnessTooltip = ({ stat, value }: { stat: string; value: number }) => (
    <View style={styles.tooltipContainer}>
      <Text style={styles.tooltipText}>
        {getStatDescription(stat, value)}
      </Text>
    </View>
  );

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
                <Image source={bgOptions[appearance.background]} style={[styles.layer, styles.background]} />
                <Image source={baseOptionsVar[appearance.skin]} style={styles.layer} />
                <Image source={hairOptions[appearance.hair]} style={styles.layer} />
                <Image source={clothesOptions[appearance.clothes]} style={styles.layer} />
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
              <TouchableOpacity 
                key={i} 
                style={[styles.attributeBox, { borderColor: stat.color }]}
                onPress={() => Alert.alert(
                  `${stat.label} - ${stat.value}`,
                  getStatDescription(stat.label, stat.value)
                )}
              >
                <Text style={styles.attributeIcon}>{stat.icon}</Text>
                <Text style={[styles.attributeValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.attributeLabel}>{stat.label}</Text>
              </TouchableOpacity>
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
            <PixelButton>
              <Button 
                title="Browse All"
                variant="lightGreen"
                onPress={() => setIsStoryCatalogVisible(true)}
                style={{ width: 120 }}
              />
            </PixelButton>
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
          <PixelButton>
            <Button 
              title="🎒 Manage Coping Tools"
              variant="darkBrown"
              onPress={() => setIsEquipmentModalVisible(true)}
              style={{ width: 180 }}
            />
          </PixelButton>
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
        currentRoomId={ selectedArea?.id ?? ''}
        onClose={handleMapClose}
        onAreaSelect={handleAreaSelect}
        completedEntries={codexEntries.length}
        entries={codexEntries}
      />

      <ThoughtDefenderModal
        visible={isThoughtDefenderVisible}
        onClose={() => setIsThoughtDefenderVisible(false)}
        onScoreUpdate={(score) => {
          // Update wellness stats based on game score
          setWellnessStats(prev => prev.map(stat => ({
            ...stat,
            value: Math.min(20, stat.value + Math.floor(score / 100))
          })));
        }}
      />

      {/* Bottom Navigation Bar */}
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        backgroundColor: '#23242b',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#333',
        zIndex: 100,
      }}>
        {bottomNav.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => {
              if (item.label === 'Codex') setIsCodexVisible(true);
              if (item.label === 'Memory Map') setIsMapVisible(true);
              if (item.label === 'Thought Defender') {
                setIsThoughtDefenderVisible(true);
              }
              if (item.label === 'Milestones') {
                Alert.alert('Milestones', 'Coming soon! Track your achievements in coping skills.');
              }
            }}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  background: {
    zIndex: -1,
  },
  tooltipContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    maxWidth: 200,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default GameHomeScreen;