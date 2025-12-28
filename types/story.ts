export interface StoryCardConfig {
  id: string
  label: string
  title: string
  subtitle: string
  tagline: string
  chapterId: number
}

export interface StoryChoice {
  id: string
  text: string
  attributeChanges?: {
    connection?: number
    courage?: number
    exploration?: number
    fear?: number
  }
  nextChapter?: number
}

export interface StoryDialogue {
  id: string
  speaker: 'curator' | 'narrator' | 'player'
  text: string
  curatorEmotion?: 'default' | 'excited' | 'talking' | 'tired' | 'winking' | 'stretch' | 'pawup'
}

export interface StoryChapter {
  id: number
  title: string
  dialogues: StoryDialogue[]
  choices?: StoryChoice[]
  voidClarity: number // 0-100, affects visual clarity
  equipmentReward?: {
    id: string
    name: string
    type: 'weapon' | 'armor' | 'helmet' | 'boots'
    imagePath: string
  }
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 0,
    title: 'The Void',
    voidClarity: 0,
    dialogues: [
      {
        id: 'void-1',
        speaker: 'narrator',
        text: 'Everything is dark. You feel lost, disconnected, like you\'re floating in nothingness.',
      },
      {
        id: 'void-2',
        speaker: 'narrator',
        text: 'Stress has wrapped around you like a fog, making it hard to see where you are or where you\'re going.',
      },
      {
        id: 'curator-1',
        speaker: 'curator',
        text: 'Hello? Can you hear me? Don\'t worry, you\'re not alone.',
        curatorEmotion: 'talking',
      },
      {
        id: 'curator-tutorial-1',
        speaker: 'curator',
        text: 'I see you\'re new here. Let me explain something important: your choices shape who you become. Look at the top of your screen—you\'ll see your attributes: Connection, Courage, Exploration, and Fear.',
        curatorEmotion: 'talking',
      },
      {
        id: 'curator-tutorial-2',
        speaker: 'curator',
        text: 'Exploration is about curiosity—asking questions, seeking understanding, and being open to new perspectives. When you choose to explore, you gain clarity about yourself and the world around you.',
        curatorEmotion: 'excited',
      },
      {
        id: 'curator-tutorial-3',
        speaker: 'curator',
        text: 'Watch how your choices affect these attributes. Each decision you make will show you what changes. Try choosing something that increases your Exploration—it will help you see more clearly.',
        curatorEmotion: 'winking',
      },
    ],
    choices: [
      {
        id: 'void-choice-1',
        text: 'Try to reach out toward the voice',
        attributeChanges: { courage: 1, connection: 1 },
        nextChapter: 1,
      },
      {
        id: 'void-choice-2',
        text: 'Stay still and listen carefully, observing your surroundings',
        attributeChanges: { exploration: 1, fear: -1 },
        nextChapter: 1,
      },
    ],
  },
  {
    id: 1,
    title: 'A Faint Light',
    voidClarity: 25,
    dialogues: [
      {
        id: 'light-1',
        speaker: 'narrator',
        text: 'As you reach out, a faint light begins to pierce through the darkness.',
      },
      {
        id: 'curator-2',
        speaker: 'curator',
        text: 'Ah, there you are! I\'m The Curator. Welcome to The Archive, though it seems you\'ve arrived in quite a state.',
        curatorEmotion: 'excited',
      },
      {
        id: 'curator-3',
        speaker: 'curator',
        text: 'This place... it changes based on how you see things. Right now, you\'re seeing the void—the feeling of being overwhelmed.',
        curatorEmotion: 'default',
      },
    ],
    choices: [
      {
        id: 'light-choice-1',
        text: 'What is this place?',
        attributeChanges: { exploration: 1 },
        nextChapter: 2,
      },
      {
        id: 'light-choice-2',
        text: 'How do I get out of here?',
        attributeChanges: { courage: 1, fear: 1 },
        nextChapter: 2,
      },
    ],
  },
  {
    id: 2,
    title: 'The Archive Reveals Itself',
    voidClarity: 50,
    dialogues: [
      {
        id: 'archive-1',
        speaker: 'narrator',
        text: 'Slowly, the darkness begins to shift. Bookshelves emerge from the shadows, tall and mysterious.',
      },
      {
        id: 'curator-4',
        speaker: 'curator',
        text: 'The Archive is a place of stories—your stories. Every book here holds a piece of your experience with stress and how you\'ve learned to handle it.',
        curatorEmotion: 'talking',
      },
      {
        id: 'curator-5',
        speaker: 'curator',
        text: 'As you understand more about yourself, this place will become clearer. The books will reveal themselves to you.',
        curatorEmotion: 'winking',
      },
    ],
    choices: [
      {
        id: 'archive-choice-1',
        text: 'Examine the bookshelves',
        attributeChanges: { exploration: 1, connection: 1 },
        nextChapter: 3,
      },
      {
        id: 'archive-choice-2',
        text: 'Follow The Curator',
        attributeChanges: { connection: 1, courage: 1 },
        nextChapter: 3,
      },
    ],
    equipmentReward: {
      id: 'torch-1',
      name: 'Torch of Clarity',
      type: 'weapon',
      imagePath: 'equipment/weapons/Torch.png',
    },
  },
  {
    id: 3,
    title: 'Understanding Begins',
    voidClarity: 75,
    dialogues: [
      {
        id: 'understanding-1',
        speaker: 'narrator',
        text: 'The library becomes more defined. You can see the candles, the glowing lights, the intricate details of this place.',
      },
      {
        id: 'curator-6',
        speaker: 'curator',
        text: 'Stress isn\'t something to eliminate—it\'s something to understand. When you know it, you can work with it.',
        curatorEmotion: 'stretch',
      },
      {
        id: 'curator-7',
        speaker: 'curator',
        text: 'Every choice you make here shapes how you see things. Connection, courage, exploration... even fear has its place.',
        curatorEmotion: 'pawup',
      },
    ],
    choices: [
      {
        id: 'understanding-choice-1',
        text: 'I want to learn more',
        attributeChanges: { exploration: 2, connection: 1 },
        nextChapter: 4,
      },
      {
        id: 'understanding-choice-2',
        text: 'How can I apply this?',
        attributeChanges: { courage: 2 },
        nextChapter: 4,
      },
    ],
  },
  {
    id: 4,
    title: 'The Full Archive',
    voidClarity: 100,
    dialogues: [
      {
        id: 'full-1',
        speaker: 'narrator',
        text: 'The Archive is now fully visible. It\'s beautiful—a sanctuary of knowledge and self-understanding.',
      },
      {
        id: 'curator-8',
        speaker: 'curator',
        text: 'You\'ve come so far. The void is gone because you\'ve found clarity. But this is just the beginning of your journey.',
        curatorEmotion: 'excited',
      },
      {
        id: 'curator-9',
        speaker: 'curator',
        text: 'Now, you can reflect on what you\'ve learned or practice reframing your thoughts. Both paths will help you in the real world.',
        curatorEmotion: 'talking',
      },
    ],
    choices: [
      {
        id: 'final-choice-1',
        text: 'I\'d like to journal about this',
        attributeChanges: { connection: 1 },
        nextChapter: -1, // -1 signals end of story, go to journal
      },
      {
        id: 'final-choice-2',
        text: 'I want to practice thought reframing',
        attributeChanges: { courage: 1 },
        nextChapter: -2, // -2 signals end of story, go to minigame
      },
    ],
  },
]

