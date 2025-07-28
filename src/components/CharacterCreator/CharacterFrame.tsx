import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CharacterFrameProps } from "../../types/user";

const DEFAULT_FRAME = require("../../../assets/character-creator/BGs/brown/brown_one.png");

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
      <View style={[styles.passages, { width: size * 1.1, height: size * 1.1 }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible", // Changed from "hidden" to allow hair to extend beyond frame
  },
  passages: {
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible", // Allow content to extend beyond bounds
  },
});

export default CharacterFrame;
