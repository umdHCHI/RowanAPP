import React from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ResourcesPage } from '@/components/resources'

export default function Resources() {
  const params = useLocalSearchParams<{ storyId?: string }>()
  const storyId = params.storyId ? parseInt(params.storyId, 10) : undefined

  return (
    <View style={styles.container}>
      <ResourcesPage storyId={storyId} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
