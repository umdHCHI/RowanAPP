import { View, Image, StyleSheet } from 'react-native'
import {
  getBaseAsset,
  getBackgroundAsset,
  getHairAsset,
  getClothesAsset,
  getEyesAsset,
  getEyebrowsAsset,
  getMouthAsset,
  Color,
} from '@/utils/character-assets'

interface CharacterPreviewProps {
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
  size?: number
}

export function CharacterPreview({
  baseIndex,
  backgroundColor,
  backgroundIndex,
  hairColor,
  hairIndex,
  clothesColor,
  clothesIndex,
  eyesColor,
  eyesIndex,
  eyebrowsColor,
  eyebrowsIndex,
  mouthIndex,
  size = 250,
}: CharacterPreviewProps) {
  const background = getBackgroundAsset(backgroundColor, backgroundIndex)
  const base = getBaseAsset(baseIndex)
  const hair = getHairAsset(hairColor, hairIndex)
  const clothes = getClothesAsset(clothesColor, clothesIndex)
  const eyes = getEyesAsset(eyesColor, eyesIndex)
  const eyebrows = getEyebrowsAsset(eyebrowsColor, eyebrowsIndex)
  const mouth = getMouthAsset(mouthIndex)
  const baseLayerStyle = [
    styles.layer,
    { width: size, height: size },
  ]

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background layer */}
      <Image
        source={background}
        style={[styles.layer, { width: size, height: size }]}
        resizeMode="contain"
      />
      
      {/* Base layer */}
      <Image
        source={base}
        style={baseLayerStyle}
        resizeMode="contain"
      />
      
      {/* Clothes layer */}
      {clothes && (
        <Image
          source={clothes}
          style={[styles.layer, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}
      
      {/* Eyes layer */}
      <Image
        source={eyes}
        style={[styles.layer, { width: size, height: size }]}
        resizeMode="contain"
      />
      
      {/* Eyebrows layer */}
      <Image
        source={eyebrows}
        style={[styles.layer, { width: size, height: size }]}
        resizeMode="contain"
      />
      
      {/* Mouth layer */}
      <Image
        source={mouth}
        style={[styles.layer, { width: size, height: size }]}
        resizeMode="contain"
      />
      
      {/* Hair layer (on top) */}
      {hair && (
        <Image
          source={hair}
          style={[styles.layer, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})

