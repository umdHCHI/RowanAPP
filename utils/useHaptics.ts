import * as Haptics from "expo-haptics";

export function useHaptics() {
  function lightImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function mediumImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function heavyImpact() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function selection() {
    try {
      Haptics.selectionAsync();
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function success() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function error() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Haptics not supported on this platform (e.g., web)
      // Silently fail to prevent crashes
    }
  }

  function warning() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
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
  };
}
