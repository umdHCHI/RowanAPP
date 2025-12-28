import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { MemoryItem } from '@/hooks/use-resources'

interface ResourcesMemoriesTabProps {
  memories: MemoryItem[]
}

export function ResourcesMemoriesTab({ memories }: ResourcesMemoriesTabProps) {
  return (
    <View style={styles.memoriesContainer}>
      {memories.map((memory) => (
        <View key={`memory-${memory.id}`} style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>{memory.title}</Text>
          {memory.description && (
            <View style={styles.memoryContent}>
              {memory.type === 'REFLECTION' ? (
                <TouchableOpacity style={styles.memoryButton}>
                  <Text style={styles.memoryButtonText}>{memory.description}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.memoryDescription}>{memory.description}</Text>
              )}
            </View>
          )}
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

