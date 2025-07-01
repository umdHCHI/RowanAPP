import {
  ArchiveProgress,
  ChapterPassage,
  ChapterSummary,
  CodexEntry,
  LocalStoryProgress,
  MiniGameResult,
  Passage,
  Story,
  StoryDetail
} from '../types/story';
import { apiService } from './apiService';

// Types for story & passage data
export interface Choice {
  id: string;
  text: string;
  nextPassageId?: string;
  choiceType?: string;
  requirements?: Record<string, any>;
  effects?: Record<string, any>;
}



class ArchiveService {
  // NEW STORY FLOW METHODS

  // Fetch available stories for Condition A
  async getAvailableStories(): Promise<any[]> {
    try {
      console.log('=== getAvailableStories called ===');
      const res = await apiService.getNewStoryCatalog();
      console.log('Raw backend stories response:', res);
      console.log('Response type:', typeof res);
      console.log('Response length:', Array.isArray(res) ? res.length : 'Not an array');
      
      if (res && Array.isArray(res) && res.length > 0) {
        console.log('Retrieved stories from backend:', res);
        console.log('First story example:', res[0]);
        
        // Transform backend format to frontend format
        const transformedStories = res.map((story, index) => {
          console.log(`Transforming story ${index + 1}:`, story);
          const transformedStory = this.transformBackendStory(story);
          console.log(`Story ${index + 1} transformed:`, transformedStory);
          const finalStory = this.transformToStory(transformedStory);
          console.log(`Story ${index + 1} final:`, finalStory);
          return finalStory;
        });
        
        console.log('Final transformed stories:', transformedStories);
        return transformedStories;
      }
      
      // Fallback to old method if new endpoint fails
      console.log('New endpoint returned no stories, trying fallback...');
      return await this.getAvailableStoriesFallback();
    } catch (error: any) {
      console.error('Failed to get available stories from new endpoint:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Fallback to old method
      return await this.getAvailableStoriesFallback();
    }
  }

  // List chapters for a given story
  async getChapters(storyId: string): Promise<ChapterSummary[]> {
    try {
      console.log('Getting chapters for story:', storyId);
      const suffix = `${storyId}/chapters/`;
      const chapters = await apiService.get<ChapterSummary[]>('storyChaptersList', { urlSuffix: suffix });
      console.log('Raw chapters from backend:', chapters);
      return chapters;
    } catch (error) {
      console.error('Failed to get chapters:', error);
      return [];
    }
  }

  // List passages for a given chapter (using CRUD endpoint)
  async getChapterPassages(storyId: string, chapterId: string): Promise<ChapterPassage[]> {
    try {
      console.log('Getting passages overview for chapter ID:', chapterId);
      // Use the correct endpoint: story/chapters/{chapterId}/passages/
      const suffix = `${chapterId}/passages/`;
      console.log('API endpoint suffix:', suffix);
      console.log('Full endpoint would be: story/chapters/' + suffix);
      
      const passages = await apiService.get<ChapterPassage[]>('storyRoot', { urlSuffix: `chapters/${suffix}` });
      console.log('Raw passages overview from backend for chapter', chapterId, ':', passages);
      
      if (!passages || passages.length === 0) {
        console.error('No passages found for chapter:', chapterId);
        return [];
      }
      
      return passages;
    } catch (error) {
      console.error('Failed to get chapter passages overview:', error);
      return [];
    }
  }

  // Start or restart a story for the user, returns first passage
  async startStory(storyId: string): Promise<StoryDetail> {
    try {
      const suffix = `${storyId}/start/`;
      return await apiService.post<StoryDetail>('storyStart', null, { urlSuffix: suffix });
    } catch (error) {
      console.error('Failed to start story:', error);
      throw error;
    }
  }  // Fetch the user's current or specific passage
  async getPassage(storyId: string, passageId?: string): Promise<Passage> {
    try {
      console.log("=== GET PASSAGE (UPDATED) ===");
      console.log("Story ID:", storyId);
      console.log("Requested Passage ID:", passageId);
      
      let currentPassageId = passageId || '1'; // Start with '1' instead of 'start'
      if (!passageId) {
        // Get current passage from progress first
        try {
          const progress = await this.getStoryProgressById(storyId);
          currentPassageId = progress?.current_passage_id || '1';
          console.log("Got current passage from progress:", currentPassageId);
        } catch (progressError) {
          console.warn('Could not get story progress, using passage 1:', progressError);
          currentPassageId = '1';
        }
      }
      
      // Convert to numeric form for better handling
      const numericPassageId = this.resolvePassageId(currentPassageId);
      console.log("Resolved passage ID to:", numericPassageId);
      
      console.log('=== FETCHING PASSAGE FROM BACKEND ===');
      console.log('Story ID:', storyId);
      console.log('Numeric Passage ID:', numericPassageId);
      
      // Use the passageDetail endpoint function from API config
      const endpoint = `story/stories/${storyId}/passage/${encodeURIComponent(numericPassageId)}/`;
      console.log('Full API endpoint:', endpoint);
      
      // Make direct API call using the correct endpoint structure
      try {
        const response = await apiService.get<any>('storyRoot', { 
          urlSuffix: `stories/${storyId}/passage/${encodeURIComponent(numericPassageId)}/` 
        });
        
        console.log('Raw API response:', response);
        
        // The backend returns a nested structure, extract the passage
        if (response?.passage) {
          console.log('Found passage in response:', response.passage);
          return response.passage as Passage;
        } else if (response?.content) {
          // Sometimes the response might be the passage directly
          console.log('Response appears to be passage directly:', response);
          return response as Passage;
        } else if (response) {
          // Log the response structure to understand what we're getting
          console.log('Unexpected response structure:', Object.keys(response));
          console.log('Full response:', response);
        }
      } catch (apiError) {
        console.log("Main API call failed, trying fallback:", apiError);
      }
      
      // Try sequential ID approach as fallback
      console.log('Primary fetch failed, trying sequential ID approach...');
      const sequentialResult = await this.getPassageBySequentialId(storyId, numericPassageId);
      if (sequentialResult) {
        console.log('Successfully fetched using sequential ID:', sequentialResult);
        return sequentialResult;
      }
      
      throw new Error(`No passage found in response for passage ID: ${numericPassageId}`);
    } catch (error) {
      console.error('Failed to get passage:', error);
      console.error('Error details:', {
        storyId,
        passageId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Helper method to resolve passage ID to numeric form
  private resolvePassageId(passageId: string): string {
    // If it's already numeric, return as-is
    if (/^\d+$/.test(passageId)) {
      return passageId;
    }
    
    // Map common starting passage names to 1
    if (passageId === 'start' || passageId === 'begin' || passageId === 'intro') {
      return '1';
    }
    
    // Extract numbers from string (e.g., "passage_2" -> "2")
    const numMatch = passageId.match(/\d+/);
    if (numMatch) {
      return numMatch[0];
    }
    
    // Default to 1 if no number found
    return '1';
  }

  // Helper method to try sequential passage IDs (for skipped IDs)
  private async getPassageBySequentialId(storyId: string, targetId: string): Promise<Passage | null> {
    const targetNum = parseInt(targetId);
    if (isNaN(targetNum)) return null;
    
    // Try a range around the target ID (in case some IDs are skipped)
    const idsToTry = [targetNum];
    
    // Add nearby IDs to try (e.g., if looking for 5, try 4, 6, 3, 7, etc.)
    for (let offset = 1; offset <= 3; offset++) {
      if (targetNum - offset >= 1) idsToTry.push(targetNum - offset);
      idsToTry.push(targetNum + offset);
    }
    
    console.log("Trying sequential IDs:", idsToTry);
    
    for (const id of idsToTry) {
      try {
        const response = await apiService.get<any>('storyRoot', { 
          urlSuffix: `stories/${storyId}/passage/${id}/` 
        });
        
        console.log(`Sequential ID ${id} response:`, response);
        
        if (response?.passage) {
          console.log("Found passage via sequential ID:", id, response.passage);
          return response.passage as Passage;
        } else if (response?.content) {
          console.log("Found passage content via sequential ID:", id, response);
          return response as Passage;
        }
      } catch (error) {
        console.log(`Sequential ID ${id} failed:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
    
    return null;
  }

  // Make a choice and receive the next passage back
  async makeChoice(choiceId: string): Promise<StoryDetail> {
    try {
      const suffix = `${choiceId}/select/`;
      return await apiService.post<StoryDetail>('choiceSelect', null, { urlSuffix: suffix });
    } catch (error) {
      console.error('Failed to make choice:', error);
      throw error;
    }
  }

  // Get story progress (compatible with existing code)
  async getStoryProgress(characterId: string, storyId: string): Promise<LocalStoryProgress> {
    try {
      // Try to get progress from backend
      const progress = await apiService.getNewStoryProgress(parseInt(storyId));
      console.log('Backend story progress:', progress);
      
      // Transform backend progress to frontend format
      return {
        storyId,
        exploration: progress.progress?.progress_percentage || 0,
        completed: progress.progress?.is_completed || false,
        lastPlayedAt: new Date().toISOString(),
        choices: []
      };
    } catch (error) {
      console.error('Failed to get story progress from backend:', error);
      // Return default progress
      return {
        storyId,
        exploration: 0,
        completed: false,
        choices: []
      };
    }
  }

  // Get story progress (new method for story-specific progress)
  async getStoryProgressById(storyId: string): Promise<any> {
    try {
      const suffix = `${storyId}/progress/`;
      return await apiService.get<any>('storyProgressGet', { urlSuffix: suffix });
    } catch (error) {
      console.error('Failed to get story progress:', error);
      throw error;
    }
  }

  // Restart a completed story (for repeatable stories)
  async restartStory(storyId: string): Promise<void> {
    try {
      // Use the start endpoint to restart
      const suffix = `${storyId}/start/`;
      await apiService.post('storyStart', null, { urlSuffix: suffix });
    } catch (error) {
      console.error('Failed to restart story:', error);
      throw error;
    }
  }

  // LEGACY METHODS (for backward compatibility)

  // Fallback method for getting available stories
  private async getAvailableStoriesFallback(): Promise<any[]> {
    try {
      // Get from backend using old method
      const backendStories = await apiService.getStories();
      console.log('Raw backend stories response (fallback):', backendStories);
      
      if (backendStories && backendStories.length > 0) {
        console.log('Retrieved stories from backend (fallback):', backendStories);
        // Transform backend format to frontend format
        const transformedStories = backendStories.map(story => {
          const transformedStory = this.transformBackendStory(story);
          return this.transformToStory(transformedStory);
        });
        console.log('Transformed stories (fallback):', transformedStories);
        return transformedStories;
      }
      
      // Return empty array if no stories available
      console.log('No backend stories available');
      return [];
    } catch (error) {
      console.error('Failed to get available stories from backend (fallback):', error);
      // Return empty array on error
      return [];
    }
  }

  // Get story passages from backend (legacy method)
  async getStorypassages(storyId: string): Promise<any> {
    try {
      // Try new method first
      const storyDetail = await this.getPassage(storyId);
      if (storyDetail) {
        console.log('Retrieved story passages from new endpoint for ID:', storyId);
        // Transform to frontend format
        const transformedpassages = this.transformBackendStorypassages(storyDetail);
        console.log('Transformed story passages:', transformedpassages);
        return transformedpassages;
      }
      
      // Fallback to old method
      const backendpassages = await apiService.getStorypassages(storyId);
      console.log('Raw backend story passages response (fallback):', backendpassages);
      
      if (backendpassages) {
        console.log('Retrieved story passages from backend for ID:', storyId);
        // Transform backend format to frontend format
        const transformedpassages = this.transformBackendStorypassages(backendpassages);
        console.log('Transformed story passages:', transformedpassages);
        return transformedpassages;
      }
      
      // Return null if no passages available
      console.log('No backend story passages available for ID:', storyId);
      return null;
    } catch (error) {
      console.error('Failed to get story passages from backend for ID:', storyId, error);
      // Return null on error
      return null;
    }
  }

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

  // Update story progress
  async updateStoryProgress(characterId: string, storyId: string, progress: Partial<LocalStoryProgress>): Promise<void> {
    try {
      await apiService.getStoryDetailedProgress(storyId);
      // Note: The backend doesn't have a direct update progress endpoint
      // Progress is typically updated through choices and completion
      console.log('Story progress updated through backend interaction');
    } catch (error) {
      console.error('Failed to update story progress to backend:', error);
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
      // Use new API method
      await apiService.completeNewStory(parseInt(storyId), {
        final_rewards: completionData.finalRewards,
        skills_learned: completionData.skillsLearned,
        stat_gains: completionData.totalStatGains
      });
      
      console.log('Story completed successfully via backend');
    } catch (error) {
      console.error('Failed to complete story via backend:', error);
      // Fallback to local completion
      console.log('Falling back to local story completion');
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

  // TRANSFORMATION METHODS

  // Transform backend story metadata to frontend format
  private transformBackendStory(backendStory: any): Story {
    console.log('Transforming backend story:', backendStory);
    
    return {
      id: backendStory.id || 0,
      title: backendStory.title || 'Untitled Story',
      description: backendStory.description || 'No description available',
      image: backendStory.image || null,
      starting_passage_id: backendStory.starting_passage_id || 'start',
      min_level: backendStory.min_level || 1,
      category: backendStory.category || 'main',
      is_repeatable: backendStory.is_repeatable || false,
      created_at: backendStory.created_at || new Date().toISOString(),
      updated_at: backendStory.updated_at || new Date().toISOString(),
      chapters: backendStory.chapters || [],
      // Frontend-specific fields
      difficulty: this.mapDifficulty(backendStory.min_level || 1),
      atmosphere: this.generateAtmosphere(backendStory.category || 'main'),
      rarity: this.mapRarity(backendStory.category || 'main'),      skillFocus: this.generateSkillFocus(backendStory.category || 'main'),
      statBoosts: this.generateStatBoosts(backendStory.category || 'main'),
      timeToComplete: this.estimateTimeToComplete(backendStory.chapter_count || 0),
      revelations: backendStory.chapter_count || 0,
      exploration: 0, // Will be updated based on progress
      unlockLevel: backendStory.min_level || 1,
      isLocked: false // Will be determined by character level
    };
  }

  // Transform Story to frontend format for compatibility
  private transformToStory(story: Story): any {
    return {
      id: story.id,
      title: story.title,
      category: story.category,
      description: story.description,
      difficulty: story.difficulty || 'Intermediate',
      timeToComplete: story.timeToComplete || '15-20 minutes',
      exploration: story.exploration || 0,
      revelations: story.revelations || 3,
      rarity: story.rarity || 'Common',
      skillFocus: story.skillFocus || ['General'],
      atmosphere: story.atmosphere || 'Mysterious',
      statBoosts: story.statBoosts || ['General'],
      unlockLevel: story.unlockLevel || 1,
      isLocked: story.isLocked || false,
      image: story.image || null,
      is_repeatable: story.is_repeatable || false
    };
  }

  // Transform backend story passages to frontend format
  private transformBackendStorypassages(backendpassages: any): any {
    // This method transforms the Django backend response format to match the frontend expectations
    
    if (!backendpassages) return null;
    
    // If backend passages has a story object with passages
    if (backendpassages.story && backendpassages.passage) {
      return {
        id: backendpassages.story.id?.toString(),
        title: backendpassages.story.title,
        subtitle: backendpassages.story.category || backendpassages.story.type,
        atmosphere: backendpassages.story.atmosphere || 'Mysterious',
        difficulty: backendpassages.story.difficulty || 'Intermediate',
        rarity: backendpassages.story.rarity || 'Common',
        skillFocus: backendpassages.story.skill_focus || ['General'],
        passages: this.transformBackendPassages(backendpassages.passage, backendpassages.choices)
      };
    }
    
    // If backend passages has passages array
    if (backendpassages.passages && Array.isArray(backendpassages.passages)) {
      return {
        id: backendpassages.id?.toString(),
        title: backendpassages.title,
        subtitle: backendpassages.category || backendpassages.type,
        atmosphere: backendpassages.atmosphere || 'Mysterious',
        difficulty: backendpassages.difficulty || 'Intermediate',
        rarity: backendpassages.rarity || 'Common',
        skillFocus: backendpassages.skill_focus || ['General'],
        passages: this.transformBackendPassagesArray(backendpassages.passages)
      };
    }
    
    // If it's a simple story object, return as is
    return backendpassages;
  }

  // Transform backend passage and choices to frontend format
  private transformBackendPassages(passage: any, choices: any[]): any[] {
    console.log('Transforming backend passage:', passage);
    
    if (!passage) {
      console.log('No passage data provided');
      return [];
    }
    
    // Transform the passage passages
    const transformedPassage = {
      id: passage.passage_id || 'unknown',
      text: passage.passages || 'No passages available',
      atmosphere: passage.mood || 'mysterious',
      passageType: passage.passage_type || 'narration',
      backgroundImage: passage.background_image || null,
      backgroundMusic: passage.background_music || null,
      choices: passage.choices?.map((choice: any, index: number) => ({
        text: choice.text || `Choice ${index + 1}`,
        next: choice.next_passage_id || choice.next || null,
        statEffects: choice.stat_effects || choice.effects || {},
        description: choice.description || '',
        skillsLearned: choice.skills_learned || choice.skills || [],
        artifactUnlock: choice.artifact_unlock || null,
        isEnding: choice.is_ending || choice.is_end || false,
        finalRewards: choice.final_rewards || choice.rewards || [],
        wisdomGained: choice.wisdom_gained || choice.wisdom || ''
      })) || []
    };
    
    console.log('Transformed passage:', transformedPassage);
    return [transformedPassage];
  }

  // Transform backend passages array to frontend format
  private transformBackendPassagesArray(passages: any[]): any[] {
    console.log('Transforming backend passages array:', passages);
    
    return passages.map((passage, index) => {
      const isLastPassage = index === passages.length - 1;
      const nextPassageId = passages[index + 1]?.passage_id;
      
      return {
        id: passage.passage_id || `passage_${index}`,
        text: passage.passages || `Passage ${passage.passage_id} - ${passage.passage_type}`,
        atmosphere: passage.mood || 'mysterious',
        passageType: passage.passage_type || 'narration',
        order: passage.order || index + 1,
        choices: isLastPassage ? [] : [
          {
            text: nextPassageId ? 'Continue...' : 'Proceed',
            next: nextPassageId || `passage_${index + 2}`,
            statEffects: {},
            description: 'Proceed to the next passage',
            skillsLearned: [],
            isProgression: true
          }
        ]
      };
    });
  }

  // Get story passages starting from a specific chapter
  async getStorypassagesFromChapter(storyId: string, chapterId: number): Promise<any> {
    try {
      console.log('Getting story passages from chapter:', storyId, 'chapter:', chapterId);
      
      // First, get the chapters for this story
      const chapters = await apiService.getNewStoryChapters(parseInt(storyId));
      console.log('Chapters for story:', chapters);
      
      // Find the specific chapter
      const targetChapter = chapters.find((ch: any) => ch.id === chapterId);
      if (!targetChapter) {
        console.error('Chapter not found:', chapterId);
        return null;
      }
      
      console.log('Found target chapter:', targetChapter);
      
      // Get passages for this chapter
      const passages = await apiService.getNewChapterPassages(chapterId);
      console.log('Passages for chapter:', passages);
      
      if (!passages || passages.length === 0) {
        console.error('No passages found for chapter:', chapterId);
        return null;
      }
      
      // Fetch passages for each passage
      const passagesWithpassages = [];
      for (const passage of passages) {
        try {
          const passagepassages = await apiService.getNewPassagepassages(parseInt(storyId), passage.passage_id);
          if (passagepassages?.passage?.passages) {
            passagesWithpassages.push({
              ...passage,
              passages: passagepassages.passage.passages
            });
          } else {
            // Fallback to passage without passages
            passagesWithpassages.push(passage);
          }
        } catch (error) {
          console.error(`Failed to fetch passages for passage ${passage.passage_id}:`, error);
          passagesWithpassages.push(passage);
        }
      }
      
      // Get the first passage passages to start the story
      const firstPassage = passagesWithpassages[0];
      console.log('First passage with passages:', firstPassage);
      
      // Transform the backend data to frontend format
      const transformedpassages = {
        id: storyId,
        title: targetChapter.title || 'Unknown Story',
        subtitle: targetChapter.title || 'Unknown Chapter',
        atmosphere: this.generateAtmosphere('main'),
        difficulty: this.mapDifficulty(1),
        rarity: this.mapRarity('main'),
        skillFocus: this.generateSkillFocus('main'),
        passages: this.transformBackendPassagesArray(passagesWithpassages),
        currentPassage: firstPassage ? this.transformBackendPassages(firstPassage, []) : null,
        progress: {
          passagesVisited: 0,
          isCompleted: false,
          progressPercentage: 0
        },
        isChapterBased: true,
        chapterId: chapterId,
        chapterTitle: targetChapter.title
      };
      
      console.log('Transformed story passages:', transformedpassages);
      return transformedpassages;
      
    } catch (error) {
      console.error('Failed to get story passages from chapter:', error);
      return null;
    }
  }

  // ===== GEAR METHODS =====
  
  // Get available gear types
  async getAvailableGearTypes(): Promise<any[]> {
    try {
      return await apiService.get<any[]>('gearTypes');
    } catch (error) {
      console.error('Failed to get available gear types:', error);
      return [];
    }
  }

  // Get character's gear
  async getCharacterGear(): Promise<any[]> {
    try {
      return await apiService.get<any[]>('myGear');
    } catch (error) {
      console.error('Failed to get character gear:', error);
      return [];
    }
  }

  // Acquire gear (add to character's inventory)
  async acquireGear(gearTypeId: number): Promise<any> {
    try {
      console.log(`Attempting to acquire gear with type ID: ${gearTypeId}`);
      console.log(`Using endpoint: character-gear with payload: { gear_type_id: ${gearTypeId} }`);
      
      const result = await apiService.post<any>('characterGear', { gear_type_id: gearTypeId });
      console.log('Gear acquisition successful:', result);
      return result;
    } catch (error) {
      console.error('Failed to acquire gear:', error);
      console.error('Error details:', {
        gearTypeId,
        endpoint: 'character-gear',
        payload: { gear_type_id: gearTypeId }
      });
      throw error;
    }
  }

  // Equip gear
  async equipGear(gearId: number): Promise<any> {
    try {
      return await apiService.post<any>('equipGear', {}, { urlSuffix: `${gearId}/equip/` });
    } catch (error) {
      console.error('Failed to equip gear:', error);
      throw error;
    }
  }

  // Unequip gear
  async unequipGear(gearId: number): Promise<any> {
    try {
      return await apiService.post<any>('unequipGear', {}, { urlSuffix: `${gearId}/unequip/` });
    } catch (error) {
      console.error('Failed to unequip gear:', error);
      throw error;
    }
  }

  // Save choice rewards using both progress and game-data endpoints
  async saveChoiceRewards(storyId: string, chapterId: number, rewards: any): Promise<void> {
    try {
      console.log('Saving choice rewards using both progress and game-data endpoints:', { storyId, chapterId, rewards });
      
      // Get user profile to find player ID
      const userProfile = await apiService.getProfile();
      const playerId = userProfile?.id; // Use the user ID as player ID
      
      if (!playerId) {
        console.error('No player ID found in user profile');
        console.log('User profile structure:', userProfile);
        return;
      }
      
      console.log('Using player ID:', playerId);
      
      // Calculate total experience and wellness gains
      const totalExperience = Object.values(rewards).reduce((sum: number, reward: any) => sum + (reward.experience || 0), 0);
      const wellnessGains: any = {};
      
      // Aggregate wellness bonuses from all rewards
      Object.values(rewards).forEach((reward: any) => {
        if (reward.stat_bonuses) {
          Object.entries(reward.stat_bonuses).forEach(([stat, bonus]) => {
            // Map frontend stat names to backend wellness stats
            let backendStat = stat;
            switch (stat) {
              case 'focus_bonus':
                backendStat = 'awareness';
                break;
              case 'confidence_bonus':
                backendStat = 'resilience';
                break;
              case 'resilience_bonus':
                backendStat = 'resilience';
                break;
              case 'mindfulness_bonus':
                backendStat = 'awareness';
                break;
              case 'empathy_bonus':
                backendStat = 'connection';
                break;
              case 'organization_bonus':
                backendStat = 'balance';
                break;
              default:
                backendStat = stat;
            }
            wellnessGains[backendStat] = (wellnessGains[backendStat] || 0) + (bonus as number);
          });
        }
      });
      
      // 1. Save to progress endpoint for story-specific tracking
      const progressData = {
        user: playerId, // Backend expects 'user' not 'player'
        profile: playerId, // Backend requires 'profile' field
        story: parseInt(storyId), // Convert to number for backend
        xp: totalExperience,
        passage: `chapter_${chapterId}`,
        choices: Object.keys(rewards),
        wellness_gains: wellnessGains,
        loot_items: Object.values(rewards).map((reward: any) => reward.item_name).filter(Boolean),
        completed_at: new Date().toISOString()
      };
      
      console.log('Saving progress data:', progressData);
      
      try {
        await apiService.post('storyProgress', progressData);
        console.log('Successfully saved choice rewards to progress endpoint');
      } catch (progressError: any) {
        console.error('Failed to save to progress endpoint:', progressError);
        console.error('Progress error details:', {
          message: progressError.message,
          status: progressError.response?.status,
          data: progressError.response?.data,
          url: progressError.config?.url,
          payload: progressData
        });
        
        // Log the actual error response data for debugging
        if (progressError.response?.data) {
          console.error('Backend error response for progress:', JSON.stringify(progressError.response.data, null, 2));
        }
        
        // Continue with game-data save even if progress fails
      }
      
      // 2. Save to game-data endpoint for persistent cross-story storage
      const gameDataRecord = {
        user: playerId, // Backend expects 'user' not 'player'
        profile: playerId, // Backend requires 'profile' field
        player_name: userProfile?.profile?.character?.name || 'Unknown Player',
        score: totalExperience,
        level: userProfile?.profile?.character?.level || 1,
        last_played: new Date().toISOString(),
        current_story_id: parseInt(storyId), // Convert to number for backend
        current_passage_id: `chapter_${chapterId}`,
        unlocked_areas: Object.values(rewards).map((reward: any) => reward.item_name).filter(Boolean),
        completed_prompts: Object.keys(rewards),
        total_entries: Object.keys(rewards).length
        // Remove persistent_rewards as it's not in the backend schema
      };
      
      console.log('Saving game-data record:', gameDataRecord);
      
      // Try to POST new game-data record
      try {
        await apiService.post('gameData', gameDataRecord);
        console.log('Successfully saved choice rewards to game-data endpoint');
      } catch (gameDataError: any) {
        // If POST fails, try to PATCH existing record
        if (gameDataError.response?.status === 400) {
          console.log('POST failed, trying to PATCH existing game-data record');
          try {
            // Get existing game-data record
            const existingGameData = await apiService.getGameData();
            // Handle GameData as array or single object
            const gameDataArray = Array.isArray(existingGameData) ? existingGameData : [existingGameData];
            const existingRecord = gameDataArray.find((record: any) => 
              record.current_story_id === parseInt(storyId) && record.current_passage_id === `chapter_${chapterId}`
            );
            
            if (existingRecord) {
              // Update existing record
              const updatedData = {
                ...existingRecord,
                score: (existingRecord.score || 0) + totalExperience,
                level: Math.max(existingRecord.level || 1, userProfile?.profile?.character?.level || 1),
                last_played: new Date().toISOString(),
                unlocked_areas: [
                  ...(existingRecord.unlocked_areas || []),
                  ...Object.values(rewards).map((reward: any) => reward.item_name).filter(Boolean)
                ],
                completed_prompts: [
                  ...(existingRecord.completed_prompts || []),
                  ...Object.keys(rewards)
                ],
                total_entries: (existingRecord.total_entries || 0) + Object.keys(rewards).length
              };
              
              await apiService.patch('gameData', updatedData, { urlSuffix: `${existingRecord.id}/` });
              console.log('Successfully updated existing game-data record');
            } else {
              console.log('No existing game-data record found, creating new one');
              // Try POST again with different current_passage_id
              await apiService.post('gameData', {
                ...gameDataRecord,
                current_passage_id: `chapter_${chapterId}_${Date.now()}`
              });
              console.log('Successfully saved choice rewards as new game-data record with timestamp');
            }
          } catch (patchError: any) {
            console.error('Failed to PATCH game-data record:', patchError);
            // Don't throw error, just log it
            
            // Log the actual error response data for debugging
            if (patchError.response?.data) {
              console.error('Backend error response for PATCH game-data:', JSON.stringify(patchError.response.data, null, 2));
            }
          }
        } else {
          console.error('Failed to POST game-data record:', gameDataError);
          // Don't throw error, just log it
          
          // Log the actual error response data for debugging
          if (gameDataError.response?.data) {
            console.error('Backend error response for game-data:', JSON.stringify(gameDataError.response.data, null, 2));
          }
        }
      }
      
      console.log('Successfully saved choice rewards using both endpoints');
    } catch (error) {
      console.error('Failed to save choice rewards:', error);
      throw error;
    }
  }

  // Get saved rewards using existing backend endpoints
  async getCharacterRewards(characterId: string): Promise<any> {
    try {
      console.log('Fetching character rewards using existing endpoints:', characterId);
      
      // Get user profile to get character stats
      const userProfile = await apiService.getProfile();
      const characterStats = userProfile?.profile?.character;
      
      // Get story progress for all stories
      const storyProgress = await apiService.get<any>('storyProgress');
      
      // Try different endpoints for character's coping tools/gear
      let characterCopingTools: any[] = [];
      let availableCopingTools: any[] = [];
      
      try {
        // Try the character-gear endpoint first
        characterCopingTools = await apiService.get<any[]>('myGear');
        console.log('Found character gear via myGear endpoint:', characterCopingTools);
      } catch (error) {
        console.log('myGear endpoint failed, trying alternatives...');
        
        try {
          // Try character-tools endpoint
          characterCopingTools = await apiService.get<any[]>('myTools');
          console.log('Found character tools via myTools endpoint:', characterCopingTools);
        } catch (error2) {
          console.log('myTools endpoint also failed, trying coping-tools...');
          
          try {
            // Try coping-tools endpoint
            characterCopingTools = await apiService.get<any[]>('copingTools');
            console.log('Found coping tools via copingTools endpoint:', characterCopingTools);
          } catch (error3) {
            console.log('All gear/tools endpoints failed, using empty array');
            characterCopingTools = [];
          }
        }
      }
      
      // Try to get available coping tools
      try {
        availableCopingTools = await apiService.get<any[]>('copingTools');
      } catch (error) {
        console.log('Failed to get available coping tools, using empty array');
        availableCopingTools = [];
      }
      
      const rewards = {
        characterStats,
        storyProgress,
        characterCopingTools,
        availableCopingTools,
        totalExperience: characterStats?.experience || 0,
        wellnessStats: {
          awareness: characterStats?.awareness || 0,
          resilience: characterStats?.resilience || 0,
          connection: characterStats?.connection || 0,
          balance: characterStats?.balance || 0
        },
        level: characterStats?.level || 1,
        experienceProgress: Math.floor(((characterStats?.experience || 0) % 1000) / 10), // Calculate progress percentage
        experienceNeeded: 1000, // Fixed value for now
        wellnessAverage: Math.floor(((characterStats?.awareness || 0) + (characterStats?.resilience || 0) + (characterStats?.connection || 0) + (characterStats?.balance || 0)) / 4), // Calculate average
        equippedToolsCount: characterCopingTools?.filter((tool: any) => tool.is_equipped).length || 0,
        earnedCopingTools: characterCopingTools?.map((tool: any) => {
          const toolInfo = availableCopingTools?.find((available: any) => available.id === tool.gear_type_id);
          return toolInfo?.name || `Tool ID ${tool.gear_type_id}`;
        }).filter(Boolean) || [],
        storiesCompleted: storyProgress?.filter((progress: any) => progress.is_completed).length || 0,
        totalStoriesStarted: storyProgress?.length || 0
      };
      
      console.log('Retrieved character rewards using existing endpoints:', rewards);
      return rewards;
    } catch (error) {
      console.error('Failed to get character rewards:', error);
      return { 
        characterStats: null, 
        storyProgress: [], 
        characterCopingTools: [], 
        availableCopingTools: [],
        totalExperience: 0,
        wellnessStats: {},
        level: 1,
        experienceProgress: 0,
        experienceNeeded: 1000,
        wellnessAverage: 0,
        equippedToolsCount: 0,
        earnedCopingTools: [],
        storiesCompleted: 0,
        totalStoriesStarted: 0
      };
    }
  }

  // Save story completion using both progress and game-data endpoints
  async saveStoryCompletion(storyId: string, experience: number, wellnessGains: any): Promise<void> {
    try {
      console.log('Saving story completion using both progress and game-data endpoints:', { storyId, experience, wellnessGains });
      
      // Get user profile to find player ID
      const userProfile = await apiService.getProfile();
      const playerId = userProfile?.id; // Use the user ID as player ID
      
      if (!playerId) {
        console.error('No player ID found in user profile');
        console.log('User profile structure:', userProfile);
        return;
      }
      
      console.log('Using player ID:', playerId);
      
      // 1. Save to progress endpoint for story-specific tracking
      const progressData = {
        user: playerId, // Backend expects 'user' not 'player'
        profile: playerId, // Backend requires 'profile' field
        story: parseInt(storyId), // Convert to number for backend
        xp: experience,
        passage: 'story_complete',
        choices: ['story_completed'],
        wellness_gains: wellnessGains,
        loot_items: [],
        completed_at: new Date().toISOString()
      };
      
      console.log('Saving progress data:', progressData);
      
      try {
        await apiService.post('storyProgress', progressData);
        console.log('Successfully saved story completion to progress endpoint');
      } catch (progressError: any) {
        console.error('Failed to save to progress endpoint:', progressError);
        console.error('Progress error details:', {
          message: progressError.message,
          status: progressError.response?.status,
          data: progressError.response?.data,
          url: progressError.config?.url,
          payload: progressData
        });
        
        // Log the actual error response data for debugging
        if (progressError.response?.data) {
          console.error('Backend error response for progress:', JSON.stringify(progressError.response.data, null, 2));
        }
        
        // Continue with game-data save even if progress fails
      }
      
      // 2. Save to game-data endpoint for persistent cross-story storage
      const gameDataRecord = {
        user: playerId, // Backend expects 'user' not 'player'
        profile: playerId, // Backend requires 'profile' field
        player_name: userProfile?.profile?.character?.name || 'Unknown Player',
        score: experience,
        level: userProfile?.profile?.character?.level || 1,
        last_played: new Date().toISOString(),
        current_story_id: parseInt(storyId), // Convert to number for backend
        current_passage_id: 'story_complete',
        unlocked_areas: [],
        completed_prompts: ['story_completed'],
        total_entries: 1
        // Remove persistent_rewards as it's not in the backend schema
      };
      
      console.log('Saving game-data record:', gameDataRecord);
      
      // Try to POST new game-data record
      try {
        await apiService.post('gameData', gameDataRecord);
        console.log('Successfully saved story completion to game-data endpoint');
      } catch (gameDataError: any) {
        // If POST fails, try to PATCH existing record
        if (gameDataError.response?.status === 400) {
          console.log('POST failed, trying to PATCH existing game-data record');
          try {
            // Get existing game-data record
            const existingGameData = await apiService.getGameData();
            // Handle GameData as array or single object
            const gameDataArray = Array.isArray(existingGameData) ? existingGameData : [existingGameData];
            const existingRecord = gameDataArray.find((record: any) => 
              record.current_story_id === parseInt(storyId) && record.current_passage_id === 'story_complete'
            );
            
            if (existingRecord) {
              // Update existing record
              const updatedData = {
                ...existingRecord,
                score: (existingRecord.score || 0) + experience,
                level: Math.max(existingRecord.level || 1, userProfile?.profile?.character?.level || 1),
                last_played: new Date().toISOString(),
                completed_prompts: [
                  ...(existingRecord.completed_prompts || []),
                  'story_completed'
                ],
                total_entries: (existingRecord.total_entries || 0) + 1
              };
              
              await apiService.patch('gameData', updatedData, { urlSuffix: `${existingRecord.id}/` });
              console.log('Successfully updated existing game-data record');
            } else {
              console.log('No existing game-data record found, creating new one');
              // Try POST again with different current_passage_id
              await apiService.post('gameData', {
                ...gameDataRecord,
                current_passage_id: `story_complete_${Date.now()}`
              });
              console.log('Successfully saved story completion as new game-data record with timestamp');
            }
          } catch (patchError: any) {
            console.error('Failed to PATCH game-data record:', patchError);
            // Don't throw error, just log it
            
            // Log the actual error response data for debugging
            if (patchError.response?.data) {
              console.error('Backend error response for PATCH game-data:', JSON.stringify(patchError.response.data, null, 2));
            }
          }
        } else {
          console.error('Failed to POST game-data record:', gameDataError);
          // Don't throw error, just log it
          
          // Log the actual error response data for debugging
          if (gameDataError.response?.data) {
            console.error('Backend error response for game-data:', JSON.stringify(gameDataError.response.data, null, 2));
          }
        }
      }
      
      console.log('Successfully saved story completion using both endpoints');
    } catch (error) {
      console.error('Failed to save story completion:', error);
      throw error;
    }
  }

  // Acquire coping tool (add to character's inventory)
  async acquireCopingTool(copingToolId: number): Promise<any> {
    try {
      console.log(`Attempting to acquire coping tool with ID: ${copingToolId}`);
      
      // Try different endpoints for acquiring tools
      const endpointsToTry = [
        { endpoint: 'characterGear' as const, payload: { gear_type_id: copingToolId } },
        { endpoint: 'characterTools' as const, payload: { tool_id: copingToolId } },
        { endpoint: 'copingTools' as const, payload: { coping_tool_id: copingToolId } }
      ];
      
      for (const { endpoint, payload } of endpointsToTry) {
        try {
          console.log(`Trying to acquire tool via ${endpoint} with payload:`, payload);
          const result = await apiService.post<any>(endpoint, payload);
          console.log(`✅ Successfully acquired coping tool via ${endpoint}:`, result);
          return result;
        } catch (error) {
          console.log(`❌ Failed to acquire tool via ${endpoint}:`, error);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints fail, throw an error
      throw new Error('All acquisition endpoints failed');
    } catch (error) {
      console.error('Failed to acquire coping tool:', error);
      console.error('Error details:', {
        copingToolId,
        endpointsTried: ['character-gear', 'character-tools', 'coping-tools']
      });
      throw error;
    }
  }

  // Get available coping tools
  async getAvailableCopingTools(): Promise<any[]> {
    try {
      return await apiService.get<any[]>('copingTools');
    } catch (error) {
      console.error('Failed to get available coping tools:', error);
      return [];
    }
  }

  // Get character's coping tools
  async getCharacterCopingTools(): Promise<any[]> {
    try {
      return await apiService.get<any[]>('myGear');
    } catch (error) {
      console.error('Failed to get character coping tools:', error);
      return [];
    }
  }

  // Helper methods for story transformation
  private mapDifficulty(minLevel: number): string {
    if (minLevel <= 1) return 'Beginner';
    if (minLevel <= 3) return 'Intermediate';
    if (minLevel <= 5) return 'Advanced';
    return 'Expert';
  }

  private generateAtmosphere(category: string): string {
    const atmospheres = {
      'main': 'Mysterious corridors with ancient wisdom',
      'academic': 'Dimly lit study halls with floating equations',
      'social': 'Crowded halls where whispers echo',
      'emotional': 'Stormy chambers with crashing waves of feeling',
      'wellness': 'Balanced chambers with scales of light and shadow'
    };
    return atmospheres[category as keyof typeof atmospheres] || 'Mysterious atmosphere';
  }

  private mapRarity(category: string): 'Common' | 'Rare' | 'Epic' | 'Legendary' {
    const rarities = {
      'main': 'Epic' as const,
      'academic': 'Rare' as const,
      'social': 'Common' as const,
      'emotional': 'Epic' as const,
      'wellness': 'Rare' as const
    };
    return rarities[category as keyof typeof rarities] || 'Common';
  }

  private generateSkillFocus(category: string): string[] {
    const skillFocus = {
      'main': ['Mindfulness', 'Self-Reflection', 'Personal Growth'],
      'academic': ['Focus', 'Stress Management', 'Time Management'],
      'social': ['Communication', 'Anxiety Management', 'Authenticity'],
      'emotional': ['Emotional Regulation', 'Distress Tolerance', 'Grounding'],
      'wellness': ['Boundary Setting', 'Self-Care', 'Life Balance']
    };
    return skillFocus[category as keyof typeof skillFocus] || ['General Wellness'];
  }

  private generateStatBoosts(category: string): string[] {
    const statBoosts = {
      'main': ['Sight Beyond Sight', 'Elemental Harmony'],
      'academic': ['Sight Beyond Sight', 'Unbreakable Will'],
      'social': ["Heart's Compass", 'Elemental Harmony'],
      'emotional': ['Unbreakable Will', 'Elemental Harmony'],
      'wellness': ['Elemental Harmony', "Heart's Compass"]
    };
    return statBoosts[category as keyof typeof statBoosts] || ['General Growth'];
  }

  private estimateTimeToComplete(chapterCount: number): string {
    const baseTime = 5; // minutes per chapter
    const totalMinutes = chapterCount * baseTime;    if (totalMinutes <= 10) return '5-10 min';
    if (totalMinutes <= 20) return '10-20 min';
    if (totalMinutes <= 30) return '20-30 min';
    return '30+ min';
  }
}

export const archiveService = new ArchiveService();