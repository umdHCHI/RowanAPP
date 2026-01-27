import React, { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useAuthActions, userService } from '@/api'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import { useNotifications } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import type { UserFullProfileResponse } from '@/api/types'

interface ResourcesSettingsTabProps {
  profileData?: UserFullProfileResponse | null
}

export function ResourcesSettingsTab({ profileData }: ResourcesSettingsTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const playPageFlipSound = usePageFlipSound()
  const soundMuted = useGameStore((state) => state.soundMuted)
  const toggleSoundMute = useGameStore((state) => state.toggleSoundMute)
  const textSpeed = useGameStore((state) => state.textSpeed)
  const cycleTextSpeed = useGameStore((state) => state.cycleTextSpeed)
  const resetGame = useGameStore((state) => state.resetGame)
  const lumens = useGameStore((state) => state.lumens.lumens)
  const { clearAuth } = useAuthActions()
  const { notificationsEnabled, requestPermissions, cancelAllNotifications, sendTestNotification } = useNotifications()

  // Get avatar config from profile
  const avatarConfig = useMemo(() => {
    if (!profileData?.character) return null
    return buildAvatarConfig(profileData.character)
  }, [profileData])

  function handleChangeCharacter() {
    playPageFlipSound()
    router.push('/character-creator')
  }

  function handleSoundToggle() {
    toggleSoundMute()
    if (!soundMuted) {
      playPageFlipSound()
    }
  }

  function handleTextSpeedToggle() {
    cycleTextSpeed()
    if (!soundMuted) {
      playPageFlipSound()
    }
  }

  function formatTextSpeed(speed: string): string {
    return speed.charAt(0).toUpperCase() + speed.slice(1)
  }

  function handleLogout() {
    playPageFlipSound()
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Make navigation immediate; do slow/best-effort cleanup in the background
            queryClient.clear()
            resetGame()
            clearAuth()
            router.replace('/login')

            void (async () => {
              try {
                await userService.logout()
              } catch {
                // ignore network/logout errors
              }

              try {
                await cancelAllNotifications()
              } catch {
                // ignore notification errors (Expo Go / backend sync)
              }
            })()
          }
        },
      ],
      { cancelable: true }
    )
  }

  async function handleNotificationToggle() { // Notifications might need to have expanded backend 
    playPageFlipSound()
    
    if (notificationsEnabled) {
      // Disable notifications
      await cancelAllNotifications()
    } else {
      // Enable notifications - request permissions first
      const granted = await requestPermissions()
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        )
      }
    }
  }

  function handleSettingPress(settingName: string) {
    playPageFlipSound()
    Alert.alert('Coming Soon', `${settingName} settings are not implemented yet.`, [{ text: 'OK' }])
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences and account.</Text>
        </View>

        {/* Profile Section */}
        {avatarConfig && (
          <View style={styles.profileCard}>
            <CharacterAvatar avatarConfig={avatarConfig} size={80} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profileData?.character?.name || 'Your Character'}
              </Text>
              <View style={styles.lumensContainer}>
                <Image
                  source={{ uri: 'https://backend.131.212.41.8.nip.io/media/npc_portraits/lumen_golden.png' }}
                  style={styles.lumenImage}
                  resizeMode="contain"
                />
                <Text style={styles.lumensText}>{lumens} Lumens</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        <View style={styles.settingsList}>
          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>GENERAL</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSoundToggle}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons 
                  name={soundMuted ? "volume-off" : "volume-high"} 
                  size={24} 
                  color="#ffffff" 
                />
                <Text style={styles.settingItemText}>Sound</Text>
              </View>
              <Text style={styles.settingItemValue}>
                {soundMuted ? 'Muted' : 'On'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleNotificationToggle}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons 
                  name={notificationsEnabled ? "bell" : "bell-off-outline"} 
                  size={24} 
                  color="#ffffff" 
                />
                <Text style={styles.settingItemText}>Notifications</Text>
              </View>
              <Text style={styles.settingItemValue}>
                {notificationsEnabled ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>

            {notificationsEnabled && (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={async () => {
                  playPageFlipSound()
                  await sendTestNotification()
                  Alert.alert('Test Sent', 'A test notification has been sent!')
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemContent}>
                  <MaterialCommunityIcons 
                    name="bell-ring-outline" 
                    size={24} 
                    color="#ffffff" 
                  />
                  <Text style={styles.settingItemText}>Test Notification</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleTextSpeedToggle}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons name="text" size={24} color="#ffffff" />
                <Text style={styles.settingItemText}>Text Speed</Text>
              </View>
              <Text style={styles.settingItemValue}>
                {formatTextSpeed(textSpeed)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleChangeCharacter}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                {avatarConfig ? (
                  <CharacterAvatar avatarConfig={avatarConfig} size={32} />
                ) : (
                  <MaterialCommunityIcons name="account-outline" size={24} color="#ffffff" />
                )}
                <Text style={styles.settingItemText}>Change Your Character</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons name="shield-outline" size={24} color="#ffffff" />
                <Text style={styles.settingItemText}>Privacy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontFamily: 'BeyondWonderland',
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 28,
  },
  lumensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lumenImage: {
    width: 20,
    height: 20,
  },
  lumensText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  settingsList: {
    gap: 24,
  },
  settingsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  settingItemValue: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    marginTop: 8,
  },
  logoutButtonText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4444',
    letterSpacing: 0.5,
  },
})

