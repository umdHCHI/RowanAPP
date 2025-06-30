import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface UseCharacterCreationProps {
  characterName: string;
  createCharacter: () => Promise<void>;
  completeCharacter: () => void | Promise<void>;
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
    if (!validateCharacterName(characterName)) {
      Alert.alert(
        'Character Name Required',
        'Please enter a name for your character before creating it.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    try {
      await createCharacter();
      await Promise.resolve(completeCharacter());
      
      Alert.alert(
        '🎉 Character Created Successfully!',
        `Your character "${characterName}" has been created and you will be redirected to the character home screen.`,
        [
          {
            text: 'OK',
            onPress: () => {
              try {
                setTimeout(() => {
                  router.push('/(character)/character');
                }, 100);
              } catch (navError) {
                router.push('/');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Character Creation Failed',
        'There was an error creating your character. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [characterName, createCharacter, completeCharacter, validateCharacterName]);

  return {
    handleCharacterCreation,
    validateCharacterName
  };
}; 