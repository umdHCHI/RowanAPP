import { useState, useEffect, useMemo } from 'react'
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useGameStore } from '@/stores/game-store'
import { CharacterPreview } from '@/components/character/CharacterPreview'
import { COLORS, Color, BASE_COUNT, BG_COUNT, HAIR_COUNT, CLOTHES_COUNT, EYES_COUNT, EYEBROWS_COUNT, MOUTH_COUNT } from '@/utils/character-assets'
import { TextInput, Text, Button, Card, useTheme, IconButton, Chip } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useCreateCharacter, useUpdateCharacter } from '@/api/hooks/use-character'
import { useUserFullProfile, userKeys } from '@/api/hooks/use-user'
import { convertToBackendConfig, buildAvatarConfig } from '@/utils/character-avatar-config'
import { useQueryClient } from '@tanstack/react-query'
import { characterKeys } from '@/api/hooks/use-character'

const USER_ID = 1 // TODO: Get from auth context or store

type Category = 'base' | 'background' | 'hair' | 'clothes' | 'eyes' | 'eyebrows' | 'mouth'

interface CharacterConfig {
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
}

export default function CharacterCreator() {
  const router = useRouter()
  const theme = useTheme()
  const { setCharacter } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const [characterName, setCharacterName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('base')
  const [isSaving, setIsSaving] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: profileData } = useUserFullProfile(USER_ID)
  const createCharacter = useCreateCharacter()
  const updateCharacter = useUpdateCharacter()
  
  const existingCharacter = profileData?.character
  // Character ID from backend can be number or string
  // TODO: Use actual character ID from profile once login/auth is implemented
  // For now, use ID 1 as default if we have a character (until login/auth is implemented)
  const existingCharacterId = existingCharacter ? '5' : undefined
  
  // Simple video player with auto-loop
  const player = useVideoPlayer(require('../assets/UI/thevoid.mp4'), (player) => {
    player.muted = true
    player.loop = true
    player.play()
  })
  
  const [config, setConfig] = useState<CharacterConfig>({
    baseIndex: 0,
    backgroundColor: 'Brown',
    backgroundIndex: 0,
    hairColor: 'Brown',
    hairIndex: 0,
    clothesColor: 'Brown',
    clothesIndex: 0,
    eyesColor: 'Brown',
    eyesIndex: 0,
    eyebrowsColor: 'Brown',
    eyebrowsIndex: 0,
    mouthIndex: 0,
  })

  // Load existing character data when available
  useEffect(() => {
    if (existingCharacter && profileData?.character) {
      const avatarConfigStr = buildAvatarConfig(profileData.character)
      if (avatarConfigStr) {
        try {
          const loadedConfig = JSON.parse(avatarConfigStr) as CharacterConfig
          setConfig(loadedConfig)
          setCharacterName(existingCharacter.name || '')
        } catch (error) {
          console.error('Failed to parse existing character config:', error)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCharacter?.id, profileData?.character?.id])

  function cycleIndex(current: number, direction: number, max: number): number {
    const newIndex = current + direction
    if (newIndex < 0) return max - 1
    if (newIndex >= max) return 0
    return newIndex
  }

  function handlePrevious() {
    haptics.lightImpact()
    playPageFlipSound()
    switch (selectedCategory) {
      case 'base':
        setConfig(prev => ({ ...prev, baseIndex: cycleIndex(prev.baseIndex, -1, BASE_COUNT) }))
        break
      case 'background':
        setConfig(prev => ({ ...prev, backgroundIndex: cycleIndex(prev.backgroundIndex, -1, BG_COUNT) }))
        break
      case 'hair':
        setConfig(prev => ({ ...prev, hairIndex: cycleIndex(prev.hairIndex, -1, HAIR_COUNT) }))
        break
      case 'clothes':
        setConfig(prev => ({ ...prev, clothesIndex: cycleIndex(prev.clothesIndex, -1, CLOTHES_COUNT) }))
        break
      case 'eyes':
        setConfig(prev => ({ ...prev, eyesIndex: cycleIndex(prev.eyesIndex, -1, EYES_COUNT) }))
        break
      case 'eyebrows':
        setConfig(prev => ({ ...prev, eyebrowsIndex: cycleIndex(prev.eyebrowsIndex, -1, EYEBROWS_COUNT) }))
        break
      case 'mouth':
        setConfig(prev => ({ ...prev, mouthIndex: cycleIndex(prev.mouthIndex, -1, MOUTH_COUNT) }))
        break
    }
  }

  function handleNext() {
    haptics.lightImpact()
    playPageFlipSound()
    switch (selectedCategory) {
      case 'base':
        setConfig(prev => ({ ...prev, baseIndex: cycleIndex(prev.baseIndex, 1, BASE_COUNT) }))
        break
      case 'background':
        setConfig(prev => ({ ...prev, backgroundIndex: cycleIndex(prev.backgroundIndex, 1, BG_COUNT) }))
        break
      case 'hair':
        setConfig(prev => ({ ...prev, hairIndex: cycleIndex(prev.hairIndex, 1, HAIR_COUNT) }))
        break
      case 'clothes':
        setConfig(prev => ({ ...prev, clothesIndex: cycleIndex(prev.clothesIndex, 1, CLOTHES_COUNT) }))
        break
      case 'eyes':
        setConfig(prev => ({ ...prev, eyesIndex: cycleIndex(prev.eyesIndex, 1, EYES_COUNT) }))
        break
      case 'eyebrows':
        setConfig(prev => ({ ...prev, eyebrowsIndex: cycleIndex(prev.eyebrowsIndex, 1, EYEBROWS_COUNT) }))
        break
      case 'mouth':
        setConfig(prev => ({ ...prev, mouthIndex: cycleIndex(prev.mouthIndex, 1, MOUTH_COUNT) }))
        break
    }
  }

  function handleColorChange(color: Color) {
    haptics.selection()
    playPageFlipSound()
    switch (selectedCategory) {
      case 'background':
        setConfig(prev => ({ ...prev, backgroundColor: color }))
        break
      case 'hair':
        setConfig(prev => ({ ...prev, hairColor: color }))
        break
      case 'clothes':
        setConfig(prev => ({ ...prev, clothesColor: color }))
        break
      case 'eyes':
        setConfig(prev => ({ ...prev, eyesColor: color }))
        break
      case 'eyebrows':
        setConfig(prev => ({ ...prev, eyebrowsColor: color }))
        break
    }
  }

  function getCurrentIndex(): number {
    switch (selectedCategory) {
      case 'base': return config.baseIndex
      case 'background': return config.backgroundIndex
      case 'hair': return config.hairIndex
      case 'clothes': return config.clothesIndex
      case 'eyes': return config.eyesIndex
      case 'eyebrows': return config.eyebrowsIndex
      case 'mouth': return config.mouthIndex
    }
  }

  function getMaxCount(): number {
    switch (selectedCategory) {
      case 'base': return BASE_COUNT
      case 'background': return BG_COUNT
      case 'hair': return HAIR_COUNT
      case 'clothes': return CLOTHES_COUNT
      case 'eyes': return EYES_COUNT
      case 'eyebrows': return EYEBROWS_COUNT
      case 'mouth': return MOUTH_COUNT
    }
  }

  function getCurrentColor(): Color | null {
    switch (selectedCategory) {
      case 'background': return config.backgroundColor
      case 'hair': return config.hairColor
      case 'clothes': return config.clothesColor
      case 'eyes': return config.eyesColor
      case 'eyebrows': return config.eyebrowsColor
      default: return null
    }
  }

  function needsColor(): boolean {
    return ['background', 'hair', 'clothes', 'eyes', 'eyebrows'].includes(selectedCategory)
  }

  async function handleCreateCharacter() {
    if (!characterName.trim()) return

    haptics.mediumImpact()
    playPageFlipSound()
    setIsSaving(true)

    try {
      // Convert frontend config to backend format
      const backendConfig = convertToBackendConfig(config)
      const avatarConfig = JSON.stringify(config)

      const requestData: any = {
        name: characterName.trim(),
        ...backendConfig,
      }

      // Preserve existing skin_color if updating and it's a valid value (>= 1)
      // Otherwise, use the default from convertToBackendConfig (which is 1)
      if (existingCharacterId && existingCharacter?.character_config?.selected_skin_color) {
        const existingSkinColor = existingCharacter.character_config.selected_skin_color
        if (existingSkinColor >= 1) {
          requestData.selected_skin_color = existingSkinColor
        }
      }

      console.log('Saving character with data:', {
        isUpdate: !!existingCharacterId,
        characterId: existingCharacterId,
        requestData,
      })

      if (existingCharacterId) {
        try {
          // Try to update existing character
          await updateCharacter.mutateAsync({
            id: existingCharacterId,
            data: requestData,
          })
        } catch (updateError: any) {
          // If update fails with 404, the character doesn't exist - create a new one instead
          if (updateError?.status === 404 || updateError?.message?.includes('No Character matches')) {
            console.log('Character not found, creating new character instead')
            await createCharacter.mutateAsync(requestData)
          } else {
            // Re-throw other errors
            throw updateError
          }
        }
      } else {
        // Create new character
        await createCharacter.mutateAsync(requestData)
      }

      // Invalidate user profile query to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(USER_ID) })
      queryClient.invalidateQueries({ queryKey: characterKeys.lists() })

      // Also update local game store for backwards compatibility
      setCharacter({
        id: existingCharacterId || Date.now().toString(),
        name: characterName.trim(),
        avatar: avatarConfig,
        createdAt: Date.now(),
      })

      router.replace('/hub')
    } catch (error: any) {
      console.error('Failed to save character - Full error object:', error)
      console.error('Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      // Extract error message from various error formats
      let errorMessage = 'Failed to save character. Please try again.'
      
      if (error?.message && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error?.status && error?.message) {
        errorMessage = `Error ${error.status}: ${error.message || error.statusText || 'Unknown error'}`
      } else if (error?.errors) {
        // Handle validation errors
        if (typeof error.errors === 'object') {
          const validationErrors = Object.entries(error.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
            .join('\n')
          errorMessage = `Validation errors:\n${validationErrors}`
        } else {
          errorMessage = String(error.errors)
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        // Try to extract any useful info
        errorMessage = error?.toString() || 'Unknown error occurred'
      }
      
      console.error('Error details extracted:', {
        message: errorMessage,
        status: error?.status,
        code: error?.code,
        errors: error?.errors,
      })
      
      Alert.alert(
        'Error Saving Character',
        errorMessage,
        [{ text: 'OK' }]
      )
    } finally {
      setIsSaving(false)
    }
  }

  const categories: { id: Category; label: string }[] = [
    { id: 'base', label: 'Base' },
    { id: 'background', label: 'Background' },
    { id: 'hair', label: 'Hair' },
    { id: 'clothes', label: 'Clothes' },
    { id: 'eyes', label: 'Eyes' },
    { id: 'eyebrows', label: 'Eyebrows' },
    { id: 'mouth', label: 'Mouth' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      {/* Background Video Layer */}
      <View 
        style={styles.videoContainer}
        pointerEvents="none"
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </View>
      {/* Overlay Layer */}
      <View 
        style={styles.overlay}
        pointerEvents="none" 
      />
      {/* Content Layer */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title with custom font */}
        <Text
          style={{
            fontFamily: 'BeyondWonderland',
            fontSize: 32,
            textAlign: 'center',
            color: theme.colors.primary,
            marginBottom: 8,
            letterSpacing: 2,
            textShadowColor: 'rgba(212, 165, 116, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}
        >
          Create Your Character
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            marginBottom: 40,
            fontStyle: 'italic',
            letterSpacing: 1,
            fontSize: 16,
          }}
        >
          Begin your journey through The Archive
        </Text>

        <Card 
          style={{ 
            backgroundColor: theme.colors.surface, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            borderRadius: 16,
            elevation: 4,
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text
              variant="labelLarge"
              style={{
                fontFamily: 'Quicksand-Bold',
                color: theme.colors.onSurface,
                marginBottom: 12,
                letterSpacing: 0.5,
                fontWeight: '700',
              }}
            >
              Character Name
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter your name"
              value={characterName}
              onChangeText={setCharacterName}
              maxLength={20}
              style={{ 
                backgroundColor: theme.colors.surfaceVariant,
              }}
              contentStyle={{ 
                color: theme.colors.onSurface,
                fontSize: 16,
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </Card.Content>
        </Card>

        {/* Character Preview */}
        <Card
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            borderRadius: 16,
            elevation: 4,
            overflow: 'hidden',
          }}
        >
          <Card.Content style={{ padding: 24, alignItems: 'center' }}>
            <Text
              variant="labelLarge"
              style={{
                fontFamily: 'Quicksand-Bold',
                color: theme.colors.onSurface,
                marginBottom: 16,
                letterSpacing: 0.5,
                fontWeight: '700',
              }}
            >
              Preview
            </Text>
            <View 
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            >
              <CharacterPreview
                baseIndex={config.baseIndex}
                backgroundColor={config.backgroundColor}
                backgroundIndex={config.backgroundIndex}
                hairColor={config.hairColor}
                hairIndex={config.hairIndex}
                clothesColor={config.clothesColor}
                clothesIndex={config.clothesIndex}
                eyesColor={config.eyesColor}
                eyesIndex={config.eyesIndex}
                eyebrowsColor={config.eyebrowsColor}
                eyebrowsIndex={config.eyebrowsIndex}
                mouthIndex={config.mouthIndex}
                size={200}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Category Selector */}
        <Card 
          style={{ 
            backgroundColor: theme.colors.surface, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            borderRadius: 16,
            elevation: 4,
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text
              variant="labelLarge"
              style={{
                fontFamily: 'Quicksand-Bold',
                color: theme.colors.onSurface,
                marginBottom: 16,
                letterSpacing: 0.5,
                fontWeight: '700',
              }}
            >
              Category
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={selectedCategory === category.id}
                    onPress={() => {
                      haptics.selection()
                      playPageFlipSound()
                      setSelectedCategory(category.id)
                    }}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                      borderWidth: selectedCategory === category.id ? 1 : 0,
                      borderColor: theme.colors.primary,
                    }}
                    textStyle={{
                      color: selectedCategory === category.id
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                      fontWeight: selectedCategory === category.id ? '600' : '400',
                    }}
                  >
                    {category.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Color Selector */}
        {needsColor() && (
          <Card 
            style={{ 
              backgroundColor: theme.colors.surface, 
              marginBottom: 24,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              borderRadius: 16,
              elevation: 4,
            }}
          >
            <Card.Content style={{ padding: 20 }}>
              <Text
                variant="labelLarge"
                style={{
                  fontFamily: 'Quicksand-Bold',
                  color: theme.colors.onSurface,
                  marginBottom: 16,
                  letterSpacing: 0.5,
                  fontWeight: '700',
                }}
              >
                Color
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {COLORS.map((color) => (
                    <Chip
                      key={color}
                      selected={getCurrentColor() === color}
                      onPress={() => handleColorChange(color)}
                      style={{
                        backgroundColor:
                          getCurrentColor() === color
                            ? theme.colors.primaryContainer
                            : theme.colors.surfaceVariant,
                        borderWidth: getCurrentColor() === color ? 1 : 0,
                        borderColor: theme.colors.primary,
                      }}
                      textStyle={{
                        color: getCurrentColor() === color
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                        fontWeight: getCurrentColor() === color ? '600' : '400',
                      }}
                    >
                      {color}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Style Controls */}
        <Card 
          style={{ 
            backgroundColor: theme.colors.surface, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            borderRadius: 16,
            elevation: 4,
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text
              variant="labelLarge"
              style={{
                fontFamily: 'Quicksand-Bold',
                color: theme.colors.onSurface,
                marginBottom: 20,
                letterSpacing: 0.5,
                fontWeight: '700',
              }}
            >
              Style
            </Text>
            <View 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 16,
              }}
            >
              <IconButton
                icon="chevron-left"
                size={36}
                iconColor={theme.colors.onSurface}
                onPress={handlePrevious}
                style={{ 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}
              />
              <View
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  minWidth: 100,
                }}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    color: theme.colors.onSurface,
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  {getCurrentIndex() + 1} / {getMaxCount()}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={36}
                iconColor={theme.colors.onSurface}
                onPress={handleNext}
                style={{ 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}
              />
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleCreateCharacter}
          disabled={!characterName.trim() || isSaving}
          loading={isSaving}
          style={{ 
            marginBottom: 32,
            borderRadius: 12,
            elevation: 4,
          }}
          contentStyle={{ 
            paddingVertical: 12,
          }}
          labelStyle={{
            fontSize: 18,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}
        >
          {existingCharacterId ? 'Update Character' : 'Begin Journey'}
        </Button>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
})
