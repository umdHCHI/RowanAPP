import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { CharacterPreviewProps } from "../../types/user";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculate responsive sizes based on screen dimensions
const getResponsiveSizes = () => {
  const maxPreviewWidth = Math.min(screenWidth * 0.5, 250); // Reduced from 0.7 to 0.5, max 250px
  const maxPreviewHeight = Math.min(screenHeight * 0.2, 200); // Reduced from 0.25 to 0.2, max 200px
  
  return {
    PREVIEW_WIDTH: maxPreviewWidth,
    PREVIEW_HEIGHT: maxPreviewHeight,
    BACKGROUND_WIDTH: maxPreviewWidth, // Changed from 0.8 to 1.0 to fill the frame completely
    BACKGROUND_HEIGHT: maxPreviewHeight, // Changed from 0.8 to 1.0 to fill the frame completely
    BASE_WIDTH: maxPreviewWidth,
    BASE_HEIGHT: maxPreviewHeight,
    HAIR_WIDTH: maxPreviewWidth,
    HAIR_HEIGHT: maxPreviewHeight,
    CLOTHES_WIDTH: maxPreviewWidth + 0.9, // Adjusted from 0.8 to 0.7 for better proportions
    CLOTHES_HEIGHT: maxPreviewHeight + 0.6, // Adjusted from 0.7 to 0.6 for better proportions
    EYES_WIDTH: maxPreviewWidth,
    EYES_HEIGHT: maxPreviewHeight,
    EYEBROWS_WIDTH: maxPreviewWidth,
    EYEBROWS_HEIGHT: maxPreviewHeight,
    MOUTH_WIDTH: maxPreviewWidth,
    MOUTH_HEIGHT: maxPreviewHeight,
  };
};

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
}) => {
  const sizes = getResponsiveSizes();
  
  // Calculate responsive offsets
  const BACKGROUND_TOP_OFFSET = 0;
  const BACKGROUND_LEFT_OFFSET = 0; // Changed from centering to 0 to fill the frame completely
  const BASE_TOP_OFFSET = 0;
  const BASE_LEFT_OFFSET = 0;
  const SKIN_TOP_OFFSET = 0;
  const SKIN_LEFT_OFFSET = 0;
  const HAIR_TOP_OFFSET = -sizes.PREVIEW_HEIGHT * 0.0; // Adjusted from -0.25 to -0.18 to position hair more naturally
  const HAIR_LEFT_OFFSET = 0;
  const CLOTHES_LEFT_OFFSET = (sizes.PREVIEW_WIDTH - sizes.CLOTHES_WIDTH) / 2; // Center clothes horizontally
  const CLOTHES_TOP_OFFSET = sizes.PREVIEW_HEIGHT * 0; // Adjusted from 0.2 to 0.35 to position clothes lower
  const EYES_TOP_OFFSET = -sizes.PREVIEW_HEIGHT * 0.01; // 10% of preview height for eyes
  const EYES_LEFT_OFFSET = 0;
  const EYEBROWS_TOP_OFFSET = -sizes.PREVIEW_HEIGHT * 0.01; // 12% of preview height for eyebrows
  const EYEBROWS_LEFT_OFFSET = 0;
  const MOUTH_TOP_OFFSET = -sizes.PREVIEW_HEIGHT * 0.00; // 5% of preview height for mouth
  const MOUTH_LEFT_OFFSET = 0;

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
            top: BACKGROUND_TOP_OFFSET,
            left: BACKGROUND_LEFT_OFFSET,
            resizeMode: "cover", // Changed from "contain" to "cover" to fill the frame completely
          }
        ]} 
      />
      
      {/* Base character layer (now includes skin color) */}
      <Image 
        source={baseAsset} 
        style={[
          styles.baseLayer,
          {
            width: sizes.BASE_WIDTH,
            height: sizes.BASE_HEIGHT,
            top: BASE_TOP_OFFSET,
            left: BASE_LEFT_OFFSET,
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
            top: HAIR_TOP_OFFSET,
            left: HAIR_LEFT_OFFSET,
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
              top: CLOTHES_TOP_OFFSET,
              left: CLOTHES_LEFT_OFFSET,
              resizeMode: "contain",
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
            width: sizes.EYEBROWS_WIDTH,
            height: sizes.EYEBROWS_HEIGHT,
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
            width: sizes.MOUTH_WIDTH,
            height: sizes.MOUTH_HEIGHT,
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
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible", // Changed from "hidden" to allow hair to extend beyond bounds
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
