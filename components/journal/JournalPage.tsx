

import { useState, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text as RNText,
  Keyboard,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useGameStore } from '@/stores/game-store'
import { Text, useTheme } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { GameButton } from '@/components/GameButton'
import { useCreateJournalEntry, useUpdateJournalEntry, useJournalPrompts, useJournalEntryByPrompt } from '@/api/hooks/use-journal'
import { journalService } from '@/api/services/journal.service'
import { useQueryClient } from '@tanstack/react-query'
import { journalKeys } from '@/api/hooks/use-journal'
import { JournalPromptSection } from './JournalPromptSection'
import { JournalEntryCard } from './JournalEntryCard'
import { JournalSaveButton } from './JournalSaveButton'
import { JournalAttributeChanges } from './JournalAttributeChanges'
import type { ReflectionMode } from './JournalModeSelector'
import { DrawingCanvas, type Stroke } from './DrawingCanvas'
import { VoiceMemoRecorder } from './VoiceMemoRecorder'
import type { JournalContent } from '@/types/journal'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function JournalPage() {
  const router = useRouter()
  const searchParams = useLocalSearchParams<{ promptId?: string }>()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const scrollViewRef = useRef<ScrollView>(null)
  const inputContainerRef = useRef<View>(null)
  const responseAreaYRef = useRef<number>(0)
  
  // Mode and content state
  const [mode, setMode] = useState<ReflectionMode>('write')
  const [text, setText] = useState('')
  const [drawing, setDrawing] = useState<Stroke[]>([])
  const [audioUri, setAudioUri] = useState<string | null>(null)
  
  // UI state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [savedAttributeChanges, setSavedAttributeChanges] = useState<JournalContent['attributeChanges']>(undefined)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const { journal, journalPrompts, progressJournal, setJournalPrompts, addMemory, attributes } = useGameStore()
  const queryClient = useQueryClient()
  const createJournalEntry = useCreateJournalEntry()
  const updateJournalEntry = useUpdateJournalEntry()
  
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
    'write': ['journal', 'write'],
    'draw': ['draw'],
    'voice': ['voice'],
  }
  
  // Get active and unlocked prompts filtered by category, sorted by order
  const activePrompts = journalPrompts
    .filter((prompt) => 
      prompt.is_active && 
      prompt.unlocked && 
      modeToCategory[mode].includes(prompt.category.toLowerCase())
    )
    .sort((a, b) => a.order - b.order)
  
  // Get current prompt
  const currentPrompt = activePrompts[currentPromptIndex]
  
  // Fetch existing entry for current prompt and mode (if prompt is available)
  const { data: existingEntry, isLoading: isLoadingEntry } = useJournalEntryByPrompt(
    currentPrompt?.id || null,
    mode
  )
  
  // Handle promptId query parameter - find and set the prompt if it exists
  useEffect(() => {
    if (searchParams.promptId && journalPrompts.length > 0) {
      const targetPromptIndex = activePrompts.findIndex((p) => p.prompt_id === searchParams.promptId)
      if (targetPromptIndex !== -1) {
        setCurrentPromptIndex(targetPromptIndex)
        // Set mode based on the prompt's category
        const promptCategory = activePrompts[targetPromptIndex].category.toLowerCase()
        // Map API category to mode (API uses "journal" for writing prompts)
        if (promptCategory === 'journal' || promptCategory === 'write') {
          setMode('write')
        } else if (promptCategory === 'draw') {
          setMode('draw')
        } else if (promptCategory === 'voice') {
          setMode('voice')
        }
      }
    }
  }, [searchParams.promptId, journalPrompts, activePrompts])
  
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
      if (mode === 'write') {
        setText(existingEntry.content)
        setDrawing([])
        setAudioUri(null)
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
          console.warn('Failed to parse drawing content:', e)
          setDrawing([])
        }
        setText('')
        setAudioUri(null)
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
        setText('')
        setDrawing([])
      }
    } else {
      // Reset content when mode changes or no existing entry
      setIsDrawing(false)
      if (mode === 'write') {
        setText('')
        setDrawing([])
        setAudioUri(null)
      } else if (mode === 'draw') {
        setText('')
        setDrawing([])
        setAudioUri(null)
        // Scroll to response area when switching to draw mode
        setTimeout(() => {
          scrollToResponseArea()
        }, 100)
      } else if (mode === 'voice') {
        setText('')
        setDrawing([])
        setAudioUri(null)
      }
    }
  }, [existingEntry, currentPrompt, mode])

  // Handle keyboard visibility to scroll to input
  useEffect(() => {
    if (mode !== 'write') return

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
    router.replace('/hub')
  }


  function handleNewEntry() {
    playPageFlipSound()
    setIsSaved(false)
    setText('')
    setDrawing([])
    setAudioUri(null)
    
    // Advance to next prompt
    if (currentPromptIndex < activePrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1)
    } else {
      // Loop back to first prompt
      setCurrentPromptIndex(0)
    }
  }

  function handleViewHistory() {
    playPageFlipSound()
    // TODO: Navigate to resources with memories tab selected when tab parameter support is added
    router.push('/resources')
  }

  async function handleSave() {
    if (isSaved || isSaving) return

    if (!currentPrompt) {
      Alert.alert('No Prompt', 'No active prompt available.')
      return
    }

    // Validate based on mode
    if (mode === 'write' && !text.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving your journal entry.')
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
    if (mode === 'write') {
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
      description: mode === 'write' ? content.substring(0, 100) : undefined,
      type: 'REFLECTION',
      modality: mode,
      content: content,
      createdAt: new Date().toISOString(),
    }

    // Immediately add to store so it appears in Memories tab
    addMemory(memory)

    try {
      // Check if we should update existing entry or create new one
      // If we have an existing entry for this prompt, update it (even if entry_type is different)
      if (existingEntry && existingEntry.id) {
        console.log('Updating existing journal entry:', {
          id: existingEntry.id,
          prompt: existingEntry.prompt,
          currentEntryType: existingEntry.entry_type,
          newEntryType: mode,
        })
        
        // Update existing entry
        await updateJournalEntry.mutateAsync({
          id: String(existingEntry.id),
          data: {
            content: mode === 'write' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
            entry_type: mode,
          },
        })
        // Invalidate queries to refetch the entry
        queryClient.invalidateQueries({ queryKey: journalKeys.all })
      } else {
        console.log('Creating new journal entry:', {
          prompt: currentPrompt.id,
          entry_type: mode,
        })
        
        // Create new entry
        await createJournalEntry.mutateAsync({
          prompt: currentPrompt.id,
          entry_type: mode,
          content: mode === 'write' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
        })
      }
    } catch (error: any) {
      // Check if error is about duplicate entry and try to update instead
      if (error?.message?.includes('already completed') || error?.status === 400) {
        console.log('Got duplicate entry error, attempting to find and update existing entry...')
        
        // Try to fetch the entry again and update it
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
          
          const existingEntryForPrompt = entries.find((e) => e.prompt === currentPrompt.id)
          
          if (existingEntryForPrompt?.id) {
            console.log('Found existing entry, updating instead:', existingEntryForPrompt.id)
            await updateJournalEntry.mutateAsync({
              id: String(existingEntryForPrompt.id),
              data: {
                content: mode === 'write' ? content : `[${mode.toUpperCase()}] ${mode === 'draw' ? 'Drawing saved' : 'Voice memo saved'}`,
                entry_type: mode,
              },
            })
            // Invalidate queries to refetch the entry
            queryClient.invalidateQueries({ queryKey: journalKeys.all })
            return // Success, exit early
          }
        } catch (updateError) {
          console.error('Failed to update existing entry:', updateError)
        }
      }
      
      // If update attempt failed or entry not found, log the original error
      console.error('Failed to save to backend:', error)
    }

    // Note: API prompts don't have attributeChanges, so we skip that logic
    const combinedChanges: JournalContent['attributeChanges'] = {}
    setSavedAttributeChanges(combinedChanges)

    // Update journal progression
    if (currentPromptIndex < activePrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1)
    } else {
      progressJournal(0, journal.voidClarity)
    }

    setIsSaved(true)
    setIsSaving(false)

    // Reset after save
    setTimeout(() => {
      setIsSaved(false)
      setText('')
      setDrawing([])
      setAudioUri(null)
      
      // Navigate back if last prompt
      if (currentPromptIndex >= activePrompts.length - 1) {
        setTimeout(() => {
          router.replace('/hub')
        }, 500)
      }
    }, 1500)
  }

  function renderModeContent() {
    if (mode === 'write') {
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
        <View style={[styles.drawingContainer, { height: Math.min(420, SCREEN_HEIGHT * 0.42) }]}>
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
          <VoiceMemoRecorder onSave={(uri) => setAudioUri(uri || null)} theme={theme} />
        </View>
      )
    }

    return null
  }

  return (
    <ImageBackground
      source={require('../../assets/UI/hauntedlibrary.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <View
        className="absolute inset-0"
        style={{ backgroundColor: theme.colors.surface }}
      />
      
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Top Bar */}
        <View className="flex-row justify-between items-center px-8 pb-8 pt-8 pr-4">
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backButtonCircle}>
              <MaterialCommunityIcons name="close" size={20} color="#000000" />
            </View>
          </TouchableOpacity>
          
    
          
          <View style={styles.topBarSpacer} />
        </View>

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
                { paddingBottom: insets.bottom + 180 },
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
                  color: theme.colors.primary,
                  textShadowColor: theme.colors.primaryContainer,
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
              style={[styles.tab, mode === 'write' && styles.tabActive]}
              onPress={() => {
                if (mode !== 'write') {
                  playPageFlipSound()
                  setMode('write')
                }
              }}
            >
              <RNText style={[styles.tabText, mode === 'write' && styles.tabTextActive]}>
                JOURNAL
              </RNText>
              {mode === 'write' && <View style={styles.tabUnderline} />}
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
                  <Text
                    variant="bodyMedium"
                    style={styles.savedText}
                  >
                    ✓ Entry saved!
                  </Text>
                  <JournalAttributeChanges changes={savedAttributeChanges} attributes={attributes} />
                </View>
              )}

              {/* Save Button */}
              <JournalSaveButton
                isSaved={isSaved}
                isSaving={isSaving}
                onPress={handleSave}
              />
            </View>
          )}

            {/* Bottom Buttons (always visible) */}
            <View className="flex-row px-5 pt-4 gap-4" style={{ paddingBottom: insets.bottom + 16 }}>
              <TouchableOpacity
                className="flex-1 py-3.5 px-6 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                onPress={handleNewEntry}
                activeOpacity={0.8}
                >
                <RNText style={styles.bottomButtonText}>New entry</RNText>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-3.5 px-6 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                onPress={handleViewHistory}
                activeOpacity={0.8}
                >
                <RNText style={styles.bottomButtonText}>View history</RNText>
              </TouchableOpacity>
            </View>
                </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarLabel: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  topBarSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
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
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.6)',
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
    color: '#FFD700',
    textAlign: 'center',
  },
  bottomButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#ffffff',
  },
})
