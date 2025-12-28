import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useResources } from '@/hooks/use-resources'
import { ResourcesPowersTab } from './ResourcesPowersTab'
import { ResourcesResourcesTab } from './ResourcesResourcesTab'
import { ResourcesMemoriesTab } from './ResourcesMemoriesTab'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type TabType = 'powers' | 'resources' | 'memories'

const TABS: TabType[] = ['powers', 'resources', 'memories']

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
    attributes,
    equippedGear,
    characterName,
    avatarConfig,
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

  function renderTabContent() {
    switch (activeTab) {
      case 'powers':
        return (
          <ResourcesPowersTab
            attributes={attributes}
            equippedGear={equippedGear}
            characterName={characterName}
            avatarConfig={avatarConfig}
          />
        )
      case 'resources':
        return <ResourcesResourcesTab resources={resources} storyId={storyId} />
      case 'memories':
        return <ResourcesMemoriesTab memories={memories} />
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background with subtle texture */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundGradient} />
      </View>

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
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // TODO: Open edit menu
          }}
        >
          <MaterialCommunityIcons name="feather" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Your Archive</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'powers' && styles.tabActive]}
          onPress={() => handleTabChange('powers')}
        >
          <Text style={[styles.tabText, activeTab === 'powers' && styles.tabTextActive]}>
            POWERS
          </Text>
          {activeTab === 'powers' && <View style={styles.tabUnderline} />}
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
        {/* Powers Tab */}
        <ScrollView
          style={[styles.tabScrollView, { width: SCREEN_WIDTH }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ResourcesPowersTab
              attributes={attributes}
              equippedGear={equippedGear}
              characterName={characterName}
              avatarConfig={avatarConfig}
            />
          )}
        </ScrollView>

        {/* Resources Tab */}
        <ScrollView
          style={[styles.tabScrollView, { width: SCREEN_WIDTH }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ResourcesResourcesTab resources={resources} storyId={storyId} />
          )}
        </ScrollView>

        {/* Memories Tab */}
        <ScrollView
          style={[styles.tabScrollView, { width: SCREEN_WIDTH }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ResourcesMemoriesTab memories={memories} />
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a2e',
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

