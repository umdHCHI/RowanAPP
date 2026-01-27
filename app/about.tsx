import { View, ScrollView, Text as RNText, StyleSheet, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header } from '@/components/header'
import { GameButton } from '@/components/GameButton'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { GameBackground } from '@/components/ui/GameBackground'

export default function About() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <GameBackground />

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

        {/* Game Credits Section */}
        <View style={styles.creditsSection}>
          <View style={styles.creditsSectionContainer}>
            <View style={styles.creditsHeader}>
              <MaterialCommunityIcons name="account-group" size={20} color="#4ee6e6" />
              <RNText style={styles.creditsTitle}>Game Credits</RNText>
              <MaterialCommunityIcons name="account-group" size={20} color="#4ee6e6" />
            </View>
            <RNText style={styles.creditsSubtitle}>
              The brave souls who brought this adventure to life
            </RNText>

            <View style={styles.creditsGrid}>
              {/* Story Writer Card */}
              <TouchableOpacity
                style={styles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🖋️ Master of Tales',
                    'Our talented story writer crafted the immersive narratives and compelling characters that guide your journey through The Archive. Every choice, every revelation, and every moment of discovery was carefully woven to support your wellness adventure.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.creditCardContainer, styles.storyWriterCard]}>
                  <View style={styles.creditValueContainer}>
                    <RNText style={styles.creditLevel}>🖋️ Master of Tales</RNText>
                  </View>
                  <RNText style={styles.creditLabel}>Story Writer:</RNText>
                  <View style={styles.creditNameContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <RNText style={styles.avatarText}>MW</RNText>
                    </View>
                    <RNText style={styles.creditName}>Matthew Wilson</RNText>
                  </View>
                  <RNText style={styles.creditDescription}>
                    Crafted immersive narratives for your journey
                  </RNText>
                  <View style={[styles.creditIndicator, styles.purpleIndicator]} />
                </View>
              </TouchableOpacity>

              {/* Development Team Card */}
              <TouchableOpacity
                style={styles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '⚔️ Code Guardians',
                    'Three skilled developers who transformed ideas into reality. They built the magical systems, crafted the user experience, and ensured every interaction feels smooth and engaging. Their dedication brought The Archive\'s mystical atmosphere to life.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.creditCardContainer, styles.devTeamCard]}>
                  <View style={styles.creditValueContainer}>
                    <RNText style={styles.creditLevel}>⚔️ Code Guardians</RNText>
                  </View>
                  <RNText style={styles.creditLabel}>Development Team:</RNText>

                  <View style={styles.developerList}>
                    <View style={styles.developerItem}>
                      <View style={[styles.avatarPlaceholder, styles.smallAvatar]}>
                        <RNText style={styles.avatarTextSmall}>RG</RNText>
                      </View>
                      <RNText style={styles.creditNameSmall}>Regan Gross</RNText>
                    </View>

                    <View style={styles.developerItem}>
                      <View style={[styles.avatarPlaceholder, styles.smallAvatar]}>
                        <RNText style={styles.avatarTextSmall}>TS</RNText>
                      </View>
                      <RNText style={styles.creditNameSmall}>Trevor Schmidt</RNText>
                    </View>

                    <View style={styles.developerItem}>
                      <View style={[styles.avatarPlaceholder, styles.smallAvatar]}>
                        <RNText style={styles.avatarTextSmall}>RS</RNText>
                      </View>
                      <RNText style={styles.creditNameSmall}>Rowan Stratton</RNText>
                    </View>
                  </View>

                  <RNText style={styles.creditDescription}>
                    Built the magical systems that power The Archive
                  </RNText>
                  <View style={[styles.creditIndicator, styles.greenIndicator]} />
                </View>
              </TouchableOpacity>

              {/* Faculty Advisor Card */}
              <TouchableOpacity
                style={styles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🧙 Wise Mentor',
                    'Our faculty advisor provided invaluable guidance, ensuring this project meets the highest academic standards while remaining true to its mission of supporting mental wellness. Their wisdom shaped both the research foundation and practical implementation.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.creditCardContainer, styles.advisorCard]}>
                  <View style={styles.creditValueContainer}>
                    <RNText style={styles.creditLevel}>🧙 Wise Mentor</RNText>
                  </View>
                  <RNText style={styles.creditLabel}>
                    Faculty Advisor:{'\n'}Dr. Jomara Sandbulte
                  </RNText>
                  <RNText style={styles.creditDescription}>
                    Provided guidance and wisdom throughout the quest
                  </RNText>
                  <View style={[styles.creditIndicator, styles.orangeIndicator]} />
                </View>
              </TouchableOpacity>

              {/* Origins & Assets Card */}
              <TouchableOpacity
                style={styles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🏛️ The Archive Origins',
                    'Born in the Human Computer Interaction Laboratory, this project represents cutting-edge research in digital wellness tools. Visual assets and creative elements were sourced from talented artists on Itch.io, bringing depth and beauty to your adventure.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.creditCardContainer, styles.originsCard]}>
                  <View style={styles.creditValueContainer}>
                    <RNText style={styles.creditLevel}>🏛️ Origins & Assets</RNText>
                  </View>
                  <RNText style={styles.creditLabel}>
                    HCI Lab{'\n'}Itch.io
                  </RNText>
                  <RNText style={styles.creditDescription}>
                    Research foundation and artistic contributions
                  </RNText>
                  <View style={[styles.creditIndicator, styles.cyanIndicator]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GameButton
            normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
            selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            label="Return to Archive"
            onPress={() => {
              router.push('/hub')
            }}
            width={200}
            height={50}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
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
  creditsSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  creditsSectionContainer: {
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    minHeight: Dimensions.get('window').height * 0.55,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  creditsTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#4ee6e6',
    letterSpacing: 2,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  creditsSubtitle: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 14,
    color: '#d4af37',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  creditsGrid: {
    gap: 16,
  },
  creditCard: {
    width: '100%',
  },
  creditCardContainer: {
    backgroundColor: 'rgba(10, 11, 15, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  storyWriterCard: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
  },
  devTeamCard: {
    borderColor: 'rgba(34, 197, 94, 0.6)',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
  },
  advisorCard: {
    borderColor: 'rgba(251, 146, 60, 0.6)',
    shadowColor: 'rgba(251, 146, 60, 0.4)',
  },
  originsCard: {
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
  },
  creditValueContainer: {
    marginBottom: 8,
  },
  creditLevel: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  creditLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  creditNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  creditName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#4ee6e6',
  },
  creditNameSmall: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#4ee6e6',
  },
  creditDescription: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  creditIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  purpleIndicator: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  greenIndicator: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    shadowColor: 'rgba(34, 197, 94, 0.5)',
  },
  orangeIndicator: {
    backgroundColor: 'rgba(251, 146, 60, 0.8)',
    shadowColor: 'rgba(251, 146, 60, 0.5)',
  },
  cyanIndicator: {
    backgroundColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(78, 230, 230, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: '#4ee6e6',
  },
  avatarTextSmall: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#4ee6e6',
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  developerList: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  developerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
})

