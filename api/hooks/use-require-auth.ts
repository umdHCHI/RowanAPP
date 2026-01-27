import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useIsAuthenticated } from './use-auth'

/**
 * Hook that redirects to login if user is not authenticated
 * 
 */
export function useRequireAuth() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  return isAuthenticated
}
