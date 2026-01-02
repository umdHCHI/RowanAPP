import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { journalService } from '../services/journal.service'
import type {
  JournalEntryResponse,
  JournalEntryCreateRequest,
  JournalEntryUpdateRequest,
  JournalPromptResponse,
} from '../types'

/**
 * Query Keys
 */
export const journalKeys = {
  all: ['journal'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...journalKeys.lists(), page, limit] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalKeys.details(), id] as const,
  prompts: () => [...journalKeys.all, 'prompts'] as const,
}

/**
 * Get all journal entries (paginated)
 */
export function useJournalEntries(page = 1, limit = 20) {
  return useQuery({
    queryKey: journalKeys.list(page, limit),
    queryFn: async () => {
      const response = await journalService.getAll(page, limit)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch journal entries')
      }
      return response
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get a journal entry by ID
 */
export function useJournalEntry(id: string | null) {
  return useQuery({
    queryKey: journalKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Journal entry ID is required')
      const response = await journalService.getById(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch journal entry')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new journal entry
 */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JournalEntryCreateRequest) => {
      const response = await journalService.create(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to create journal entry')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate journal entries list and all byPrompt queries
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...journalKeys.all, 'byPrompt'] })
    },
  })
}

/**
 * Update a journal entry
 */
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JournalEntryUpdateRequest }) => {
      const response = await journalService.update(id, data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to update journal entry')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate both list, specific entry, and all byPrompt queries
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(String(data.id)) })
      queryClient.invalidateQueries({ queryKey: [...journalKeys.all, 'byPrompt'] })
    },
  })
}

/**
 * Delete a journal entry
 */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await journalService.delete(id)
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete journal entry')
      }
    },
    onSuccess: () => {
      // Invalidate journal entries list
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() })
    },
  })
}

/**
 * Get all journal prompts
 */
export function useJournalPrompts() {
  return useQuery({
    queryKey: journalKeys.prompts(),
    queryFn: async () => {
      return journalService.getPrompts()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get a journal entry by prompt ID and optionally entry type
 * Fetches all entries and finds the one matching the prompt ID and entry type
 */
export function useJournalEntryByPrompt(
  promptId: number | null,
  entryType: string | null = null
) {
  return useQuery({
    queryKey: [...journalKeys.all, 'byPrompt', promptId, entryType],
    queryFn: async () => {
      if (!promptId) throw new Error('Prompt ID is required')
      
      try {
        // Fetch all entries and find the one matching the prompt ID
        // Using a high limit to get all entries (you may want to adjust this based on your needs)
        const response = await journalService.getAll(1, 100)
        
        // Handle both wrapped and direct array responses
        let entries: JournalEntryResponse[] = []
        if (response && typeof response === 'object') {
          if ('data' in response && Array.isArray(response.data)) {
            entries = response.data
          } else if ('success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
            entries = response.data
          } else if (Array.isArray(response)) {
            entries = response
          }
        }
        
        // Find entry with matching prompt ID and optionally entry type
        // If entryType is provided, prefer exact match, otherwise return any entry for this prompt
        if (entryType) {
          const exactMatch = entries.find(
            (e) => e.prompt === promptId && e.entry_type === entryType
          )
          if (exactMatch) return exactMatch
        }
        
        // Fallback: find any entry with matching prompt ID
        const anyMatch = entries.find((e) => e.prompt === promptId)
        return anyMatch || null
      } catch (error) {
        console.error('Error fetching journal entry by prompt:', error)
        return null
      }
    },
    enabled: !!promptId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}