import * as Haptics from 'expo-haptics'

export function useHaptics() {
  function lightImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function mediumImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function heavyImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function selection() {
    try {
      Haptics.selectionAsync()
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function success() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function error() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function warning() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch (error) {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selection,
    success,
    error,
    warning,
  }
}




