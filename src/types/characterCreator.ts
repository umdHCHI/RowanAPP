import { ImageSourcePropType, TextStyle, ViewStyle } from 'react-native';
import { CharacterCreatorStyles } from '../styles/screens/characterCreator';
import { CategoryConfig } from './user';

/**
 * Character Creator Component Props
 * Following TypeScript React Native industry standards for component prop interfaces
 */

// Global character creator styles interface (from globalStyles.ts)
// TODO: Migrate these to modular approach over time
export interface GlobalCharacterCreatorStyles {
  characterCreatorStyleCategoryContainer?: ViewStyle;
  characterCreatorSectionTitle?: TextStyle;
  characterCreatorCategoryButton?: ViewStyle;
  characterCreatorSelectedCategoryButton?: ViewStyle;
  characterCreatorCategoryText?: TextStyle;
  characterCreatorSelectedCategoryText?: TextStyle;
  characterCreatorHeader?: ViewStyle;
  characterCreatorNameInput?: TextStyle;
  characterCreatorPreviewSection?: ViewStyle;
  characterCreatorColorCategory?: ViewStyle;
  characterCreatorColorCategoryLabel?: TextStyle;
  characterCreatorColorControls?: ViewStyle;
  characterCreatorColorArrowButton?: ViewStyle;
  characterCreatorColorArrowText?: TextStyle;
  characterCreatorColorOptionText?: TextStyle;
  characterCreatorStyleSelectorContainer?: ViewStyle;
  characterCreatorStyleControls?: ViewStyle;
  characterCreatorArrowButton?: ViewStyle;
  characterCreatorArrowText?: TextStyle;
  characterCreatorOptionText?: TextStyle;
  [key: string]: any; // Allow for additional styles
}

// Union type for backwards compatibility while transitioning to modular styles
export type CharacterCreatorStylesType = CharacterCreatorStyles | GlobalCharacterCreatorStyles | any;

// ===== CATEGORY SELECTOR =====
export interface CategorySelectorProps {
  title: string;
  categories: CategoryConfig[];
  selectedIndex: number;
  onCategorySelect: (index: number) => void;
  styles: CharacterCreatorStylesType;
  horizontal?: boolean;
  maxHeight?: number;
}

// ===== CHARACTER FRAME =====
export interface CharacterFrameProps {
  children: React.ReactNode;
  frame?: ImageSourcePropType;
  size?: number;
}

// ===== CHARACTER NAME INPUT =====
export interface CharacterNameInputProps {
  characterName: string;
  onNameChange: (name: string) => void;
  onLogout?: () => void;
  styles: CharacterCreatorStylesType;
}

// ===== CHARACTER PREVIEW =====
export interface CharacterPreviewProps {
  selectedName: string;
  baseAsset: ImageSourcePropType;
  background: ImageSourcePropType;
  hairSheet: ImageSourcePropType;
  clothesSheet: ImageSourcePropType;
  eyesSheet: ImageSourcePropType;
  eyebrowsSheet: ImageSourcePropType;
  mouthSheet: ImageSourcePropType;
  hairIndex: number;
  clothesIndex: number;
  eyesIndex: number;
  eyebrowsIndex: number;
  mouthIndex: number;
  size?: number;
  fitToFrame?: boolean;
}

// ===== CHARACTER PREVIEW SECTION =====
export interface CharacterObject {
  getCurrentBackgroundAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getBaseAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getHairAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getClothesAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getEyesAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getEyebrowsAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getMouthAsset: (useLocalState?: boolean) => ImageSourcePropType;
  getHairIndex: () => number;
  getClothesIndex: () => number;
  getEyesIndex: () => number;
  getEyebrowsIndex: () => number;
  getCharacterName: () => string;
  selectedMouthType: number;
}

export interface CharacterPreviewSectionProps {
  character: CharacterObject;
  styles: CharacterCreatorStylesType;
}

// ===== COLOR OPTION CONTROLS =====
export interface ColorOptionControlsProps {
  category: CategoryConfig;
  styles: CharacterCreatorStylesType;
}

// ===== STYLE CONTROLS =====
export interface StyleControlsProps {
  category: CategoryConfig;
  styles: CharacterCreatorStylesType;
}

// ===== UTILITY TYPES =====

/**
 * Character creation state object for local component state management
 */
export interface CharacterCreationState {
  selectedName: string;
  selectedBaseModel: number;
  selectedBaseColor: number;
  selectedHairStyle: number;
  selectedHairColor: number;
  selectedEyeType: number;
  selectedEyeColor: number;
  selectedEyebrowStyle: number;
  selectedEyebrowColor: number;
  selectedMouthType: number;
  selectedShirtType: number;
  selectedClothesColor: number;
  selectedBackgroundType: number;
  selectedBackgroundColor: number;
}

/**
 * Character creation setter functions for state management
 */
export interface CharacterCreationSetters {
  setSelectedName: (value: string) => void;
  setSelectedBaseModel: (value: number) => void;
  setSelectedBaseColor: (value: number) => void;
  setSelectedHairStyle: (value: number) => void;
  setSelectedHairColor: (value: number) => void;
  setSelectedEyeType: (value: number) => void;
  setSelectedEyeColor: (value: number) => void;
  setSelectedEyebrowStyle: (value: number) => void;
  setSelectedEyebrowColor: (value: number) => void;
  setSelectedMouthType: (value: number) => void;
  setSelectedShirtType: (value: number) => void;
  setSelectedClothesColor: (value: number) => void;
  setSelectedBackgroundType: (value: number) => void;
  setSelectedBackgroundColor: (value: number) => void;
}

/**
 * Complete character creator data and handlers interface
 * Used for screens that need full character creation functionality
 */
export interface CharacterCreatorData {
  state: CharacterCreationState;
  setters: CharacterCreationSetters;
  categories: {
    styleCategories: CategoryConfig[];
    colorCategories: CategoryConfig[];
  };
}
