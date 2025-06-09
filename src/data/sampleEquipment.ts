import { EquipmentItem } from '../types/equipment';

export const sampleInventory: EquipmentItem[] = [
  {
    id: '1',
    name: 'Steel Sword',
    type: 'weapons',
    subtype: 'sword',
    rarity: 'rare',
    stats: {
      attack: 15,
    },
  },
  {
    id: '2',
    name: 'Leather Armor',
    type: 'armor',
    subtype: 'leather',
    rarity: 'common',
    stats: {
      defense: 5,
      health: 10,
    },
  },
  {
    id: '3',
    name: 'Plate Armor',
    type: 'armor',
    subtype: 'plate',
    rarity: 'epic',
    stats: {
      defense: 20,
      health: 30,
    },
  },
  {
    id: '4',
    name: 'Plate Helmet',
    type: 'helmets',
    subtype: 'plate_helm',
    rarity: 'rare',
    stats: {
      defense: 10,
    },
  },
  {
    id: '5',
    name: 'Plate Boots',
    type: 'boots',
    subtype: 'plate_boots',
    rarity: 'rare',
    stats: {
      defense: 8,
    },
  },
]; 