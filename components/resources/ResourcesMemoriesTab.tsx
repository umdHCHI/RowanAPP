import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useStoryPassage } from '@/api/hooks/use-story'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ResourcesMemoriesTabProps, StoryPassageDisplayProps } from '@/types/resources/resources'
import type { MemoryItem } from '@/types/hooks'
import { resourcesMemoriesTabStyles as styles } from '@/styles/resources/resources-styles'

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

  const maxLength = 200
  const content =
    passage.content.length > maxLength
      ? passage.content.substring(0, maxLength) + '...'
      : passage.content

  return (
    <View style={styles.passageContainer}>
      <Text variant="serif" size={2} style={styles.passageContent}>
        {content}
      </Text>
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
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function ResourcesMemoriesTab({ memories, storyId }: ResourcesMemoriesTabProps) {
  const router = useRouter()
  const visibleMemories = React.useMemo(() => {
    if (!storyId) return memories
    return memories.filter((memory) => {
      if (memory.type !== 'STORY_PROGRESS') return true
      return memory.storyId === storyId
    })
  }, [memories, storyId])

  function renderMemoryContent(memory: MemoryItem) {
    if (memory.type === 'STORY_PROGRESS') {
      const progress = memory.progressPercentage || 0
      const isCompleted = memory.isCompleted || false

      return (
        <View>
          <View style={styles.storyProgressHeader}>
            <View style={styles.storyProgressInfo}>
              <Text variant="label" style={styles.storyCategory}>
                {memory.storyCategory?.toUpperCase() || 'STORY'}
              </Text>
              <Text variant="body" size={1} style={styles.storyProgressText}>
                {isCompleted ? 'Completed' : `${Math.round(progress)}% Complete`}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <MaterialDesignIcons name="check-circle" size={16} color="#4CAF50" />
                <Text variant="label" style={styles.completedBadgeText}>
                  COMPLETE
                </Text>
              </View>
            )}
          </View>

          {memory.description && (
            <Text variant="title" size={2} style={styles.memoryDescription}>
              {memory.description}
            </Text>
          )}

          {memory.storyId &&
            memory.passageIds &&
            memory.passageIds.length > 0 &&
            (!storyId || memory.storyId === storyId) && (
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
              <MaterialDesignIcons name="book-open-page-variant" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text variant="body" size={1} style={styles.statText}>
                {memory.passagesVisitedCount || 0} Passages
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialDesignIcons name="gesture-tap" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text variant="body" size={1} style={styles.statText}>
                {memory.choicesMadeCount || 0} Choices
              </Text>
            </View>
          </View>

          <View style={styles.storyDates}>
            {memory.startedAt && (
              <Text variant="label" style={styles.dateText}>
                Started: {formatDate(memory.startedAt)}
              </Text>
            )}
            {memory.lastPlayed && !isCompleted && (
              <Text variant="label" style={styles.dateText}>
                Last played: {formatDate(memory.lastPlayed)}
              </Text>
            )}
            {memory.completedAt && isCompleted && (
              <Text variant="label" style={styles.dateText}>
                Completed: {formatDate(memory.completedAt)}
              </Text>
            )}
          </View>

          {memory.storyId && (
            <Button
              variant="secondary"
              size="small"
              onPress={() => router.push(`/story-overview?storyId=${memory.storyId}`)}
            >
              <MaterialDesignIcons name="book-open-variant" size={16} color="#FFD700" style={styles.buttonIconLeft} />
              <Text variant="label" style={styles.memoryButtonText}>
                {isCompleted ? 'View Story' : 'Continue Story'}
              </Text>
            </Button>
          )}
        </View>
      )
    }

    if (memory.type === 'JOURNAL_REWARD') {
      let journalEntryId: string | null = null
      try {
        if (memory.content) {
          const parsed = JSON.parse(memory.content)
          journalEntryId = parsed.journalEntryId || null
        }
      } catch {
        // ignore
      }

      return (
        <View>
          {memory.description && (
            <Text variant="title" size={2} style={styles.memoryDescription}>
              {memory.description}
            </Text>
          )}
          <Button
            variant="secondary"
            size="small"
            onPress={() => {
              const url = journalEntryId
                ? `/journal?promptId=${journalEntryId}&from=resources`
                : '/journal?from=resources'
              router.push(url)
            }}
          >
            <MaterialDesignIcons name="book-open-variant" size={16} color="#FFD700" style={styles.buttonIconLeft} />
            <Text variant="label" style={styles.memoryButtonText}>
              Open Journal
            </Text>
          </Button>
        </View>
      )
    }

    if (memory.type !== 'REFLECTION') {
      return (
        <Text variant="title" size={2} style={styles.memoryDescription}>
          {memory.description}
        </Text>
      )
    }

    if (memory.modality === 'draw') {
      return (
        <Button variant="secondary" size="small" onPress={() => {}}>
          <MaterialDesignIcons name="brush" size={16} color="#FFD700" style={styles.buttonIconLeft} />
          <Text variant="label" style={styles.memoryButtonText}>
            Drawing saved
          </Text>
        </Button>
      )
    }

    if (memory.modality === 'voice') {
      return (
        <Button variant="secondary" size="small" onPress={() => {}}>
          <MaterialDesignIcons name="microphone" size={16} color="#FFD700" style={styles.buttonIconLeft} />
          <Text variant="label" style={styles.memoryButtonText}>
            Voice memo saved
          </Text>
        </Button>
      )
    }

    if (memory.description) {
      return (
        <Button variant="secondary" size="small" onPress={() => {}}>
          <Text variant="label" style={styles.memoryButtonText}>
            {memory.description}
          </Text>
        </Button>
      )
    }

    return (
      <Button variant="secondary" size="small" onPress={() => {}}>
        <Text variant="label" style={styles.memoryButtonText}>
          Reflection saved
        </Text>
      </Button>
    )
  }

  return (
    <View style={styles.memoriesContainer}>
      {visibleMemories.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialDesignIcons name="book-open-variant-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
          <Text variant="body" size={2} style={styles.emptyStateText}>
            No memories yet
          </Text>
          <Text variant="body" size={1} style={styles.emptyStateSubtext}>
            Start exploring stories to create memories
          </Text>
        </View>
      ) : (
        visibleMemories.map((memory) => (
          <Card key={`memory-${memory.id}`} variant="default" padding={20} fullWidth>
            <Text variant="label" style={styles.memoryTitle}>
              {memory.type === 'JOURNAL_REWARD'
                ? 'JOURNAL REWARD'
                : memory.type === 'STORY_PROGRESS'
                  ? memory.title
                  : memory.title}
            </Text>
            <View style={styles.memoryContent}>{renderMemoryContent(memory)}</View>
          </Card>
        ))
      )}
    </View>
  )
}
