import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CharacterPreviewProps } from "../../types/characterCreator";

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  selectedName,
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
  size = 200,
  fitToFrame,
}) => {
  // Make all assets exactly the size of the frame for a true fit
  const previewWidth = size;
  const previewHeight = size;
  const sizes = {
    PREVIEW_WIDTH: previewWidth,
    PREVIEW_HEIGHT: previewHeight,
    BACKGROUND_WIDTH: previewWidth,
    BACKGROUND_HEIGHT: previewHeight,
    BASE_WIDTH: previewWidth,
    BASE_HEIGHT: previewHeight,
    HAIR_WIDTH: previewWidth,
    HAIR_HEIGHT: previewHeight,
    CLOTHES_WIDTH: previewWidth,
    CLOTHES_HEIGHT: previewHeight,
    EYES_WIDTH: previewWidth,
    EYES_HEIGHT: previewHeight,
    EYEBROWS_WIDTH: previewWidth,
    EYEBROWS_HEIGHT: previewHeight,
    MOUTH_WIDTH: previewWidth,
    MOUTH_HEIGHT: previewHeight,
  };
  // All offsets zero for perfect fit
  const OFFSET = 0;
  return (
    <View style={[styles.previewContainer, { width: sizes.PREVIEW_WIDTH, height: sizes.PREVIEW_HEIGHT }]}> 
      {/* Background layer */}
      <Image
        source={background}
        style={[
          styles.baseLayer,
          {
            width: sizes.BACKGROUND_WIDTH,
            height: sizes.BACKGROUND_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]}
      />
      <Image 
        source={baseAsset} 
        style={[
          styles.baseLayer,
          {
            width: sizes.BASE_WIDTH,
            height: sizes.BASE_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]} 
      />
      {/* Clothes layer */}
      {clothesSheet && (
        <Image
          source={clothesSheet}
          style={[
            styles.clothesLayer,
            {
              width: sizes.CLOTHES_WIDTH,
              height: sizes.CLOTHES_HEIGHT,
              top: OFFSET,
              left: OFFSET,
            }
          ]}
        />
      )}
      {/* Eyes layer */}
      <Image 
        source={eyesSheet} 
        style={[
          styles.eyesLayer,
          {
            width: sizes.EYES_WIDTH,
            height: sizes.EYES_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]}
      />
      {/* Eyebrows layer */}
      <Image 
        source={eyebrowsSheet} 
        style={[
          styles.eyebrowsLayer,
          {
            width: sizes.EYEBROWS_WIDTH,
            height: sizes.EYEBROWS_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]}
      />
      {/* Mouth layer */}
      <Image 
        source={mouthSheet} 
        style={[
          styles.mouthLayer,
          {
            width: sizes.MOUTH_WIDTH,
            height: sizes.MOUTH_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]}
      />
      {/* Hair layer */}
      <Image 
        source={hairSheet} 
        style={[
          styles.hairLayer,
          {
            width: sizes.HAIR_WIDTH,
            height: sizes.HAIR_HEIGHT,
            top: OFFSET,
            left: OFFSET,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  },
  baseLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  skinLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  hairLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  clothesLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  eyesLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  eyebrowsLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
  mouthLayer: {
    position: "absolute",
    resizeMode: "contain",
  },
});

export default CharacterPreview;
