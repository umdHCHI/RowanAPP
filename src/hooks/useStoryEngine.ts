import { useCallback, useEffect, useState } from 'react';
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
}

interface UseStoryEngineProps {
  storyId: string | number;
  chapterId?: number;
}

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
        console.log(`🚀 Initializing story flow for storyId: ${storyId}, chapterId: ${chapterId}`);

        // If a specific chapter is selected, we must find its starting passage.
        // This is the one unavoidable case where we load more than one passage's metadata.
        if (chapterId) {
          console.log(`📖 Starting from a specific chapter: ${chapterId}`);
          
          // For chapter-specific starts, we need to manually find the correct starting passage
          // since the backend restart endpoint doesn't support chapter context
          console.log(`📖 Getting starting passage for chapter ${chapterId}`);
          
          // Get all passages from the specific chapter
          const chapterPassages = await apiService.getChapterPassages(storyId, chapterId);
          if (!chapterPassages || chapterPassages.length === 0) {
            throw new Error(`No passages found in chapter ${chapterId}`);
          }
          
          // Find the passage with the lowest order (should be the starting passage)
          const firstPassage = chapterPassages.sort((a: any, b: any) => a.order - b.order)[0];
          console.log(`✅ Found chapter starting passage: ${firstPassage.passage_id} (order: ${firstPassage.order})`);
          
          // Create a mock response structure to match the expected format
          const startPassage = {
            story: { id: storyId, title: firstPassage.story_title },
            chapter_title: firstPassage.chapter_title,
            passage: firstPassage,
            progress: { passages_visited: [firstPassage.passage_id] }
          };
          
          console.log(`✅ Loaded starting passage: ${startPassage.passage.passage_id}`);
          console.log(`📝 Passage content: ${startPassage.passage.content?.substring(0, 100)}...`);
          console.log(`📖 Chapter title: ${startPassage.passage.chapter_title}`);
          console.log(`🎯 Expected chapter: ${chapterId}, Actual chapter: ${startPassage.passage.chapter}`);
          
          const initialState = {
             story: { id: storyId, title: startPassage.story?.title || startPassage.passage.story_title },
             chapter_title: startPassage.passage.chapter_title,
             passage: startPassage.passage,
             progress: { passages_visited: [startPassage.passage.passage_id] }
          };
          setStoryState(initialState);

        } else {
          // For a normal start, we restart the story and fetch only the first passage. This is highly efficient.
          console.log(`🏁 Starting story from the beginning.`);
          const restartResponse = await apiService.restartStory(storyId);
          const startingPassageId = restartResponse.starting_passage;
          if (!startingPassageId) {
            throw new Error("Story restart did not provide a starting passage ID.");
          }
          const initialState = await apiService.getPassage(Number(storyId), startingPassageId);
          if (!initialState) {
            throw new Error("Failed to fetch the initial passage.");
          }
          setStoryState(initialState);
        }

      } catch (err: any) {
        console.error('💥 Failed to start story flow:', err);
        setError(err.message || 'Failed to load story.');
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
      console.log(`🎯 Making choice, advancing to passage: ${choice.target_id}`);
      const nextState = await apiService.getPassage(Number(storyId), choice.target_id);

      if (!nextState || !nextState.passage) {
        throw new Error(`Failed to fetch passage for choice target: ${choice.target_id}`);
      }
      
      setStoryState(nextState);
      return nextState;

    } catch (err: any) {
      console.error('💥 Failed to make choice:', err);
      setError(err.message || 'Failed to process choice.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId, loading]);

  const currentPassage = storyState?.passage || null;
  const availableChoices = currentPassage?.choices || [];
  
  // Clean, derived booleans to make the UI component simple
  const isNarration = currentPassage?.passage_type === 'narration' || currentPassage?.passage_type === 'dialogue';
  const isEnding = currentPassage?.passage_type === 'ending';
  const hasMultipleChoices = availableChoices.length > 1;
  const isContinuableNarration = isNarration && availableChoices.length === 1;

  return {
    // Raw State
    loading,
    error,
    currentPassage,
    
    // Actions
    makeChoice,
    
    // Simplified UI State
    isInitialized: !!storyState,
    isEnding,
    hasMultipleChoices,
    availableChoices,
    isContinuableNarration,
  };
};