import React from 'react';
import { View } from 'react-native';
import { CharacterFrame, CharacterPreview } from '../../imports';

interface CharacterPreviewSectionProps {
  character: {
    getCurrentBackgroundAsset: () => any;
    getBaseAsset: () => any;
    getHairAsset: () => any;
    getClothesAsset: () => any;
    getEyesAsset: () => any;
    getEyebrowsAsset: () => any;
    getMouthAsset: () => any;
    getHairIndex: () => number;
    getClothesIndex: () => number;
    getEyesIndex: () => number;
    getEyebrowsIndex: () => number;
    selectedMouthType: number;
  };
  styles: any;
}

export const CharacterPreviewSection: React.FC<CharacterPreviewSectionProps> = ({
  character,
  styles
}) => {
  return (
    <View style={styles.characterCreatorPreviewSection}>
      <CharacterFrame frame={character.getCurrentBackgroundAsset()} size={250}>
        <CharacterPreview
          baseAsset={character.getBaseAsset()}
          background={character.getCurrentBackgroundAsset()}
          hairSheet={character.getHairAsset()}
          clothesSheet={character.getClothesAsset()}
          eyesSheet={character.getEyesAsset()}
          eyebrowsSheet={character.getEyebrowsAsset()}
          mouthSheet={character.getMouthAsset()}
          hairIndex={character.getHairIndex()}
          clothesIndex={character.getClothesIndex()}
          eyesIndex={character.getEyesIndex()}
          eyebrowsIndex={character.getEyebrowsIndex()}
          mouthIndex={character.selectedMouthType}
        />
      </CharacterFrame>
    </View>
  );
}; 