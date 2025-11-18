import { useState, useRef, useEffect } from 'react';

interface NotificationItem {
  message: string;
  type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  icon?: string;
  iconImage?: any;
  statName?: string;
}

/**
 * Hook for managing floating reward notification queue
 * Follows Archive pattern: Sequential notification display with animation timing
 */
export const useRewardNotifications = () => {
  const [rewardNotification, setRewardNotification] = useState<NotificationItem & { visible: boolean }>({
    visible: false,
    message: '',
    type: 'stat'
  });

  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [isShowingNotification, setIsShowingNotification] = useState(false);

  // Refs to avoid stale closures in async callbacks
  const notificationQueueRef = useRef<NotificationItem[]>([]);
  const isShowingNotificationRef = useRef(false);

  // Sync state to refs
  useEffect(() => {
    notificationQueueRef.current = notificationQueue;
  }, [notificationQueue]);

  useEffect(() => {
    isShowingNotificationRef.current = isShowingNotification;
  }, [isShowingNotification]);

  /**
   * Add notification to queue and trigger display
   * Archive pattern: Prevents notification overlap with sequential processing
   */
  const showRewardNotification = (
    message: string,
    type: NotificationItem['type'],
    icon?: string,
    iconImage?: any,
    statName?: string
  ) => {
    // Add to queue and update ref immediately (prevents race conditions)
    const newNotification: NotificationItem = { message, type, icon, iconImage, statName };
    setNotificationQueue(prev => {
      const newQueue = [...prev, newNotification];
      notificationQueueRef.current = newQueue; // Update ref immediately
      return newQueue;
    });

    // Process queue if not currently showing a notification
    if (!isShowingNotificationRef.current) {
      setTimeout(() => {
        processNotificationQueue();
      }, 100);
    }
  };

  /**
   * Process next notification in queue
   * Archive pattern: Sequential display with animation timing
   */
  const processNotificationQueue = () => {
    // Prevent concurrent processing
    if (isShowingNotificationRef.current) {
      return;
    }

    // Check if queue is empty
    if (notificationQueueRef.current.length === 0) {
      isShowingNotificationRef.current = false;
      setIsShowingNotification(false);
      return;
    }

    // Set flag immediately to prevent concurrent execution
    isShowingNotificationRef.current = true;
    setIsShowingNotification(true);

    const nextNotification = notificationQueueRef.current[0];

    // Remove from ref immediately to prevent duplicate processing
    notificationQueueRef.current = notificationQueueRef.current.slice(1);

    // Display notification
    setRewardNotification({
      visible: true,
      message: nextNotification.message,
      type: nextNotification.type,
      icon: nextNotification.icon,
      iconImage: nextNotification.iconImage,
      statName: nextNotification.statName
    });

    // Update state to match ref
    setNotificationQueue(prev => {
      const newQueue = prev.slice(1);
      return newQueue;
    });
  };

  /**
   * Hide current notification and process next in queue
   * Archive pattern: Wait for hide animation before showing next
   */
  const hideRewardNotification = () => {
    setRewardNotification(prev => ({ ...prev, visible: false }));
    setIsShowingNotification(false);

    // Wait for hide animation (300ms) before processing next notification
    setTimeout(() => {
      processNotificationQueue();
    }, 400); // 400ms allows for smooth fade-out animation
  };

  return {
    rewardNotification,
    showRewardNotification,
    hideRewardNotification
  };
};
