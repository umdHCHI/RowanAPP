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
      console.log('🔍 [useCharacterCreation] Starting character creation/update', {
        hasCharacterId: !!characterId,
        characterId,
        characterName
      });

      const isUpdate = !!characterId;

      if(isUpdate) {
        console.log('🔄 [useCharacterCreation] Updating existing character');
        await updateCharacterCustomization();
      } else {
        console.log('✨ [useCharacterCreation] Creating new character');
        await createCharacter();
      }

      console.log('✅ [useCharacterCreation] Character create/update completed');

      // Only complete onboarding for new characters, not for updates
      if (!isUpdate) {
        await completeCharacter();
        console.log('✅ [useCharacterCreation] Onboarding completed');
      } else {
        console.log('✅ [useCharacterCreation] Character update completed, skipping onboarding');
      }

      // Navigate immediately after completion
      if (isUpdate) {
        // For updates, go back to the previous screen with a refresh flag
        router.push({
          pathname: CHARACTER_CREATOR_CONSTANTS.ROUTES.CHARACTER_HOME,
          params: { refreshCharacter: Date.now().toString() }
        });
      } else {
        // For new characters, navigate to home
        router.push(CHARACTER_CREATOR_CONSTANTS.ROUTES.CHARACTER_HOME);
      }
      
      // Show success alert after navigation (non-blocking)
      // Use setTimeout to ensure navigation happens first
      setTimeout(() => {
        
        if (Platform.OS === 'web') {
          // Web fallback - simple console log or could use a toast notification
        } else {
          // Native platforms - show alert
          const message = isUpdate 
            ? `${characterName}'s appearance has been updated!`
            : CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.MESSAGE(characterName);
          
          Alert.alert(
            CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.TITLE,
            message,
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