import { PersonalityKey } from "../imports";

export const PersonalityConfigs = {
  Openness: {
    avatar: "🔮",
    gameTitle: "The Uncharted Stacks",
    scholarClass: "Seeker of Doors",
    journeyDesc: "Charting corridors that appear only when imagined.",
    curatorNote: "The Curator leaves odd maps that finish themselves when you look.",
    theme: {
      primary: '#4ee6e6',
      secondary: '#9d4edd',
      accent: '#f72585',
      background: '#0a0b0f',
    },
    backgroundRunes: ["🌌", "✨", "🎭"],
    mindStates: [
      { icon: "🧠", label: "Curiosity", key: "awareness" },
      { icon: "🎨", label: "Creativity", key: "imagination" },
      { icon: "🚀", label: "Adventure", key: "openness" },
    ],
    archiveSection: "The Dreamwork Stacks",
    mysticalElements: {
      borderGlow: '#9d4edd',
      avatarGlow: '#f72585',
    }
  },

  Conscientiousness: {
    avatar: require("../../assets/personalityCharacters/Conscientiousness.png"),
    gameTitle: "The Ledger of Quiet Mastery",
    scholarClass: "Binder of Pages",
    journeyDesc: "Numbering shelves, setting lamps, restoring what frays.",
    curatorNote: "The Curator trusts your steady hand.",
    theme: {
      primary: '#4ee6e6',
      secondary: '#2a9d8f',
      accent: '#f4a261',
      background: '#0a0b0f',
    },
    backgroundRunes: ["📏", "⚙️", "🏛️"],
    mindStates: [
      { icon: "🎯", label: "Focus", key: "discipline" },
      { icon: "🛡️", label: "Resilience", key: "persistence" },
      { icon: "📈", label: "Progress", key: "achievement" },
    ],
    archiveSection: "The Ledger of Quiet Mastery",
    mysticalElements: {
      borderGlow: '#2a9d8f',
      avatarGlow: '#f4a261',
    }
  },

  Extraversion: {
    avatar: "🌟",
    gameTitle: "The Resonant Assembly",
    scholarClass: "Voice of the Hall",
    journeyDesc: "Gathering echoes and trading light between lamps.",
    curatorNote: "The Curator opens the doors when you arrive.",
    theme: {
      primary: '#4ee6e6',
      secondary: '#f72585',
      accent: '#ffd60a',
      background: '#0a0b0f',
    },
    backgroundRunes: ["🎪", "🌈", "🎉"],
    mindStates: [
      { icon: "⚡", label: "Energy", key: "vitality" },
      { icon: "🤝", label: "Connection", key: "social" },
      { icon: "🎭", label: "Expression", key: "communication" },
    ],
    archiveSection: "The Resonant Assembly",
    mysticalElements: {
      borderGlow: '#f72585',
      avatarGlow: '#ffd60a',
    }
  },

  Agreeableness: {
    avatar: require("../../assets/personalityCharacters/agreeableness.png"),
    gameTitle: "The Harmony Wing",
    scholarClass: "Peace Weaver",
    journeyDesc: "Tending to soft places where stories remember to breathe.",
    curatorNote: "The Curator notices how the rooms settle around you.",
    theme: {
      primary: '#4ee6e6',
      secondary: '#06ffa5',
      accent: '#ffffb3',
      background: '#0a0b0f',
    },
    backgroundRunes: ["🌸", "🕯️", "🤲"],
    mindStates: [
      { icon: "💚", label: "Empathy", key: "compassion" },
      { icon: "☮️", label: "Harmony", key: "peace" },
      { icon: "🌱", label: "Growth", key: "healing" },
    ],
    archiveSection: "The Harmony Wing",
    mysticalElements: {
      borderGlow: '#06ffa5',
      avatarGlow: '#ffffb3',
    }
  },

  Neuroticism: {
    avatar: require("../../assets/personalityCharacters/neurotism.png"),
    gameTitle: "The Nocturne Vault",
    scholarClass: "Shadow Walker",
    journeyDesc: "Reading the pages that tremble and turning them with care.",
    curatorNote: "The Curator keeps a lamp lit while you descend.",
    theme: {
      primary: '#4ee6e6',
      secondary: '#7209b7',
      accent: '#a663cc',
      background: '#0a0b0f',
    },
    backgroundRunes: ["🌑", "🔍", "⚗️"],
    mindStates: [
      { icon: "🧘", label: "Awareness", key: "mindfulness" },
      { icon: "💎", label: "Depth", key: "introspection" },
      { icon: "🌊", label: "Flow", key: "emotional_balance" },
    ],
    archiveSection: "The Nocturne Vault",
    mysticalElements: {
      borderGlow: '#7209b7',
      avatarGlow: '#a663cc',
    }
  }
};

export type PersonalityConfig = typeof PersonalityConfigs[PersonalityKey];