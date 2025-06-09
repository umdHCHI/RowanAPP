import { ArmorType, BootsType, HelmetType, WeaponType } from '../../src/types/equipment';

// Weapons
export const weapons: Record<WeaponType, any> = {
  sword: require('./weapons/fb1455.png'),
};

// Armor
export const armor: Record<ArmorType, any> = {
  leather: require('./armor/fb1857.png'),
  plate: require('./armor/fb1867.png'),
};

// Helmets
export const helmets: Record<HelmetType, any> = {
  plate_helm: require('./helmets/fb1842.png'),
};

// Boots
export const boots: Record<BootsType, any> = {
  plate_boots: require('./boots/fb1854.png'),
};

// Equipment type to icon mapping
export const equipmentIcons = {
  weapons,
  armor,
  helmets,
  boots,
} as const;

// Equipment rarity colors
export const rarityColors = {
  common: '#9d9d9d',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
} as const;

// Equipment type labels
export const equipmentTypeLabels = {
  weapons: 'Weapon',
  armor: 'Armor',
  helmets: 'Helmet',
  boots: 'Boots',
} as const; 