import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/user.service'
import type {
  UserResponse,
  UserFullProfileResponse,
  UserListResponse,
} from '../types'

/**
 * Query Keys
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
  fullProfile: (id: string | number) => [...userKeys.detail(id), 'full_profile'] as const,
}

/**
 * Get a user by ID
 */
export function useUser(id: string | number | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? 'missing'),
    queryFn: async () => {
      if (!id) throw new Error('User ID is required')
      const response = await userService.getById(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get full profile for a user by ID
 */
export function useUserFullProfile(id: string | number | null) {
  return useQuery<UserFullProfileResponse>({
    queryKey: userKeys.fullProfile(id ?? 'missing'),
    queryFn: async () => {
      if (!id) throw new Error('User ID is required')
      // full_profile endpoint returns the raw profile object, not an ApiResponse wrapper
      const profile = await userService.getFullProfile(id)
      return profile
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get paginated user list (GET /api/users/)
 */
export function useUserList() {
  return useQuery<UserListResponse>({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

