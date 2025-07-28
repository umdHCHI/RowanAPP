import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { apiService } from '../services/apiService';

// --- Interfaces to clarify the state structure ---
interface Passage {
  passage_id: string;
  content: string;
  passage_type: 'narration' | 'dialogue' | 'decision' | 'ending';
  choices: Choice[];
  // ... other passage properties
}

interface Choice {
  id: number;
  text: string;
  target_id: string; // This is the crucial field for navigation
  // ... other choice properties
}

interface StoryState {
  story: any;
  passage: Passage;
  progress: any;
  chapter_title: string;
  chapter_number?: number;
}

interface UseStoryEngineProps {
  storyId: string | number;
  chapterId?: number;
}

// Helper function to retry API calls with exponential backoff
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
    //  console.warn(`API call attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
     //   console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const useStoryEngine = ({ storyId, chapterId }: UseStoryEngineProps) => {
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    const startStoryFlow = async () => {
      setLoading(true);
      setError(null);
      setStoryState(null);

      try {
    //    console.log(`🚀 Initializing story flow for storyId: ${storyId}, chapterId: ${chapterId}`);
    //    console.log(`📱 Platform: ${Platform.OS}`);

        // If a specific chapter is selected, we must find its starting passage.
        // This is the one unavoidable case where we load more than one passage's metadata.
        if (chapterId) {
    //      console.log(`📖 Starting from a specific chapter: ${chapterId}`);
          
          // For chapter-specific starts, we need to manually find the correct starting passage
          // since the backend restart endpoint doesn't support chapter context
    //      console.log(`📖 Getting starting passage for chapter ${chapterId}`);
          
          // Get all passages from the specific chapter with retry logic
    //      console.log(`🔄 Making API call to getChapterPassages(${storyId}, ${chapterId})`);
          const chapterPassages = await retryApiCall(
            () => apiService.getChapterPassages(storyId, chapterId),
            3,
            Platform.OS === 'web' ? 500 : 1000 // Longer delays on mobile
          );
          
    //      console.log(`📊 Chapter passages result:`, {
     //       length: chapterPassages?.length || 0,
     //       isArray: Array.isArray(chapterPassages),
     //       firstPassage: chapterPassages?.[0] || null
    //      });
          
          if (!chapterPassages || chapterPassages.length === 0) {
            throw new Error(`No passages found in chapter ${chapterId}`);
          }
          
          // Find the passage with the lowest order (should be the starting passage)
          const firstPassage = chapterPassages.sort((a: any, b: any) => a.order - b.order)[0];
    //      console.log(`✅ Found chapter starting passage: ${firstPassage.passage_id} (order: ${firstPassage.order})`);
    //      console.log(`📝 First passage content preview: ${firstPassage.content?.substring(0, 100)}...`);
          
          // Get the chapter information to get the title and chapter_number with retry logic
    //      console.log(`🔄 Making API call to getChapters(${storyId})`);
          const chapters = await retryApiCall(
            () => apiService.getChapters(storyId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );
          
          const currentChapter = chapters.find((ch: any) => ch.id === chapterId);
          
          if (!currentChapter) {
            throw new Error(`Chapter ${chapterId} not found in story ${storyId}`);
          }
          
    //      console.log(`📖 Chapter info: ${currentChapter.title} (Chapter ${currentChapter.chapter_number})`);
          
          // Create a mock response structure to match the expected format
          const startPassage = {
            story: { id: storyId, title: firstPassage.story_title },
            chapter_title: currentChapter.title,
            passage: firstPassage,
            progress: { passages_visited: [firstPassage.passage_id] }
          };
          
    //      console.log(`✅ Loaded starting passage: ${startPassage.passage.passage_id}`);
    //      console.log(`📝 Passage content: ${startPassage.passage.content?.substring(0, 100)}...`);
    //      console.log(`📖 Chapter title: ${startPassage.passage.chapter_title}`);
    //      console.log(`🎯 Expected chapter: ${chapterId}, Actual chapter: ${startPassage.passage.chapter}`);
          
          const initialState = {
             story: { id: storyId, title: startPassage.story?.title || startPassage.passage.story_title },
             chapter_title: currentChapter.title,
             chapter_number: currentChapter.chapter_number,
             passage: startPassage.passage,
             progress: { passages_visited: [startPassage.passage.passage_id] }
          };
    //      console.log(`📖 Initial story state set: Chapter ${currentChapter.chapter_number}: ${currentChapter.title}`);
    //      console.log(`📖 Initial passage chapter: ${startPassage.passage.chapter || 'No chapter info'}`);
          setStoryState(initialState);

        } else {
          // For a normal start, we need to check if the story has chapters
    //      console.log(`🏁 Starting story from the beginning.`);
          
          // First, get the story's chapters to see if it has any
    //      console.log(`🔄 Making API call to getChapters(${storyId})`);
          const chapters = await retryApiCall(
            () => apiService.getChapters(storyId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );
          
          if (chapters && chapters.length > 0) {
            // Story has chapters, so start from the first chapter
    //        console.log(`📖 Story has ${chapters.length} chapters, starting from first chapter`);
            const firstChapter = chapters.find((ch: any) => ch.is_starting_chapter) || chapters[0];
    //      console.log(`📖 Starting from chapter: ${firstChapter.id} (${firstChapter.title})`);
            
            // Get all passages from the first chapter
    //      console.log(`🔄 Making API call to getChapterPassages(${storyId}, ${firstChapter.id})`);
            const chapterPassages = await retryApiCall(
              () => apiService.getChapterPassages(storyId, firstChapter.id),
              3,
              Platform.OS === 'web' ? 500 : 1000
            );
            
            if (!chapterPassages || chapterPassages.length === 0) {
              throw new Error(`No passages found in first chapter ${firstChapter.id}`);
            }
            
            // Find the passage with the lowest order (should be the starting passage)
            const firstPassage = chapterPassages.sort((a: any, b: any) => a.order - b.order)[0];
    //      console.log(`✅ Found chapter starting passage: ${firstPassage.passage_id} (order: ${firstPassage.order})`);
            
            const initialState = {
              story: { id: storyId, title: firstPassage.story_title },
              chapter_title: firstChapter.title,
              chapter_number: firstChapter.chapter_number,
              passage: firstPassage,
              progress: { passages_visited: [firstPassage.passage_id] }
            };
    //      console.log(`📖 Initial story state set (first chapter): Chapter ${firstChapter.chapter_number}: ${firstChapter.title}`);
    //      console.log(`📖 Initial passage chapter: ${firstPassage.chapter || 'No chapter info'}`);
            setStoryState(initialState);
            
          } else {
            // Story has no chapters, so use the traditional restart method
    //      console.log(`📖 Story has no chapters, using traditional restart method`);
            
            const restartResponse = await retryApiCall(
              () => apiService.restartStory(storyId),
              3,
              Platform.OS === 'web' ? 500 : 1000
            );
            
            const startingPassageId = restartResponse.starting_passage;
            if (!startingPassageId) {
              throw new Error("Story restart did not provide a starting passage ID.");
            }
            
            const initialState = await retryApiCall(
              () => apiService.getPassage(Number(storyId), startingPassageId),
              3,
              Platform.OS === 'web' ? 500 : 1000
            );
            
            if (!initialState) {
              throw new Error("Failed to fetch the initial passage.");
            }
    //      console.log(`📖 Initial story state set (traditional restart): Chapter ${initialState.chapter_title || 'No title'} (${initialState.chapter_number || 'No number'})`);
    //      console.log(`📖 Initial passage chapter: ${initialState.passage?.chapter || 'No chapter info'}`);
            setStoryState(initialState);
          }
        }

      } catch (err: any) {
    //    console.error('💥 Failed to start story flow:', err);
        
        // Provide more specific error messages for mobile debugging
        let errorMessage = 'Failed to load story.';
        
        if (err.message) {
          errorMessage = err.message;
        } else if (err.response) {
          errorMessage = `Network error: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = 'Network request failed. Please check your connection.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startStoryFlow();
  }, [storyId, chapterId]);

  const makeChoice = useCallback(async (choice: Choice) => {
    if (loading || !storyId || !choice?.target_id) {
        if (!choice?.target_id) console.warn("Choice is missing a target_id.", choice);
        return null;
    }

    setLoading(true);
    setError(null);

    try {
    //  console.log(`🎯 Making choice, advancing to passage: ${choice.target_id}`);
      
      const nextState = await retryApiCall(
        () => apiService.makeChoice(storyId, choice.target_id), // Use the correct API endpoint
        3,
        Platform.OS === 'web' ? 500 : 1000
      );

      if (!nextState || !nextState.passage) {
        throw new Error(`Failed to fetch passage for choice target: ${choice.target_id}`);
      }
      
      // Preserve the chapter information from the current state
      const currentChapterTitle = storyState?.chapter_title;
      const currentChapterNumber = storyState?.chapter_number;
      
      // Create a new state that preserves chapter information
      const updatedState = {
        ...nextState,
        chapter_title: nextState.chapter_title || currentChapterTitle,
        chapter_number: nextState.chapter_number || currentChapterNumber,
      };
      
    //  console.log(`📖 Preserving chapter context: ${currentChapterTitle} (${currentChapterNumber})`);
    //  console.log(`📖 New passage chapter: ${nextState.chapter_title} (${nextState.chapter_number})`);
    //  console.log(`📖 Final state chapter: ${updatedState.chapter_title} (${updatedState.chapter_number})`);
    //  console.log(`📖 Story ID: ${storyId}, Expected Chapter ID: ${chapterId}`);
    //  console.log(`📖 Next state passage chapter: ${nextState.passage?.chapter || 'No chapter info'}`);
      
      setStoryState(updatedState);
      return updatedState;

    } catch (err: any) {
    //  console.error('💥 Failed to make choice:', err);
      
      let errorMessage = 'Failed to process choice.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        errorMessage = `Network error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Network request failed. Please check your connection.';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId, loading, storyState]);

  const currentPassage = storyState?.passage || null;
  const availableChoices = currentPassage?.choices || [];
  
  // Clean, derived booleans to make the UI component simple
  const isNarration = currentPassage?.passage_type === 'narration' || currentPassage?.passage_type === 'dialogue';
  const isDecision = currentPassage?.passage_type === 'decision';
  const isEnding = currentPassage?.passage_type === 'ending';
  const hasMultipleChoices = availableChoices.length > 1;
  const hasChoices = availableChoices.length > 0;

  return {
    // Raw State
    loading,
    error,
    currentPassage,
    
    // Chapter Information
    chapterTitle: storyState?.chapter_title || null,
    chapterNumber: storyState?.chapter_number || null,
    
    // Actions
    makeChoice,
    
    // Simplified UI State
    isInitialized: !!storyState,
    isEnding,
    hasMultipleChoices,
    hasChoices,
    isDecision,
    availableChoices,
  };
};