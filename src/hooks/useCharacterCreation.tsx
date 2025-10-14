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
      console.log('⚠️ Character creation already in progress');
      return;
    }
    
    console.log('🎭 Starting character creation...');
    setIsCreating(true);
    isCreatingRef.current = true;
    
    if (!validateCharacterName(characterName)) {
      console.log('❌ Character name validation failed');
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
      console.log('🔄 Processing character creation...');
      
      if(characterId) {
        console.log('📝 Updating existing character customization...');
        await updateCharacterCustomization();
      } else {
        console.log('✨ Creating new character...');
        await createCharacter();
      }
      
      console.log('✅ Character creation successful!');
      
      // Complete onboarding process
      console.log('🎯 Completing onboarding...');
      await completeCharacter();
      
      console.log('🚀 Navigating to character home...');
      
      // Navigate immediately after onboarding completion
      router.push(CHARACTER_CREATOR_CONSTANTS.ROUTES.CHARACTER_HOME);
      
      // Show success alert after navigation (non-blocking)
      // Use setTimeout to ensure navigation happens first
      setTimeout(() => {
        console.log('📱 Showing success notification...');
        
        if (Platform.OS === 'web') {
          // Web fallback - simple console log or could use a toast notification
          console.log(`🎉 ${CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.TITLE}`);
          console.log(`📜 ${CHARACTER_CREATOR_CONSTANTS.ALERTS.SUCCESS.MESSAGE(characterName)}`);
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
      console.log('❌ Character creation failed:', error);
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