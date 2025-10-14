// Character Creator to change size/color/style of character

export const CHARACTER_CREATOR_CONSTANTS = {
  // UI Constants
  PREVIEW_SIZE: 250,
  COLOR_OPTIONS_MAX_HEIGHT: 250,
  NAVIGATION_DELAY: 100,
  
  // Category Options
  STYLE_OPTIONS: {
    BASE_MODEL: 12,
    HAIR_STYLE: 12,
    EYES: 12,
    EYEBROW_STYLE: 12,
    MOUTH: 12,
    CLOTHES: 12,
    BACKGROUND: 11,
  },
  
  COLOR_OPTIONS: {
    SKIN_COLOR: 9,
    HAIR_COLOR: 16,
    EYE_COLOR: 16,
    EYEBROW_COLOR: 16,
    CLOTHES_COLOR: 16,
    BACKGROUND_COLOR: 16,
  },
  
  // Section Titles
  SECTIONS: {
    STYLE_OPTIONS: 'Style Options',
    COLOR_OPTIONS: 'Color Options',
  },
  
  // Button Text
  BUTTONS: {
    COMPLETE_CHARACTER: 'Complete Character',
    CREATING_CHARACTER: 'Creating Character...',
    LOGOUT: 'Logout and Login Again',
  },
  
  // Placeholder Text
  PLACEHOLDERS: {
    CHARACTER_NAME: 'Character Name',
  },
  
  // Alert Messages
  ALERTS: {
    NAME_REQUIRED: {
      TITLE: 'Character Name Required',
      MESSAGE: 'Please enter a name for your character before creating it.',
    },
    SUCCESS: {
      TITLE: 'Character Created Successfully!',
      MESSAGE: (name: string) => `${name} is a fine name for an ego.  Welcome to the Archive`,
      ICON: require('../../assets/UI/assets/fc578.png'), 
      BUTTON_TEXT: 'Enter The Archive',
    },
    FAILURE: {
      TITLE: 'Character Creation Failed',
      MESSAGE: 'The ancient magics have faltered. Please try again to inscribe your character.',
      BUTTON_TEXT: 'Try Again',
    },
  },
  
  // Navigation Routes
  ROUTES: {
    CHARACTER_HOME: '/(character)/character',
    FALLBACK: '/',
  },
} as const; 