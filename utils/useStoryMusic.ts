import { useEffect, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { useGameStore } from '@/stores/game-store'

/**
 * Map of story IDs to their audio files
 * Add new stories by adding entries here
 * 
 * Story IDs should match the IDs returned from the API
 */
const STORY_MUSIC_MAP: Record<number | string, any> = {
  // Introduction story music (ID 28 - matches API)
  28: require('../assets/audio/introductionStory.mp3'),
  // Story 2 music (ID 29 - matches API)
  29: require('../assets/audio/storyOne.mp3'),
  // Story 3 music (ID 30 - matches API)
  30: require('../assets/audio/storyTwo.mp3'),
  // Add more story music files here as they become available
  // Example:
  // 3: require('../assets/audio/story3.mp3'),
}

/**
 * Hook to play looping background music for stories
 * Plays at 50% volume and respects the soundMuted setting
 * 
 * @param storyId - The ID of the story to play music for (null/undefined = no music)
 * @param isActive - Whether the story is currently active and visible
 */
// Default/placeholder audio source (using introduction story as fallback)
// This ensures we always have a valid audio source for the hook
const DEFAULT_AUDIO_SOURCE = require('../assets/audio/introductionStory.mp3')

export function useStoryMusic(storyId: number | string | null | undefined, isActive: boolean) {
  const soundMuted = useGameStore((state) => state.soundMuted)
  const playAttemptedRef = useRef(false)
  const wasActiveRef = useRef(false)
  const currentStoryIdRef = useRef<number | string | null | undefined>(storyId)
  
  // Get audio source for this story, use default as fallback to satisfy React hooks rules
  // The player will be created with this source, but we only play if hasMusic is true
  const audioSource = (storyId && STORY_MUSIC_MAP[storyId]) 
    ? STORY_MUSIC_MAP[storyId] 
    : DEFAULT_AUDIO_SOURCE
  
  // Always call the hook (React hooks rule) - player will be recreated if source changes
  const player = useAudioPlayer(audioSource)
  
  // Track if this story has music configured (determines whether we actually play)
  const hasMusic = storyId ? Boolean(STORY_MUSIC_MAP[storyId]) : false
  
  // Track the previous audio source to detect when it changes
  const previousAudioSourceRef = useRef(audioSource)

  // Update current story ID ref when it changes
  useEffect(() => {
    currentStoryIdRef.current = storyId
  }, [storyId])

  // Configure player on mount - set volume and loop
  useEffect(() => {
    if (!player) return
    
    try {
      player.volume = 0.3
      player.loop = true
    } catch (error) {
      // Player might not be ready yet, ignore
    }
  }, [player])

  // Helper function to safely check if player is playing
  const isPlayerPlaying = (): boolean => {
    if (!player) return false
    try {
      return player.playing
    } catch {
      return false
    }
  }

  // Helper function to safely stop player (pause and reset position)
  const safeStop = () => {
    if (!player) return
    try {
      if (isPlayerPlaying()) {
        player.pause()
        // Reset position to beginning to fully stop playback
        player.seekTo(0)
      }
    } catch (error) {
      // Player might be destroyed, ignore error
    }
  }

  // Handle play/stop based on isActive, soundMuted, and storyId
  useEffect(() => {
    // Debug logging
    if (storyId) {
      console.log('[useStoryMusic] Story ID:', storyId, 'hasMusic:', hasMusic, 'isActive:', isActive, 'soundMuted:', soundMuted)
    }
    
    // If no music configured for this story or not active, stop any playback
    if (!hasMusic || !isActive || !storyId) {
      if (!hasMusic && storyId) {
        console.log('[useStoryMusic] No music configured for story ID:', storyId)
      }
      safeStop()
      playAttemptedRef.current = false
      wasActiveRef.current = false
      return
    }

    // If story ID changed, reset state
    const audioSourceChanged = previousAudioSourceRef.current !== audioSource
    if (currentStoryIdRef.current !== storyId || audioSourceChanged) {
      safeStop()
      playAttemptedRef.current = false
      wasActiveRef.current = false
      currentStoryIdRef.current = storyId
      previousAudioSourceRef.current = audioSource
    }

    // Update ref to track state
    wasActiveRef.current = true

    // If story is active and sound is not muted, play
    if (!soundMuted && isActive) {
      // Only attempt to play if we haven't already started playing
      // This prevents restarting the music on every passage change
      if (!playAttemptedRef.current) {
        // Try to play - ensure audio is loaded first
        const attemptPlay = () => {
          try {
            // Check if still active and story ID hasn't changed
            if (!isActive || currentStoryIdRef.current !== storyId) {
              safeStop()
              return
            }

            // If already playing, don't restart
            if (isPlayerPlaying()) {
              playAttemptedRef.current = true
              return
            }

            // Ensure settings are correct before playing
            if (player) {
              player.volume = 0.5
              player.loop = true
              
              // Check if audio has duration (means it's loaded)
              const hasDuration = player.duration > 0
              
              // If not playing, start playback
              if (!isPlayerPlaying()) {
                // If audio isn't loaded yet, wait a bit more
                if (!hasDuration) {
                  setTimeout(attemptPlay, 500)
                  return
                }
                
                // Reset to beginning only on first play
                player.seekTo(0)
                // Play the sound
                console.log('[useStoryMusic] Attempting to play music for story ID:', storyId)
                player.play()
                playAttemptedRef.current = true
                console.log('[useStoryMusic] Music play() called for story ID:', storyId)
              }
            }
          } catch (error) {
            // Silently handle errors
          }
        }

        // Small delay to ensure component is mounted and player is ready
        const playTimer = setTimeout(attemptPlay, 500)
        return () => {
          clearTimeout(playTimer)
        }
      } else {
        // Already playing - just ensure it's still playing and settings are correct
        if (!isPlayerPlaying()) {
          // Music stopped somehow, restart it
          try {
            if (player) {
              player.volume = 0.5
              player.loop = true
              if (player.duration > 0) {
                player.play()
              }
            }
          } catch (error) {
            // Silently handle errors
          }
        }
      }
    } else {
      // If muted, stop if playing
      safeStop()
      playAttemptedRef.current = false
    }
  }, [isActive, soundMuted, player, storyId, hasMusic, audioSource])

  // Cleanup on unmount - ensure music always stops
  useEffect(() => {
    return () => {
      // Component is unmounting - stop music immediately
      safeStop()
      playAttemptedRef.current = false
      wasActiveRef.current = false
    }
  }, [player])

  // Also ensure music stops when isActive becomes false (even if component doesn't unmount)
  useEffect(() => {
    if (!isActive || !storyId) {
      safeStop()
    }
  }, [isActive, storyId])
}
