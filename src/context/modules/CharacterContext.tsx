// Manages character appearance, stats, and customization

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../../services/apiService';
import { CategoryConfig, Character, createCharacterCreatorCategories, UserProfile } from '../../types/user';
import * as AssetHelpers from './CharacterAssetHelpers';

export interface CharacterContextType {
  // Backend character data
  backendCharacter: Character | null;
  userProfile: UserProfile | null;

  // UI state for character creator (local only)
  characterName: string;
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

  // Character creator categories
  styleCategories: CategoryConfig[];
  colorCategories: CategoryConfig[];

  // Setters
  setBackendCharacter: (char: Character | null) => void;
  setUserProfile: (char: UserProfile | null) => void;
  setCharacterName: (name: string) => void;
  setSelectedBaseModel: (index: number) => void;
  setSelectedBaseColor: (index: number) => void;
  setSelectedHairStyle: (index: number) => void;
  setSelectedHairColor: (index: number) => void;
  setSelectedEyeType: (index: number) => void;
  setSelectedEyeColor: (index: number) => void;
  setSelectedEyebrowStyle: (index: number) => void;
  setSelectedEyebrowColor: (index: number) => void;
  setSelectedMouthType: (index: number) => void;
  setSelectedShirtType: (index: number) => void;
  setSelectedClothesColor: (index: number) => void;
  setSelectedBackgroundType: (index: number) => void;
  setSelectedBackgroundColor: (index: number) => void;

  // Getters
  getCharacterName: () => string;
  getBaseIndex: () => number;
  getHairIndex: () => number;
  getClothesIndex: () => number;
  getEyesIndex: () => number;
  getEyebrowsIndex: () => number;
  getHairAsset: (useLocalState?: boolean, overrideStyle?: number, overrideColor?: number) => any;
  getClothesAsset: (useLocalState?: boolean, overrideType?: number, overrideColor?: number) => any;
  getEyesAsset: (useLocalState?: boolean, overrideType?: number, overrideColor?: number) => any;
  getEyebrowsAsset: (useLocalState?: boolean, overrideStyle?: number, overrideColor?: number) => any;
  getCurrentBackgroundAsset: (useLocalState?: boolean, overrideType?: number, overrideColor?: number) => any;
  getBaseAsset: (useLocalState?: boolean, overrideColor?: number) => any;
  getMouthAsset: (useLocalState?: boolean, overrideType?: number) => any;

  // Actions
  createCharacter: () => Promise<void>;
  updateCharacter: () => Promise<void>;
  loadCharacter: (forceLoad?: boolean) => Promise<Character | null>;
  gainExperience: (amount: number, source?: string) => Promise<void>;
  gainLumens: (amount: number, source?: string) => Promise<void>;
  gainWellness: (gains: Record<string, number>) => Promise<void>;
  resetCharacterCreatorToDefaults: () => void;
  syncCharacterFromBackend: (character: Character) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
};

export const useProfile = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
};

interface CharacterProviderProps {
  children: ReactNode;
  authToken: string | null;
  characterId: string | null;
  isTestUser: boolean;
  homeData: any;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
  justCreatedCharacter: React.MutableRefObject<boolean>;
  newlyCreatedCharacter: React.MutableRefObject<Character | null>;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({
  children,
  authToken,
  characterId,
  isTestUser,
  homeData,
  onLoadingChange,
  onError,
  justCreatedCharacter,
  newlyCreatedCharacter,
}) => {
  const [backendCharacter, setBackendCharacter] = useState<Character | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [selectedBaseModel, setSelectedBaseModel] = useState(0);
  const [selectedBaseColor, setSelectedBaseColor] = useState(0);
  const [selectedHairStyle, setSelectedHairStyle] = useState(0);
  const [selectedHairColor, setSelectedHairColor] = useState(0);
  const [selectedEyeType, setSelectedEyeType] = useState(0);
  const [selectedEyeColor, setSelectedEyeColor] = useState(0);
  const [selectedEyebrowStyle, setSelectedEyebrowStyle] = useState(0);
  const [selectedEyebrowColor, setSelectedEyebrowColor] = useState(0);
  const [selectedMouthType, setSelectedMouthType] = useState(0);
  const [selectedShirtType, setSelectedShirtType] = useState(0);
  const [selectedClothesColor, setSelectedClothesColor] = useState(0);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState(0);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);

  // ===== CRITICAL: Clear all character state when auth changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!authToken) {
      // User logged out - clear all character data immediately
      console.log('🧹 [CharacterContext] Auth token cleared - resetting all character state');
      setBackendCharacter(null);
      setUserProfile(null);
      setCharacterName('');
      setSelectedBaseModel(0);
      setSelectedBaseColor(0);
      setSelectedHairStyle(0);
      setSelectedHairColor(0);
      setSelectedEyeType(0);
      setSelectedEyeColor(0);
      setSelectedEyebrowStyle(0);
      setSelectedEyebrowColor(0);
      setSelectedMouthType(0);
      setSelectedShirtType(0);
      setSelectedClothesColor(0);
      setSelectedBackgroundType(0);
      setSelectedBackgroundColor(0);
      justCreatedCharacter.current = false;
      newlyCreatedCharacter.current = null;
    }
  }, [authToken]);

  // ===== CRITICAL: Clear character state when user ID changes =====
  // This prevents one logged-in user from seeing another user's data
  useEffect(() => {
    if (authToken && characterId) {
      // Check if the characterId differs from the current backendCharacter
      if (backendCharacter && String(backendCharacter.id) !== String(characterId)) {
        console.log('🔄 [CharacterContext] Character ID changed - clearing stale character data', {
          oldCharacterId: backendCharacter.id,
          newCharacterId: characterId
        });
        setBackendCharacter(null);
        setUserProfile(null);
        setCharacterName('');
        setSelectedBaseModel(0);
        setSelectedBaseColor(0);
        setSelectedHairStyle(0);
        setSelectedHairColor(0);
        setSelectedEyeType(0);
        setSelectedEyeColor(0);
        setSelectedEyebrowStyle(0);
        setSelectedEyebrowColor(0);
        setSelectedMouthType(0);
        setSelectedShirtType(0);
        setSelectedClothesColor(0);
        setSelectedBackgroundType(0);
        setSelectedBackgroundColor(0);
        justCreatedCharacter.current = false;
        newlyCreatedCharacter.current = null;
      }
    }
  }, [authToken, characterId, backendCharacter]);

  const { styleCategories, colorCategories } = useMemo(
    () =>
      createCharacterCreatorCategories(
        {
          selectedHairStyle,
          selectedEyeType,
          selectedEyebrowStyle,
          selectedMouthType,
          selectedShirtType,
          selectedBackgroundType,
          selectedBaseModel,
          selectedBaseColor,
          selectedHairColor,
          selectedEyeColor,
          selectedEyebrowColor,
          selectedClothesColor,
          selectedBackgroundColor,
        },
        {
          setSelectedHairStyle,
          setSelectedEyeType,
          setSelectedEyebrowStyle,
          setSelectedMouthType,
          setSelectedShirtType,
          setSelectedBackgroundType,
          setSelectedBaseModel,
          setSelectedBaseColor,
          setSelectedHairColor,
          setSelectedEyeColor,
          setSelectedEyebrowColor,
          setSelectedClothesColor,
          setSelectedBackgroundColor,
        }
      ),
    [
      characterName,
      selectedHairStyle,
      selectedEyeType,
      selectedEyebrowStyle,
      selectedMouthType,
      selectedShirtType,
      selectedBackgroundType,
      selectedBaseModel,
      selectedBaseColor,
      selectedHairColor,
      selectedEyeColor,
      selectedEyebrowColor,
      selectedClothesColor,
      selectedBackgroundColor,
    ]
  );

  // Helper functions
  const getBaseIndex = () => {
    const baseModel = backendCharacter?.selected_base_model ?? selectedBaseModel;
    const baseColor = backendCharacter?.selected_skin_color ?? selectedBaseColor;
    return baseModel + baseColor * 12;
  };

  const getHairIndex = () => {
    const hairStyle = backendCharacter?.selected_hair_style ?? selectedHairStyle;
    const hairColor = backendCharacter?.selected_hair_color ?? selectedHairColor;
    return hairStyle + hairColor * 12;
  };

  const getClothesIndex = () => {
    const shirtType = backendCharacter?.selected_shirt_type ?? selectedShirtType;
    const clothesColor = backendCharacter?.selected_shirt_color ?? selectedClothesColor;
    return shirtType + clothesColor * 12;
  };

  const getEyesIndex = () => {
    const eyeType = backendCharacter?.selected_eye_type ?? selectedEyeType;
    const eyeColor = backendCharacter?.selected_eye_color ?? selectedEyeColor;
    return eyeType + eyeColor * 12;
  };

  const getEyebrowsIndex = () => {
    const eyebrowStyle = backendCharacter?.selected_eyebrow_style ?? selectedEyebrowStyle;
    const eyebrowColor = backendCharacter?.selected_eyebrow_color ?? selectedEyebrowColor;
    return eyebrowStyle + eyebrowColor * 12;
  };

  const getCharacterName = () => {
    const backendName = backendCharacter?.name;
    const localName = characterName;
    return backendName || localName || '';
  };

  // Asset getters with fallback to character_config if selected_* fields are missing
  const getHairAsset = (useLocalState: boolean = false, overrideStyle?: number, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const hairStyle = overrideStyle !== undefined ? overrideStyle :
      (useLocalState ? selectedHairStyle :
        (backendCharacter?.selected_hair_style ??
         config?.selected_hair_style ??
         selectedHairStyle ?? 0));
    const hairColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedHairColor :
        (backendCharacter?.selected_hair_color ??
         config?.selected_hair_color ??
         selectedHairColor ?? 0));
    return AssetHelpers.getHairAsset(hairStyle, hairColor);
  };

  const getClothesAsset = (useLocalState: boolean = false, overrideType?: number, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const shirtType = overrideType !== undefined ? overrideType :
      (useLocalState ? selectedShirtType :
        (backendCharacter?.selected_shirt_type ??
         config?.selected_shirt_type ??
         selectedShirtType ?? 0));
    const clothesColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedClothesColor :
        (backendCharacter?.selected_shirt_color ??
         config?.selected_shirt_color ??
         selectedClothesColor ?? 0));
    return AssetHelpers.getClothesAsset(shirtType, clothesColor);
  };

  const getEyesAsset = (useLocalState: boolean = false, overrideType?: number, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const eyeType = overrideType !== undefined ? overrideType :
      (useLocalState ? selectedEyeType :
        (backendCharacter?.selected_eye_type ??
         config?.selected_eye_type ??
         selectedEyeType ?? 0));
    const eyeColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedEyeColor :
        (backendCharacter?.selected_eye_color ??
         config?.selected_eye_color ??
         selectedEyeColor ?? 0));
    return AssetHelpers.getEyesAsset(eyeType, eyeColor);
  };

  const getEyebrowsAsset = (useLocalState: boolean = false, overrideStyle?: number, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const eyebrowStyle = overrideStyle !== undefined ? overrideStyle :
      (useLocalState ? selectedEyebrowStyle :
        (backendCharacter?.selected_eyebrow_style ??
         config?.selected_eyebrow_style ??
         selectedEyebrowStyle ?? 0));
    const eyebrowColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedEyebrowColor :
        (backendCharacter?.selected_eyebrow_color ??
         config?.selected_eyebrow_color ??
         selectedEyebrowColor ?? 0));
    return AssetHelpers.getEyebrowsAsset(eyebrowStyle, eyebrowColor);
  };

  const getCurrentBackgroundAsset = (useLocalState: boolean = false, overrideType?: number, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const backgroundType = overrideType !== undefined ? overrideType :
      (useLocalState ? selectedBackgroundType :
        (backendCharacter?.selected_background_type ??
         config?.selected_background_type ??
         selectedBackgroundType ?? 0));
    const backgroundColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedBackgroundColor :
        (backendCharacter?.selected_background_color ??
         config?.selected_background_color ??
         selectedBackgroundColor ?? 0));
    return AssetHelpers.getCurrentBackgroundAsset(backgroundType, backgroundColor);
  };

  const getBaseAsset = (useLocalState: boolean = false, overrideColor?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const baseColor = overrideColor !== undefined ? overrideColor :
      (useLocalState ? selectedBaseColor :
        (backendCharacter?.selected_skin_color ??
         config?.selected_skin_color ??
         selectedBaseColor ?? 0));
    return AssetHelpers.getBaseAsset(baseColor);
  };

  const getMouthAsset = (useLocalState: boolean = false, overrideType?: number) => {
    const config = (backendCharacter as any)?.character_config;
    const mouthType = overrideType !== undefined ? overrideType :
      (useLocalState ? selectedMouthType :
        (backendCharacter?.selected_mouth_type ??
         config?.selected_mouth_type ??
         selectedMouthType ?? 0));
    return AssetHelpers.getMouthAsset(mouthType);
  };

  // Build character customization data
  const buildCharacterCustomizationData = () => ({
    name: characterName,
    selected_base_model: selectedBaseModel,
    selected_skin_color: selectedBaseColor,
    selected_hair_style: selectedHairStyle,
    selected_hair_color: selectedHairColor,
    selected_eye_type: selectedEyeType,
    selected_eye_color: selectedEyeColor,
    selected_eyebrow_style: selectedEyebrowStyle,
    selected_eyebrow_color: selectedEyebrowColor,
    selected_mouth_type: selectedMouthType,
    selected_shirt_type: selectedShirtType,
    selected_shirt_color: selectedClothesColor,
    selected_background_type: selectedBackgroundType,
    selected_background_color: selectedBackgroundColor,
  });

  // Set character data and refs
  const setCharacterDataAndRefs = (character: Character) => {
    setBackendCharacter(character);
    newlyCreatedCharacter.current = character;
    justCreatedCharacter.current = true;

    console.log('✅ Character data and refs set:', {
      characterId: character.id,
      characterName: character.name,
    });
  };

  // Sync character from backend to local state
  const syncCharacterFromBackend = useCallback((character: Character) => {
    setBackendCharacter(character);

    if (character.name && character.name !== 'Hero') {
      setCharacterName(character.name);
    }

    setSelectedBaseModel(character.selected_base_model || 0);
    setSelectedBaseColor(character.selected_skin_color || 0);
    setSelectedHairStyle(character.selected_hair_style || 0);
    setSelectedHairColor(character.selected_hair_color || 0);
    setSelectedEyeType(character.selected_eye_type || 0);
    setSelectedEyeColor(character.selected_eye_color || 0);
    setSelectedEyebrowStyle(character.selected_eyebrow_style || 0);
    setSelectedEyebrowColor(character.selected_eyebrow_color || 0);
    setSelectedMouthType(character.selected_mouth_type || 0);
    setSelectedShirtType(character.selected_shirt_type || 0);
    setSelectedClothesColor(character.selected_shirt_color || 0);
    setSelectedBackgroundType(character.selected_background_type || 0);
    setSelectedBackgroundColor(character.selected_background_color || 0);
  }, []);

  const resetCharacterCreatorToDefaults = useCallback(() => {
    setCharacterName('');
    setSelectedBaseModel(0);
    setSelectedBaseColor(0);
    setSelectedHairStyle(0);
    setSelectedHairColor(0);
    setSelectedEyeType(0);
    setSelectedEyeColor(0);
    setSelectedEyebrowStyle(0);
    setSelectedEyebrowColor(0);
    setSelectedMouthType(0);
    setSelectedShirtType(0);
    setSelectedClothesColor(0);
    setSelectedBackgroundType(0);
    setSelectedBackgroundColor(0);
    setBackendCharacter(null);
    justCreatedCharacter.current = false;
    newlyCreatedCharacter.current = null;
  }, []);

  const createCharacter = async () => {
    if (!authToken) {
      onError('No authentication token');
      return;
    }

    onLoadingChange(true);

    try {
      const customizationData = buildCharacterCustomizationData();

      if (backendCharacter) {
        console.log('🔄 [createCharacter] Updating existing character:', backendCharacter.id);

        const updatedCharacter = await apiService.updateCharacterCustomization({
          ...backendCharacter,
          ...customizationData,
        });

        setCharacterDataAndRefs(updatedCharacter);
      } else {
        console.log('✨ [createCharacter] Creating new character');

        const characterData = {
          ...customizationData,
          character_config: customizationData,
        };

        const createdCharacter = await apiService.createCharacter(characterData);
        console.log('✅ [createCharacter] Character created successfully:', createdCharacter);

        setCharacterDataAndRefs(createdCharacter);

        if (createdCharacter?.id) {
          await AsyncStorage.setItem('characterId', String(createdCharacter.id));
        }
      }

      // Reset the flag after data is loaded
      setTimeout(() => {
        justCreatedCharacter.current = false;
      }, 2000);
    } catch (error: any) {
      onError('Failed to create character: ' + (error?.message || 'Unknown error'));
    } finally {
      onLoadingChange(false);
    }
  };

  const updateCharacter = async () => {
    if (!backendCharacter) {
      onError('No character data available. Please reload the app.');
      return;
    }

    onLoadingChange(true);

    try {
      console.log('🔄 [updateCharacter] Updating character customization', {
        characterId: backendCharacter.id,
        characterName,
      });

      const customizationData = buildCharacterCustomizationData();

      const updatedCharacter = await apiService.updateCharacterCustomization({
        ...backendCharacter,
        ...customizationData,
      });

      console.log('✅ [updateCharacter] Character updated successfully:', updatedCharacter);

      setCharacterDataAndRefs(updatedCharacter);
    } catch (error: any) {
      onError('Failed to update character: ' + (error?.message || 'Unknown error'));
    } finally {
      onLoadingChange(false);
    }
  };

  const loadCharacter = useCallback(
    async (forceLoad: boolean = false): Promise<Character | null> => {
      if (!authToken) {
        return null;
      }

      onLoadingChange(true);

      try {
        let characterData: Character | null = null;
        let profileData: UserProfile | null = null;

        if (homeData) {
          characterData = homeData.character || null;
          // Extract user profile from homeData
          profileData = homeData.user_profile || homeData.personality_profile || null;
        }

        if (!characterData && forceLoad) {
          try {
            characterData = await apiService.getMyCharacter();
          } catch (apiError: any) {
            if (apiError.response?.status !== 404) {
              console.error('Error loading character:', apiError);
            }
          }
        }

        // Load user profile if not already loaded from homeData
        if (!profileData && forceLoad) {
          try {
            // Assuming apiService has a method to get user profile
            // You may need to add this method to apiService if it doesn't exist
            const profileResponse = await apiService.getProfile();
            profileData = Array.isArray(profileResponse)
              ? profileResponse[0]
              : profileResponse;
          } catch (profileError: any) {
            console.error('Error loading user profile:', profileError);
            // Don't fail the entire load if profile fails
          }
        }

        if (characterData) {
          setBackendCharacter(characterData);

          if (forceLoad) {
            syncCharacterFromBackend(characterData);
          }
        }

        // Set user profile if loaded
        if (profileData) {
          setUserProfile(profileData);
        }

        return characterData;
      } catch (error: any) {
        return null;
      } finally {
        onLoadingChange(false);
      }
    },
    [authToken, homeData]
  );

  const gainExperience = async (amount: number, source?: string) => {
    try {
      let ch = backendCharacter;
      if (!ch) {
        ch = await loadCharacter(true);

        if (!ch) {
          return;
        }
      }

      const id = Number(ch.id);

      if (!id || isNaN(id)) {
        onError('Character ID missing. Please reload the app.');
        return;
      }

      const result = await apiService.gainExperience(id, amount, source);

      setBackendCharacter(result);

      if (result.level_up) {
        Alert.alert(
          '🎉 Level Up!',
          `Congratulations! You gained ${result.levels_gained} level(s)!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error: any) {
      onError('Failed to gain experience: ' + (error?.message || 'Unknown error'));
    }
  };

  const gainLumens = async (amount: number, source?: string) => {
    try {
      let ch = backendCharacter;
      if (!ch) {
        ch = await loadCharacter(true);

        if (!ch) {
          return;
        }
      }

      const id = Number(ch.id);

      if (!id || isNaN(id)) {
        onError('Character ID missing. Please reload the app.');
        return;
      }

      const result = await apiService.gainLumens(id, amount, source);

      setBackendCharacter(result);

      if (result.lumens_up) {
        Alert.alert(
          '🎉 Lumens Up!',
          `Congratulations! Your lumens increased by ${result.lumens_gained}!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error: any) {
      onError('Failed to gain lumens: ' + (error?.message || 'Unknown error'));
    }
  };

  const gainWellness = async (gains: Record<string, number>) => {
    try {
      let ch = backendCharacter;
      if (!ch) {
        ch = await loadCharacter(true);

        if (!ch) {
          return;
        }
      }

      const id = Number(ch.id);

      if (!id || isNaN(id)) {
        onError('Character ID missing. Please reload the app.');
        return;
      }

      const result = await apiService.gainWellness(id, gains);

      if (result && 'data' in result && 'message' in result.data) {
        Alert.alert('Character Attributes', result.data.message, [
          { text: 'OK', style: 'default' },
        ]);
      } else {
        setBackendCharacter(result as Character);

        Alert.alert(
          '✨ Attributes Updated!',
          'Your character attributes have been updated, making you stronger for this journey!',
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error: any) {
      onError('Failed to gain wellness: ' + (error?.message || 'Unknown error'));
    }
  };

  const value: CharacterContextType = {
    backendCharacter,
    userProfile,
    characterName,
    selectedBaseModel,
    selectedBaseColor,
    selectedHairStyle,
    selectedHairColor,
    selectedEyeType,
    selectedEyeColor,
    selectedEyebrowStyle,
    selectedEyebrowColor,
    selectedMouthType,
    selectedShirtType,
    selectedClothesColor,
    selectedBackgroundType,
    selectedBackgroundColor,
    styleCategories,
    colorCategories,
    setBackendCharacter,
    setUserProfile,
    setCharacterName,
    setSelectedBaseModel,
    setSelectedBaseColor,
    setSelectedHairStyle,
    setSelectedHairColor,
    setSelectedEyeType,
    setSelectedEyeColor,
    setSelectedEyebrowStyle,
    setSelectedEyebrowColor,
    setSelectedMouthType,
    setSelectedShirtType,
    setSelectedClothesColor,
    setSelectedBackgroundType,
    setSelectedBackgroundColor,
    getCharacterName,
    getBaseIndex,
    getHairIndex,
    getClothesIndex,
    getEyesIndex,
    getEyebrowsIndex,
    getHairAsset,
    getClothesAsset,
    getEyesAsset,
    getEyebrowsAsset,
    getCurrentBackgroundAsset,
    getBaseAsset,
    getMouthAsset,
    createCharacter,
    updateCharacter,
    loadCharacter,
    gainExperience,
    gainLumens,
    gainWellness,
    resetCharacterCreatorToDefaults,
    syncCharacterFromBackend,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};