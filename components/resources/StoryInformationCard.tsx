import React from 'react'
import { View, StyleSheet, Text, Platform } from 'react-native'
import type { StoryResponse } from '@/api/types'

interface StoryInformationCardProps {
  story: StoryResponse
}

/**
 * Story Information Card Component
 * Displays detailed information about a story in a card format
 */
export function StoryInformationCard({ story }: StoryInformationCardProps) {
  function formatDuration(minutes: number | undefined): string {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Determine label based on category
  const isIntroduction = story.title.toLowerCase().includes('introduction')
  const label = story.category === 'main' 
    ? (isIntroduction ? 'INTRODUCTION' : `STORY ${story.id}`)
    : story.category.toUpperCase()

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

      {/* Story Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Estimated Time */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Estimated Time</Text>
          <Text style={styles.detailValue}>
            {formatDuration(story.estimated_time_minutes)}
          </Text>
        </View>

        {/* Category */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{story.category.toUpperCase()}</Text>
        </View>

        {/* Difficulty */}
        {story.difficulty && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Difficulty</Text>
            <Text style={styles.detailValue}>{story.difficulty.toUpperCase()}</Text>
          </View>
        )}

        {/* Rarity */}
        {story.rarity && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rarity</Text>
            <Text style={styles.detailValue}>{story.rarity.toUpperCase()}</Text>
          </View>
        )}

        {/* Chapters */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Chapters</Text>
          <Text style={styles.detailValue}>{story.chapter_count || story.chapters?.length || 0}</Text>
        </View>

        {/* Total Passages */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total Passages</Text>
          <Text style={styles.detailValue}>{story.total_passages || 0}</Text>
        </View>
      </View>

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

