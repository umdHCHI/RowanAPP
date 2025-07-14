import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CharacterPreviewProps } from "../types/user";

// Sizing and offset constants (can be adjusted as needed)
const PREVIEW_WIDTH = 500;
const PREVIEW_HEIGHT = 250;
const BASE_WIDTH = PREVIEW_WIDTH;
const BASE_HEIGHT = PREVIEW_HEIGHT;
const BASE_TOP_OFFSET = 0;
const BASE_LEFT_OFFSET = 0;
const SKIN_WIDTH = PREVIEW_WIDTH;
const SKIN_HEIGHT = PREVIEW_HEIGHT;
const SKIN_TOP_OFFSET = 0;
const SKIN_LEFT_OFFSET = 0;
const HAIR_WIDTH = PREVIEW_WIDTH;
const HAIR_HEIGHT = PREVIEW_HEIGHT;
const HAIR_TOP_OFFSET = -35;
const HAIR_LEFT_OFFSET = 0;
const CLOTHES_WIDTH = PREVIEW_WIDTH * 0.4;
const CLOTHES_HEIGHT = CLOTHES_WIDTH / 3; // Example aspect ratio
const CLOTHES_LEFT_OFFSET = (PREVIEW_WIDTH - CLOTHES_WIDTH) / 2;
const CLOTHES_TOP_OFFSET = 160;
const EYES_WIDTH = PREVIEW_WIDTH;
const EYES_HEIGHT = PREVIEW_HEIGHT;
const EYES_TOP_OFFSET = -30;
const EYES_LEFT_OFFSET = 0;
const EYEBROWS_WIDTH = PREVIEW_WIDTH;
const EYEBROWS_HEIGHT = PREVIEW_HEIGHT;
const EYEBROWS_TOP_OFFSET = -30;
const EYEBROWS_LEFT_OFFSET = 0;
const MOUTH_WIDTH = PREVIEW_WIDTH;
const MOUTH_HEIGHT = PREVIEW_HEIGHT;
const MOUTH_TOP_OFFSET = -30;
const MOUTH_LEFT_OFFSET = 0;

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  baseAsset,
  background,
  hairSheet,
  clothesSheet,
  eyesSheet,
  eyebrowsSheet,
  mouthSheet,
  hairIndex,
  clothesIndex,
  eyesIndex,
  eyebrowsIndex,
  mouthIndex,
}) => {
  return (
    <View style={styles.previewContainer}>
      {/* Background layer */}
      <Image source={background} style={styles.baseLayer} />
      
      {/* Base character layer (now includes skin color) */}
      <Image source={baseAsset} style={styles.baseLayer} />
      
      {/* Hair layer */}
      <Image 
        source={hairSheet} 
        style={[
          styles.hairLayer,
          {
            width: HAIR_WIDTH,
            height: HAIR_HEIGHT,
            top: HAIR_TOP_OFFSET,
            left: HAIR_LEFT_OFFSET,
          }
        ]}
      />
      
      {/* Clothes layer */}
      <Image 
        source={clothesSheet} 
        style={[
          styles.clothesLayer,
          {
            width: CLOTHES_WIDTH,
            height: CLOTHES_HEIGHT,
            top: CLOTHES_TOP_OFFSET,
            left: CLOTHES_LEFT_OFFSET,
          }
        ]}
      />
      
      {/* Eyes layer */}
      <Image 
        source={eyesSheet} 
        style={[
          styles.eyesLayer,
          {
            width: EYES_WIDTH,
            height: EYES_HEIGHT,
            top: EYES_TOP_OFFSET,
            left: EYES_LEFT_OFFSET,
          }
        ]}
      />
      
      {/* Eyebrows layer */}
      <Image 
        source={eyebrowsSheet} 
        style={[
          styles.eyebrowsLayer,
          {
            width: EYEBROWS_WIDTH,
            height: EYEBROWS_HEIGHT,
            top: EYEBROWS_TOP_OFFSET,
            left: EYEBROWS_LEFT_OFFSET,
          }
        ]}
      />
      
      {/* Mouth layer */}
      <Image 
        source={mouthSheet} 
        style={[
          styles.mouthLayer,
          {
            width: MOUTH_WIDTH,
            height: MOUTH_HEIGHT,
            top: MOUTH_TOP_OFFSET,
            left: MOUTH_LEFT_OFFSET,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  baseLayer: {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    position: "absolute",
    top: BASE_TOP_OFFSET,
    left: BASE_LEFT_OFFSET,
    resizeMode: "contain",
  },
  skinLayer: {
    width: SKIN_WIDTH,
    height: SKIN_HEIGHT,
    position: "absolute",
    top: SKIN_TOP_OFFSET,
    left: SKIN_LEFT_OFFSET,
    resizeMode: "contain",
  },
  hairLayer: {
    width: HAIR_WIDTH,
    height: HAIR_HEIGHT,
    position: "absolute",
    top: HAIR_TOP_OFFSET,
    left: HAIR_LEFT_OFFSET,
    resizeMode: "contain",
  },
  clothesLayer: {
    width: CLOTHES_WIDTH,
    height: CLOTHES_HEIGHT,
    position: "absolute",
    top: CLOTHES_TOP_OFFSET,
    left: CLOTHES_LEFT_OFFSET,
    resizeMode: "contain",
  },
  eyesLayer: {
    width: EYES_WIDTH,
    height: EYES_HEIGHT,
    position: "absolute",
    top: EYES_TOP_OFFSET,
    left: EYES_LEFT_OFFSET,
    resizeMode: "contain",
  },
  eyebrowsLayer: {
    width: EYEBROWS_WIDTH,
    height: EYEBROWS_HEIGHT,
    position: "absolute",
    top: EYEBROWS_TOP_OFFSET,
    left: EYEBROWS_LEFT_OFFSET,
    resizeMode: "contain",
  },
  mouthLayer: {
    width: MOUTH_WIDTH,
    height: MOUTH_HEIGHT,
    position: "absolute",
    top: MOUTH_TOP_OFFSET,
    left: MOUTH_LEFT_OFFSET,
    resizeMode: "contain",
  },
});

export default CharacterPreview;
