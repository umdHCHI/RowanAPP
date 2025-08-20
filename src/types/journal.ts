export type JournalPrompt = {
  id: number;
  prompt_id: string;
  text: string;
  category: 'journal' | 'draw' | 'voice';
  skill_category: 'Self-Compassion' | 'Social Connection' | 'Stress Management' | 'Emotional Awareness' | 'Personal Growth';
  map_area: 'entrance' | 'garden' | 'library' | 'sanctuary' | 'archive' | 'summit';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Alias for backward compatibility
export type Prompt = JournalPrompt;

export interface WellnessStats {
    icon: string;
    label: string;
    value: number;
    color: string;
}

export type JournalEntry = {
  prompt_id: string;
};

export interface CodexEntry {
  id: number;
  prompt: number;
  prompt_id: string;
  prompt_text: string;
  entry_type: 'journal' | 'draw' | 'voice';
  content: string;
  content_preview: string;
  skill_category: string;
  difficulty: string;
  word_count: number;
  duration_seconds: number | null;
  username: string;
  created_at: string;
  updated_at: string;
  
  // Legacy properties for backward compatibility
  type?: string;
  passages?: string;
  skillCategory?: string;
  mapArea?: string;
}

// Enhanced interface for creating codex entries with validation
export interface CodexEntryData {
  prompt: number;                    // prompt_id (required)
  entry_type: 'journal' | 'draw' | 'voice';  // entry type (required)
  content: string;                   // entry content (required)
  duration_seconds?: number;         // for voice entries (optional)
  voice_file?: File;                 // for voice file uploads (optional)
  drawing_data?: string;             // for drawing entries (optional)
  character_id?: number;             // for character association (optional)
}

// Error response types for specific journal endpoints
export interface JournalApiError {
  error: string;
  code: 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'DUPLICATE_ENTRY';
  message: string;
  details?: any;
}

// Daily prompt response interface
export interface DailyPromptResponse {
  prompt: JournalPrompt | null;
  status: 'assigned' | 'completed' | 'unavailable' | 'newly_assigned';
  message?: string;
}

// Codex statistics interface
export interface CodexStatistics {
  total_entries: number;
  entries_by_type: {
    journal: number;
    draw: number;
    voice: number;
  };
  total_prompts_completed: number;
  streak_days: number;
  last_entry_date: string | null;
}

export type CodexModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: {
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => void;
  unlockedAreas?: string[]; // Made optional since we're not using it anymore
  selectedType?: 'journal' | 'draw' | 'voice';
};