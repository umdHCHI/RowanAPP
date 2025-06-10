export type FocusType = 'meditation' | 'breathing' | 'journaling';// TODO: Add meditation1, meditation2, meditation3
export type ComfortType = 'social' | 'hobby' | 'nature';
export type ShieldType = 'boundary' | 'affirmation' | 'routine';
export type GroundType = 'exercise' | 'sleep' | 'nutrition';


// TODO: Add equipment icons need to be added to the assets folder and then imported here
export const equipmentIcons = {
  focus: {
    meditation: require('../../assets/equipment/weapons/fb1455.png'),
    breathing: require('../../assets/equipment/weapons/fb1455.png'),
    journaling: require('../../assets/equipment/weapons/fb1455.png'),
    // TODO: Add meditation1, meditation2, meditation3
  },
  comfort: {
    social: require('../../assets/equipment/armor/fb1867.png'),
    hobby: require('../../assets/equipment/armor/fb1857.png'),
    nature: require('../../assets/equipment/armor/fb1867.png'),
  },
  shield: {
    boundary: require('../../assets/equipment/helmets/fb1842.png'),
    affirmation: require('../../assets/equipment/helmets/fb1842.png'),
    routine: require('../../assets/equipment/helmets/fb1842.png'),
  },
  ground: {
    exercise: require('../../assets/equipment/boots/fb1854.png'),
    sleep: require('../../assets/equipment/boots/fb1854.png'),
    nutrition: require('../../assets/equipment/boots/fb1854.png'),
  },
} as const;

export const equipmentTypeLabels = {
  focus: 'Focus Item',
  comfort: 'Comfort Layer',
  shield: 'Mind Shield',
  ground: 'Ground Stone',
} as const;

export const rarityColors = {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
} as const; 