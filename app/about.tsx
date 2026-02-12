import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Header } from '@/components/header'
import { Button, Text, Card } from '@/components/ui'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { GameBackground } from '@/components/ui/GameBackground'
import aboutStyles from '@/styles/about/about-styles'
import { colors } from '@/theme/design-tokens'

export default function About() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  return (
    <View style={aboutStyles.screen}>
      <GameBackground />
      <Header />
      <ScrollView
        style={aboutStyles.scrollView}
        contentContainerStyle={[
          aboutStyles.scrollContent,
          { paddingTop: Math.max(insets.top + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={aboutStyles.title}>
          <Text variant="heading" size={1} align="center">
            About The Archive
          </Text>
        </View>

        <View style={aboutStyles.content}>
          <Text variant="body" size={1} opacity={0.9}>
            The Archive is a transformative journey through stories that explore the depths of human
            experience. Through interactive narratives, you'll navigate themes of connection,
            courage, exploration, and understanding fear.
          </Text>
          <Text variant="body" size={1} opacity={0.9}>
            Each story in The Archive is designed to help you reflect on your own journey, build
            resilience, and discover new perspectives on life's challenges.
          </Text>
          <Text variant="body" size={1} opacity={0.9}>
            Your progress is tracked through attributes that grow as you engage with the stories,
            creating a personalized experience that evolves with you.
          </Text>
        </View>

        {/* Game Credits Section */}
        <View style={aboutStyles.creditsSection}>
          <View style={aboutStyles.creditsSectionContainer}>
            <View style={aboutStyles.creditsHeader}>
              <MaterialCommunityIcons name="account-group" size={20} color={colors.archive.white} />
              <Text variant="heading" size={3} align="center">
                Game Credits
              </Text>
              <MaterialCommunityIcons name="account-group" size={20} color={colors.archive.white} />
            </View>
            <View style={aboutStyles.creditsSubtitle}>
              <Text variant="body" size={2} align="center" opacity={0.85}>
                The brave souls who brought this adventure to life
              </Text>
            </View>

            <View style={aboutStyles.creditsGrid}>
              {/* Story Writer Card */}
              <TouchableOpacity
                style={aboutStyles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🖋️ Master of Tales',
                    'Our talented story writer crafted the immersive narratives and compelling characters that guide your journey through The Archive. Every choice, every revelation, and every moment of discovery was carefully woven to support your wellness adventure.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <Card padding={16} fullWidth>
                  <View style={aboutStyles.creditValueContainer}>
                    <Text variant="title" size={2} align="center">🖋️ Master of Tales</Text>
                  </View>
                  <Text variant="label" align="center">Story Writer:</Text>
                  <View style={aboutStyles.creditNameContainer}>
                    <View style={aboutStyles.avatarPlaceholder}>
                      <Text variant="title" size={4}>MW</Text>
                    </View>
                    <Text variant="title" size={2}>Matthew Wilson</Text>
                  </View>
                  <Text variant="body" size={2} align="center" opacity={0.8}>
                    Crafted immersive narratives for your journey
                  </Text>
                  <View style={[aboutStyles.creditIndicator, aboutStyles.purpleIndicator]} />
                </Card>
              </TouchableOpacity>

              {/* Development Team Card */}
              <TouchableOpacity
                style={aboutStyles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '⚔️ Code Guardians',
                    'Three skilled developers who transformed ideas into reality. They built the magical systems, crafted the user experience, and ensured every interaction feels smooth and engaging. Their dedication brought The Archive\'s mystical atmosphere to life.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <Card padding={16} fullWidth>
                  <View style={aboutStyles.creditValueContainer}>
                    <Text variant="title" size={2} align="center">⚔️ Code Guardians</Text>
                  </View>
                  <Text variant="label" align="center">Development Team:</Text>
                  <View style={aboutStyles.developerList}>
                    <View style={aboutStyles.developerItem}>
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Text variant="title" size={4}>RG</Text>
                      </View>
                      <Text variant="title" size={4}>Regan Gross</Text>
                    </View>
                    <View style={aboutStyles.developerItem}>
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Text variant="title" size={4}>TS</Text>
                      </View>
                      <Text variant="title" size={4}>Trevor Schmidt</Text>
                    </View>
                    <View style={aboutStyles.developerItem}>
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Text variant="title" size={4}>RS</Text>
                      </View>
                      <Text variant="title" size={4}>Rowan Stratton</Text>
                    </View>
                  </View>
                  <Text variant="body" size={2} align="center" opacity={0.8}>
                    Built the magical systems that power The Archive
                  </Text>
                  <View style={[aboutStyles.creditIndicator, aboutStyles.greenIndicator]} />
                </Card>
              </TouchableOpacity>

              {/* Faculty Advisor Card */}
              <TouchableOpacity
                style={aboutStyles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🧙 Wise Mentor',
                    'Our faculty advisor provided invaluable guidance, ensuring this project meets the highest academic standards while remaining true to its mission of supporting mental wellness. Their wisdom shaped both the research foundation and practical implementation.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <Card padding={16} fullWidth>
                  <View style={aboutStyles.creditValueContainer}>
                    <Text variant="title" size={2} align="center">🧙 Wise Mentor</Text>
                  </View>
                  <Text variant="label" align="center">
                    Faculty Advisor:{'\n'}Dr. Jomara Sandbulte
                  </Text>
                  <Text variant="body" size={2} align="center" opacity={0.8}>
                    Provided guidance and wisdom throughout the quest
                  </Text>
                  <View style={[aboutStyles.creditIndicator, aboutStyles.orangeIndicator]} />
                </Card>
              </TouchableOpacity>

              {/* Origins & Assets Card */}
              <TouchableOpacity
                style={aboutStyles.creditCard}
                onPress={() => {
                  Alert.alert(
                    '🏛️ The Archive Origins',
                    'Born in the Human Computer Interaction Laboratory, this project represents cutting-edge research in digital wellness tools. Visual assets and creative elements were sourced from talented artists on Itch.io, bringing depth and beauty to your adventure.',
                    [{ text: 'Continue Exploring', style: 'default' }]
                  )
                }}
                activeOpacity={0.8}
              >
                <Card padding={16} fullWidth>
                  <View style={aboutStyles.creditValueContainer}>
                    <Text variant="title" size={2} align="center">🏛️ Origins & Assets</Text>
                  </View>
                  <Text variant="label" align="center">
                    HCI Lab{'\n'}Itch.io
                  </Text>
                  <Text variant="body" size={2} align="center" opacity={0.8}>
                    Research foundation and artistic contributions
                  </Text>
                  <View style={[aboutStyles.creditIndicator, aboutStyles.cyanIndicator]} />
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={aboutStyles.buttonContainer}>
          <Button
            onPress={() => router.replace('/hub')}
            variant="primary"
            size="default"
            hapticType="light"
            enableHaptics
            enableSound
            fullWidth={false}
            disabled={false}
          >
            Return to Archive
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

