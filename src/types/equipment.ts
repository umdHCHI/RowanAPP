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

