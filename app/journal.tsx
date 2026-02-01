import { useRequireAuth, useExperienceLumens } from '@/api'
import { JournalPage } from '@/components/journal'

export default function Journal() {
  useRequireAuth() // Redirects to login if not authenticated
  useExperienceLumens()
  
  return <JournalPage />
}
