
// Equipment type mappings for the wellness system
export type FocusType = 'meditation' | 'breathing' | 'journaling' | 'journaltwo';// TODO: Add meditation1, meditation2, meditation3
export type ComfortType = 'social' | 'hobby' | 'nature';
export type ShieldType = 'boundary' | 'affirmation' | 'routine';
export type GroundType = 'exercise' | 'sleep' | 'nutrition';

// ===== GEAR MAPPINGS FOR STORY REWARDS =====
// This maps story reward names to backend gear type IDs
// When a player gets a reward like "Ancient Scroll", it gets converted to an actual equippable item

export interface GearMapping {
  name: string;
  gearTypeId: number;
  slot: 'weapon' | 'armor' | 'helmet' | 'boots';
  description: string;
  statBonuses: Record<string, number>;
  emojiIcon: string;
}

// ===== STORY REWARD TO GEAR MAPPINGS =====
// These mappings convert story reward names to backend gear type IDs
// The gearTypeId should match the IDs in your backend gear_types table

export const STORY_REWARD_GEAR_MAPPINGS: Record<string, GearMapping> = {
  
  // ===== FOCUS ITEMS (Weapons) =====
  "Ancient Scroll": {
    name: "Scroll of Stillness",
    gearTypeId: 1,
    slot: "weapon",
    description: "An ancient script that hums when unrolled. The ink dances with quiet truths that anchor the mind in the now.",
    statBonuses: {
      mindfulness: 1,
      focus: 1
    },
    emojiIcon: "📜"
  },
  
  "Clarity Lens of Mindful Sight": {
    name: "Lens of Gentle Seeing",
    gearTypeId: 2,
    slot: "weapon",
    description: "A polished crystal orb that reveals the quiet shapes of anxious thoughts, softening their edges with compassion.",
    statBonuses: {
      mindfulness: 2,
      focus: 2
    },
    emojiIcon: "🔮"
  },
  
  "Explorer's Notebook": {
    name: "Notebook of the Wanderer",
    gearTypeId: 3,
    slot: "weapon",
    description: "Worn leather, soft pages. It remembers more than you write—each entry anchors resilience, focus, and intention.",
    statBonuses: {
      focus: 1,
      resilience: 1,
      organization: 1
    },
    emojiIcon: "📓"
  },
  
  "Intuition Compass": {
    name: "Compass of Quiet Knowing",
    gearTypeId: 4,
    slot: "weapon",
    description: "Not north, not south—this compass points inward, toward what you already know but forgot to trust.",
    statBonuses: {
      mindfulness: 1,
      resilience: 1,
      empathy: 1
    },
    emojiIcon: "🧭"
  },
  
  // ===== COMFORT LAYERS (Armor) =====
  "Personal Style Cloak": {
    name: "Cloak of True Form",
    gearTypeId: 5,
    slot: "armor",
    description: "Woven from your own habits, values, and quirks. It shields you in the warmth of who you really are.",
    statBonuses: {
      resilience: 2,
      empathy: 1
    },
    emojiIcon: "👘"
  },
  
  "Cultural Wisdom Wrap": {
    name: "Wrap of Rooted Memory",
    gearTypeId: 6,
    slot: "armor",
    description: "A garment spun from inherited stories and traditions. It whispers the strength of those who came before you.",
    statBonuses: {
      resilience: 1,
      empathy: 3
    },
    emojiIcon: "🧣"
  },
  
  "Adaptation Shield": {
    name: "Shield of Flexible Boundaries",
    gearTypeId: 7,
    slot: "armor",
    description: "This shield bends and breathes with you. A reminder that adaptation is not weakness—but wisdom.",
    statBonuses: {
      confidence: 1,
      resilience: 2,
      organization: 1
    },
    emojiIcon: "🛡️"
  },
  
  // ===== MIND SHIELDS (Helmets) =====
  "Reality Filter": {
    name: "Mask of Discernment",
    gearTypeId: 8,
    slot: "helmet",
    description: "A two-faced mask that filters the noise of others. It lets you hear only what rings true to your path.",
    statBonuses: {
      mindfulness: 1,
      confidence: 1,
      resilience: 1
    },
    emojiIcon: "🎭"
  },
  
  "Growth Mindset Crown": {
    name: "Crown of Becoming",
    gearTypeId: 9,
    slot: "helmet",
    description: "A crown forged in fire and reflection. It gleams brightest during failure, turning trials into growth.",
    statBonuses: {
      confidence: 3,
      resilience: 1
    },
    emojiIcon: "👑"
  },
  
  "Authenticity Guard": {
    name: "Helm of the Unmasked",
    gearTypeId: 10,
    slot: "helmet",
    description: "This helm deflects the pressure to perform. You wear it when you're ready to be no one but yourself.",
    statBonuses: {
      confidence: 2,
      resilience: 2
    },
    emojiIcon: "🪖"
  },
  
  // ===== GROUND STONES (Boots) =====
  "Personal Values Foundation": {
    name: "Foundation of Inner Stone",
    gearTypeId: 11,
    slot: "boots",
    description: "Boots carved from what matters most to you. They keep your steps aligned with your deepest values.",
    statBonuses: {
      mindfulness: 2,
      organization: 1
    },
    emojiIcon: "🪨"
  },
  
  "Support Network Roots": {
    name: "Roots of Connection",
    gearTypeId: 12,
    slot: "boots",
    description: "You walk not alone. These roots carry echoes of your people, your community—those who hold you up.",
    statBonuses: {
      resilience: 1,
      empathy: 3
    },
    emojiIcon: "🌱"
  },
  
  "Self-Compassion Stone": {
    name: "Stone of Self-Compassion",
    gearTypeId: 13,
    slot: "boots",
    description: "A small gem embedded in your sole. It reminds you: even here, especially here, you deserve gentleness.",
    statBonuses: {
      mindfulness: 1,
      confidence: 1,
      resilience: 2
    },
    emojiIcon: "💎"
  }
};

// ===== HELPER FUNCTIONS FOR GEAR MAPPINGS =====

// Get gear mapping by reward name
export function getGearMapping(rewardName: string): GearMapping | null {
  return STORY_REWARD_GEAR_MAPPINGS[rewardName] || null;
}

// Get gear type ID by reward name
export function getGearTypeId(rewardName: string): number | null {
  const mapping = getGearMapping(rewardName);
  return mapping ? mapping.gearTypeId : null;
}

// Check if a reward name has a gear mapping
export function hasGearMapping(rewardName: string): boolean {
  return rewardName in STORY_REWARD_GEAR_MAPPINGS;
}

// Get all available reward names
export function getAvailableRewardNames(): string[] {
  return Object.keys(STORY_REWARD_GEAR_MAPPINGS);
}

// Get gear mappings by slot type
export function getGearMappingsBySlot(slot: 'weapon' | 'armor' | 'helmet' | 'boots'): GearMapping[] {
  return Object.values(STORY_REWARD_GEAR_MAPPINGS).filter(mapping => mapping.slot === slot);
}

// TODO: Add equipment icons need to be added to the assets folder and then imported here
export const equipmentIcons = {
  focus: {
    meditation: require('../../assets/equipment/weapons/fb1455.png'),
    breathing: require('../../assets/equipment/weapons/fb1455.png'),
    journaling: require('../../assets/equipment/weapons/fb1455.png'),
    journaltwo: require('../../assets/equipment/weapons/fb1455.png'),
    // TODO: Add meditation1, meditation2, meditation3
  },
  comfort: {
    social: require('../../assets/equipment/armor/fb1867.png'),
    hobby: require('../../assets/equipment/armor/fb1857.png'),
    nature: require('../../assets/equipment/armor/fb1867.png'),
  },
  shield: {
    boundary: require('../../assets/equipment/helmets/fb1842.png'),
    affirmation: require('../../assets/equipment/helmets/fb1842.png'),
    routine: require('../../assets/equipment/helmets/fb1842.png'),
  },
  ground: {
    exercise: require('../../assets/equipment/boots/fb1854.png'),
    sleep: require('../../assets/equipment/boots/fb1854.png'),
    nutrition: require('../../assets/equipment/boots/fb1854.png'),
  },
} as const;

export const equipmentTypeLabels = {
  focus: 'Focus Item',
  comfort: 'Comfort Layer',
  shield: 'Mind Shield',
  ground: 'Ground Stone',
} as const;

export const rarityColors = {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
} as const; 