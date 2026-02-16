import { useMemo } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { JournalStatsCardProps } from '@/types/resources/resources'
import { journalStatsCardStyles as styles } from '@/styles/resources/resources-styles'

export function JournalStatsCard({ entries }: JournalStatsCardProps) {
  const router = useRouter()
  function handleViewJournalEntries() {
    router.push('/journal?from=resources')
  }

  const mostCommonEntryType = useMemo(() => {
    if (!entries || entries.length === 0) return null

    const typeCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      const entryType =
        (entry as { category?: string }).category ||
        entry.entry_type ||
        entry.skill_category ||
        'unknown'
      typeCounts[entryType] = (typeCounts[entryType] || 0) + 1
    })

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

  function formatEntryType(type: string | null): string {
    if (!type) return 'N/A'

    switch (String(type ?? '').toLowerCase()) {
      case 'journal':
        return 'Journal'
      case 'draw':
      case 'drawing':
        return 'Drawing'
      case 'voicememo':
      case 'voice_memo':
      case 'voice':
        return 'Voice Memo'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const totalEntries = entries?.length || 0

  return (
    <Card variant="default" padding={24} fullWidth>
      <View style={styles.header}>
        <Text variant="label" style={styles.label}>
          JOURNAL STATISTICS
        </Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text variant="label" style={styles.detailLabel}>
            Total Entries
          </Text>
          <Text variant="body" size={1} style={styles.detailValue}>
            {totalEntries}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text variant="label" style={styles.detailLabel}>
            Most Used Type
          </Text>
          <Text variant="body" size={1} style={styles.detailValue}>
            {formatEntryType(mostCommonEntryType)} 
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button fullWidth variant="secondary" onPress={handleViewJournalEntries}>
          <View style={styles.infoButtonContent}>
            <MaterialDesignIcons name="book-open-variant" size={14} color="#ffffff" />
            <Text variant="titleWhite" size={3} style={styles.infoButtonText}>
              NAVIGATE TO JOURNAL
            </Text>
            <MaterialDesignIcons name="chevron-right" size={14} color="#ffffff" />
          </View>
        </Button>
      </View>
    </Card>
  )
}
