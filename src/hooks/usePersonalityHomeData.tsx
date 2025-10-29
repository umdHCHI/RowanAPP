import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { PersonalityKey, toPersonalityKey } from '../types/personality';
import { filterStoriesByPersonality } from '../utils/personalityFilter';

export interface PersonalityHomeData {
  primaryTrait: PersonalityKey;
  userProfile: any;
  stories: any[];
  completedStories: string[];
}

export const usePersonalityHomeData = ({ authToken, user }: any) => {
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryTrait, setPrimaryTrait] = useState<PersonalityKey>();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Loading timeout reached, setting loading to false');
        setIsLoading(false);
        setError('Loading timeout - please try refreshing');
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Story-related state
  const [stories, setStories] = useState<any[]>([]);
  const [filteredStories, setFilteredStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [completedStories, setCompletedStories] = useState<string[]>([]);

  // Main data fetching function - FIXED
  const fetchHomeScreenData = useCallback(async () => {
    
    if (!authToken) {
      setError('No authentication token');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      
      // Add a small delay to ensure backend has processed the profile update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the basic profile data (this works)
      const fullProfile = await apiService.getProfile();
      
      // Try to get personality data from the dedicated personality profile endpoint
      let personalityData = null;
      let dominantTrait = null;
      let mappedTrait = null;
      
      try {
        personalityData = await apiService.getPersonalityCompleteData();
        
        if (personalityData && personalityData.profile) {
          // Get dominant trait from personality profile
          const profile = personalityData.profile;
          dominantTrait = profile.profile_summary?.dominant_trait ||
                         Object.keys(profile).find(key =>
                           ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].includes(key) &&
                           profile[key] === Math.max(...Object.values(profile).filter(v => typeof v === 'number'))
                         );
          mappedTrait = toPersonalityKey(dominantTrait);

          console.log('🔍 PERSONALITY DETERMINATION:');
          console.log('  - Dominant trait from profile:', dominantTrait);
          console.log('  - Mapped trait:', mappedTrait);
          console.log('  - Profile scores:', {
            openness: profile.openness,
            conscientiousness: profile.conscientiousness,
            extraversion: profile.extraversion,
            agreeableness: profile.agreeableness,
            neuroticism: profile.neuroticism
          });
        }
      } catch (profileError) {
        console.warn('⚠️ Failed to get personality profile, trying survey data...', profileError);
      }
      
      // If no personality profile, try to get data from survey
      if (!mappedTrait) {
        try {
          const surveyData = await apiService.checkExistingSurvey();
          if (surveyData && surveyData.big_five_scores) {
            // Calculate dominant trait from survey scores
            const scores = surveyData.big_five_scores;
            const dominantTraitFromSurvey = Object.keys(scores).reduce((a, b) =>
              scores[a] > scores[b] ? a : b
            );
            const mappedTraitFromSurvey = toPersonalityKey(dominantTraitFromSurvey);

            console.log('🔍 PERSONALITY DETERMINATION (from survey):');
            console.log('  - Survey scores:', scores);
            console.log('  - Dominant trait from survey:', dominantTraitFromSurvey);
            console.log('  - Mapped trait:', mappedTraitFromSurvey);
            console.log('  - All scores:', {
              openness: scores.openMindedness || scores.openness,
              conscientiousness: scores.conscientiousness,
              extraversion: scores.extraversion,
              agreeableness: scores.agreeableness,
              neuroticism: scores.negativeEmotionality || scores.neuroticism
            });

            if (mappedTraitFromSurvey) {
              setPrimaryTrait(mappedTraitFromSurvey);
              console.log(`✅ PRIMARY TRAIT SET TO: ${mappedTraitFromSurvey}`);
              // Continue with the rest of the loading process...
            } else {
              setError('Personality profile not found. Please complete the personality survey first.');
              setIsLoading(false);
              return;
            }
          } else {
            setError('Personality profile not found. Please complete the personality survey first.');
            setIsLoading(false);
            return;
          }
        } catch (surveyError) {
          console.error('❌ Failed to get survey data as fallback:', surveyError);
          setError('Personality profile not found. Please complete the personality survey first.');
          setIsLoading(false);
          return;
        }
      } else {
        setPrimaryTrait(mappedTrait);
        console.log(`✅ PRIMARY TRAIT SET TO: ${mappedTrait} (from personality profile)`);
      }

      // **FIX: Get user's actual unlocked tools (not all available tools)**
      let myUnlockedTools: any[] = [];
      try {
        myUnlockedTools = await apiService.getMyTools();
      } catch (toolError) {
        console.warn('⚠️ Failed to load coping tools, continuing without them:', toolError);
      }

      try {

        // **FIX: Get quest progress from backend records (more reliable)**
        let questProgress: Record<string, number> = {};
        
        try {
          // Use the proper API method to get quest progress from backend records
          questProgress = await apiService.getQuestProgressFromRecords();
          
          // If no quest progress found from records, try the fallback
          if (Object.keys(questProgress).length === 0) {
            throw new Error('No quest progress found in records');
          }
        } catch (questError) {
          console.warn('⚠️ Failed to fetch quest progress from backend records:', questError);
          
          // Fallback: try to get quest progress from user profile
          const backendQuestProgress = fullProfile.quest_progress || [];
          
          if (Array.isArray(backendQuestProgress)) {
            // Transform from backend format to frontend format
            backendQuestProgress.forEach((questData: any, index: number) => {
              if (questData.quest && questData.quest.quest_id) {
                questProgress[questData.quest.quest_id] = questData.progress || 0;
              } else {
              }
            });
            
          } else {
            console.warn('⚠️ Backend quest_progress is not an array:', backendQuestProgress);
          }
        }
        
        // Log quest progress details for debugging
        if (Object.keys(questProgress).length > 0) {
          Object.entries(questProgress).forEach(([questId, progress]) => {
          });
        } else {
        }
        
        // Check if this is a quest from the correct personality type
        const expectedTrait = (mappedTrait || 'unknown').toLowerCase();
        Object.entries(questProgress).forEach(([questId, progress]) => {
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch) {
            const questTrait = questTraitMatch[1].toLowerCase();
          }
        });
        
        // **FIX: Build proper character data structure for personality users**
        // Character data is now directly on UserProfile, but personality users may not have character data
        
        // Debug experience data extraction
        
        const characterData = {
          // Basic info from profile
          id: fullProfile.id,
          username: fullProfile.username,
          name: fullProfile.username, // Use username as display name
          
          // Character stats - pull from actual profile data
          level: fullProfile.character?.level || fullProfile.level || 1,
          experience: fullProfile.character?.experience || fullProfile.experience || 0,
          experience_needed: fullProfile.character?.experience_needed || fullProfile.experience_needed || 1000,
          
          // **FIX: Use real wellness stats from backend instead of hardcoded values**
          wellness_stats: fullProfile.wellness_stats || [
            { icon: "🧘", label: "Exploration", value: 0, color: "#4A90E2" },
            { icon: "💚", label: "Courage", value: 0, color: "#2ECC71" },
            { icon: "🤝", label: "Connection", value: 0, color: "#E74C3C" },
            { icon: "⚖️", label: "Balance", value: 0, color: "#F39C12" }
          ],
          
          // Personality-specific data
          primaryTrait: mappedTrait || 'unknown',
          personalityProfile: fullProfile.personality_profile,

          // Tools and progress - **FIX: Use actual user's unlocked tools**
          unlocked_tools: myUnlockedTools.map(tool => tool.tool_id) || [],
          coping_tools: myUnlockedTools || [],
          quest_progress: questProgress,
          
          // Raw profile data for reference
          rawProfile: fullProfile
        };
        
        
        // **FIX: Actually set the userProfile state**
        setUserProfile(characterData);
        
      } catch (questError) {
        console.error('❌ QUEST PROGRESS LOADING ERROR:', questError);
        console.warn('⚠️ Failed to load quest progress, using empty object:', questError);
        
        // Continue without quest data - set userProfile with empty quest progress in case of error
        const characterData = {
          id: fullProfile.id,
          username: fullProfile.username,
          name: fullProfile.username,
          level: fullProfile.character?.level || fullProfile.level || 1,
          experience: fullProfile.character?.experience || fullProfile.experience || 0,
          experience_needed: fullProfile.character?.experience_needed || fullProfile.experience_needed || 1000,
          wellness_stats: fullProfile.wellness_stats || [
            { icon: "🧘", label: "Exploration", value: 0, color: "#4A90E2" },
            { icon: "💚", label: "Courage", value: 0, color: "#2ECC71" },
            { icon: "🤝", label: "Connection", value: 0, color: "#E74C3C" },
            { icon: "⚖️", label: "Balance", value: 0, color: "#F39C12" }
          ],
          primaryTrait: mappedTrait || 'unknown',
          personalityProfile: fullProfile.personality_profile,
          unlocked_tools: myUnlockedTools.map(tool => tool.tool_id) || [],
          coping_tools: myUnlockedTools || [],
          quest_progress: {}, // Empty quest progress in case of error
          rawProfile: fullProfile
        };
        setUserProfile(characterData);
      }
      
    } catch (error) {
      console.error('❌ Failed to load personality home data:', error);
      setError('Failed to load your profile data');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // Load personality-specific stories
  const loadPersonalityStories = useCallback(async () => {
    if (!primaryTrait) return;
    
    try {
      setIsLoadingStories(true);
      setStoryError(null);
      
      
      // Get all available stories from catalog
      const allStories = await apiService.getAvailableStories();
      
      // Check if user is admin for additional debugging
      const userProfile = await apiService.getProfile();
      const isAdmin = userProfile?.username === 'admin';
      if (isAdmin) {
      }
      
      if (!allStories || allStories.length === 0) {
        setStories([]);
        setFilteredStories([]);
        return;
      }
      
      // Log all stories with their personality_focus for debugging
      allStories.forEach(story => {
      });
      
      // Filter stories for this personality trait + introduction story
      const personalityStories = filterStoriesByPersonality(allStories, primaryTrait, false);
      
      
      // FALLBACK: If no stories found, try to include any story that might be an introduction
      if (personalityStories.length === 0) {
        const fallbackStories = allStories.filter((story: any) => {
          // Include any story that might be an introduction or general story
          const isIntroduction = story.id === 12 || story.id === '12' || 
                                story.title?.toLowerCase().includes('introduction') ||
                                story.title?.toLowerCase().includes('intro');
          
          if (isIntroduction) {
            return true;
          }
          
          // Also include stories with no personality focus (general stories)
          if (!story.personality_focus || !Array.isArray(story.personality_focus) || story.personality_focus.length === 0) {
            return true;
          }
          
          return false;
        });
        
        if (fallbackStories.length > 0) {
          personalityStories.push(...fallbackStories);
        }
      }
      
      // Sort stories: Introduction first (ID 12), then all others
      const sortedStories = personalityStories.sort((a, b) => {
        // Introduction story (ID 12) always comes first - check both string and number
        if (a.id === 12 || a.id === '12' || a.title?.toLowerCase().includes('introduction')) return -1;
        if (b.id === 12 || b.id === '12' || b.title?.toLowerCase().includes('introduction')) return 1;
        
        // For all other stories, maintain their original order or sort by ID
        return Number(a.id) - Number(b.id);
      });
      
      
      // Check if we found any stories with matching personality focus
      const personalityMatchedStories = personalityStories.filter(story => 
        story.id !== 12 && story.id !== '12' && !story.title?.toLowerCase().includes('introduction') && // Exclude intro story from this count
        story.personality_focus && 
        Array.isArray(story.personality_focus) && 
        story.personality_focus.length > 0
      );
      
      
      if (personalityMatchedStories.length === 0) {
        
        // Log what personality focuses are actually available
        const availableFoci = new Set();
        allStories.forEach(story => {
          if (story.personality_focus && Array.isArray(story.personality_focus)) {
            story.personality_focus.forEach((focus: string) => availableFoci.add(focus));
          }
        });
      }
      
      setStories(sortedStories);
      setFilteredStories(sortedStories);
      
    } catch (error) {
      console.error('Failed to load personality stories:', error);
      setStoryError('Failed to load stories');
    } finally {
      setIsLoadingStories(false);
    }
  }, [primaryTrait]);

  // Load stories when primary trait is set
  useEffect(() => {
    if (primaryTrait && !isLoading && userProfile) {
      loadPersonalityStories();
    }
  }, [primaryTrait, isLoading, userProfile, loadPersonalityStories]);

  // Fetch data on screen focus - FIXED: Removed circular dependencies
  useFocusEffect(
    useCallback(() => {
      
      // Only fetch data if user is authenticated
      if (!authToken) {
        setIsLoading(false);
        setError('No authentication token');
        return;
      }
      
      // Always fetch fresh data when screen focuses
      // This ensures quest progress is always up-to-date
      fetchHomeScreenData();
      
      // Also force reload stories when screen focuses
      if (primaryTrait && userProfile) {
        loadPersonalityStories();
      }
    }, [authToken]) // Only depend on authToken to prevent infinite loops
  );

  return {
    // Core data
    isLoading,
    error,
    primaryTrait,
    userProfile, // This should now be properly set
    
    // Story data
    stories,
    filteredStories,
    isLoadingStories,
    storyError,
    completedStories,
    
    // Actions
    fetchHomeScreenData,
    loadPersonalityStories,
    
    // Setters
    setStories,
    setFilteredStories,
    setCompletedStories,
  };
};
