import { useEffect, useRef } from 'react'
import Constants from 'expo-constants'
import { useQueryClient } from '@tanstack/react-query'
import { useGameStore } from '@/stores/game-store'
import { useAuthUserId } from '@/api/hooks/use-auth'
import { useCurrentUserFullProfile } from '@/api'
import { userKeys } from '@/api/hooks/use-user'
import { userService } from '@/api/services/user.service'
import { parseDailyReminderTime, formatDailyReminderTime } from '@/utils/profile-mapper'

import type { NotificationTime, UseNotificationsResult } from '@/types/hooks'

const NOTIFICATION_IDENTIFIER = 'daily-research-reminder'

/** Expo Go (SDK 53+) no longer supports Android push/local notifications; avoid loading the native module. */
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient'

function getNotifications(): typeof import('expo-notifications') | null {
  if (IS_EXPO_GO) return null
  try {
    return require('expo-notifications')
  } catch {
    return null
  }
}

export function useNotifications(): UseNotificationsResult {
  const queryClient = useQueryClient()
  const notificationsEnabled = useGameStore((state) => state.notificationsEnabled)
  const notificationTime = useGameStore((state) => state.notificationTime)
  const setNotificationsEnabled = useGameStore((state) => state.setNotificationsEnabled)
  const setNotificationTime = useGameStore((state) => state.setNotificationTime)
  const userId = useAuthUserId()

  const { data: profileData } = useCurrentUserFullProfile()
  const notificationListener = useRef<{ remove: () => void } | null>(null)
  const responseListener = useRef<{ remove: () => void } | null>(null)
  const isSyncingRef = useRef(false)
  const userToggledRef = useRef(false)

  // Set notification handler only when not in Expo Go (SDK 53+ removed notifications from Expo Go)
  useEffect(() => {
    const Notifications = getNotifications()
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      })
    }
  }, [])

  // Load notification preferences from backend profile when profile data changes (not when local state changes)
  const lastSyncedProfileRef = useRef<{
    enable_daily_reminders: boolean | undefined
    daily_reminder_time: string | null | undefined
  } | null>(null)

  useEffect(() => {
    if (!profileData?.profile || isSyncingRef.current || userToggledRef.current) {
      return
    }

    const enabled =
      profileData.profile.enable_daily_reminders ??
      profileData.profile.notifications_enabled ??
      false
    const dailyReminderTime = profileData.profile.daily_reminder_time ?? null
    const prev = lastSyncedProfileRef.current

    if (
      prev?.enable_daily_reminders === enabled &&
      prev?.daily_reminder_time === dailyReminderTime
    ) {
      return
    }

    lastSyncedProfileRef.current = { enable_daily_reminders: enabled, daily_reminder_time: dailyReminderTime }
    const timeFromBackend = parseDailyReminderTime(dailyReminderTime)

    isSyncingRef.current = true
    setNotificationsEnabled(enabled)
    setNotificationTime(timeFromBackend)
    setTimeout(() => {
      isSyncingRef.current = false
    }, 100)
  }, [
    profileData?.profile?.enable_daily_reminders,
    profileData?.profile?.notifications_enabled,
    profileData?.profile?.daily_reminder_time,
    setNotificationsEnabled,
    setNotificationTime,
  ])

  // Request permissions and schedule notifications (no-op in Expo Go)
  useEffect(() => {
    const notifications = getNotifications()
    if (!notifications) return
    const N = notifications

    async function setupNotifications() {
      if (!notificationsEnabled) {
        await N.cancelAllScheduledNotificationsAsync()
        return
      }

      try {
        const { status: existingStatus } = await N.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
          const { status } = await N.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted')
          setNotificationsEnabled(false)
          if (userId) {
            await userService.updateProfilePreferences(userId, {
              enable_daily_reminders: false,
            })
          }
          return
        }

        await N.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER)

        await N.scheduleNotificationAsync({
          content: {
            title: 'Time to Participate in Research',
            body: 'Your daily research participation is waiting for you in The Archive.',
            sound: true,
            priority: N.AndroidNotificationPriority.HIGH,
            data: {
              type: 'daily-research-reminder',
            },
          },
          trigger: {
            type: N.SchedulableTriggerInputTypes.DAILY,
            hour: notificationTime.hour,
            minute: notificationTime.minute,
          },
          identifier: NOTIFICATION_IDENTIFIER,
        })

        console.log('Daily notification scheduled successfully')
      } catch (error) {
        console.error('Error setting up notifications:', error)
        setNotificationsEnabled(false)
        if (userId) {
          await userService
            .updateProfilePreferences(userId, { enable_daily_reminders: false })
            .catch(console.error)
        }
      }
    }

    setupNotifications()
  }, [notificationsEnabled, notificationTime.hour, notificationTime.minute, setNotificationsEnabled, userId])

  // Set up notification listeners (no-op in Expo Go)
  useEffect(() => {
    const Notifications = getNotifications()
    if (!Notifications) return

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response)
      const data = response.notification.request.content.data
      if (data?.type === 'daily-research-reminder') {
        // Handle navigation to research/journal screen if needed
      }
    })

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [])

  function invalidateUserProfile() {
    if (userId != null) {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(userId) })
    }
  }

  async function requestPermissions(): Promise<boolean> {
    try {
      userToggledRef.current = true
      const Notifications = getNotifications()

      if (!Notifications) {
        // Expo Go: no native notifications; still persist preference to backend
        setNotificationsEnabled(true)
        if (userId) {
          await userService.updateProfilePreferences(userId, {
            enable_daily_reminders: true,
            daily_reminder_time: formatDailyReminderTime(notificationTime),
          })
          invalidateUserProfile()
        }
        setTimeout(() => {
          userToggledRef.current = false
        }, 1000)
        return true
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      const granted = finalStatus === 'granted'

      if (granted) {
        setNotificationsEnabled(true)
        if (userId) {
          await userService.updateProfilePreferences(userId, {
            enable_daily_reminders: true,
            daily_reminder_time: formatDailyReminderTime(notificationTime),
          })
          invalidateUserProfile()
        }
      } else {
        setNotificationsEnabled(false)
        if (userId) {
          await userService.updateProfilePreferences(userId, {
            enable_daily_reminders: false,
          })
          invalidateUserProfile()
        }
      }

      setTimeout(() => {
        userToggledRef.current = false
      }, 1000)

      return granted
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      setNotificationsEnabled(false)
      userToggledRef.current = false
      return false
    }
  }

  async function updateNotificationTime(time: NotificationTime) {
    setNotificationTime(time)
    if (userId) {
      try {
        await userService.updateProfilePreferences(userId, {
          daily_reminder_time: formatDailyReminderTime(time),
        })
        invalidateUserProfile()
      } catch (error) {
        console.error('Error saving notification time to backend:', error)
      }
    }
  }

  async function cancelAllNotifications() {
    try {
      userToggledRef.current = true
      const Notifications = getNotifications()
      if (Notifications) {
        await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER)
      }
      setNotificationsEnabled(false)
      if (userId) {
        await userService.updateProfilePreferences(userId, {
          enable_daily_reminders: false,
        })
        invalidateUserProfile()
      }
      setTimeout(() => {
        userToggledRef.current = false
      }, 1000)
    } catch (error) {
      console.error('Error canceling notifications:', error)
      userToggledRef.current = false
    }
  }

  return {
    notificationsEnabled,
    notificationTime,
    requestPermissions,
    cancelAllNotifications,
    updateNotificationTime,
  }
}

