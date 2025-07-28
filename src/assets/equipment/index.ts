
// Focus Items - using staff/wand icons for meditation and focus tools
export const focus: Record<string, any> = {
  // Base meditation and focus tools
  meditation: require('../../../assets/equipment/weapons/fb1455.png'),  // Staff/wand icon
  breathing: require('../../../assets/equipment/weapons/fb1455.png'),   // Staff/wand icon
  journaling: require('../../../assets/equipment/weapons/fb1455.png'),  // Staff/wand icon
  journaltwo: require('../../../assets/equipment/weapons/fb1455.png'),  // Staff/wand icon
  
  // Named focus items
  scroll: require('../../../assets/equipment/weapons/Scroll.png'),           // Ancient Scroll
  magicWand: require('../../../assets/equipment/weapons/Magic Wand.png'),    // Magic Wand
  topazStaff: require('../../../assets/equipment/weapons/Topaz Staff.png'),  // Topaz Staff
  sapphireStaff: require('../../../assets/equipment/weapons/Sapphire Staff.png'), // Sapphire Staff
  torch: require('../../../assets/equipment/weapons/Torch.png'),             // Torch
  item2: require('../../../assets/equipment/weapons/item_2.png'),            // Mysterious Item
};

// Comfort Layers - using armor icons for comfort and protection
export const comfort: Record<string, any> = {
  // Base comfort items
  social: require('../../../assets/equipment/armor/fb1867.png'),    // Social comfort robe
  hobby: require('../../../assets/equipment/armor/fb1857.png'),     // Hobby protection armor
  nature: require('../../../assets/equipment/armor/fb1867.png'),    // Nature comfort robe
  
  // Named comfort items
  item27: require('../../../assets/equipment/armor/item_27.png'),   // Comfort Layer 1
  item29: require('../../../assets/equipment/armor/item_29.png'),   // Comfort Layer 2
  item31: require('../../../assets/equipment/armor/item_31.png'),   // Comfort Layer 3
};

// Mind Shields - using helmet icons for mental protection
export const shield: Record<string, any> = {
  // Base shield items
  boundary: require('../../../assets/equipment/helmets/fb1842.png'), // Boundary helmet
  affirmation: require('../../../assets/equipment/helmets/fb1842.png'), // Affirmation helmet
  routine: require('../../../assets/equipment/helmets/fb1842.png'),    // Routine helmet
  
  // Named shield items
  wizardHat: require('../../../assets/equipment/helmets/Wizard Hat.png'),     // Wizard Hat
  helm: require('../../../assets/equipment/helmets/Helm.png'),                // Basic Helm
  ironHelmet: require('../../../assets/equipment/helmets/Iron Helmet.png'),   // Iron Helmet
  leatherHelmet: require('../../../assets/equipment/helmets/Leather Helmet.png'), // Leather Helmet
};

// Ground Stones - using boot icons for grounding and stability
export const ground: Record<string, any> = {
  // Base ground items
  exercise: require('../../../assets/equipment/boots/fb1854.png'),   // Exercise boots
  sleep: require('../../../assets/equipment/boots/fb1854.png'),      // Sleep boots
  nutrition: require('../../../assets/equipment/boots/fb1854.png'),  // Nutrition boots
  
  // Named ground items
  ironBoot: require('../../../assets/equipment/boots/Iron Boot.png'),     // Iron Boot
  leatherBoot: require('../../../assets/equipment/boots/Leather Boot.png'), // Leather Boot
};

// Combat Equipment - for traditional RPG items
export const combat: Record<string, any> = {
  // Weapons
  ironSword: require('../../../assets/equipment/weapons/Iron Sword.png'),     // Iron Sword
  goldenSword: require('../../../assets/equipment/weapons/Golden Sword.png'), // Golden Sword
  
  // Shields
  ironShield: require('../../../assets/equipment/weapons/Iron Shield.png'),   // Iron Shield
  woodenShield: require('../../../assets/equipment/weapons/Wooden Shield.png'), // Wooden Shield
};

// Archive header icon
export const archiveHeaderIcon = require('../../../assets/equipment/item_7.png');

// Equipment type to icon mapping
export const equipmentIcons = {
  focus,
  comfort,
  shield,
  ground,
  combat,
} as const;

// Equipment rarity colors - these represent the quality/effectiveness of coping skills
export const rarityColors = {
  common: '#9d9d9d',    // Basic coping skills
  uncommon: '#1eff00',  // Improved coping skills
  rare: '#0070dd',      // Advanced coping skills
  epic: '#a335ee',      // Mastered coping skills
  legendary: '#ff8000', // Exceptional coping skills
} as const;

// Equipment type labels
export const equipmentTypeLabels = {
  focus: 'Focus Item',     // Personal grounding object
  comfort: 'Comfort Layer', // Coping strategy/comfort item
  shield: 'Mind Shield',    // Mental protection/boundary tool
  ground: 'Ground Stone',   // Grounding/stability tool
  combat: 'Combat Gear',    // Traditional RPG equipment
} as const;

// Equipment name mappings - maps backend names to frontend asset names
export const equipmentNameMappings: Record<string, { type: string; subtype: string; displayName: string }> = {
  // Focus Items
  'scroll of stillness': { type: 'focus', subtype: 'scroll', displayName: 'Scroll of Stillness' },
  'ancient scroll': { type: 'focus', subtype: 'scroll', displayName: 'Ancient Scroll' },
  'magic wand': { type: 'focus', subtype: 'magicWand', displayName: 'Magic Wand' },
  'topaz staff': { type: 'focus', subtype: 'topazStaff', displayName: 'Topaz Staff' },
  'sapphire staff': { type: 'focus', subtype: 'sapphireStaff', displayName: 'Sapphire Staff' },
  'torch': { type: 'focus', subtype: 'torch', displayName: 'Torch' },
  'meditation focus': { type: 'focus', subtype: 'meditation', displayName: 'Meditation Focus' },
  'breathing tool': { type: 'focus', subtype: 'breathing', displayName: 'Breathing Tool' },
  'journal': { type: 'focus', subtype: 'journaling', displayName: 'Journal' },
  
  // Comfort Layers
  'social comfort': { type: 'comfort', subtype: 'social', displayName: 'Social Comfort' },
  'hobby protection': { type: 'comfort', subtype: 'hobby', displayName: 'Hobby Protection' },
  'nature comfort': { type: 'comfort', subtype: 'nature', displayName: 'Nature Comfort' },
  'comfort layer 1': { type: 'comfort', subtype: 'item27', displayName: 'Comfort Layer I' },
  'comfort layer 2': { type: 'comfort', subtype: 'item29', displayName: 'Comfort Layer II' },
  'comfort layer 3': { type: 'comfort', subtype: 'item31', displayName: 'Comfort Layer III' },
  
  // Mind Shields
  'boundary shield': { type: 'shield', subtype: 'boundary', displayName: 'Boundary Shield' },
  'affirmation shield': { type: 'shield', subtype: 'affirmation', displayName: 'Affirmation Shield' },
  'routine shield': { type: 'shield', subtype: 'routine', displayName: 'Routine Shield' },
  'wizard hat': { type: 'shield', subtype: 'wizardHat', displayName: 'Wizard Hat' },
  'helm': { type: 'shield', subtype: 'helm', displayName: 'Basic Helm' },
  'iron helmet': { type: 'shield', subtype: 'ironHelmet', displayName: 'Iron Helmet' },
  'leather helmet': { type: 'shield', subtype: 'leatherHelmet', displayName: 'Leather Helmet' },
  
  // Ground Stones
  'exercise boots': { type: 'ground', subtype: 'exercise', displayName: 'Exercise Boots' },
  'sleep boots': { type: 'ground', subtype: 'sleep', displayName: 'Sleep Boots' },
  'nutrition boots': { type: 'ground', subtype: 'nutrition', displayName: 'Nutrition Boots' },
  'iron boots': { type: 'ground', subtype: 'ironBoot', displayName: 'Iron Boots' },
  'leather boots': { type: 'ground', subtype: 'leatherBoot', displayName: 'Leather Boots' },
  
  // Combat Gear
  'iron sword': { type: 'combat', subtype: 'ironSword', displayName: 'Iron Sword' },
  'golden sword': { type: 'combat', subtype: 'goldenSword', displayName: 'Golden Sword' },
  'iron shield': { type: 'combat', subtype: 'ironShield', displayName: 'Iron Shield' },
  'wooden shield': { type: 'combat', subtype: 'woodenShield', displayName: 'Wooden Shield' },
};

// Helper function to get equipment asset by name
export const getEquipmentAssetByName = (name: string) => {
  const normalizedName = name.toLowerCase().trim();
  const mapping = equipmentNameMappings[normalizedName];
  
  if (mapping) {
    return {
      asset: equipmentIcons[mapping.type as keyof typeof equipmentIcons][mapping.subtype],
      displayName: mapping.displayName,
      type: mapping.type,
      subtype: mapping.subtype
    };
  }
  
  // Fallback to default based on common keywords
  if (normalizedName.includes('scroll') || normalizedName.includes('stillness')) {
    return {
      asset: equipmentIcons.focus.scroll,
      displayName: name,
      type: 'focus',
      subtype: 'scroll'
    };
  }
  
  if (normalizedName.includes('wand') || normalizedName.includes('magic')) {
    return {
      asset: equipmentIcons.focus.magicWand,
      displayName: name,
      type: 'focus',
      subtype: 'magicWand'
    };
  }
  
  if (normalizedName.includes('staff')) {
    if (normalizedName.includes('topaz')) {
      return {
        asset: equipmentIcons.focus.topazStaff,
        displayName: name,
        type: 'focus',
        subtype: 'topazStaff'
      };
    }
    if (normalizedName.includes('sapphire')) {
      return {
        asset: equipmentIcons.focus.sapphireStaff,
        displayName: name,
        type: 'focus',
        subtype: 'sapphireStaff'
      };
    }
  }
  
  if (normalizedName.includes('sword')) {
    if (normalizedName.includes('golden') || normalizedName.includes('gold')) {
      return {
        asset: equipmentIcons.combat.goldenSword,
        displayName: name,
        type: 'combat',
        subtype: 'goldenSword'
      };
    }
    return {
      asset: equipmentIcons.combat.ironSword,
      displayName: name,
      type: 'combat',
      subtype: 'ironSword'
    };
  }
  
  if (normalizedName.includes('shield')) {
    if (normalizedName.includes('iron')) {
      return {
        asset: equipmentIcons.combat.ironShield,
        displayName: name,
        type: 'combat',
        subtype: 'ironShield'
      };
    }
    return {
      asset: equipmentIcons.combat.woodenShield,
      displayName: name,
      type: 'combat',
      subtype: 'woodenShield'
    };
  }
  
  if (normalizedName.includes('helmet')) {
    if (normalizedName.includes('iron')) {
      return {
        asset: equipmentIcons.shield.ironHelmet,
        displayName: name,
        type: 'shield',
        subtype: 'ironHelmet'
      };
    }
    if (normalizedName.includes('leather')) {
      return {
        asset: equipmentIcons.shield.leatherHelmet,
        displayName: name,
        type: 'shield',
        subtype: 'leatherHelmet'
      };
    }
  }
  
  if (normalizedName.includes('boot') || normalizedName.includes('shoe')) {
    if (normalizedName.includes('iron')) {
      return {
        asset: equipmentIcons.ground.ironBoot,
        displayName: name,
        type: 'ground',
        subtype: 'ironBoot'
      };
    }
    if (normalizedName.includes('leather')) {
      return {
        asset: equipmentIcons.ground.leatherBoot,
        displayName: name,
        type: 'ground',
        subtype: 'leatherBoot'
      };
    }
  }
  
  // Default fallbacks
  return {
    asset: equipmentIcons.focus.meditation,
    displayName: name,
    type: 'focus',
    subtype: 'meditation'
  };
}; 