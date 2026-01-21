import { useNotifications } from '@/hooks/use-notifications'

/**
 * Component to initialize notifications
 * Must be rendered inside QueryClientProvider since useNotifications uses React Query hooks
 */
export function NotificationInitializer() {
  useNotifications()
  return null
}

