import { CharacterPreview } from './CharacterPreview'
import { Color } from '@/utils/character-assets'

interface CharacterConfig {
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

interface CharacterAvatarProps {
  avatarConfig: string | null
  size?: number
}

export function CharacterAvatar({ avatarConfig, size = 150 }: CharacterAvatarProps) {
  if (!avatarConfig) return null

  try {
    const config: CharacterConfig = JSON.parse(avatarConfig)
    
    return (
      <CharacterPreview
        baseIndex={config.baseIndex}
        backgroundColor={config.backgroundColor}
        backgroundIndex={config.backgroundIndex}
        hairColor={config.hairColor}
        hairIndex={config.hairIndex}
        clothesColor={config.clothesColor}
        clothesIndex={config.clothesIndex}
        eyesColor={config.eyesColor}
        eyesIndex={config.eyesIndex}
        eyebrowsColor={config.eyebrowsColor}
        eyebrowsIndex={config.eyebrowsIndex}
        mouthIndex={config.mouthIndex}
        size={size}
      />
    )
  } catch (error) {
    // If parsing fails, return null (fallback for old avatar format)
    return null
  }
}

