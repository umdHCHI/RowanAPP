import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attributesService } from '../services/attributes.service'
import type { AttributesResponse, AttributesUpdateRequest } from '../types'

/**
 * Query Keys
 */
export const attributesKeys = {
  all: ['attributes'] as const,
  current: () => [...attributesKeys.all, 'current'] as const,
}

/**
 * Get current attributes
 */
export function useAttributes() {
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
  })
}

/**
 * Update attributes
 */
export function useUpdateAttributes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AttributesUpdateRequest) => {
      const response = await attributesService.update(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to update attributes')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributesKeys.current() })
    },
  })
}
