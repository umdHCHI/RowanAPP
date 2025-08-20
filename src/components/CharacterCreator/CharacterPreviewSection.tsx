import React from 'react';
import { Dimensions, View } from 'react-native';
import { CharacterPreviewSectionProps } from '../../types/characterCreator';
import CharacterFrame from './CharacterFrame';
import CharacterPreview from './CharacterPreview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CharacterPreviewSection: React.FC<CharacterPreviewSectionProps> = ({
  character,
  styles
}) => {
  // Use the preview section's maxHeight as the frame size for a true fit
  const frameSize = styles.characterCreatorPreviewSection?.maxHeight || 250;

  return (
    <View style={[styles.characterCreatorPreviewSection, { alignItems: 'center', justifyContent: 'center' }]}> 
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
          size={frameSize}
          fitToFrame // new prop to indicate full fit
        />
      </CharacterFrame>
    </View>
  );
}; 