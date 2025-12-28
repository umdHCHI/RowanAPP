import { View, ScrollView, ImageBackground, Text as RNText } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { AttributesDisplay } from '@/components/attributes-display'
import { EquipmentDisplay } from '@/components/equipment-display'
import { Text, Card, useTheme, Divider, IconButton } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { GameButton } from '@/components/GameButton'
import '../global.css'

export default function Profile() {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { character, resetGame, soundMuted, toggleSoundMute } = useGameStore()
  const playPageFlipSound = usePageFlipSound()

  function handleReset() {
    playPageFlipSound()
    resetGame()
    router.replace('/character-creator')
  }

  return (
    <ImageBackground
      source={require('../hauntedlibrary.png')}
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
                  toggleSoundMute()
                  playPageFlipSound()
                }}
                style={{ margin: 0 }}
              />
            </View>
            {character && (
              <>
                {character.avatar && (
                  <View className="items-center my-4">
                    <CharacterAvatar avatarConfig={character.avatar} size={150} />
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
                  {character.name}
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
