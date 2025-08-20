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
export const  PersonalityQuests = {
  Openness: [
    { id: 'openness_1', title: "Curiosity Catalyst", description: "Complete 3 exploration stories", reward: "🔮 Imagination Boost", total: 3, wellnessProperty: "connection" },
    { id: 'openness_2', title: "Creative Alchemist", description: "Try 5 new coping techniques", reward: "✨ Innovation Badge", total: 5 , wellnessProperty: "balance"},
    { id: 'openness_3', title: "Possibility Pioneer", description: "Explore different story paths", reward: "🌟 Pathfinder Title", total: 10, wellnessProperty: "awareness"  }
  ],
  Conscientiousness: [
    { id: 'conscientiousness_1', title: "Steady Scholar", description: "Complete daily practice for 7 days", reward: "🏆 Discipline Medal", total: 7 , wellnessProperty: "balance"},
    { id: 'conscientiousness_2', title: "Organization Oracle", description: "Master 5 structure techniques", reward: "📋 Planner's Pride", total: 5, wellnessProperty: "awareness" },
    { id: 'conscientiousness_3', title: "Persistence Paragon", description: "Finish 10 challenging stories", reward: "⚖️ Steadfast Seal", total: 10, wellnessProperty: "resilience" }
  ],
  Extraversion: [
    { id: 'extraversion_1', title: "Social Spark", description: "Connect with archive community", reward: "🌟 People's Champion", total: 1, wellnessProperty: "connection" },
    { id: 'extraversion_2', title: "Energy Enthusiast", description: "Boost connection skills 10 times", reward: "⚡ Vitality Badge", total: 10, wellnessProperty: "balance" },
    { id: 'extraversion_3', title: "Communication Catalyst", description: "Share insights with others", reward: "🎭 Expression Expert", total: 5, wellnessProperty: "awareness" }
  ],
  Agreeableness: [
    { id: 'agreeableness_1', title: "Harmony Healer", description: "Resolve 5 conflict scenarios", reward: "🕊️ Peace Keeper", total: 5, wellnessProperty: "connection" },
    { id: 'agreeableness_2', title: "Empathy Expert", description: "Show compassion in 10 situations", reward: "💚 Heart of Gold", total: 10, wellnessProperty: "balance" },
    { id: 'agreeableness_3', title: "Boundary Builder", description: "Practice assertiveness 8 times", reward: "🛡️ Gentle Guardian", total: 8, wellnessProperty: "awareness" }
  ],
  Neuroticism: [
    { id: 'neuroticism_1', title: "Emotion Explorer", description: "Track feelings for 14 days", reward: "🧘 Mindfulness Master", total: 14, wellnessProperty: "awareness" },
    { id: 'neuroticism_2', title: "Resilience Researcher", description: "Overcome 7 anxiety challenges", reward: "🌊 Calm Cultivator", total: 7, wellnessProperty: "balance" },
    { id: 'neuroticism_3', title: "Depth Diver", description: "Complete introspective journeys", reward: "🌙 Inner Wisdom", total: 12, wellnessProperty: "connection" }
  ]
} as const;

// 3. PERSONALITY-SPECIFIC COPING TOOLS
// These replace traditional equipment for personality-based users
// Some tools are unlocked through story completion and map to character equipment
export const CopingTools = {
  Openness: [
    // Starting tools
    { id: 'tool_creative_visualization', name: "Creative Visualization", icon: "🎨", description: "Paint your feelings with imagination", unlocked: true },
    { id: 'tool_curiosity_meditation', name: "Curiosity Meditation", icon: "🔍", description: "Explore thoughts without judgment", unlocked: true },
    
    // Story-unlocked tools (map to character equipment)
    { id: 'tool_possibility_mapping', name: "Possibility Mapping", icon: "🗺️", description: "Chart new paths forward", unlocked: false },
    { id: 'tool_ancient_wisdom', name: "Ancient Wisdom Practice", icon: "📜", description: "Channel insights from the Archive's scrolls", unlocked: false }, // Maps to Ancient Scroll
    { id: 'tool_perspective_lens', name: "Perspective Lens", icon: "🔮", description: "See situations from multiple angles", unlocked: false }, // Maps to Lens of Gentle Seeing
    { id: 'tool_wanderer_journal', name: "Wanderer's Journal", icon: "📖", description: "Document your journey of discovery", unlocked: false }, // Maps to Notebook of the Wanderer
    { id: 'tool_dream_weaving', name: "Dream Weaving", icon: "✨", description: "Transform imagination into reality", unlocked: false },
    { id: 'tool_innovation_spark', name: "Innovation Spark", icon: "💡", description: "Ignite creative solutions to challenges", unlocked: false }
  ],
  
  Conscientiousness: [
    // Starting tools
    { id: 'tool_structured_breathing', name: "Structured Breathing", icon: "🧘", description: "4-7-8 breathing technique", unlocked: true },
    { id: 'tool_goal_laddering', name: "Goal Laddering", icon: "📋", description: "Break big goals into steps", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_routine_anchor', name: "Routine Anchor", icon: "⚓", description: "Create stability in chaos", unlocked: false },
    { id: 'tool_focus_crystal', name: "Focus Crystal Method", icon: "💎", description: "Maintain concentration through distractions", unlocked: false }, // Maps to Focus Crystal
    { id: 'tool_discipline_shield', name: "Discipline Shield", icon: "🛡️", description: "Protect your goals from temptation", unlocked: false }, // Maps to Shield of Resolve
    { id: 'tool_progress_tracker', name: "Progress Tracker", icon: "📊", description: "Measure and celebrate small wins", unlocked: false },
    { id: 'tool_habit_architect', name: "Habit Architect", icon: "🏗️", description: "Build lasting positive routines", unlocked: false },
    { id: 'tool_time_guardian', name: "Time Guardian", icon: "⏰", description: "Master your relationship with time", unlocked: false }
  ],
  
  Extraversion: [
    // Starting tools
    { id: 'tool_social_recharging', name: "Social Recharging", icon: "🔋", description: "Connect with others mindfully", unlocked: true },
    { id: 'tool_energy_mapping', name: "Energy Mapping", icon: "⚡", description: "Track your energy patterns", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_boundary_setting', name: "Boundary Setting", icon: "🛡️", description: "Protect your social energy", unlocked: false },
    { id: 'tool_connection_bridge', name: "Connection Bridge", icon: "🌉", description: "Build meaningful relationships", unlocked: false }, // Maps to Connection Bridge
    { id: 'tool_energy_amplifier', name: "Energy Amplifier", icon: "📡", description: "Boost and share positive energy", unlocked: false }, // Maps to Energy Amplifier
    { id: 'tool_conversation_catalyst', name: "Conversation Catalyst", icon: "💬", description: "Start meaningful dialogues", unlocked: false },
    { id: 'tool_charisma_cloak', name: "Charisma Cloak", icon: "✨", description: "Radiate confidence and warmth", unlocked: false },
    { id: 'tool_network_weaver', name: "Network Weaver", icon: "🕸️", description: "Connect people and ideas", unlocked: false }
  ],
  
  Agreeableness: [
    // Starting tools
    { id: 'tool_assertiveness_scripts', name: "Assertiveness Scripts", icon: "💬", description: "Practice saying no kindly", unlocked: true },
    { id: 'tool_empathy_boundaries', name: "Empathy Boundaries", icon: "🌊", description: "Feel without drowning", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_conflict_resolution', name: "Conflict Resolution", icon: "🤝", description: "Navigate disagreements peacefully", unlocked: false },
    { id: 'tool_harmony_compass', name: "Harmony Compass", icon: "🧭", description: "Find balance in relationships", unlocked: false }, // Maps to Compass of Quiet Knowing
    { id: 'tool_peace_weaver', name: "Peace Weaver", icon: "🕊️", description: "Create calm in turbulent situations", unlocked: false },
    { id: 'tool_kindness_armor', name: "Kindness Armor", icon: "💚", description: "Protect yourself while staying compassionate", unlocked: false },
    { id: 'tool_truth_speaking', name: "Truth Speaking", icon: "🗣️", description: "Express honesty with love", unlocked: false },
    { id: 'tool_healing_presence', name: "Healing Presence", icon: "🌟", description: "Bring comfort to others naturally", unlocked: false }
  ],
  
  Neuroticism: [
    // Starting tools
    { id: 'tool_emotion_surfing', name: "Emotion Surfing", icon: "🏄", description: "Ride the waves of feeling", unlocked: true },
    { id: 'tool_worry_time', name: "Worry Time", icon: "⏰", description: "Schedule time for anxious thoughts", unlocked: true },
    
    // Story-unlocked tools
    { id: 'tool_grounding_techniques', name: "Grounding Techniques", icon: "🌱", description: "5-4-3-2-1 sensory grounding", unlocked: false },
    { id: 'tool_storm_anchor', name: "Storm Anchor", icon: "⚓", description: "Stay steady during emotional storms", unlocked: false },
    { id: 'tool_calm_sanctuary', name: "Calm Sanctuary", icon: "🏛️", description: "Create inner peace spaces", unlocked: false },
    { id: 'tool_resilience_roots', name: "Resilience Roots", icon: "🌳", description: "Draw strength from deep within", unlocked: false },
    { id: 'tool_emotion_compass', name: "Emotion Compass", icon: "🧭", description: "Navigate complex feelings skillfully", unlocked: false }, // Maps to Emotion Compass
    { id: 'tool_mindful_observer', name: "Mindful Observer", icon: "👁️", description: "Watch thoughts without judgment", unlocked: false },
    { id: 'tool_serenity_shield', name: "Serenity Shield", icon: "🛡️", description: "Protect against overwhelming emotions", unlocked: false }
  ]
};

// 4. EQUIPMENT TO COPING TOOL MAPPING
// Maps character equipment items to personality-specific coping tools
export const EquipmentToCopingToolMap: Record<string, Record<PersonalityKey, string>> = {
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