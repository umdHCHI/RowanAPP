import { useState } from 'react';
import { apiService } from '../../../services/apiService';

interface JournalStats {
  total_entries: number;
  entries_by_type: { journal: number; draw: number; voice: number };
  total_prompts_completed: number;
  streak_days: number;
  last_entry_date: string | null;
}

export const useJournalStats = () => {
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null);
  const [isLoadingJournalStats, setIsLoadingJournalStats] = useState(false);

  const loadJournalStats = async () => {
    try {
      setIsLoadingJournalStats(true);

      let entries = await apiService.getMyCodexEntries();

      if (!entries || (Array.isArray(entries) && entries.length === 0)) {
        entries = await apiService.getAllCodexEntries();
      }

      const entriesByType = {
        journal: 0,
        draw: 0,
        voice: 0
      };

      let totalEntries = 0;

      if (Array.isArray(entries)) {
        entries.forEach((entry: any) => {
          totalEntries++;
          if (entry.entry_type === 'journal') {
            entriesByType.journal++;
          } else if (entry.entry_type === 'draw') {
            entriesByType.draw++;
          } else if (entry.entry_type === 'voice') {
            entriesByType.voice++;
          }
        });
      } else {
        if (entries && typeof entries === 'object') {
          const entriesArray = (entries as any).entries || (entries as any).data || entries;
          if (Array.isArray(entriesArray)) {
            entriesArray.forEach((entry: any) => {
              totalEntries++;
              if (entry.entry_type === 'journal') {
                entriesByType.journal++;
              } else if (entry.entry_type === 'draw') {
                entriesByType.draw++;
              } else if (entry.entry_type === 'voice') {
                entriesByType.voice++;
              }
            });
          }
        }
      }

      const streakDays = 0;

      const stats = {
        total_entries: totalEntries,
        entries_by_type: entriesByType,
        total_prompts_completed: totalEntries,
        streak_days: streakDays,
        last_entry_date: entries && entries.length > 0 ? entries[0].created_at : null
      };

      setJournalStats(stats);

    } catch (error) {
      setJournalStats(null);
    } finally {
      setIsLoadingJournalStats(false);
    }
  };

  return {
    journalStats,
    isLoadingJournalStats,
    loadJournalStats,
    setJournalStats
  };
};