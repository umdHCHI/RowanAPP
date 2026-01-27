import React from 'react'
import { Text as RNText, StyleSheet, TextStyle } from 'react-native'

interface TextProps {
  children: React.ReactNode
  variant?: 'heading' | 'body' | 'title' | 'tagline' | 'label'
  size?: number
  color?: string
  align?: 'left' | 'center' | 'right'
  numberOfLines?: number
  opacity?: number
  marginTop?: number
}

const getHeadingStyle = (size: number): TextStyle => {
  switch (size) {
    case 1:
      return { fontSize: 42, lineHeight: 48 }
    case 2:
      return { fontSize: 32, lineHeight: 38 }
    case 3:
      return { fontSize: 24, lineHeight: 28 }
    default:
      return { fontSize: 42, lineHeight: 48 }
  }
}

const getBodyStyle = (size: number): TextStyle => {
  switch (size) {
    case 1:
      return { fontSize: 16, lineHeight: 24 }
    case 2:
      return { fontSize: 14, lineHeight: 20 }
    case 3:
      return { fontSize: 13, lineHeight: 18, fontWeight: '500' }
    case 4:
      return { fontSize: 12, lineHeight: 16, fontWeight: '600' }
    default:
      return { fontSize: 16, lineHeight: 24 }
  }
}

const getTitleStyle = (size: number): TextStyle => {
  switch (size) {
    case 1:
      return { fontSize: 16, lineHeight: 20 }
    case 2:
      return { fontSize: 14, lineHeight: 18 }
    case 3:
      return { fontSize: 13, lineHeight: 16 }
    case 4:
      return { fontSize: 12, lineHeight: 14 }
    default:
      return { fontSize: 16, lineHeight: 20 }
  }
}

const getTaglineStyle = (size: number): TextStyle => {
  switch (size) {
    case 1:
      return { fontSize: 24, lineHeight: 24 }
    case 2:
      return { fontSize: 20, lineHeight: 20 }
    case 3:
      return { fontSize: 18, lineHeight: 18 }
    default:
      return { fontSize: 24, lineHeight: 24 }
  }
}

export function Text({
  children,
  variant = 'body',
  size = 1,
  color,
  align = 'left',
  numberOfLines,
  opacity,
  marginTop,
}: TextProps) {
  const textAlign: 'left' | 'center' | 'right' = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
  const textColor = color || '#ffffff'

  let variantStyle: TextStyle = {}
  let fontFamily = 'System'

  switch (variant) {
    case 'heading':
      variantStyle = getHeadingStyle(size)
      fontFamily = 'FontTitle-White'
      break
    case 'title':
      variantStyle = { ...getTitleStyle(size), fontWeight: '600' }
      fontFamily = 'System'
      break
    case 'tagline':
      variantStyle = getTaglineStyle(size)
      fontFamily = 'System'
      break
    case 'label':
      variantStyle = {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 3,
        opacity: 0.8,
      }
      fontFamily = 'System'
      break
    case 'body':
    default:
      variantStyle = getBodyStyle(size)
      fontFamily = 'System'
      break
  }

  return (
    <RNText
      style={[
        variantStyle,
        {
          color: textColor,
          textAlign,
          fontFamily,
          ...(opacity !== undefined && { opacity }),
          ...(marginTop !== undefined && { marginTop }),
        },
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
}
