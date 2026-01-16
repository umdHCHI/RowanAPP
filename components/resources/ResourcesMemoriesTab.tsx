import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useStoryPassage } from '@/api/hooks/use-story'
import type { MemoryItem } from '@/hooks/use-resources'

interface ResourcesMemoriesTabProps {
  memories: MemoryItem[]
}

interface StoryPassageDisplayProps {
  storyId: number
  passageId: string
}

function StoryPassageDisplay({ storyId, passageId }: StoryPassageDisplayProps) {
  const { data: passageData, isLoading } = useStoryPassage(storyId, passageId)
  
  if (isLoading) {
    return (
      <View style={styles.passageLoading}>
        <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.5)" />
      </View>
    )
  }
  
  const passage = passageData?.passage
  if (!passage || !passage.content) return null
  
  // Truncate long passages to a reasonable length
  const maxLength = 200
  const content = passage.content.length > maxLength 
    ? passage.content.substring(0, maxLength) + '...'
    : passage.content
  
  return (
    <View style={styles.passageContainer}>
      <Text style={styles.passageContent}>{content}</Text>
    </View>
  )
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch {
    return ''
  }
}

export function ResourcesMemoriesTab({ memories }: ResourcesMemoriesTabProps) {
  const router = useRouter()

  function renderMemoryContent(memory: MemoryItem) {
    // Handle STORY_PROGRESS type
    if (memory.type === 'STORY_PROGRESS') {
      const progress = memory.progressPercentage || 0
      const isCompleted = memory.isCompleted || false
      
      return (
        <View>
          <View style={styles.storyProgressHeader}>
            <View style={styles.storyProgressInfo}>
              <Text style={styles.storyCategory}>{memory.storyCategory?.toUpperCase() || 'STORY'}</Text>
              <Text style={styles.storyProgressText}>
                {isCompleted ? 'Completed' : `${Math.round(progress)}% Complete`}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedBadgeText}>COMPLETE</Text>
              </View>
            )}
          </View>
          
          {memory.description && (
            <Text style={styles.memoryDescription}>{memory.description}</Text>
          )}
          
          {/* Display 1-2 passages */}
          {memory.storyId && memory.passageIds && memory.passageIds.length > 0 && (
            <View style={styles.passagesContainer}>
              {memory.passageIds.slice(0, 2).map((passageId, index) => (
                <StoryPassageDisplay
                  key={`${passageId}-${index}`}
                  storyId={memory.storyId!}
                  passageId={passageId}
                />
              ))}
            </View>
          )}
          
          <View style={styles.storyStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open-page-variant" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.statText}>{memory.passagesVisitedCount || 0} Passages</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="gesture-tap" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.statText}>{memory.choicesMadeCount || 0} Choices</Text>
            </View>
          </View>
          
          <View style={styles.storyDates}>
            {memory.startedAt && (
              <Text style={styles.dateText}>
                Started: {formatDate(memory.startedAt)}
              </Text>
            )}
            {memory.lastPlayed && !isCompleted && (
              <Text style={styles.dateText}>
                Last played: {formatDate(memory.lastPlayed)}
              </Text>
            )}
            {memory.completedAt && isCompleted && (
              <Text style={styles.dateText}>
                Completed: {formatDate(memory.completedAt)}
              </Text>
            )}
          </View>
          
          {memory.storyId && (
            <TouchableOpacity
              style={styles.memoryButton}
              onPress={() => {
                router.push(`/story-overview?storyId=${memory.storyId}`)
              }}
            >
              <MaterialCommunityIcons name="book-open-variant" size={16} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.memoryButtonText}>
                {isCompleted ? 'View Story' : 'Continue Story'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }

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
      {memories.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="book-open-variant-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyStateText}>No memories yet</Text>
          <Text style={styles.emptyStateSubtext}>Start exploring stories to create memories</Text>
        </View>
      ) : (
        memories.map((memory) => (
          <View key={`memory-${memory.id}`} style={styles.memoryCard}>
            <Text style={styles.memoryTitle}>
              {memory.type === 'JOURNAL_REWARD' 
                ? 'JOURNAL REWARD' 
                : memory.type === 'STORY_PROGRESS'
                ? memory.title
                : memory.title}
            </Text>
            <View style={styles.memoryContent}>
              {renderMemoryContent(memory)}
            </View>
          </View>
        ))
      )}
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
  storyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyProgressInfo: {
    flex: 1,
  },
  storyCategory: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  storyProgressText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  completedBadgeText: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#4CAF50',
  },
  storyStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  storyDates: {
    marginTop: 8,
    marginBottom: 12,
    gap: 4,
  },
  dateText: {
    fontFamily: 'System',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  passagesContainer: {
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  passageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 215, 0, 0.5)',
  },
  passageContent: {
    fontFamily: 'BeyondWonderland',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  passageLoading: {
    padding: 16,
    alignItems: 'center',
  },
})

