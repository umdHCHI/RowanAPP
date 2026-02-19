import { ImageSourcePropType } from "react-native";

export const COLORS = [
  "Blonde",
  "Blue",
  "Blue-Green",
  "Brown",
  "Dark Blue",
  "Dark Brown",
  "Dark",
  "Green",
  "Light Brown",
  "Light Green",
  "Lilac",
  "Magenta",
  "Orange",
  "Pink",
  "Red",
  "White",
] as const;

export type Color = (typeof COLORS)[number];

// Base options (1-12)
const BASE_COUNT = 12;

// Background options per color (1-12)
const BG_COUNT = 12;

// Hair options per color (1-32)
const HAIR_COUNT = 32;

// Clothes options per color (1-12)
const CLOTHES_COUNT = 12;

// Eyes options per color (1-12)
const EYES_COUNT = 12;

// Eyebrows options per color (1-12)
const EYEBROWS_COUNT = 12;

// Mouth options (1-12)
const MOUTH_COUNT = 12;

// Helper to get base asset
export function getBaseAsset(index: number): ImageSourcePropType {
  const baseIndex = index + 1;
  const baseMap: Record<number, () => ImageSourcePropType> = {
    1: () => require("../assets/character-creator/Bases/base_main/base_1.png"),
    2: () => require("../assets/character-creator/Bases/base_main/base_2.png"),
    3: () => require("../assets/character-creator/Bases/base_main/base_3.png"),
    4: () => require("../assets/character-creator/Bases/base_main/base_4.png"),
    5: () => require("../assets/character-creator/Bases/base_main/base_5.png"),
    6: () => require("../assets/character-creator/Bases/base_main/base_6.png"),
    7: () => require("../assets/character-creator/Bases/base_main/base_7.png"),
    8: () => require("../assets/character-creator/Bases/base_main/base_8.png"),
    9: () => require("../assets/character-creator/Bases/base_main/base_9.png"),
    10: () =>
      require("../assets/character-creator/Bases/base_main/base_10.png"),
    11: () =>
      require("../assets/character-creator/Bases/base_main/base_11.png"),
    12: () =>
      require("../assets/character-creator/Bases/base_main/base_12.png"),
  };
  return baseMap[baseIndex]?.() || baseMap[1]();
}

// Helper to get background asset
export function getBackgroundAsset(
  color: Color,
  index: number,
): ImageSourcePropType {
  const bgIndex = index + 1;
  const colorKey = color.replace(/[\s-]+/g, "");

  const bgMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require("../assets/character-creator/BGs/Blonde_1.png"),
      2: () => require("../assets/character-creator/BGs/Blonde_2.png"),
      3: () => require("../assets/character-creator/BGs/Blonde_3.png"),
      4: () => require("../assets/character-creator/BGs/Blonde_4.png"),
      5: () => require("../assets/character-creator/BGs/Blonde_5.png"),
      6: () => require("../assets/character-creator/BGs/Blonde_6.png"),
      7: () => require("../assets/character-creator/BGs/Blonde_7.png"),
      8: () => require("../assets/character-creator/BGs/Blonde_8.png"),
      9: () => require("../assets/character-creator/BGs/Blonde_9.png"),
      10: () => require("../assets/character-creator/BGs/Blonde_10.png"),
      11: () => require("../assets/character-creator/BGs/Blonde_11.png"),
      12: () => require("../assets/character-creator/BGs/Blonde_12.png"),
    },
    Blue: {
      1: () => require("../assets/character-creator/BGs/Blue_1.png"),
      2: () => require("../assets/character-creator/BGs/Blue_2.png"),
      3: () => require("../assets/character-creator/BGs/Blue_3.png"),
      4: () => require("../assets/character-creator/BGs/Blue_4.png"),
      5: () => require("../assets/character-creator/BGs/Blue_5.png"),
      6: () => require("../assets/character-creator/BGs/Blue_6.png"),
      7: () => require("../assets/character-creator/BGs/Blue_7.png"),
      8: () => require("../assets/character-creator/BGs/Blue_8.png"),
      9: () => require("../assets/character-creator/BGs/Blue_9.png"),
      10: () => require("../assets/character-creator/BGs/Blue_10.png"),
      11: () => require("../assets/character-creator/BGs/Blue_11.png"),
      12: () => require("../assets/character-creator/BGs/Blue_12.png"),
    },
    BlueGreen: {
      1: () => require("../assets/character-creator/BGs/Blue-Green_1.png"),
      2: () => require("../assets/character-creator/BGs/Blue-Green_2.png"),
      3: () => require("../assets/character-creator/BGs/Blue-Green_3.png"),
      4: () => require("../assets/character-creator/BGs/Blue-Green_4.png"),
      5: () => require("../assets/character-creator/BGs/Blue-Green_5.png"),
      6: () => require("../assets/character-creator/BGs/Blue-Green_6.png"),
      7: () => require("../assets/character-creator/BGs/Blue-Green_7.png"),
      8: () => require("../assets/character-creator/BGs/Blue-Green_8.png"),
      9: () => require("../assets/character-creator/BGs/Blue-Green_9.png"),
      10: () => require("../assets/character-creator/BGs/Blue-Green_10.png"),
      11: () => require("../assets/character-creator/BGs/Blue-Green_11.png"),
      12: () => require("../assets/character-creator/BGs/Blue-Green_12.png"),
    },
    Brown: {
      1: () => require("../assets/character-creator/BGs/Brown_1.png"),
      2: () => require("../assets/character-creator/BGs/Brown_2.png"),
      3: () => require("../assets/character-creator/BGs/Brown_3.png"),
      4: () => require("../assets/character-creator/BGs/Brown_4.png"),
      5: () => require("../assets/character-creator/BGs/Brown_5.png"),
      6: () => require("../assets/character-creator/BGs/Brown_6.png"),
      7: () => require("../assets/character-creator/BGs/Brown_7.png"),
      8: () => require("../assets/character-creator/BGs/Brown_8.png"),
      9: () => require("../assets/character-creator/BGs/Brown_9.png"),
      10: () => require("../assets/character-creator/BGs/Brown_10.png"),
      11: () => require("../assets/character-creator/BGs/Brown_11.png"),
      12: () => require("../assets/character-creator/BGs/Brown_12.png"),
    },
    DarkBlue: {
      1: () => require("../assets/character-creator/BGs/Dark Blue_1.png"),
      2: () => require("../assets/character-creator/BGs/Dark Blue_2.png"),
      3: () => require("../assets/character-creator/BGs/Dark Blue_3.png"),
      4: () => require("../assets/character-creator/BGs/Dark Blue_4.png"),
      5: () => require("../assets/character-creator/BGs/Dark Blue_5.png"),
      6: () => require("../assets/character-creator/BGs/Dark Blue_6.png"),
      7: () => require("../assets/character-creator/BGs/Dark Blue_7.png"),
      8: () => require("../assets/character-creator/BGs/Dark Blue_8.png"),
      9: () => require("../assets/character-creator/BGs/Dark Blue_9.png"),
      10: () => require("../assets/character-creator/BGs/Dark Blue_10.png"),
      11: () => require("../assets/character-creator/BGs/Dark Blue_11.png"),
      12: () => require("../assets/character-creator/BGs/Dark Blue_12.png"),
    },
    DarkBrown: {
      1: () => require("../assets/character-creator/BGs/Dark Brown_1.png"),
      2: () => require("../assets/character-creator/BGs/Dark Brown_2.png"),
      3: () => require("../assets/character-creator/BGs/Dark Brown_3.png"),
      4: () => require("../assets/character-creator/BGs/Dark Brown_4.png"),
      5: () => require("../assets/character-creator/BGs/Dark Brown_5.png"),
      6: () => require("../assets/character-creator/BGs/Dark Brown_6.png"),
      7: () => require("../assets/character-creator/BGs/Dark Brown_7.png"),
      8: () => require("../assets/character-creator/BGs/Dark Brown_8.png"),
      9: () => require("../assets/character-creator/BGs/Dark Brown_9.png"),
      10: () => require("../assets/character-creator/BGs/Dark Brown_10.png"),
      11: () => require("../assets/character-creator/BGs/Dark Brown_11.png"),
      12: () => require("../assets/character-creator/BGs/Dark Brown_12.png"),
    },
    Dark: {
      1: () => require("../assets/character-creator/BGs/Dark_1.png"),
      2: () => require("../assets/character-creator/BGs/Dark_2.png"),
      3: () => require("../assets/character-creator/BGs/Dark_3.png"),
      4: () => require("../assets/character-creator/BGs/Dark_4.png"),
      5: () => require("../assets/character-creator/BGs/Dark_5.png"),
      6: () => require("../assets/character-creator/BGs/Dark_6.png"),
      7: () => require("../assets/character-creator/BGs/Dark_7.png"),
      8: () => require("../assets/character-creator/BGs/Dark_8.png"),
      9: () => require("../assets/character-creator/BGs/Dark_9.png"),
      10: () => require("../assets/character-creator/BGs/Dark_10.png"),
      11: () => require("../assets/character-creator/BGs/Dark_11.png"),
      12: () => require("../assets/character-creator/BGs/Dark_12.png"),
    },
    Green: {
      1: () => require("../assets/character-creator/BGs/Green_1.png"),
      2: () => require("../assets/character-creator/BGs/Green_2.png"),
      3: () => require("../assets/character-creator/BGs/Green_3.png"),
      4: () => require("../assets/character-creator/BGs/Green_4.png"),
      5: () => require("../assets/character-creator/BGs/Green_5.png"),
      6: () => require("../assets/character-creator/BGs/Green_6.png"),
      7: () => require("../assets/character-creator/BGs/Green_7.png"),
      8: () => require("../assets/character-creator/BGs/Green_8.png"),
      9: () => require("../assets/character-creator/BGs/Green_9.png"),
      10: () => require("../assets/character-creator/BGs/Green_10.png"),
      11: () => require("../assets/character-creator/BGs/Green_11.png"),
      12: () => require("../assets/character-creator/BGs/Green_12.png"),
    },
    LightBrown: {
      1: () => require("../assets/character-creator/BGs/Light Brown_1.png"),
      2: () => require("../assets/character-creator/BGs/Light Brown_2.png"),
      3: () => require("../assets/character-creator/BGs/Light Brown_3.png"),
      4: () => require("../assets/character-creator/BGs/Light Brown_4.png"),
      5: () => require("../assets/character-creator/BGs/Light Brown_5.png"),
      6: () => require("../assets/character-creator/BGs/Light Brown_6.png"),
      7: () => require("../assets/character-creator/BGs/Light Brown_7.png"),
      8: () => require("../assets/character-creator/BGs/Light Brown_8.png"),
      9: () => require("../assets/character-creator/BGs/Light Brown_9.png"),
      10: () => require("../assets/character-creator/BGs/Light Brown_10.png"),
      11: () => require("../assets/character-creator/BGs/Light Brown_11.png"),
      12: () => require("../assets/character-creator/BGs/Light Brown_12.png"),
    },
    LightGreen: {
      1: () => require("../assets/character-creator/BGs/Light Green_1.png"),
      2: () => require("../assets/character-creator/BGs/Light Green_2.png"),
      3: () => require("../assets/character-creator/BGs/Light Green_3.png"),
      4: () => require("../assets/character-creator/BGs/Light Green_4.png"),
      5: () => require("../assets/character-creator/BGs/Light Green_5.png"),
      6: () => require("../assets/character-creator/BGs/Light Green_6.png"),
      7: () => require("../assets/character-creator/BGs/Light Green_7.png"),
      8: () => require("../assets/character-creator/BGs/Light Green_8.png"),
      9: () => require("../assets/character-creator/BGs/Light Green_9.png"),
      10: () => require("../assets/character-creator/BGs/Light Green_10.png"),
      11: () => require("../assets/character-creator/BGs/Light Green_11.png"),
      12: () => require("../assets/character-creator/BGs/Light Green_12.png"),
    },
    Lilac: {
      1: () => require("../assets/character-creator/BGs/Lilac_1.png"),
      2: () => require("../assets/character-creator/BGs/Lilac_2.png"),
      3: () => require("../assets/character-creator/BGs/Lilac_3.png"),
      4: () => require("../assets/character-creator/BGs/Lilac_4.png"),
      5: () => require("../assets/character-creator/BGs/Lilac_5.png"),
      6: () => require("../assets/character-creator/BGs/Lilac_6.png"),
      7: () => require("../assets/character-creator/BGs/Lilac_7.png"),
      8: () => require("../assets/character-creator/BGs/Lilac_8.png"),
      9: () => require("../assets/character-creator/BGs/Lilac_9.png"),
      10: () => require("../assets/character-creator/BGs/Lilac_10.png"),
      11: () => require("../assets/character-creator/BGs/Lilac_11.png"),
      12: () => require("../assets/character-creator/BGs/Lilac_12.png"),
    },
    Magenta: {
      1: () => require("../assets/character-creator/BGs/Magent_1.png"),
      2: () => require("../assets/character-creator/BGs/Magent_2.png"),
      3: () => require("../assets/character-creator/BGs/Magent_3.png"),
      4: () => require("../assets/character-creator/BGs/Magent_4.png"),
      5: () => require("../assets/character-creator/BGs/Magent_5.png"),
      6: () => require("../assets/character-creator/BGs/Magent_6.png"),
      7: () => require("../assets/character-creator/BGs/Magent_7.png"),
      8: () => require("../assets/character-creator/BGs/Magent_8.png"),
      9: () => require("../assets/character-creator/BGs/Magent_9.png"),
      10: () => require("../assets/character-creator/BGs/Magent_10.png"),
      11: () => require("../assets/character-creator/BGs/Magent_11.png"),
      12: () => require("../assets/character-creator/BGs/Magent_12.png"),
    },
    Orange: {
      1: () => require("../assets/character-creator/BGs/Orange_1.png"),
      2: () => require("../assets/character-creator/BGs/Orange_2.png"),
      3: () => require("../assets/character-creator/BGs/Orange_3.png"),
      4: () => require("../assets/character-creator/BGs/Orange_4.png"),
      5: () => require("../assets/character-creator/BGs/Orange_5.png"),
      6: () => require("../assets/character-creator/BGs/Orange_6.png"),
      7: () => require("../assets/character-creator/BGs/Orange_7.png"),
      8: () => require("../assets/character-creator/BGs/Orange_8.png"),
      9: () => require("../assets/character-creator/BGs/Orange_9.png"),
      10: () => require("../assets/character-creator/BGs/Orange_10.png"),
      11: () => require("../assets/character-creator/BGs/Orange_11.png"),
      12: () => require("../assets/character-creator/BGs/Orange_12.png"),
    },
    Pink: {
      1: () => require("../assets/character-creator/BGs/Pink_1.png"),
      2: () => require("../assets/character-creator/BGs/Pink_2.png"),
      3: () => require("../assets/character-creator/BGs/Pink_3.png"),
      4: () => require("../assets/character-creator/BGs/Pink_4.png"),
      5: () => require("../assets/character-creator/BGs/Pink_5.png"),
      6: () => require("../assets/character-creator/BGs/Pink_6.png"),
      7: () => require("../assets/character-creator/BGs/Pink_7.png"),
      8: () => require("../assets/character-creator/BGs/Pink_8.png"),
      9: () => require("../assets/character-creator/BGs/Pink_9.png"),
      10: () => require("../assets/character-creator/BGs/Pink_10.png"),
      11: () => require("../assets/character-creator/BGs/Pink_11.png"),
      12: () => require("../assets/character-creator/BGs/Pink_12.png"),
    },
    Red: {
      1: () => require("../assets/character-creator/BGs/Red_1.png"),
      2: () => require("../assets/character-creator/BGs/Red_2.png"),
      3: () => require("../assets/character-creator/BGs/Red_3.png"),
      4: () => require("../assets/character-creator/BGs/Red_4.png"),
      5: () => require("../assets/character-creator/BGs/Red_5.png"),
      6: () => require("../assets/character-creator/BGs/Red_6.png"),
      7: () => require("../assets/character-creator/BGs/Red_7.png"),
      8: () => require("../assets/character-creator/BGs/Red_8.png"),
      9: () => require("../assets/character-creator/BGs/Red_9.png"),
      10: () => require("../assets/character-creator/BGs/Red_10.png"),
      11: () => require("../assets/character-creator/BGs/Red_11.png"),
      12: () => require("../assets/character-creator/BGs/Red_12.png"),
    },
    White: {
      1: () => require("../assets/character-creator/BGs/White_1.png"),
      2: () => require("../assets/character-creator/BGs/White_2.png"),
      3: () => require("../assets/character-creator/BGs/White_3.png"),
      4: () => require("../assets/character-creator/BGs/White_4.png"),
      5: () => require("../assets/character-creator/BGs/White_5.png"),
      6: () => require("../assets/character-creator/BGs/White_6.png"),
      7: () => require("../assets/character-creator/BGs/White_7.png"),
      8: () => require("../assets/character-creator/BGs/White_8.png"),
      9: () => require("../assets/character-creator/BGs/White_9.png"),
      10: () => require("../assets/character-creator/BGs/White_10.png"),
      11: () => require("../assets/character-creator/BGs/White_11.png"),
      12: () => require("../assets/character-creator/BGs/White_12.png"),
    },
  };

  const colorMap = bgMap[colorKey] || bgMap["Brown"];
  return colorMap[bgIndex]?.() || colorMap[1]();
}

// Helper to get hair asset
export function getHairAsset(
  color: Color,
  index: number,
): ImageSourcePropType | null {
  if (index < 0) return null;
  const hairIndex = index + 1;
  const colorKey = color.replace(/[\s-]+/g, "");

  // Map all available hair colors with all 32 styles
  // Note: Brown uses "Brown 1", Dark Brown uses "Brown 2", Light Brown uses "Brown 3"
  // Dark maps to Black
  const hairMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require("../assets/character-creator/Hairs/Hair Blonde_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Blonde_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Blonde_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Blonde_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Blonde_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Blonde_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Blonde_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Blonde_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Blonde_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Blonde_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Blonde_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Blonde_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Blonde_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Blonde_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Blonde_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Blonde_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Blonde_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Blonde_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Blonde_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Blonde_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Blonde_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Blonde_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Blonde_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Blonde_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Blonde_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Blonde_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Blonde_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Blonde_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Blonde_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Blonde_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Blonde_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Blonde_32.png"),
    },
    Blue: {
      1: () => require("../assets/character-creator/Hairs/Hair Blue_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Blue_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Blue_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Blue_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Blue_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Blue_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Blue_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Blue_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Blue_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Blue_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Blue_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Blue_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Blue_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Blue_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Blue_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Blue_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Blue_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Blue_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Blue_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Blue_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Blue_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Blue_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Blue_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Blue_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Blue_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Blue_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Blue_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Blue_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Blue_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Blue_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Blue_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Blue_32.png"),
    },
    BlueGreen: {
      1: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_1.png"),
      2: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_2.png"),
      3: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_3.png"),
      4: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_4.png"),
      5: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_5.png"),
      6: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_6.png"),
      7: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_7.png"),
      8: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_8.png"),
      9: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Blue-Green_32.png"),
    },
    Brown: {
      1: () => require("../assets/character-creator/Hairs/Hair Brown 1_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Brown 1_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Brown 1_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Brown 1_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Brown 1_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Brown 1_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Brown 1_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Brown 1_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Brown 1_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Brown 1_32.png"),
    },
    DarkBlue: {
      1: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_1.png"),
      2: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_2.png"),
      3: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_3.png"),
      4: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_4.png"),
      5: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_5.png"),
      6: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_6.png"),
      7: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_7.png"),
      8: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_8.png"),
      9: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Dark Blue_32.png"),
    },
    DarkBrown: {
      1: () => require("../assets/character-creator/Hairs/Hair Brown 2_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Brown 2_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Brown 2_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Brown 2_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Brown 2_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Brown 2_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Brown 2_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Brown 2_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Brown 2_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Brown 2_32.png"),
    },
    Dark: {
      1: () => require("../assets/character-creator/Hairs/Hair Black_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Black_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Black_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Black_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Black_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Black_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Black_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Black_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Black_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Black_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Black_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Black_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Black_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Black_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Black_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Black_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Black_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Black_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Black_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Black_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Black_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Black_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Black_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Black_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Black_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Black_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Black_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Black_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Black_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Black_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Black_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Black_32.png"),
    },
    Green: {
      1: () => require("../assets/character-creator/Hairs/Hair Green_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Green_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Green_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Green_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Green_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Green_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Green_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Green_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Green_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Green_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Green_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Green_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Green_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Green_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Green_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Green_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Green_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Green_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Green_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Green_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Green_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Green_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Green_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Green_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Green_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Green_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Green_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Green_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Green_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Green_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Green_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Green_32.png"),
    },
    LightBrown: {
      1: () => require("../assets/character-creator/Hairs/Hair Brown 3_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Brown 3_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Brown 3_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Brown 3_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Brown 3_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Brown 3_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Brown 3_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Brown 3_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Brown 3_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Brown 3_32.png"),
    },
    LightGreen: {
      1: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_1.png"),
      2: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_2.png"),
      3: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_3.png"),
      4: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_4.png"),
      5: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_5.png"),
      6: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_6.png"),
      7: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_7.png"),
      8: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_8.png"),
      9: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_9.png"),
      10: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_10.png"),
      11: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_11.png"),
      12: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_12.png"),
      13: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_13.png"),
      14: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_14.png"),
      15: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_15.png"),
      16: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_16.png"),
      17: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_17.png"),
      18: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_18.png"),
      19: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_19.png"),
      20: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_20.png"),
      21: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_21.png"),
      22: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_22.png"),
      23: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_23.png"),
      24: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_24.png"),
      25: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_25.png"),
      26: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_26.png"),
      27: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_27.png"),
      28: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_28.png"),
      29: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_29.png"),
      30: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_30.png"),
      31: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_31.png"),
      32: () =>
        require("../assets/character-creator/Hairs/Hair Light Green_32.png"),
    },
    Lilac: {
      1: () => require("../assets/character-creator/Hairs/Hair Lilac_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Lilac_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Lilac_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Lilac_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Lilac_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Lilac_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Lilac_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Lilac_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Lilac_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Lilac_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Lilac_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Lilac_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Lilac_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Lilac_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Lilac_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Lilac_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Lilac_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Lilac_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Lilac_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Lilac_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Lilac_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Lilac_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Lilac_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Lilac_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Lilac_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Lilac_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Lilac_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Lilac_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Lilac_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Lilac_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Lilac_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Lilac_32.png"),
    },
    Magenta: {
      1: () => require("../assets/character-creator/Hairs/Hair Magent_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Magent_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Magent_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Magent_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Magent_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Magent_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Magent_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Magent_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Magent_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Magent_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Magent_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Magent_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Magent_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Magent_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Magent_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Magent_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Magent_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Magent_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Magent_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Magent_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Magent_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Magent_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Magent_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Magent_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Magent_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Magent_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Magent_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Magent_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Magent_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Magent_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Magent_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Magent_32.png"),
    },
    Orange: {
      1: () => require("../assets/character-creator/Hairs/Hair Orange_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Orange_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Orange_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Orange_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Orange_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Orange_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Orange_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Orange_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Orange_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Orange_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Orange_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Orange_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Orange_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Orange_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Orange_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Orange_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Orange_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Orange_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Orange_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Orange_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Orange_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Orange_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Orange_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Orange_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Orange_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Orange_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Orange_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Orange_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Orange_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Orange_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Orange_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Orange_32.png"),
    },
    Pink: {
      1: () => require("../assets/character-creator/Hairs/Hair Pink_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Pink_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Pink_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Pink_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Pink_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Pink_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Pink_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Pink_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Pink_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Pink_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Pink_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Pink_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Pink_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Pink_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Pink_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Pink_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Pink_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Pink_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Pink_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Pink_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Pink_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Pink_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Pink_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Pink_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Pink_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Pink_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Pink_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Pink_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Pink_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Pink_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Pink_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Pink_32.png"),
    },
    Red: {
      1: () => require("../assets/character-creator/Hairs/Hair Red_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair Red_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair Red_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair Red_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair Red_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair Red_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair Red_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair Red_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair Red_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair Red_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair Red_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair Red_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair Red_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair Red_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair Red_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair Red_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair Red_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair Red_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair Red_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair Red_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair Red_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair Red_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair Red_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair Red_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair Red_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair Red_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair Red_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair Red_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair Red_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair Red_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair Red_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair Red_32.png"),
    },
    White: {
      1: () => require("../assets/character-creator/Hairs/Hair White_1.png"),
      2: () => require("../assets/character-creator/Hairs/Hair White_2.png"),
      3: () => require("../assets/character-creator/Hairs/Hair White_3.png"),
      4: () => require("../assets/character-creator/Hairs/Hair White_4.png"),
      5: () => require("../assets/character-creator/Hairs/Hair White_5.png"),
      6: () => require("../assets/character-creator/Hairs/Hair White_6.png"),
      7: () => require("../assets/character-creator/Hairs/Hair White_7.png"),
      8: () => require("../assets/character-creator/Hairs/Hair White_8.png"),
      9: () => require("../assets/character-creator/Hairs/Hair White_9.png"),
      10: () => require("../assets/character-creator/Hairs/Hair White_10.png"),
      11: () => require("../assets/character-creator/Hairs/Hair White_11.png"),
      12: () => require("../assets/character-creator/Hairs/Hair White_12.png"),
      13: () => require("../assets/character-creator/Hairs/Hair White_13.png"),
      14: () => require("../assets/character-creator/Hairs/Hair White_14.png"),
      15: () => require("../assets/character-creator/Hairs/Hair White_15.png"),
      16: () => require("../assets/character-creator/Hairs/Hair White_16.png"),
      17: () => require("../assets/character-creator/Hairs/Hair White_17.png"),
      18: () => require("../assets/character-creator/Hairs/Hair White_18.png"),
      19: () => require("../assets/character-creator/Hairs/Hair White_19.png"),
      20: () => require("../assets/character-creator/Hairs/Hair White_20.png"),
      21: () => require("../assets/character-creator/Hairs/Hair White_21.png"),
      22: () => require("../assets/character-creator/Hairs/Hair White_22.png"),
      23: () => require("../assets/character-creator/Hairs/Hair White_23.png"),
      24: () => require("../assets/character-creator/Hairs/Hair White_24.png"),
      25: () => require("../assets/character-creator/Hairs/Hair White_25.png"),
      26: () => require("../assets/character-creator/Hairs/Hair White_26.png"),
      27: () => require("../assets/character-creator/Hairs/Hair White_27.png"),
      28: () => require("../assets/character-creator/Hairs/Hair White_28.png"),
      29: () => require("../assets/character-creator/Hairs/Hair White_29.png"),
      30: () => require("../assets/character-creator/Hairs/Hair White_30.png"),
      31: () => require("../assets/character-creator/Hairs/Hair White_31.png"),
      32: () => require("../assets/character-creator/Hairs/Hair White_32.png"),
    },
  };

  // Default to Brown if color not found
  const colorMap = hairMap[colorKey] || hairMap["Brown"];

  // Return the hair asset, cycling if index > 32
  if (hairIndex > 32) {
    return colorMap[((hairIndex - 1) % 32) + 1]?.() || colorMap[1]();
  }
  return colorMap[hairIndex]?.() || colorMap[1]();
}

// Helper to get clothes asset
export function getClothesAsset(
  color: Color,
  index: number,
): ImageSourcePropType | null {
  if (index < 0) return null;
  const clothesIndex = index + 1;
  const colorKey = color.replace(/[\s-]+/g, "");

  const clothesMap: Record<
    string,
    Record<number, () => ImageSourcePropType>
  > = {
    Blonde: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Blonde_12.png"),
    },
    Brown: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Brown_12.png"),
    },
    Blue: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Blue_12.png"),
    },
    BlueGreen: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Blue-Green_12.png"),
    },
    Green: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Green_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Green_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Green_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Green_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Green_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Green_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Green_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Green_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Green_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Green_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Green_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Green_12.png"),
    },
    DarkBlue: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Dark Blue_12.png"),
    },
    Dark: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Dark_12.png"),
    },
    LightBrown: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Light Brown_12.png"),
    },
    LightGreen: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Light Green_12.png"),
    },
    Lilac: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Lilac_12.png"),
    },
    Magenta: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Magent_12.png"),
    },
    Orange: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Orange_12.png"),
    },
    Pink: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Pink_12.png"),
    },
    Red: {
      1: () => require("../assets/character-creator/Clothes/Clothes Red_1.png"),
      2: () => require("../assets/character-creator/Clothes/Clothes Red_2.png"),
      3: () => require("../assets/character-creator/Clothes/Clothes Red_3.png"),
      4: () => require("../assets/character-creator/Clothes/Clothes Red_4.png"),
      5: () => require("../assets/character-creator/Clothes/Clothes Red_5.png"),
      6: () => require("../assets/character-creator/Clothes/Clothes Red_6.png"),
      7: () => require("../assets/character-creator/Clothes/Clothes Red_7.png"),
      8: () => require("../assets/character-creator/Clothes/Clothes Red_8.png"),
      9: () => require("../assets/character-creator/Clothes/Clothes Red_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes Red_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes Red_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes Red_12.png"),
    },
    White: {
      1: () =>
        require("../assets/character-creator/Clothes/Clothes White_1.png"),
      2: () =>
        require("../assets/character-creator/Clothes/Clothes White_2.png"),
      3: () =>
        require("../assets/character-creator/Clothes/Clothes White_3.png"),
      4: () =>
        require("../assets/character-creator/Clothes/Clothes White_4.png"),
      5: () =>
        require("../assets/character-creator/Clothes/Clothes White_5.png"),
      6: () =>
        require("../assets/character-creator/Clothes/Clothes White_6.png"),
      7: () =>
        require("../assets/character-creator/Clothes/Clothes White_7.png"),
      8: () =>
        require("../assets/character-creator/Clothes/Clothes White_8.png"),
      9: () =>
        require("../assets/character-creator/Clothes/Clothes White_9.png"),
      10: () =>
        require("../assets/character-creator/Clothes/Clothes White_10.png"),
      11: () =>
        require("../assets/character-creator/Clothes/Clothes White_11.png"),
      12: () =>
        require("../assets/character-creator/Clothes/Clothes White_12.png"),
    },
  };

  const colorMap = clothesMap[colorKey] || clothesMap["Brown"];
  return colorMap[clothesIndex]?.() || colorMap[1]();
}

// Helper to get eyes asset
export function getEyesAsset(color: Color, index: number): ImageSourcePropType {
  const eyesIndex = index + 1;
  const colorKey = color.replace(/[\s-]+/g, "");

  const eyesMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require("../assets/character-creator/Eyes/Eyes Blonde_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Blonde_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Blonde_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Blonde_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Blonde_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Blonde_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Blonde_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Blonde_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Blonde_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Blonde_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Blonde_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Blonde_12.png"),
    },
    Brown: {
      1: () => require("../assets/character-creator/Eyes/Eyes Brown_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Brown_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Brown_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Brown_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Brown_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Brown_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Brown_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Brown_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Brown_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Brown_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Brown_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Brown_12.png"),
    },
    Blue: {
      1: () => require("../assets/character-creator/Eyes/Eyes Blue_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Blue_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Blue_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Blue_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Blue_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Blue_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Blue_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Blue_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Blue_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Blue_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Blue_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Blue_12.png"),
    },
    BlueGreen: {
      1: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_1.png"),
      2: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_2.png"),
      3: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_3.png"),
      4: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_4.png"),
      5: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_5.png"),
      6: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_6.png"),
      7: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_7.png"),
      8: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_8.png"),
      9: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_9.png"),
      10: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_10.png"),
      11: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_11.png"),
      12: () =>
        require("../assets/character-creator/Eyes/Eyes Blue-Green_12.png"),
    },
    DarkBlue: {
      1: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Dark Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Blue_12.png"),
    },
    DarkBrown: {
      1: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Eyes/Eyes Dark Brown_12.png"),
    },
    Dark: {
      1: () => require("../assets/character-creator/Eyes/Eyes Dark_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Dark_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Dark_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Dark_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Dark_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Dark_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Dark_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Dark_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Dark_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Dark_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Dark_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Dark_12.png"),
    },
    Green: {
      1: () => require("../assets/character-creator/Eyes/Eyes Green_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Green_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Green_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Green_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Green_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Green_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Green_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Green_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Green_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Green_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Green_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Green_12.png"),
    },
    LightBrown: {
      1: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_5.png"),

      6: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Eyes/Eyes Light Brown_12.png"),
    },
    LightGreen: {
      1: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_1.png"),
      2: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_2.png"),
      3: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_3.png"),
      4: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_4.png"),
      5: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_5.png"),
      6: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_6.png"),
      7: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_7.png"),
      8: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_8.png"),
      9: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_9.png"),
      10: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_10.png"),
      11: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_11.png"),
      12: () =>
        require("../assets/character-creator/Eyes/Eyes Light Green_12.png"),
    },
    Lilac: {
      1: () => require("../assets/character-creator/Eyes/Eyes Lilac_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Lilac_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Lilac_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Lilac_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Lilac_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Lilac_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Lilac_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Lilac_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Lilac_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Lilac_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Lilac_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Lilac_12.png"),
    },
    Magenta: {
      1: () => require("../assets/character-creator/Eyes/Eyes Magent_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Magent_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Magent_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Magent_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Magent_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Magent_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Magent_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Magent_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Magent_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Magent_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Magent_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Magent_12.png"),
    },
    Orange: {
      1: () => require("../assets/character-creator/Eyes/Eyes Orange_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Orange_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Orange_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Orange_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Orange_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Orange_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Orange_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Orange_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Orange_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Orange_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Orange_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Orange_12.png"),
    },
    Pink: {
      1: () => require("../assets/character-creator/Eyes/Eyes Pink_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Pink_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Pink_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Pink_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Pink_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Pink_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Pink_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Pink_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Pink_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Pink_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Pink_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Pink_12.png"),
    },
    Red: {
      1: () => require("../assets/character-creator/Eyes/Eyes Red_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes Red_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes Red_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes Red_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes Red_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes Red_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes Red_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes Red_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes Red_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes Red_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes Red_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes Red_12.png"),
    },
    White: {
      1: () => require("../assets/character-creator/Eyes/Eyes White_1.png"),
      2: () => require("../assets/character-creator/Eyes/Eyes White_2.png"),
      3: () => require("../assets/character-creator/Eyes/Eyes White_3.png"),
      4: () => require("../assets/character-creator/Eyes/Eyes White_4.png"),
      5: () => require("../assets/character-creator/Eyes/Eyes White_5.png"),
      6: () => require("../assets/character-creator/Eyes/Eyes White_6.png"),
      7: () => require("../assets/character-creator/Eyes/Eyes White_7.png"),
      8: () => require("../assets/character-creator/Eyes/Eyes White_8.png"),
      9: () => require("../assets/character-creator/Eyes/Eyes White_9.png"),
      10: () => require("../assets/character-creator/Eyes/Eyes White_10.png"),
      11: () => require("../assets/character-creator/Eyes/Eyes White_11.png"),
      12: () => require("../assets/character-creator/Eyes/Eyes White_12.png"),
    },
  };

  const colorMap = eyesMap[colorKey] || eyesMap["Brown"];
  return colorMap[eyesIndex]?.() || colorMap[1]();
}

// Helper to get eyebrows asset
export function getEyebrowsAsset(
  color: Color,
  index: number,
): ImageSourcePropType {
  const eyebrowsIndex = index + 1;
  const colorKey = color.replace(/[\s-]+/g, "");

  const eyebrowsMap: Record<
    string,
    Record<number, () => ImageSourcePropType>
  > = {
    Blonde: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blonde_12.png"),
    },
    Brown: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Brown_12.png"),
    },
    Blue: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue_12.png"),
    },
    BlueGreen: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Blue-Green_12.png"),
    },
    DarkBlue: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Blue_12.png"),
    },
    DarkBrown: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark Brown_12.png"),
    },
    Dark: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Dark_12.png"),
    },
    Green: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Green_12.png"),
    },
    LightBrown: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Brown_12.png"),
    },
    LightGreen: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Light Green_12.png"),
    },
    Lilac: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Lilac_12.png"),
    },

    Magenta: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Magent_12.png"),
    },
    Orange: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Orange_12.png"),
    },
    Pink: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Pink_12.png"),
    },
    Red: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows Red_12.png"),
    },
    White: {
      1: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_1.png"),
      2: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_2.png"),
      3: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_3.png"),
      4: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_4.png"),
      5: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_5.png"),
      6: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_6.png"),
      7: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_7.png"),
      8: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_8.png"),
      9: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_9.png"),
      10: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_10.png"),
      11: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_11.png"),
      12: () =>
        require("../assets/character-creator/Eyebrows/Eyebrows White_12.png"),
    },
  };

  const colorMap = eyebrowsMap[colorKey] || eyebrowsMap["Brown"];
  return colorMap[eyebrowsIndex]?.() || colorMap[1]();
}

// Helper to get mouth asset
export function getMouthAsset(index: number): ImageSourcePropType {
  const mouthIndex = index + 1;

  const mouthMap: Record<number, () => ImageSourcePropType> = {
    1: () => require("../assets/character-creator/Mouths/Mouth_1.png"),
    2: () => require("../assets/character-creator/Mouths/Mouth_2.png"),
    3: () => require("../assets/character-creator/Mouths/Mouth_3.png"),
    4: () => require("../assets/character-creator/Mouths/Mouth_4.png"),
    5: () => require("../assets/character-creator/Mouths/Mouth_5.png"),
    6: () => require("../assets/character-creator/Mouths/Mouth_6.png"),
    7: () => require("../assets/character-creator/Mouths/Mouth_7.png"),
    8: () => require("../assets/character-creator/Mouths/Mouth_8.png"),
    9: () => require("../assets/character-creator/Mouths/Mouth_9.png"),
    10: () => require("../assets/character-creator/Mouths/Mouth_10.png"),
    11: () => require("../assets/character-creator/Mouths/Mouth_11.png"),
    12: () => require("../assets/character-creator/Mouths/Mouth_12.png"),
  };

  return mouthMap[mouthIndex]?.() || mouthMap[1]();
}

// Export counts
export {
  BASE_COUNT,
  BG_COUNT,
  HAIR_COUNT,
  CLOTHES_COUNT,
  EYES_COUNT,
  EYEBROWS_COUNT,
  MOUTH_COUNT,
};
