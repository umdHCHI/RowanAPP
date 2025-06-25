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