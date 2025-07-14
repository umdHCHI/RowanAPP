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
  type: string;
  passages: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
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