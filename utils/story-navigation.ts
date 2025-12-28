import { Router } from 'expo-router'
import { useRouter } from 'expo-router'
import { usePageFlipSound } from './usePageFlipSound'
import { useHaptics } from './useHaptics'

/**
 * Navigation handler with haptics and sound
 * Reusable pattern for story navigation actions
 */
export function useStoryNavigation() {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()

  function navigate(path: string, options?: { replace?: boolean }) {
    haptics.mediumImpact()
    playPageFlipSound()
    
    if (options?.replace) {
      router.replace(path as any)
    } else {
      router.push(path as any)
    }
  }

  return { navigate }
}

