import { PersonalityKey } from "../imports";

export const PersonalityConfigs = {
  Openness: {
    avatar: "🔮",
    gameTitle: "Chronicles of the Infinite Mind",
    scholarClass: "Sage Explorer",
    journeyDesc: "Wandering through endless corridors of possibility...",
    curatorNote: "The Curator whispers of hidden knowledge...",
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
    archiveSection: "The Dreamscape Library",
    mysticalElements: {
      borderGlow: '#9d4edd',
      avatarGlow: '#f72585',
    }
  },
  
  Conscientiousness: {
    avatar: "⚖️",
    gameTitle: "The Methodical Codex",
    scholarClass: "Order Keeper",
    journeyDesc: "Cataloging the sacred texts of self-mastery...",
    curatorNote: "The Curator commends your dedication...",
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
    archiveSection: "The Structured Sanctum",
    mysticalElements: {
      borderGlow: '#2a9d8f',
      avatarGlow: '#f4a261',
    }
  },
  
  Extraversion: {
    avatar: "🌟",
    gameTitle: "Tales of the Connected Soul",
    scholarClass: "Social Catalyst",
    journeyDesc: "Gathering wisdom from the fellowship of minds...",
    curatorNote: "The Curator celebrates your vibrant spirit...",
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
    archiveSection: "The Grand Assembly Hall",
    mysticalElements: {
      borderGlow: '#f72585',
      avatarGlow: '#ffd60a',
    }
  },
  
  Agreeableness: {
    avatar: "🕊️",
    gameTitle: "The Harmony Archives",
    scholarClass: "Peace Weaver",
    journeyDesc: "Seeking balance in the chambers of understanding...",
    curatorNote: "The Curator feels your gentle wisdom...",
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
    archiveSection: "The Healing Gardens",
    mysticalElements: {
      borderGlow: '#06ffa5',
      avatarGlow: '#ffffb3',
    }
  },
  
  Neuroticism: {
    avatar: "🌙",
    gameTitle: "Depths of the Inner Sanctum",
    scholarClass: "Shadow Walker",
    journeyDesc: "Delving deep into the shadowed alcoves of the psyche...",
    curatorNote: "The Curator understands your profound depths...",
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
    archiveSection: "The Reflection Chambers",
    mysticalElements: {
      borderGlow: '#7209b7',
      avatarGlow: '#a663cc',
    }
  }
};

export type PersonalityConfig = typeof PersonalityConfigs[PersonalityKey];
