import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Text as RNText,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { Card, Text, TextInput, Button, useTheme, Divider } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { GameButton } from '@/components/GameButton'
import { useCreateJournalEntry, useJournalPrompts } from '@/api/hooks/use-journal'

import '../global.css'
import { JournalEntryResponse } from '@/api/types'
import { JournalContent } from '@/types/journal'

export default function Journal() {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const [journalEntry, setJournalEntry] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [savedAttributeChanges, setSavedAttributeChanges] = useState<JournalContent['attributeChanges']>(undefined)
  const { character, journal, attributes, journalPrompts, makeChoice, addEquipment, updateAttribute, progressJournal, setJournalPrompts } = useGameStore()
  const createJournalEntry = useCreateJournalEntry()
  
  // Fetch journal prompts from API
  const { data: apiPrompts, isLoading: isLoadingPrompts, error: promptsError } = useJournalPrompts()
  
  // Store prompts in Zustand when fetched
  useEffect(() => {
    if (apiPrompts && apiPrompts.length > 0) {
      setJournalPrompts(apiPrompts)
    }
  }, [apiPrompts, setJournalPrompts])
  
  // Get active and unlocked prompts, sorted by order
  const activePrompts = journalPrompts
    .filter((prompt) => prompt.is_active && prompt.unlocked)
    .sort((a, b) => a.order - b.order)
  
  // Get current prompt
  const currentPrompt = activePrompts[currentPromptIndex]
  const currentPromptText = currentPrompt?.text || ''
  const prompts = activePrompts.map((prompt) => prompt.text)

  // Reset prompt index when prompts change
  useEffect(() => {
    setCurrentPromptIndex(0)
  }, [activePrompts.length])

  // Attribute images mapping
  const attributeImages = {
    connection: {
      1: require('../attributes/connection/connectionLv1.png'),
      2: require('../attributes/connection/connectionLv2.png'),
      3: require('../attributes/connection/connectionLv3.png'),
      4: require('../attributes/connection/connectionLv4.png'),
      5: require('../attributes/connection/connectionLv5.png'),
    },
    courage: {
      1: require('../attributes/courage/courageLv1.png'),
      2: require('../attributes/courage/courageLv2.png'),
      3: require('../attributes/courage/courageLv3.png'),
      4: require('../attributes/courage/courageLv4.png'),
      5: require('../attributes/courage/courageLv5.png'),
    },
    exploration: {
      1: require('../attributes/exploration/explorationLv1.png'),
      2: require('../attributes/exploration/explorationLv2.png'),
      3: require('../attributes/exploration/explorationLv3.png'),
      4: require('../attributes/exploration/explorationLv4.png'),
      5: require('../attributes/exploration/explorationLv5.png'),
    },
    fear: {
      1: require('../attributes/fear/fear1.png'),
      2: require('../attributes/fear/fearLv2.png'),
      3: require('../attributes/fear/fearLv3.png'),
      4: require('../attributes/fear/fearLv4.png'),
      5: require('../attributes/fear/fearLv5.png'),
    },
  }


  async function handleSave() {
    if (isSaved || isSaving) return
    
    // Validate entry
    if (!journalEntry.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving your journal entry.')
      return
    }

    if (!currentPrompt) {
      Alert.alert('No Prompt', 'No active prompt available.')
      return
    }

    setIsSaving(true)
    playPageFlipSound()

    try {
      // Save journal entry to API
      await createJournalEntry.mutateAsync({
        title: currentPrompt.skill_category || `Journal Entry - ${new Date().toLocaleDateString()}`,
        content: journalEntry.trim(),
        tags: [currentPrompt.prompt_id, currentPrompt.category],
        mood: 'reflective',
      })

      // Note: API prompts don't have attributeChanges, so we skip that logic
      // If you need attribute changes, you'll need to add them to the API response
      const combinedChanges: JournalContent['attributeChanges'] = {}
      
      // Store changes for display (empty for now)
      setSavedAttributeChanges(combinedChanges)

      // Update journal progression
      // Move to next prompt if available
      if (currentPromptIndex < activePrompts.length - 1) {
        setCurrentPromptIndex(currentPromptIndex + 1)
      } else {
        // All prompts completed, navigate back
        progressJournal(0, journal.voidClarity)
      }

      setIsSaved(true)
      setIsSaving(false)

      // Navigate back after a short delay if this was the last prompt
      if (currentPromptIndex >= activePrompts.length - 1) {
        setTimeout(() => {
          router.replace('/hub')
        }, 1500)
      } else {
        // Reset saved state for next prompt
        setTimeout(() => {
          setIsSaved(false)
          setJournalEntry('')
        }, 1500)
      }
    } catch (error) {
      setIsSaving(false)
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save journal entry. Please try again.'
      )
    }
  }

  

 

  function renderAttributeBar() {
    const attributeConfig = [
      { key: 'connection' as const, label: 'Connection' },
      { key: 'courage' as const, label: 'Courage' },
      { key: 'exploration' as const, label: 'Exploration' },
      { key: 'fear' as const, label: 'Fear' },
    ]
    return (
      <View style={styles.attributeBar}>
        {attributeConfig.map((attr) => {
          const level = attributes[attr.key]
          const imageSource = attributeImages[attr.key][level as keyof typeof attributeImages.connection]
          return (
            <View key={attr.key} style={styles.attributeItem}>
              <Image
                source={imageSource}
                style={styles.attributeIcon}
                resizeMode="contain"
              />
              <Text style={styles.attributeValue}>{level}</Text>
            </View>
          )
        })}
      </View>
    )
  }

  function renderAttributeChanges(changes?: JournalContent['attributeChanges']) {
    if (!changes) return null

    const attributeConfig = [
      { key: 'connection' as const, images: attributeImages.connection },
      { key: 'courage' as const, images: attributeImages.courage },
      { key: 'exploration' as const, images: attributeImages.exploration },
      { key: 'fear' as const, images: attributeImages.fear },
    ]

    return (
      <View style={styles.attributeChangesContainer}>
        {attributeConfig.map((attr) => {
          const change = changes[attr.key]
          if (change === undefined || change === 0) return null
          
          const currentLevel = attributes[attr.key]
          const displayLevel = Math.max(1, Math.min(5, currentLevel))
          const imageSource = attr.images[displayLevel as keyof typeof attributeImages.connection]
          const sign = change > 0 ? '+' : ''
          
          return (
            <View key={attr.key} style={styles.attributeChangeItem}>
              <Image
                source={imageSource}
                style={styles.attributeChangeIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.attributeChangeText,
                  { color: change > 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                {sign}{change}
              </Text>
            </View>
          )
        })}
      </View>
    )
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 20,
            paddingTop: insets.top + 100,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            Your Journal
          </RNText>
          <Text variant="bodyMedium" className="text-center mb-10">
            Welcome back, {character?.name || 'Scholar'}
          </Text>

          {/* Attributes Bar at Top */}
          <View
            style={{
              position: 'relative',
             // top: 0,
              alignItems: 'center',
              justifyContent: 'center',
             // width: '100%',
             // height: 100,
              zIndex: 0,
            }}
          >
            {renderAttributeBar()}
          </View>

          {/* Reflection Prompts */}
          <View className="mb-6 w-full items-center">
            <View style={{ alignItems: 'center', width: '100%' }}>
              <RNText
                style={{
                  fontFamily: 'FontText-Gold',
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 8,
                  letterSpacing: 1,
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                  color: '#c99564b8',
                }}
              >
                Reflection Prompts
              </RNText>
              
              {/* Loading State */}
              {isLoadingPrompts && (
                <View className="mb-4 min-h-[60px] justify-center">
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text variant="bodyMedium" className="mt-2 text-center">
                    Loading prompts...
                  </Text>
                </View>
              )}
              
              {/* Error State */}
              {promptsError && !isLoadingPrompts && (
                <View className="mb-4 min-h-[60px] justify-center">
                  <Text variant="bodyMedium" className="text-center" style={{ color: theme.colors.error }}>
                    Failed to load prompts. Please try again.
                  </Text>
                </View>
              )}
              
              {/* Current Prompt */}
              {!isLoadingPrompts && !promptsError && currentPrompt && (
                <>
                  <View className="mb-2">
                    <RNText
                      style={{
                        fontFamily: 'FontText-Gold',
                        fontSize: 12,
                        textAlign: 'center',
                        opacity: 0.7,
                        color: '#FFD700',
                      }}
                    >
                      {currentPrompt.skill_category} • {currentPrompt.difficulty}
                    </RNText>
                  </View>
                  <View className="mb-4 min-h-[60px] justify-center">
                    <RNText
                      style={{
                        fontFamily: 'FontText-Gold',
                        fontSize: 14,
                        marginTop: 8,
                        marginLeft: 30,
                        marginRight: 30,
                        opacity: 0.8,
                        letterSpacing: 0.5,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                        textAlign: 'center',
                        color: '#FFD700',
                      }}
                    >
                      {currentPromptText}
                    </RNText>
                  </View>
                </>
              )}
              
              {/* No Prompts Available */}
              {!isLoadingPrompts && !promptsError && activePrompts.length === 0 && (
                <View className="mb-4 min-h-[60px] justify-center">
                  <Text variant="bodyMedium" className="text-center">
                    No prompts available at this time.
                  </Text>
                </View>
              )}

              {/* Navigation Controls */}
              {!isLoadingPrompts && !promptsError && prompts.length > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <View style={{ opacity: currentPromptIndex === 0 ? 0.5 : 1 }}>
                    <GameButton
                      normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
                      selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                      pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                      label="Previous"
                      onPress={() => {
                        if (currentPromptIndex > 0) {
                          setCurrentPromptIndex((prev) => prev - 1)
                        }
                      }}
                      width={100}
                      height={40}
                    />
                  </View>
                  <RNText
                    style={{
                      fontFamily: 'FontText-Gold',
                      fontSize: 12,
                      color: '#FFD700',
                      opacity: 0.7,
                    }}
                  >
                    {currentPromptIndex + 1} / {prompts.length}
                  </RNText>
                  <View style={{ opacity: currentPromptIndex === prompts.length - 1 ? 0.5 : 1 }}>
                    <GameButton
                      normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
                      selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                      pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                      label="Next"
                      onPress={() => {
                        if (currentPromptIndex < prompts.length - 1) {
                          setCurrentPromptIndex((prev) => prev + 1)
                        }
                      }}
                      width={100}
                      height={40}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Journal Entry */}
          {!isLoadingPrompts && !promptsError && currentPrompt && (
            <Card
              className="mb-6 border"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
                borderRadius: theme.roundness * 1.33,
              }}
              elevation={2}
            >
              <Card.Content className="p-5">
                <Text variant="labelLarge" className="mb-3">
                  Your Reflection
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={8}
                  placeholder="Write your thoughts here..."
                  value={journalEntry}
                  onChangeText={setJournalEntry}
                  className="min-h-[200px]"
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                  }}
                  contentStyle={{
                    color: theme.colors.onSurface,
                    lineHeight: 24,
                  }}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  disabled={isSaving || isSaved}
                />
              </Card.Content>
            </Card>
          )}

          {isSaved && (
            <View className="items-center mb-4">
              <Text
                variant="bodyMedium"
                className="text-center"
                style={{ color: theme.colors.primary }}
              >
                ✓ Entry saved!
              </Text>
              {renderAttributeChanges(savedAttributeChanges)}
            </View>
          )}

          {!isLoadingPrompts && !promptsError && currentPrompt && (
            <View className={`items-center mb-3 ${isSaved || isSaving ? 'opacity-60' : 'opacity-100'}`}>
              {isSaving ? (
                <View style={{ width: 200, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : (
                <GameButton
                  normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
                  selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                  pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
                  label={isSaved ? 'Saved!' : 'Save Entry'}
                  onPress={handleSave}
                  width={200}
                  height={50}
                />
              )}
            </View>
          )}

          <View className="items-center mb-8">
            <GameButton
              normalImage={require('../assets/UI/buttons/red/Button_06A_Normal.png')}
              selectedImage={require('../assets/UI/buttons/red/Button_06A_Pressed.png')}
              pressedImage={require('../assets/UI/buttons/red/Button_06A_Pressed.png')}
              label="Return to Archive"
              onPress={() => {
                playPageFlipSound()
                router.replace('/hub')
              }}
              width={200}
              height={50}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}


const styles = StyleSheet.create({
  attributeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 60,
  },
  attributeItem: {
    alignItems: 'center',
    gap: 4,
  },
  attributeIcon: {
    width: 32,
    height: 32,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5E6D3',
  },
  attributeChangesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  attributeChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attributeChangeIcon: {
    width: 20,
    height: 20,
  },
  attributeChangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
})
