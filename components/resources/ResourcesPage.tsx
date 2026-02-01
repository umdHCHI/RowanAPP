import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useResources } from '@/hooks'
import { ResourcesSettingsTab } from './ResourcesSettingsTab'
import { ResourcesResourcesTab } from './ResourcesResourcesTab'
import { ResourcesMemoriesTab } from './ResourcesMemoriesTab'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type TabType = 'settings' | 'resources' | 'memories'

const TABS: TabType[] = ['settings', 'resources', 'memories']

interface ResourcesPageProps {
  storyId?: number
}

export function ResourcesPage({ storyId }: ResourcesPageProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const [activeTab, setActiveTab] = useState<TabType>('resources')
  const horizontalScrollRef = useRef<ScrollView>(null)
  
  const {
    isLoading,
    resources,
    memories,
    profileData,
    avatarConfig,
    storiesData,
    journalEntries,
    storyProgress,
  } = useResources()

  // Set initial scroll position when component mounts
  useEffect(() => {
    const initialIndex = TABS.indexOf(activeTab)
    setTimeout(() => {
      horizontalScrollRef.current?.scrollTo({ x: initialIndex * SCREEN_WIDTH, animated: false })
    }, 100)
  }, [])

  function handleTabChange(tab: TabType) {
    playPageFlipSound()
    setActiveTab(tab)
    const index = TABS.indexOf(tab)
    horizontalScrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true })
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = event.nativeEvent.contentOffset.x
    const index = Math.round(x / SCREEN_WIDTH)
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
        {/* Dark overlay for better text readability */}
        <View style={styles.overlay} />
        
        {/* Content wrapper */}
        <View style={styles.contentWrapper}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              playPageFlipSound()
              router.push('/hub')
            }}
          >
            <View style={styles.closeButtonCircle}>
              <MaterialCommunityIcons name="close" size={20} color="#000000" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.storyLabel}>STORY I</Text>
          
          <View style={styles.headerButtonsContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                playPageFlipSound()
                const vantageUrl = storyId ? `/vantage?storyId=${storyId}` : '/vantage'
                router.push(vantageUrl)
              }}
            >
              <MaterialCommunityIcons name="gamepad-variant" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                playPageFlipSound()
                router.push('/journal')
              }}
            >
              <MaterialCommunityIcons name="feather" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Your Archive</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => handleTabChange('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
              SETTINGS
            </Text>
            {activeTab === 'settings' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'resources' && styles.tabActive]}
            onPress={() => handleTabChange('resources')}
          >
            <Text style={[styles.tabText, activeTab === 'resources' && styles.tabTextActive]}>
              ★ RESOURCES
            </Text>
            {activeTab === 'resources' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'memories' && styles.tabActive]}
            onPress={() => handleTabChange('memories')}
          >
            <Text style={[styles.tabText, activeTab === 'memories' && styles.tabTextActive]}>
              MEMORIES
            </Text>
            {activeTab === 'memories' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Content - Horizontal swipeable tabs */}
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.horizontalScrollView}
        >
          {/* Settings Tab */}
          <View style={[styles.tabContainer, { width: SCREEN_WIDTH }]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : (
              <ResourcesSettingsTab profileData={profileData} avatarConfig={avatarConfig} />
            )}
          </View>

          {/* Resources Tab */}
          <View style={[styles.tabContainer, { width: SCREEN_WIDTH }]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : (
              <ResourcesResourcesTab 
                resources={resources} 
                storyId={storyId}
                profileData={profileData}
                storiesData={storiesData}
                journalEntries={journalEntries}
                storyProgress={storyProgress}
              />
            )}
          </View>

          {/* Memories Tab */}
          <View style={[styles.tabContainer, { width: SCREEN_WIDTH }]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyLabel: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    color: '#ffffff',
    textAlign: 'center',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  mainTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 42,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 48,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabActive: {
    // Active state handled by underline
  },
  tabText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ffffff',
  },
  horizontalScrollView: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  tabScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
})

