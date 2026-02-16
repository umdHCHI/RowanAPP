import React, { useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Alert, Image, Modal, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useAuthActions, useGameMyData, useMyCharacter } from '@/api'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import { useNotifications } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ResourcesSettingsTabProps } from '@/types/resources/resources'
import type { NotificationTime } from '@/types/hooks'
import { resourcesSettingsTabStyles as styles } from '@/styles/resources/resources-styles'

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
  const {
    notificationsEnabled,
    notificationTime,
    requestPermissions,
    cancelAllNotifications,
    updateNotificationTime,
  } = useNotifications()
  const { data: myCharacter } = useMyCharacter()
  const { data: gameData } = useGameMyData()
  const [isNotificationTimeOpen, setIsNotificationTimeOpen] = useState(false)
  const [draftNotificationTime, setDraftNotificationTime] = useState<NotificationTime>({ hour: 9, minute: 0 })

  const avatarConfig = useMemo(() => {
    if (avatarConfigProp) return avatarConfigProp
    const profileCharacter = profileData?.profile?.character
    if (!profileCharacter?.customization) return null
    return buildAvatarConfig(profileCharacter.customization)
  }, [avatarConfigProp, profileData?.profile?.character])

  const experienceLumens =
    gameData?.progression_snapshot?.lumens_total ??
    lumens ??
    myCharacter?.experience ??
    profileData?.profile?.character?.experience

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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            queryClient.clear()
            resetGame()
            await clearAuthStorage()
            router.replace('/login')
            void (async () => {
              try {
                await cancelAllNotifications()
              } catch {
                // ignore
              }
            })()
          },
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

  async function handleSaveNotificationTime() {
    playPageFlipSound()
    await updateNotificationTime(draftNotificationTime)
    setIsNotificationTimeOpen(false)
    Alert.alert(
      'Notification Time Updated',
      `Daily reminders will arrive at ${formatClockTime(draftNotificationTime)}.`
    )
  }

  async function handleNotificationToggle() {
    playPageFlipSound()

    if (notificationsEnabled) {
      await cancelAllNotifications()
    } else {
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
        <View style={styles.header}>
          <Text variant="heading" size={1} style={styles.title}>
            Settings
          </Text>
          <Text variant="body" size={1} style={styles.subtitle}>
            Manage your preferences and account.
          </Text>
        </View>

        {avatarConfig && (
          <View style={styles.profileCard}>
            <Card variant="default" padding={20} fullWidth>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <CharacterAvatar avatarConfig={avatarConfig} size={80} />
            <View style={styles.profileInfo}>
              <Text variant="title" size={2} style={styles.profileName}>
                {profileData?.username || 'Your Character'}
              </Text>
              <View style={styles.lumensContainer}>
                <Image
                  source={{ uri: 'https://backend.131.212.41.8.nip.io/media/npc_portraits/lumen_golden.png' }}
                  style={styles.lumenImage}
                  resizeMode="contain"
                />
                <Text variant="body" size={2} style={styles.lumensText}>
                  {experienceLumens} Lumens
                </Text>
              </View>
            </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.settingsList}>
          <View style={styles.settingsSection}>
            <Text variant="label" style={styles.sectionTitle}>
              GENERAL
            </Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleSoundToggle} activeOpacity={0.7}>
              <View style={styles.settingItemContent}>
                <MaterialDesignIcons
                  name={soundMuted ? 'volume-off' : 'volume-high'}
                  size={24}
                  color="#ffffff"
                />
                <Text variant="body" size={1} style={styles.settingItemText}>
                  Sound
                </Text>
              </View>
              <Text variant="body" size={1} style={styles.settingItemValue}>
                {soundMuted ? 'Muted' : 'On'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationToggle} activeOpacity={0.7}>
              <View style={styles.settingItemContent}>
                <MaterialDesignIcons
                  name={notificationsEnabled ? 'bell' : 'bell-off-outline'}
                  size={24}
                  color="#ffffff"
                />
                <Text variant="body" size={1} style={styles.settingItemText}>
                  Notifications
                </Text>
              </View>
              <Text variant="body" size={1} style={styles.settingItemValue}>
                {notificationsEnabled ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleOpenNotificationTime}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialDesignIcons name="clock-outline" size={24} color="#ffffff" />
                <Text variant="body" size={1} style={styles.settingItemText}>
                  Notification Time
                </Text>
              </View>
              <Text variant="body" size={1} style={styles.settingItemValue}>
                {formatClockTime(notificationTime)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleTextSpeedToggle} activeOpacity={0.7}>
              <View style={styles.settingItemContent}>
                <MaterialDesignIcons name="text" size={24} color="#ffffff" />
                <Text variant="body" size={1} style={styles.settingItemText}>
                  Text Speed
                </Text>
              </View>
              <Text variant="body" size={1} style={styles.settingItemValue}>
                {formatTextSpeed(textSpeed)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <TouchableOpacity style={styles.settingItem} onPress={handleChangeCharacter} activeOpacity={0.7}>
              <View style={styles.settingItemContent}>
                <View style={styles.changeCharacterAvatar}>
                  {avatarConfig ? (
                    <CharacterAvatar avatarConfig={avatarConfig} size={36} />
                  ) : (
                    <MaterialDesignIcons name="account-outline" size={24} color="#ffffff" />
                  )}
                </View>
                <Text variant="body" size={1} style={styles.settingItemText}>
                  Change Your Character
                </Text>
              </View>
              <MaterialDesignIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <Button variant="secondary" fullWidth onPress={handleLogout}>
              <View style={styles.logoutButtonContent}>
                <MaterialDesignIcons name="logout" size={24} color="#ff4444" />
                <Text variant="body" size={1} style={styles.logoutButtonText}>
                  Logout
                </Text>
              </View>
            </Button>
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
            <Text variant="title" size={2} style={styles.modalTitle}>
              Notification Time
            </Text>
            <Text variant="body" size={1} style={styles.modalSubtitle}>
              Choose when your daily reminder should appear.
            </Text>

            <View style={styles.timePicker}>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(60)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons name="chevron-up" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text variant="body" size={2} style={styles.timeValue}>
                  {String(draftNotificationTime.hour).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(-60)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons name="chevron-down" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text variant="label" style={styles.timeLabel}>
                  Hour
                </Text>
              </View>

              <Text variant="body" size={2} style={styles.timeDivider}>
                :
              </Text>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(5)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons name="chevron-up" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text variant="body" size={2} style={styles.timeValue}>
                  {String(draftNotificationTime.minute).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => shiftNotificationTime(-5)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons name="chevron-down" size={26} color="#ffffff" />
                </TouchableOpacity>
                <Text variant="label" style={styles.timeLabel}>
                  Minute
                </Text>
              </View>
            </View>

            <Text variant="body" size={1} style={styles.timePreview}>
              Scheduled for {formatClockTime(draftNotificationTime)}
            </Text>

            <View style={styles.modalActions}>
              <Button variant="secondary" onPress={() => setIsNotificationTimeOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleSaveNotificationTime}>
                Save
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}
