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
}

export interface EquippedItems {
  focus?: EquipmentItem;
  comfort?: EquipmentItem;
  shield?: EquipmentItem;
  ground?: EquipmentItem;
} 