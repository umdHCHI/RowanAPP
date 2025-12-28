import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentService } from '../services/equipment.service'
import type { EquipmentResponse, EquipmentUnlockRequest } from '../types'

/**
 * Query Keys
 */
export const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...equipmentKeys.lists(), filters] as const,
  unlocked: () => [...equipmentKeys.all, 'unlocked'] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
}

/**
 * Get all equipment
 */
export function useEquipment() {
  return useQuery({
    queryKey: equipmentKeys.lists(),
    queryFn: async () => {
      const response = await equipmentService.getAll()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch equipment')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get only unlocked equipment
 */
export function useUnlockedEquipment() {
  return useQuery({
    queryKey: equipmentKeys.unlocked(),
    queryFn: async () => {
      const response = await equipmentService.getUnlocked()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch unlocked equipment')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get equipment by ID
 */
export function useEquipmentById(id: string | null) {
  return useQuery({
    queryKey: equipmentKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Equipment ID is required')
      const response = await equipmentService.getById(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch equipment')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Unlock equipment
 */
export function useUnlockEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EquipmentUnlockRequest) => {
      const response = await equipmentService.unlock(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to unlock equipment')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate both all equipment and unlocked equipment queries
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: equipmentKeys.unlocked() })
    },
  })
}
