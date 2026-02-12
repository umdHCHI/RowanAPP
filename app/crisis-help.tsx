import { View, ScrollView, Linking, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/Button'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { GameBackground } from '@/components/ui/GameBackground'
import { crisisHelpStyles } from '@/styles/crisisHelp/crisis-help'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { crisisResources } from '@/types/crisis-help/crisis-help'


export default function CrisisHelp() {
  const router = useRouter()
  const insets = useSafeAreaInsets()


  function handlePhonePress(phone: string) {
    const phoneNumber = phone.replace(/[^\d+]/g, '')
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`)
    }
  }

  function handleWebsitePress(url: string) {
    Linking.openURL(url)
  }

  return (
    <View style={crisisHelpStyles.screen}>
      <GameBackground />
      <Header />

      <ScrollView
        style={crisisHelpStyles.scrollView}
        contentContainerStyle={[
          crisisHelpStyles.scrollContent,
          { paddingTop: Math.max(insets.top + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="heading" size={1} align="center">Crisis Help</Text>

        <Text variant="title" size={1} align="center" marginTop={16}>
          If you're experiencing a mental health crisis, help is available. Reach out to these
          resources:
        </Text>

        <View style={crisisHelpStyles.resourcesContainer}>
          {crisisResources.map((resource, index) => (
            <View key={index} style={crisisHelpStyles.resourceCard}>
              <Card variant="resource" fullWidth>
              <Text variant="tagline" size={1} align="center">{resource.title}</Text>
              <Text variant="body" size={1} align="center">{resource.description}</Text>

              {resource.hours && (
                <Text variant="label" size={1} align="center">Hours: {resource.hours}</Text>
              )}

              <View style={crisisHelpStyles.resourceActions}>
                {resource.phone && resource.phone.toUpperCase() !== 'N/A' && (
                  <TouchableOpacity
                    style={crisisHelpStyles.actionButton}
                    onPress={() => handlePhonePress(resource.phone!)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="phone" size={14} color="#ffffff" />
                    <Text variant="titleWhite" size={4} align="center">{resource.phone}</Text>
                  </TouchableOpacity>
                )}

                {resource.website && (
                  <TouchableOpacity
                    style={crisisHelpStyles.actionButton}
                    onPress={() => handleWebsitePress(resource.website!)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="web" size={14} color="#ffffff" />
                    <Text variant="titleWhite" size={4} align="center">Visit Website</Text>
                  </TouchableOpacity>
                )}
              </View>
              </Card>
            </View>
          ))}
        </View>

        <View style={crisisHelpStyles.buttonContainer}>
          <Button
            onPress={() => router.push('/hub')}
            variant="primary"
            size="default"
            hapticType="light"
            enableHaptics={true}
            enableSound={true}
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

