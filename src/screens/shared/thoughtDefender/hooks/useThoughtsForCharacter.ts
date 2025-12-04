import { useCallback } from 'react';
import { CharacterArchetypes } from '../../../../data/archivePaths';
import { GameData } from '../../../../types/user';
import { getCharacterArchetype, getPersonalityArchetype } from '../utils';

interface UseThoughtsForCharacterProps {
  apiGameData: GameData | null;
  character: any;
  hasHomeData: boolean;
  hasBackendCharacter: boolean;
  primaryTrait?: string;
}

export const useThoughtsForCharacter = ({
  apiGameData,
  character,
  hasHomeData,
  hasBackendCharacter,
  primaryTrait,
}: UseThoughtsForCharacterProps) => {
  const getThoughtsForCharacter = useCallback(() => {
    // First, try to use API personality data if available
    if (apiGameData?.personality_data) {
      const personalityData = apiGameData.personality_data;
      
      // Find the highest trait
      const traits = {
        openness: personalityData.openness,
        conscientiousness: personalityData.conscientiousness,
        extraversion: personalityData.extraversion,
        agreeableness: personalityData.agreeableness,
        neuroticism: personalityData.neuroticism
      };
      
      const highestTrait = Object.entries(traits).reduce((max, [key, value]) => 
        value > max.value ? { key, value } : max, 
        { key: 'openness', value: traits.openness }
      );
      
      const traitMap: Record<string, keyof typeof CharacterArchetypes> = {
        openness: 'explorer',
        conscientiousness: 'scholar',
        extraversion: 'warrior',
        agreeableness: 'healer',
        neuroticism: 'sage'
      };
      
      const archetypeKey = traitMap[highestTrait.key] || 'scholar';
      const archetype = CharacterArchetypes[archetypeKey];
      
      return {
        positiveThoughts: archetype.positiveThoughts,
        negativeThoughts: archetype.negativeThoughts
      };
    }
    
    if (hasHomeData && hasBackendCharacter) {
      const characterData = {
        selectedBaseModel: character.selectedBaseModel || 0,
        selectedHairStyle: character.selectedHairStyle || 0,
        selectedEyeType: character.selectedEyeType || 0,
        selectedMouthType: character.selectedMouthType || 0,
        selectedShirtType: character.selectedShirtType || 0
      };
      
      const characterArchetype = getCharacterArchetype(characterData);
      
      return {
        positiveThoughts: characterArchetype.positiveThoughts,
        negativeThoughts: characterArchetype.negativeThoughts
      };
    }
    
    if (primaryTrait) {
      const personalityArchetype = getPersonalityArchetype(primaryTrait);
      return {
        positiveThoughts: personalityArchetype.positiveThoughts,
        negativeThoughts: personalityArchetype.negativeThoughts
      };
    }
    
    return {
      positiveThoughts: CharacterArchetypes.scholar.positiveThoughts,
      negativeThoughts: CharacterArchetypes.scholar.negativeThoughts
    };
  }, [hasHomeData, hasBackendCharacter, character, primaryTrait, apiGameData]);

  return getThoughtsForCharacter();
};

