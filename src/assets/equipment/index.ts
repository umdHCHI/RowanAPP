import { ArmorType, BootsType, HelmetType, WeaponType } from '../../types/equipment';

// Weapons
export const weapons: Record<WeaponType, any> = {
  sword: require('./weapons/sword.png'),
  axe: require('./weapons/axe.png'),
  bow: require('./weapons/bow.png'),
  staff: require('./weapons/staff.png'),
  dagger: require('./weapons/dagger.png'),
  mace: require('./weapons/mace.png'),
  spear: require('./weapons/spear.png'),
  wand: require('./weapons/wand.png'),
};

// Armor
export const armor: Record<ArmorType, any> = {
  leather: require('./armor/leather.png'),
  chainmail: require('./armor/chainmail.png'),
  plate: require('./armor/plate.png'),
  robe: require('./armor/robe.png'),
  scale: require('./armor/scale.png'),
};

// Helmets
export const helmets: Record<HelmetType, any> = {
  leather_cap: require('./helmets/leather_cap.png'),
  chain_coif: require('./helmets/chain_coif.png'),
  plate_helm: require('./helmets/plate_helm.png'),
  wizard_hat: require('./helmets/wizard_hat.png'),
  crown: require('./helmets/crown.png'),
};

// Boots
export const boots: Record<BootsType, any> = {
  leather_boots: require('./boots/leather_boots.png'),
  chain_boots: require('./boots/chain_boots.png'),
  plate_boots: require('./boots/plate_boots.png'),
  wizard_boots: require('./boots/wizard_boots.png'),
  winged_boots: require('./boots/winged_boots.png'),
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