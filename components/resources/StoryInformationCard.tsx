import React, { useMemo } from 'react'
import { View, StyleSheet, Text, Platform } from 'react-native'
import type { StoryResponse, UserFullProfileResponse } from '@/api/types'

interface StoryInformationCardProps {
  story: StoryResponse
  progress?: UserFullProfileResponse['story_progress'][0]
}

/**
 * Story Information Card Component
 * Displays detailed information about a story in a card format
 */
export function StoryInformationCard({ story, progress }: StoryInformationCardProps) {
  // Determine label based on category
  const isIntroduction = story.title.toLowerCase().includes('introduction')
  const label = story.category === 'main' 
    ? (isIntroduction ? 'INTRODUCTION' : `STORY ${story.id}`)
    : story.category.toUpperCase()

  // Calculate NPC interactions from choices (count choices that involve NPCs like The Curator)
  const npcInteractions = useMemo(() => {
    if (!progress?.choices_made) return 0
    // Count choices that involve NPC interactions (e.g., curator, dialogue choices)
    return progress.choices_made.filter(choice => {
      const choiceId = choice.choice_id.toLowerCase()
      const choiceText = choice.choice_text.toLowerCase()
      // Check for NPC-related choice IDs or text
      return choiceId.includes('curator') || 
             choiceId.includes('npc') || 
             choiceText.includes('curator') ||
             choiceText.includes('talk to') ||
             choiceText.includes('speak with')
    }).length
  }, [progress?.choices_made])

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{story.title}</Text>

      {/* Description */}
      {story.description && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{story.description}</Text>
        </View>
      )}

      {/* Progress Stats Grid */}
      {progress && (
        <View style={styles.detailsGrid}>
          {/* Total Story Passages */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Story Passages</Text>
            <Text style={styles.detailValue}>
              {story.total_passages || 0}
            </Text>
          </View>

          {/* NPC Interactions */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>NPC Interactions</Text>
            <Text style={styles.detailValue}>
              {npcInteractions}
            </Text>
          </View>

          {/* Decisions Made */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Decisions Made</Text>
            <Text style={styles.detailValue}>
              {progress.choices_made?.length || 0}
            </Text>
          </View>
        </View>
      )}

      {/* Atmosphere */}
      {story.atmosphere && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Atmosphere</Text>
          <Text style={styles.sectionText}>{story.atmosphere}</Text>
        </View>
      )}

      {/* Revelations Preview */}
      {story.revelations && story.revelations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content Warnings</Text>
          <View style={styles.revelationsContainer}>
            {story.revelations.slice(0, 3).map((revelation, index) => (
              <View key={index} style={styles.revelationItem}>
                <Text style={styles.revelationText}>• {revelation}</Text>
              </View>
            ))}
            {story.revelations.length > 3 && (
              <Text style={styles.moreText}>+{story.revelations.length - 3} more</Text>
            )}
          </View>
        </View>
      )}

      {/* Repeatable Badge */}
      {story.is_repeatable && (
        <View style={styles.repeatableBadge}>
          <Text style={styles.repeatableText}>✓ REPEATABLE</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 38,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionText: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  revelationsContainer: {
    gap: 6,
  },
  revelationItem: {
    paddingLeft: 4,
  },
  revelationText: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  moreText: {
    fontFamily: 'System',
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  repeatableBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    marginTop: 4,
  },
  repeatableText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: 'rgba(76, 175, 80, 1)',
  },
})

