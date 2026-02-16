import { View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Header } from '@/components/header'
import { Button, Text, Card } from '@/components/ui'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { GameBackground } from '@/components/ui/GameBackground'
import { aboutStyles } from '@/styles/about/about-styles'
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
            The Archive is a research project blending games and digital mental health applications. Within our Human Computer Interaction lab, we use participatory design methods to co-design these solutions with college students here at UMN Duluth. This investigation attempts to move those who use the software into the design chair. Our initial investigation in this space with surveys called for narrative exploration as an adaptive coping mechanism to explore within this space. 
          </Text>
          <Text variant="body" size={1} opacity={0.9}>
            We further analyzed what this meant for students by involving a sampling in co-design sessions observed by board game scenarios. Our short playful sessions allowed us to view how this group navigated through stressful themes, directly informing the solution you are playing today. This journey is made to be one that is transformative through storytelling that encourages and reminds users of simple and necessary techniques for managing stress. The narrative places the player in a strange and possibly uncomfortable situation and then asks the player to reflect upon how they felt while immersed within. 
          </Text>
          <Text variant="body" size={1} opacity={0.9}>
            This solution leverages the critiques of gamification solutions and the shortcomings of some applications made to support our wellness. By rooting itself as a serious game and taking the insights of students, experts, and professionals within the industry, The Archive aims to reinforce inward sensitivity as well as the techniques commonly taught—and easily forgotten—as students adjust to the expectations of college life. 
          </Text>
          <Text variant="body" size={1} opacity={0.85} align="center">
            “In meditation, you can watch thoughts emerge from emptiness and return back to that emptiness. This leads first to the realization that you are separate from those thoughts, which we normally identify with self.”{''}
            ― David Hinton, I Ching: The Book of Change
          </Text>
        </View>

        {/* Game Credits Section */}
        <View style={aboutStyles.creditsSection}>
          <View style={aboutStyles.creditsSectionContainer}>
            <View style={aboutStyles.creditsHeader}>
              <MaterialDesignIcons name="account-group" size={20} color={colors.archive.white} />
              <Text variant="heading" size={3} align="center">
                Game Credits
              </Text>
              <MaterialDesignIcons name="account-group" size={20} color={colors.archive.white} />
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
                    'Crafted the characters, plot, and narrative themes of The Archive  \n\nAdditional Role: Visual Artist, Quality Assurance, Backend Data Keying and Management, Emotional Support.”',
                    //{\n\nQuote: “Is 1800 passages too many?}
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
                      <Image
                        source={require('../assets/ourAvatars/matt.png')}
                        style={aboutStyles.avatarImage}
                        resizeMode="cover"
                      />
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
              <TouchableOpacity style={aboutStyles.creditCard} activeOpacity={0.8}>
                <Card padding={16} fullWidth>
                  <View style={aboutStyles.creditValueContainer}>
                    <Text variant="title" size={2} align="center">⚔️ Code Guardians</Text>
                  </View>
                  <Text variant="label" align="center">Development Team:</Text>
                  <View style={aboutStyles.developerList}>
                    <TouchableOpacity
                      style={aboutStyles.developerItem}
                      onPress={() => {
                        Alert.alert(
                          'Regan Gross',
                          'Role: Quality Assurance\nContributions: Quality Assurance, Backend Data Keying.',
                          //\nQuote: “Later.”
                          [{ text: 'Continue Exploring', style: 'default' }]
                        )
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Image
                          source={require('../assets/ourAvatars/regan.png')}
                          style={aboutStyles.avatarImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text variant="title" size={4}>Regan Gross</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={aboutStyles.developerItem}
                      onPress={() => {
                        Alert.alert(
                          'Trevor Schmidt',
                          'Role: Quality Assurance\nContributions: Bug Testing, Mini game exploration, some of the assets for mini-game.',
                          //\n\nQuote: “I like fishing. What is bait?”
                          [{ text: 'Continue Exploring', style: 'default' }]
                        )
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Image
                          source={require('../assets/ourAvatars/trevor.png')}
                          style={aboutStyles.avatarImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text variant="title" size={4}>Trevor Schmidt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={aboutStyles.developerItem}
                      onPress={() => {
                        Alert.alert(
                          'Varshini Bhavanam',
                          'Role: Research Assistant\nContributions: Initial Data Gathering, Survey Implementation, Focus Group Coordination.',
                          [{ text: 'Continue Exploring', style: 'default' }]
                        )
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[aboutStyles.avatarPlaceholder, aboutStyles.smallAvatar]}>
                        <Text variant="title" size={4}>VB</Text>
                      </View>
                      <Text variant="title" size={4}>Varshini Bhavanam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={aboutStyles.developerItem}
                      onPress={() => {
                        Alert.alert(
                          'Rowan Stratton',
                          'Role: Developer\nContributions: Lead Developer, Researcher, Mastermind. Additional Roles: Mad Scientist, Visual Artist, Quality Assurance, Backend Data Keying and Management, Frontend Development, Backend Development, Integration.',
                          [{ text: 'Continue Exploring', style: 'default' }]
                        )
                      }}
                      activeOpacity={0.8}
                    >
                    <View style={aboutStyles.avatarPlaceholder}>
                      <Image
                        source={require('../assets/ourAvatars/rowanAvatarCuzMattWouldntLetitGo.png')}
                        style={aboutStyles.avatarImage}
                        resizeMode="cover"
                      />
                    </View>
                      <Text variant="title" size={4}>Rowan Stratton</Text>
                    </TouchableOpacity>
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
                    'Advisor - Dr. Jomara Sandbulte',
                    'Provided invaluable guidance, ensuring this project meets the highest academic standards.',
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
                    'Computer Interaction Laboratory, this project represents cutting-edge research in digital wellness tools.',
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
                    Visual assets and creative elements were sourced from talented artists on Itch.io, bringing depth and beauty to your adventure. Contact us if you would like more information on the assets in the game.
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

