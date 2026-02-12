import { Color } from "@/utils/character-assets"


export type Category = 'base' | 'background' | 'hair' | 'clothes' | 'eyes' | 'eyebrows' | 'mouth'

export interface CharacterConfig {
  baseIndex: number
  backgroundColor: Color
  backgroundIndex: number
  hairColor: Color
  hairIndex: number
  clothesColor: Color
  clothesIndex: number
  eyesColor: Color
  eyesIndex: number
  eyebrowsColor: Color
  eyebrowsIndex: number
  mouthIndex: number
}