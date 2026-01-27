import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import { useGameStore } from '@/stores/game-store'
import { useAuthUserId } from '@/api/hooks/use-auth'
import { useCurrentUserFullProfile } from '@/api'
import { userService } from '@/api/services/user.service'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

import type { UseNotificationsResult } from '@/types/hooks'

const NOTIFICATION_IDENTIFIER = 'daily-research-reminder'

export function useNotifications(): UseNotificationsResult {
  const notificationsEnabled = useGameStore((state) => state.notificationsEnabled)
  const setNotificationsEnabled = useGameStore((state) => state.setNotificationsEnabled)
  const userId = useAuthUserId()

  const { data: profileData } = useCurrentUserFullProfile()
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)
  const isSyncingRef = useRef(false)
  const userToggledRef = useRef(false)

  // Load notification preference from backend profile when available
  useEffect(() => {
    // Don't sync from backend if user just toggled manually
    if (!profileData?.profile || isSyncingRef.current || userToggledRef.current) {
      return
    }

    const backendValue = profileData.profile.notifications_enabled
    
    // If backend has a value and it differs from local state, update local state
    if (backendValue !== undefined && backendValue !== notificationsEnabled) {
      isSyncingRef.current = true
      setNotificationsEnabled(backendValue)
      // Reset sync flag after state update
      setTimeout(() => {
        isSyncingRef.current = false
      }, 100)
    } 
    // If backend doesn't have a value yet but local state is true, sync to backend
    else if (backendValue === undefined && notificationsEnabled && userId) {
      isSyncingRef.current = true
      userService.updateNotificationsEnabled(userId, true).finally(() => {
        isSyncingRef.current = false
      })
    }
  }, [profileData?.profile?.notifications_enabled, notificationsEnabled, userId, setNotificationsEnabled])

  // Request permissions and schedule notifications
  useEffect(() => {
    async function setupNotifications() {
      if (!notificationsEnabled) {
        // Cancel all notifications if disabled
        await Notifications.cancelAllScheduledNotificationsAsync()
        return
      }

      try {
        // Request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted')
          setNotificationsEnabled(false)
          // Sync to backend
          if (userId) {
            await userService.updateNotificationsEnabled(userId, false)
          }
          return
        }

        // Cancel existing notifications with our identifier to avoid duplicates
        await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER)

        // Schedule daily notification at 9 AM using daily trigger
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time to Participate in Research',
            body: 'Your daily research participation is waiting for you in The Archive.',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: {
              type: 'daily-research-reminder',
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9,
            minute: 0,
          },
          identifier: NOTIFICATION_IDENTIFIER,
        })

        console.log('Daily notification scheduled successfully for 9:00 AM')
      } catch (error) {
        console.error('Error setting up notifications:', error)
        setNotificationsEnabled(false)
        // Sync to backend on error
        if (userId) {
          await userService.updateNotificationsEnabled(userId, false).catch(console.error)
        }
      }
    }

    setupNotifications()
  }, [notificationsEnabled, setNotificationsEnabled, userId])

  // Set up notification listeners for when app is in foreground
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification)
      // You can handle the notification here if needed
    })

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response)
      // You can navigate to a specific screen here if needed
      const data = response.notification.request.content.data
      if (data?.type === 'daily-research-reminder') {
        // Handle navigation to research/journal screen if needed
      }
    })

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [])

  async function requestPermissions(): Promise<boolean> {
    try {
      userToggledRef.current = true
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      const granted = finalStatus === 'granted'
      
      if (granted) {
        // Enable notifications and let the useEffect handle scheduling
        setNotificationsEnabled(true)
        // Sync to backend
        if (userId) {
          await userService.updateNotificationsEnabled(userId, true)
        }
      } else {
        setNotificationsEnabled(false)
        // Sync to backend
        if (userId) {
          await userService.updateNotificationsEnabled(userId, false)
        }
      }
      
      // Reset toggle flag after a delay to allow backend sync to complete
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

  async function sendTestNotification(): Promise<void> {
    try {
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications first.')
        return
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from The Archive!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'test',
          },
        },
        trigger: null, // Send immediately
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }

  async function cancelAllNotifications() {
    try {
      userToggledRef.current = true
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER)
      setNotificationsEnabled(false)
      // Sync to backend
      if (userId) {
        await userService.updateNotificationsEnabled(userId, false)
      }
      // Reset toggle flag after a delay to allow backend sync to complete
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
    requestPermissions,
    cancelAllNotifications,
    sendTestNotification,
  }
}

