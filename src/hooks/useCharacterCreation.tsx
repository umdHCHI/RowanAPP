import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

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
    // Prevent multiple simultaneous calls
    if (isCreatingRef.current) {
      console.log('Character creation already in progress, ignoring duplicate call');
      return;
    }
    
    // Set loading state immediately and synchronously
    setIsCreating(true);
    isCreatingRef.current = true;
    
    // Small delay to ensure UI updates before continuing
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('=== CHARACTER CREATION STARTED ===');
    console.log('Character name:', characterName);
    console.log('Name validation passed:', validateCharacterName(characterName));
    
    if (!validateCharacterName(characterName)) {
      Alert.alert(
        'Character Name Required',
        'Please enter a name for your character before creating it.',
        [{ text: 'OK', style: 'default' }]
      );
      setIsCreating(false);
      isCreatingRef.current = false;
      return;
    }
    
    try {
      console.log('Calling createCharacter...');
      // Only call createCharacter - it already calls completeCharacter internally
      if(characterId) {
        await updateCharacterCustomization();
      }else{
      await createCharacter();
      console.log('createCharacter completed successfully');
      
      // Navigate immediately after successful character creation and onboarding completion
      console.log('Character created and onboarding completed, navigating to character home...');
      router.push('/(character)/character');
      
      // Show success alert after navigation
      setTimeout(() => {
        Alert.alert(
          '🎉 Character Created Successfully!',
          `Your character "${characterName}" has been created and you have been redirected to the character home screen.`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 500);
    }
    } catch (error) {
      console.error('Character creation failed:', error);
      Alert.alert(
        'Character Creation Failed',
        'There was an error creating your character. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      // Always reset loading state
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [characterName, createCharacter, validateCharacterName, characterId, updateCharacterCustomization]);

  return {
    handleCharacterCreation,
    validateCharacterName,
    isCreating
  };
}; 