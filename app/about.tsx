import { View, ScrollView, ImageBackground, Text as RNText, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header } from '@/components/header'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { GameButton } from '@/components/GameButton'

export default function About() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()

  return (
    <ImageBackground
      source={require('../assets/UI/hauntedlibrary.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <RNText style={styles.title}>About The Archive</RNText>

        <View style={styles.content}>
          <RNText style={styles.bodyText}>
            The Archive is a transformative journey through stories that explore the depths of human
            experience. Through interactive narratives, you'll navigate themes of connection,
            courage, exploration, and understanding fear.
          </RNText>

          <RNText style={styles.bodyText}>
            Each story in The Archive is designed to help you reflect on your own journey, build
            resilience, and discover new perspectives on life's challenges.
          </RNText>

          <RNText style={styles.bodyText}>
            Your progress is tracked through attributes that grow as you engage with the stories,
            creating a personalized experience that evolves with you.
          </RNText>
        </View>

        <View style={styles.buttonContainer}>
          <GameButton
            normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
            selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            label="Return to Archive"
            onPress={() => {
              haptics.lightImpact()
              playPageFlipSound()
              router.push('/hub')
            }}
            width={200}
            height={50}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 42,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 48,
  },
  content: {
    gap: 24,
    marginBottom: 32,
  },
  bodyText: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 18,
    color: '#ffffffdd',
    lineHeight: 28,
    textAlign: 'left',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
})

