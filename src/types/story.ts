import { Character } from './user';
// Story types 
export type StoryCategory = 'main' | 'side' | 'character' | 'random';
export type PassageType = 'narration' | 'dialogue' | 'action' | 'decision' | 'ending';
export type ChoiceType = 'normal' | 'skill_check' | 'item_required' | 'relationship' | 'ending';

export interface Story {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  starting_passage_id: string;
  min_level: number;
  category: StoryCategory;
  is_repeatable: boolean;
  created_at: string;
  updated_at: string;
  chapter_count?: number; // Backend field for number of chapters
  chapters?: Chapter[];
  passages?: Passage[];
  chapterId?: number; // Frontend field for specific chapter selection
  // Frontend-specific fields
  difficulty?: string;
  atmosphere?: string;
  rarity?: string;
  skillFocus?: string[];
  statBoosts?: string[];
  timeToComplete?: string;
  revelations?: number;
  exploration?: number;
  unlockLevel?: number;
  isLocked?: boolean;
  backgroundImage?: any; // Background image asset for the story card
}

export interface Chapter {
  id: number;
  story: number;
  title: string;
  content: string;
  chapter_number: number;
  is_starting_chapter: boolean;
  starting_passage_id?: string;
  variables: Record<string, any>;
  image?: string | null;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  created_at: string;
  updated_at: string;
  passages?: Passage[];
}

export interface Passage {
  id: number;
  chapter: number | null;
  passage_id: string;
  content: string;
  passage_type: PassageType;
  speaker?: NPC | null;
  speaker_name?: string;
  speaker_image?: string;
  required_conditions: Record<string, any>;
  story_effects: Record<string, any>;
  effects?: Record<string, any>; // New field for rewards in passages
  mood?: string;
  background_music?: string;
  background_image?: string | null;
  order: number;
  choices?: Choice[];
}

export interface Choice {
  id: number;
  passage: number;
  text: string;
  target_id?: string; // Primary field from backend
  target_passage_id?: string; // Legacy field from API response
  next_passage?: number | null; // From GenericForeignKey
  next_passage_id?: string;
  choice_type: ChoiceType;
  requirements: Record<string, any>;
  effects: Record<string, any>;
  success_passage_id?: string;
  failure_passage_id?: string;
  required_conditions: Record<string, any>;
  order: number;
}

export interface NPC {
  id: number;
  name: string;
  description: string;
  npcavatar?: string | null;
  personality_traits: Record<string, number>;
  created_at: string;
}

export interface StoryProgress {
  id: number;
  user: number;
  story: number;
  current_passage_id: string;
  passages_visited: string[];
  passages_visited_count?: number;//I dont have this in the backend
  choices_made: {
    choice_id: number;
    choice_text: string;
    timestamp: string;
  }[];
  choices_made_count?: number;
  story_variables: Record<string, any>;
  is_completed: boolean;
  completion_type: string;
  started_at: string;
  last_played: string;
  completed_at?: string | null;
  progress_percentage?: number;
  story_title?: string;
}


// StoryScreenProps defines the props for the StoryScreen component
export type StoryScreenProps = {
  visible: boolean;
  onClose: () => void;
  story: Story;
  chapter: Chapter;
  passage: Passage;
  choices: Choice[];
  npc?: NPC;
  onStatGain: (gains: Record<string, number>) => void;
  onArtifactUnlock: (artifact: string) => void;
  onSkillLearned: (skills: string[]) => void;
  onStoryComplete: (completionData: {
    storyId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: Record<string, number>;
  }) => void;
};


// saved rewards type
export interface SavedRewards {
  characterStats?: Character[];
  level?: number;
  totalExperience?: number;
  experienceNeeded?: number;
  experienceProgress?: number;
  wellnessAverage?: number;
  equippedToolsCount?: number;
  wellnessStats?: Record<string, number>;
  characterGear?: any[]; // or a more specific Gear[] type if you have it
  storyProgress?: StoryProgress[];
  totalStoriesStarted?: number;
  storiesCompleted?: number;
  characterCopingTools?: any[]; // or a more specific CopingTool[] type if you have it
}

// Archive progress and related types
export interface ArchiveProgress {
  completedStories: string[];
  codexEntries: Array<{
    id: string;
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
    timestamp: number;
  }>;
  miniGameProgress: {
    thoughtDefenderLevel: number;
    thoughtDefenderScore: number;
    thoughtDefenderWins: number;
    drawingEntries: number;
    totalGameTime: number;
  };
  discoveredArtifacts: Array<{
    name: string;
    type: string;
    equipped: boolean;
    lumens: number;
    description: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  }>;
  finalRewardsArtifacts: Array<{
    name: string;
    type: string;
    equipped: boolean;
    lumens: number;
    description: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  }>;
  learnedSkills: string[];
  foundationValues: {
    'Sight Beyond Sight': number;
    'Unbreakable Will': number;
    "Heart's Compass": number;
    'Elemental Harmony': number;
  };
}

export interface CodexEntry {
  type: string;
  passages: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
}

export interface MiniGameResult {
  gameType: 'thoughtDefender' | 'drawing';
  score?: number;
  level?: number;
  won?: boolean;
  gameTime?: number;
  data?: any;
}

// Frontend-specific types for archive service
export interface LocalStoryProgress {
  storyId: string;
  exploration: number;
  completed: boolean;
  lastPlayedAt?: string;
  choices: Array<{
    passageId: string;
    choiceIndex: number;
    timestamp: number;
  }>;
}

export interface ChapterSummary {
  id: number;
  title: string;
  chapterNumber: number;
  isStartingChapter: boolean;
}

export interface ChapterPassage {
  id: number;
  passage_id: string;
  passage_type: string;
  mood?: string;
  backgroundImage?: string;
  order: number;
  passages?: string;
}

export interface StoryDetail {
  story: Story;
  passage: Passage;
  progress: {
    passagesVisited: number;
    isCompleted: boolean;
    progressPercentage: number;
  };
}

// New API response structure
export interface PassageApiResponse {
  story: {
    id: number;
    title: string;
  };
  chapter_title: string;
  passage: {
    passage_id: string;
    content: string;
    passage_type: string;
    choices: Array<{
      text: string;
      target_passage_id: string;
    }>;
  };
  progress: {
    passages_visited: string[];
    is_completed: boolean;
    progress_percentage: number;
  };
}

export interface PassagesTabProps {
  homeStyles: any;
  storyStyles: any;
  isLoadingStories: boolean;
  stories: any[];
  archive: any;
  handleOpenStory: (story: Story) => void;
}