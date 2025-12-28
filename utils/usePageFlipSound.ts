import { useEffect } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { useGameStore } from '@/stores/game-store'

const audioSource = require('../assets/audio/pageflip.mp3')

export function usePageFlipSound() {
  const player = useAudioPlayer(audioSource)
  const soundMuted = useGameStore((state) => state.soundMuted)

  // Set volume to 30% (0.3) - adjust this value between 0.0 and 1.0 as needed
  useEffect(() => {
    player.volume = 0.05
  }, [player])

  function playPageFlipSound() {
    if (soundMuted) return
    
    try {
      player.seekTo(0)
      player.play()
    } catch (error) {
      console.warn('Failed to play page flip sound:', error)
    }
  }

  return playPageFlipSound
}

