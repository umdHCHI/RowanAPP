import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { characterService } from '../services/character.service'
import { useCurrentUserFullProfile } from './use-auth'
import { userKeys } from './use-user'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToLumen } from '@/utils/profile-mapper'
import type {
  CharacterResponse,
  CharacterCreateRequest,
  CharacterUpdateRequest,
} from '../types'

/**
 * Query Keys
 */
export const characterKeys = {
  all: ['characters'] as const,
  lists: () => [...characterKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...characterKeys.lists(), filters] as const,
  details: () => [...characterKeys.all, 'detail'] as const,
  detail: (id: string) => [...characterKeys.details(), id] as const,
}

/**
 * Get all characters
 */
export function useCharacters() {
  return useQuery({
    queryKey: characterKeys.lists(),
    queryFn: async () => {
      const response = await characterService.getAll()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch characters')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get a character by ID
 */
export function useCharacter(id: string | null) {
  return useQuery({
    queryKey: characterKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Character ID is required')
      const response = await characterService.getById(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch character')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new character
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CharacterCreateRequest) => {
      const response = await characterService.create(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to create character')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch characters list
      queryClient.invalidateQueries({ queryKey: characterKeys.lists() })
    },
  })
}

/**
 * Update a character
 */
export function useUpdateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CharacterUpdateRequest }) => {
      try {
        const response = await characterService.update(id, data)
        if (!response.success) {
          const error = new Error(response.message || 'Failed to update character') as Error & { status?: number; errors?: any }
          error.status = (response as any).status
          error.errors = (response as any).errors
          throw error
        }
        return response.data
      } catch (error: any) {
        // If error already has status/message/errors, preserve it as-is
        // This preserves ApiError objects from the API client
        if (error && (error.status !== undefined || error.errors !== undefined || error.message)) {
          // Make sure it's a proper Error object with all properties
          const apiError = error instanceof Error ? error : new Error(error.message || String(error))
          if (error.status !== undefined) (apiError as any).status = error.status
          if (error.errors !== undefined) (apiError as any).errors = error.errors
          if (error.code !== undefined) (apiError as any).code = error.code
          throw apiError
        }
        // Otherwise wrap in a generic error
        throw new Error(error?.message || 'Failed to update character')
      }
    },
    onSuccess: (data) => {
      // Invalidate both list and specific character
      queryClient.invalidateQueries({ queryKey: characterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: characterKeys.detail(data.id) })
    },
  })
}

/**
 * Delete a character
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await characterService.delete(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete character')
      }
    },
    onSuccess: () => {
      // Invalidate characters list
      queryClient.invalidateQueries({ queryKey: characterKeys.lists() })
    },
  })
}

/**
 * Award experience (lumens) to the current user's character
 * This hook automatically fetches the current character and increments experience
 */
export function useAwardExperience() {
  const queryClient = useQueryClient()
  const { data: profileData } = useCurrentUserFullProfile()
  const setLumen = useGameStore((state) => state.setLumen)

  return useMutation({
    mutationFn: async (amount: number = 1) => {
      if (!profileData?.character?.id) {
        throw new Error('No character found. Please create a character first.')
      }

      const characterId = String(profileData.character.id)
      const currentExperience = profileData.character.experience || 0
      const newExperience = currentExperience + amount

      // Optimistically update the game store immediately
      if (profileData) {
        const updatedProfile = {
          ...profileData,
          character: {
            ...profileData.character,
            experience: newExperience,
          },
        }
        const mappedLumen = mapProfileToLumen(updatedProfile)
        if (mappedLumen) {
          setLumen(mappedLumen)
        }
      }

      // Update character with new experience on backend
      const response = await characterService.update(characterId, {
        experience: newExperience,
      } as CharacterUpdateRequest)

      if (!response.success) {
        // Rollback optimistic update on error
        if (profileData) {
          const mappedLumen = mapProfileToLumen(profileData)
          if (mappedLumen) {
            setLumen(mappedLumen)
          }
        }
        throw new Error(response.message || 'Failed to award experience')
      }

      return newExperience
    },
    onSuccess: () => {
      // Delay invalidation to prevent flashing/re-renders during confirmation displays
      // The caller should handle immediate UI updates, and we'll refresh data after a delay
      setTimeout(() => {
        if (profileData?.character?.id) {
          queryClient.invalidateQueries({ queryKey: characterKeys.detail(String(profileData.character.id)) })
        }
        queryClient.invalidateQueries({ queryKey: characterKeys.lists() })
        
        // Invalidate user profile to refresh experience display
        if (profileData?.user?.id) {
          queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(String(profileData.user.id)) })
        }
      }, 2000) // Delay to allow confirmation UI to display
    },
  })
}
