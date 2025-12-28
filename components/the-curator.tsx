import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native'

export type CuratorEmotion =
  | 'default'
  | 'excited'
  | 'talking'
  | 'tired'
  | 'winking'
  | 'stretch'
  | 'pawup'

interface TheCuratorProps {
  emotion?: CuratorEmotion
  size?: 'small' | 'medium' | 'large'
}

const EMOTION_IMAGES: Record<CuratorEmotion, ImageSourcePropType> = {
  default: require('../assets/thecurator/curator.png'),
  excited: require('../assets/thecurator/curatorexcited.png'),
  talking: require('../assets/thecurator/curatortalking.png'),
  tired: require('../assets/thecurator/curatortired.png'),
  winking: require('../assets/thecurator/curatorwinking.png'),
  stretch: require('../assets/thecurator/curatorstretch.png'),
  pawup: require('../assets/thecurator/curatorpawup.png'),
}

const SIZE_MAP = {
  small: 80,
  medium: 120,
  large: 160,
}

export function TheCurator({ emotion = 'default', size = 'medium' }: TheCuratorProps) {
  const imageSource = EMOTION_IMAGES[emotion]
  const imageSize = SIZE_MAP[size]

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={[styles.image, { width: imageSize, height: imageSize }]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    resizeMode: 'contain',
  },
})

