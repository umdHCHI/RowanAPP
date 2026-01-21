import React, { useEffect } from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ResourcesPage } from '@/components/resources'
import { useIsAuthenticated } from '@/api'

function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return null
}

export default function Resources() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const params = useLocalSearchParams<{ storyId?: string }>()
  const storyId = params.storyId ? parseInt(params.storyId, 10) : undefined

  if (!isAuthenticated) {
    return <LoginRedirect />
  }

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
