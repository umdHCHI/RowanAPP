import * as Haptics from 'expo-haptics'

export function useHaptics() {
  function lightImpact() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  function mediumImpact() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  function heavyImpact() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }

  function selection() {
    Haptics.selectionAsync()
  }

  function success() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  function error() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }

  function warning() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
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



