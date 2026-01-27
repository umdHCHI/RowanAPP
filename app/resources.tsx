import React from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ResourcesPage } from '@/components/resources'
import { useRequireAuth } from '@/api'

export default function Resources() {
  useRequireAuth() // Redirects to login if not authenticated
  
  const router = useRouter()
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
