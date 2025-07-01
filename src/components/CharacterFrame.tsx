import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CharacterFrameProps } from "../types/appearance";

const DEFAULT_FRAME = require("../../assets/character-creator/BGs/brown/brown_one.png");

const CharacterFrame: React.FC<CharacterFrameProps> = ({
  children,
  frame = DEFAULT_FRAME,
  size = 50,
}) => {
  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Image source={frame} style={{ width: size, height: size }} />
      </View>
      <View style={styles.passages}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
    justifypassages: "center",
    overflow: "hidden",
  },
  passages: {
    zIndex: 2,
    alignItems: "center",
    justifypassages: "center",
  },
});

export default CharacterFrame;
