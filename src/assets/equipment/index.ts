
// Focus Items - using staff/wand icons for meditation and focus tools
export const focus: Record<string, any> = {
  meditation: require('./weapons/fb1455.png'),  // Using staff/wand icon
  breathing: require('./weapons/fb1455.png'),   // Using staff/wand icon
  journaling: require('./weapons/fb1455.png'),  // Using staff/wand icon
  journaltwo: require('./weapons/fb1455.png'),  // Using staff/wand icon
};

// Comfort Layers - using armor icons for comfort and protection
export const comfort: Record<string, any> = {
  social: require('./armor/fb1867.png'),    // Using robe/comforting armor
  physical: require('./armor/fb1857.png'),  // Using protective armor
  emotional: require('./armor/fb1867.png'), // Using robe/comforting armor
};

// Mind Shields - using helmet icons for mental protection
export const shield: Record<string, any> = {
  boundary: require('./helmets/fb1842.png'), // Using helmet for mental protection
  filter: require('./helmets/fb1842.png'),   // Using helmet for mental protection
  space: require('./helmets/fb1842.png'),    // Using helmet for mental protection
};

// Ground Stones - using boot icons for grounding and stability
export const ground: Record<string, any> = {
  movement: require('./boots/fb1854.png'),   // Using boots for movement
  sensory: require('./boots/fb1854.png'),    // Using boots for physical awareness
  breath: require('./boots/fb1854.png'),     // Using boots for grounding
};

// Equipment type to icon mapping
export const equipmentIcons = {
  focus,
  comfort,
  shield,
  ground,
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
} as const; 