import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'

import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CharacterPreview } from '@/components/character/CharacterPreview'
import { COLORS, Color, BASE_COUNT, BG_COUNT, HAIR_COUNT, CLOTHES_COUNT, EYES_COUNT, EYEBROWS_COUNT, MOUTH_COUNT } from '@/utils/character-assets'
import { useMyCharacter, useCreateCharacter, useUpdateCharacterCustomization, characterKeys } from '@/api/hooks/use-character'
import { useRequireAuth, useRequiredAuthUserId, useAuthActions, useCurrentUserFullProfile, useUpdateUsername, userKeys } from '@/api'
import { convertToBackendConfig, buildAvatarConfig } from '@/utils/character-avatar-config'
import { useQueryClient } from '@tanstack/react-query'
import { CharacterConfig, Category } from '@/types/characterCreator/character-creator'
import { GameBackground } from '@/components/ui/GameBackground'
import { characterCreatorStyles } from '@/styles/characterCreator/character-creator'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'


export default function CharacterCreator() {
  useRequireAuth() // Redirects to login if not authenticated
  
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setHasCharacter } = useAuthActions()
  const [characterName, setCharacterName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('base')
  const [isSaving, setIsSaving] = useState(false)
  
  const queryClient = useQueryClient()
  const userId = useRequiredAuthUserId()
  const { data: existingCharacter } = useMyCharacter()
  const { data: userProfile } = useCurrentUserFullProfile()
  const createCharacter = useCreateCharacter()
  const updateCharacter = useUpdateCharacterCustomization()
  const updateUsername = useUpdateUsername()
 

  
  const [config, setConfig] = useState<CharacterConfig>({
    baseIndex: 0,
    backgroundColor: 'Light Brown',
    backgroundIndex: 0,
    hairColor: 'Light Brown',
    hairIndex: 0,
    clothesColor: 'Light Brown',
    clothesIndex: 0,
    eyesColor: 'Light Brown',
    eyesIndex: 0,
    eyebrowsColor: 'Light Brown',
    eyebrowsIndex: 0,
    mouthIndex: 0,
  })

  // Load username from user profile
  useEffect(() => {
    if (userProfile?.username && !characterName) {
      setCharacterName(userProfile.username)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.username])

  // Load existing character data when available
  useEffect(() => {
    if (existingCharacter) {
      const avatarConfigStr = buildAvatarConfig(existingCharacter)
      if (avatarConfigStr) {
        try {
          const loadedConfig = JSON.parse(avatarConfigStr) as CharacterConfig
          setConfig(loadedConfig)
        } catch (error) {
          console.error('Failed to parse existing character config:', error)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCharacter?.id])

  function cycleIndex(current: number, direction: number, max: number): number {
    const newIndex = current + direction
    if (newIndex < 0) return max - 1
    if (newIndex >= max) return 0
    return newIndex
  }

  function handlePrevious() {

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
    setIsSaving(true)

    try {
      // Convert frontend config to backend format
      const backendConfig = convertToBackendConfig(config)

      const requestData: any = {
        ...backendConfig,
      }

    if (existingCharacter?.character_config?.selected_skin_color) {
      const existingSkinColor = existingCharacter.character_config.selected_skin_color
      if (existingSkinColor >= 1) requestData.selected_skin_color = existingSkinColor
    }

    if (existingCharacter?.id) {
      await updateCharacter.mutateAsync({ ...requestData })
    } else {
      await createCharacter.mutateAsync(requestData)
    }

    // Update username if changed
    const trimmedName = characterName.trim()
    if (trimmedName && trimmedName !== userProfile?.username) {
      await updateUsername.mutateAsync(trimmedName)
    }

    queryClient.invalidateQueries({ queryKey: characterKeys.mine(userId) })
    queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(userId) })

    setHasCharacter(true)
    router.replace('/hub')
  } catch (error: any) {
    // keep your existing error handling
    console.error('Failed to save character - Full error object:', error)
    Alert.alert('Error Saving Character', error?.message ?? 'Failed to save character.', [{ text: 'OK' }])
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
    <View style={characterCreatorStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      {/* Background Image */}
      <GameBackground />
      {/* Content Layer */}
      <ScrollView
        style={characterCreatorStyles.scrollView}
        contentContainerStyle={[characterCreatorStyles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: Math.max(40, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title with custom font */}
        <View style={{ marginBottom: 32 }}>
          <Text variant="heading" size={1} align="center">
            Create Your Character
          </Text>
          <Text variant="title" size={1} align="center" marginTop={16}>
            Begin your journey through The Archive
          </Text>
        </View>

        {/* Character Name Card */}
        <View style={characterCreatorStyles.cardSection}>
          <Card fullWidth>
            <View style={characterCreatorStyles.nameLabelRow}>
              <Text variant="label" size={1} align="center">
                Character Name
              </Text>
            </View>
            <View style={characterCreatorStyles.nameLabelSpacer} />
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#ffffff88"
              value={characterName}
              onChangeText={setCharacterName}
              maxLength={20}
              style={[characterCreatorStyles.textInput, characterCreatorStyles.nameInputBottom]}
            />
          </Card>
        </View>

        {/* Character Preview Card */}
        <View style={characterCreatorStyles.cardSection}>
          <Card fullWidth>
          <View style={characterCreatorStyles.nameLabelRow}>
            <Text variant="label" size={1} align="center">
              Preview
            </Text>
            </View>
            <View style={characterCreatorStyles.nameLabelSpacer} />
            <View style={characterCreatorStyles.previewContainer}>
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
          </Card>
        </View>

        {/* Category Selector Card */}
        <View style={characterCreatorStyles.cardSection}>
          <Card fullWidth>
            <View style={characterCreatorStyles.nameLabelRow}>
              <Text variant="label" size={1} align="center">
                Category
              </Text>
            </View>
            <View style={characterCreatorStyles.nameLabelSpacer} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={characterCreatorStyles.chipContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    characterCreatorStyles.chip,
                    selectedCategory === category.id && characterCreatorStyles.chipSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <Text variant="label" size={2} align="center">
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        </View>

        {/* Color Selector Card */}
        {needsColor() && (
          <View style={characterCreatorStyles.cardSection}>
            <Card fullWidth>
              <Text variant="label" size={2} align="center">
                Color
              </Text>
            <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={characterCreatorStyles.chipContainer}
              >
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => handleColorChange(color)}
                    style={[
                      characterCreatorStyles.chip,
                      getCurrentColor() === color && characterCreatorStyles.chipSelected
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text variant="label" size={2} align="center">
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          </View>
        )}

        {/* Style Controls Card */}
        <View style={characterCreatorStyles.cardSection}>
          <Card fullWidth>
            <Text variant="label" size={2} align="center">
              Style
            </Text>
            <View style={characterCreatorStyles.styleControls}>
              <TouchableOpacity
                onPress={handlePrevious}
                style={characterCreatorStyles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons name="chevron-left" size={36} color="#ffffff" />
              </TouchableOpacity>
              <View style={characterCreatorStyles.indexDisplay}>
                <Text variant="label" size={2} align="center">
                  {getCurrentIndex() + 1} / {getMaxCount()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleNext}
                style={characterCreatorStyles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons name="chevron-right" size={36} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Save Button */}
        <Button
          onPress={handleCreateCharacter}
          variant="primary"
          size="default"
          hapticType="light"
          enableHaptics
          enableSound
          fullWidth
          disabled={!characterName.trim() || isSaving}
        >
          <Text variant="titleWhite" size={1} align="center">
            {isSaving ? 'Saving...' : existingCharacter?.id ? 'Update Character' : 'Begin Journey'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  )
}
