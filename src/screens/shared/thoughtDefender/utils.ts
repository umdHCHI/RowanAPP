import { CharacterArchetypes } from '../../../data/archivePaths';

export const getCharacterArchetype = (characterData: {
  selectedBaseModel: any;
  selectedHairStyle: any;
  selectedEyeType: any;
  selectedMouthType: any;
  selectedShirtType: any;
}) => {
  const total =
    characterData.selectedBaseModel +
    characterData.selectedHairStyle +
    characterData.selectedEyeType +
    characterData.selectedMouthType +
    characterData.selectedShirtType;

  if (total % 5 === 0) return CharacterArchetypes.scholar;
  if (total % 5 === 1) return CharacterArchetypes.warrior;
  if (total % 5 === 2) return CharacterArchetypes.sage;
  if (total % 5 === 3) return CharacterArchetypes.healer;
  return CharacterArchetypes.explorer;
};

export const getPersonalityArchetype = (personalityData: string) => {
  if (personalityData === "Openness") return CharacterArchetypes.explorer;
  if (personalityData === "Conscientiousness") return CharacterArchetypes.scholar;
  if (personalityData === "Extraversion") return CharacterArchetypes.warrior;
  if (personalityData === "Agreeableness") return CharacterArchetypes.healer;
  if (personalityData === "Neuroticism") return CharacterArchetypes.sage;
  return CharacterArchetypes.explorer;
};

