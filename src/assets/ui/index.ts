// UI Assets - Icons and interface elements for replacing emojis

// Labels and markers
export const labels: Record<string, any> = {
  nameTag: require('../../../assets/UI/assets/bluepoint.png'),
  // Add more label icons here as needed
};

// Buttons
export const buttons: Record<string, any> = {
  lightGreenLong: require('../../../assets/UI/buttons/lightGreenlongbutton.png'),
  lightBrownLong: require('../../../assets/UI/buttons/lightBrownlongbutton.png'),
  darkBrownLong: require('../../../assets/UI/buttons/darkBrownlongbutton.png'),
};

// Character Creator UI elements
export const characterCreatorUI: Record<string, any> = {
  travelBookSelect: require('../../../assets/UI/character-creator-ui/UI_TravelBook_Select01a.png'),
  travelBookPopup: require('../../../assets/UI/character-creator-ui/UI_TravelBook_Popup01a.png'),
  travelBookMarker: require('../../../assets/UI/character-creator-ui/UI_TravelBook_Marker01a.png'),
};

// Section icons
export const sectionIcons: Record<string, any> = {
  // Using bluepoint for various label/tag purposes
  tag: require('../../../assets/UI/assets/bluepoint.png'),
  label: require('../../../assets/UI/assets/bluepoint.png'),
  name: require('../../../assets/UI/assets/bluepoint.png'),
  
  // Character creator UI elements can be repurposed for sections
  preview: require('../../../assets/UI/assets/openbook.png'),
  appearance: require('../../../assets/UI/assets/orangeflower.png'),
  complete: require('../../../assets/UI/assets/openbook.png'),
};

// Floating decorative elements - you can use your equipment icons for variety
export const floatingIcons: Record<string, any> = {
  // Use equipment icons for mystical floating elements
  forge: require('../../../assets/equipment/weapons/fb1455.png'),  // Staff for forge/craft
  sparkle: require('../../../assets/UI/character-creator-ui/UI_TravelBook_Marker01a.png'), // Marker for sparkle
  crystal: require('../../../assets/equipment/weapons/Topaz Staff.png'),  // Staff for crystal ball
  magic: require('../../../assets/equipment/weapons/Magic Wand.png'),     // Magic wand
  scroll: require('../../../assets/equipment/weapons/Scroll.png'),        // Ancient scroll
};

// UI icons collection
export const uiIcons = {
  labels,
  buttons,
  characterCreatorUI,
  sectionIcons,
  floatingIcons,
} as const;

// Helper function to get UI asset by type and name
export const getUIAsset = (type: keyof typeof uiIcons, name: string) => {
  const category = uiIcons[type];
  if (category && category[name]) {
    return category[name];
  }
  
  // Fallback to bluepoint for any missing assets
  return uiIcons.labels.nameTag;
};

// UI asset type labels
export const uiAssetLabels = {
  labels: 'Label Icons',
  buttons: 'Button Assets',
  characterCreatorUI: 'Character Creator UI',
  sectionIcons: 'Section Icons',
  floatingIcons: 'Floating Decorative Icons',
} as const;
