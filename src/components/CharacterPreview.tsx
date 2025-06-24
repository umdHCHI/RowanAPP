import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

// Set the size for the whole preview (background and all layers)
const PREVIEW_WIDTH = 270;  // Match your background image's width
const PREVIEW_HEIGHT = 150; // Match your background image's height

// Use these for all layers
const BASE_WIDTH = PREVIEW_WIDTH;
const BASE_HEIGHT = PREVIEW_HEIGHT;
const BASE_TOP_OFFSET = 0;
const BASE_LEFT_OFFSET = 0;

const HAIR_WIDTH = PREVIEW_WIDTH;
const HAIR_HEIGHT = PREVIEW_HEIGHT;
const HAIR_TOP_OFFSET = 0;
const HAIR_LEFT_OFFSET = 0;

const CLOTHES_WIDTH = PREVIEW_WIDTH;
const CLOTHES_HEIGHT = PREVIEW_HEIGHT;
const CLOTHES_TOP_OFFSET = 0;
const CLOTHES_LEFT_OFFSET = 0;

const EYES_WIDTH = PREVIEW_WIDTH;
const EYES_HEIGHT = PREVIEW_HEIGHT;
const EYES_TOP_OFFSET = 0;
const EYES_LEFT_OFFSET = 0;

const MOUTH_WIDTH = PREVIEW_WIDTH;
const MOUTH_HEIGHT = PREVIEW_HEIGHT;
const MOUTH_TOP_OFFSET = 0;
const MOUTH_LEFT_OFFSET = 0;

// Only use the correct assets for the main avatar preview

type CharacterPreviewProps = {
  background: ImageSourcePropType;
  skinIndex: ImageSourcePropType;
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
      <Image source={background} style={styles.baseLayer} />
      <Image source={skinIndex} style={styles.baseLayer} />
      <Image source={hairSheet} style={styles.hairLayer} />
      <Image source={clothesSheet} style={styles.clothesLayer} />
      <Image source={eyesSheet} style={styles.eyesLayer} />
      <Image source={mouthSheet} style={styles.mouthLayer} />
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  baseLayer: {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    position: 'absolute',
    top: BASE_TOP_OFFSET,
    left: BASE_LEFT_OFFSET,
    resizeMode: 'contain',
  },
  hairLayer: {
    width: HAIR_WIDTH,
    height: HAIR_HEIGHT,
    position: 'absolute',
    top: HAIR_TOP_OFFSET,
    left: HAIR_LEFT_OFFSET,
    resizeMode: 'contain',
  },
  clothesLayer: {
    width: CLOTHES_WIDTH,
    height: CLOTHES_HEIGHT,
    position: 'absolute',
    top: CLOTHES_TOP_OFFSET,
    left: CLOTHES_LEFT_OFFSET,
    resizeMode: 'contain',
  },
  eyesLayer: {
    width: EYES_WIDTH,
    height: EYES_HEIGHT,
    position: 'absolute',
    top: EYES_TOP_OFFSET,
    left: EYES_LEFT_OFFSET,
    resizeMode: 'contain',
  },
  mouthLayer: {
    width: MOUTH_WIDTH,
    height: MOUTH_HEIGHT,
    position: 'absolute',
    top: MOUTH_TOP_OFFSET,
    left: MOUTH_LEFT_OFFSET,
    resizeMode: 'contain',
  },
});

export default CharacterPreview; 