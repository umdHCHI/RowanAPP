import { View, ScrollView, ImageBackground, Text as RNText } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMemo } from 'react'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { AttributesDisplay } from '@/components/resources/attributes-display'
import { EquipmentDisplay } from '@/components/profile/equipment-display'
import { Text, Card, useTheme, Divider, IconButton } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { GameButton } from '@/components/GameButton'
import { useUserFullProfile } from '@/api/hooks/use-user'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import '../global.css'

const USER_ID = 1 // TODO: Get from auth context or store

export default function Profile() {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { resetGame, soundMuted, toggleSoundMute } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const { data: profileData, isLoading } = useUserFullProfile(USER_ID)

  // Get character data from backend
  const characterName = useMemo(() => {
    return profileData?.character?.name || 'Seeker'
  }, [profileData])

  const avatarConfig = useMemo(() => {
    if (!profileData?.character) return null
    return buildAvatarConfig(profileData.character)
  }, [profileData])

  function handleReset() {
    haptics.mediumImpact()
    playPageFlipSound()
    resetGame()
    router.replace('/character-creator')
  }

  return (
    <ImageBackground
      source={require('../assets/UI/hauntedlibrary.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <View
        className="absolute inset-0"
        style={{ backgroundColor: theme.colors.surface }}
      />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingTop: Math.max(insets.top + 20, 60),
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <RNText
          className="text-center mb-2 text-3xl tracking-wider font-display"
          style={{
            color: theme.colors.primary,
            textShadowColor: theme.colors.primaryContainer,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}
        >
          Your Journey
        </RNText>

        {/* @ts-expect-error - children (Card.Content) are present but TypeScript checks props before seeing JSX children */}
        <Card
          className="mb-6 border"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderRadius: theme.roundness * 1.33,
          }}
          elevation={2}
        >
          {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
          <Card.Content className="p-5">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1" />
              <IconButton
                icon={soundMuted ? 'volume-off' : 'volume-high'}
                iconColor={theme.colors.onSurface}
                size={24}
                onPress={() => {
                  haptics.selection()
                  toggleSoundMute()
                  playPageFlipSound()
                }}
                style={{ margin: 0 }}
              />
            </View>
            {!isLoading && (
              <>
                {avatarConfig && (
                  <View className="items-center my-4">
                    <CharacterAvatar avatarConfig={avatarConfig} size={150} />
                  </View>
                )}
                <Divider className="my-4" />
                {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
                <Text
                  variant="titleLarge"
                  className="text-center italic"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                  }}
                >
                  {characterName}
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Attributes */}
        <View className="mb-6">
          <AttributesDisplay showImages={true} />
        </View>

        {/* Equipment */}
        <View className="mb-6">
          <EquipmentDisplay />
        </View>

        <View className="items-center gap-4 mt-2">
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

          <GameButton
            normalImage={require('../assets/UI/buttons/red/Button_06A_Normal.png')}
            selectedImage={require('../assets/UI/buttons/red/Button_06A_Pressed.png')}
            pressedImage={require('../assets/UI/buttons/red/Button_06A_Pressed.png')}
            label="Start New Journey"
            onPress={handleReset}
            width={200}
            height={50}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  )
}
