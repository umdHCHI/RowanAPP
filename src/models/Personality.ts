// ===== PERSONALITY DATA MODELS =====
// This file centralizes all personality-related data structures

// Define PersonalityKey type locally since it's not exported as a type
type PersonalityKey = "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";

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
    { id: 'openness_1', title: "Curiosity Catalyst", description: "Complete 3 exploration stories", reward: "🔮 Imagination Boost", total: 3 },
    { id: 'openness_2', title: "Creative Alchemist", description: "Try 5 new coping techniques", reward: "✨ Innovation Badge", total: 5 },
    { id: 'openness_3', title: "Possibility Pioneer", description: "Explore different story paths", reward: "🌟 Pathfinder Title", total: 10 }
  ],
  Conscientiousness: [
    { id: 'conscientiousness_1', title: "Steady Scholar", description: "Complete daily practice for 7 days", reward: "🏆 Discipline Medal", total: 7 },
    { id: 'conscientiousness_2', title: "Organization Oracle", description: "Master 5 structure techniques", reward: "📋 Planner's Pride", total: 5 },
    { id: 'conscientiousness_3', title: "Persistence Paragon", description: "Finish 10 challenging stories", reward: "⚖️ Steadfast Seal", total: 10 }
  ],
  Extraversion: [
    { id: 'extraversion_1', title: "Social Spark", description: "Connect with archive community", reward: "🌟 People's Champion", total: 1 },
    { id: 'extraversion_2', title: "Energy Enthusiast", description: "Boost connection skills 10 times", reward: "⚡ Vitality Badge", total: 10 },
    { id: 'extraversion_3', title: "Communication Catalyst", description: "Share insights with others", reward: "🎭 Expression Expert", total: 5 }
  ],
  Agreeableness: [
    { id: 'agreeableness_1', title: "Harmony Healer", description: "Resolve 5 conflict scenarios", reward: "🕊️ Peace Keeper", total: 5 },
    { id: 'agreeableness_2', title: "Empathy Expert", description: "Show compassion in 10 situations", reward: "💚 Heart of Gold", total: 10 },
    { id: 'agreeableness_3', title: "Boundary Builder", description: "Practice assertiveness 8 times", reward: "🛡️ Gentle Guardian", total: 8 }
  ],
  Neuroticism: [
    { id: 'neuroticism_1', title: "Emotion Explorer", description: "Track feelings for 14 days", reward: "🧘 Mindfulness Master", total: 14 },
    { id: 'neuroticism_2', title: "Resilience Researcher", description: "Overcome 7 anxiety challenges", reward: "🌊 Calm Cultivator", total: 7 },
    { id: 'neuroticism_3', title: "Depth Diver", description: "Complete introspective journeys", reward: "🌙 Inner Wisdom", total: 12 }
  ]
};

// 3. PERSONALITY-SPECIFIC COPING TOOLS
export const CopingTools = {
  Openness: [
    { id: 'tool_creative_visualization', name: "Creative Visualization", icon: "🎨", description: "Paint your feelings with imagination" },
    { id: 'tool_curiosity_meditation', name: "Curiosity Meditation", icon: "🔍", description: "Explore thoughts without judgment" },
    { id: 'tool_possibility_mapping', name: "Possibility Mapping", icon: "🗺️", description: "Chart new paths forward" }
  ],
  Conscientiousness: [
    { id: 'tool_structured_breathing', name: "Structured Breathing", icon: "🧘", description: "4-7-8 breathing technique" },
    { id: 'tool_goal_laddering', name: "Goal Laddering", icon: "📋", description: "Break big goals into steps" },
    { id: 'tool_routine_anchor', name: "Routine Anchor", icon: "⚓", description: "Create stability in chaos" }
  ],
  Extraversion: [
    { id: 'tool_social_recharging', name: "Social Recharging", icon: "🔋", description: "Connect with others mindfully" },
    { id: 'tool_energy_mapping', name: "Energy Mapping", icon: "⚡", description: "Track your energy patterns" },
    { id: 'tool_boundary_setting', name: "Boundary Setting", icon: "🛡️", description: "Protect your social energy" }
  ],
  Agreeableness: [
    { id: 'tool_assertiveness_scripts', name: "Assertiveness Scripts", icon: "💬", description: "Practice saying no kindly" },
    { id: 'tool_empathy_boundaries', name: "Empathy Boundaries", icon: "🌊", description: "Feel without drowning" },
    { id: 'tool_conflict_resolution', name: "Conflict Resolution", icon: "🤝", description: "Navigate disagreements peacefully" }
  ],
  Neuroticism: [
    { id: 'tool_emotion_surfing', name: "Emotion Surfing", icon: "🏄", description: "Ride the waves of feeling" },
    { id: 'tool_worry_time', name: "Worry Time", icon: "⏰", description: "Schedule time for anxious thoughts" },
    { id: 'tool_grounding_techniques', name: "Grounding Techniques", icon: "🌱", description: "5-4-3-2-1 sensory grounding" }
  ]
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