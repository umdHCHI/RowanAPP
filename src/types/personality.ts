import { Story } from '../imports';
import { CopingTool } from './equipment';
import { Character, UserProfile } from './user';

// ===== PERSONALITY TYPES =====

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
  openmindedness: 'Openness', // Survey uses 'openMindedness'
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  neuroticism: 'Neuroticism',
  negativeemotionality: 'Neuroticism' // Survey uses 'negativeEmotionality'
};

export function toPersonalityKey(input?: string | null): PersonalityKey | null {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();
  return SLUG_TO_KEY[s] ?? (SLUG_TO_KEY[s.replace(/[\s-]/g, '')] ?? null);
}

// ===== PERSONALITY REWARD CONFIGURATION =====

export interface PersonalityRewardConfig {
  // Base reward multiplier for this personality type
  baseMultiplier: number;

  // Preferred stat gains (which stats get bonus for this personality)
  preferredStats: string[];

  // Preferred coping tools for this personality type
  preferredTools: string[];

  // Quest bonus multiplier for quests related to this personality
  questBonus: number;

  // Story completion messages
  completionMessages: {
    regular: string;
    intro: string;
  };
}

// ===== PERSONALITY DATA =====

export const DailyCuratorMessages = {
  Openness: [
    "The shelves hum softly, Archivist. New corridors have unfolded in the night. Follow the one that stirs your curiosity.",
    "Some doors appear only when you stop searching. Let wonder guide you where maps fade.",
    "Ink rearranges itself when you look too closely. Trust the blur—it often hides the most beautiful ideas.",
    "The Archive dreams in spirals today. Step beyond what feels known; even the impossible needs a witness.",
    "The Dreamwork Stacks glow faintly this morning. Something unseen wants to be understood through you."
  ],

  Conscientiousness: [
    "The Curator has polished your desk and left a fresh quill. Order brings calm to restless ink—write your purpose clearly today.",
    "Every small act of care steadies the greater design. Consistency is the quietest form of devotion.",
    "The Archive expands through ritual. Repeat what works, refine what falters, and the pages will obey.",
    "There is holiness in the checklist, Archivist. When the lamps are aligned, thought moves like water.",
    "The Structured Sanctum stands ready. Measure twice, but do not fear imperfection—progress is the purest symmetry."
  ],

  Extraversion: [
    "The Assembly Hall stirs with familiar laughter. The Archive remembers you through the echoes of others.",
    "A thousand candles burn brighter when one is lit. Share your spark freely, but keep a match for yourself.",
    "The Curator hears your name carried on the wind between chambers. Your voice binds scattered stories into chorus.",
    "Connection is the Archive’s oldest language. Speak to someone today, and the walls will answer.",
    "The halls shimmer with resonance. Your presence alone rearranges the air—be intentional with your warmth."
  ],

  Agreeableness: [
    "The Healing Gardens sigh with relief at your return. Kindness is not weakness—it is restoration made visible.",
    "When tempers rise, remember: silence can be a salve, but empathy is the true antidote.",
    "Even soft voices can shift the Archive’s weight. Use yours to bring balance to the corridors.",
    "Peace is not absence—it is the art of choosing calm when the shelves tremble.",
    "The Garden of Accord blooms again. Tend to it gently, and its fragrance will find every wandering soul."
  ],

  Neuroticism: [
    "The Reflection Chambers are dim today, yet their mirrors still listen. Sit with the echo until it softens.",
    "The Curator lights a lamp in your stead. You need not chase clarity—let it drift toward you.",
    "Every tremor in the heart leaves a note in the Archive. Read it, but do not let it bind you.",
    "Darkness gathers only to remind you where the light begins. Breathe, Archivist—the shelves are holding steady.",
    "Your depths are not a flaw; they are the well the Archive drinks from. Rest there awhile before surfacing again."
  ]
};

// 2. PERSONALITY-SPECIFIC QUESTS

export interface PersonalityQuest {
  id: string;
  title: string;
  description: string;
  reward: string;
  total: number;
  wellnessProperty: string;
  journalUnlock?: string; // Optional journal prompt ID to unlock when quest is completed
}

export const PersonalityQuests: Record<PersonalityKey, PersonalityQuest[]> = {
  Openness: [
    {
      id: 'openness_1',
      title: "📖 The Unread Chapter",
      description: "The Curator marks three tomes still sealed in dust. Venture into them and let their forgotten voices awaken.",
      reward: "🔮 Visionary’s Orb",
      total: 3,
      wellnessProperty: "connection"
    },
    {
      id: 'openness_2',
      title: "🕸️ The Mind Weaver",
      description: "In the Hall of Dissonance, transform five wayward thoughts into patterns of meaning. Each reform becomes a thread in your web of insight.",
      reward: "✨ Sigil of Innovation",
      total: 5,
      wellnessProperty: "balance"
    },
    {
      id: 'openness_3',
      title: "🌌 The Branching Path",
      description: "Walk ten divergent corridors and witness how endings rewrite themselves. The Archive loves those who wander and return changed.",
      reward: "🌟 Star-Charter’s Compass",
      total: 10,
      wellnessProperty: "awareness"
    }
  ],

  Conscientiousness: [
    {
      id: 'conscientiousness_1',
      title: "📜 The Scribe’s Ritual",
      description: "For seven dawns, inscribe your reflections in the Codex. Consistency turns ink into incantation.",
      reward: "🏆 Aegis of Resolve",
      total: 7,
      wellnessProperty: "balance"
    },
    {
      id: 'conscientiousness_2',
      title: "🏗️ Architect of the Self",
      description: "Complete five guided inscriptions that map your principles and reveal the foundations beneath your habits.",
      reward: "📋 Scroll of Mastery",
      total: 5,
      wellnessProperty: "awareness"
    },
    {
      id: 'conscientiousness_3',
      title: "⚖️ The Unwavering Path",
      description: "Walk a story to its end without abandoning your chosen intent. Let the Curator record the steadiness of your resolve.",
      reward: "⚖️ Warden’s Seal",
      total: 2,
      wellnessProperty: "resilience"
    }
  ],

  Extraversion: [
    {
      id: 'extraversion_1',
      title: "🤝 Kindred Spirits",
      description: "Within the Archive’s tales, form one true connection. The bond itself becomes a living page.",
      reward: "🌟 Emblem of Fellowship",
      total: 1,
      wellnessProperty: "connection"
    },
    {
      id: 'extraversion_2',
      title: "💬 Voice of the Heart",
      description: "Speak ten times with warmth and intention. Your words shape the resonance of the halls.",
      reward: "⚡ Heartwood Charm",
      total: 10,
      wellnessProperty: "balance"
    },
    {
      id: 'extraversion_3',
      title: "🎭 Shared Horizons",
      description: "Write five reflections on the people who dwell in your stories. Connection remembered is connection strengthened.",
      reward: "🎭 Silver Tongue’s Badge",
      total: 5,
      wellnessProperty: "awareness"
    }
  ],

  Agreeableness: [
    {
      id: 'agreeableness_1',
      title: "🕊️ The Peacemaker’s Gambit",
      description: "Defuse five conflicts with measured grace. Each peace forged adds a petal to the Garden of Accord.",
      reward: "🕊️ Branch of Accord",
      total: 5,
      wellnessProperty: "connection"
    },
    {
      id: 'agreeableness_2',
      title: "💚 The Empath’s Way",
      description: "Choose compassion ten times when judgment would be easier. The Archive softens where you do.",
      reward: "💚 Sunstone of Empathy",
      total: 10,
      wellnessProperty: "balance"
    },
    {
      id: 'agreeableness_3',
      title: "🌸 The Quiet Strength",
      description: "In eight moments of pressure, hold your boundary without breaking kindness. Strength and gentleness can share a page.",
      reward: "🛡️ Bulwark of the Gentle",
      total: 8,
      wellnessProperty: "awareness"
    }
  ],

  Neuroticism: [
    {
      id: 'neuroticism_1',
      title: "🧭 Cartographer of the Heart",
      description: "For fourteen nights, map the tides of your emotion in the Codex. Each entry steadies the hand that holds the pen.",
      reward: "🧘 Amulet of Clarity",
      total: 14,
      wellnessProperty: "awareness"
    },
    {
      id: 'neuroticism_2',
      title: "🌊 Defying the Shadows",
      description: "In the Mind Defender, survive seven waves of whispers. Victory here echoes through quieter thoughts.",
      reward: "🌊 Runic Stone of Serenity",
      total: 7,
      wellnessProperty: "balance"
    },
    {
      id: 'neuroticism_3',
      title: "🌙 The Voyage Within",
      description: "Complete twelve introspective inscriptions that reveal what hides beneath the noise. Depth brings light.",
      reward: "🌙 Oracle’s Insight",
      total: 12,
      wellnessProperty: "connection"
    }
  ]
} as const;

// 3. PERSONALITY-SPECIFIC COPING TOOLS
// These replace traditional equipment for personality-based users
// Some tools are unlocked through story completion and map to character equipment
export const CopingTools = {
  Openness: [
    // Starting tools
    {
      id: 'tool_creative_visualization',
      name: "Mind's Eye Tapestry",
      icon: "🎨",
      description: "Weave a calm scene on an inner loom, then step into it and look around.",
      how_to_use: "Close your eyes. Picture a safe place until you can smell the air there.",
      unlocked: true
    },
    {
      id: 'tool_curiosity_meditation',
      name: "Whispering Lore",
      icon: "🔍",
      description: "Let thoughts pass as hushed footnotes. Read without obeying.",
      how_to_use: "Listen to your mind for one minute without answering its questions.",
      unlocked: true
    },

    // Story-unlocked tools
    {
      id: 'tool_possibility_mapping',
      name: "Cartographer's Charm",
      icon: "🗺️",
      description: "Sketch three paths forward. Mark the gentlest first step on each.",
      how_to_use: "Write three small ways through a problem. Choose the one that feels kindest.",
      unlocked: false
    },
    {
      id: 'tool_ancient_wisdom',
      name: "Scroll of Elders",
      icon: "📜",
      description: "Consult a trusted sentence you keep for hard days. Copy it into the Codex.",
      how_to_use: "Find one quote that steadies you. Rewrite it by hand before sleeping.",
      unlocked: false
    },
    {
      id: 'tool_perspective_lens',
      name: "Lens of Many Truths",
      icon: "🔮",
      description: "Rotate the lens. Ask what you missed, what still matters, and what can wait.",
      how_to_use: "Pause before reacting. Look at the same event from two other viewpoints.",
      unlocked: false
    },
    {
      id: 'tool_wanderer_journal',
      name: "Chronicler's Quill",
      icon: "📖",
      description: "Write a short travel note from future you, thanking you for one small choice today.",
      how_to_use: "End each night by writing one sentence of gratitude to your present self.",
      unlocked: false
    },
    {
      id: 'tool_dream_weaving',
      name: "Somnus Weaving",
      icon: "✨",
      description: "Before sleep, set a single question and a kind intention. Read the reply in the morning.",
      how_to_use: "Whisper one hope before bed. Record the dream that answers it.",
      unlocked: false
    },
    {
      id: 'tool_innovation_spark',
      name: "Spark of Ingenuity",
      icon: "💡",
      description: "List five wild fixes. Circle one that is small enough to try now.",
      how_to_use: "Challenge yourself to solve a small problem in a completely new way.",
      unlocked: false
    }
  ],

  Conscientiousness: [
    // Starting tools
    {
      id: 'tool_structured_breathing',
      name: "Rhythmic Breath",
      icon: "🧘",
      description: "Use 4–7–8 to steady the shelves. Four in, seven hold, eight out.",
      how_to_use: "Breathe with the rhythm: inhale 4, hold 7, exhale 8. Repeat four times.",
      unlocked: true
    },
    {
      id: 'tool_goal_laddering',
      name: "The Ascendant's Path",
      icon: "📋",
      description: "Break the mountain into stones. Pick the next stone and place it.",
      how_to_use: "Turn one big task into three small ones. Start with the easiest.",
      unlocked: true
    },

    // Story-unlocked tools
    {
      id: 'tool_routine_anchor',
      name: "Anchorstone Ritual",
      icon: "⚓",
      description: "Tie one habit to something you already do. Let the knot hold for a week.",
      how_to_use: "Pair a new ritual with a daily habit, like stretching after brushing teeth.",
      unlocked: false
    },
    {
      id: 'tool_focus_crystal',
      name: "Focusing Crystal",
      icon: "💎",
      description: "Set a 10 minute watch. One shelf, one task, no visitors.",
      how_to_use: "Work with focus for ten minutes. Stop when the time ends—no guilt.",
      unlocked: false
    },
    {
      id: 'tool_discipline_shield',
      name: "Aegis of Discipline",
      icon: "🛡️",
      description: "Write the first tempting distraction on scrap. Set it aside and finish one line.",
      how_to_use: "Keep a note labeled 'Later.' Write down interruptions and continue.",
      unlocked: false
    },
    {
      id: 'tool_progress_tracker',
      name: "The Warden's Ledger",
      icon: "📊",
      description: "Mark a single check for each kept promise. Let the row of lamps motivate you.",
      how_to_use: "Track one positive behavior daily. Watch how small marks build momentum.",
      unlocked: false
    },
    {
      id: 'tool_habit_architect',
      name: "Rune of Habit",
      icon: "🏗️",
      description: "Make the start easy and visible. Make the stop clear and kind.",
      how_to_use: "Prepare your tools the night before. Celebrate each start, not just finishes.",
      unlocked: false
    },
    {
      id: 'tool_time_guardian',
      name: "Chronos Warden",
      icon: "⏰",
      description: "Guard two short focus windows today. Close the door and tend your lamp.",
      how_to_use: "Set two protected time blocks for quiet work. Treat them as sacred.",
      unlocked: false
    }
  ],

  Extraversion: [
    // Starting tools
    {
      id: 'tool_social_recharging',
      name: "Font of Fellowship",
      icon: "🔋",
      description: "Name one person who steadies your light. Send a small note or ask to share time.",
      how_to_use: "Reach out with a brief hello or thanks. The act refills both lights.",
      unlocked: true
    },
    {
      id: 'tool_energy_mapping',
      name: "Aura Weaving",
      icon: "⚡",
      description: "Map what gives and what drains. Plan one pulse of light and one pocket of quiet.",
      how_to_use: "Journal what energizes you today. Schedule recovery after high effort.",
      unlocked: true
    },

    // Story-unlocked tools
    {
      id: 'tool_boundary_setting',
      name: "Warding Circle",
      icon: "🛡️",
      description: "Set a gentle rule for the next hour. Announce it and keep it.",
      how_to_use: "Tell others your boundary kindly: 'I need 20 quiet minutes, then I’m back.'",
      unlocked: false
    },
    {
      id: 'tool_connection_bridge',
      name: "Bridge of Bonds",
      icon: "🌉",
      description: "Ask one open question and wait. Let the reply finish before you speak.",
      how_to_use: "Use curiosity to listen more than you talk in one conversation.",
      unlocked: false
    },
    {
      id: 'tool_energy_amplifier',
      name: "Resonance Stone",
      icon: "📡",
      description: "Stack a small reward after a social task you fear. Let resonance carry you.",
      how_to_use: "Plan a pleasant activity right after a draining meeting.",
      unlocked: false
    },
    {
      id: 'tool_conversation_catalyst',
      name: "Catalyst Charm",
      icon: "💬",
      description: "Share a genuine compliment that names effort, not talent.",
      how_to_use: "Say, 'I noticed how much care you put into that.' Watch what happens.",
      unlocked: false
    },
    {
      id: 'tool_charisma_cloak',
      name: "Mantle of Presence",
      icon: "✨",
      description: "Plant both feet. Drop your shoulders. Speak slower than you think.",
      how_to_use: "Breathe before you respond. Stillness draws others in.",
      unlocked: false
    },
    {
      id: 'tool_network_weaver',
      name: "Web of Kinship",
      icon: "🕸️",
      description: "Introduce two allies who should meet. Tend the web and check back later.",
      how_to_use: "Connect two people today for mutual benefit. Follow up soon after.",
      unlocked: false
    }
  ],

  Agreeableness: [
    // Starting tools
    {
      id: 'tool_assertiveness_scripts',
      name: "The Gentle Word",
      icon: "💬",
      description: "Use a three part sentence: I feel, I need, I will.",
      how_to_use: "Practice one clear statement of need aloud. Keep the tone soft but steady.",
      unlocked: true
    },
    {
      id: 'tool_empathy_boundaries',
      name: "The Empath's Shield",
      icon: "🌊",
      description: "Name what is yours and what is not. Wish them well and keep your footing.",
      how_to_use: "Before helping, ask: 'Can I hold this right now?' If not, release it mentally.",
      unlocked: true
    },

    // Story-unlocked tools
    {
      id: 'tool_conflict_resolution',
      name: "Mediator's Accord",
      icon: "🤝",
      description: "Reflect back what you heard. Ask what a fair next step could be.",
      how_to_use: "In conflict, repeat their words first to show understanding before replying.",
      unlocked: false
    },
    {
      id: 'tool_harmony_compass',
      name: "Compass of Harmony",
      icon: "🧭",
      description: "Pick the option that is kind to both of you and honest to the truth.",
      how_to_use: "When torn, ask: 'What choice respects both of us?'",
      unlocked: false
    },
    {
      id: 'tool_peace_weaver',
      name: "The Peace Weaver's Loom",
      icon: "🕊️",
      description: "Breathe once for you and once for them. Speak on the second breath.",
      how_to_use: "Pause mid-conversation. Let empathy and honesty braid together.",
      unlocked: false
    },
    {
      id: 'tool_kindness_armor',
      name: "Armor of Kindness",
      icon: "💚",
      description: "When you must say no, offer one small yes that does not cost you.",
      how_to_use: "Decline gently: 'I can’t today, but I can check in tomorrow.'",
      unlocked: false
    },
    {
      id: 'tool_truth_speaking',
      name: "Voice of Verity",
      icon: "🗣️",
      description: "Say the true thing in simple words. Stop when the truth is said.",
      how_to_use: "Use plain language to express feelings. Avoid justifying or apologizing.",
      unlocked: false
    },
    {
      id: 'tool_healing_presence',
      name: "Soothing Aura",
      icon: "🌟",
      description: "Lower the volume of the room. Choose calm posture and a quiet tone.",
      how_to_use: "Slow your breath and voice when others escalate; stillness invites peace.",
      unlocked: false
    }
  ],

  Neuroticism: [
    // Starting tools
    {
      id: 'tool_emotion_surfing',
      name: "Riding the Tides",
      icon: "🏄",
      description: "Name the feeling, rate the swell, and ride one breath at a time.",
      how_to_use: "Say: 'This is sadness. It feels like a six. It will pass.'",
      unlocked: true
    },
    {
      id: 'tool_worry_time',
      name: "The Worry Stone",
      icon: "⏰",
      description: "Set a 15 minute worry window later. Park concerns on paper until then.",
      how_to_use: "When anxious thoughts appear, jot them down. Revisit them only at your set time.",
      unlocked: true
    },

    // Story-unlocked tools
    {
      id: 'tool_grounding_techniques',
      name: "Earth Anchor",
      icon: "🌱",
      description: "Touch five things you see, four you feel, three you hear, two you smell, one you taste.",
      how_to_use: "Use your senses to locate yourself in the present moment.",
      unlocked: false
    },
    {
      id: 'tool_storm_anchor',
      name: "Anchor of Serenity",
      icon: "⚓",
      description: "Hold a cool object. Count backward from 30 while breathing slow.",
      how_to_use: "Use a tactile object as a physical anchor during strong emotion.",
      unlocked: false
    },
    {
      id: 'tool_calm_sanctuary',
      name: "Inner Sanctum",
      icon: "🏛️",
      description: "Picture a safe room in the Archive. Add one detail each visit.",
      how_to_use: "Visualize your sanctuary for one minute whenever tension rises.",
      unlocked: false
    },
    {
      id: 'tool_resilience_roots',
      name: "Roots of Resilience",
      icon: "🌳",
      description: "Recall a past storm you survived. Write one line about what helped.",
      how_to_use: "Write a sentence about strength you have shown before. Read it aloud.",
      unlocked: false
    },
    {
      id: 'tool_emotion_compass',
      name: "Compass of the Heart",
      icon: "🧭",
      description: "Ask what the feeling is pointing toward, what it protects, and what it needs.",
      how_to_use: "Ask your emotion: 'What are you trying to tell me?'",
      unlocked: false
    },
    {
      id: 'tool_mindful_observer',
      name: "The Silent Watcher",
      icon: "👁️",
      description: "Sit for two minutes and label thoughts as story, fear, or plan.",
      how_to_use: "Label without judgment. Notice which label appears most often.",
      unlocked: false
    },
    {
      id: 'tool_serenity_shield',
      name: "Shield of Serenity",
      icon: "🛡️",
      description: "Breathe in for four and out for six while tracing a square in the air.",
      how_to_use: "Use steady, slow breaths while visualizing a barrier of calm forming.",
      unlocked: false
    }
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