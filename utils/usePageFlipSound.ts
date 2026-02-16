import { useEffect, useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import { useGameStore } from "@/stores/game-store";

// Use remote URL directly - don't use require() for URLs
const audioSource = {
  uri: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iIS3GICJK6SbqtNzhvM1mIXaeYPZ9A5cr8gwu",
};

export function usePageFlipSound() {
  const player = useAudioPlayer(audioSource);
  const soundMuted = useGameStore((state) => state.soundMuted);

  // Configure player on mount
  useEffect(() => {
    try {
      player.volume = 0.5;
      player.loop = false;
    } catch {
      // Player might not be ready yet, ignore
    }
  }, [player]);

  const playPageFlipSound = useCallback(() => {
    if (soundMuted) {
      return;
    }

    // Helper to attempt playback - used to play the page flip sound.
    const attemptPlay = () => {
      try {
        // Check if audio is loaded (has duration)
        const hasDuration = player.duration > 0;

        if (!hasDuration) {
          // Audio not loaded yet, try again in a bit
          setTimeout(attemptPlay, 50);
          return;
        }

        // Ensure settings are correct
        player.volume = 0.5;
        player.loop = false;

        // Reset to beginning
        player.seekTo(0);

        // Play the sound
        player.play();
      } catch {
        // Silently handle errors
      }
    };

    // Attempt to play
    attemptPlay();
  }, [player, soundMuted]);

  return playPageFlipSound;
}
