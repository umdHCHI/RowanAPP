import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attributesService } from '../services/attributes.service'
import type { AttributesResponse, AttributesUpdateRequest } from '../types'
import { useCurrentUserFullProfile } from './use-auth'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToLumen } from '@/utils/profile-mapper'

/**
 * Query Keys
 */
export const attributesKeys = {
  all: ['attributes'] as const,
  current: () => [...attributesKeys.all, 'current'] as const,
}

function extractLumens(attributes?: AttributesResponse | null): number | null {
  if (!attributes) return null
  const value = attributes.experience ?? attributes.lumens ?? attributes.total_lumens
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Get current attributes
 */
export function useAttributes() {
  const setLumen = useGameStore((state) => state.setLumen)

  return useQuery({
    queryKey: attributesKeys.current(),
    queryFn: async () => {
      const response = await attributesService.get()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attributes')
      }
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    onSuccess: (data) => {
      const lumens = extractLumens(data)
      if (lumens != null) {
        setLumen({ lumens })
      }
    },
  })
}

/**
 * Update attributes
 */
export function useUpdateAttributes() {
  const queryClient = useQueryClient()
  const setLumen = useGameStore((state) => state.setLumen)

  return useMutation({
    mutationFn: async (data: AttributesUpdateRequest) => {
      const response = await attributesService.update(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to update attributes')
      }
      return response.data
    },
    onSuccess: (data) => {
      const lumens = extractLumens(data)
      if (lumens != null) {
        setLumen({ lumens })
      }
      queryClient.invalidateQueries({ queryKey: attributesKeys.current() })
    },
  })
}

/**
 * Sync experience -> lumens from the full profile
 */
export function useExperienceLumens() {
  const { data: profile, isLoading, error } = useCurrentUserFullProfile()
  const setLumen = useGameStore((state) => state.setLumen)

  useEffect(() => {
    if (!profile) return
    const mappedLumen = mapProfileToLumen(profile)
    if (mappedLumen) {
      setLumen(mappedLumen)
    }
  }, [profile, setLumen])

  return {
    isLoading,
    error: error || null,
  }
}
