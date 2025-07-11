import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '../imports';

interface ProgressivePassageLoaderOptions {
  storyId: string;
  chapterId?: number;
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
        console.log('=== PROGRESSIVE LOADER: LOADING PASSAGE LIST ===');
        console.log('Story ID:', storyId);
        console.log('Chapter ID:', chapterId);
        console.log('Initial load count:', initialLoadCount);
        console.log('Preload count:', preloadCount);

        let passageListData: any[] = [];

        if (chapterId) {
          // Chapter-based story
          passageListData = await apiService.getChapterPassages(storyId, chapterId.toString());
        } else {
          // Non-chapter story - get passages directly
          try {
            passageListData = await apiService.getChapterPassages(storyId, '1'); // Default to chapter 1
          } catch (error) {
            // Fallback: try to get passages directly from story
            const storyData = await apiService.getStorypassages(parseInt(storyId));
            passageListData = storyData?.passages || [];
          }
        }

        console.log('Passage list loaded:', passageListData);
        console.log('Total passages available:', passageListData.length);

        if (!passageListData || passageListData.length === 0) {
          throw new Error('No passages found for this story/chapter');
        }

        // Sort passages by order to ensure correct sequence
        const sortedPassageList = passageListData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        console.log('Sorted passages by order:', sortedPassageList.map((p: any) => ({ id: p.id, order: p.order, passage_id: p.passage_id })));
        
        setPassageList(sortedPassageList);

        // Load initial batch of passages
        await loadInitialPassages(sortedPassageList);
        setIsInitialized(true);

      } catch (err: any) {
        console.error('Failed to load passage list:', err);
        setError(err.message || 'Failed to load story passages');
      } finally {
        setLoading(false);
      }
    };

    loadPassageList();
  }, [storyId, chapterId, isInitialized]);

  // Load initial batch of passages
  const loadInitialPassages = async (passageListData: any[]) => {
    console.log('=== LOADING INITIAL PASSAGES ===');
    console.log('Initial load count:', initialLoadCount);
    console.log('Total passages available:', passageListData.length);

    const initialPassages = passageListData.slice(0, initialLoadCount);
    const loadedPassages: PassageData[] = [];

    for (const passageInfo of initialPassages) {
      try {
        console.log(`Loading initial passage: ${passageInfo.passage_id} (order: ${passageInfo.order})`);
        const passageContent = await loadPassageContent(passageInfo);
        loadedPassages.push(passageContent);
        setLoadedPassageIds(prev => new Set([...prev, passageInfo.passage_id]));
      } catch (error) {
        console.warn(`Failed to load initial passage ${passageInfo.passage_id}:`, error);
        // Add placeholder passage
        loadedPassages.push({
          ...passageInfo,
          content: 'Content loading failed',
          choices: [],
          isLoaded: false
        });
      }
    }

    // Add placeholder entries for remaining passages (don't load content yet)
    const remainingPassages = passageListData.slice(initialLoadCount).map(passageInfo => ({
      ...passageInfo,
      content: '',
      choices: [],
      isLoaded: false
    }));

    setPassages([...loadedPassages, ...remainingPassages]);
    console.log('Initial passages loaded:', loadedPassages.length);
    console.log('Passages loaded in order:', loadedPassages.map(p => ({ order: p.order, passage_id: p.passage_id })));
  };

  // Load content for a specific passage
  const loadPassageContent = async (passageInfo: any): Promise<PassageData> => {
    console.log(`=== LOADING PASSAGE CONTENT ===`);
    console.log('Passage info:', passageInfo);
    console.log('Story ID:', storyId);

    try {
      // Get the actual passage content
      const passageContent = await apiService.getPassage(parseInt(storyId), passageInfo.passage_id);
      console.log('Passage content loaded:', passageContent);

      // Get choices for this passage - use the passage_id from the content response
      let choices: any[] = [];
      try {
        // The passage content response should include choices
        if (passageContent.choices && Array.isArray(passageContent.choices)) {
          choices = passageContent.choices;
          console.log('Choices found in passage content:', choices);
        } else if (passageInfo.id) {
          // Fallback: try to get choices by numeric ID
          choices = await apiService.getPassageChoices(passageInfo.id);
          console.log('Choices loaded by numeric ID:', choices);
        }
      } catch (choiceError) {
        console.warn('Could not load choices for passage:', choiceError);
      }

      return {
        ...passageInfo,
        content: passageContent.content || 'No content available',
        passage_type: passageContent.passage_type || 'narration',
        speaker: passageContent.speaker,
        required_conditions: passageContent.required_conditions || {},
        story_effects: passageContent.story_effects || {},
        mood: passageContent.mood,
        background_music: passageContent.background_music,
        background_image: passageContent.background_image,
        choices,
        isLoaded: true
      };

    } catch (error) {
      console.error(`Failed to load content for passage ${passageInfo.passage_id}:`, error);
      throw error;
    }
  };

  // Load a specific passage by ID
  const loadPassage = useCallback(async (passageId: string): Promise<PassageData | null> => {
    if (loadedPassageIds.has(passageId)) {
      console.log(`Passage ${passageId} already loaded`);
      return passages.find(p => p.passage_id === passageId) || null;
    }

    console.log(`=== LOADING PASSAGE ${passageId} ===`);
    
    const passageInfo = passageList.find(p => p.passage_id === passageId);
    if (!passageInfo) {
      console.error(`Passage info not found for ID: ${passageId}`);
      return null;
    }

    try {
      const passageContent = await loadPassageContent(passageInfo);
      
      setPassages(prev => prev.map(p => 
        p.passage_id === passageId ? passageContent : p
      ));
      
      setLoadedPassageIds(prev => new Set([...prev, passageId]));
      
      // Preload next few passages if we're getting close to the end
      await preloadNextPassages(passageId);
      
      return passageContent;
    } catch (error) {
      console.error(`Failed to load passage ${passageId}:`, error);
      return null;
    }
  }, [passageList, loadedPassageIds, passages]);

  // Preload next few passages
  const preloadNextPassages = async (currentPassageId: string) => {
    const currentIndex = passageList.findIndex(p => p.passage_id === currentPassageId);
    if (currentIndex === -1) return;

    // Only preload if we're getting close to the end of loaded content
    const loadedCount = loadedPassageIds.size;
    const totalCount = passageList.length;
    
    // Only preload if we have less than 3 passages left to load
    if (loadedCount >= totalCount - 3) {
      const nextPassages = passageList.slice(currentIndex + 1, currentIndex + 1 + preloadCount);
      
      console.log(`=== PRELOADING ${nextPassages.length} PASSAGES ===`);
      console.log(`Loaded: ${loadedCount}/${totalCount}, preloading to avoid delays`);
      
      for (const passageInfo of nextPassages) {
        if (!loadedPassageIds.has(passageInfo.passage_id)) {
          try {
            console.log(`Preloading passage: ${passageInfo.passage_id}`);
            const passageContent = await loadPassageContent(passageInfo);
            
            setPassages(prev => prev.map(p => 
              p.passage_id === passageInfo.passage_id ? passageContent : p
            ));
            
            setLoadedPassageIds(prev => new Set([...prev, passageInfo.passage_id]));
          } catch (error) {
            console.warn(`Failed to preload passage ${passageInfo.passage_id}:`, error);
          }
        }
      }
    } else {
      console.log(`Skipping preload - plenty of content loaded (${loadedCount}/${totalCount})`);
    }
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
    const currentIndex = passageList.findIndex(p => p.passage_id === currentPassageId);
    if (currentIndex === -1 || currentIndex >= passageList.length - 1) {
      return null; // No next passage
    }
    const nextPassage = passageList[currentIndex + 1];
    console.log(`Next passage by order: ${nextPassage.passage_id} (order: ${nextPassage.order})`);
    return nextPassage.passage_id;
  }, [passageList]);

  // Get passage by choice selection
  const getPassageByChoice = useCallback(async (choice: any): Promise<PassageData | null> => {
    // The backend provides next_passage_info with the correct UUID
    const nextPassageId = choice.next_passage_info?.passage_id || 
                         choice.next_passage_id || 
                         choice.target_id || 
                         choice.next;
    
    if (!nextPassageId) {
      console.warn('No next passage ID in choice:', choice);
      console.log('Choice object:', choice);
      // If no specific next passage, try to get the next one by order
      return null;
    }
    
    console.log(`Choice selected, next passage ID: ${nextPassageId}`);
    console.log(`Choice next_passage_info:`, choice.next_passage_info);
    return await getPassage(nextPassageId);
  }, [getPassage]);

  // Check if a passage is loaded
  const isPassageLoaded = useCallback((passageId: string): boolean => {
    return loadedPassageIds.has(passageId);
  }, [loadedPassageIds]);

  // Get loading progress
  const loadingProgress = useMemo(() => {
    if (passageList.length === 0) return 0;
    return (loadedPassageIds.size / passageList.length) * 100;
  }, [loadedPassageIds.size, passageList.length]);

  // Get total passage count
  const totalPassageCount = passageList.length;

  // Get loaded passage count
  const loadedPassageCount = loadedPassageIds.size;

  // Get the starting passage (order 0)
  const getStartingPassage = useCallback((): string | null => {
    if (passageList.length === 0) return null;
    const startingPassage = passageList.find(p => p.order === 0);
    return startingPassage?.passage_id || passageList[0]?.passage_id || null;
  }, [passageList]);

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