import React from 'react';
import { Dimensions, View } from 'react-native';
import CharacterFrame from './CharacterFrame';
import CharacterPreview from './CharacterPreview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CharacterPreviewSectionProps {
  character: {
    getCurrentBackgroundAsset: (useLocalState?: boolean) => any;
    getBaseAsset: (useLocalState?: boolean) => any;
    getHairAsset: (useLocalState?: boolean) => any;
    getClothesAsset: (useLocalState?: boolean) => any;
    getEyesAsset: (useLocalState?: boolean) => any;
    getEyebrowsAsset: (useLocalState?: boolean) => any;
    getMouthAsset: (useLocalState?: boolean) => any;
    getHairIndex: () => number;
    getClothesIndex: () => number;
    getEyesIndex: () => number;
    getEyebrowsIndex: () => number;
    getCharacterName: () => string;
    selectedMouthType: number;
  };
  styles: any;
}

export const CharacterPreviewSection: React.FC<CharacterPreviewSectionProps> = ({
  character,
  styles
}) => {
  // Calculate responsive frame size
  const frameSize = Math.min(screenWidth * 0.4, screenHeight * 0.25, 200); // Reduced sizes for mobile-friendly character
  
  return (
    <View style={styles.characterCreatorPreviewSection}>
      <CharacterFrame frame={character.getCurrentBackgroundAsset(true)} size={frameSize}>
        <CharacterPreview
          selectedName={character.getCharacterName()}
          baseAsset={character.getBaseAsset(true)}
          background={character.getCurrentBackgroundAsset(true)}
          hairSheet={character.getHairAsset(true)}
          clothesSheet={character.getClothesAsset(true)}
          eyesSheet={character.getEyesAsset(true)}
          eyebrowsSheet={character.getEyebrowsAsset(true)}
          mouthSheet={character.getMouthAsset(true)}
          hairIndex={character.getHairIndex()}
          clothesIndex={character.getClothesIndex()}
          eyesIndex={character.getEyesIndex()}
          eyebrowsIndex={character.getEyebrowsIndex()}
          mouthIndex={character.selectedMouthType || 0}
          size={frameSize} // Match the CharacterFrame size
        />
      </CharacterFrame>
    </View>
  );
}; 