import { useRequireAuth, useExperienceLumens } from '@/api'
import { JournalPage } from '@/components/journal'

export default function Journal() {
  useRequireAuth() 
  useExperienceLumens()
  
  return <JournalPage />
}
