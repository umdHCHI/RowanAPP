export interface JournalChoice {
  id: string
  journalType: 'drawing' | 'writing' | 'voice' | 'other', //Other should be for mini game
  attributeChanges?: {
    connection?: number
    courage?: number
    exploration?: number
    fear?: number
  }
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nextJournal?: number
}

export interface JournalEquipmentReward {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'helmet' | 'boots'
  imagePath: string
}

export interface JournalContent {
  prompts: JournalPromptContent[]
  choices?: JournalChoice[]
  voidClarity: number // 0-100, affects visual clarity
  attributeChanges?: {
    connection?: number
    courage?: number
    exploration?: number
    fear?: number
  }
  equipmentReward?: JournalEquipmentReward
  nextJournal?: number
}

export interface JournalPromptContent {
  id: string
  speaker: 'curator' | 'narrator' | 'player'
  text: string
  yourEmotion?: 'default' | 'excited' | 'talking' | 'tired' | 'winking' | 'stretch' | 'pawup'
  attributeChanges?: {
    connection?: number
    courage?: number
    exploration?: number
    fear?: number
  }
}

export interface JournalPrompt {
  id: string
  title: string
  prompts: JournalPromptContent[]
  choices?: JournalChoice[]
  voidClarity: number // 0-100, affects visual clarity
  equipmentReward?: JournalEquipmentReward
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  {
    id: 'journal-prompt-0',
    title: 'The Void',
    voidClarity: 0,
    prompts: [
      {
        id: 'journal-prompt-content-1',
        speaker: 'narrator',
        text: 'What is your favorite color?',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'journal-prompt-content-2',
        speaker: 'curator',
        text: 'Hello? Can you hear me? Don\'t worry, you\'re not alone.',
        yourEmotion: 'talking',
        attributeChanges: { connection: 1 },
      },
      {
        id: 'curator-tutorial-1',
        speaker: 'narrator',
        text: 'I see you\'re new here. Let me explain something important: your choices shape who you become. Look at the top of your screen—you\'ll see your attributes: Connection, Courage, Exploration, and Fear.',
        yourEmotion: 'talking',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'curator-tutorial-2',
        speaker: 'narrator',
        text: 'Exploration is about curiosity—asking questions, seeking understanding, and being open to new perspectives. When you choose to explore, you gain clarity about yourself and the world around you.',
        yourEmotion: 'excited',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'curator-tutorial-3',
        speaker: 'narrator',
        text: 'Watch how your choices affect these attributes. Each decision you make will show you what changes. Try choosing something that increases your Exploration—it will help you see more clearly.',
        yourEmotion: 'winking',
        attributeChanges: { exploration: 1 },
      },
    ],
    choices: [
      {
        id: 'journal-choice-1',
        journalType: 'writing',
        attributeChanges: { exploration: 1 },
        difficulty: 'Beginner',
        nextJournal: 2,
      },
      {
          id: 'journal-choice-2',
        journalType: 'drawing',
        attributeChanges: { exploration: 1, fear: -1 },
        difficulty: 'Beginner',
        nextJournal: 3,
      },
    ],
  },
  
  {
    id: 'journal-prompt-1',
    title: 'Journal Prompt 1',
    prompts: [
      {
        id: 'journal-prompt-content-4',
        speaker: 'narrator',
        text: 'Ah, there you are! I\'m The Curator. Welcome to The Archive, though it seems you\'ve arrived in quite a state.',
        yourEmotion: 'excited',
        attributeChanges: { connection: 1 },
      },
      {
        id: 'journal-prompt-content-5',
        speaker: 'curator',
        text: 'This place... it changes based on how you see things. Right now, you\'re seeing the void—the feeling of being overwhelmed.',
        yourEmotion: 'default',
        attributeChanges: { exploration: 1 },
      },
    ],
    voidClarity: 25,
  },
  {
    id: 'journal-prompt-2',
    title: 'Journal Prompt 2',
    prompts: [
      {
        id: 'journal-prompt-content-6',
        speaker: 'narrator',
        text: 'Slowly, the darkness begins to shift. Bookshelves emerge from the shadows, tall and mysterious.',
        yourEmotion: 'winking',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'curator-4',
        speaker: 'curator',
        text: 'The Archive is a place of stories—your stories. Every book here holds a piece of your experience with stress and how you\'ve learned to handle it.',
        yourEmotion: 'talking',
        attributeChanges: { connection: 1 },
      },
      {
        id: 'curator-5',
        speaker: 'curator',
        text: 'As you understand more about yourself, this place will become clearer. The books will reveal themselves to you.',
        yourEmotion: 'winking',
        attributeChanges: { exploration: 1 },
      },
    ],
    voidClarity: 50,
    equipmentReward: {
      id: 'torch-1',
      name: 'Torch of Clarity',
      type: 'weapon',
      imagePath: 'equipment/weapons/Torch.png',
    },
  },
  {
    id: 'journal-prompt-3',
    title: 'Understanding Begins',
    voidClarity: 75,
    prompts: [
      {
        id: 'understanding-1',
        speaker: 'narrator',
        text: 'The library becomes more defined. You can see the candles, the glowing lights, the intricate details of this place.',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'curator-6',
        speaker: 'curator',
        text: 'Stress isn\'t something to eliminate—it\'s something to understand. When you know it, you can work with it.',
        yourEmotion: 'stretch',
        attributeChanges: { courage: 1 },
      },
      {
        id: 'curator-7',
        speaker: 'curator',
        text: 'Every choice you make here shapes how you see things. Connection, courage, exploration... even fear has its place.',
        yourEmotion: 'pawup',
        attributeChanges: { connection: 1 },
      },
    ],
    
  },
  {
    id: 'journal-prompt-3',
    title: 'The Full Archive',
    voidClarity: 100,
    prompts: [
      {
        id: 'full-1',
        speaker: 'narrator',
        text: 'The Archive is now fully visible. It\'s beautiful—a sanctuary of knowledge and self-understanding.',
        attributeChanges: { exploration: 1 },
      },
      {
        id: 'curator-8',
        speaker: 'curator',
        text: 'You\'ve come so far. The void is gone because you\'ve found clarity. But this is just the beginning of your journey.',
        yourEmotion: 'excited',
        attributeChanges: { courage: 1 },
      },
      {
        id: 'curator-9',
        speaker: 'curator',
        text: 'Now, you can reflect on what you\'ve learned or practice reframing your thoughts. Both paths will help you in the real world.',
        yourEmotion: 'talking',
        attributeChanges: { connection: 1 },
      },
    ],
    
  },
]

