import { Story } from '../imports';
import { CopingTool } from './equipment';
import { Character, UserProfile } from './user';

// Define PersonalityKey type locally since it's not exported as a type
export type PersonalityKey =
  | 'Agreeableness'
  | 'Openness'
  | 'Conscientiousness'
  | 'Extraversion'
  | 'Neuroticism';

const SLUG_TO_KEY: Record<string, PersonalityKey> = {
  agreeableness: 'Agreeableness',
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  neuroticism: 'Neuroticism'
};

export function toPersonalityKey(input?: string | null): PersonalityKey | null {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();
  return SLUG_TO_KEY[s] ?? (SLUG_TO_KEY[s.replace(/[\s-]/g, '')] ?? null);
}

// 1. DAILY CURATOR MESSAGES
export const DailyCuratorMessages = {
  Openness: [
    "The library whispers of new discoveries today. What unexplored corner of your mind calls to you?",
    "Curiosity is the key that unlocks every door. Let your imagination guide your journey today.",
    "The ancient texts speak of those who see beyond the veil. Trust your creative instincts.",
    "Today, embrace the unknown. Your willingness to explore will reveal hidden treasures.",
    "The Dreamscape Library shimmers with possibilities. What will you create today?"
  ],
  Conscientiousness: [
    "A well-ordered mind conquers chaos. Your dedication to structure serves you well today.",
    "The methodical path leads to mastery. Trust in your disciplined approach.",
    "Excellence is not an act, but a habit. Your consistency builds lasting strength.",
    "The Structured Sanctum honors your commitment. Each step forward is progress.",
    "Patience and persistence unlock the deepest wisdom. Stay the course, Scholar."
  ],
  Extraversion: [
    "The Assembly Hall buzzes with energy. Your light brightens the path for others.",
    "Connection is the bridge between souls. Share your vibrant spirit today.",
    "The strongest bonds are forged in conversation. Reach out and make new allies.",
    "Your enthusiasm ignites inspiration in others. Let your inner fire shine bright.",
    "The Grand Assembly awaits your voice. Speak boldly and with confidence."
  ],
  Agreeableness: [
    "The Healing Gardens bloom with compassion. Your gentle wisdom nurtures growth.",
    "Harmony is found in understanding. Your empathy creates bridges where others see walls.",
    "The kindest hearts carry the greatest strength. Your compassion is your power.",
    "Peace begins within and radiates outward. Your calming presence heals the world.",
    "The Garden of Understanding flourishes under your care. Tend it with love."
  ],
  Neuroticism: [
    "The Reflection Chambers hold space for all emotions. Your depth creates profound wisdom.",
    "Sensitivity is not weakness—it is the ability to feel the truth others cannot see.",
    "The shadows hold lessons as valuable as the light. Embrace your full spectrum.",
    "Your emotional awareness is a gift. Use it to understand the mysteries within.",
    "The Inner Sanctum honors your journey through complexity. You are braver than you know."
  ]
};

// 2. PERSONALITY-SPECIFIC QUESTS
export const PersonalityQuests = {
  Openness: [
    { id: 'openness_1', title: "The Unread Chapter", description: "Delve into 3 unexplored story chapters within the archives.", reward: "🔮 Visionary's Orb", total: 3, wellnessProperty: "connection" },
    { id: 'openness_2', title: "Mind Weaver", description: "Transform 5 different types of negative thoughts in the 'Thought Invaders' mini-game.", reward: "✨ Sigil of Innovation", total: 5 , wellnessProperty: "balance"},
    { id: 'openness_3', title: "The Branching Path", description: "Uncover 10 different outcomes by exploring divergent story paths.", reward: "🌟 Star-Charter's Compass", total: 10, wellnessProperty: "awareness"  }
  ],
  Conscientiousness: [
    { id: 'conscientiousness_1', title: "The Scribe's Ritual", description: "Maintain a daily journal entry for seven consecutive days.", reward: "🏆 Aegis of Resolve", total: 7 , wellnessProperty: "balance"},
    { id: 'conscientiousness_2', title: "Architect of the Self", description: "Complete 5 guided journal prompts to build a foundation of self-awareness.", reward: "📋 Scroll of Mastery", total: 5, wellnessProperty: "awareness" },
    { id: 'conscientiousness_3', title: "The Unwavering Path", description: "Complete 10 story chapters without straying from your chosen objective.", reward: "⚖️ Warden's Seal", total: 10, wellnessProperty: "resilience" }
  ],
  Extraversion: [
    { id: 'extraversion_1', title: "Kindred Spirits", description: "Forge a meaningful connection with a key character in the story.", reward: "🌟 Emblem of Fellowship", total: 1, wellnessProperty: "connection" },
    { id: 'extraversion_2', title: "Voice of the Heart", description: "Choose 10 dialogue options that build positive relationships with others.", reward: "⚡ Heartwood Charm", total: 10, wellnessProperty: "balance" },
    { id: 'extraversion_3', title: "Shared Horizons", description: "Record 5 journal entries reflecting on your interactions with the story's characters.", reward: "🎭 Silver Tongue's Badge", total: 5, wellnessProperty: "awareness" }
  ],
  Agreeableness: [
    { id: 'agreeableness_1', title: "The Peacemaker's Gambit", description: "Successfully de-escalate 5 conflicts through dialogue choices in the story.", reward: "🕊️ Branch of Accord", total: 5, wellnessProperty: "connection" },
    { id: 'agreeableness_2', title: "The Empath's Way", description: "Make 10 choices rooted in compassion and understanding.", reward: "💚 Sunstone of Empathy", total: 10, wellnessProperty: "balance" },
    { id: 'agreeableness_3', title: "The Quiet Strength", description: "Choose 8 dialogue options that assert your boundaries with kindness.", reward: "🛡️ Bulwark of the Gentle", total: 8, wellnessProperty: "awareness" }
  ],
  Neuroticism: [
    { id: 'neuroticism_1', title: "Cartographer of the Heart", description: "Chart your emotional landscape by journaling for 14 consecutive days.", reward: "🧘 Amulet of Clarity", total: 14, wellnessProperty: "awareness" },
    { id: 'neuroticism_2', title: "Defying the Shadows", description: "Successfully clear 7 challenging waves in the 'Thought Invaders' mini-game.", reward: "🌊 Runic Stone of Serenity", total: 7, wellnessProperty: "balance" },
    { id: 'neuroticism_3', title: "Voyage Within", description: "Complete 12 introspective journal prompts to uncover deeper truths.", reward: "🌙 Oracle's Insight", total: 12, wellnessProperty: "connection" }
  ]
} as const;
// 3. PERSONALITY-SPECIFIC COPING TOOLS
// These replace traditional equipment for personality-based users
// Some tools are unlocked through story completion and map to character equipment
export const CopingTools = {
  Openness: [
    // Starting tools
    { id: 'tool_creative_visualization', name: "Mind's Eye Tapestry", icon: "🎨", description: "Weave visions of calm and possibility.", unlocked: true },
    { id: 'tool_curiosity_meditation', name: "Whispering Lore", icon: "🔍", description: "Listen to thoughts as passing whispers, not commands.", unlocked: true },
    
    // Story-unlocked tools (map to character equipment)
    { id: 'tool_possibility_mapping', name: "Cartographer's Charm", icon: "🗺️", description: "Trace the hidden pathways of your potential.", unlocked: false },
    { id: 'tool_ancient_wisdom', name: "Scroll of Elders", icon: "📜", description: "Draw upon the timeless knowledge etched in ancient scrolls.", unlocked: false }, // Maps to Ancient Scroll
    { id: 'tool_perspective_lens', name: "Lens of Many Truths", icon: "🔮", description: "View challenges through a multifaceted crystal.", unlocked: false }, // Maps to Lens of Gentle Seeing
    { id: 'tool_wanderer_journal', name: "Chronicler's Quill", icon: "📖", description: "Record the sagas of your inner and outer journeys.", unlocked: false }, // Maps to Notebook of the Wanderer
    { id: 'tool_dream_weaving', name: "Somnus Weaving", icon: "✨", description: "Shape the fabric of your dreams into potent realities.", unlocked: false },
    { id: 'tool_innovation_spark', name: "Spark of Ingenuity", icon: "💡", description: "Ignite brilliant solutions from the embers of curiosity.", unlocked: false }
  ],
  
  Conscientiousness: [
    // Starting tools
    { id: 'tool_structured_breathing', name: "Rhythmic Breath", icon: "🧘", description: "Find your center with the 4-7-8 breathing cadence.", unlocked: true },
    { id: 'tool_goal_laddering', name: "The Ascendant's Path", icon: "📋", description: "Carve great ambitions into smaller footholds.", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_routine_anchor', name: "Anchorstone Ritual", icon: "⚓", description: "Forge stability in the shifting tides of chaos.", unlocked: false },
    { id: 'tool_focus_crystal', name: "Focusing Crystal", icon: "💎", description: "Channel your will, maintaining clarity amidst distractions.", unlocked: false }, // Maps to Focus Crystal
    { id: 'tool_discipline_shield', name: "Aegis of Discipline", icon: "🛡️", description: "Ward your ambitions from the whispers of doubt.", unlocked: false }, // Maps to Shield of Resolve
    { id: 'tool_progress_tracker', name: "The Warden's Ledger", icon: "📊", description: "Mark your victories to fuel your resolve.", unlocked: false },
    { id: 'tool_habit_architect', name: "Rune of Habit", icon: "🏗️", description: "Inscribe lasting rituals into your being.", unlocked: false },
    { id: 'tool_time_guardian', name: "Chronos Warden", icon: "⏰", description: "Become the master of your own time.", unlocked: false }
  ],
  
  Extraversion: [
    // Starting tools
    { id: 'tool_social_recharging', name: "Font of Fellowship", icon: "🔋", description: "Draw strength and renewal from kindred spirits.", unlocked: true },
    { id: 'tool_energy_mapping', name: "Aura Weaving", icon: "⚡", description: "Trace the vibrant threads of your own energy.", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_boundary_setting', name: "Warding Circle", icon: "🛡️", description: "Preserve your spirit's energy with gentle boundaries.", unlocked: false },
    { id: 'tool_connection_bridge', name: "Bridge of Bonds", icon: "🌉", description: "Span the distance between hearts to forge alliances.", unlocked: false }, // Maps to Connection Bridge
    { id: 'tool_energy_amplifier', name: "Resonance Stone", icon: "📡", description: "Amplify your inner light and share its warmth.", unlocked: false }, // Maps to Energy Amplifier
    { id: 'tool_conversation_catalyst', name: "Catalyst Charm", icon: "💬", description: "Kindle dialogues that illuminate and inspire.", unlocked: false },
    { id: 'tool_charisma_cloak', name: "Mantle of Presence", icon: "✨", description: "Drape yourself in an aura of confidence.", unlocked: false },
    { id: 'tool_network_weaver', name: "Web of Kinship", icon: "🕸️", description: "Weave a tapestry of connections.", unlocked: false }
  ],
  
  Agreeableness: [
    // Starting tools
    { id: 'tool_assertiveness_scripts', name: "The Gentle Word", icon: "💬", description: "Speak your truth with kindness and strength.", unlocked: true },
    { id: 'tool_empathy_boundaries', name: "The Empath's Shield", icon: "🌊", description: "Feel the currents of others without being swept away.", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_conflict_resolution', name: "Mediator's Accord", icon: "🤝", description: "Weave harmony from the threads of discord.", unlocked: false },
    { id: 'tool_harmony_compass', name: "Compass of Harmony", icon: "🧭", description: "Navigate relationships to find true balance.", unlocked: false }, // Maps to Compass of Quiet Knowing
    { id: 'tool_peace_weaver', name: "The Peace Weaver's Loom", icon: "🕊️", description: "Spin tranquility in the heart of the storm.", unlocked: false },
    { id: 'tool_kindness_armor', name: "Armor of Kindness", icon: "💚", description: "A shield of compassion for a gentle heart.", unlocked: false },
    { id: 'tool_truth_speaking', name: "Voice of Verity", icon: "🗣️", description: "Let your honesty be tempered with compassion.", unlocked: false },
    { id: 'tool_healing_presence', name: "Soothing Aura", icon: "🌟", description: "Become a wellspring of comfort for others.", unlocked: false }
  ],
  
  Neuroticism: [
    // Starting tools
    { id: 'tool_emotion_surfing', name: "Riding the Tides", icon: "🏄", description: "Ride the powerful waves of emotion with grace.", unlocked: true },
    { id: 'tool_worry_time', name: "The Worry Stone", icon: "⏰", description: "Confine anxieties to a time, then set them aside.", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_grounding_techniques', name: "Earth Anchor", icon: "🌱", description: "Root yourself in the present with a 5-4-3-2-1 sensory rite.", unlocked: false },
    { id: 'tool_storm_anchor', name: "Anchor of Serenity", icon: "⚓", description: "Hold fast amidst emotional tempests.", unlocked: false },
    { id: 'tool_calm_sanctuary', name: "Inner Sanctum", icon: "🏛️", description: "Construct a sacred, peaceful space in your mind.", unlocked: false },
    { id: 'tool_resilience_roots', name: "Roots of Resilience", icon: "🌳", description: "Draw unwavering strength from within.", unlocked: false },
    { id: 'tool_emotion_compass', name: "Compass of the Heart", icon: "🧭", description: "Navigate the intricate labyrinth of your feelings.", unlocked: false }, // Maps to Emotion Compass
    { id: 'tool_mindful_observer', name: "The Silent Watcher", icon: "👁️", description: "Observe your thoughts as clouds in the sky.", unlocked: false },
    { id: 'tool_serenity_shield', name: "Shield of Serenity", icon: "🛡️", description: "Guard your spirit from overwhelming emotions.", unlocked: false }
  ]
};

// 4. EQUIPMENT TO COPING TOOL MAPPING
// Maps character equipment items to personality-specific coping tools
export const EquipmentToCopingToolMap: Record<string, Record<string, string>> = {
  "Ancient Scroll": {
    Openness: "tool_ancient_wisdom",
    Conscientiousness: "tool_progress_tracker",
    Extraversion: "tool_conversation_catalyst",
    Agreeableness: "tool_truth_speaking",
    Neuroticism: "tool_mindful_observer"
  },
  "Lens of Gentle Seeing": {
    Openness: "tool_perspective_lens",
    Conscientiousness: "tool_focus_crystal",
    Extraversion: "tool_energy_amplifier",
    Agreeableness: "tool_harmony_compass",
    Neuroticism: "tool_emotion_compass"
  },
  "Notebook of the Wanderer": {
    Openness: "tool_wanderer_journal",
    Conscientiousness: "tool_habit_architect",
    Extraversion: "tool_network_weaver",
    Agreeableness: "tool_healing_presence",
    Neuroticism: "tool_storm_anchor"
  },
  "Focus Crystal": {
    Openness: "tool_innovation_spark",
    Conscientiousness: "tool_focus_crystal",
    Extraversion: "tool_charisma_cloak",
    Agreeableness: "tool_peace_weaver",
    Neuroticism: "tool_calm_sanctuary"
  },
  "Shield of Resolve": {
    Openness: "tool_dream_weaving",
    Conscientiousness: "tool_discipline_shield",
    Extraversion: "tool_boundary_setting",
    Agreeableness: "tool_kindness_armor",
    Neuroticism: "tool_serenity_shield"
  },
  "Connection Bridge": {
    Openness: "tool_possibility_mapping",
    Conscientiousness: "tool_routine_anchor",
    Extraversion: "tool_connection_bridge",
    Agreeableness: "tool_conflict_resolution",
    Neuroticism: "tool_resilience_roots"
  },
  "Energy Amplifier": {
    Openness: "tool_creative_visualization",
    Conscientiousness: "tool_time_guardian",
    Extraversion: "tool_energy_amplifier",
    Agreeableness: "tool_empathy_boundaries",
    Neuroticism: "tool_grounding_techniques"
  }
};


// Helper function to convert equipment reward to coping tool for personality users
export const convertEquipmentToCopingTool = (equipmentName: string, personalityType: PersonalityKey): string | null => {
  const mapping = EquipmentToCopingToolMap[equipmentName];
  return mapping ? mapping[personalityType] : null;
};

// 4. "ECHOES OF THE SELF" - WELLNESS ATTRIBUTES
export const PersonalityWellnessAttributes: Record<PersonalityKey, { label: string; description: string; color: string }[]> = {
  Openness: [
    { label: "Creativity", description: "Nurture your innovative and imaginative spirit to find new solutions.", color: "#9B59B6" },
    { label: "Curiosity", description: "Embrace the unknown and ask questions to expand your world.", color: "#3498DB" },
    { label: "Mindfulness", description: "Stay present to manage the flow of endless ideas and thoughts.", color: "#1ABC9C" },
  ],
  Conscientiousness: [
    { label: "Balance", description: "Find harmony between disciplined work and restorative rest.", color: "#2ECC71" },
    { label: "Flexibility", description: "Adapt to unexpected changes without losing your sense of control.", color: "#F1C40F" },
    { label: "Self-Compassion", description: "Treat yourself with kindness, especially when you make mistakes.", color: "#E74C3C" },
  ],
  Extraversion: [
    { label: "Authentic Connection", description: "Focus on the quality of your social bonds, not just the quantity.", color: "#E67E22" },
    { label: "Solitude Tolerance", description: "Find comfort and energy in moments of quiet reflection.", color: "#34495E" },
    { label: "Energy Management", description: "Recognize and respect your own social energy limits.", color: "#F39C12" },
  ],
  Agreeableness: [
    { label: "Boundary Setting", description: "Protect your energy by clearly defining your limits.", color: "#3498DB" },
    { label: "Assertiveness", description: "Express your own needs and opinions with confidence and kindness.", color: "#9B59B6" },
    { label: "Self-Advocacy", description: "Speak up for yourself and ensure your voice is heard.", color: "#2980B9" },
  ],
  Neuroticism: [
    { label: "Emotional Regulation", description: "Navigate your feelings with skill, finding calm within the storm.", color: "#8E44AD" },
    { label: "Resilience", description: "Bounce back from emotional challenges with greater wisdom.", color: "#27AE60" },
    { label: "Self-Soothing", description: "Develop healthy techniques to comfort yourself during distress.", color: "#16A085" },
  ],
}; 

export interface PersonalityHomeData {
  primaryTrait: PersonalityKey | null;
  userProfile: UserProfile;
  stories: Story[];
  completedStories: string[];
  copingTools: CopingTool[];
  // Added character data for direct access when using character endpoint
  character?: Character;
};