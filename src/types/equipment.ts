import { PersonalityKey } from './personality';
export type EquipmentType = 'focus' | 'comfort' | 'shield' | 'ground';

export type EquipmentSubtype = 
  | 'meditation' | 'breathing' | 'journaling'  // Focus items
  | 'social' | 'hobby' | 'nature'             // Comfort layers
  | 'boundary' | 'affirmation' | 'routine'    // Mind shields
  | 'exercise' | 'sleep' | 'nutrition';       // Ground stones

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  subtype: EquipmentSubtype;
  description: string;
  unlockCondition: string;
  wellnessStats: {
    awareness?: number;
    resilience?: number;
    connection?: number;
    balance?: number;
  };
  effect: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level?: number;
}

export interface EquippedItems {
  focus?: EquipmentItem;
  comfort?: EquipmentItem;
  shield?: EquipmentItem;
  ground?: EquipmentItem;
}

export interface CharacterGear {
    id: number;
    gear_type: {
        id: number;
        name: string;
        slot: 'weapon' | 'armor' | 'helmet' | 'boots';
        description: string;
        emoji_icon: string;
        stat_bonuses: Record<string, number>;
    };
    is_equipped: boolean;
    acquired_at: string;
}

// Equipment categories for organization
export const EQUIPMENT_CATEGORIES = {
  focus: 'Focus Items',
  comfort: 'Comfort Layers', 
  shield: 'Mind Shields',
  ground: 'Ground Stones'
} as const;

// Rarity colors for UI
export const RARITY_COLORS = {
  common: '#6B7280',
  uncommon: '#10B981', 
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F97316'
} as const; 



export interface CopingToolsCollectionProps {
  unlockedTools: string[];
  primaryTrait: PersonalityKey;
  authToken: string | null;
  globalStyles: any;
}

export interface CopingTool {
    id: number;
    name: string;
    tool_type: string; // aligns with base stats
    subtype: string;
    description: string;
    emoji_icon: string;
    awareness_bonus: number;
    resilience_bonus: number;
    connection_bonus: number;
    balance_bonus: number;
    level_required: number;
    memories_required: number;
    insights_required: number;
    wellness_bonuses: Record<string, number>;
    personality_type: string;
    tool_id: string; // Unique identifier for the tool
    is_unlocked_for_character: boolean;
    created_at: string;
}

export interface GearType {
  id: number;
  name: string;
  slot: string;
  description: string;
  emoji_icon: string;
  mindfulness_bonus: number;
  focus_bonus: number;
  confidence_bonus: number;
  resilience_bonus: number;
  empathy_bonus: number;
  organization_bonus: number;
  stat_bonuses: {
    mindfulness: number;
    focus: number;
    confidence: number;
    resilience: number;
    empathy: number;
    organization: number;
  };
  created_at: string;
}
// ===== SHARED EQUIPMENT UTILITY FUNCTIONS =====

/**
 * Maps backend stat bonuses to frontend wellness stats
 * Consolidates backend gear stats (mindfulness, focus, confidence, etc.) 
 * into the four core wellness attributes (awareness, resilience, connection, balance)
 */
export function mapBackendStatsToWellnessStats(statBonuses: Record<string, number>): Record<string, number> {
  const wellnessStats: Record<string, number> = {
    awareness: 0,
    resilience: 0,
    connection: 0,
    balance: 0
  };
  
  if (statBonuses.mindfulness) wellnessStats.awareness += statBonuses.mindfulness;
  if (statBonuses.focus) wellnessStats.awareness += statBonuses.focus;
  if (statBonuses.confidence) wellnessStats.resilience += statBonuses.confidence;
  if (statBonuses.resilience) wellnessStats.resilience += statBonuses.resilience;
  if (statBonuses.empathy) wellnessStats.connection += statBonuses.empathy;
  if (statBonuses.organization) wellnessStats.balance += statBonuses.organization;
  
  return wellnessStats;
}

/**
 * Maps backend gear slot to frontend equipment type
 */
export function mapBackendSlotToFrontendType(slot: 'weapon' | 'armor' | 'helmet' | 'boots'): keyof EquippedItems {
  switch (slot) {
    case 'weapon': return 'focus';
    case 'armor': return 'comfort';
    case 'helmet': return 'shield';
    case 'boots': return 'ground';
    default: return 'focus';
  }
}

/**
 * Maps backend gear name to frontend equipment subtype
 * Uses gear name patterns to determine the appropriate subtype
 */
export function mapBackendGearToSubtype(gearName: string, slot: 'weapon' | 'armor' | 'helmet' | 'boots'): EquipmentSubtype {
  const name = gearName.toLowerCase();
  
  switch (slot) {
    case 'weapon':
      if (name.includes('ancient scroll')) return 'meditation';
      if (name.includes('clarity lens')) return 'meditation';
      if (name.includes('explorer') && name.includes('notebook')) return 'journaling';
      if (name.includes('intuition compass')) return 'meditation';
      if (name.includes('empathy conduit')) return 'meditation';
      if (name.includes('toolkit story')) return 'meditation';
      if (name.includes('meditation') || name.includes('breathing')) return 'meditation';
      if (name.includes('journal')) return 'journaling';
      return 'meditation';
      
    case 'armor':
      if (name.includes('personal style cloak')) return 'social';
      if (name.includes('cultural wisdom wrap')) return 'social';
      if (name.includes('adaptation shield')) return 'social';
      if (name.includes('sanctuary shroud')) return 'social';
      if (name.includes('social') || name.includes('friend')) return 'social';
      if (name.includes('hobby') || name.includes('activity')) return 'hobby';
      if (name.includes('nature') || name.includes('outdoor')) return 'nature';
      return 'social';
      
    case 'helmet':
      if (name.includes('reality filter')) return 'boundary';
      if (name.includes('growth mindset crown')) return 'affirmation';
      if (name.includes('authenticity guard')) return 'boundary';
      if (name.includes('guardian ward')) return 'boundary';
      if (name.includes('boundary') || name.includes('limit')) return 'boundary';
      if (name.includes('affirmation') || name.includes('positive')) return 'affirmation';
      if (name.includes('routine') || name.includes('habit')) return 'routine';
      return 'boundary';
      
    case 'boots':
      if (name.includes('personal values foundation')) return 'exercise';
      if (name.includes('support network roots')) return 'exercise';
      if (name.includes('self-compassion stone')) return 'exercise';
      if (name.includes('foundation stone')) return 'exercise';
      if (name.includes('exercise') || name.includes('movement')) return 'exercise';
      if (name.includes('sleep') || name.includes('rest')) return 'sleep';
      if (name.includes('nutrition') || name.includes('food')) return 'nutrition';
      return 'exercise';
      
    default:
      return 'meditation';
  }
}

/**
 * Get rarity color gradients for UI display
 * Returns array of two colors for gradient effects
 */
export function getRarityColors(rarity: "Common" | "Rare" | "Epic" | "Legendary" | string): string[] {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  
  switch (normalizedRarity) {
    case "Common":
      return ["#6B7280", "#9CA3AF"];
    case "Rare":
      return ["#3B82F6", "#06B6D4"];
    case "Epic":
      return ["#A855F7", "#F472B6"];
    case "Legendary":
      return ["#F97316", "#FCD34D"];
    default:
      return ["#6B7280", "#9CA3AF"];
  }
}

