
import { JournalHeaderProps } from '@/types/journal/journal'
import { Text } from '@/components/ui'


export function JournalHeader({ characterName }: JournalHeaderProps) {
  return (
    <>
      <Text variant="title" size={3} align="center">
        Your Journal
      </Text>
      <Text variant="label" size={2} align="center">
        Welcome back, {characterName || 'Scholar'}
      </Text>
    </>
  )
}

