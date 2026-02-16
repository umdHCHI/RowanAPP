import React, { useMemo, useState } from 'react'
import {
  View,
  Modal,
  ActivityIndicator,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { Text, Button } from '@/components/ui'
import { useEmaPrompts, useSubmitEma, useEmaResponseForStory, useEmaMyResponse } from '@/api'
import type { EmaRequestPayload } from '@/types/ema'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS } from './story-theme'

interface EmaSurveyModalProps {
  visible: boolean
  payload: EmaRequestPayload | null
  onClose: () => void
  onSubmitted?: () => void
}

function clampInt(value: number, min: number, max: number): number {
  const n = Math.round(Number(value))
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

export function EmaSurveyModal({
  visible,
  payload,
  onClose,
  onSubmitted,
}: EmaSurveyModalProps) {
  const insets = useSafeAreaInsets()
  const studyDay = payload?.studyDay ?? null
  const storyCompletionId = payload?.storyCompletionId ?? 0

  const { data: existingResponse, isLoading: checkingExisting } =
    useEmaResponseForStory(storyCompletionId || null)
  const { data: existingDayResponse, isLoading: checkingDayResponse } =
    useEmaMyResponse(studyDay)
  const { data: promptsData, isLoading: loadingPrompts } = useEmaPrompts(
    existingResponse == null && existingDayResponse == null ? studyDay : null
  )
  const submitEma = useSubmitEma()

  const checkingCollected = checkingExisting || checkingDayResponse
  const alreadyCollected =
    !checkingCollected &&
    (existingResponse != null || existingDayResponse != null)

  const prompts = useMemo(() => promptsData?.prompts ?? [], [promptsData?.prompts])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const initialAnswers = useMemo(() => {
    const next: Record<string, number> = {}
    prompts.forEach((p) => {
      next[p.id] = p.min
    })
    return next
  }, [prompts])

  const setAnswer = (promptId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [promptId]: value }))
    setTouched((prev) => ({ ...prev, [promptId]: true }))
  }

  const currentAnswers = useMemo(() => {
    const out: Record<string, number> = {}
    prompts.forEach((p) => {
      const v = answers[p.id]
      out[p.id] =
        v !== undefined && touched[p.id]
          ? clampInt(v, p.min, p.max)
          : initialAnswers[p.id] ?? p.min
    })
    return out
  }, [prompts, answers, touched, initialAnswers])

  const isValid = useMemo(() => {
    return prompts.every((p) => {
      const v = currentAnswers[p.id]
      return (
        typeof v === 'number' &&
        !Number.isNaN(v) &&
        v >= p.min &&
        v <= p.max &&
        Number.isInteger(v)
      )
    })
  }, [prompts, currentAnswers])

  const handleSubmit = async () => {
    if (!isValid || !storyCompletionId || alreadyCollected) return
    try {
      await submitEma.mutateAsync({
        story_completion_id: storyCompletionId,
        answers: currentAnswers,
      })
      onSubmitted?.()
      onClose()
    } catch (err: any) {
      const message = String(err?.message ?? '')
      const detailCandidates = [
        err?.detail,
        err?.errors,
        err?.errors?.detail,
        err?.response?.data?.detail,
        err?.response?.data?.errors,
      ]
      const detailStr = detailCandidates
        .flatMap((candidate) => {
          if (Array.isArray(candidate)) return candidate
          if (candidate && typeof candidate === 'object') return Object.values(candidate)
          return [candidate]
        })
        .map((v) => String(v ?? ''))
        .join(' ')
        .toLowerCase()
      const messageStr = message.toLowerCase()
      const isAlreadyCollected =
        messageStr.includes('already exists') ||
        detailStr.includes('already exists')
      if (isAlreadyCollected) {
        Alert.alert('', 'Data already collected.', [
          { text: 'OK', onPress: () => { onSubmitted?.(); onClose() } },
        ])
        return
      }
    }
  }

  const handleContinue = React.useCallback(() => {
    setAnswers({})
    setTouched({})
    onSubmitted?.()
    onClose()
  }, [onClose, onSubmitted])

  const handleClose = () => {
    setAnswers({})
    setTouched({})
    onSubmitted?.()
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.modalContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.backdropPressable}>
          <View style={styles.backdrop} />
        </View>
        <View style={styles.modalInner}>
          <View style={styles.panel}>
            <View style={styles.contentContainer}>
              {checkingCollected ? (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.headerSpacer} />
                    <RNPressable
                      style={styles.closeButton}
                      onPress={handleClose}
                      accessibilityLabel="Close"
                    >
                      <MaterialDesignIcons name="close" size={24} color={STORY_COLORS.text} />
                    </RNPressable>
                  </View>
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={STORY_COLORS.text} size="small" />
                  </View>
                </>
              ) : alreadyCollected ? (
                <>
                  <View style={styles.headerRow}>
                    <Text variant="title" size={1} color={STORY_COLORS.text}>
                      Thank you
                    </Text>
                    <RNPressable
                      style={styles.closeButton}
                      onPress={handleClose}
                      accessibilityLabel="Close"
                    >
                      <MaterialDesignIcons name="close" size={24} color={STORY_COLORS.text} />
                    </RNPressable>
                  </View>
                  <Text
                    variant="body"
                    size={2}
                    color={STORY_COLORS.textSecondary}
                    style={styles.thankYouMessage}
                  >
                    Data already collected.
                  </Text>
                  <View style={styles.buttonContainer}>
                    <Button
                      variant="secondary"
                      onPress={handleContinue}
                      enableHaptics
                      enableSound
                      fullWidth
                    >
                      Continue
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <Text variant="title" size={1} color={STORY_COLORS.text}>
                      Quick check-in
                    </Text>
                    <RNPressable
                      style={styles.closeButton}
                      onPress={handleClose}
                      disabled={submitEma.isPending}
                      accessibilityLabel="Close"
                    >
                      <MaterialDesignIcons name="close" size={24} color={STORY_COLORS.text} />
                    </RNPressable>
                  </View>
                  <Text
                    variant="body"
                    size={2}
                    color={STORY_COLORS.textSecondary}
                    style={styles.subtitle}
                  >
                    How are you feeling after this story? We’d like to collect a few responses for this story.
                  </Text>

                  {loadingPrompts ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={STORY_COLORS.text} size="small" />
                    </View>
                  ) : (
                    <ScrollView
                      style={styles.scrollView}
                      contentContainerStyle={styles.scrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      {prompts.map((prompt) => (
                        <View key={prompt.id} style={styles.promptRow}>
                          <Text
                            variant="body"
                            size={2}
                            color={STORY_COLORS.text}
                            style={styles.promptLabel}
                          >
                            {prompt.label}
                          </Text>
                          <View style={styles.scaleRow}>
                            {Array.from(
                              { length: prompt.max - prompt.min + 1 },
                              (_, i) => prompt.min + i
                            ).map((value) => {
                              const selected =
                                (currentAnswers[prompt.id] ?? prompt.min) === value
                              return (
                                <RNPressable
                                  key={value}
                                  style={[
                                    styles.scaleButton,
                                    selected && styles.scaleButtonSelected,
                                  ]}
                                  onPress={() => setAnswer(prompt.id, value)}
                                >
                                  <Text
                                    variant="body"
                                    size={2}
                                    color={
                                      selected
                                        ? STORY_COLORS.text
                                        : STORY_COLORS.textTertiary
                                    }
                                    style={
                                      selected
                                        ? styles.scaleButtonTextSelected
                                        : styles.scaleButtonText
                                    }
                                  >
                                    {value}
                                  </Text>
                                </RNPressable>
                              )
                            })}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <View style={styles.buttonContainer}>
                    <Button
                      variant="secondary"
                      onPress={handleSubmit}
                      disabled={!isValid || submitEma.isPending}
                      enableHaptics={isValid && !submitEma.isPending}
                      enableSound
                      fullWidth
                    >
                      {submitEma.isPending ? (
                        <ActivityIndicator color={STORY_COLORS.text} size="small" />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: STORY_SPACING.lg,
    width: '100%',
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    borderRadius: STORY_BORDER_RADIUS.lg,
    backgroundColor: 'rgba(45, 27, 78, 0.98)',
    borderWidth: 1,
    borderColor: STORY_COLORS.endingBorder,
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'stretch',
    paddingHorizontal: STORY_SPACING.xl,
    paddingTop: STORY_SPACING.xl,
    paddingBottom: STORY_SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: STORY_SPACING.lg,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    padding: STORY_SPACING.sm,
  },
  subtitle: {
    marginTop: STORY_SPACING.xs,
    marginBottom: STORY_SPACING.lg,
  },
  thankYouMessage: {
    marginTop: STORY_SPACING.xs,
    marginBottom: STORY_SPACING.xl,
  },
  loadingRow: {
    paddingVertical: STORY_SPACING.xxl,
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: 280,
  },
  scrollContent: {
    paddingBottom: STORY_SPACING.sm,
  },
  promptRow: {
    marginBottom: STORY_SPACING.xl,
  },
  promptLabel: {
    marginBottom: STORY_SPACING.sm,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: STORY_SPACING.sm,
  },
  scaleButton: {
    minWidth: 40,
    paddingVertical: STORY_SPACING.sm,
    paddingHorizontal: STORY_SPACING.md,
    borderRadius: STORY_BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scaleButtonText: {
    opacity: 0.8,
  },
  scaleButtonTextSelected: {
    fontWeight: '600',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: STORY_SPACING.lg,
  },
})
