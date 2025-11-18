// ===== SHARED TYPES FOR CONTEXT MODULES =====

export interface ArchiveFoundation {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  colors: string[];
  description: string;
  recentGain: number;
  nextUnlock: string;
  storyTriggers: string[];
}

export interface MentalArtifact {
  name: string;
  type: string;
  equipped: boolean;
  lumens: number;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface ArchiveArea {
  id: string;
  name: string;
  roomNumber: number;
  description: string;
  requiredStories: number;
  requiredEntries: number;
  unlocked: boolean;
  progress: number;
}