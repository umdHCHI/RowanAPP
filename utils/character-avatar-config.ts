import {
  COLORS,
  MOUTH_COUNT,
  BG_COUNT,
  HAIR_COUNT,
  CLOTHES_COUNT,
  EYES_COUNT,
  type Color,
} from '@/utils/character-assets'

function pickRandomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function pickRandomColor(): Color {
  return COLORS[pickRandomInt(COLORS.length)]
}

/**
 * Frontend character config format (used in character creator)
 */
export interface FrontendCharacterConfig {
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

/**
 * Map color indices to Color type
 * Expects 0-based index (array index)
 */
export function getColorByIndex(index: number | undefined): Color {
  if (index === undefined || index === null) return 'Brown'
  const colorIndex = Math.max(0, Math.min(index, COLORS.length - 1))
  return COLORS[colorIndex] || 'Brown'
}

/**
 * Get color index from Color type (returns 0-based index)
 */
export function getColorIndex(color: Color): number {
  const index = COLORS.indexOf(color)
  return index >= 0 ? index : COLORS.indexOf('Brown')
}

/**
 * Convert frontend character config to backend format
 * Frontend uses 0-based indices and Color strings, backend uses 1-based indices
 * Note: selected_skin_color is required by backend but not in frontend config, so we default to 1
 */
export function convertToBackendConfig(config: FrontendCharacterConfig): {
  selected_base_model: number
  selected_skin_color: number
  selected_background_color: number
  selected_background_type: number
  selected_hair_color: number
  selected_hair_style: number
  selected_shirt_color: number
  selected_shirt_type: number
  selected_eye_color: number
  selected_eye_type: number
  selected_eyebrow_color: number
  selected_eyebrow_style: number
  selected_mouth_type: number
} {
  return {
    selected_base_model: config.baseIndex + 1,
    selected_skin_color: 1, // Default to 1 since frontend doesn't have skin color selector
    selected_background_color: getColorIndex(config.backgroundColor) + 1,
    selected_background_type: config.backgroundIndex + 1,
    selected_hair_color: getColorIndex(config.hairColor) + 1,
    selected_hair_style: config.hairIndex + 1,
    selected_shirt_color: getColorIndex(config.clothesColor) + 1,
    selected_shirt_type: config.clothesIndex + 1,
    selected_eye_color: getColorIndex(config.eyesColor) + 1,
    selected_eye_type: config.eyesIndex + 1,
    selected_eyebrow_color: getColorIndex(config.eyebrowsColor) + 1,
    selected_eyebrow_style: config.eyebrowsIndex + 1,
    selected_mouth_type: config.mouthIndex + 1,
  }
}

/**
 * Build avatar config from character data
 * Maps backend character config to the format expected by CharacterAvatar
 */
export function buildAvatarConfig(character: any): string | null {
  if (!character) return null
  
  // Try character_config first, fallback to character itself
  const config = character.character_config || character
  
  // Backend stores 1-based indices, convert to 0-based for frontend
  // Color indices also need to be converted from 1-based to 0-based
  const avatarConfig: FrontendCharacterConfig = {
    baseIndex: (config.selected_base_model || 1) - 1,
    backgroundColor: getColorByIndex((config.selected_background_color || 1) - 1),
    backgroundIndex: (config.selected_background_type || 1) - 1,
    hairColor: getColorByIndex((config.selected_hair_color || 1) - 1),
    hairIndex: (config.selected_hair_style || 1) - 1,
    clothesColor: getColorByIndex((config.selected_shirt_color || 1) - 1),
    clothesIndex: (config.selected_shirt_type || 1) - 1,
    eyesColor: getColorByIndex((config.selected_eye_color || 1) - 1),
    eyesIndex: (config.selected_eye_type || 1) - 1,
    eyebrowsColor: getColorByIndex((config.selected_eyebrow_color || 1) - 1),
    eyebrowsIndex: (config.selected_eyebrow_style || 1) - 1,
    mouthIndex: (config.selected_mouth_type || 1) - 1,
  }

  return JSON.stringify(avatarConfig)
}

/**
 * Default avatar config for the splash screen. Randomizes hair, hair color,
 * background, background color, eyes, eye color, shirt, shirt color, and mouth
 * per load so the splash feels different each time.
 */
export function getDefaultSplashAvatarConfig(): string {
  const config: FrontendCharacterConfig = {
    baseIndex: 0,
    backgroundColor: pickRandomColor(),
    backgroundIndex: pickRandomInt(BG_COUNT),
    hairColor: pickRandomColor(),
    hairIndex: pickRandomInt(HAIR_COUNT),
    clothesColor: pickRandomColor(),
    clothesIndex: pickRandomInt(CLOTHES_COUNT),
    eyesColor: pickRandomColor(),
    eyesIndex: pickRandomInt(EYES_COUNT),
    eyebrowsColor: 'Brown',
    eyebrowsIndex: 0,
    mouthIndex: pickRandomInt(MOUTH_COUNT),
  }
  return JSON.stringify(config)
}
