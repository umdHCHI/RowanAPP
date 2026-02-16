import { View, StyleSheet } from 'react-native'
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
    const borderRadius = size / 2
    
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
      >
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
      </View>
    )
  } catch {
    return null
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

