import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useAuthActions, useMyCharacter } from '@/api'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import { useNotifications } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import type { UserFullProfileResponse } from '@/api/types'
import type { NotificationTime } from '@/types/hooks'

interface ResourcesSettingsTabProps {
  profileData?: UserFullProfileResponse | null
  avatarConfig?: string | null
}

export function ResourcesSettingsTab({ profileData, avatarConfig: avatarConfigProp }: ResourcesSettingsTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const playPageFlipSound = usePageFlipSound()
  const soundMuted = useGameStore((state) => state.soundMuted)
  const toggleSoundMute = useGameStore((state) => state.toggleSoundMute)
  const textSpeed = useGameStore((state) => state.textSpeed)
  const cycleTextSpeed = useGameStore((state) => state.cycleTextSpeed)
  const resetGame = useGameStore((state) => state.resetGame)
  const lumens = useGameStore((state) => state.lumens.lumens)
  const { clearAuthStorage } = useAuthActions()
  const { notificationsEnabled, notificationTime, requestPermissions, cancelAllNotifications, updateNotificationTime } = useNotifications()
  const { data: myCharacter } = useMyCharacter()
  const [isNotificationTimeOpen, setIsNotificationTimeOpen] = useState(false)
  const [draftNotificationTime, setDraftNotificationTime] = useState<NotificationTime>({ hour: 9, minute: 0 })

  // Get avatar config from profile
  const avatarConfig = useMemo(() => {
    if (avatarConfigProp) return avatarConfigProp
    const profileCharacter = profileData?.profile?.character
    if (!profileCharacter?.customization) return null
    return buildAvatarConfig(profileCharacter.customization)
  }, [avatarConfigProp, profileData?.profile?.character])

  const experienceLumens =
    myCharacter?.experience ?? profileData?.profile?.character?.experience ?? lumens

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
            await clearAuthStorage()
            router.replace('/login')

            void (async () => {
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

  function formatClockTime(time: NotificationTime): string {
    const hour12 = time.hour % 12 || 12
    const minuteLabel = String(time.minute).padStart(2, '0')
    const period = time.hour >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minuteLabel} ${period}`
  }

  function shiftNotificationTime(deltaMinutes: number) {
    setDraftNotificationTime((current) => {
      const totalMinutes = current.hour * 60 + current.minute + deltaMinutes
      const normalized = (totalMinutes + 1440) % 1440
      return {
        hour: Math.floor(normalized / 60),
        minute: normalized % 60,
      }
    })
  }

  function handleOpenNotificationTime() {
    playPageFlipSound()
    setDraftNotificationTime(notificationTime)
    setIsNotificationTimeOpen(true)
  }

  function handleSaveNotificationTime() {
    playPageFlipSound()
    updateNotificationTime(draftNotificationTime)
    setIsNotificationTimeOpen(false)
    Alert.alert('Notification Time Updated', `Daily reminders will arrive at ${formatClockTime(draftNotificationTime)}.`)
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
                {profileData?.username || 'Your Character'}
              </Text>
              <View style={styles.lumensContainer}>
                <Image
                  source={{ uri: 'https://backend.131.212.41.8.nip.io/media/npc_portraits/lumen_golden.png' }}
                  style={styles.lumenImage}
                  resizeMode="contain"
                />
                <Text style={styles.lumensText}>{experienceLumens} Lumens</Text>
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
                onPress={handleOpenNotificationTime}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemContent}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={24} 
                    color="#ffffff" 
                  />
                  <Text style={styles.settingItemText}>Change Notification Time</Text>
                </View>
                <Text style={styles.settingItemValue}>{formatClockTime(notificationTime)}</Text>
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

          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleChangeCharacter}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <View style={styles.changeCharacterAvatar}>
                  {avatarConfig ? (
                    <CharacterAvatar avatarConfig={avatarConfig} size={36} />
                  ) : (
                    <MaterialCommunityIcons name="account-outline" size={24} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.settingItemText}>Change Your Character</Text>
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

      <Modal
        visible={isNotificationTimeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNotificationTimeOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsNotificationTimeOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Notification Time</Text>
            <Text style={styles.modalSubtitle}>Choose when your daily reminder should appear.</Text>

            <View style={styles.timePicker}>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(60)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="chevron-up" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(draftNotificationTime.hour).padStart(2, '0')}</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(-60)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="chevron-down" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.timeLabel}>Hour</Text>
              </View>

              <Text style={styles.timeDivider}>:</Text>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(5)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="chevron-up" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(draftNotificationTime.minute).padStart(2, '0')}</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(-5)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="chevron-down" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.timeLabel}>Minute</Text>
              </View>
            </View>

            <Text style={styles.timePreview}>Scheduled for {formatClockTime(draftNotificationTime)}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsNotificationTimeOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveNotificationTime}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    gap: 8,
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
  changeCharacterAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1d1d1d',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 22,
    color: '#ffffff',
  },
  modalSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 20,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 6,
  },
  timeButton: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeValue: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 40,
    textAlign: 'center',
  },
  timeLabel: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeDivider: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  timePreview: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalButtonPrimary: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  modalButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonTextPrimary: {
    color: '#121212',
  },
})

