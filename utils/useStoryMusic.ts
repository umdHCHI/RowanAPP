import { useEffect, useRef } from 'react'
import { createAudioPlayer } from 'expo-audio'
import { useGameStore } from '@/stores/game-store'

const PLAYBACK_STATUS_UPDATE = 'playbackStatusUpdate' as const

// Backend folder IDs 28–33 map to story audio. Relative path from utils/ so Metro bundles from assets/audio.
const STORY_MUSIC_MAP: Record<number | string, number> = {
  28: require('../assets/audio/introductionStory.mp3'),
  29: require('../assets/audio/storyOne.mp3'),
  30: require('../assets/audio/storyTwo.mp3'),
  31: require('../assets/audio/storyThreeNew.mp3'),
  32: require('../assets/audio/storyFour.mp3'),
  33: require('../assets/audio/storyFive.mp3'),
}

/** Normalize story id for map lookup (API may return number or string). */
function normalizedStoryId(id: number | string | null | undefined): number | null {
  if (id == null) return null
  const n = typeof id === 'string' ? parseInt(id, 10) : id
  return Number.isNaN(n) ? null : n
}

// Single shared player for all story music — guarantees only one track plays at a time.
let sharedPlayer: ReturnType<typeof createAudioPlayer> | null = null
let currentPlayingStoryId: number | string | null = null

function getSharedPlayer() {
  if (!sharedPlayer) {
    sharedPlayer = createAudioPlayer(null)
  }
  return sharedPlayer
}

function stopIfPlayingOurStory(storyId: number | string | null | undefined) {
  if (currentPlayingStoryId != null && String(currentPlayingStoryId) === String(storyId)) {
    try {
      sharedPlayer?.pause()
      sharedPlayer?.seekTo(0)
      currentPlayingStoryId = null
    } catch (_) {
      currentPlayingStoryId = null
    }
  }
}

/**
 * Hook to play looping background music for stories.
 * Uses a single shared player so only one track ever plays at a time.
 *
 * @param storyId - The ID of the story to play music for (null/undefined = no music)
 * @param isActive - Whether the story is currently active and visible
 */
export function useStoryMusic(storyId: number | string | null | undefined, isActive: boolean) {
  const soundMuted = useGameStore((state) => state.soundMuted)
  const playAttemptedRef = useRef(false)
  const currentStoryIdRef = useRef<number | string | null | undefined>(storyId)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)

  const id = normalizedStoryId(storyId)
  const hasMusic = id != null && id in STORY_MUSIC_MAP
  const audioSource =
    id != null && STORY_MUSIC_MAP[id] != null ? STORY_MUSIC_MAP[id] : null

  const player = getSharedPlayer()
  const previousAudioSourceRef = useRef<number | null>(null)

  useEffect(() => {
    currentStoryIdRef.current = storyId
  }, [storyId])

  const isPlayerPlaying = (): boolean => {
    if (!player) return false
    try {
      return player.playing
    } catch {
      return false
    }
  }

  const stopSharedPlayer = () => {
    try {
      if (player?.playing) {
        player.pause()
        player.seekTo(0)
      }
      currentPlayingStoryId = null
    } catch (_) {
      currentPlayingStoryId = null
    }
  }

  // When audioSource changes (different story), replace the player's source.
  useEffect(() => {
    if (!player || !hasMusic || !audioSource || previousAudioSourceRef.current === audioSource)
      return
    try {
      stopSharedPlayer()
      playAttemptedRef.current = false
      previousAudioSourceRef.current = audioSource
      player.replace(audioSource)
    } catch (_) {
      // Ignore
    }
  }, [audioSource, hasMusic, player])

  useEffect(() => {
    if (!player) return
    try {
      player.volume = 0.3
      player.loop = true
    } catch (_) {
      // Ignore
    }
  }, [player])

  // expo-audio does not reliably loop; when playback ends we must seekTo(0) and play() again.
  useEffect(() => {
    if (!player || !hasMusic) return
    const subscription = player.addListener(
      PLAYBACK_STATUS_UPDATE,
      (status: { didJustFinish?: boolean; playing?: boolean; currentTime?: number; duration?: number }) => {
        const atEnd =
          status.didJustFinish === true ||
          (status.playing === false &&
            (status.duration ?? 0) > 0 &&
            (status.currentTime ?? 0) >= Math.max(0, (status.duration ?? 0) - 0.5))
        const shouldLoop =
          atEnd &&
          !soundMuted &&
          isActive &&
          currentStoryIdRef.current === storyId &&
          currentPlayingStoryId === storyId // Only loop if we're the one playing
        if (shouldLoop) {
          try {
            player.seekTo(0)
            player.play()
            currentPlayingStoryId = storyId
          } catch (_) {
            // Ignore
          }
        }
      }
    )
    return () => subscription.remove()
  }, [player, hasMusic, soundMuted, isActive, storyId])

  // Handle play/stop based on isActive, soundMuted, and storyId
  useEffect(() => {
    // If no music configured for this story or not active, stop only if we were playing
    if (!hasMusic || !isActive || storyId == null || !audioSource) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      stopIfPlayingOurStory(storyId)
      playAttemptedRef.current = false
      return
    }

    // If story ID changed, reset state and stop before playing new track
    const audioSourceChanged = previousAudioSourceRef.current !== audioSource
    if (currentStoryIdRef.current !== storyId || audioSourceChanged) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      stopSharedPlayer()
      playAttemptedRef.current = false
      retryCountRef.current = 0
      currentStoryIdRef.current = storyId
      previousAudioSourceRef.current = audioSource
    }

    // If story is active and sound is not muted, play
    if (!soundMuted && isActive) {
      if (!playAttemptedRef.current) {
        retryCountRef.current = 0
        const RETRY_MS = 300
        const MAX_RETRIES = 40 // ~12s for larger files (storyFour, storyFive)
        const INITIAL_DELAY_MS =
          audioSourceChanged || previousAudioSourceRef.current === null ? 600 : 350
        const attemptPlay = () => {
          try {
            if (!isActive || currentStoryIdRef.current !== storyId) {
              stopIfPlayingOurStory(storyId)
              return
            }
            if (isPlayerPlaying() && currentPlayingStoryId === storyId) {
              playAttemptedRef.current = true
              return
            }
            if (!player) return
            if (retryCountRef.current >= MAX_RETRIES) return

            player.volume = 0.5
            player.loop = true
            const isReady =
              (player.isLoaded ?? false) || (player.duration != null && player.duration > 0)

            if (!isReady) {
              retryCountRef.current += 1
              retryTimeoutRef.current = setTimeout(attemptPlay, RETRY_MS)
              return
            }

            stopSharedPlayer() // Ensure no other track is playing before we start
            player.seekTo(0)
            player.play()
            currentPlayingStoryId = storyId
            playAttemptedRef.current = true
          } catch (_) {
            retryCountRef.current += 1
            if (retryCountRef.current < MAX_RETRIES) {
              retryTimeoutRef.current = setTimeout(attemptPlay, RETRY_MS)
            }
          }
        }

        const playTimer = setTimeout(attemptPlay, INITIAL_DELAY_MS)
        return () => {
          clearTimeout(playTimer)
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
            retryTimeoutRef.current = null
          }
        }
      } else {
        // Already attempted once — ensure still playing if we're the active story
        if (!isPlayerPlaying() && currentPlayingStoryId === storyId) {
          const RETRY_MS = 300
          const retryPlay = () => {
            try {
              if (!isActive || currentStoryIdRef.current !== storyId || !player) return
              if (isPlayerPlaying()) return
              player.volume = 0.5
              player.loop = true
              const isReady =
                (player.isLoaded ?? false) || (player.duration != null && player.duration > 0)
              if (isReady) {
                player.seekTo(0)
                player.play()
                currentPlayingStoryId = storyId
              } else if (!retryTimeoutRef.current) {
                retryTimeoutRef.current = setTimeout(retryPlay, RETRY_MS)
              }
            } catch (_) {
              if (!retryTimeoutRef.current) retryTimeoutRef.current = setTimeout(retryPlay, RETRY_MS)
            }
          }
          retryPlay()
        }
      }
    } else {
      // If muted, stop only if we were playing
      stopIfPlayingOurStory(storyId)
      playAttemptedRef.current = false
    }
  }, [isActive, soundMuted, player, storyId, hasMusic, audioSource])

  // Cleanup on unmount - stop only if we were the one playing
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      stopIfPlayingOurStory(storyId)
      playAttemptedRef.current = false
    }
  }, [storyId])

  // Ensure music stops when isActive becomes false
  useEffect(() => {
    if (!isActive || !storyId) {
      stopIfPlayingOurStory(storyId)
      retryCountRef.current = 0
    }
  }, [isActive, storyId])
}
