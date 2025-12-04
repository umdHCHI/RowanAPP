// CuratorSprite.tsx
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { sectionIcons } from "../../../assets/ui";

const FRAME_COUNT = 3;
const FRAME_WIDTH = 32; // Visible frame width
const FRAME_HEIGHT = 32; // change to match your sheet
const SPRITE_STEP = 31; // Actual distance between sprites in the sheet
const FRAME_DURATION = 200; // ms per frame - slowed down from 150ms

export const CuratorSprite: React.FC<{ scale?: number }> = ({ scale = 2 }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAME_COUNT);
    }, FRAME_DURATION);

    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={{
        width: FRAME_WIDTH * scale,
        height: FRAME_HEIGHT * scale,
        overflow: "hidden",
      }}
    >
      <Image
        source={sectionIcons.curatorGhost}
        style={{
          width: FRAME_WIDTH * FRAME_COUNT * scale,
          height: FRAME_HEIGHT * scale,
          transform: [
            { translateX: -frame * SPRITE_STEP * scale }, // slide to next ghost
          ],
        }}
      />
    </View>
  );
};
