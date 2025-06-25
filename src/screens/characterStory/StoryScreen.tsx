import {
  Alert,
  Animated,
  createGlobalStyles,
  Dimensions,
  Icon,
  LinearGradient,
  Modal,
  React,
  Text,
  TouchableOpacity,
  useEffect,
  useState,
  useTheme,
  View,
} from '../../imports';

const { width, height } = Dimensions.get('window');

// Renamed grimoireData to be specific and created a central data store
const chronicleOfTheFracturedMindData = {
  id: '1',
  title: 'Chronicle of the Fractured Mind',
  subtitle: 'Academic Pressures Archive',
  atmosphere: 'Dimly lit corridors echo with the weight of expectations...',
  difficulty: 'Deep Introspection',
  rarity: 'Epic',
  skillFocus: ['Mindfulness', 'Stress Management', 'Academic Balance'],
  passages: [
    {
      id: 'start',
      text: `You step into The Archive's entrance hall—tall shelves heave under scrolls inscribed with anxious scribbles.  
The air hums with unspoken deadlines. A crystalline voice resonates from the gloom:

"How will you navigate these treacherous halls?"`,
      atmosphere: 'Floating equations drift through the misty air',
      choices: [
        {
          text: 'Take a deep breath and ground yourself',
          next: 'mindful_path',
          statEffects: { 'Sight Beyond Sight': 2, 'Elemental Harmony': 1 },
          description: 'Calm the storm with mindful focus',
          skillsLearned: ['Deep Breathing', 'Present Moment Awareness']
        },
        {
          text: 'March forward with unwavering resolve',
          next: 'will_path',
          statEffects: { 'Unbreakable Will': 2 },
          description: 'Face the Archive head-on',
          skillsLearned: ['Resilient Thinking', 'Goal Persistence']
        },
        {
          text: 'Search the shadows for fellow travelers',
          next: 'connection_path',
          statEffects: { "Heart's Compass": 2 },
          description: 'Find strength in community',
          skillsLearned: ['Peer Support', 'Emotional Validation']
        }
      ]
    },
    {
      id: 'mindful_path',
      text: `You inhale slowly; the swirl of anxieties around you steadies.  
Symbols of doubt fade to reveal hidden runes of clarity. A whisper echoes:

"True sight emerges by centering the mind, not battling the tempest."`,
      atmosphere: 'The mist parts, unveiling ancient truths',
      choices: [
        {
          text: 'Study the patterns of your thoughts',
          next: 'insight_chamber',
          statEffects: { 'Sight Beyond Sight': 3, 'Elemental Harmony': 1 },
          description: 'Unlock the lens of clear perception',
          skillsLearned: ['Cognitive Awareness', 'Thought Observation'],
          artifactUnlock: 'Clarity Lens of Mindful Sight'
        },
        {
          text: 'Share this calm with a struggling peer',
          next: 'teaching_moment',
          statEffects: { "Heart's Compass": 2, 'Sight Beyond Sight': 1 },
          description: 'Offer guiding light to others',
          skillsLearned: ['Peer Mentoring', 'Empathic Communication']
        }
      ]
    },
    {
      id: 'will_path',
      text: `Your resolve flares like a torch, cutting through oppressive gloom.  
Doubt's whispers hush under your Unbreakable Will. An inscription glows:

"Pressure forges strength; through trials, wisdom is earned."`,
      atmosphere: 'Shadows retreat before your inner flame',
      choices: [
        {
          text: 'Lend this strength to someone in need',
          next: 'mentor_chamber',
          statEffects: { 'Unbreakable Will': 2, "Heart's Compass": 2 },
          description: 'Be a beacon of resilience',
          skillsLearned: ['Leadership', 'Strength Sharing'],
          artifactUnlock: 'Guardian Ward of Boundaries'
        },
        {
          text: 'Channel your will into defeating your greatest fear',
          next: 'trial_chamber',
          statEffects: { 'Unbreakable Will': 3, 'Sight Beyond Sight': 1 },
          description: 'Confront the deepest academic dread',
          skillsLearned: ['Fear Confrontation', 'Challenge Reframing'],
          artifactUnlock: 'Foundation Stone of Grounding'
        }
      ]
    },
    {
      id: 'connection_path',
      text: `You emerge into a great hall where others wander, eyes reflecting your own struggle.  
A shared murmur rises:

"No scholar walks alone; together, burdens lighten, wisdom multiplies."`,
      atmosphere: 'Warm lantern light weaves between kindred souls',
      choices: [
        {
          text: 'Forge a study circle with these allies',
          next: 'community_chamber',
          statEffects: { "Heart's Compass": 3, 'Elemental Harmony': 1 },
          description: 'Build bonds of mutual support',
          skillsLearned: ['Group Dynamics', 'Collaborative Learning'],
          artifactUnlock: 'Sanctuary Shroud of Comfort'
        },
        {
          text: 'Gather unique coping tools from each companion',
          next: 'wisdom_exchange',
          statEffects: { "Heart's Compass": 2, 'Sight Beyond Sight': 2 },
          description: 'Expand your toolkit through diversity',
          skillsLearned: ['Strategy Adaptation', 'Perspective Taking']
        }
      ]
    },
    {
      id: 'insight_chamber',
      text: `In the Chamber of Clear Sight, illusions crumble.  
You realize perfection is a gilded cage—progress over perfection. A final whisper:

"Excellence is a journey, not a destination."`,
      atmosphere: 'Brilliant clarity banishes every shadow',
      choices: [
        {
          text: 'Complete this Grimoire and embody its wisdom',
          next: null,
          isEnding: true,
          finalRewards: ['Academic Stress Mastery Badge', 'Mindfulness Expertise'],
          wisdomGained: 'Self-compassion illuminates the path to true excellence.'
        }
      ]
    },
    {
      id: 'community_chamber',
      text: `In this chamber, your study circle stands united. Vulnerability reveals strength.  
Together you chant:

"Shared struggle births shared triumph."`,
      atmosphere: 'Radiant bonds reinforce every heart',
      choices: [
        {
          text: 'Complete this Grimoire as a united circle',
          next: null,
          isEnding: true,
          finalRewards: ['Community Builder Badge', 'Support Network Mastery'],
          wisdomGained: 'Connection transforms isolation into empowerment.'
        }
      ]
    },
    {
      id: 'trial_chamber',
      text: `You face the Mirror of Ultimate Academic Fear.  
With unwavering will, you step forward. The glass shatters, revealing your growth:

"Courage is action in the presence of fear."`,
      atmosphere: 'Your bravery radiates, reshaping the chamber',
      choices: [
        {
          text: 'Complete this Grimoire as a master of resilience',
          next: null,
          isEnding: true,
          finalRewards: ['Resilience Master Badge', 'Fear Transformer Artifact'],
          wisdomGained: 'Every conquered challenge becomes a source of inner power.'
        }
      ]
    },
    {
      id: 'teaching_moment',
      text: `You guide a fellow seeker through the swirl of anxieties,  
sharing your clarity. Their eyes soften as understanding dawns.  
The Curator's echo: "Teaching is the highest form of mastery."`,
      atmosphere: 'A gentle glow binds teacher and student',
      choices: [
        {
          text: 'Complete this Grimoire as a mentor of minds',
          next: null,
          isEnding: true,
          finalRewards: ["Mentor's Insight Badge", "Empathy Conduit Artifact"],
          wisdomGained: 'To teach is to solidify one\'s own wisdom and compassion.'
        }
      ]
    },
    {
      id: 'wisdom_exchange',
      text: `You collect coping strategies from each traveler—  
from breathing rituals to timeboxing techniques.  
A chorus rises: "Diverse paths lead to shared peace."`,
      atmosphere: 'A tapestry of methods weaves through the hall',
      choices: [
        {
          text: 'Complete this Grimoire as a scholar of strategies',
          next: null,
          isEnding: true,
          finalRewards: ['Adaptability Badge', 'Toolkit Grimoire Artifact'],
          wisdomGained: 'Flexibility in approach turns obstacles into opportunities.'
        }
      ]
    }
  ]
};

const perfectionistParadoxData = {
  id: '2',
  title: 'The Perfectionist\'s Paradox',
  subtitle: 'Self-Relationship Vault',
  atmosphere: 'Glittering halls echo with the weight of impossible standards...',
  difficulty: 'Shadow Work',
  rarity: 'Legendary',
  skillFocus: ['Self-Compassion', 'Growth Mindset', 'Inner Critic Work'],
  passages: [
    {
      id: 'start',
      text: `You enter a magnificent hall of mirrors, each reflection showing a different version of yourself—
all perfect, all impossible. A voice whispers from the gleaming surfaces:

"What price do you pay for the pursuit of flawlessness?"`,
      atmosphere: 'Golden light fractures into impossible standards',
      choices: [
        {
          text: 'Examine the mirrors with compassionate curiosity',
          next: 'compassion_path',
          statEffects: { "Heart's Compass": 2, 'Sight Beyond Sight': 1 },
          description: 'Approach your reflections with kindness',
          skillsLearned: ['Self-Compassion', 'Mindful Self-Observation']
        },
        {
          text: 'Challenge the impossible standards directly',
          next: 'challenge_path',
          statEffects: { 'Unbreakable Will': 2, "Heart's Compass": 1 },
          description: 'Confront perfectionism head-on',
          skillsLearned: ['Inner Critic Work', 'Reality Testing']
        },
        {
          text: 'Seek others who struggle with the same reflections',
          next: 'connection_path',
          statEffects: { "Heart's Compass": 3 },
          description: 'Find solidarity in shared struggles',
          skillsLearned: ['Peer Support', 'Shame Resilience']
        }
      ]
    },
    {
      id: 'compassion_path',
      text: `You place your hand gently on a mirror's surface. The reflection softens, showing you as you truly are—
imperfect, growing, beautifully human. The harsh light dims to a warm glow.

"Self-compassion is the key that unlocks the prison of perfection."`,
      atmosphere: 'Warm light embraces your authentic self',
      choices: [
        {
          text: 'Embrace this new understanding completely',
          next: null,
          isEnding: true,
          finalRewards: ['Self-Compassion Master Badge', 'Mirror of Authentic Self'],
          wisdomGained: 'True excellence blooms from self-acceptance, not self-judgment.'
        }
      ]
    },
    {
      id: 'challenge_path',
      text: `You raise your voice against the mirrors: "These standards are impossible!" 
One by one, the mirrors crack and shatter, revealing the truth behind them—fear, shame, and learned patterns.

"Courage shatters the illusions that bind us."`,
      atmosphere: 'Crystal shards of broken expectations glitter and fade',
      choices: [
        {
          text: 'Walk forward through the broken glass, free',
          next: null,
          isEnding: true,
          finalRewards: ['Perfectionism Warrior Badge', 'Shattered Standards Artifact'],
          wisdomGained: 'Breaking free from perfectionism requires the courage to disappoint the voices that demand impossibility.'
        }
      ]
    },
    {
      id: 'connection_path',
      text: `Other figures emerge from the shadows—fellow travelers trapped in their own mirror mazes.
Together, you share stories of impossible standards and gentle failures. The mirrors begin to show kinder reflections.

"In shared vulnerability, perfectionism loses its power."`,
      atmosphere: 'A circle of understanding forms in the fading golden light',
      choices: [
        {
          text: 'Form a circle of mutual support and understanding',
          next: null,
          isEnding: true,
          finalRewards: ['Connection Weaver Badge', 'Circle of Support Artifact'],
          wisdomGained: 'The antidote to perfectionism is often found in authentic connection with others.'
        }
      ]
    }
  ]
};

const socialAnxietiesCodexData = {
  id: '3',
  title: 'Codex of Social Anxieties',
  subtitle: 'Connection & Communication Archive',
  atmosphere: 'Whispered judgments echo through crowded corridors...',
  difficulty: 'Courage Building',
  rarity: 'Rare',
  skillFocus: ['Social Skills', 'Anxiety Management', 'Authenticity'],
  passages: [
    {
      id: 'start',
      text: `You stand at the threshold of a great social hall where hundreds of voices blend into a cacophony of judgment and expectation. 
Your heart races as eyes seem to turn toward you. A gentle voice cuts through the noise:

"How will you navigate the waters of connection?"`,
      atmosphere: 'Voices swirl with unspoken judgments and hidden kindness',
      choices: [
        {
          text: 'Take three deep breaths and enter with intention',
          next: 'mindful_entry',
          statEffects: { 'Sight Beyond Sight': 2, 'Elemental Harmony': 1 },
          description: 'Ground yourself in the present moment',
          skillsLearned: ['Anxiety Management', 'Mindful Presence']
        },
        {
          text: 'Look for one friendly face in the crowd',
          next: 'connection_focus',
          statEffects: { "Heart's Compass": 2, 'Sight Beyond Sight': 1 },
          description: 'Seek authentic connection over performance',
          skillsLearned: ['Social Skills', 'Selective Attention']
        },
        {
          text: 'Embrace your nervousness as excitement',
          next: 'reframe_path',
          statEffects: { 'Unbreakable Will': 2, 'Elemental Harmony': 1 },
          description: 'Transform anxiety into energy',
          skillsLearned: ['Cognitive Reframing', 'Energy Management']
        }
      ]
    },
    {
      id: 'mindful_entry',
      text: `Your breathing steadies the storm within. The voices become clearer—some kind, some neutral, 
most simply focused on their own concerns. You realize the spotlight you felt was largely in your mind.

"Presence is the foundation of authentic connection."`,
      atmosphere: 'Clarity cuts through the fog of social fear',
      choices: [
        {
          text: 'Complete this journey with mindful mastery',
          next: null,
          isEnding: true,
          finalRewards: ['Mindful Connector Badge', 'Lens of Social Clarity'],
          wisdomGained: 'Social anxiety loses its grip when we anchor ourselves in the present moment.'
        }
      ]
    },
    {
      id: 'connection_focus',
      text: `You spot someone sitting alone, looking as uncertain as you feel. Approaching with genuine curiosity,
you discover that most people are too busy with their own worries to judge yours. A real conversation begins.

"Authentic connection dissolves the walls of anxiety."`,
      atmosphere: 'Warmth spreads as genuine understanding blooms',
      choices: [
        {
          text: 'Complete this journey as a bridge-builder',
          next: null,
          isEnding: true,
          finalRewards: ['Bridge Builder Badge', 'Heart of Empathy Artifact'],
          wisdomGained: 'True social confidence comes from focusing on others rather than ourselves.'
        }
      ]
    },
    {
      id: 'reframe_path',
      text: `You transform the butterflies in your stomach into energy for engagement. 
What felt like anxiety becomes anticipation. Your nervous energy becomes magnetic enthusiasm.

"Anxiety and excitement are separated only by perspective."`,
      atmosphere: 'Electric energy transforms fear into possibility',
      choices: [
        {
          text: 'Complete this journey as an energy alchemist',
          next: null,
          isEnding: true,
          finalRewards: ['Energy Alchemist Badge', 'Transformation Stone'],
          wisdomGained: 'Our greatest challenges often contain the seeds of our greatest strengths.'
        }
      ]
    }
  ]
};

const allStoriesData = {
  '1': chronicleOfTheFracturedMindData,
  '2': perfectionistParadoxData,
  '3': socialAnxietiesCodexData,
  // Future stories will be added here
};

// Artifact Unlock Database
const artifactDatabase = {
  'Clarity Lens of Mindful Sight': {
    name: 'Clarity Lens of Mindful Sight',
    type: 'Focus Relic',
    rarity: 'Legendary',
    description: 'A crystalline lens revealing the true shape of anxious thoughts.',
    powers: ['Enhanced focus', 'Anxiety pattern recognition', 'Present-moment anchoring'],
    statBoosts: { 'Sight Beyond Sight': 2 }
  },
  'Guardian Ward of Boundaries': {
    name: 'Guardian Ward of Boundaries',
    type: 'Protective Seal',
    rarity: 'Epic',
    description: 'An ethereal barrier against overwhelming expectations.',
    powers: ['Pressure resistance', 'Boundary setting', 'Perfectionism protection'],
    statBoosts: { 'Unbreakable Will': 2 }
  },
  'Foundation Stone of Grounding': {
    name: 'Foundation Stone of Grounding',
    type: 'Stability Anchor',
    rarity: 'Rare',
    description: 'A rustic stone that roots you in reality when stress looms.',
    powers: ['Stress grounding', 'Reality anchoring', 'Panic prevention'],
    statBoosts: { 'Elemental Harmony': 2 }
  },
  'Sanctuary Shroud of Comfort': {
    name: 'Sanctuary Shroud of Comfort',
    type: 'Comfort Codex',
    rarity: 'Epic',
    description: 'A worn grimoire that wraps the mind in collective solace.',
    powers: ['Social comfort', 'Belonging enhancement', 'Isolation protection'],
    statBoosts: { "Heart's Compass": 2 }
  },
  'Empathy Conduit Artifact': {
    name: 'Empathy Conduit Artifact',
    type: 'Connection Keystone',
    rarity: 'Epic',
    description: 'A heart-shaped gem that amplifies compassion when guiding others.',
    powers: ['Emotional resonance', 'Listener\'s clarity', 'Support amplification'],
    statBoosts: { "Heart's Compass": 3 }
  },
  'Toolkit Grimoire Artifact': {
    name: 'Toolkit Grimoire Artifact',
    type: 'Strategy Grimoire',
    rarity: 'Rare',
    description: 'A pocket grimoire filled with diverse coping methods.',
    powers: ['Adaptive strategy recall', 'Creative problem-solving', 'Perspective shift'],
    statBoosts: { 'Sight Beyond Sight': 2, "Heart's Compass": 1 }
  }
};


type GrimoireScreenProps = {
  visible: boolean;
  onClose: () => void;
  grimoire?: any;
  onStatGain?: (statName: string, amount: number) => void;
  onArtifactUnlock?: (artifact: any) => void;
  onSkillLearned?: (skills: string[]) => void;
  onStoryComplete?: (completionData: {
    grimoireId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }) => void;
};

const GrimoireScreen = ({ visible, onClose, grimoire, onStatGain, onArtifactUnlock, onSkillLearned, onStoryComplete }: GrimoireScreenProps) => {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  // Improved data lookup with better error handling
  const storyData = grimoire?.id && allStoriesData[grimoire.id as keyof typeof allStoriesData] 
    ? allStoriesData[grimoire.id as keyof typeof allStoriesData] 
    : chronicleOfTheFracturedMindData; // fallback to story 1

  // Add debug logging
  console.log('GrimoireScreen props:', { visible, grimoire });
  console.log('Story data found:', storyData ? 'Yes' : 'No');
  console.log('Story ID being looked up:', grimoire?.id);
  console.log('Available story IDs:', Object.keys(allStoriesData));

  if (!storyData) {
    console.error('No story data found for grimoire:', grimoire);
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Text style={{ color: 'white', fontSize: 18, margin: 20 }}>
            Story data not found for ID: {grimoire?.id}
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 20, backgroundColor: '#333', borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
  const passages = storyData.passages;
  const grimoireTitle = storyData.title;
  const grimoireSubtitle = storyData.subtitle;
  const grimoireAtmosphere = storyData.atmosphere;
  const grimoireDifficulty = storyData.difficulty;
  const grimoireRarity = storyData.rarity;
  
  const [currentId, setCurrentId] = useState('start');
  const [totalStatGains, setTotalStatGains] = useState<{[key: string]: number}>({});
  const [recentGains, setRecentGains] = useState<{[key: string]: number}>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<any>(null);
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const statGainAnim = new Animated.Value(0);
  const passageAnim = new Animated.Value(0);
  const artifactUnlockAnim = new Animated.Value(0);

  const current = passages.find((p: any) => p.id === currentId);

  // Add more debug logging
  console.log('Passages array:', passages);
  console.log('Current ID:', currentId);
  console.log('Current passage found:', current);
  console.log('Story data structure:', {
    title: storyData.title,
    passagesCount: passages?.length,
    firstPassage: passages?.[0]
  });

  useEffect(() => {
    if (visible) {
      // Reset state when opening
      setCurrentId('start');
      setTotalStatGains({});
      setUnlockedArtifacts([]);
      setLearnedSkills([]);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Animate passage text
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (currentId) {
      // Reset and animate passage when changing
      passageAnim.setValue(0);
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentId]);

  const handleChoice = (choice: any) => {
    const { next, statEffects, skillsLearned, artifactUnlock, isEnding, finalRewards, wisdomGained } = choice;
    
    // Handle stat effects
    if (statEffects) {
      const newRecentGains: {[key: string]: number} = {};
      
      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains(prev => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number)
        }));
        
        // Call parent callback for stat gain
        if (onStatGain) {
          onStatGain(statName, amount as number);
        }
      });
      
      setRecentGains(newRecentGains);
      setShowStatGain(true);
      
      // Animate stat gain notification
      Animated.sequence([
        Animated.timing(statGainAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(statGainAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStatGain(false);
      });
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setLearnedSkills(prev => [...prev, ...skillsLearned]);
      if (onSkillLearned) {
        onSkillLearned(skillsLearned);
      }
    }

    // Handle artifact unlock
    if (artifactUnlock && artifactDatabase[artifactUnlock as keyof typeof artifactDatabase]) {
      const artifact = artifactDatabase[artifactUnlock as keyof typeof artifactDatabase];
      setNewArtifact(artifact);
      setUnlockedArtifacts(prev => [...prev, artifactUnlock]);
      setShowArtifactUnlock(true);
      
      // Animate artifact unlock
      Animated.sequence([
        Animated.timing(artifactUnlockAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(artifactUnlockAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowArtifactUnlock(false);
      });

      if (onArtifactUnlock) {
        onArtifactUnlock(artifact);
      }
    }
    
    // Check if this is an ending choice
    if (isEnding || (!next && (finalRewards || wisdomGained))) {
      // End of grimoire - show completion summary
      const totalGainsText = Object.entries(totalStatGains)
        .map(([stat, amount]) => `${stat}: +${amount}`)
        .join('\n');
      
      const artifactsText = unlockedArtifacts.length > 0 
        ? `\n\n🎭 Artifacts Unlocked:\n${unlockedArtifacts.join('\n')}`
        : '';
      
      const skillsText = learnedSkills.length > 0 
        ? `\n\n🎯 Coping Skills Learned:\n${learnedSkills.join(', ')}`
        : '';

      const finalRewardsText = finalRewards && finalRewards.length > 0
        ? `\n\n🏆 Final Rewards:\n${finalRewards.join('\n')}`
        : '';

      const wisdomText = wisdomGained 
        ? `\n\n📜 Wisdom Gained:\n"${wisdomGained}"`
        : '';
      
      Alert.alert(
        '📚 Grimoire Mastered! ✨',
        `Your journey through the ${grimoireTitle} has transformed your understanding:\n\n⚡ Archive Foundations Strengthened:\n${totalGainsText}${artifactsText}${skillsText}${finalRewardsText}${wisdomText}\n\nYour character has grown significantly through these choices. The wisdom you've gained will serve you well in future challenges.`,
        [{ text: 'Return to Archive', onPress: onClose }]
      );

      if (onStoryComplete) {
        onStoryComplete({
          grimoireId: grimoire?.id || '',
          finalRewards: finalRewards || [],
          skillsLearned: learnedSkills,
          totalStatGains: totalStatGains,
        });
      }
    } else if (next) {
      setTimeout(() => setCurrentId(next), 500);
    }
  };

  const StatGainNotification = () => {
    if (!showStatGain) return null;
    
    return (
      <Animated.View 
        style={[
          globalStyles.grimoireStatGainNotification,
          { 
            opacity: statGainAnim,
            transform: [{
              translateY: statGainAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.95)', 'rgba(34, 197, 94, 0.95)']}
          style={globalStyles.grimoireStatGainGradient}
        >
          <Icon name="trending-up" size={20} color="#065F46" />
          <View style={globalStyles.grimoireStatGainContent}>
            <Text style={globalStyles.grimoireStatGainTitle}>Archive Foundations Strengthened!</Text>
            {Object.entries(recentGains).map(([stat, amount]) => (
              <Text key={stat} style={globalStyles.grimoireStatGainText}>
                {stat} +{amount}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ArtifactUnlockNotification = () => {
    if (!showArtifactUnlock || !newArtifact) return null;
    
    return (
      <Animated.View 
        style={[
          globalStyles.grimoireArtifactUnlockNotification,
          { 
            opacity: artifactUnlockAnim,
            transform: [{
              scale: artifactUnlockAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.1, 1]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(168, 85, 247, 0.95)', 'rgba(139, 92, 246, 0.95)']}
          style={globalStyles.grimoireArtifactUnlockGradient}
        >
          <Icon name="gift" size={24} color="#FCD34D" />
          <View style={globalStyles.grimoireArtifactUnlockContent}>
            <Text style={globalStyles.grimoireArtifactUnlockTitle}>🎭 New Artifact Unlocked! ✨</Text>
            <Text style={globalStyles.grimoireArtifactUnlockName}>{newArtifact.name}</Text>
            <Text style={globalStyles.grimoireArtifactUnlockDescription}>{newArtifact.description}</Text>
            <View style={globalStyles.grimoireArtifactPowers}>
              {newArtifact.powers.slice(0, 2).map((power: string, index: number) => (
                <Text key={index} style={globalStyles.grimoireArtifactPowerText}>• {power}</Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const getRarityColors = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'Legendary': return ['#F97316', '#FCD34D'];
      case 'Epic': return ['#A855F7', '#F472B6'];
      case 'Rare': return ['#3B82F6', '#06B6D4'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  const getChoiceIcon = (choice: any) => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes('Sight Beyond Sight')) return '👁️';
      if (stats.includes('Unbreakable Will')) return '⚓';
      if (stats.includes("Heart's Compass")) return '🔗';
      if (stats.includes('Elemental Harmony')) return '⚖️';
    }
    return '📜';
  };

  const getChoiceColor = (choice: any): readonly [string, string] => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes('Sight Beyond Sight')) return ['#3B82F6', '#06B6D4'];
      if (stats.includes('Unbreakable Will')) return ['#059669', '#10B981'];
      if (stats.includes("Heart's Compass")) return ['#DC2626', '#F472B6'];
      if (stats.includes('Elemental Harmony')) return ['#D97706', '#FCD34D'];
    }
    return ['#6B7280', '#9CA3AF'];
  };

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent={true} 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={globalStyles.grimoireModalOverlay}>
        <View style={globalStyles.grimoireModalContent}>
          {/* Header */}
          <View style={globalStyles.grimoireHeader}>
            <View style={globalStyles.grimoireHeaderLeft}>
              <View style={globalStyles.grimoireTitleRow}>
                <Text style={globalStyles.grimoireTitle}>
                  {grimoireTitle}
                </Text>
                <View style={globalStyles.grimoireRarityBadge}>
                  <Text style={globalStyles.grimoireRarityText}>
                    {grimoireRarity}
                  </Text>
                </View>
              </View>
              <Text style={globalStyles.grimoireSubtitle}>
                {grimoireSubtitle}
              </Text>
              <View style={globalStyles.grimoireDifficultyRow}>
                <Icon name="target" size={10} color={theme.rarityEpic} />
                <Text style={globalStyles.grimoireDifficultyText}>
                  {grimoireDifficulty}
                </Text>
              </View>
              <View style={globalStyles.grimoireAtmosphereRow}>
                <Icon name="wind" size={10} color={theme.statusInfo} />
                <Text style={globalStyles.grimoireAtmosphereText}>
                  {grimoireAtmosphere}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={globalStyles.grimoireCloseButton}
              onPress={onClose}
            >
              <Icon name="x" size={16} style={globalStyles.grimoireCloseIcon} />
            </TouchableOpacity>
          </View>
          {/* Main content */}
          <View style={globalStyles.grimoireMainContent}>
            {/* Current atmosphere */}
            {current?.atmosphere && (
              <View style={globalStyles.grimoireCurrentAtmosphere}>
                <Icon name="eye" size={12} color={theme.statusInfo} />
                <Text style={globalStyles.grimoireAtmosphereText}>
                  ✦ {current.atmosphere} ✦
                </Text>
              </View>
            )}
            {/* Passage text */}
            <View style={globalStyles.grimoirePassageContainer}>
              <Text style={globalStyles.grimoirePassageText}>
                {current?.text || 'NO TEXT FOUND'}
              </Text>
            </View>
            {/* Choices */}
            <View style={globalStyles.grimoireChoicesContainer}>
              {current?.choices?.map((choice: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={globalStyles.grimoireChoiceButton}
                  onPress={() => handleChoice(choice)}
                  activeOpacity={0.8}
                >
                  <View style={globalStyles.grimoireChoiceRow}>
                    <Text style={globalStyles.grimoireChoiceIcon}>
                      {getChoiceIcon(choice)}
                    </Text>
                    <Text style={globalStyles.grimoireChoiceText}>
                      {choice.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GrimoireScreen;