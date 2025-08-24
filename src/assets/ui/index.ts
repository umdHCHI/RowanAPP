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
  bluejewel: require('../../../assets/UI/assets/bluejewel.png'),
  greenring: require('../../../assets/UI/assets/greenring.png'),
  orangegemgreenvein: require('../../../assets/UI/assets/fc2138.png'),
  bluegempinkvein: require('../../../assets/UI/assets/fc2140.png'),
  bowlgreengoo: require('../../../assets/UI/assets/fc467.png'),
  cupofdrink: require('../../../assets/UI/assets/fc501.png'),
  potionvile: require('../../../assets/UI/assets/fc506.png'),
  bread: require('../../../assets/UI/assets/fc513.png'),
  crossant: require('../../../assets/UI/assets/fc515.png'),
  cookieOcto: require('../../../assets/UI/assets/fc517.png'),
  cupOfJoe: require('../../../assets/UI/assets/fc519.png'),
  pizza: require('../../../assets/UI/assets/fc526.png'),
  bowlofSpaghetti: require('../../../assets/UI/assets/fc527.png'),
  pinkDonut: require('../../../assets/UI/assets/fc528.png'),
  pinkcupCoffee: require('../../../assets/UI/assets/fc530.png'),
  eggBread: require('../../../assets/UI/assets/fc531.png'),
  blueberrypie: require('../../../assets/UI/assets/fc533.png'),
  ojcup: require('../../../assets/UI/assets/fc536.png'),
  sandwhich: require('../../../assets/UI/assets/fc537.png'),
  strawberrymilk: require('../../../assets/UI/assets/fc538.png'),
  bluecarrot: require('../../../assets/UI/assets/fc553.png'),
  greenslug: require('../../../assets/UI/assets/fc558.png'),
  yellowgreenfruit: require('../../../assets/UI/assets/fc561.png'),
  bowlredgoo: require('../../../assets/UI/assets/fc564.png'),
  bluegreenfruit: require('../../../assets/UI/assets/fc566.png'),
  brownpeas: require('../../../assets/UI/assets/fc570.png'),
  whitecarrot: require('../../../assets/UI/assets/fc571.png'),
  pinkflowerblueleaf: require('../../../assets/UI/assets/fc576.png'),
  blueflowerpinkleaf: require('../../../assets/UI/assets/fc578.png'),
  greenheart: require('../../../assets/UI/assets/fc595.png'),
  greybook: require('../../../assets/UI/assets/fc662.png'),
  purplecurlfog: require('../../../assets/UI/assets/fc666.png'),
  blueblobfog: require('../../../assets/UI/assets/fc669.png'),
  smugcrossandbones: require('../../../assets/UI/assets/fc674.png'),
  emojivomit: require('../../../assets/UI/assets/fc678.png'),
  emojicoveredeyes: require('../../../assets/UI/assets/fc679.png'),
  emojihearteyes: require('../../../assets/UI/assets/fc682.png'),
  pinklittleghost: require('../../../assets/UI/assets/fc685.png'),
  sillysnake: require('../../../assets/UI/assets/fc697.png'),
  cresentmoonplus: require('../../../assets/UI/assets/fc699.png'),
  purpleflameguy: require('../../../assets/UI/assets/fc701.png'),
  bluegreenghost: require('../../../assets/UI/assets/fc720.png'),
  purpletornado: require('../../../assets/UI/assets/fc772.png'),
  bluecomet: require('../../../assets/UI/assets/fc783.png'),
  greeneyecomet: require('../../../assets/UI/assets/fc808.png'),
  staffwithgreengem: require('../../../assets/UI/assets/fc1571.png'),
  bluegloveofthanos: require('../../../assets/UI/assets/fc1648.png'),
  shieldwithblue: require('../../../assets/UI/assets/fc1811.png'),
  redcape: require('../../../assets/UI/assets/fc1825.png'),


  //Attribute UI
  exploration: require('../../../assets/UI/assets/fc1054.png'),
  courage: require('../../../assets/UI/assets/fc1080.png'),
  balance: require('../../../assets/UI/assets/fc1308.png'),
  fear: require('../../../assets/UI/assets/fc863.png'),

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
