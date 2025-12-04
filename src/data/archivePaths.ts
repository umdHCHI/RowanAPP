import { DifficultyConfig, PathData, PathType } from '../types';

export const ArchivePaths: Record<PathType, PathData> = {
  character: {
    icon: '⚔️',
    title: 'Path of the Forged Soul',
    subtitle: 'Character Creation Realm',
    description:
      'Shape an avatar to walk these halls for you. Choose how they look, choose how they stand in the face of stress, and begin your story through their footsteps.',
    curatorNote:
      '"Some scholars learn best through creation. A crafted self can face storms you may fear to touch."',
    benefits: [
      'Build your Archive avatar',
      'Express the self you want to grow into',
      'Light your way through your story journey'
    ],
    atmosphere: 'Creative Workshop',
    color: '#f72585',
    secondaryColor: '#4cc9f0',
    gradientColors: [
      'rgba(247, 37, 133, 0.9)',
      'rgba(76, 201, 240, 0.7)',
      'rgba(157, 78, 221, 0.8)'
    ],
    buttonText: 'Enter the Forge',
    journey: 'Embark on the Path of Creation'
  },

  personality: {
    icon: '🔮',
    title: 'Path of the True Self',
    subtitle: 'Personality Discovery Chambers',
    description:
      'Step into quiet chambers built for reflection. Explore your traits, notice your patterns, and let The Archive shape future stories around your nature.',
    curatorNote:
      '"Others find clarity by looking inward. The more you know your patterns, the steadier your path becomes."',
    benefits: [
      'Learn your core traits',
      'Get matched story paths',
      'See coping ideas tailored to you'
    ],
    atmosphere: 'Reflection Sanctum',
    color: '#9d4edd',
    secondaryColor: '#06ffa5',
    gradientColors: [
      'rgba(157, 78, 221, 0.9)',
      'rgba(6, 255, 165, 0.7)',
      'rgba(76, 201, 240, 0.8)'
    ],
    buttonText: 'Enter the Chambers',
    journey: 'Embark on the Path of Discovery'
  }
};
export const CharacterArchetypes = {
  scholar: {
    positiveThoughts:[
      { text: "Break into steps", powerUp: "slowtime" },
      { text: "Planning saves time", powerUp: "multiplier" },
      { text: "Stick with plans", powerUp: "extralife" },
      { text: "Details prevent problems", powerUp: "fastshoot" },
      { text: "Organize for results", powerUp: "shield" },
      { text: "persistence pays off", powerUp: "multishot" },
      { text: "Complete tasks thoroughly", powerUp: "slowtime" },
      { text: "I can wait for a better future", powerUp: "multiplier" },
    ],
    negativeThoughts: [
      "If I don't do this perfectly, it's not worth doing",
      "I should have planned better", 
      "this mistake proves I'm incompetent",
      "I can't relax until everything on my list is complete",
      "Other people are so disorganized and irresponsible",
      "I'm behind schedule and everything is falling apart",
      "I should be more productive",
      "I'm wasting time",
      "If I don't control everything, something will go wrong",
    ]
  },
  warrior: {
    positiveThoughts: [
      { text: "Socialization energizes me", powerUp: "fastshoot" },
      { text: "Networking brings opportunities", powerUp: "shield" },
      { text: "Make challenges fun", powerUp: "extralife" },
      { text: "People spark creativity", powerUp: "multishot" },
      { text: "Express ideas confidently", powerUp: "shield" },
      { text: "Stimulation improves performance", powerUp: "multiplier" },
      { text: "collaboration creates energy", powerUp: "slowtime" },
      { text: "Inspire with enthusiasm", powerUp: "fastshoot" },
    ],
    negativeThoughts: [
      "I need to be around people right now or I'll feel empty",
      "If I'm alone too long, something must be wrong with me",
      "I should be more exciting and entertaining",
      "Quiet people probably think I'm annoying",
      "I can't handle this boring, repetitive task",
      "If I'm not the center of attention, I must be failing",
      "I need stimulation now; this is unbearable",
    ]
  },
  sage: {
    positiveThoughts: [
      { text: "Sensitivity notices details", powerUp: "slowtime" },
      { text: "Awareness helps preparation", powerUp: "multiplier" },
      { text: "Depth understands complexity", powerUp: "shield" },
      { text: "Concern motivates improvement", powerUp: "extralife" },
      { text: "Risk awareness informs", powerUp: "fastshoot" },
      { text: "Learn from challenges", powerUp: "multishot" },
      { text: "Processing reveals priorities", powerUp: "slowtime" },
      { text: "Deep feelings connect", powerUp: "multiplier" },
    ],
    negativeThoughts: [
      "What if everything goes wrong?",
      "I always mess things up",
      "They probably think I'm stupid",
      "This feeling will never go away",
      "I can't handle this stress",
      "Something bad is definitely going to happen",
      "I'm not good enough",
      "Everyone else has it figured out except me",
      "I should be over this by now",
      "This anxiety proves I'm weak",
    ]
  },
  healer: {
    positiveThoughts: [
      { text: "Find win-win solutions", powerUp: "extralife" },
      { text: "Understand their perspective", powerUp: "shield" },
      { text: "Trust good intentions", powerUp: "slowtime" },
      { text: "Help others succeed", powerUp: "multishot" },
      { text: "Maintain harmony", powerUp: "multiplier" },
      { text: "collaborate over compete", powerUp: "fastshoot" },
      { text: "Build lasting relationships", powerUp: "extralife" },
      { text: "Show empathy", powerUp: "shield" },
    ],
    negativeThoughts: [
      "I can't say no or they won't like me anymore",
      "I should put their needs before mine",
      "If I disagree, I'll hurt their feelings",
      "I'm being selfish for wanting this",
      "I must have done something wrong if they're upset",
      "I can't handle conflict",
      "I need to fix this immediately",
    ]
  },
  explorer: {
    positiveThoughts: [
      { text: "Try different approaches", powerUp: "fastshoot" },
      { text: "New perspectives help", powerUp: "multishot" },
      { text: "Challenge my beliefs", powerUp: "shield" },
      { text: "Combine different ideas", powerUp: "multiplier" },
      { text: "Explore new concepts", powerUp: "extralife" },
      { text: "Connect unrelated things", powerUp: "slowtime" },
      { text: "Change when needed", powerUp: "fastshoot" },
      { text: "Abstract becomes practical", powerUp: "multishot" },
    ],
    negativeThoughts: [
      "I can't decide because a better option may exist",
      "This work is meaningless and beneath my potential",
      "What if I'm missing out on something more interesting?",
      "I have so many ideas but I never finish anything",
      "Other people don't understand my creative vision",
      "This conventional approach is boring and uninspiring",
      "I should be innovating more in my life",
    ]
  }
};

export const DIFFICULTY_LEVELS: Record<string, DifficultyConfig> = {
  zen: {
    name: 'ZEN',
    icon: '🧘',
    modifiers: {
      thoughtSpeed: 0.6,
      spawnRate: 1.5,
      negativeThoughtChance: 0.25,
      powerUpChance: 0.5,
      scoreMultiplier: 0.8,
      livesStart: 5,
      waveTarget: 8,
      levelScaling: 0.1,
      maxLevels: 2,
    }
  },
  normal: {
    name: 'BALANCED',
    icon: '🎯',
    modifiers: {
      thoughtSpeed: 1.0,
      spawnRate: 1.0,
      negativeThoughtChance: 0.4,
      powerUpChance: 0.3,
      scoreMultiplier: 1.0,
      livesStart: 3,
      waveTarget: 12,
      levelScaling: 0.15,
      maxLevels: 3,
    }
  },
  intense: {
    name: 'INTENSE',
    icon: '💪',
    modifiers: {
      thoughtSpeed: 1.25,
      spawnRate: 0.7,
      negativeThoughtChance: 0.6,
      powerUpChance: 0.2,
      scoreMultiplier: 1.5,
      livesStart: 2,
      waveTarget: 15,
      levelScaling: 0.2,
      maxLevels: 4,
    }
  },
  nightmare: {
    name: 'NIGHTMARE',
    icon: '💀',
    modifiers: {
      thoughtSpeed: 1.5,
      spawnRate: 0.5,
      negativeThoughtChance: 0.75,
      powerUpChance: 0.15,
      scoreMultiplier: 2.0,
      livesStart: 1,
      waveTarget: 18,
      levelScaling: 0.25,
      maxLevels: 5,
    }
  }
};

// Power-up definitions
export const POWER_UPS = {
  shield: {
    name: "🛡️ SHIELD",
    description: "Temporary invincibility",
    duration: 5000,
    icon: "🛡️",
  },
  multishot: {
    name: "⚡ MULTI-SHOT",
    description: "Shoot 3 projectiles",
    duration: 8000,
    icon: "⚡",
  },
  slowtime: {
    name: "⏰ SLOW TIME",
    description: "Slow down thoughts",
    duration: 6000,
    icon: "⏰",
  },
  extralife: {
    name: "❤️ EXTRA LIFE",
    description: "Gain one life",
    duration: 0,
    icon: "❤️",
  },
  multiplier: {
    name: "✨ SCORE x2",
    description: "Double score for 10s",
    duration: 10000,
    icon: "✨",
  },
  fastshoot: {
    name: "🚀 RAPID FIRE",
    description: "Faster shooting",
    duration: 7000,
    icon: "🚀",
  },
};