// Centralized story data - extracted from components for better organization
import { Grimoire } from '../screens/characterStory/StoryCatalogScreen';

// Grimoire catalog data
export const availableGrimoires: Grimoire[] = [
  {
    id: '1',
    title: 'Chronicle of the Fractured Mind',
    category: 'Academic Pressures Archive',
    description: 'Navigate the labyrinthine passages where academic stress echoes through memory halls. Master the ancient arts of mindful focus and strategic thinking.',
    difficulty: 'Deep Introspection',
    timeToComplete: '15 min',
    exploration: 65,
    revelations: 3,
    rarity: 'Epic',
    skillFocus: ['Mindfulness', 'Stress Management', 'Academic Balance'],
    atmosphere: 'Dimly lit corridors with floating equations',
    statBoosts: ['Sight Beyond Sight', 'Elemental Harmony'],
    unlockLevel: 1,
    isLocked: false,
  },
  {
    id: '2',
    title: 'The Perfectionist\'s Paradox',
    category: 'Self-Relationship Vault',
    description: 'Explore the gilded chambers where impossible standards create beautiful prisons. Learn the forbidden art of self-compassion and authentic growth.',
    difficulty: 'Shadow Work',
    timeToComplete: '20 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Legendary',
    skillFocus: ['Self-Compassion', 'Growth Mindset', 'Inner Critic Work'],
    atmosphere: 'Glittering halls with broken mirrors',
    statBoosts: ['Heart\'s Compass', 'Unbreakable Will'],
    unlockLevel: 1,
    isLocked: false,
  },
  {
    id: '3',
    title: 'Codex of Social Anxieties',
    category: 'Connection & Communication Archive',
    description: 'Decipher the ancient runes of social connection. Master spells of authentic communication and courage in the face of judgment.',
    difficulty: 'Courage Building',
    timeToComplete: '18 min',
    exploration: 25,
    revelations: 1,
    rarity: 'Rare',
    skillFocus: ['Social Skills', 'Anxiety Management', 'Authenticity'],
    atmosphere: 'Crowded halls where whispers echo with judgment',
    statBoosts: ['Heart\'s Compass', 'Sight Beyond Sight'],
    unlockLevel: 3,
    isLocked: false,
  },
  {
    id: '4',
    title: 'Grimoire of Overwhelming Tides',
    category: 'Emotional Regulation Sanctum',
    description: 'Navigate the tempestuous waters of overwhelming emotions. Learn ancient techniques to ride the waves rather than be swept away.',
    difficulty: 'Emotional Mastery',
    timeToComplete: '25 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Epic',
    skillFocus: ['Emotional Regulation', 'Distress Tolerance', 'Grounding'],
    atmosphere: 'Stormy chambers with crashing waves of feeling',
    statBoosts: ['Unbreakable Will', 'Elemental Harmony'],
    unlockLevel: 5,
    isLocked: true,
  },
  {
    id: '5',
    title: 'Manual of Life Balance',
    category: 'Harmony & Wellness Archive',
    description: 'Study the sacred geometry of work-life balance. Master the delicate art of saying no while still achieving your dreams.',
    difficulty: 'Life Architecture',
    timeToComplete: '22 min',
    exploration: 80,
    revelations: 4,
    rarity: 'Rare',
    skillFocus: ['Boundary Setting', 'Time Management', 'Self-Care'],
    atmosphere: 'Balanced chambers with scales of light and shadow',
    statBoosts: ['Elemental Harmony', 'Unbreakable Will'],
    unlockLevel: 2,
    isLocked: false,
  },
  {
    id: '6',
    title: 'Grimoire of Inner Transformation',
    category: 'Advanced Self-Mastery',
    description: 'The most powerful grimoire in the Archive. Synthesize all learned wisdom into a personal philosophy of resilience and growth.',
    difficulty: 'Mastery Integration',
    timeToComplete: '35 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Legendary',
    skillFocus: ['Integration', 'Wisdom Synthesis', 'Life Philosophy'],
    atmosphere: 'Radiant chambers where all knowledge converges',
    statBoosts: ['All Foundations'],
    unlockLevel: 10,
    isLocked: true,
  },
];

// Story content data
export const storyContent = {
  '1': {
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
      // Add more passages here...
    ]
  },
  // Add more stories here...
};

// Artifact database
export const artifactDatabase = {
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
  // Add more artifacts here...
};

// Mental artifacts data
export const mentalArtifacts = [
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
  // Add more artifacts here...
]; 