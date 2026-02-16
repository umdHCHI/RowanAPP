import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import type { StoryInformationCardProps } from '@/types/resources/resources'
import { storyInformationCardStyles as styles } from '@/styles/resources/resources-styles'

function normalizeStoryThemes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const trimmed = value.trim()
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      }
    } catch {
      return trimmed
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
  }

  return []
}

export function StoryInformationCard({
  story,
  progress,
  npcInteractions: npcInteractionsOverride,
  npcName,
}: StoryInformationCardProps) {
  const titleLower = String(story.title ?? '').toLowerCase()
  const isIntroduction = titleLower.includes('introduction')
  const label = isIntroduction ? 'INTRODUCTION' : `STORY ${story.id}`

  const npcInteractionsFromProgress = useMemo(() => {
    const choices = progress?.choices_made ?? []
    if (!choices.length) return 0
    return choices.filter((choice) => {
      const choiceId = String(choice.choice_id ?? '').toLowerCase()
      const choiceText = String(choice.choice_text ?? '').toLowerCase()
      return (
        choiceId.includes('curator') ||
        choiceId.includes('npc') ||
        choiceText.includes('curator') ||
        choiceText.includes('talk to') ||
        choiceText.includes('speak with')
      )
    }).length
  }, [progress?.choices_made])

  const npcInteractions =
    typeof npcInteractionsOverride === 'number'
      ? npcInteractionsOverride
      : npcInteractionsFromProgress
  const normalizedStoryThemes = normalizeStoryThemes(story.story_themes)
  const storyThemes =
    normalizedStoryThemes.length > 0
      ? normalizedStoryThemes
      : story.revelations ?? []

  return (
    <Card variant="default" padding={24} fullWidth>
      <View style={styles.header}>
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      </View>

      <Text variant="title" size={1} style={styles.title}>
        {story.title}
      </Text>

      {story.description && (
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Description
          </Text>
          <Text variant="body" size={1} style={styles.descriptionText}>
            {story.description}
          </Text>
        </View>
      )}

      {progress && (
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text variant="label" style={styles.detailLabel}>
              Total Story Passages
            </Text>
            <Text variant="body" size={1} style={styles.detailValue}>
              {story.total_passages || 0}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="label" style={styles.detailLabel}>
              NPC Interactions
            </Text>
            <Text variant="body" size={1} style={styles.detailValue}>
              {npcInteractions}
            </Text>
            {npcName && (
              <View style={styles.npcInfoRow}>
                <Text variant="body" size={1} style={styles.npcName}>
                  {npcName}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.detailItem}>
            <Text variant="label" style={styles.detailLabel}>
              Decisions Made
            </Text>
            <Text variant="body" size={1} style={styles.detailValue}>
              {progress.choices_made?.length || 0}
            </Text>
          </View>
        </View>
      )}

      {story.atmosphere && (
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Atmosphere
          </Text>
          <Text variant="body" size={1} style={styles.sectionText}>
            {story.atmosphere}
          </Text>
        </View>
      )}

      {storyThemes.length > 0 && (
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Content Warnings
          </Text>
          <View style={styles.revelationsContainer}>
            {storyThemes.slice(0, 3).map((revelation, index) => (
              <View key={index} style={styles.revelationItem}>
                <Text variant="body" size={1} style={styles.revelationText}>
                  • {revelation}
                </Text>
              </View>
            ))}
            {storyThemes.length > 3 && (
              <Text variant="body" size={1} style={styles.moreText}>
                +{storyThemes.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {story.is_repeatable && (
        <View style={styles.repeatableBadge}>
          <Text variant="label" style={styles.repeatableText}>
            ✓ REPEATABLE
          </Text>
        </View>
      )}
    </Card>
  )
}
