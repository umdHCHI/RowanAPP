

import { useState, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text as RNText,
  Keyboard,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useCreateJournalEntry, useUpdateJournalEntry, useJournalPrompts, useJournalEntryByPrompt } from '@/api/hooks/use-journal'
import { journalService } from '@/api/services/journal.service'
import { useQueryClient } from '@tanstack/react-query'
import { journalKeys } from '@/api/hooks/use-journal'
import { useGainLumens } from '@/api'
import { JournalPromptSection } from './JournalPromptSection'
import { JournalEntryCard } from './JournalEntryCard'
import { JournalSaveButton } from './JournalSaveButton'
import { JournalAttributeChanges } from './JournalAttributeChanges'
import type { ReflectionMode } from './JournalModeSelector'
import { DrawingCanvas, type Stroke } from './DrawingCanvas'
import { VoiceMemoRecorder } from './VoiceMemoRecorder'
import type { JournalContent } from '@/types/journal'
import { useHaptics } from '@/utils/useHaptics'
import { StoryBackground } from '@/components/story/StoryBackground'
import { Header } from '@/components/header'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function JournalPage() {
  const router = useRouter()
  const searchParams = useLocalSearchParams<{ promptId?: string; from?: string }>()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const scrollViewRef = useRef<ScrollView>(null)
  const inputContainerRef = useRef<View>(null)
  const responseAreaYRef = useRef<number>(0)
  
  // Mode and content state
  const [mode, setMode] = useState<ReflectionMode>('journal')
  const [text, setText] = useState('')
  const [drawing, setDrawing] = useState<Stroke[]>([])
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number | null>(null)
  
  // UI state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [savedAttributeChanges, setSavedAttributeChanges] = useState<JournalContent['attributeChanges']>(undefined)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const { journal, journalPrompts, progressJournal, setJournalPrompts, addMemory } = useGameStore()
  const queryClient = useQueryClient()
  const createJournalEntry = useCreateJournalEntry()
  const updateJournalEntry = useUpdateJournalEntry()
  const gainLumens = useGainLumens()
  const haptics = useHaptics()
   
  
  // Fetch journal prompts from API
  const { data: apiPrompts, isLoading: isLoadingPrompts, error: promptsError } = useJournalPrompts()
  
  // Store prompts in Zustand when fetched
  useEffect(() => {
    if (apiPrompts && apiPrompts.length > 0) {
      setJournalPrompts(apiPrompts)
    }
  }, [apiPrompts, setJournalPrompts])
  
  // Map mode to category (API uses "journal" for writing prompts)
  const modeToCategory: Record<ReflectionMode, string[]> = {
    'journal': ['journal', 'journal'],
    'draw': ['draw'],
    'voice': ['voice'],
  }
  
  const forcedPrompt = searchParams.promptId
    ? journalPrompts.find((prompt) => prompt.prompt_id === searchParams.promptId)
    : null

  function getActivePromptsForMode(
    modeValue: ReflectionMode,
    pinnedPrompt?: typeof journalPrompts[number] | null
  ) {
    const filteredPrompts = journalPrompts
      .filter((prompt) => 
        prompt.is_active && 
        prompt.unlocked && 
        modeToCategory[modeValue].includes(String(prompt.category ?? '').toLowerCase())
      )
      .sort((a, b) => a.order - b.order)

    if (!pinnedPrompt) return filteredPrompts

    const pinnedCategory = String(pinnedPrompt.category ?? '').toLowerCase()
    const isPinnedForMode = modeToCategory[modeValue].includes(pinnedCategory)
    if (!isPinnedForMode) return filteredPrompts

    const alreadyIncluded = filteredPrompts.some((prompt) => prompt.prompt_id === pinnedPrompt.prompt_id)
    if (alreadyIncluded) return filteredPrompts

    return [pinnedPrompt, ...filteredPrompts]
  }

  // Get active and unlocked prompts filtered by category, sorted by order
  const activePrompts = getActivePromptsForMode(mode, forcedPrompt)
  
  // Get current prompt
  const currentPrompt = activePrompts[currentPromptIndex]
  
  // Fetch existing entry for current prompt and mode (if prompt is available)
  const { data: existingEntry, isLoading: isLoadingEntry } = useJournalEntryByPrompt(
    currentPrompt?.id || null,
    mode,
    currentPrompt?.prompt_id || null
  )
  
  // Handle promptId query parameter - find and set the prompt if it exists
  useEffect(() => {
    if (searchParams.promptId && journalPrompts.length > 0) {
      const targetPrompt = journalPrompts.find((p) => p.prompt_id === searchParams.promptId)
      if (!targetPrompt) return
      
      const promptCategory = String(targetPrompt.category ?? '').toLowerCase()
      let nextMode: ReflectionMode = 'journal'
      if (promptCategory === 'draw') nextMode = 'draw'
      if (promptCategory === 'voice') nextMode = 'voice'

      if (mode !== nextMode) {
        setMode(nextMode)
      }

      const targetPrompts = getActivePromptsForMode(nextMode, targetPrompt)
      const targetPromptIndex = targetPrompts.findIndex((p) => p.prompt_id === searchParams.promptId)
      if (targetPromptIndex !== -1) {
        setCurrentPromptIndex(targetPromptIndex)
      } else {
        setCurrentPromptIndex(0)
      }
    }
  }, [searchParams.promptId, journalPrompts, mode])
  
  // Reset prompt index when mode changes to show first prompt of new category
  useEffect(() => {
    // Only reset if we don't have a promptId in the URL
    if (!searchParams.promptId) {
      setCurrentPromptIndex(0)
    }
  }, [mode, searchParams.promptId])


  // Helper to scroll to response area
  function scrollToResponseArea() {
    if (scrollViewRef.current && responseAreaYRef.current > 0) {
      scrollViewRef.current.scrollTo({ y: responseAreaYRef.current - 20, animated: true })
    } else {
      // Fallback to scrollToEnd if Y position not available
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  // Load existing entry content when found, or reset when mode changes
  useEffect(() => {
    if (existingEntry && currentPrompt && existingEntry.entry_type === mode) {
      // Load existing content for current mode
      if (mode === 'journal') {
        setText(existingEntry.content)
        setDrawing([])
        setAudioUri(null)
        setAudioDurationSeconds(null)
      } else if (mode === 'draw') {
        try {
          const parsed = JSON.parse(existingEntry.content)
          if (Array.isArray(parsed)) {
            setDrawing(parsed)
          } else {
            setDrawing([])
          }
        } catch (e) {
          // If parsing fails, leave drawing empty
          setDrawing([])
        }
        setText('')
        setAudioUri(null)
        setAudioDurationSeconds(null)
        // Scroll to response area when switching to draw mode
        setTimeout(() => {
          scrollToResponseArea()
        }, 100)
      } else if (mode === 'voice') {
        // For voice entries, the content might be the audio URI or a reference
        // Check if it looks like a URI, otherwise it might be stored differently
        if (existingEntry.content.startsWith('file://') || existingEntry.content.startsWith('http')) {
          setAudioUri(existingEntry.content)
        } else {
          setAudioUri(null)
        }
        setAudioDurationSeconds(existingEntry.duration_seconds ?? null)
        setText('')
        setDrawing([])
      }
    } else {
      // Reset content when mode changes or no existing entry
      setIsDrawing(false)
      if (mode === 'journal') {
        setText('')
        setDrawing([])
        setAudioUri(null)
        setAudioDurationSeconds(null)
      } else if (mode === 'draw') {
        setText('')
        setDrawing([])
        setAudioUri(null)
        setAudioDurationSeconds(null)
        // Scroll to response area when switching to draw mode
        setTimeout(() => {
          scrollToResponseArea()
        }, 100)
      } else if (mode === 'voice') {
        setText('')
        setDrawing([])
        setAudioUri(null)
        setAudioDurationSeconds(null)
      }
    }
  }, [existingEntry, currentPrompt, mode])

  // Handle keyboard visibility to scroll to input
  useEffect(() => {
    if (mode !== 'journal') return

    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    )

    return () => {
      keyboardShowListener.remove()
    }
  }, [mode])

  function handleBack() {
    playPageFlipSound()
    if (searchParams.from === 'story' || searchParams.from === 'resources') {
      router.back()
      return
    }
    router.replace('/hub')
  }




  function handleViewHistory() {
    playPageFlipSound()
    // TODO: Navigate to resources with memories tab selected when tab parameter support is added
    router.push('/resources')
  }

  function matchesCurrentPrompt(entry: { prompt?: number | string; prompt_id?: string } | null) {
    if (!entry || !currentPrompt) return false
    if (entry.prompt != null && String(entry.prompt) === String(currentPrompt.id)) return true
    if (entry.prompt_id && entry.prompt_id === currentPrompt.prompt_id) return true
    return false
  }

  async function handleSave() {
    if (isSaved || isSaving) return

    if (!currentPrompt) {
      Alert.alert('No Prompt', 'No active prompt available.')
      return
    }

    // Validate based on mode
    if (mode === 'journal' && !text.trim()) {
      Alert.alert('Empty Entry', 'Please journal something before saving your journal entry.')
      return
    }

    if (mode === 'draw' && drawing.length === 0) {
      Alert.alert('Empty Drawing', 'Please draw something before saving.')
      return
    }

    if (mode === 'voice' && !audioUri) {
      Alert.alert('No Recording', 'Please record a voice memo before saving.')
      return
    }

    setIsSaving(true)
    playPageFlipSound()

    // Prepare content based on mode
    let content = ''
    if (mode === 'journal') {
      content = text.trim()
    } else if (mode === 'draw') {
      content = JSON.stringify(drawing)
    } else if (mode === 'voice') {
      content = audioUri || ''
    }

    // Create memory object
    const memory = {
      id: `reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: currentPrompt.skill_category || `Reflection - ${new Date().toLocaleDateString()}`,
      description: mode === 'journal' ? content.substring(0, 100) : undefined,
      type: 'REFLECTION',
      modality: mode,
      content: content,
      createdAt: new Date().toISOString(),
    }

    // Immediately add to store so it appears in Memories tab
    addMemory(memory)

    let didSave = false
    let resolvedExistingEntry = existingEntry

    // If the query hasn't returned yet, do a quick lookup to avoid duplicate create
    if (!resolvedExistingEntry) {
      try {
        const entriesResponse = await journalService.getAll(1, 100)
        let entries: any[] = []

        if (entriesResponse && typeof entriesResponse === 'object') {
          if ('data' in entriesResponse && Array.isArray(entriesResponse.data)) {
            entries = entriesResponse.data
          } else if (Array.isArray(entriesResponse)) {
            entries = entriesResponse
          }
        }

        const existingEntryForPrompt = entries.find((e) => matchesCurrentPrompt(e))
        if (existingEntryForPrompt) {
          resolvedExistingEntry = existingEntryForPrompt
        }
      } catch (lookupError) {
      }
    }

    try {
      // Check if we should update existing entry or create new one
      // If we have an existing entry for this prompt, update it (even if entry_type is different)
      if (resolvedExistingEntry && resolvedExistingEntry.id) {
        // Update existing entry
        await updateJournalEntry.mutateAsync({
          id: String(resolvedExistingEntry.id),
          data: {
            content: mode === 'journal' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
            entry_type: mode,
            duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
          },
        })
        // Invalidate queries to refetch the entry
        queryClient.invalidateQueries({ queryKey: journalKeys.all })
        didSave = true
      } else {
        // Create new entry
        await createJournalEntry.mutateAsync({
          prompt: currentPrompt.id,
          entry_type: mode,
          content: mode === 'journal' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
          duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
        })
        didSave = true
      }
    } catch (error: any) {
      const errorMessage = String(error?.message || '')
      const isDuplicatePrompt = errorMessage.includes('already completed') || error?.status === 400
      const isDuplicateProgress = errorMessage.includes('game_playerprogress') || errorMessage.includes('duplicate key')

      // Check if error is about duplicate entry or progress and try to update or confirm existence
      if (isDuplicatePrompt || isDuplicateProgress) {
        try {
          const entriesResponse = await journalService.getAll(1, 100)
          let entries: any[] = []

          if (entriesResponse && typeof entriesResponse === 'object') {
            if ('data' in entriesResponse && Array.isArray(entriesResponse.data)) {
              entries = entriesResponse.data
            } else if (Array.isArray(entriesResponse)) {
              entries = entriesResponse
            }
          }

          const existingEntryForPrompt = entries.find((e) => matchesCurrentPrompt(e))

          if (existingEntryForPrompt?.id) {
            // If it already exists, treat as saved to avoid blocking the user
            queryClient.invalidateQueries({ queryKey: journalKeys.all })
            didSave = true
            return
          }

          // If entry doesn't exist, try a last-chance update when we have a known entry id
          if (existingEntry?.id) {
            await updateJournalEntry.mutateAsync({
              id: String(existingEntry.id),
              data: {
                content: mode === 'journal' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
                entry_type: mode,
                duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
              },
            })
            queryClient.invalidateQueries({ queryKey: journalKeys.all })
            didSave = true
            return
          }
        } catch (updateError) {
          console.error('Failed to confirm or update existing entry:', updateError)
        }
      }

      // If update attempt failed or entry not found, log the original error
      console.error('Failed to save to backend:', error)
    }

    if (!didSave) {
      setIsSaving(false)
      Alert.alert('Save Failed', 'We could not save this entry. Please try again.')
      return
    }

    // Check if this is the last prompt before we do anything else
    const isLastPrompt = currentPromptIndex >= activePrompts.length - 1

    // Award 1 lumen for completing a journal entry
    try {
      await gainLumens.mutateAsync(1)
    } catch (error) {
      // Log error but don't block the save success
      console.error('Failed to award experience:', error)
    }

    // Note: API prompts don't have attributeChanges, so we skip that logic
    const combinedChanges: JournalContent['attributeChanges'] = {}
    setSavedAttributeChanges(combinedChanges)

    // Update journal progression
    if (!isLastPrompt) {
      // Move to next prompt
      setCurrentPromptIndex(currentPromptIndex + 1)
    } else {
      progressJournal(0, journal.voidClarity)
    }

    setIsSaved(true)
    setIsSaving(false)

    // Handle navigation and reset based on whether this is the last prompt
    if (isLastPrompt) {
      // Last prompt: Show confirmation, then navigate based on origin
      setTimeout(() => {
        if (searchParams.from === 'story' || searchParams.from === 'resources') {
          router.back()
          return
        }
        router.replace('/hub')
      }, 2500) // Give time to see confirmation and lumens reward
    } else {
      // Not last prompt: Reset form for next prompt after showing confirmation
      setTimeout(() => {
        setIsSaved(false)
        setText('')
        setDrawing([])
        setAudioUri(null)
        setAudioDurationSeconds(null)
      }, 2000) // Show confirmation before resetting
    }
  }

  function renderModeContent() {
    if (mode === 'journal') {
      return (
        <JournalEntryCard
          value={text}
          onChangeText={setText}
          disabled={isSaving || isSaved}
        />
      )
    }

    if (mode === 'draw') {
      return (
        <View style={[styles.drawingContainer, { minHeight: Math.min(420, SCREEN_HEIGHT * 0.42) }]}>
          <DrawingCanvas 
            value={drawing} 
            onChange={setDrawing}
            onDrawingStart={() => setIsDrawing(true)}
            onDrawingEnd={() => setIsDrawing(false)}
          />
        </View>
      )
    }

    if (mode === 'voice') {
      return (
        <View style={styles.voiceContainer}>
          <VoiceMemoRecorder
            onSave={({ uri, durationSeconds }) => {
              setAudioUri(uri || null)
              setAudioDurationSeconds(durationSeconds)
            }}
          />
        </View>
      )
    }

    return null
  }

  return (
    <StoryBackground showOverlay={false}>
      <View style={styles.root}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View className="flex-1">
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={[
                styles.scrollContent,
                { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 180 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!isDrawing}
              nestedScrollEnabled={true}
            >
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <RNText
              style={[
                styles.title,
                {
                  color: '#ffffff',
                  textShadowColor: 'rgba(0, 0, 0, 0.6)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                },
              ]}
            >
              Your Journal
            </RNText>
          </View>

          {/* Prompt Card */}
          <JournalPromptSection
            currentPrompt={currentPrompt}
            isLoading={isLoadingPrompts}
            error={promptsError}
          />

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'journal' && styles.tabActive]}
              onPress={() => {
                if (mode !== 'journal') {
                  playPageFlipSound()
                  setMode('journal')
                }
              }}
            >
              <RNText style={[styles.tabText, mode === 'journal' && styles.tabTextActive]}>
                JOURNAL
              </RNText>
              {mode === 'journal' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === 'voice' && styles.tabActive]}
              onPress={() => {
                if (mode !== 'voice') {
                  playPageFlipSound()
                  setMode('voice')
                }
              }}
            >
              <RNText style={[styles.tabText, mode === 'voice' && styles.tabTextActive]}>
                VOICE
              </RNText>
              {mode === 'voice' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === 'draw' && styles.tabActive]}
              onPress={() => {
                if (mode !== 'draw') {
                  playPageFlipSound()
                  setMode('draw')
                }
              }}
            >
              <RNText style={[styles.tabText, mode === 'draw' && styles.tabTextActive]}>
                DRAWING
              </RNText>
              {mode === 'draw' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>

          {/* Response Area (always shown when prompt is available) */}
          {!isLoadingPrompts && !promptsError && currentPrompt && (
            <View 
              ref={inputContainerRef} 
              style={styles.responseArea}
              onLayout={(event) => {
                responseAreaYRef.current = event.nativeEvent.layout.y
              }}
            >
              {/* Mode Content */}
              {renderModeContent()}

              {/* Saved confirmation */}
              {isSaved && (
                <View style={styles.savedContainer}>
                  <RNText style={styles.savedText}>
                    ✓ Entry saved!
                  </RNText>
                  <JournalAttributeChanges />
                  <RNText style={styles.congratsText}>
                    Congratulations!
                  </RNText>
                </View>
              )}

              {/* Save Button */}
              <JournalSaveButton
                isSaved={isSaved}
                isSaving={isSaving}
                onPress={handleSave}
                haptics={haptics.selection}
                pageFlipSound={playPageFlipSound}
              />
            </View>
          )}


                </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Header
        showMenu={false}
        rightActions={[
          {
            icon: 'close',
            onPress: handleBack,
          },
        ]}
      />
    </StoryBackground>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 42,
    textAlign: 'center',
    lineHeight: 48,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabActive: {
    // Active state handled by underline
  },
  tabText: {
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ffffff',
  },
  responseArea: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 12,
  },
  drawingContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  voiceContainer: {
    marginBottom: 16,
  },
  savedContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  savedText: {
    fontFamily: 'FontTitle-White',
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  congratsText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
})
