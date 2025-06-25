import { apiService } from './apiService';

// Types for archive data
export interface ArchiveProgress {
  completedStories: string[];
  codexEntries: Array<{
    id: string;
    type: string;
    content: string;
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
    resonance: number;
    description: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  }>;
  finalRewardsArtifacts: Array<{
    name: string;
    type: string;
    equipped: boolean;
    resonance: number;
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

export interface StoryProgress {
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

export interface CodexEntry {
  type: string;
  content: string;
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

class ArchiveService {
  // Get user's archive progress
  async getArchiveProgress(characterId: string): Promise<ArchiveProgress> {
    try {
      return await apiService.get<any>('characters', { 
        urlSuffix: `${characterId}/archive_progress/` 
      });
    } catch (error) {
      console.error('Failed to get archive progress:', error);
      // Return default progress if API fails
      return {
        completedStories: [],
        codexEntries: [],
        miniGameProgress: {
          thoughtDefenderLevel: 0,
          thoughtDefenderScore: 0,
          thoughtDefenderWins: 0,
          drawingEntries: 0,
          totalGameTime: 0
        },
        discoveredArtifacts: [],
        finalRewardsArtifacts: [],
        learnedSkills: [],
        foundationValues: {
          'Sight Beyond Sight': 2,
          'Unbreakable Will': 2,
          "Heart's Compass": 2,
          'Elemental Harmony': 2
        }
      };
    }
  }

  // Save archive progress
  async saveArchiveProgress(characterId: string, progress: Partial<ArchiveProgress>): Promise<void> {
    try {
      await apiService.patch('characters', progress, { 
        urlSuffix: `${characterId}/archive_progress/` 
      });
    } catch (error) {
      console.error('Failed to save archive progress:', error);
      throw error;
    }
  }

  // Get story progress
  async getStoryProgress(characterId: string, storyId: string): Promise<StoryProgress> {
    try {
      return await apiService.get<StoryProgress>('characters', { 
        urlSuffix: `${characterId}/story_progress/${storyId}/` 
      });
    } catch (error) {
      console.error('Failed to get story progress:', error);
      return {
        storyId,
        exploration: 0,
        completed: false,
        choices: []
      };
    }
  }

  // Update story progress
  async updateStoryProgress(characterId: string, storyId: string, progress: Partial<StoryProgress>): Promise<void> {
    try {
      await apiService.patch('characters', progress, { 
        urlSuffix: `${characterId}/story_progress/${storyId}/` 
      });
    } catch (error) {
      console.error('Failed to update story progress:', error);
      throw error;
    }
  }

  // Complete a story
  async completeStory(characterId: string, storyId: string, completionData: {
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }): Promise<void> {
    try {
      await apiService.post('characters', {
        story_id: storyId,
        ...completionData
      }, { 
        urlSuffix: `${characterId}/complete_story/` 
      });
    } catch (error) {
      console.error('Failed to complete story:', error);
      throw error;
    }
  }

  // Add codex entry
  async addCodexEntry(characterId: string, entry: CodexEntry): Promise<void> {
    try {
      await apiService.post('characters', entry, { 
        urlSuffix: `${characterId}/codex_entries/` 
      });
    } catch (error) {
      console.error('Failed to add codex entry:', error);
      throw error;
    }
  }

  // Get codex entries
  async getCodexEntries(characterId: string): Promise<CodexEntry[]> {
    try {
      return await apiService.get<CodexEntry[]>('characters', { 
        urlSuffix: `${characterId}/codex_entries/` 
      });
    } catch (error) {
      console.error('Failed to get codex entries:', error);
      return [];
    }
  }

  // Record mini-game result
  async recordMiniGameResult(characterId: string, result: MiniGameResult): Promise<void> {
    try {
      await apiService.post('characters', result, { 
        urlSuffix: `${characterId}/mini_game_results/` 
      });
    } catch (error) {
      console.error('Failed to record mini-game result:', error);
      throw error;
    }
  }

  // Unlock artifact
  async unlockArtifact(characterId: string, artifactName: string): Promise<void> {
    try {
      await apiService.post('characters', { artifact_name: artifactName }, { 
        urlSuffix: `${characterId}/unlock_artifact/` 
      });
    } catch (error) {
      console.error('Failed to unlock artifact:', error);
      throw error;
    }
  }

  // Get available stories (for now, return from local data)
  async getAvailableStories(): Promise<any[]> {
    try {
      // In the future, this will come from the backend
      // return await apiService.get<any[]>('stories');
      
      // For now, return from local data
      const { availableGrimoires } = await import('../data/storyData');
      return availableGrimoires;
    } catch (error) {
      console.error('Failed to get available stories:', error);
      return [];
    }
  }

  // Get story content
  async getStoryContent(storyId: string): Promise<any> {
    try {
      // In the future, this will come from the backend
      // return await apiService.get<any>(`stories/${storyId}/content`);
      
      // For now, return from local data
      const { storyContent } = await import('../data/storyData');
      return (storyContent as Record<string, any>)[storyId] || null;
    } catch (error) {
      console.error('Failed to get story content:', error);
      return null;
    }
  }

  // Get artifact database
  async getArtifactDatabase(): Promise<any> {
    try {
      // In the future, this will come from the backend
      // return await apiService.get<any>('artifacts');
      
      // For now, return from local data
      const { artifactDatabase } = await import('../data/storyData');
      return artifactDatabase;
    } catch (error) {
      console.error('Failed to get artifact database:', error);
      return {};
    }
  }

  // Sync local progress with backend
  async syncProgress(characterId: string, localProgress: ArchiveProgress): Promise<void> {
    try {
      await this.saveArchiveProgress(characterId, localProgress);
    } catch (error) {
      console.error('Failed to sync progress:', error);
      // Could implement retry logic here
    }
  }
}

export const archiveService = new ArchiveService(); 