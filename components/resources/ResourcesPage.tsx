import React, { useRef, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  Dimensions,
  ImageBackground,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useResources } from '@/hooks'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ResourcesSettingsTab } from './ResourcesSettingsTab'
import { ResourcesResourcesTab } from './ResourcesResourcesTab'
import { ResourcesMemoriesTab } from './ResourcesMemoriesTab'
import type { ResourcesPageProps, ResourcesTabType } from '@/types/resources/resources'
import { resourcesPageStyles as styles } from '@/styles/resources/resources-styles'
import { useResourcesStore } from '@/stores/resources-store'

const TABS: ResourcesTabType[] = ['settings', 'resources', 'memories']

const TAB_WIDTH = Dimensions.get('window').width

export function ResourcesPage({ storyId }: ResourcesPageProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const activeTab = useResourcesStore((state) => state.activeTab)
  const scrollOffsetX = useResourcesStore((state) => state.scrollOffsetX)
  const pendingRestore = useResourcesStore((state) => state.pendingRestore)
  const setActiveTab = useResourcesStore((state) => state.setActiveTab)
  const setScrollOffsetX = useResourcesStore((state) => state.setScrollOffsetX)
  const setPendingRestore = useResourcesStore((state) => state.setPendingRestore)
  const horizontalScrollRef = useRef<ScrollView>(null)

  const {
    isLoading,
    resources,
    memories,
    avatarConfig,
    profileData,
    storiesData,
    journalEntries,
    storyProgress,
    gameData,
  } = useResources()

  useFocusEffect(
    useCallback(() => {
      setPendingRestore(true)
      return () => {}
    }, [setPendingRestore])
  )

  useEffect(() => {
    const maxIndex = Math.max(0, TABS.length - 1)
    const tabIndex = Math.min(Math.max(0, TABS.indexOf(activeTab)), maxIndex)
    const fallbackOffset = tabIndex * TAB_WIDTH
    const maxOffset = maxIndex * TAB_WIDTH
    const clampedOffset = Math.min(Math.max(0, scrollOffsetX), maxOffset)
    const targetOffset = clampedOffset > 0 ? clampedOffset : fallbackOffset

    if (pendingRestore) {
      requestAnimationFrame(() => {
        horizontalScrollRef.current?.scrollTo({ x: targetOffset, animated: false })
      })
      setPendingRestore(false)
    }
  }, [activeTab, pendingRestore, scrollOffsetX, setPendingRestore])

  function handleTabChange(tab: ResourcesTabType) {
    playPageFlipSound()
    setActiveTab(tab)
    const index = TABS.indexOf(tab)
    setScrollOffsetX(index * TAB_WIDTH)
    horizontalScrollRef.current?.scrollTo({ x: index * TAB_WIDTH, animated: true })
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = event.nativeEvent.contentOffset.x
    const index = Math.round(x / TAB_WIDTH)
    if (index >= 0 && index < TABS.length && TABS[index] !== activeTab) {
      setActiveTab(TABS[index])
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../../assets/UI/hauntedlibrary.png')}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Button
              variant="tertiary"
              size="small"
              onPress={() => {
                playPageFlipSound()
                router.push('/hub')
              }}
            >
              <View style={styles.closeButtonCircle}>
                <MaterialDesignIcons name="close" size={20} color="#000000" />
              </View>
            </Button>

            <Text variant="label" style={styles.storyLabel}>
              STORY I
            </Text>

            <View style={styles.headerButtonsContainer}>
              <Button
                variant="tertiary"
                size="small"
                onPress={() => {
                  playPageFlipSound()
                  const vantageUrl = storyId ? `/vantage?storyId=${storyId}` : '/vantage'
                  router.push(vantageUrl)
                }}
              >
                <MaterialDesignIcons name="gamepad-variant" size={24} color="#ffffff" />
              </Button>

              <Button
                variant="tertiary"
                size="small"
                onPress={() => {
                  playPageFlipSound()
                  router.push('/journal?from=resources')
                }}
              >
                <MaterialDesignIcons name="feather" size={24} color="#ffffff" />
              </Button>
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text variant="heading" size={1} style={styles.mainTitle}>
              Your Archive
            </Text>
          </View>

          <View style={styles.tabsContainer}>
            <View style={[styles.tab, activeTab === 'settings' ? styles.tabActive : null]}>
              <Button
                variant="tertiary"
                size="small"
                onPress={() => handleTabChange('settings')}
              >
                <Text variant="label" style={StyleSheet.flatten(activeTab === 'settings' ? [styles.tabText, styles.tabTextActive] : styles.tabText)}>
                  SETTINGS
                </Text>
              </Button>
              {activeTab === 'settings' && <View style={styles.tabUnderline} />}
            </View>

            <View style={[styles.tab, activeTab === 'resources' ? styles.tabActive : null]}>
              <Button
                variant="tertiary"
                size="small"
                onPress={() => handleTabChange('resources')}
              >
                <Text variant="label" style={StyleSheet.flatten(activeTab === 'resources' ? [styles.tabText, styles.tabTextActive] : styles.tabText)}>
                  ★ RESOURCES
                </Text>
              </Button>
              {activeTab === 'resources' && <View style={styles.tabUnderline} />}
            </View>

            <View style={[styles.tab, activeTab === 'memories' ? styles.tabActive : null]}>
              <Button
                variant="tertiary"
                size="small"
                onPress={() => handleTabChange('memories')}
              >
                <Text variant="label" style={StyleSheet.flatten(activeTab === 'memories' ? [styles.tabText, styles.tabTextActive] : styles.tabText)}>
                  MEMORIES
                </Text>
              </Button>
              {activeTab === 'memories' && <View style={styles.tabUnderline} />}
            </View>
          </View>

          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const x = event.nativeEvent.contentOffset.x
              setScrollOffsetX(x)
            }}
            scrollEventThrottle={16}
            style={styles.horizontalScrollView}
          >
            <View style={styles.tabContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text variant="body" size={1} style={styles.loadingText}>
                    Loading...
                  </Text>
                </View>
              ) : (
                <ResourcesSettingsTab profileData={profileData} avatarConfig={avatarConfig} />
              )}
            </View>

            <View style={styles.tabContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text variant="body" size={1} style={styles.loadingText}>
                    Loading...
                  </Text>
                </View>
              ) : (
                <ResourcesResourcesTab
                  resources={resources}
                  storyId={storyId}
                 
                  storiesData={storiesData}
                  journalEntries={journalEntries}
                  storyProgress={storyProgress}
                  gameData={gameData}
                />
              )}
            </View>

            <View style={styles.tabContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text variant="body" size={1} style={styles.loadingText}>
                    Loading...
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.tabScrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <ResourcesMemoriesTab memories={memories} storyId={storyId} />
                </ScrollView>
              )}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}
