import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { CHARACTER_CREATOR_CONSTANTS } from '../constants/characterCreator';

interface UseCharacterCreationProps {
  characterId?: number | null;
  characterName: string;
  customizationData: any;
  createCharacter: () => Promise<void>;
  updateCharacterCustomization: () => Promise<void>; 
  completeCharacter: () => Promise<void>;
}

export const useCharacterCreation = ({
  characterId,
  characterName,
  customizationData,
  createCharacter,
  updateCharacterCustomization,
  completeCharacter
}: UseCharacterCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const validateCharacterName = useCallback((name: string): boolean => {
    return Boolean(name && name.trim() !== '');
  }, []);

  const handleCharacterCreation = useCallback(async () => {
    if (isCreatingRef.current) {
      return;
    }
    
    setIsCreating(true);
    isCreatingRef.current = true;
    
    if (!validateCharacterName(characterName)) {
      Alert.alert(
        CHARACTER_CREATOR_CONSTANTS.ALERTS.NAME_REQUIRED.TITLE,
        CHARACTER_CREATOR_CONSTANTS.ALERTS.NAME_REQUIRED.MESSAGE,
        [{ text: 'OK', style: 'default' }]
      );
      setIsCreating(false);
      isCreatingRef.current = false;
      return;
    }
    
    try {
      
      if(characterId) {
        await updateCharacterCustomization();
      } else {
        await createCharacter();
      }
      
      
      // Complete onboarding process
      await completeCharacter();
      
      
      // Navigate immediately after onboarding completion
      router.push(CHARACTER_CREATOR_CONSTANTS.ROUTES.CHARACTER_HOME);
      
      // Show success alert after navigation (non-blocking)
      // Use setTimeout to ensure navigation happens first
      setTimeout(() => {
        
        if (Platform.OS === 'web') {
          // Web fallback - simple console log or could use a toast notification
        } else {
          // Native platforms - show alert
          Alert.alert(
            CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.TITLE,
            CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.MESSAGE(characterName),
            [{ text: CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.BUTTON_TEXT, style: 'default' }]
          );
        }
      }, 500);
      
    } catch (error) {
      Alert.alert(
        CHARACTER_CREATOR_CONSTANTS.ALERTS.FAILURE.TITLE,
        CHARACTER_CREATOR_CONSTANTS.ALERTS.FAILURE.MESSAGE,
        [{ text: CHARACTER_CREATOR_CONSTANTS.ALERTS.FAILURE.BUTTON_TEXT, style: 'default' }]
      );
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [characterName, createCharacter, validateCharacterName, characterId, updateCharacterCustomization, completeCharacter]);

  return {
    handleCharacterCreation,
    validateCharacterName,
    isCreating
  };
};