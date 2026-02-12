import React from 'react'
import { Text as NativeText, TextStyle } from 'react-native'
import {
  fontFamily,
  textColorDefault,
  typography,
} from '@/theme/design-tokens'

interface TextProps {
  children: React.ReactNode
  variant?: 'heading' | 'body' | 'title' | 'titleWhite' | 'tagline' | 'label' | 'serif'
  size?: number
  color?: string
  align?: 'left' | 'center' | 'right'
  numberOfLines?: number
  opacity?: number
  marginTop?: number
  marginBottom?: number
  style?: TextStyle
}

function getVariantStyle(
  variant: TextProps['variant'],
  size: number
): TextStyle {
  switch (variant) {
    case 'heading': {
      const key = (size >= 1 && size <= 3 ? size : 1) as 1 | 2 | 3
      return { ...typography.heading[key] }
    }
    case 'title': {
      const key = (size >= 1 && size <= 4 ? size : 1) as 1 | 2 | 3 | 4
      return { ...typography.title[key] }
    }
    case 'titleWhite': {
      const key = (size >= 1 && size <= 4 ? size : 1) as 1 | 2 | 3 | 4
      return { ...typography.titleWhite[key] }
    }
    case 'tagline': {
      const key = (size >= 1 && size <= 3 ? size : 1) as 1 | 2 | 3
      return { ...typography.tagline[key] }
    }
    case 'label':
      return { ...typography.label }
    case 'serif': {
      const key = (size >= 1 && size <= 4 ? size : 1) as 1 | 2 | 3 | 4
      return { ...typography.body[key] }
    }
    case 'body':
    default: {
      const key = (size >= 1 && size <= 4 ? size : 1) as 1 | 2 | 3 | 4
      return { ...typography.body[key] }
    }
  }
}

/** Maps each Text variant to a design-token font (must match theme/fonts.ts keys). */
const variantToFont: Record<NonNullable<TextProps['variant']>, string> = {
  heading: fontFamily.display[0], // BeyondWonderland – main heading
  body: fontFamily.body[0],
  title: fontFamily.title[0],
  titleWhite: fontFamily.titleWhite[0], // FontTitle-White / manaspc
  tagline: fontFamily.display[0],
  label: fontFamily.ui[0],
  serif: fontFamily.serif[0],
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
  marginBottom,
  style: styleProp,
}: TextProps) {
  const textAlign: 'left' | 'center' | 'right' = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
  const textColor = color ?? textColorDefault
  const variantStyle = getVariantStyle(variant, size)
  const fontFamilyName = variantToFont[variant]

  const style: TextStyle = {
    ...variantStyle,
    color: textColor,
    textAlign,
    fontFamily: fontFamilyName,
    ...(opacity !== undefined && { opacity }),
    ...(marginTop !== undefined && { marginTop }),
    ...(marginBottom !== undefined && { marginBottom }),
    ...styleProp,
  }

  return (
    <NativeText style={style} numberOfLines={numberOfLines}>
      {children}
    </NativeText>
  )
}
