//Main card for the screens 

import React from 'react'
import { View, StyleSheet, ViewStyle, Platform } from 'react-native'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'resource'
  padding?: number
  fullWidth?: boolean
}

export function Card({ children, variant = 'default', padding = 24, fullWidth = false }: CardProps) {
  const shadowStyle: ViewStyle = Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: variant === 'resource' ? 0.3 : 0.5,
      shadowRadius: variant === 'resource' ? 8 : 10,
    },
    android: {
      elevation: variant === 'resource' ? 3 : 4,
    },
  }) || {}

  return (
    <View
      style={[
        styles.card,
        variant === 'resource' && styles.resourceVariant,
        shadowStyle,
        { padding },
        fullWidth && styles.fullWidth,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  resourceVariant: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fullWidth: {
    width: '100%',
  },
})
