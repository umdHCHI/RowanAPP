import React, { useState } from 'react'
import { Pressable, View, Text, ViewStyle } from 'react-native'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { colors } from '@/theme/design-tokens'
import { ButtonProps } from '@/types/UI/button'
import { buttonStyles } from '@/styles/UI/button-style'


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

  const variantStyles: Record<'primary' | 'secondary' | 'tertiary', ViewStyle> = {
    primary: {
      backgroundColor: colors.archive.backgroundDark,
      borderColor: colors.archive.borderSubtle,
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: colors.archive.backgroundDark,
      borderColor: colors.archive.borderSubtle,
      borderWidth: 1,
    },
    tertiary: {
      backgroundColor: colors.archive.backgroundDark,
      borderColor: colors.archive.borderSubtle,
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
        backgroundColor: variant === 'primary' ? colors.archive.backgroundDark : colors.archive.backgroundDark,
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
        buttonStyles.button,
        variantStyles[variant],
        sizeStyles[size],
        pressStyle,
        fullWidth && buttonStyles.fullWidth,
        disabled && buttonStyles.disabled,
      ]}
    >
      <View style={buttonStyles.content}>
        {typeof children === 'string' ? (
          <Text style={buttonStyles.label}>{children}</Text>
        ) : (
          React.isValidElement(children) ? children : <Text style={buttonStyles.label}>{String(children)}</Text>
        )}
      </View>
    </Pressable>
  )
}

