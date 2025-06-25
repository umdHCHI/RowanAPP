import { EquipmentItem } from '../types/equipment';

// Define types for the wellness system
export interface WellnessStats {
  awareness: number;
  resilience: number;
  connection: number;
  balance: number;
}

export interface StatGains {
  [key: string]: number;
}

export interface StoryGains {
  base_gain: Partial<WellnessStats>;
  reflection_bonus: Partial<WellnessStats>;
}

export interface StoryProgression {
  [storyName: string]: StoryGains;
}

export interface ReflectionPattern {
  keywords: string[];
  stat_gain: Partial<WellnessStats>;
}

export interface ReflectionPatterns {
  [patternName: string]: ReflectionPattern;
}

export interface GearItem {
  unlock_condition: string;
  keywords: string[];
  effect: string;
  description: string;
}

export interface GearUnlockSystem {
  [category: string]: {
    [itemName: string]: GearItem;
  };
}

export interface ReflectionAnalysis {
  stat_gains: StatGains;
  gear_unlocks: string[];
  recognition_message: string;
  personal_insights: string[];
}

// Starting wellness stats for college students
export const STARTING_WELLNESS_STATS: WellnessStats = {
  awareness: 6,    // Can notice some emotions, but not deeply self-aware yet
  resilience: 4,   // Struggles with stress (common for college students)
  connection: 8,   // Has some relationships but could be deeper
  balance: 3,      // Poor work-life balance (very common in college)
};

// How stats change based on story completion and reflection quality
export const STAT_PROGRESSION = {
  story_completion: {
    'The Overwhelmed Mind': {
      base_gain: { awareness: 2, resilience: 1 },
      reflection_bonus: { awareness: 1, resilience: 2 },
    },
    'The Lonely Desert': {
      base_gain: { connection: 2, awareness: 1 },
      reflection_bonus: { connection: 2, resilience: 1 },
    },
    'The Perfect Storm': {
      base_gain: { resilience: 2, balance: 1 },
      reflection_bonus: { resilience: 1, balance: 2 },
    },
  } as StoryProgression,

  reflection_patterns: {
    personal_discovery: {
      keywords: ['works for me', 'feels right', 'my way', 'fits my style'],
      stat_gain: { awareness: 2, resilience: 1 }
    },
    trying_something: {
      keywords: ['i tried', 'i used', 'i practiced', 'i applied'],
      stat_gain: { resilience: 1, awareness: 1 }
    },
    rejecting_approach: {
      keywords: ['didn\'t work', 'not for me', 'prefer different', 'chose instead'],
      stat_gain: { awareness: 2, balance: 1 }
    },
    helping_others: {
      keywords: ['helped', 'shared with', 'taught', 'supported'],
      stat_gain: { connection: 2, resilience: 1 }
    }
  } as ReflectionPatterns
};

// Gear unlock system
export const GEAR_UNLOCK_SYSTEM: GearUnlockSystem = {
  focus_items: {
    'Explorer\'s Notebook': {
      unlock_condition: 'Shows pattern of self-reflection and experimentation',
      keywords: ['discovered', 'learned about myself', 'tried different'],
      effect: 'Reflection entries give +1 awareness bonus',
      description: 'A trusted companion for documenting your personal research'
    },
    'Intuition Compass': {
      unlock_condition: 'Demonstrates trust in gut feelings and body wisdom',
      keywords: ['felt right', 'gut feeling', 'intuition', 'body told me'],
      effect: 'Story choices based on intuition have better outcomes',
      description: 'Helps you trust your inner knowing'
    },
    'Choice Anchor': {
      unlock_condition: 'Shows healthy boundary-setting and choice-making',
      keywords: ['decided not to', 'chose instead', 'said no', 'my boundary'],
      effect: 'Can reject story approaches without negative consequences',
      description: 'Reminds you that you always have a choice'
    }
  },

  comfort_layers: {
    'Personal Style Cloak': {
      unlock_condition: 'Identifies and honors their unique coping style',
      keywords: ['my style', 'works for my personality', 'fits who i am'],
      effect: 'Approaches that match your style are 25% more effective',
      description: 'Represents your authentic way of being'
    },
    'Cultural Wisdom Wrap': {
      unlock_condition: 'Integrates family/cultural background with personal growth',
      keywords: ['family taught me', 'cultural practice', 'heritage', 'tradition'],
      effect: 'Unlocks culturally-rooted story options and approaches',
      description: 'Honors the wisdom passed down to you'
    },
    'Adaptation Shield': {
      unlock_condition: 'Shows creative modification of suggested approaches',
      keywords: ['modified', 'adapted', 'made it my own', 'combined'],
      effect: 'Can create hybrid solutions in challenging scenarios',
      description: 'Protects your right to customize any approach'
    }
  },

  mind_shields: {
    'Reality Filter': {
      unlock_condition: 'Demonstrates ability to question and evaluate approaches',
      keywords: ['questioned', 'wondered if', 'tested whether', 'examined'],
      effect: 'Can see through unhelpful advice and suggestions',
      description: 'Helps distinguish helpful from harmful guidance'
    },
    'Growth Mindset Crown': {
      unlock_condition: 'Shows learning from setbacks and "failures"',
      keywords: ['learned from', 'taught me', 'grew from', 'mistake showed'],
      effect: 'Setbacks in stories become growth opportunities',
      description: 'Transforms challenges into learning experiences'
    },
    'Authenticity Guard': {
      unlock_condition: 'Consistently chooses authentic responses over "should" responses',
      keywords: ['honest about', 'really feel', 'authentic', 'true to myself'],
      effect: 'Story outcomes improve when choosing authentic options',
      description: 'Protects you from pressure to be someone you\'re not'
    }
  },

  ground_stones: {
    'Personal Values Foundation': {
      unlock_condition: 'Demonstrates decision-making based on personal values',
      keywords: ['important to me', 'my values', 'what matters', 'principle'],
      effect: 'Decisions aligned with values give bonus stat gains',
      description: 'Keeps you grounded in what truly matters to you'
    },
    'Support Network Roots': {
      unlock_condition: 'Shows building and using healthy support systems',
      keywords: ['reached out', 'talked to', 'friend helped', 'support'],
      effect: 'Can call on support in any crisis scenario',
      description: 'Represents your web of caring relationships'
    },
    'Self-Compassion Stone': {
      unlock_condition: 'Demonstrates kindness toward self during difficulties',
      keywords: ['kind to myself', 'gentle', 'compassionate', 'understanding'],
      effect: 'Self-criticism scenarios have reduced negative impact',
      description: 'A reminder that you deserve kindness, especially from yourself'
    }
  }
};

// Enhanced stat meanings
export const STAT_MEANINGS = {
  awareness: {
    3: 'Often unaware of emotional patterns',
    6: 'Beginning to notice thoughts and feelings',
    9: 'Can identify emotions and triggers in the moment',
    12: 'Consistently practices self-reflection and mindfulness',
    15: 'Helps others develop awareness',
    18: 'Deep insight into mental and emotional patterns'
  },
  resilience: {
    3: 'Feels overwhelmed by daily stressors',
    6: 'Has some coping strategies that sometimes work',
    9: 'Bounces back from setbacks with support',
    12: 'Manages stress well and recovers quickly',
    15: 'Thrives under pressure and supports others',
    18: 'Unshakeable stability, source of strength for community'
  },
  connection: {
    3: 'Few meaningful relationships, struggles with isolation',
    6: 'Some friends but relationships could be deeper',
    9: 'Strong support network, good at maintaining relationships',
    12: 'Natural at building connections and supporting others',
    15: 'Community builder, brings people together',
    18: 'Creates healing spaces for others through connection'
  },
  balance: {
    3: 'Frequent burnout, poor self-care habits',
    6: 'Aware of need for balance but struggles to maintain it',
    9: 'Generally good work-life boundaries',
    12: 'Models healthy lifestyle choices',
    15: 'Wellness advocate, helps others find balance',
    18: 'Perfect harmony, teaches sustainable living'
  }
};

// Helper function to create gear items
export const createGearItem = (gearName: string): EquipmentItem => {
  const gearData: Record<string, {
    type: string;
    subtype: string;
    name: string;
    description: string;
    effect: string;
  }> = {
    "Explorer's Notebook": {
      type: 'weapons',
      subtype: 'journal',
      name: "Explorer's Notebook",
      description: 'A trusted companion for documenting personal research',
      effect: 'Reflection entries give +1 awareness bonus'
    },
    "Personal Style Cloak": {
      type: 'armor', 
      subtype: 'cloak',
      name: "Personal Style Cloak",
      description: 'Represents your authentic way of being',
      effect: 'Approaches matching your style are 25% more effective'
    },
    "Reality Filter": {
      type: 'helmets',
      subtype: 'filter',
      name: "Reality Filter", 
      description: 'Helps distinguish helpful from harmful guidance',
      effect: 'Can see through unhelpful advice and suggestions'
    },
    "Personal Values Foundation": {
      type: 'boots',
      subtype: 'foundation',
      name: "Personal Values Foundation",
      description: 'Keeps you grounded in what truly matters',
      effect: 'Value-aligned decisions give bonus stat gains'
    }
  };

  const gear = gearData[gearName];
  if (!gear) {
    throw new Error(`Unknown gear item: ${gearName}`);
  }

  return {
    id: Date.now().toString() + Math.random(),
    name: gear.name,
    type: gear.type as any, // Cast to EquipmentType
    subtype: gear.subtype as any, // Cast to EquipmentSubtype
    description: gear.description,
    unlockCondition: 'Unlocked through reflection',
    wellnessStats: {},
    effect: gear.effect
  };
};

// Reflection analysis function
export const analyzeReflection = (text: string, completedStory: string): ReflectionAnalysis => {
  const analysis: ReflectionAnalysis = {
    stat_gains: {},
    gear_unlocks: [],
    recognition_message: '',
    personal_insights: []
  };

  const lowercaseText = text.toLowerCase();

  // Check for story-specific gains
  const storyGains = STAT_PROGRESSION.story_completion[completedStory];
  if (storyGains) {
    // Always give base gains for completing story
    Object.entries(storyGains.base_gain).forEach(([stat, gain]) => {
      analysis.stat_gains[stat] = gain;
    });

    // Check for reflection bonus (meaningful writing about the experience)
    if (text.length > 100 && (
      lowercaseText.includes('learned') || 
      lowercaseText.includes('realized') || 
      lowercaseText.includes('discovered')
    )) {
      Object.entries(storyGains.reflection_bonus).forEach(([stat, bonus]) => {
        analysis.stat_gains[stat] = (analysis.stat_gains[stat] || 0) + bonus;
      });
    }
  }

  // Check for reflection patterns
  Object.entries(STAT_PROGRESSION.reflection_patterns).forEach(([pattern, data]) => {
    const matches = data.keywords.filter(keyword => lowercaseText.includes(keyword)).length;
    if (matches > 0) {
      Object.entries(data.stat_gain).forEach(([stat, gain]) => {
        analysis.stat_gains[stat] = (analysis.stat_gains[stat] || 0) + gain;
      });
      analysis.personal_insights.push(pattern);
    }
  });

  // Check for gear unlocks
  Object.entries(GEAR_UNLOCK_SYSTEM).forEach(([category, items]) => {
    Object.entries(items).forEach(([itemName, item]) => {
      const hasKeywords = item.keywords.some(keyword => lowercaseText.includes(keyword));
      if (hasKeywords && text.length > 50) {
        analysis.gear_unlocks.push(itemName);
      }
    });
  });

  // Generate recognition message
  if (analysis.personal_insights.length > 0) {
    const insights = analysis.personal_insights;
    if (insights.includes('personal_discovery')) {
      analysis.recognition_message = 'You\'re discovering what truly works for your unique situation.';
    } else if (insights.includes('trying_something')) {
      analysis.recognition_message = 'Taking action on new approaches shows real courage.';
    } else if (insights.includes('rejecting_approach')) {
      analysis.recognition_message = 'Knowing what doesn\'t serve you is valuable self-knowledge.';
    } else if (insights.includes('helping_others')) {
      analysis.recognition_message = 'Sharing your insights helps build community and connection.';
    }
  } else if (text.length > 100) {
    analysis.recognition_message = 'Thank you for taking time to reflect meaningfully on your experience.';
  } else {
    analysis.recognition_message = 'Every bit of self-reflection contributes to your growth.';
  }

  return analysis;
}; 