import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useGameMyData } from '@/api'
import { useStoryPassage } from '@/api/hooks/use-story'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { GameDataResponse, VantageData } from '@/api'
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

/** Coerce title/description to display string; API or store may return i18n objects. */
function toDisplayString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    const o = value as Record<string, unknown>
    if (typeof o.en === 'string') return o.en
    const first = Object.values(o).find((v) => typeof v === 'string')
    if (typeof first === 'string') return first
  }
  return ''
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function getVantageStats(gameData: GameDataResponse | null | undefined): VantageData | null {
  if (!gameData) return null
  const nested = gameData.vantage_data
  if (nested) return nested
  return {
    score: toNumber(gameData.score),
    times_played: toNumber(gameData.vantage_times_played),
    lumens_gathered: toNumber(gameData.vantage_lumens_gathered),
    wins: toNumber(gameData.vantage_wins),
    losses: toNumber(gameData.vantage_losses),
    thoughts_reframed: toNumber(gameData.vantage_thoughts_reframed),
    thoughts_defeated: toNumber(gameData.vantage_thoughts_defeated),
  }
}

export function ResourcesMemoriesTab({ memories, storyId }: ResourcesMemoriesTabProps) {
  const router = useRouter()
  const { data: gameData, isLoading: isLoadingGameData } = useGameMyData()
  const vantageStats = React.useMemo(() => getVantageStats(gameData), [gameData])
  const visibleMemories = React.useMemo(() => {
    const filtered = memories.filter((memory) => {
      if (memory.type === 'THOUGHT_DEFENDER') return false
      if (memory.type === 'JOURNAL_REWARD') return false
      if (memory.type === 'REFLECTION') return false
      if (memory.type === 'JOURNAL_ENTRY') {
        return !!(memory.completedAt || memory.createdAt)
      }
      if (memory.type !== 'STORY_PROGRESS') return true
      return memory.storyId === storyId
    })

    if (!storyId) return filtered
    return filtered.filter((memory) => {
      if (memory.type !== 'STORY_PROGRESS') return true
      return memory.storyId === storyId
    })
  }, [memories, storyId])

  function getJournalEntryDisplayText(memory: MemoryItem): string {
    const category = toDisplayString(memory.category)
    if (memory.modality === 'draw') {
      return category ? `Drawing Entry Uploaded: ${category}` : 'Drawing Entry Uploaded'
    }
    if (memory.modality === 'voice') {
      return category ? `Voice Memo Added: ${category}` : 'Voice Memo Added'
    }
    const desc = toDisplayString(memory.description)
    if (desc) return desc
    const content = toDisplayString(memory.content)
    return content || 'Journal entry submitted'
  }

  function getJournalCompletedAt(memory: MemoryItem): string | undefined {
    return memory.completedAt || memory.createdAt
  }

  function renderMemoryContent(memory: MemoryItem) {
    if (memory.type === 'STORY_PROGRESS') {
      const progress = memory.progressPercentage || 0
      const isCompleted = memory.isCompleted || false

      return (
        <View>
          <View style={styles.storyProgressHeader}>
            <View style={styles.storyProgressInfo}>
              <Text variant="label" style={styles.storyCategory}>
                {(toDisplayString(memory.storyCategory) || 'STORY').toUpperCase()}
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

          {toDisplayString(memory.description) ? (
            <Text variant="title" size={2} style={styles.memoryDescription}>
              {toDisplayString(memory.description)}
            </Text>
          ) : null}

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


        </View>
      )
    }

    if (memory.type === 'JOURNAL_ENTRY') {
      const displayText = getJournalEntryDisplayText(memory)
      const completedAt = getJournalCompletedAt(memory)
      const promptTitle = toDisplayString(memory.title)

      return (
        <View>
          <View style={styles.storyProgressHeader}>
            <View style={styles.storyProgressInfo}>
              <Text variant="label" style={styles.storyCategory}>
                JOURNAL ENTRY
              </Text>
              <Text variant="body" size={1} style={styles.storyProgressText}>
                Completed
              </Text>
            </View>
            <View style={styles.completedBadge}>
              <MaterialDesignIcons name="check-circle" size={16} color="#4CAF50" />
              <Text variant="label" style={styles.completedBadgeText}>
                COMPLETE
              </Text>
            </View>
          </View>

          {promptTitle ? (
            <Text variant="body" size={2} style={styles.memoryDescription}>
              {promptTitle}
            </Text>
          ) : null}

          <View style={styles.journalEntryDivider} />

          <Text variant="tagline" size={2} style={styles.memoryDescription}>
            {displayText}
          </Text>

          <View style={styles.journalMetaRow}>
            {completedAt && (
              <Text variant="label" style={styles.dateText}>
                Completed: {formatDate(completedAt)}
              </Text>
            )}
          </View>
        </View>
      )
    }

    if (memory.type !== 'REFLECTION') {
      const desc = toDisplayString(memory.description)
      return desc ? (
        <Text variant="title" size={2} style={styles.memoryDescription}>
          {desc}
        </Text>
      ) : null
    }

    if (memory.modality === 'draw') {
      return (
        <View>
          <Text variant="body" size={2} style={styles.memoryDescription}>
            You completed a journal drawing as part of your reflection practice.
          </Text>
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.push('/journal?from=resources')}
          >
            <MaterialDesignIcons name="brush" size={16} color="#FFD700" style={styles.buttonIconLeft} />
            <Text variant="label" style={styles.memoryButtonText}>
              Open Journal
            </Text>
          </Button>
        </View>
      )
    }

    if (memory.modality === 'voice') {
      return (
        <View>
          <Text variant="body" size={2} style={styles.memoryDescription}>
            You recorded a voice reflection as part of your journal practice.
          </Text>
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.push('/journal?from=resources')}
          >
            <MaterialDesignIcons name="microphone" size={16} color="#FFD700" style={styles.buttonIconLeft} />
            <Text variant="label" style={styles.memoryButtonText}>
              Open Journal
            </Text>
          </Button>
        </View>
      )
    }

    const reflectionDesc = toDisplayString(memory.description)
    if (reflectionDesc) {
      return (
        <Button variant="secondary" size="small" onPress={() => {}}>
          <Text variant="label" style={styles.memoryButtonText}>
            {reflectionDesc}
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
                : memory.type === 'JOURNAL_ENTRY'
                  ? 'JOURNAL ENTRY'
                  : toDisplayString(memory.title) || (memory.type === 'STORY_PROGRESS' ? 'STORY' : 'REFLECTION')}
            </Text>
            <View style={styles.memoryContent}>{renderMemoryContent(memory)}</View>
          </Card>
        ))
      )}
      <Card variant="default" padding={20} fullWidth>
        <Text variant="label" style={styles.memoryTitle}>
          VANTAGE OVERVIEW
        </Text>
        {isLoadingGameData ? (
          <View style={styles.vantageLoading}>
            <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.6)" />
          </View>
        ) : gameData ? (
          <View>
            <View style={styles.vantageStatsGrid}>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  TOP SCORE
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.score)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Times Played
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.times_played)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Wins
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.wins)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Losses
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.losses)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Thoughts Defeated
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.thoughts_defeated)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Thoughts Reframed
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.thoughts_reframed)}
                </Text>
              </View>
              <View style={styles.vantageStatItem}>
                <Text variant="label" style={styles.vantageStatLabel}>
                  Lumens Gathered
                </Text>
                <Text variant="body" size={1} style={styles.vantageStatValue}>
                  {toNumber(vantageStats?.lumens_gathered)}
                </Text>
              </View>
            </View>
            {gameData.last_played && (
              <Text variant="label" style={styles.dateText}>
                Last played: {formatDate(gameData.last_played)}
              </Text>
            )}
          </View>
        ) : (
          <Text variant="body" size={1} style={styles.vantageEmptyText}>
            No Vantage sessions yet
          </Text>
        )}
      </Card>
    </View>
  )
}
