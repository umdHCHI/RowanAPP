import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface UseCharacterCreationProps {
  characterName: string;
  createCharacter: () => Promise<void>;
  completeCharacter: () => Promise<void>;
}

export const useCharacterCreation = ({
  characterName,
  createCharacter,
  completeCharacter
}: UseCharacterCreationProps) => {
  const validateCharacterName = useCallback((name: string): boolean => {
    return Boolean(name && name.trim() !== '');
  }, []);

  const handleCharacterCreation = useCallback(async () => {
    console.log('=== CHARACTER CREATION STARTED ===');
    console.log('Character name:', characterName);
    console.log('Name validation passed:', validateCharacterName(characterName));
    
    if (!validateCharacterName(characterName)) {
      Alert.alert(
        'Character Name Required',
        'Please enter a name for your character before creating it.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    try {
      console.log('Calling createCharacter...');
      // Only call createCharacter - it already calls completeCharacter internally
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
      
    } catch (error) {
      console.error('Character creation failed:', error);
      Alert.alert(
        'Character Creation Failed',
        'There was an error creating your character. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [characterName, createCharacter, validateCharacterName]);

  return {
    handleCharacterCreation,
    validateCharacterName
  };
}; 