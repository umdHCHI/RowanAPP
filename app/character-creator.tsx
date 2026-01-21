import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { CharacterPreview } from '@/components/character/CharacterPreview'
import { COLORS, Color, BASE_COUNT, BG_COUNT, HAIR_COUNT, CLOTHES_COUNT, EYES_COUNT, EYEBROWS_COUNT, MOUTH_COUNT } from '@/utils/character-assets'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useCreateCharacter, useUpdateCharacter } from '@/api/hooks/use-character'
import { useCurrentUserFullProfile, useIsAuthenticated, useRequiredAuthUserId, userKeys } from '@/api'
import { convertToBackendConfig, buildAvatarConfig } from '@/utils/character-avatar-config'
import { useQueryClient } from '@tanstack/react-query'
import { characterKeys } from '@/api/hooks/use-character'

type Category = 'base' | 'background' | 'hair' | 'clothes' | 'eyes' | 'eyebrows' | 'mouth'

function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return null
}

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
  const isAuthenticated = useIsAuthenticated()
  const insets = useSafeAreaInsets()
  const { setCharacter } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const [characterName, setCharacterName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('base')
  const [isSaving, setIsSaving] = useState(false)
  
  const queryClient = useQueryClient()
  if (!isAuthenticated) {
    return <LoginRedirect />
  }
  const userId = useRequiredAuthUserId()
  const { data: profileData } = useCurrentUserFullProfile()
  const createCharacter = useCreateCharacter()
  const updateCharacter = useUpdateCharacter()
  
  const existingCharacter = profileData?.character
  const existingCharacterId = existingCharacter?.id ? String(existingCharacter.id) : undefined
  
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
      queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(userId) })
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: Math.max(40, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title with custom font */}
        <RNText style={styles.title}>
          Create Your Character
        </RNText>
        <RNText style={styles.subtitle}>
          Begin your journey through The Archive
        </RNText>

        {/* Character Name Card */}
        <View style={styles.card}>
          <RNText style={styles.cardLabel}>
            Character Name
          </RNText>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#ffffff88"
            value={characterName}
            onChangeText={setCharacterName}
            maxLength={20}
            style={styles.textInput}
          />
        </View>

        {/* Character Preview Card */}
        <View style={styles.card}>
          <RNText style={styles.cardLabel}>
            Preview
          </RNText>
          <View style={styles.previewContainer}>
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
        </View>

        {/* Category Selector Card */}
        <View style={styles.card}>
          <RNText style={styles.cardLabel}>
            Category
          </RNText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  haptics.selection()
                  playPageFlipSound()
                  setSelectedCategory(category.id)
                }}
                style={[
                  styles.chip,
                  selectedCategory === category.id && styles.chipSelected
                ]}
                activeOpacity={0.7}
              >
                <RNText style={[
                  styles.chipText,
                  selectedCategory === category.id && styles.chipTextSelected
                ]}>
                  {category.label}
                </RNText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color Selector Card */}
        {needsColor() && (
          <View style={styles.card}>
            <RNText style={styles.cardLabel}>
              Color
            </RNText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => handleColorChange(color)}
                  style={[
                    styles.chip,
                    getCurrentColor() === color && styles.chipSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <RNText style={[
                    styles.chipText,
                    getCurrentColor() === color && styles.chipTextSelected
                  ]}>
                    {color}
                  </RNText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Style Controls Card */}
        <View style={styles.card}>
          <RNText style={styles.cardLabel}>
            Style
          </RNText>
          <View style={styles.styleControls}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={36} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.indexDisplay}>
              <RNText style={styles.indexText}>
                {getCurrentIndex() + 1} / {getMaxCount()}
              </RNText>
            </View>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-right" size={36} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleCreateCharacter}
          disabled={!characterName.trim() || isSaving}
          style={[
            styles.saveButton,
            (!characterName.trim() || isSaving) && styles.saveButtonDisabled
          ]}
          activeOpacity={0.9}
        >
          <RNText style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : (existingCharacterId ? 'Update Character' : 'Begin Journey')}
          </RNText>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 42,
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
    color: '#ffffffcc',
    marginBottom: 40,
    opacity: 0.9,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    marginBottom: 24,
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
  cardLabel: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'System',
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  chipText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#ffffffaa',
    fontWeight: '400',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  styleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 100,
  },
  indexText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 16,
    color: '#ffffff',
  },
})
