import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { baseOptions } from '../assets/characterOptions';

const FRAME_WIDTH = 150;
const FRAME_HEIGHT = 125;

// Only use the correct assets for the main avatar preview

type CharacterPreviewProps = {
  background: ImageSourcePropType;
  skinIndex: number;
  hairSheet: ImageSourcePropType;
  clothesSheet: ImageSourcePropType;
  eyesSheet: ImageSourcePropType;
  mouthSheet: ImageSourcePropType;
  hairIndex: number;
  clothesIndex: number;
  eyesIndex: number;
  mouthIndex: number;
};

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  background,
  skinIndex,
  hairSheet,
  clothesSheet,
  eyesSheet,
  mouthSheet,
  hairIndex,
  clothesIndex,
  eyesIndex,
  mouthIndex,
}) => {
  return (
    <View style={styles.previewContainer}>
      <Image source={background} style={styles.layer} />
      <Image source={baseOptions[skinIndex]} style={styles.layer} />
      <Image source={hairSheet} style={styles.layer} />
      <Image source={clothesSheet} style={styles.layer} />
      <Image source={eyesSheet} style={styles.layer} />
      <Image source={mouthSheet} style={styles.layer} />
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'contain',
  },
});

export default CharacterPreview; 