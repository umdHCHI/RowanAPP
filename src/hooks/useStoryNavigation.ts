import { useState, useCallback, useEffect } from 'react';
import { apiService, Story, Passage, Choice, StoryProgress } from '../services/apiService';

interface StoryNavigationState {
    currentStory: Story | null;
    currentPassage: Passage | null;
    availableChoices: Choice[];
    storyProgress: StoryProgress | null;
    isLoading: boolean;
    error: string | null;
}

interface StoryNavigationActions {
    loadStory: (storyId: number, passageId?: string) => Promise<void>;
    makeChoice: (choiceId: number) => Promise<void>;
    resetStory: (storyId: number) => Promise<void>;
    startStory: (storyId: number) => Promise<void>;
    clearError: () => void;
}

export function useStoryNavigation(): StoryNavigationState & StoryNavigationActions {
    const [state, setState] = useState<StoryNavigationState>({
        currentStory: null,
        currentPassage: null,
        availableChoices: [],
        storyProgress: null,
        isLoading: false,
        error: null,
    });

    const setLoading = (isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
    };

    const setError = (error: string | null) => {
        setState(prev => ({ ...prev, error, isLoading: false }));
    };

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const loadStory = useCallback(async (storyId: number, passageId?: string) => {
        try {
            setLoading(true);
            setError(null);

            // Get the story details
            const story = await apiService.get<Story>('storyCatalog', { urlSuffix: `${storyId}/` });
            
            // Get or create story progress
            let progress = await apiService.getStoryProgress(storyId);
            
            // Determine which passage to load
            const targetPassageId = passageId || progress?.current_passage_id || story.starting_passage_id;
            
            // Navigate to the passage
            const result = await apiService.navigateToPassage(storyId, targetPassageId);

            setState(prev => ({
                ...prev,
                currentStory: story,
                currentPassage: result.passage,
                availableChoices: result.choices,
                storyProgress: result.storyProgress,
                isLoading: false,
                error: null,
            }));

        } catch (error: any) {
            console.error('Error loading story:', error);
            setError(error.message || 'Failed to load story');
        }
    }, []);

    const startStory = useCallback(async (storyId: number) => {
        try {
            setLoading(true);
            setError(null);

            // Start the story from the beginning
            const story = await apiService.get<Story>('storyCatalog', { urlSuffix: `${storyId}/` });
            await loadStory(storyId, story.starting_passage_id);

        } catch (error: any) {
            console.error('Error starting story:', error);
            setError(error.message || 'Failed to start story');
        }
    }, [loadStory]);

    const makeChoice = useCallback(async (choiceId: number) => {
        if (!state.storyProgress) {
            setError('No story progress found');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await apiService.makeChoice(choiceId, state.storyProgress.id);

            setState(prev => ({
                ...prev,
                currentPassage: result.nextPassage,
                availableChoices: result.choices,
                storyProgress: result.storyProgress,
                isLoading: false,
                error: null,
            }));

            // Check if story is completed
            if (result.storyProgress.is_completed) {
                console.log('Story completed!', {
                    completionType: result.storyProgress.completion_type,
                    effectsApplied: result.effectsApplied
                });
            }

        } catch (error: any) {
            console.error('Error making choice:', error);
            setError(error.message || 'Failed to make choice');
        }
    }, [state.storyProgress]);

    const resetStory = useCallback(async (storyId: number) => {
        try {
            setLoading(true);
            setError(null);

            await apiService.resetStoryProgress(storyId);
            await loadStory(storyId); // Reload from the beginning

        } catch (error: any) {
            console.error('Error resetting story:', error);
            setError(error.message || 'Failed to reset story');
        }
    }, [loadStory]);

    return {
        ...state,
        loadStory,
        makeChoice,
        resetStory,
        startStory,
        clearError,
    };
}

// Hook for getting available stories
export function useAvailableStories() {
    const [stories, setStories] = useState<Story[]>([]);
    const [completionStatus, setCompletionStatus] = useState<Record<number, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [availableStories, status] = await Promise.all([
                apiService.getAvailableStories(),
                apiService.getStoryCompletionStatus()
            ]);

            setStories(availableStories);
            setCompletionStatus(status);

        } catch (error: any) {
            console.error('Error loading stories:', error);
            setError(error.message || 'Failed to load stories');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStories();
    }, [loadStories]);

    return {
        stories,
        completionStatus,
        isLoading,
        error,
        refresh: loadStories,
    };
}

// Hook for managing story variables
export function useStoryVariables(storyId: number) {
    const [variables, setVariables] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);

    const setVariable = useCallback(async (name: string, value: any) => {
        try {
            setIsLoading(true);
            await apiService.setStoryVariable(storyId, name, value);
            setVariables(prev => ({ ...prev, [name]: value }));
        } catch (error) {
            console.error('Error setting story variable:', error);
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    const loadVariables = useCallback(async () => {
        try {
            setIsLoading(true);
            const storyVars = await apiService.getStoryVariables(storyId);
            const variableMap = storyVars.reduce((acc, sv) => {
                acc[sv.variable_name] = sv.variable_value;
                return acc;
            }, {} as Record<string, any>);
            setVariables(variableMap);
        } catch (error) {
            console.error('Error loading story variables:', error);
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        if (storyId) {
            loadVariables();
        }
    }, [storyId, loadVariables]);

    return {
        variables,
        setVariable,
        isLoading,
        refresh: loadVariables,
    };
}
