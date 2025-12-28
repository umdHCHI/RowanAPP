import { useEffect, useCallback, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { useGameStore } from '@/stores/game-store'

const audioSource = require('../assets/audio/pageflip.mp3')

export function usePageFlipSound() {
  const player = useAudioPlayer(audioSource)
  const soundMuted = useGameStore((state) => state.soundMuted)

  // Helper to safely check if player is playing
  const isPlayerPlaying = (): boolean => {
    try {
      return player.playing
    } catch {
      return false
    }
  }

  // Configure player on mount
  useEffect(() => {
    try {
      player.volume = 0.5
      player.loop = false
    } catch (error) {
      // Player might not be ready yet, ignore
    }
  }, [player])

  const playPageFlipSound = useCallback(() => {
    if (soundMuted) {
      return
    }

    // Helper to attempt playback
    const attemptPlay = () => {
      try {
        // Check if audio is loaded (has duration)
        const hasDuration = player.duration > 0
        
        if (!hasDuration) {
          // Audio not loaded yet, try again in a bit
          setTimeout(attemptPlay, 50)
          return
        }
        
        // Ensure settings are correct
        player.volume = 0.5
        player.loop = false
        
        // Reset to beginning
        player.seekTo(0)
        
        // Play the sound
        player.play()
      } catch (error) {
        // Silently handle errors
      }
    }

    // Attempt to play
    attemptPlay()
  }, [player, soundMuted])

  return playPageFlipSound
}

