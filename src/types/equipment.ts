export type WeaponType = 'sword';
export type ArmorType = 'leather' | 'plate';
export type HelmetType = 'plate_helm';
export type BootsType = 'plate_boots';

export type EquipmentType = 'weapons' | 'armor' | 'helmets' | 'boots';
export type EquipmentSubtype = WeaponType | ArmorType | HelmetType | BootsType;
export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  subtype: EquipmentSubtype;
  rarity: RarityType;
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
  };
}

export interface EquippedItems {
  weapon?: EquipmentItem;
  armor?: EquipmentItem;
  helmet?: EquipmentItem;
  boots?: EquipmentItem;
} 