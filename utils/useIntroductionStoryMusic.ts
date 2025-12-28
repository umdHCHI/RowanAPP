import { useEffect, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { useGameStore } from '@/stores/game-store'

const audioSource = require('../assets/audio/introductionStory.mp3')

/**
 * Hook to play looping background music for the introduction story
 * Plays at 50% volume and respects the soundMuted setting
 */
export function useIntroductionStoryMusic(isActive: boolean) {
  const player = useAudioPlayer(audioSource)
  const soundMuted = useGameStore((state) => state.soundMuted)
  const playAttemptedRef = useRef(false)
  const wasActiveRef = useRef(false)

  // Configure player on mount - set volume and loop
  useEffect(() => {
    try {
      player.volume = 0.5
      player.loop = true
    } catch (error) {
      // Player might not be ready yet, ignore
    }
  }, [player])

  // Helper function to safely check if player is playing
  const isPlayerPlaying = (): boolean => {
    try {
      return player.playing
    } catch {
      return false
    }
  }

  // Helper function to safely stop player (pause and reset position)
  const safeStop = () => {
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

  // Handle play/stop based on isActive and soundMuted
  useEffect(() => {
    // If not active, immediately stop music
    if (!isActive) {
      safeStop()
      playAttemptedRef.current = false
      wasActiveRef.current = false
      return
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
            // Check if still active (might have changed during delay)
            if (!isActive) {
              safeStop()
              return
            }

            // If already playing, don't restart
            if (isPlayerPlaying()) {
              playAttemptedRef.current = true
              return
            }

            // Ensure settings are correct before playing
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
              player.play()
              playAttemptedRef.current = true
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
            player.volume = 0.5
            player.loop = true
            if (player.duration > 0) {
              player.play()
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
  }, [isActive, soundMuted, player])

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
    if (!isActive) {
      safeStop()
    }
  }, [isActive])
}

