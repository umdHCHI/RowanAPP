import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { MemoryItem } from '@/hooks/use-resources'

interface ResourcesMemoriesTabProps {
  memories: MemoryItem[]
}

export function ResourcesMemoriesTab({ memories }: ResourcesMemoriesTabProps) {
  const router = useRouter()

  function renderMemoryContent(memory: MemoryItem) {
    // Handle JOURNAL_REWARD type
    if (memory.type === 'JOURNAL_REWARD') {
      let journalEntryId: string | null = null
      try {
        if (memory.content) {
          const parsed = JSON.parse(memory.content)
          journalEntryId = parsed.journalEntryId || null
        }
      } catch (e) {
        // Ignore parse errors
      }

      return (
        <View>
          {memory.description && (
            <Text style={styles.memoryDescription}>{memory.description}</Text>
          )}
          <TouchableOpacity
            style={styles.memoryButton}
            onPress={() => {
              const url = journalEntryId ? `/journal?promptId=${journalEntryId}` : '/journal'
              router.push(url)
            }}
          >
            <MaterialCommunityIcons name="book-open-variant" size={16} color="#FFD700" style={{ marginRight: 8 }} />
            <Text style={styles.memoryButtonText}>Open Journal</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (memory.type !== 'REFLECTION') {
      return (
        <Text style={styles.memoryDescription}>{memory.description}</Text>
      )
    }

    // Handle different modalities
    if (memory.modality === 'draw') {
      return (
        <TouchableOpacity style={styles.memoryButton}>
          <MaterialCommunityIcons name="brush" size={16} color="#FFD700" style={{ marginRight: 8 }} />
          <Text style={styles.memoryButtonText}>Drawing saved</Text>
        </TouchableOpacity>
      )
    }

    if (memory.modality === 'voice') {
      return (
        <TouchableOpacity style={styles.memoryButton}>
          <MaterialCommunityIcons name="microphone" size={16} color="#FFD700" style={{ marginRight: 8 }} />
          <Text style={styles.memoryButtonText}>Voice memo saved</Text>
        </TouchableOpacity>
      )
    }

    // Default: write mode or legacy reflection
    if (memory.description) {
      return (
        <TouchableOpacity style={styles.memoryButton}>
          <Text style={styles.memoryButtonText}>{memory.description}</Text>
        </TouchableOpacity>
      )
    }

    // Fallback for reflections without description
    return (
      <TouchableOpacity style={styles.memoryButton}>
        <Text style={styles.memoryButtonText}>Reflection saved</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.memoriesContainer}>
      {memories.map((memory) => (
        <View key={`memory-${memory.id}`} style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>
            {memory.type === 'JOURNAL_REWARD' ? 'JOURNAL REWARD' : memory.title}
          </Text>
          <View style={styles.memoryContent}>
            {renderMemoryContent(memory)}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  memoriesContainer: {
    gap: 20,
  },
  memoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  memoryTitle: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  memoryContent: {
    marginTop: 8,
  },
  memoryDescription: {
    fontFamily: 'BeyondWonderland',
    fontSize: 20,
    color: '#ffffff',
    lineHeight: 28,
  },
  memoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  memoryButtonText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#ffffff',
  },
})

