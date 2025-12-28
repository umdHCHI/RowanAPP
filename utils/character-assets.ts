import { ImageSourcePropType } from 'react-native'

// Color options available for hair, eyes, eyebrows, clothes, and backgrounds
export const COLORS = [
  'Blonde',
  'Blue',
  'Blue-Green',
  'Brown',
  'Dark Blue',
  'Dark Brown',
  'Dark',
  'Green',
  'Light Brown',
  'Light Green',
  'Lilac',
  'Magent',
  'Orange',
  'Pink',
  'Red',
  'White',
] as const

export type Color = typeof COLORS[number]

// Base options (1-21)
const BASE_COUNT = 21

// Background options per color (1-12)
const BG_COUNT = 12

// Hair options per color (1-32)
const HAIR_COUNT = 32

// Clothes options per color (1-12)
const CLOTHES_COUNT = 12

// Eyes options per color (1-12)
const EYES_COUNT = 12

// Eyebrows options per color (1-12)
const EYEBROWS_COUNT = 12

// Mouth options (1-12)
const MOUTH_COUNT = 12

// Helper to get base asset
export function getBaseAsset(index: number): ImageSourcePropType {
  const baseIndex = index + 1
  const baseMap: Record<number, () => ImageSourcePropType> = {
    1: () => require('../assets/character-creator/Bases/base_main/base_1.png'),
    2: () => require('../assets/character-creator/Bases/base_main/base_2.png'),
    3: () => require('../assets/character-creator/Bases/base_main/base_3.png'),
    4: () => require('../assets/character-creator/Bases/base_main/base_4.png'),
    5: () => require('../assets/character-creator/Bases/base_main/base_5.png'),
    6: () => require('../assets/character-creator/Bases/base_main/base_6.png'),
    7: () => require('../assets/character-creator/Bases/base_main/base_7.png'),
    8: () => require('../assets/character-creator/Bases/base_main/base_8.png'),
    9: () => require('../assets/character-creator/Bases/base_main/base_9.png'),
    10: () => require('../assets/character-creator/Bases/base_main/base_10.png'),
    11: () => require('../assets/character-creator/Bases/base_main/base_11.png'),
    12: () => require('../assets/character-creator/Bases/base_main/base_12.png'),
    13: () => require('../assets/character-creator/Bases/base_main/base_one.png'),
    14: () => require('../assets/character-creator/Bases/base_main/base_two.png'),
    15: () => require('../assets/character-creator/Bases/base_main/base_three.png'),
    16: () => require('../assets/character-creator/Bases/base_main/base_four.png'),
    17: () => require('../assets/character-creator/Bases/base_main/base_five.png'),
    18: () => require('../assets/character-creator/Bases/base_main/base_six.png'),
    19: () => require('../assets/character-creator/Bases/base_main/base_seven.png'),
    20: () => require('../assets/character-creator/Bases/base_main/base_eight.png'),
    21: () => require('../assets/character-creator/Bases/base_main/base_nine.png'),
  }
  return baseMap[baseIndex]?.() || baseMap[1]()
}

// Helper to get background asset
export function getBackgroundAsset(color: Color, index: number): ImageSourcePropType {
  const bgIndex = index + 1
  const colorKey = color.replace(/\s+/g, '')
  
  const bgMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require('../assets/character-creator/BGs/Blonde_1.png'),
      2: () => require('../assets/character-creator/BGs/Blonde_2.png'),
      3: () => require('../assets/character-creator/BGs/Blonde_3.png'),
      4: () => require('../assets/character-creator/BGs/Blonde_4.png'),
      5: () => require('../assets/character-creator/BGs/Blonde_5.png'),
      6: () => require('../assets/character-creator/BGs/Blonde_6.png'),
      7: () => require('../assets/character-creator/BGs/Blonde_7.png'),
      8: () => require('../assets/character-creator/BGs/Blonde_8.png'),
      9: () => require('../assets/character-creator/BGs/Blonde_9.png'),
      10: () => require('../assets/character-creator/BGs/Blonde_10.png'),
      11: () => require('../assets/character-creator/BGs/Blonde_11.png'),
      12: () => require('../assets/character-creator/BGs/Blonde_12.png'),
    },
    Blue: {
      1: () => require('../assets/character-creator/BGs/Blue_1.png'),
      2: () => require('../assets/character-creator/BGs/Blue_2.png'),
      3: () => require('../assets/character-creator/BGs/Blue_3.png'),
      4: () => require('../assets/character-creator/BGs/Blue_4.png'),
      5: () => require('../assets/character-creator/BGs/Blue_5.png'),
      6: () => require('../assets/character-creator/BGs/Blue_6.png'),
      7: () => require('../assets/character-creator/BGs/Blue_7.png'),
      8: () => require('../assets/character-creator/BGs/Blue_8.png'),
      9: () => require('../assets/character-creator/BGs/Blue_9.png'),
      10: () => require('../assets/character-creator/BGs/Blue_10.png'),
      11: () => require('../assets/character-creator/BGs/Blue_11.png'),
      12: () => require('../assets/character-creator/BGs/Blue_12.png'),
    },
    'Blue-Green': {
      1: () => require('../assets/character-creator/BGs/Blue-Green_1.png'),
      2: () => require('../assets/character-creator/BGs/Blue-Green_2.png'),
      3: () => require('../assets/character-creator/BGs/Blue-Green_3.png'),
      4: () => require('../assets/character-creator/BGs/Blue-Green_4.png'),
      5: () => require('../assets/character-creator/BGs/Blue-Green_5.png'),
      6: () => require('../assets/character-creator/BGs/Blue-Green_6.png'),
      7: () => require('../assets/character-creator/BGs/Blue-Green_7.png'),
      8: () => require('../assets/character-creator/BGs/Blue-Green_8.png'),
      9: () => require('../assets/character-creator/BGs/Blue-Green_9.png'),
      10: () => require('../assets/character-creator/BGs/Blue-Green_10.png'),
      11: () => require('../assets/character-creator/BGs/Blue-Green_11.png'),
      12: () => require('../assets/character-creator/BGs/Blue-Green_12.png'),
    },
    Brown: {
      1: () => require('../assets/character-creator/BGs/Brown_1.png'),
      2: () => require('../assets/character-creator/BGs/Brown_2.png'),
      3: () => require('../assets/character-creator/BGs/Brown_3.png'),
      4: () => require('../assets/character-creator/BGs/Brown_4.png'),
      5: () => require('../assets/character-creator/BGs/Brown_5.png'),
      6: () => require('../assets/character-creator/BGs/Brown_6.png'),
      7: () => require('../assets/character-creator/BGs/Brown_7.png'),
      8: () => require('../assets/character-creator/BGs/Brown_8.png'),
      9: () => require('../assets/character-creator/BGs/Brown_9.png'),
      10: () => require('../assets/character-creator/BGs/Brown_10.png'),
      11: () => require('../assets/character-creator/BGs/Brown_11.png'),
      12: () => require('../assets/character-creator/BGs/Brown_12.png'),
    },
    'DarkBlue': {
      1: () => require('../assets/character-creator/BGs/Dark Blue_1.png'),
      2: () => require('../assets/character-creator/BGs/Dark Blue_2.png'),
      3: () => require('../assets/character-creator/BGs/Dark Blue_3.png'),
      4: () => require('../assets/character-creator/BGs/Dark Blue_4.png'),
      5: () => require('../assets/character-creator/BGs/Dark Blue_5.png'),
      6: () => require('../assets/character-creator/BGs/Dark Blue_6.png'),
      7: () => require('../assets/character-creator/BGs/Dark Blue_7.png'),
      8: () => require('../assets/character-creator/BGs/Dark Blue_8.png'),
      9: () => require('../assets/character-creator/BGs/Dark Blue_9.png'),
      10: () => require('../assets/character-creator/BGs/Dark Blue_10.png'),
      11: () => require('../assets/character-creator/BGs/Dark Blue_11.png'),
      12: () => require('../assets/character-creator/BGs/Dark Blue_12.png'),
    },
    'DarkBrown': {
      1: () => require('../assets/character-creator/BGs/Dark Brown_1.png'),
      2: () => require('../assets/character-creator/BGs/Dark Brown_2.png'),
      3: () => require('../assets/character-creator/BGs/Dark Brown_3.png'),
      4: () => require('../assets/character-creator/BGs/Dark Brown_4.png'),
      5: () => require('../assets/character-creator/BGs/Dark Brown_5.png'),
      6: () => require('../assets/character-creator/BGs/Dark Brown_6.png'),
      7: () => require('../assets/character-creator/BGs/Dark Brown_7.png'),
      8: () => require('../assets/character-creator/BGs/Dark Brown_8.png'),
      9: () => require('../assets/character-creator/BGs/Dark Brown_9.png'),
      10: () => require('../assets/character-creator/BGs/Dark Brown_10.png'),
      11: () => require('../assets/character-creator/BGs/Dark Brown_11.png'),
      12: () => require('../assets/character-creator/BGs/Dark Brown_12.png'),
    },
    Dark: {
      1: () => require('../assets/character-creator/BGs/Dark_1.png'),
      2: () => require('../assets/character-creator/BGs/Dark_2.png'),
      3: () => require('../assets/character-creator/BGs/Dark_3.png'),
      4: () => require('../assets/character-creator/BGs/Dark_4.png'),
      5: () => require('../assets/character-creator/BGs/Dark_5.png'),
      6: () => require('../assets/character-creator/BGs/Dark_6.png'),
      7: () => require('../assets/character-creator/BGs/Dark_7.png'),
      8: () => require('../assets/character-creator/BGs/Dark_8.png'),
      9: () => require('../assets/character-creator/BGs/Dark_9.png'),
      10: () => require('../assets/character-creator/BGs/Dark_10.png'),
      11: () => require('../assets/character-creator/BGs/Dark_11.png'),
      12: () => require('../assets/character-creator/BGs/Dark_12.png'),
    },
    Green: {
      1: () => require('../assets/character-creator/BGs/Green_1.png'),
      2: () => require('../assets/character-creator/BGs/Green_2.png'),
      3: () => require('../assets/character-creator/BGs/Green_3.png'),
      4: () => require('../assets/character-creator/BGs/Green_4.png'),
      5: () => require('../assets/character-creator/BGs/Green_5.png'),
      6: () => require('../assets/character-creator/BGs/Green_6.png'),
      7: () => require('../assets/character-creator/BGs/Green_7.png'),
      8: () => require('../assets/character-creator/BGs/Green_8.png'),
      9: () => require('../assets/character-creator/BGs/Green_9.png'),
      10: () => require('../assets/character-creator/BGs/Green_10.png'),
      11: () => require('../assets/character-creator/BGs/Green_11.png'),
      12: () => require('../assets/character-creator/BGs/Green_12.png'),
    },
    'LightBrown': {
      1: () => require('../assets/character-creator/BGs/Light Brown_1.png'),
      2: () => require('../assets/character-creator/BGs/Light Brown_2.png'),
      3: () => require('../assets/character-creator/BGs/Light Brown_3.png'),
      4: () => require('../assets/character-creator/BGs/Light Brown_4.png'),
      5: () => require('../assets/character-creator/BGs/Light Brown_5.png'),
      6: () => require('../assets/character-creator/BGs/Light Brown_6.png'),
      7: () => require('../assets/character-creator/BGs/Light Brown_7.png'),
      8: () => require('../assets/character-creator/BGs/Light Brown_8.png'),
      9: () => require('../assets/character-creator/BGs/Light Brown_9.png'),
      10: () => require('../assets/character-creator/BGs/Light Brown_10.png'),
      11: () => require('../assets/character-creator/BGs/Light Brown_11.png'),
      12: () => require('../assets/character-creator/BGs/Light Brown_12.png'),
    },
    'LightGreen': {
      1: () => require('../assets/character-creator/BGs/Light Green_1.png'),
      2: () => require('../assets/character-creator/BGs/Light Green_2.png'),
      3: () => require('../assets/character-creator/BGs/Light Green_3.png'),
      4: () => require('../assets/character-creator/BGs/Light Green_4.png'),
      5: () => require('../assets/character-creator/BGs/Light Green_5.png'),
      6: () => require('../assets/character-creator/BGs/Light Green_6.png'),
      7: () => require('../assets/character-creator/BGs/Light Green_7.png'),
      8: () => require('../assets/character-creator/BGs/Light Green_8.png'),
      9: () => require('../assets/character-creator/BGs/Light Green_9.png'),
      10: () => require('../assets/character-creator/BGs/Light Green_10.png'),
      11: () => require('../assets/character-creator/BGs/Light Green_11.png'),
      12: () => require('../assets/character-creator/BGs/Light Green_12.png'),
    },
    Lilac: {
      1: () => require('../assets/character-creator/BGs/Lilac_1.png'),
      2: () => require('../assets/character-creator/BGs/Lilac_2.png'),
      3: () => require('../assets/character-creator/BGs/Lilac_3.png'),
      4: () => require('../assets/character-creator/BGs/Lilac_4.png'),
      5: () => require('../assets/character-creator/BGs/Lilac_5.png'),
      6: () => require('../assets/character-creator/BGs/Lilac_6.png'),
      7: () => require('../assets/character-creator/BGs/Lilac_7.png'),
      8: () => require('../assets/character-creator/BGs/Lilac_8.png'),
      9: () => require('../assets/character-creator/BGs/Lilac_9.png'),
      10: () => require('../assets/character-creator/BGs/Lilac_10.png'),
      11: () => require('../assets/character-creator/BGs/Lilac_11.png'),
      12: () => require('../assets/character-creator/BGs/Lilac_12.png'),
    },
    Magent: {
      1: () => require('../assets/character-creator/BGs/Magent_1.png'),
      2: () => require('../assets/character-creator/BGs/Magent_2.png'),
      3: () => require('../assets/character-creator/BGs/Magent_3.png'),
      4: () => require('../assets/character-creator/BGs/Magent_4.png'),
      5: () => require('../assets/character-creator/BGs/Magent_5.png'),
      6: () => require('../assets/character-creator/BGs/Magent_6.png'),
      7: () => require('../assets/character-creator/BGs/Magent_7.png'),
      8: () => require('../assets/character-creator/BGs/Magent_8.png'),
      9: () => require('../assets/character-creator/BGs/Magent_9.png'),
      10: () => require('../assets/character-creator/BGs/Magent_10.png'),
      11: () => require('../assets/character-creator/BGs/Magent_11.png'),
      12: () => require('../assets/character-creator/BGs/Magent_12.png'),
    },
    Orange: {
      1: () => require('../assets/character-creator/BGs/Orange_1.png'),
      2: () => require('../assets/character-creator/BGs/Orange_2.png'),
      3: () => require('../assets/character-creator/BGs/Orange_3.png'),
      4: () => require('../assets/character-creator/BGs/Orange_4.png'),
      5: () => require('../assets/character-creator/BGs/Orange_5.png'),
      6: () => require('../assets/character-creator/BGs/Orange_6.png'),
      7: () => require('../assets/character-creator/BGs/Orange_7.png'),
      8: () => require('../assets/character-creator/BGs/Orange_8.png'),
      9: () => require('../assets/character-creator/BGs/Orange_9.png'),
      10: () => require('../assets/character-creator/BGs/Orange_10.png'),
      11: () => require('../assets/character-creator/BGs/Orange_11.png'),
      12: () => require('../assets/character-creator/BGs/Orange_12.png'),
    },
    Pink: {
      1: () => require('../assets/character-creator/BGs/Pink_1.png'),
      2: () => require('../assets/character-creator/BGs/Pink_2.png'),
      3: () => require('../assets/character-creator/BGs/Pink_3.png'),
      4: () => require('../assets/character-creator/BGs/Pink_4.png'),
      5: () => require('../assets/character-creator/BGs/Pink_5.png'),
      6: () => require('../assets/character-creator/BGs/Pink_6.png'),
      7: () => require('../assets/character-creator/BGs/Pink_7.png'),
      8: () => require('../assets/character-creator/BGs/Pink_8.png'),
      9: () => require('../assets/character-creator/BGs/Pink_9.png'),
      10: () => require('../assets/character-creator/BGs/Pink_10.png'),
      11: () => require('../assets/character-creator/BGs/Pink_11.png'),
      12: () => require('../assets/character-creator/BGs/Pink_12.png'),
    },
    Red: {
      1: () => require('../assets/character-creator/BGs/Red_1.png'),
      2: () => require('../assets/character-creator/BGs/Red_2.png'),
      3: () => require('../assets/character-creator/BGs/Red_3.png'),
      4: () => require('../assets/character-creator/BGs/Red_4.png'),
      5: () => require('../assets/character-creator/BGs/Red_5.png'),
      6: () => require('../assets/character-creator/BGs/Red_6.png'),
      7: () => require('../assets/character-creator/BGs/Red_7.png'),
      8: () => require('../assets/character-creator/BGs/Red_8.png'),
      9: () => require('../assets/character-creator/BGs/Red_9.png'),
      10: () => require('../assets/character-creator/BGs/Red_10.png'),
      11: () => require('../assets/character-creator/BGs/Red_11.png'),
      12: () => require('../assets/character-creator/BGs/Red_12.png'),
    },
    White: {
      1: () => require('../assets/character-creator/BGs/White_1.png'),
      2: () => require('../assets/character-creator/BGs/White_2.png'),
      3: () => require('../assets/character-creator/BGs/White_3.png'),
      4: () => require('../assets/character-creator/BGs/White_4.png'),
      5: () => require('../assets/character-creator/BGs/White_5.png'),
      6: () => require('../assets/character-creator/BGs/White_6.png'),
      7: () => require('../assets/character-creator/BGs/White_7.png'),
      8: () => require('../assets/character-creator/BGs/White_8.png'),
      9: () => require('../assets/character-creator/BGs/White_9.png'),
      10: () => require('../assets/character-creator/BGs/White_10.png'),
      11: () => require('../assets/character-creator/BGs/White_11.png'),
      12: () => require('../assets/character-creator/BGs/White_12.png'),
    },
  }
  
  const colorMap = bgMap[colorKey] || bgMap['Brown']
  return colorMap[bgIndex]?.() || colorMap[1]()
}

// Helper to get hair asset - simplified to use first few options
export function getHairAsset(color: Color, index: number): ImageSourcePropType | null {
  if (index < 0) return null
  const hairIndex = index + 1
  const colorKey = color.replace(/\s+/g, '')
  
  // Create a simplified map for the most common hair styles (1-12)
  // For a full implementation, you'd need to map all 32 styles
  const hairMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require('../assets/character-creator/Hairs/Hair Blonde_1.png'),
      2: () => require('../assets/character-creator/Hairs/Hair Blonde_2.png'),
      3: () => require('../assets/character-creator/Hairs/Hair Blonde_3.png'),
      4: () => require('../assets/character-creator/Hairs/Hair Blonde_4.png'),
      5: () => require('../assets/character-creator/Hairs/Hair Blonde_5.png'),
      6: () => require('../assets/character-creator/Hairs/Hair Blonde_6.png'),
      7: () => require('../assets/character-creator/Hairs/Hair Blonde_7.png'),
      8: () => require('../assets/character-creator/Hairs/Hair Blonde_8.png'),
      9: () => require('../assets/character-creator/Hairs/Hair Blonde_9.png'),
      10: () => require('../assets/character-creator/Hairs/Hair Blonde_10.png'),
      11: () => require('../assets/character-creator/Hairs/Hair Blonde_11.png'),
      12: () => require('../assets/character-creator/Hairs/Hair Blonde_12.png'),
    },
    Brown: {
      1: () => require('../assets/character-creator/Hairs/Hair Brown 1_1.png'),
      2: () => require('../assets/character-creator/Hairs/Hair Brown 1_2.png'),
      3: () => require('../assets/character-creator/Hairs/Hair Brown 1_3.png'),
      4: () => require('../assets/character-creator/Hairs/Hair Brown 1_4.png'),
      5: () => require('../assets/character-creator/Hairs/Hair Brown 1_5.png'),
      6: () => require('../assets/character-creator/Hairs/Hair Brown 1_6.png'),
      7: () => require('../assets/character-creator/Hairs/Hair Brown 1_7.png'),
      8: () => require('../assets/character-creator/Hairs/Hair Brown 1_8.png'),
      9: () => require('../assets/character-creator/Hairs/Hair Brown 1_9.png'),
      10: () => require('../assets/character-creator/Hairs/Hair Brown 1_10.png'),
      11: () => require('../assets/character-creator/Hairs/Hair Brown 1_11.png'),
      12: () => require('../assets/character-creator/Hairs/Hair Brown 1_12.png'),
    },
    Black: {
      1: () => require('../assets/character-creator/Hairs/Hair Black_1.png'),
      2: () => require('../assets/character-creator/Hairs/Hair Black_2.png'),
      3: () => require('../assets/character-creator/Hairs/Hair Black_3.png'),
      4: () => require('../assets/character-creator/Hairs/Hair Black_4.png'),
      5: () => require('../assets/character-creator/Hairs/Hair Black_5.png'),
      6: () => require('../assets/character-creator/Hairs/Hair Black_6.png'),
      7: () => require('../assets/character-creator/Hairs/Hair Black_7.png'),
      8: () => require('../assets/character-creator/Hairs/Hair Black_8.png'),
      9: () => require('../assets/character-creator/Hairs/Hair Black_9.png'),
      10: () => require('../assets/character-creator/Hairs/Hair Black_10.png'),
      11: () => require('../assets/character-creator/Hairs/Hair Black_11.png'),
      12: () => require('../assets/character-creator/Hairs/Hair Black_12.png'),
    },
  }
  
  // Default to Brown if color not found
  const colorMap = hairMap[colorKey] || hairMap['Brown']
  if (hairIndex > 12) {
    // For indices > 12, cycle back
    return colorMap[((hairIndex - 1) % 12) + 1]?.() || colorMap[1]()
  }
  return colorMap[hairIndex]?.() || colorMap[1]()
}

// Helper to get clothes asset
export function getClothesAsset(color: Color, index: number): ImageSourcePropType | null {
  if (index < 0) return null
  const clothesIndex = index + 1
  const colorKey = color.replace(/\s+/g, '')
  
  const clothesMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require('../assets/character-creator/Clothes/Clothes Blonde_1.png'),
      2: () => require('../assets/character-creator/Clothes/Clothes Blonde_2.png'),
      3: () => require('../assets/character-creator/Clothes/Clothes Blonde_3.png'),
      4: () => require('../assets/character-creator/Clothes/Clothes Blonde_4.png'),
      5: () => require('../assets/character-creator/Clothes/Clothes Blonde_5.png'),
      6: () => require('../assets/character-creator/Clothes/Clothes Blonde_6.png'),
      7: () => require('../assets/character-creator/Clothes/Clothes Blonde_7.png'),
      8: () => require('../assets/character-creator/Clothes/Clothes Blonde_8.png'),
      9: () => require('../assets/character-creator/Clothes/Clothes Blonde_9.png'),
      10: () => require('../assets/character-creator/Clothes/Clothes Blonde_10.png'),
      11: () => require('../assets/character-creator/Clothes/Clothes Blonde_11.png'),
      12: () => require('../assets/character-creator/Clothes/Clothes Blonde_12.png'),
    },
    Brown: {
      1: () => require('../assets/character-creator/Clothes/Clothes Brown_1.png'),
      2: () => require('../assets/character-creator/Clothes/Clothes Brown_2.png'),
      3: () => require('../assets/character-creator/Clothes/Clothes Brown_3.png'),
      4: () => require('../assets/character-creator/Clothes/Clothes Brown_4.png'),
      5: () => require('../assets/character-creator/Clothes/Clothes Brown_5.png'),
      6: () => require('../assets/character-creator/Clothes/Clothes Brown_6.png'),
      7: () => require('../assets/character-creator/Clothes/Clothes Brown_7.png'),
      8: () => require('../assets/character-creator/Clothes/Clothes Brown_8.png'),
      9: () => require('../assets/character-creator/Clothes/Clothes Brown_9.png'),
      10: () => require('../assets/character-creator/Clothes/Clothes Brown_10.png'),
      11: () => require('../assets/character-creator/Clothes/Clothes Brown_11.png'),
      12: () => require('../assets/character-creator/Clothes/Clothes Brown_12.png'),
    },
    Blue: {
      1: () => require('../assets/character-creator/Clothes/Clothes Blue_1.png'),
      2: () => require('../assets/character-creator/Clothes/Clothes Blue_2.png'),
      3: () => require('../assets/character-creator/Clothes/Clothes Blue_3.png'),
      4: () => require('../assets/character-creator/Clothes/Clothes Blue_4.png'),
      5: () => require('../assets/character-creator/Clothes/Clothes Blue_5.png'),
      6: () => require('../assets/character-creator/Clothes/Clothes Blue_6.png'),
      7: () => require('../assets/character-creator/Clothes/Clothes Blue_7.png'),
      8: () => require('../assets/character-creator/Clothes/Clothes Blue_8.png'),
      9: () => require('../assets/character-creator/Clothes/Clothes Blue_9.png'),
      10: () => require('../assets/character-creator/Clothes/Clothes Blue_10.png'),
      11: () => require('../assets/character-creator/Clothes/Clothes Blue_11.png'),
      12: () => require('../assets/character-creator/Clothes/Clothes Blue_12.png'),
    },
  }
  
  const colorMap = clothesMap[colorKey] || clothesMap['Brown']
  return colorMap[clothesIndex]?.() || colorMap[1]()
}

// Helper to get eyes asset
export function getEyesAsset(color: Color, index: number): ImageSourcePropType {
  const eyesIndex = index + 1
  const colorKey = color.replace(/\s+/g, '')
  
  const eyesMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require('../assets/character-creator/Eyes/Eyes Blonde_1.png'),
      2: () => require('../assets/character-creator/Eyes/Eyes Blonde_2.png'),
      3: () => require('../assets/character-creator/Eyes/Eyes Blonde_3.png'),
      4: () => require('../assets/character-creator/Eyes/Eyes Blonde_4.png'),
      5: () => require('../assets/character-creator/Eyes/Eyes Blonde_5.png'),
      6: () => require('../assets/character-creator/Eyes/Eyes Blonde_6.png'),
      7: () => require('../assets/character-creator/Eyes/Eyes Blonde_7.png'),
      8: () => require('../assets/character-creator/Eyes/Eyes Blonde_8.png'),
      9: () => require('../assets/character-creator/Eyes/Eyes Blonde_9.png'),
      10: () => require('../assets/character-creator/Eyes/Eyes Blonde_10.png'),
      11: () => require('../assets/character-creator/Eyes/Eyes Blonde_11.png'),
      12: () => require('../assets/character-creator/Eyes/Eyes Blonde_12.png'),
    },
    Brown: {
      1: () => require('../assets/character-creator/Eyes/Eyes Brown_1.png'),
      2: () => require('../assets/character-creator/Eyes/Eyes Brown_2.png'),
      3: () => require('../assets/character-creator/Eyes/Eyes Brown_3.png'),
      4: () => require('../assets/character-creator/Eyes/Eyes Brown_4.png'),
      5: () => require('../assets/character-creator/Eyes/Eyes Brown_5.png'),
      6: () => require('../assets/character-creator/Eyes/Eyes Brown_6.png'),
      7: () => require('../assets/character-creator/Eyes/Eyes Brown_7.png'),
      8: () => require('../assets/character-creator/Eyes/Eyes Brown_8.png'),
      9: () => require('../assets/character-creator/Eyes/Eyes Brown_9.png'),
      10: () => require('../assets/character-creator/Eyes/Eyes Brown_10.png'),
      11: () => require('../assets/character-creator/Eyes/Eyes Brown_11.png'),
      12: () => require('../assets/character-creator/Eyes/Eyes Brown_12.png'),
    },
    Blue: {
      1: () => require('../assets/character-creator/Eyes/Eyes Blue_1.png'),
      2: () => require('../assets/character-creator/Eyes/Eyes Blue_2.png'),
      3: () => require('../assets/character-creator/Eyes/Eyes Blue_3.png'),
      4: () => require('../assets/character-creator/Eyes/Eyes Blue_4.png'),
      5: () => require('../assets/character-creator/Eyes/Eyes Blue_5.png'),
      6: () => require('../assets/character-creator/Eyes/Eyes Blue_6.png'),
      7: () => require('../assets/character-creator/Eyes/Eyes Blue_7.png'),
      8: () => require('../assets/character-creator/Eyes/Eyes Blue_8.png'),
      9: () => require('../assets/character-creator/Eyes/Eyes Blue_9.png'),
      10: () => require('../assets/character-creator/Eyes/Eyes Blue_10.png'),
      11: () => require('../assets/character-creator/Eyes/Eyes Blue_11.png'),
      12: () => require('../assets/character-creator/Eyes/Eyes Blue_12.png'),
    },
  }
  
  const colorMap = eyesMap[colorKey] || eyesMap['Brown']
  return colorMap[eyesIndex]?.() || colorMap[1]()
}

// Helper to get eyebrows asset
export function getEyebrowsAsset(color: Color, index: number): ImageSourcePropType {
  const eyebrowsIndex = index + 1
  const colorKey = color.replace(/\s+/g, '')
  
  const eyebrowsMap: Record<string, Record<number, () => ImageSourcePropType>> = {
    Blonde: {
      1: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_1.png'),
      2: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_2.png'),
      3: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_3.png'),
      4: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_4.png'),
      5: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_5.png'),
      6: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_6.png'),
      7: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_7.png'),
      8: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_8.png'),
      9: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_9.png'),
      10: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_10.png'),
      11: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_11.png'),
      12: () => require('../assets/character-creator/Eyebrows/Eyebrows Blonde_12.png'),
    },
    Brown: {
      1: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_1.png'),
      2: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_2.png'),
      3: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_3.png'),
      4: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_4.png'),
      5: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_5.png'),
      6: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_6.png'),
      7: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_7.png'),
      8: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_8.png'),
      9: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_9.png'),
      10: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_10.png'),
      11: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_11.png'),
      12: () => require('../assets/character-creator/Eyebrows/Eyebrows Brown_12.png'),
    },
    Blue: {
      1: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_1.png'),
      2: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_2.png'),
      3: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_3.png'),
      4: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_4.png'),
      5: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_5.png'),
      6: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_6.png'),
      7: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_7.png'),
      8: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_8.png'),
      9: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_9.png'),
      10: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_10.png'),
      11: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_11.png'),
      12: () => require('../assets/character-creator/Eyebrows/Eyebrows Blue_12.png'),
    },
  }
  
  const colorMap = eyebrowsMap[colorKey] || eyebrowsMap['Brown']
  return colorMap[eyebrowsIndex]?.() || colorMap[1]()
}

// Helper to get mouth asset
export function getMouthAsset(index: number): ImageSourcePropType {
  const mouthIndex = index + 1
  
  const mouthMap: Record<number, () => ImageSourcePropType> = {
    1: () => require('../assets/character-creator/Mouths/Mouth_1.png'),
    2: () => require('../assets/character-creator/Mouths/Mouth_2.png'),
    3: () => require('../assets/character-creator/Mouths/Mouth_3.png'),
    4: () => require('../assets/character-creator/Mouths/Mouth_4.png'),
    5: () => require('../assets/character-creator/Mouths/Mouth_5.png'),
    6: () => require('../assets/character-creator/Mouths/Mouth_6.png'),
    7: () => require('../assets/character-creator/Mouths/Mouth_7.png'),
    8: () => require('../assets/character-creator/Mouths/Mouth_8.png'),
    9: () => require('../assets/character-creator/Mouths/Mouth_9.png'),
    10: () => require('../assets/character-creator/Mouths/Mouth_10.png'),
    11: () => require('../assets/character-creator/Mouths/Mouth_11.png'),
    12: () => require('../assets/character-creator/Mouths/Mouth_12.png'),
  }
  
  return mouthMap[mouthIndex]?.() || mouthMap[1]()
}

// Export counts
export { BASE_COUNT, BG_COUNT, HAIR_COUNT, CLOTHES_COUNT, EYES_COUNT, EYEBROWS_COUNT, MOUTH_COUNT }

