/**
 * API Usage Examples
 * 
 * This file demonstrates how to use the API structure in your components.
 * These are examples - you can adapt them to your specific needs.
 */

import { View, Text, Button } from 'react-native'
import {
  useCharacters,
  useCreateCharacter,
  useCharacter,
  useStoryProgress,
  useUpdateStoryProgress,
  useEquipment,
  useUnlockEquipment,
  useAttributes,
  useUpdateAttributes,
  useJournalEntries,
  useCreateJournalEntry,
} from './index'

// ============================================================================
// Example 1: Fetching and Displaying Characters
// ============================================================================

export function CharacterListExample() {
  const { data: characters, isLoading, error, refetch } = useCharacters()
  const createCharacter = useCreateCharacter()

  const handleCreate = async () => {
    try {
      await createCharacter.mutateAsync({
        name: 'New Character',
        avatar: 'path/to/avatar.png',
      })
      // The query will automatically refetch after successful creation
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  if (isLoading) return <Text>Loading characters...</Text>
  if (error) return <Text>Error: {error.message}</Text>

  return (
    <View>
      <Button title="Create Character" onPress={handleCreate} />
      <Button title="Refresh" onPress={() => refetch()} />
      {characters?.map((character) => (
        <Text key={character.id}>{character.name}</Text>
      ))}
    </View>
  )
}

// ============================================================================
// Example 2: Working with Story Progress
// ============================================================================

export function StoryProgressExample() {
  const { data: progress, isLoading } = useStoryProgress()
  const updateProgress = useUpdateStoryProgress()

  const handleProgressChapter = async () => {
    if (!progress) return

    try {
      await updateProgress.mutateAsync({
        currentChapter: progress.currentChapter + 1,
        voidClarity: Math.min(100, progress.voidClarity + 25),
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  if (isLoading) return <Text>Loading progress...</Text>

  return (
    <View>
      <Text>Chapter: {progress?.currentChapter}</Text>
      <Text>Clarity: {progress?.voidClarity}%</Text>
      <Button title="Next Chapter" onPress={handleProgressChapter} />
    </View>
  )
}

// ============================================================================
// Example 3: Equipment Management
// ============================================================================

export function EquipmentExample() {
  const { data: equipment, isLoading } = useEquipment()
  const { data: unlocked } = useUnlockedEquipment()
  const unlockEquipment = useUnlockEquipment()

  const handleUnlock = async (equipmentId: string) => {
    try {
      await unlockEquipment.mutateAsync({ equipmentId })
    } catch (error) {
      console.error('Failed to unlock equipment:', error)
    }
  }

  if (isLoading) return <Text>Loading equipment...</Text>

  return (
    <View>
      <Text>Total Equipment: {equipment?.length}</Text>
      <Text>Unlocked: {unlocked?.length}</Text>
      {equipment
        ?.filter((item) => !item.unlocked)
        .map((item) => (
          <Button
            key={item.id}
            title={`Unlock ${item.name}`}
            onPress={() => handleUnlock(item.id)}
          />
        ))}
    </View>
  )
}

// ============================================================================
// Example 4: Attributes Management
// ============================================================================

export function AttributesExample() {
  const { data: attributes, isLoading } = useAttributes()
  const updateAttributes = useUpdateAttributes()

  const handleIncreaseCourage = async () => {
    if (!attributes) return

    try {
      await updateAttributes.mutateAsync({
        courage: Math.min(5, attributes.courage + 1),
      })
    } catch (error) {
      console.error('Failed to update attributes:', error)
    }
  }

  if (isLoading) return <Text>Loading attributes...</Text>

  return (
    <View>
      <Text>Courage: {attributes?.courage}/5</Text>
      <Text>Connection: {attributes?.connection}/5</Text>
      <Text>Exploration: {attributes?.exploration}/5</Text>
      <Text>Fear: {attributes?.fear}/5</Text>
      <Button title="Increase Courage" onPress={handleIncreaseCourage} />
    </View>
  )
}

// ============================================================================
// Example 5: Journal Entries
// ============================================================================

export function JournalExample() {
  const { data: journalData, isLoading } = useJournalEntries(1, 20)
  const createEntry = useCreateJournalEntry()

  const handleCreateEntry = async () => {
    try {
      await createEntry.mutateAsync({
        title: 'My Journal Entry',
        content: 'Today I learned about managing stress...',
        tags: ['reflection', 'growth'],
        mood: 'calm',
      })
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  if (isLoading) return <Text>Loading journal...</Text>

  const entries = journalData?.data || []
  const meta = journalData?.meta

  return (
    <View>
      <Text>Total Entries: {meta?.total}</Text>
      <Button title="New Entry" onPress={handleCreateEntry} />
      {entries.map((entry) => (
        <View key={entry.id}>
          <Text>{entry.title}</Text>
          <Text>{entry.content}</Text>
        </View>
      ))}
    </View>
  )
}

// ============================================================================
// Example 6: Integrating with Zustand Store
// ============================================================================

import { useEffect } from 'react'
import { useGameStore } from '../stores/game-store'

export function SyncWithZustandExample() {
  const { data: characters } = useCharacters()
  const { data: attributes } = useAttributes()
  const { data: progress } = useStoryProgress()

  const setCharacter = useGameStore((state) => state.setCharacter)
  const updateAttribute = useGameStore((state) => state.updateAttribute)
  const progressStory = useGameStore((state) => state.progressStory)

  // Sync character data
  useEffect(() => {
    if (characters && characters.length > 0) {
      const character = characters[0]
      setCharacter({
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        createdAt: character.createdAt,
      })
    }
  }, [characters, setCharacter])

  // Sync attributes
  useEffect(() => {
    if (attributes) {
      // Update each attribute if it differs from store
      // This is just an example - adjust based on your needs
      Object.entries(attributes).forEach(([key, value]) => {
        // You might want to compare with current store values first
        updateAttribute(key as keyof typeof attributes, value)
      })
    }
  }, [attributes, updateAttribute])

  // Sync story progress
  useEffect(() => {
    if (progress) {
      progressStory(progress.currentChapter, progress.voidClarity)
    }
  }, [progress, progressStory])

  return null // This is a sync component, no UI needed
}
