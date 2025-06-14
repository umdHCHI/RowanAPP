import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

// Default to first brown background
const DEFAULT_FRAME = require('../../assets/character-creator/BGs/brown/brown_one.png');

export type CharacterFrameProps = {
  children: React.ReactNode;
  frame?: ImageSourcePropType;
  size?: number; // width/height of the square
};

const CharacterFrame: React.FC<CharacterFrameProps> = ({
  children,
  frame = DEFAULT_FRAME,
  size = 50,
}) => {
  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>      
      <View style={{ width: size, height: size, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
        <Image source={frame} style={{ width: size, height: size }} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CharacterFrame; 