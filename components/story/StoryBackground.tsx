import React from 'react'
import { View, ImageBackground } from 'react-native'
import type { StoryBackgroundProps as StoryBackgroundPropsType } from '@/types/story'

interface StoryBackgroundProps extends StoryBackgroundPropsType {
  children?: React.ReactNode
  showOverlay?: boolean
  overlayOpacity?: number
}

export function StoryBackground({ 
  children, 
  showOverlay = true,
  overlayOpacity = 0.6,
  isEnding,
  isIntroduction,
  storyId,
}: StoryBackgroundProps): React.ReactNode {
  const backgroundImage = require('../../assets/UI/hauntedlibrary.png')
  return (
    <ImageBackground className="backgroundContainer backgroundImage bg-cover resize-cover"
      source={backgroundImage}  resizeMode="cover"> 
      {showOverlay && (
        <View 
          className="overlay" 
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children}
    </ImageBackground>
    )
  }


export default StoryBackground