

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Keyboard,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { useJournalDraftStore } from '@/stores/journal-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import {
  useCreateJournalEntry,
  useCreateJournalEntryWithMedia,
  useUpdateJournalEntry,
  useUpdateJournalEntryWithMedia,
  useJournalPrompts,
  useJournalEntryByPrompt,
  journalKeys,
} from '@/api/hooks/use-journal'
import { journalService } from '@/api/services/journal.service'
import { useQueryClient } from '@tanstack/react-query'
import { useGainLumens } from '@/api'
import { JournalPromptSection } from './JournalPromptSection'
import { JournalEntryCard } from './JournalEntryCard'
import { JournalSaveButton } from './JournalSaveButton'
import { JournalAttributeChanges } from './JournalAttributeChanges'
import type { ReflectionMode, Stroke } from '@/types/journal/journal'
import { DrawingCanvas } from './DrawingCanvas'
import { VoiceMemoRecorder } from './VoiceMemoRecorder'
import { useHaptics } from '@/utils/useHaptics'
import { StoryBackground } from '@/components/story/StoryBackground'
import { Header } from '@/components/header'
import { journalPageStyles } from '@/styles/journal/journal-styles'
import { Text } from '@/components/ui'
import { captureRef } from 'react-native-view-shot'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const REWARD_DISPLAY_MS = 4500
const LAST_PROMPT_REWARD_DISPLAY_MS = 5000

const MODE_TO_CATEGORY: Record<ReflectionMode, string[]> = {
  journal: ['journal', 'journal'],
  draw: ['draw'],
  voice: ['voice'],
}

export function JournalPage() {
  const router = useRouter()
  const searchParams = useLocalSearchParams<{ promptId?: string; from?: string }>()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const scrollViewRef = useRef<ScrollView>(null)
  const inputContainerRef = useRef<View>(null)
  const responseAreaYRef = useRef<number>(0)
  const drawingContainerRef = useRef<View>(null)
  
  // Mode and draft state (persisted)
  const mode = useJournalDraftStore((state) => state.mode)
  const currentPromptIndex = useJournalDraftStore((state) => state.currentPromptIndex)
  const drafts = useJournalDraftStore((state) => state.drafts)
  const setMode = useJournalDraftStore((state) => state.setMode)
  const setCurrentPromptIndex = useJournalDraftStore((state) => state.setCurrentPromptIndex)
  const upsertDraft = useJournalDraftStore((state) => state.upsertDraft)
  const setDraft = useJournalDraftStore((state) => state.setDraft)
  const clearDraft = useJournalDraftStore((state) => state.clearDraft)

  // UI state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const { journal, journalPrompts, progressJournal, setJournalPrompts, addMemory } = useGameStore()
  const queryClient = useQueryClient()
  const createJournalEntry = useCreateJournalEntry()
  const createJournalEntryWithMedia = useCreateJournalEntryWithMedia()
  const updateJournalEntry = useUpdateJournalEntry()
  const updateJournalEntryWithMedia = useUpdateJournalEntryWithMedia()
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
  
  const forcedPrompt = searchParams.promptId
    ? journalPrompts.find((prompt) => prompt.prompt_id === searchParams.promptId)
    : null

  const getActivePromptsForMode = useCallback((
    modeValue: ReflectionMode,
    pinnedPrompt?: typeof journalPrompts[number] | null
  ) => {
    const filteredPrompts = journalPrompts
      .filter((prompt) => 
        prompt.is_active && 
        prompt.unlocked && 
        MODE_TO_CATEGORY[modeValue].includes(String(prompt.category ?? '').toLowerCase())
      )
      .sort((a, b) => a.order - b.order)

    if (!pinnedPrompt) return filteredPrompts

    const pinnedCategory = String(pinnedPrompt.category ?? '').toLowerCase()
    const isPinnedForMode = MODE_TO_CATEGORY[modeValue].includes(pinnedCategory)
    if (!isPinnedForMode) return filteredPrompts

    const alreadyIncluded = filteredPrompts.some((prompt) => prompt.prompt_id === pinnedPrompt.prompt_id)
    if (alreadyIncluded) return filteredPrompts

    return [pinnedPrompt, ...filteredPrompts]
  }, [journalPrompts])

  // Get active and unlocked prompts filtered by category, sorted by order
  const activePrompts = getActivePromptsForMode(mode, forcedPrompt)

  useEffect(() => {
    if (activePrompts.length === 0) return
    if (currentPromptIndex < 0 || currentPromptIndex >= activePrompts.length) {
      setCurrentPromptIndex(0)
    }
  }, [activePrompts.length, currentPromptIndex, setCurrentPromptIndex])
  
  // Get current prompt
  const currentPrompt = activePrompts[currentPromptIndex]

  const draftKey = useMemo(() => {
    if (!currentPrompt) return null
    const promptKey = String(currentPrompt.prompt_id || currentPrompt.id)
    return `${promptKey}|${mode}`
  }, [currentPrompt, mode])

  const currentDraft = draftKey ? drafts[draftKey] : undefined
  const text = currentDraft?.text ?? ''
  const drawing = currentDraft?.drawing ?? []
  const audioUri = currentDraft?.audioUri ?? null
  const audioDurationSeconds = currentDraft?.audioDurationSeconds ?? null
  const audioMimeType = currentDraft?.audioMimeType ?? null
  const audioFileName = currentDraft?.audioFileName ?? null

  const updateDraft = useCallback((partial: Partial<{ text: string; drawing: Stroke[]; audioUri: string | null; audioDurationSeconds: number | null; audioMimeType: string | null; audioFileName: string | null }>) => {
    if (!draftKey) return
    upsertDraft(draftKey, partial)
  }, [draftKey, upsertDraft])
  
  // Fetch existing entry for current prompt and mode (if prompt is available)
  const { data: existingEntry } = useJournalEntryByPrompt(
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
        return // Exit early to let the next render handle the prompt index update
      }

      const targetPrompts = getActivePromptsForMode(nextMode, targetPrompt)
      const targetPromptIndex = targetPrompts.findIndex((p) => p.prompt_id === searchParams.promptId)
      if (targetPromptIndex !== -1 && targetPromptIndex !== currentPromptIndex) {
        setCurrentPromptIndex(targetPromptIndex)
      } else if (targetPromptIndex === -1 && currentPromptIndex !== 0) {
        setCurrentPromptIndex(0)
      }
    }
  }, [searchParams.promptId, journalPrompts, mode, currentPromptIndex, getActivePromptsForMode, setMode, setCurrentPromptIndex])
  
  // Reset prompt index when mode changes to show first prompt of new category
  useEffect(() => {
    // Only reset if we don't have a promptId in the URL
    if (!searchParams.promptId) {
      setCurrentPromptIndex(0)
    }
  }, [mode, searchParams.promptId, setCurrentPromptIndex])


  // Helper to scroll to response area
  function scrollToResponseArea() {
    if (scrollViewRef.current && responseAreaYRef.current > 0) {
      scrollViewRef.current.scrollTo({ y: responseAreaYRef.current - 20, animated: true })
    } else {
      // Fallback to scrollToEnd if Y position not available
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  // Load existing entry content when found, or initialize a draft when missing
  useEffect(() => {
    if (!draftKey) return

    if (existingEntry && currentPrompt && existingEntry.entry_type === mode) {
      if (mode === 'journal') {
        setDraft(draftKey, {
          text: existingEntry.content || '',
          drawing: [],
          audioUri: null,
          audioDurationSeconds: null,
          audioMimeType: null,
          audioFileName: null,
        })
      } else if (mode === 'draw') {
        let parsed: Stroke[] = []
        try {
          const raw = JSON.parse(existingEntry.content)
          if (Array.isArray(raw)) parsed = raw
        } catch {}
        setDraft(draftKey, {
          text: '',
          drawing: parsed,
          audioUri: null,
          audioDurationSeconds: null,
          audioMimeType: null,
          audioFileName: null,
        })
        setTimeout(() => {
          scrollToResponseArea()
        }, 100)
      } else if (mode === 'voice') {
        const shouldUseUri =
          typeof existingEntry.content === 'string' &&
          (existingEntry.content.startsWith('file://') || existingEntry.content.startsWith('http'))
        setDraft(draftKey, {
          text: '',
          drawing: [],
          audioUri: shouldUseUri ? existingEntry.content : null,
          audioDurationSeconds: existingEntry.duration_seconds ?? null,
          audioMimeType: null,
          audioFileName: null,
        })
      }
      return
    }

    setIsDrawing(false)
    if (!currentDraft) {
      setDraft(draftKey, {
        text: '',
        drawing: [],
        audioUri: null,
        audioDurationSeconds: null,
        audioMimeType: null,
        audioFileName: null,
      })
    }

    if (mode === 'draw') {
      setTimeout(() => {
        scrollToResponseArea()
      }, 100)
    }
  }, [existingEntry, currentPrompt, mode, draftKey, currentDraft, setDraft])

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

    const savedDraftKey = draftKey

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
          } else if ('results' in entriesResponse && Array.isArray(entriesResponse.results)) {
            entries = entriesResponse.results
          } else if (Array.isArray(entriesResponse)) {
            entries = entriesResponse
          }
        }

        const existingEntryForPrompt = entries.find((e) => matchesCurrentPrompt(e))
        if (existingEntryForPrompt) {
          resolvedExistingEntry = existingEntryForPrompt
        }
      } catch {}
    }

    // For draw mode: capture canvas as PNG so we can upload it
    let capturedImageUri: string | null = null
    if (mode === 'draw' && drawingContainerRef.current) {
      try {
        capturedImageUri = await captureRef(drawingContainerRef.current, {
          format: 'png',
          result: 'tmpfile',
        })
      } catch (captureErr) {
        console.warn('Could not capture drawing as PNG:', captureErr)
      }
    }

    try {
      // Check if we should update existing entry or create new one
      // If we have an existing entry for this prompt, update it (even if entry_type is different)
      if (resolvedExistingEntry && resolvedExistingEntry.id) {
        // Update existing entry: use multipart when we have image or audio to upload
        const hasMediaToUpload = (mode === 'draw' && capturedImageUri) || (mode === 'voice' && audioUri)
        const updatePayload = {
          content,
          entry_type: mode,
          duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
          imageUri: mode === 'draw' ? capturedImageUri ?? undefined : undefined,
          audioUri: mode === 'voice' ? audioUri ?? undefined : undefined,
          audioMimeType: mode === 'voice' ? audioMimeType ?? undefined : undefined,
          audioFileName: mode === 'voice' ? audioFileName ?? undefined : undefined,
        }
        if (hasMediaToUpload) {
          await updateJournalEntryWithMedia.mutateAsync({
            id: String(resolvedExistingEntry.id),
            data: updatePayload,
          })
        } else {
          await updateJournalEntry.mutateAsync({
            id: String(resolvedExistingEntry.id),
            data: {
              content,
              entry_type: mode,
              duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
            },
          })
        }
        // Invalidate queries to refetch the entry
        queryClient.invalidateQueries({ queryKey: journalKeys.all })
        didSave = true
      } else {
        // Create new entry: use multipart when we have image or audio
        const useMedia =
          (mode === 'draw' && capturedImageUri) || (mode === 'voice' && audioUri)
        if (useMedia) {
          await createJournalEntryWithMedia.mutateAsync({
            prompt: currentPrompt.id,
            content: '', // optional; backend accepts blank for draw/voice
            imageUri: mode === 'draw' ? capturedImageUri : undefined,
            audioUri: mode === 'voice' ? audioUri ?? undefined : undefined,
            audioMimeType: mode === 'voice' ? audioMimeType ?? undefined : undefined,
            audioFileName: mode === 'voice' ? audioFileName ?? undefined : undefined,
            // voice: backend accepts m4a, webm, mp3; defaults (audio/m4a, voice-memo.m4a) used if omitted
          })
        } else {
          await createJournalEntry.mutateAsync({
            prompt: currentPrompt.id,
            entry_type: mode,
            content: mode === 'journal' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
            duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
          })
        }
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
            } else if ('results' in entriesResponse && Array.isArray(entriesResponse.results)) {
              entries = entriesResponse.results
            } else if (Array.isArray(entriesResponse)) {
              entries = entriesResponse
            }
          }

          const existingEntryForPrompt = entries.find((e) => matchesCurrentPrompt(e))

          if (existingEntryForPrompt?.id) {
            // Backend says already completed: update the existing entry with content and media (PNG/audio)
            const hasMediaToUpload = (mode === 'draw' && capturedImageUri) || (mode === 'voice' && audioUri)
            const updatePayload = {
              content,
              entry_type: mode,
              duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
              imageUri: mode === 'draw' ? capturedImageUri ?? undefined : undefined,
              audioUri: mode === 'voice' ? audioUri ?? undefined : undefined,
              audioMimeType: mode === 'voice' ? audioMimeType ?? undefined : undefined,
              audioFileName: mode === 'voice' ? audioFileName ?? undefined : undefined,
            }
            if (hasMediaToUpload) {
              await updateJournalEntryWithMedia.mutateAsync({
                id: String(existingEntryForPrompt.id),
                data: updatePayload,
              })
            } else {
              await updateJournalEntry.mutateAsync({
                id: String(existingEntryForPrompt.id),
                data: { content, entry_type: mode, duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined },
              })
            }
            queryClient.invalidateQueries({ queryKey: journalKeys.all })
            didSave = true
            return
          }

          // If entry doesn't exist in list but we have it from query, try update by id
          if (existingEntry?.id) {
            const hasMediaToUpload = (mode === 'draw' && capturedImageUri) || (mode === 'voice' && audioUri)
            const updatePayload = {
              content,
              entry_type: mode,
              duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined,
              imageUri: mode === 'draw' ? capturedImageUri ?? undefined : undefined,
              audioUri: mode === 'voice' ? audioUri ?? undefined : undefined,
              audioMimeType: mode === 'voice' ? audioMimeType ?? undefined : undefined,
              audioFileName: mode === 'voice' ? audioFileName ?? undefined : undefined,
            }
            if (hasMediaToUpload) {
              await updateJournalEntryWithMedia.mutateAsync({
                id: String(existingEntry.id),
                data: updatePayload,
              })
            } else {
              await updateJournalEntry.mutateAsync({
                id: String(existingEntry.id),
                data: { content, entry_type: mode, duration_seconds: mode === 'voice' ? audioDurationSeconds ?? 1 : undefined },
              })
            }
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
        if (savedDraftKey) {
          clearDraft(savedDraftKey)
        }
        if (searchParams.from === 'story' || searchParams.from === 'resources') {
          router.back()
          return
        }
        router.replace('/hub')
      }, LAST_PROMPT_REWARD_DISPLAY_MS) // Give time to see confirmation and lumens reward
    } else {
      // Not last prompt: Reset form for next prompt after showing confirmation
      setTimeout(() => {
        setIsSaved(false)
        if (savedDraftKey) {
          clearDraft(savedDraftKey)
        }
      }, REWARD_DISPLAY_MS) // Show confirmation before resetting
    }
  }

  function renderModeContent() {
    if (mode === 'journal') {
      return (
        <JournalEntryCard
          value={text}
          onChangeText={(value) => updateDraft({ text: value })}
          disabled={isSaving || isSaved}
        />
      )
    }

    if (mode === 'draw') {
      return (
        <View
          ref={drawingContainerRef}
          collapsable={false}
          style={[journalPageStyles.drawingContainer, { minHeight: Math.min(420, SCREEN_HEIGHT * 0.42) }]}
        >
          <DrawingCanvas
            value={drawing}
            onChange={(value) => updateDraft({ drawing: value })}
            onDrawingStart={() => setIsDrawing(true)}
            onDrawingEnd={() => setIsDrawing(false)}
          />
        </View>
      )
    }

    if (mode === 'voice') {
      return (
        <View style={journalPageStyles.voiceContainer}>
          <VoiceMemoRecorder
            value={audioUri}
            onSave={({ uri, durationSeconds, mimeType, fileName }) => {
              updateDraft({
                audioUri: uri || null,
                audioDurationSeconds: durationSeconds,
                audioMimeType: mimeType || null,
                audioFileName: fileName || null,
              })
            }}
            onClear={() => {
              updateDraft({
                audioUri: null,
                audioDurationSeconds: null,
                audioMimeType: null,
                audioFileName: null,
              })
            }}
          />
        </View>
      )
    }

    return null
  }

  return (
    <StoryBackground showOverlay={false}>
      <View style={journalPageStyles.root}>
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
                journalPageStyles.scrollContent,
                { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 180 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!isDrawing}
              nestedScrollEnabled={true}
            >
          {/* Title Section */}
          <View style={journalPageStyles.titleContainer}>
            <Text variant="title" size={3} align="center">
              Your Journal
            </Text>
          </View>

          {/* Prompt Card */}
          <JournalPromptSection
            currentPrompt={currentPrompt}
            isLoading={isLoadingPrompts}
            error={promptsError}
          />

          {/* Tabs */}
          <View style={journalPageStyles.tabsContainer}>
            <TouchableOpacity
              style={[journalPageStyles.tab, mode === 'journal' && journalPageStyles.tabActive]}
              onPress={() => {
                if (mode !== 'journal') {
                  playPageFlipSound()
                  if (searchParams.from === 'resources') {
                    router.replace('/journal?from=resources&promptId=default_text_prompt')
                  } else {
                    setMode('journal')
                  }
                }
              }}
            >
              <Text variant="label" size={2} align="center">
                JOURNAL
              </Text>
              {mode === 'journal' && <View style={journalPageStyles.tabUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[journalPageStyles.tab, mode === 'voice' && journalPageStyles.tabActive]}
              onPress={() => {
                if (mode !== 'voice') {
                  playPageFlipSound()
                  if (searchParams.from === 'resources') {
                    router.replace('/journal?from=resources&promptId=default_voice_prompt')
                  } else {
                    setMode('voice')
                  }
                }
              }}
            >
              <Text variant="label" size={2} align="center">
                VOICE
              </Text>
              {mode === 'voice' && <View style={journalPageStyles.tabUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[journalPageStyles.tab, mode === 'draw' && journalPageStyles.tabActive]}
              onPress={() => {
                if (mode !== 'draw') {
                  playPageFlipSound()
                  if (searchParams.from === 'resources') {
                    router.replace('/journal?from=resources&promptId=default_drawing_prompt')
                  } else {
                    setMode('draw')
                  }
                }
              }}
            >
              <Text variant="label" size={2} align="center">
                DRAWING
              </Text>
              {mode === 'draw' && <View style={journalPageStyles.tabUnderline} />}
            </TouchableOpacity>
          </View>

          {/* Response Area (always shown when prompt is available) */}
          {!isLoadingPrompts && !promptsError && currentPrompt && (
            <View 
              ref={inputContainerRef} 
              style={journalPageStyles.responseArea}
              onLayout={(event) => {
                responseAreaYRef.current = event.nativeEvent.layout.y
              }}
            >
              {/* Mode Content */}
              {renderModeContent()}

              {/* Saved confirmation */}
              {isSaved && (
                <View style={journalPageStyles.savedContainer}>
                  <Text variant="label" size={2} align="center">
                    ✓ Entry saved!
                  </Text>
                  <JournalAttributeChanges />
                  <Text variant="label" size={2} align="center">
                    Congratulations!
                  </Text>
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

