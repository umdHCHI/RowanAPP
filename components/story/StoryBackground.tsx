import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { useVideoPlayer, VideoView } from 'expo-video'

interface StoryBackgroundProps {
  isEnding?: boolean
  isIntroduction?: boolean
  storyId?: string | number
}

// Separate component for video background to avoid creating video player for all stories
function StoryVideoBackground() {
  const videoPlayer = useVideoPlayer(
    require('../../assets/storyCardBackground/pages-flipping.mp4'),
    (player) => {
      player.muted = true
      player.loop = true
      player.play()
    }
  )

  // Ensure loop is maintained and video keeps playing
  useEffect(() => {
    if (videoPlayer) {
      videoPlayer.loop = true
      videoPlayer.muted = true
      if (!videoPlayer.playing) {
        videoPlayer.play()
      }
    }
  }, [videoPlayer])

  return (
    <View style={styles.backgroundContainer}>
      <VideoView
        player={videoPlayer}
        style={styles.background}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      {/* Blur overlay effect */}
      <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
    </View>
  )
}

export function StoryBackground({ isEnding = false, isIntroduction = false, storyId }: StoryBackgroundProps) {
  // Show pages-flipping video for story ID 12
  const isStory2 = storyId === 12

  if (isStory2) {
    return <StoryVideoBackground />
  }

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.background} />
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2D1B4E',
  },
})
