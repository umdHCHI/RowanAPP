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
    if (isCreatingRef.current) {
      return;
    }
    
    setIsCreating(true);
    isCreatingRef.current = true;
    
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
      if(characterId) {
        await updateCharacterCustomization();
      } else {
        await createCharacter();
      }
      
      router.push('/(character)/character');
      
      setTimeout(() => {
        Alert.alert(
          '🎉 Character Created Successfully!',
          `Your character "${characterName}" has been created and you have been redirected to the character home screen.`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 500);
    } catch {
      Alert.alert(
        'Character Creation Failed',
        'There was an error creating your character. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
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