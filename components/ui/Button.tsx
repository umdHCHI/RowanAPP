import React, { useState } from 'react'
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

//needs to be condensed with haptics util

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' | 'warning'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'small'
  hapticType?: HapticType
  enableHaptics?: boolean
  enableSound?: boolean
  fullWidth?: boolean
  disabled?: boolean
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'default',
  hapticType = 'medium',
  enableHaptics = true,
  enableSound = true,
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const [isPressed, setIsPressed] = useState(false)

  function handlePress() {
    if (disabled) return

    if (enableHaptics) {
      switch (hapticType) {
        case 'light':
          haptics.lightImpact()
          break
        case 'medium':
          haptics.mediumImpact()
          break
        case 'heavy':
          haptics.heavyImpact()
          break
        case 'selection':
          haptics.selection()
          break
        case 'success':
          haptics.success()
          break
        case 'error':
          haptics.error()
          break
        case 'warning':
          haptics.warning()
          break
      }
    }

    if (enableSound) {
      playPageFlipSound()
    }

    onPress()
  }

  const variantStyles: Record<'primary' | 'secondary', ViewStyle> = {
    primary: {
      backgroundColor: 'rgba(17, 17, 17, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: 'rgba(108, 178, 255, 0.25)',
      borderColor: 'rgba(108, 178, 255, 0.45)',
      borderWidth: 1,
    },
  }

  const sizeStyles: Record<'default' | 'small', ViewStyle> = {
    default: {
      height: 56,
      borderRadius: 28,
      paddingHorizontal: 24,
    },
    small: {
      height: 44,
      borderRadius: 22,
      paddingHorizontal: 20,
    },
  }

  const pressStyle: ViewStyle = isPressed
    ? {
        backgroundColor: variant === 'primary' ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.25)',
        transform: [{ scale: 0.98 }],
      }
    : {}

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        pressStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {children}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
})
