import type { TextSpeed } from '@/stores/game-store'

/**
 * Get label for text speed setting
 */
export function getTextSpeedLabel(textSpeed: TextSpeed): string {
  switch (textSpeed) {
    case 'slow':
      return 'Slow'
    case 'fast':
      return 'Fast'
    default:
      return 'Norm'
  }
}

/**
 * Get icon name for text speed setting
 */
export function getTextSpeedIcon(textSpeed: TextSpeed): string {
  switch (textSpeed) {
    case 'slow':
      return 'timer-sand-empty'
    case 'fast':
      return 'timer-sand-full'
    default:
      return 'timer-sand'
  }
}

