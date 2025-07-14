import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '../imports';

interface ProgressivePassageLoaderOptions {
  storyId: string;
  chapterId?: number | undefined;
  initialLoadCount?: number; // Default 5
  preloadCount?: number; // Default 3 - how many to preload when getting close to end
}

interface PassageData {
  id: number;
  passage_id: string;
  content: string;
  passage_type: string;
  speaker?: string;
  required_conditions?: any;
  story_effects?: any;
  mood?: string;
  background_music?: string;
  background_image?: string;
  order: number;
  choices: any[];
  isLoaded: boolean;
}

export const useProgressivePassageLoader = ({
  storyId,
  chapterId,
  initialLoadCount = 5,
  preloadCount = 3
}: ProgressivePassageLoaderOptions) => {
  const [passages, setPassages] = useState<PassageData[]>([]);
  const [passageList, setPassageList] = useState<any[]>([]); // Raw passage list from backend
  const [loadedPassageIds, setLoadedPassageIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load the initial passage list (just metadata, no content)
  useEffect(() => {
    const loadPassageList = async () => {
      if (!storyId || isInitialized) return;

      setLoading(true);
      setError(null);

      try {
        console.log('=== PROGRESSIVE LOADER: LOADING CURRENT PASSAGE ===');
        console.log('Story ID:', storyId);
        console.log('Chapter ID:', chapterId);

        // The new backend doesn't provide a passage list
        // Instead, we get the current passage directly
        console.log('Getting current passage from new backend');
        const currentPassageResponse = await apiService.getCurrentPassage(storyId);
        console.log('Current passage response:', currentPassageResponse);

        if (!currentPassageResponse?.passage) {
          throw new Error('No current passage available');
        }

        // Create a single passage entry from the current passage
        const currentPassage = currentPassageResponse.passage;
        const passageEntry = {
          id: parseInt(currentPassage.passage_id) || 0,
          passage_id: currentPassage.passage_id,
          content: currentPassage.content,
          passage_type: currentPassage.passage_type,
          speaker: currentPassage.speaker,
          required_conditions: currentPassage.required_conditions,
          story_effects: currentPassage.story_effects,
          mood: currentPassage.mood,
          background_music: currentPassage.background_music,
          background_image: currentPassage.background_image,
          order: currentPassage.order || 0,
          choices: currentPassage.choices || [],
          isLoaded: true
        };

        console.log('Created passage entry:', passageEntry);

        // Set the passage list to contain just this current passage
        setPassageList([passageEntry]);
        setLoadedPassageIds(new Set([passageEntry.passage_id]));
        setPassages([passageEntry]);
        setIsInitialized(true);

      } catch (err: any) {
        console.error('Failed to load current passage:', err);
        setError(err.message || 'Failed to load current passage');
      } finally {
        setLoading(false);
      }
    };

    loadPassageList();
  }, [storyId, chapterId, isInitialized]);

  // Load content for a specific passage
  const loadPassageContent = async (passageInfo: any): Promise<PassageData> => {
    console.log(`=== LOADING PASSAGE CONTENT ===`);
    console.log('Passage info:', passageInfo);
    console.log('Story ID:', storyId);

    try {
      // The new backend doesn't support direct passage fetching
      // Instead, we need to use getCurrentPassage to get the current state
      console.log('Using getCurrentPassage instead of direct passage fetching');
      const currentPassageResponse = await apiService.getCurrentPassage(storyId);
      console.log('Current passage response:', currentPassageResponse);

      if (!currentPassageResponse?.passage) {
        throw new Error('No passage data in response');
      }

      // The API response has this structure:
      // { story: {...}, chapter_title: string, passage: {...}, progress: {...} }
      const passageContent = currentPassageResponse.passage;
      const progress = currentPassageResponse.progress;
      const chapterTitle = currentPassageResponse.chapter_title;

      console.log('Extracted passage content:', passageContent);
      console.log('Extracted progress:', progress);
      console.log('Chapter title:', chapterTitle);

      // Transform the response to match our PassageData interface
      const passageData: PassageData = {
        id: parseInt(passageContent.passage_id) || 0,
        passage_id: passageContent.passage_id,
        content: passageContent.content,
        passage_type: passageContent.passage_type,
        speaker: passageContent.speaker,
        required_conditions: passageContent.required_conditions,
        story_effects: passageContent.story_effects,
        mood: passageContent.mood,
        background_music: passageContent.background_music,
        background_image: passageContent.background_image,
        order: passageContent.order || 0,
        choices: passageContent.choices || [],
        isLoaded: true
      };

      console.log('Transformed passage data:', passageData);
      return passageData;

    } catch (error) {
      console.error(`Failed to load content for passage ${passageInfo.passage_id}:`, error);
      throw error;
    }
  };

  // Load a specific passage by ID
  const loadPassage = useCallback(async (passageId: string): Promise<PassageData | null> => {
    // The new backend doesn't support loading individual passages by ID
    // Instead, we get the current passage
    console.log(`=== LOADING PASSAGE ${passageId} ===`);
    console.log('New backend: using getCurrentPassage instead of individual passage loading');
    
    try {
      const currentPassageResponse = await apiService.getCurrentPassage(storyId);
      console.log('Current passage response:', currentPassageResponse);
      
      if (!currentPassageResponse?.passage) {
        console.error('No passage data in response');
        return null;
      }
      
      const passageContent = currentPassageResponse.passage;
      const passageData: PassageData = {
        id: parseInt(passageContent.passage_id) || 0,
        passage_id: passageContent.passage_id,
        content: passageContent.content,
        passage_type: passageContent.passage_type,
        speaker: passageContent.speaker,
        required_conditions: passageContent.required_conditions,
        story_effects: passageContent.story_effects,
        mood: passageContent.mood,
        background_music: passageContent.background_music,
        background_image: passageContent.background_image,
        order: passageContent.order || 0,
        choices: passageContent.choices || [],
        isLoaded: true
      };
      
      // Update the passages state
      setPassages(prev => {
        const existingIndex = prev.findIndex(p => p.passage_id === passageData.passage_id);
        if (existingIndex >= 0) {
          return prev.map(p => p.passage_id === passageData.passage_id ? passageData : p);
        } else {
          return [...prev, passageData];
        }
      });
      
      setLoadedPassageIds(prev => new Set([...prev, passageData.passage_id]));
      
      return passageData;
    } catch (error) {
      console.error(`Failed to load passage ${passageId}:`, error);
      return null;
    }
  }, [storyId]);

  // Preload next few passages
  const preloadNextPassages = async (currentPassageId: string) => {
    // The new backend doesn't support preloading individual passages
    // Instead, we rely on the choice system to advance through the story
    console.log('Preloading not supported in new backend - using choice-based progression');
    return;
  };

  // Get a passage by ID (loads if not already loaded)
  const getPassage = useCallback(async (passageId: string): Promise<PassageData | null> => {
    const existingPassage = passages.find(p => p.passage_id === passageId);
    
    if (existingPassage && existingPassage.isLoaded) {
      return existingPassage;
    }
    
    return await loadPassage(passageId);
  }, [passages, loadPassage]);

  // Get the next passage ID based on current passage (respects order)
  const getNextPassageId = useCallback((currentPassageId: string): string | null => {
    // The new backend doesn't provide a passage list, so we can't determine the next passage by order
    // Instead, we rely on the choice system to advance through the story
    console.log('Next passage ID not available in new backend - using choice-based progression');
    return null;
  }, []);

  // Get passage by choice selection
  const getPassageByChoice = useCallback(async (choice: any): Promise<PassageData | null> => {
    // Extract the target passage ID from the choice
    // The backend provides target_id, not target_passage_id
    const nextPassageId = choice.target_id || 
                         choice.target_passage_id ||
                         choice.next_passage_info?.passage_id || 
                         choice.next_passage_id || 
                         choice.next;
    
    if (!nextPassageId) {
      console.warn('No next passage ID in choice:', choice);
      console.log('Choice object:', choice);
      // If no specific next passage, try to get the next one by order
      return null;
    }
    
    console.log(`Choice selected, next passage ID: ${nextPassageId}`);
    console.log('Story ID:', storyId);
    
    try {
      // Since the backend doesn't have a make_choice endpoint, 
      // we'll directly fetch the target passage
      console.log('Backend has no make_choice endpoint, fetching target passage directly');
      const passageResult = await apiService.getPassage(Number(storyId), nextPassageId);
      console.log('Target passage result:', passageResult);
      
      if (!passageResult?.passage) {
        console.warn('No passage data in result');
        return null;
      }
      
      // Transform the response to match our PassageData interface
      const passageContent = passageResult.passage;
      const passageData: PassageData = {
        id: parseInt(passageContent.passage_id) || 0,
        passage_id: passageContent.passage_id,
        content: passageContent.content,
        passage_type: passageContent.passage_type,
        speaker: passageContent.speaker,
        required_conditions: passageContent.required_conditions,
        story_effects: passageContent.story_effects,
        mood: passageContent.mood,
        background_music: passageContent.background_music,
        background_image: passageContent.background_image,
        order: passageContent.order || 0,
        choices: passageContent.choices || [],
        isLoaded: true
      };
      
      console.log('Transformed passage data from choice:', passageData);
      return passageData;
      
    } catch (error) {
      console.error('Error fetching target passage:', error);
      throw error;
    }
  }, [storyId]);

  // Check if a passage is loaded
  const isPassageLoaded = useCallback((passageId: string): boolean => {
    return loadedPassageIds.has(passageId);
  }, [loadedPassageIds]);

  // Get loading progress
  const loadingProgress = useMemo(() => {
    // The new backend doesn't provide a passage list, so we can't calculate progress based on loaded vs total
    // Instead, we return 100 if we have a current passage, 0 otherwise
    return passages.length > 0 ? 100 : 0;
  }, [passages.length]);

  // Get total passage count
  const totalPassageCount = passages.length;

  // Get loaded passage count
  const loadedPassageCount = passages.length;

  // Get the starting passage (order 0)
  const getStartingPassage = useCallback((): string | null => {
    // The new backend doesn't provide a passage list, so we can't determine the starting passage by order
    // Instead, we use the current passage from the backend
    console.log('Starting passage not available in new backend - using current passage');
    return passages[0]?.passage_id || null;
  }, [passages]);

  return {
    // State
    passages,
    loading,
    error,
    isInitialized,
    
    // Methods
    getPassage,
    getPassageByChoice,
    getNextPassageId,
    isPassageLoaded,
    loadPassage,
    getStartingPassage,
    
    // Progress info
    loadingProgress,
    totalPassageCount,
    loadedPassageCount,
    
    // Raw data
    passageList
  };
}; 