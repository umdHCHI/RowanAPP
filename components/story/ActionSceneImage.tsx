import React, { useState, useEffect } from 'react'
import { View, Image, StyleSheet, Dimensions } from 'react-native'
import {
  STORY_ACTION_IMAGE_MAX_HEIGHT,
  STORY_ACTION_IMAGE_MAX_UPSCALE,
} from './story-theme'

interface ActionSceneImageProps {
  source: { uri: string }
  showOverlay?: boolean
  onError?: (error: unknown) => void
}

/**
 * Renders an action scene image that fits within the container without excessive upscaling.
 * Small images (e.g. 20x20) are capped at ~3x native size to avoid blur; larger images scale down to fit.
 */
export function ActionSceneImage({ source, showOverlay = false, onError }: ActionSceneImageProps) {
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null)

  const uri = source?.uri
  useEffect(() => {
    if (!uri) return
    Image.getSize(
      uri,
      (imgW, imgH) => {
        const maxW = Dimensions.get('window').width - 48 // account for padding
        const maxH = STORY_ACTION_IMAGE_MAX_HEIGHT
        const scaleToFit = Math.min(maxW / imgW, maxH / imgH)
        const effectiveScale =
          scaleToFit > 1
            ? Math.min(scaleToFit, STORY_ACTION_IMAGE_MAX_UPSCALE)
            : scaleToFit
        setDisplaySize({
          width: Math.round(imgW * effectiveScale),
          height: Math.round(imgH * effectiveScale),
        })
      },
      () => {
        const fallbackW = Dimensions.get('window').width - 48
        setDisplaySize({ width: fallbackW, height: STORY_ACTION_IMAGE_MAX_HEIGHT })
        onError?.(undefined)
      }
    )
  }, [uri, onError])

  if (!displaySize) {
    return <View style={[styles.container, styles.placeholder]} />
  }

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[styles.image, { width: displaySize.width, height: displaySize.height }]}
        resizeMode="contain"
        onError={onError}
      />
      {showOverlay && <View style={styles.overlay} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 48,
    maxHeight: STORY_ACTION_IMAGE_MAX_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  image: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
})
