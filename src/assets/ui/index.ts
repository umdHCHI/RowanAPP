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
  
  // Book and exploration icons
  bookOpen: require('../../../assets/UI/assets/openbook.png'),
  explorationProgress: require('../../../assets/UI/assets/explorationprogress.png'),
  
  // Character creator UI elements can be repurposed for sections
  preview: require('../../../assets/UI/assets/openbook.png'),
  appearance: require('../../../assets/UI/assets/orangeflower.png'),
  complete: require('../../../assets/UI/assets/openbook.png'),
  bluejewel: require('../../../assets/UI/assets/bluejewel.png'),
  greenring: require('../../../assets/UI/assets/greenring.png'),
  bluerootveg: require('../../../assets/UI/assets/bluerootveg.png'),
//  bowlgreengoo: require('../../../assets/UI/assets/bowlofgreengoo.png'),
  cupoftea: require('../../../assets/UI/assets/cupoftea.png'),
  purplebottle: require('../../../assets/UI/assets/purplebottle.png'),
  bread: require('../../../assets/UI/assets/bread.png'),
  crossant: require('../../../assets/UI/assets/crossant.png'),
  chocolatechipcookies: require('../../../assets/UI/assets/chocolatechipcookies.png'),
  cupOfJoe: require('../../../assets/UI/assets/hotcupofcoffee.png'),
  pizza: require('../../../assets/UI/assets/pizza.png'),
//  bowlofSpaghetti: require('../../../assets/UI/assets/bowlofSpaghetti.png'),
  pinkDonut: require('../../../assets/UI/assets/pinkdonut.png'),
  pinkcupCoffee: require('../../../assets/UI/assets/pinkcupofcoffee.png'),
  eggBread: require('../../../assets/UI/assets/eggwithtoast.png'),
 // blueberrypie: require('../../../assets/UI/assets/blueberrypie.png'),
  lemonaidwithlemon: require('../../../assets/UI/assets/lemonaidwithlemon.png'),
  sandwhich: require('../../../assets/UI/assets/halfofsandwhich.png'),
  strawberrymilk: require('../../../assets/UI/assets/pinkmilk.png'),
  bluecarrot: require('../../../assets/UI/assets/bluerootveg.png'),
  greenslug: require('../../../assets/UI/assets/greenspot.png'),
  yellowgreenfruit: require('../../../assets/UI/assets/yellowfruit.png'),
 // bowlredgoo: require('../../../assets/UI/assets/bowlredgoo.png'),
 // bluegreenfruit: require('../../../assets/UI/assets/bluegreenfruit.png'),
  //brownpeas: require('../../../assets/UI/assets/brownpeas.png'),
 // whitecarrot: require('../../../assets/UI/assets/whitecarrot.png'),
  pinkflowerblueleaf: require('../../../assets/UI/assets/fc576.png'),
  //blueflowerpinkleaf: require('../../../assets/UI/assets/blueflowerpinkleaf.png'),
 // greenheart: require('../../../assets/UI/assets/greenheart.png'),
 // greybook: require('../../../assets/UI/assets/greybook.png'),
  purplecurlfog: require('../../../assets/UI/assets/fc666.png'),
 // blueblobfog: require('../../../assets/UI/assets/blueblobfog.png'),
 // smugcrossandbones: require('../../../assets/UI/assets/smugcrossandbones.png'),
 // emojivomit: require('../../../assets/UI/assets/emojivomit.png'),
 // emojicoveredeyes: require('../../../assets/UI/assets/emojicoveredeyes.png'),
 //
  purpletornado: require('../../../assets/UI/assets/fc772.png'),
 // bluecomet: require('../../../assets/UI/assets/bluecomet.png'),
 // greeneyecomet: require('../../../assets/UI/assets/greeneyecomet.png'),
  staffwithgreengem: require('../../../assets/UI/assets/fc1571.png'),
 // bluegloveofthanos: require('../../../assets/UI/assets/bluegloveofthanos.png'),
 // shieldwithblue: require('../../../assets/UI/assets/shieldwithblue.png'),
  //redcape: require('../../../assets/UI/assets/redcape.png'),


  //Attribute UI
  exploration: require('../../../assets/UI/assets/littlehouse.png'),
  courage: require('../../../assets/UI/assets/fc1080.png'),
  balance: require('../../../assets/UI/assets/fc1308.png'),
  fear: require('../../../assets/UI/assets/fc863.png'),

  //assets for tabs
  atrium: require('../../../assets/UI/assets/littlehouse.png'),
  passages: require('../../../assets/UI/assets/pagewithribbon.png'),
  inscriptions: require('../../../assets/UI/assets/openbook.png'),
  defender: require('../../../assets/UI/assets/fc1372.png'),
  restoration: require('../../../assets/UI/assets/fc1309.png')


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


// Our avatar assets
export const TrevorAvatar = require('../../../assets/ourAvatars/trevor.png');
export const RowanAvatar = require('../../../assets/ourAvatars/blobguy.gif');
export const ReganAvatar = require('../../../assets/ourAvatars/regan.png');
export const MattAvatar = require('../../../assets/ourAvatars/matt.png');

