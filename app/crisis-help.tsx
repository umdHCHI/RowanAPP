import { View, ScrollView, ImageBackground, Text as RNText, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'react-native-paper'
import { Header } from '@/components/header'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { GameButton } from '@/components/GameButton'
import { TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface CrisisResource {
  title: string
  description: string
  phone?: string
  website?: string
  hours?: string
}

// Example campus mental health resources - update with actual resources
const crisisResources: CrisisResource[] = [
  {
    title: 'Campus Counseling Center',
    description: 'Professional counseling services available to all students. Confidential support for mental health concerns.',
    phone: '(218) 726-7913',
    website: 'https://health-services.d.umn.edu/counseling-services',
    hours: 'Mon-Fri: 8am-4pm',
  },
  {
    title: '24/7 Crisis Hotline',
    description: 'Immediate support available 24 hours a day, 7 days a week for mental health crises.',
    phone: '612-301-4673',
    website: 'https://www.sph.umn.edu/current/resources/mental-health/',
    hours: '24/7',
  },
  {
    title: 'HelpCompass',
    description: 'Interactive questionnaire to guide you to appropriate mental health resources based on your needs.',
    phone: 'N/A',
    website: 'https://mentalhealth.umn.edu/',
    hours: '24/7',
  },
  {
    title: 'Crisis Text Line',
    description: 'Free 24/7 support via text message. Text HOME to connect with a trained crisis counselor.',
    phone: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    hours: '24/7',
  },
]

export default function CrisisHelp() {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()

  function handlePhonePress(phone: string) {
    haptics.mediumImpact()
    const phoneNumber = phone.replace(/[^\d+]/g, '')
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`)
    }
  }

  function handleWebsitePress(url: string) {
    haptics.mediumImpact()
    Linking.openURL(url)
  }

  return (
    <ImageBackground
      source={require('../assets/splashscreen/icon.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.surface }]} />

      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <RNText style={styles.title}>Crisis Help</RNText>

        <RNText style={styles.subtitle}>
          If you're experiencing a mental health crisis, help is available. Reach out to these
          resources:
        </RNText>

        <View style={styles.resourcesContainer}>
          {crisisResources.map((resource, index) => (
            <View key={index} style={styles.resourceCard}>
              <RNText style={styles.resourceTitle}>{resource.title}</RNText>
              <RNText style={styles.resourceDescription}>{resource.description}</RNText>

              {resource.hours && (
                <RNText style={styles.resourceHours}>Hours: {resource.hours}</RNText>
              )}

              <View style={styles.resourceActions}>
                {resource.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePhonePress(resource.phone!)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
                    <RNText style={styles.actionButtonText}>{resource.phone}</RNText>
                  </TouchableOpacity>
                )}

                {resource.website && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleWebsitePress(resource.website!)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="web" size={20} color="#ffffff" />
                    <RNText style={styles.actionButtonText}>Visit Website</RNText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
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
    marginBottom: 16,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 18,
    color: '#ffffffdd',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  resourcesContainer: {
    gap: 20,
    marginBottom: 32,
  },
  resourceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resourceTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 12,
  },
  resourceDescription: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 16,
    color: '#ffffffcc',
    lineHeight: 24,
    marginBottom: 12,
  },
  resourceHours: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#ffffff99',
    marginBottom: 16,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
})

