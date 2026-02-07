import React, { useMemo } from 'react'
import { View, StyleSheet, Text, Platform, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import type { JournalEntryResponse } from '@/api/types'

interface JournalStatsCardProps {
  entries: JournalEntryResponse[]
}

/**
 * Journal Stats Card Component
 * Displays journal statistics: total entries and most common entry type
 */
export function JournalStatsCard({ entries }: JournalStatsCardProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()

  function handleViewJournalEntries() {
    playPageFlipSound()
    router.push('/journal?from=resources')
  }

  // Calculate most common entry type
  const mostCommonEntryType = useMemo(() => {
    if (!entries || entries.length === 0) return null

    const typeCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      const entryType = entry.entry_type || 'unknown'
      typeCounts[entryType] = (typeCounts[entryType] || 0) + 1
    })

    // Find the entry type with the highest count
    let maxCount = 0
    let mostCommon: string | null = null

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostCommon = type
      }
    })

    return mostCommon
  }, [entries])

  // Format entry type for display
  const formatEntryType = (type: string | null): string => {
    if (!type) return 'N/A'
    
    switch (String(type ?? '').toLowerCase()) {
      case 'journal':
        return 'Journal'
      case 'draw':
        return 'Drawing'
      case 'voicememo':
      case 'voice':
        return 'Voice Memo'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const totalEntries = entries?.length || 0

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>JOURNAL STATISTICS</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.detailsGrid}>
        {/* Total Entries */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total Entries</Text>
          <Text style={styles.detailValue}>
            {totalEntries}
          </Text>
        </View>

        {/* Most Common Type */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Most Used Type</Text>
          <Text style={styles.detailValue}>
            {formatEntryType(mostCommonEntryType)}
          </Text>
        </View>
      </View>

      {/* View Journal Entries Button */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={handleViewJournalEntries}
        activeOpacity={0.8}
      >
        <View style={styles.infoButtonContent}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color="#ffffff" />
          <Text style={styles.infoButtonText}>VIEW JOURNAL ENTRIES</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" />
        </View>
      </TouchableOpacity>
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  infoButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    marginTop: 20,
  },
  infoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  infoButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
})

