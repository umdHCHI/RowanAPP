import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { PersonalityKey, toPersonalityKey } from '../types/personality';

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
  
  // Story-related state
  const [stories, setStories] = useState<any[]>([]);
  const [filteredStories, setFilteredStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [completedStories, setCompletedStories] = useState<string[]>([]);

  // Main data fetching function - FIXED
  const fetchHomeScreenData = useCallback(async () => {
    console.log('=== fetchHomeScreenData called ===');
    
    if (!authToken) {
      setError('No authentication token');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading full profile for personality user...');
      
      // Get the basic profile data (this works)
      const fullProfile = await apiService.getProfile();
      console.log('✅ Full profile loaded:', fullProfile);
      
      // Extract dominant trait from personality profile
      const dominantTrait = fullProfile?.personality_profile?.profile_summary?.dominant_trait;
      const mappedTrait = toPersonalityKey(dominantTrait);
      
      console.log('🎯 Full profile personality_profile:', fullProfile?.personality_profile);
      console.log('🎯 Profile summary:', fullProfile?.personality_profile?.profile_summary);
      console.log('🎯 Original trait:', dominantTrait);
      console.log('🎯 Mapped trait:', mappedTrait);
      
      if (!mappedTrait) {
        console.error('❌ Could not determine personality trait from profile!');
        console.error('❌ This means either:');
        console.error('  1. User has not completed personality survey');
        console.error('  2. Personality data is not in the expected format');
        console.error('  3. Survey submission did not properly save personality data');
        setError('Personality profile not found. Please complete the personality survey first.');
        return;
      }
      
      setPrimaryTrait(mappedTrait);

      // **FIX: Get coping tools but don't block on them**
      let availableCopingTools: any[] = [];
      try {
        availableCopingTools = await apiService.getAvailableCopingTools();
        console.log('✅ Coping tools loaded:', availableCopingTools.length);
      } catch (toolError) {
        console.warn('⚠️ Failed to load coping tools, continuing without them:', toolError);
      }

      try {
        console.log('🚨🚨🚨 REACHED AFTER COPING TOOLS - ABOUT TO LOAD QUEST PROGRESS 🚨🚨🚨');
        console.log('🚨🚨🚨 THIS IS A NEW TEST LOG TO CONFIRM CODE IS RUNNING 🚨🚨🚨');

        // **FIX: Transform quest progress from backend format to frontend format**
        let questProgress: Record<string, number> = {};
        console.log('🔄 TRANSFORMING QUEST PROGRESS FROM BACKEND DATA...');
        
        // The backend returns quest_progress as an array of objects in fullProfile
        const backendQuestProgress = fullProfile.quest_progress || [];
        console.log('Backend quest progress data:', backendQuestProgress);
        
        if (Array.isArray(backendQuestProgress)) {
          // Transform from backend format to frontend format
          backendQuestProgress.forEach((questData: any) => {
            if (questData.quest && questData.quest.quest_id) {
              questProgress[questData.quest.quest_id] = questData.progress || 0;
            }
          });
          
          console.log('✅ Quest progress transformed:', questProgress);
          console.log('✅ Quest progress object keys:', Object.keys(questProgress));
          console.log('✅ Number of quests with progress:', Object.keys(questProgress).length);
        } else {
          console.warn('⚠️ Backend quest_progress is not an array:', backendQuestProgress);
        }
        
        // Log quest progress details for debugging
        if (Object.keys(questProgress).length > 0) {
          console.log('Quest progress details:');
          Object.entries(questProgress).forEach(([questId, progress]) => {
            console.log(`  ${questId}: ${progress}`);
          });
        } else {
          console.log('⚠️ No quest progress found - this might be expected for new users');
        }
        
        // Check if this is a quest from the correct personality type
        const expectedTrait = mappedTrait.toLowerCase();
        Object.entries(questProgress).forEach(([questId, progress]) => {
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch) {
            const questTrait = questTraitMatch[1].toLowerCase();
            console.log(`Quest ${questId}: trait=${questTrait}, user trait=${expectedTrait}, matches=${questTrait === expectedTrait}`);
          }
        });
        
        // **FIX: Build proper character data structure for personality users**
        // Character data is now directly on UserProfile, but personality users may not have character data
        const characterData = {
          // Basic info from profile
          id: fullProfile.id,
          username: fullProfile.username,
          name: fullProfile.username, // Use username as display name
          
          // Character stats (set defaults for personality users)
          level: 1,
          experience: 0,
          experience_needed: 1000,
          
          // **FIX: Create wellness stats for personality users**
          wellness_stats: [
            { icon: "🧘", label: "Exploration", value: 4, color: "#4A90E2" },
            { icon: "💚", label: "Courage", value: 0, color: "#2ECC71" },
            { icon: "🤝", label: "Connection", value: 0, color: "#E74C3C" },
            { icon: "⚖️", label: "Balance", value: 0, color: "#F39C12" }
          ],
          
          // Personality-specific data
          primaryTrait: mappedTrait,
          personalityProfile: fullProfile.personality_profile,
          
          // Tools and progress
          unlocked_tools: availableCopingTools.map(tool => tool.tool_id) || [],
          coping_tools: availableCopingTools || [],
          quest_progress: questProgress,
          
          // Raw profile data for reference
          rawProfile: fullProfile
        };
        
        console.log('✅ Character data built:', characterData);
        
        // **FIX: Actually set the userProfile state**
        setUserProfile(characterData);
        
      } catch (questError) {
        console.error('❌ QUEST PROGRESS LOADING ERROR:', questError);
        console.warn('⚠️ Failed to load quest progress, using empty object:', questError);
        console.log('🏁 QUEST PROGRESS LOADING COMPLETE, RESULT:', {});
        
        // Continue without quest data - set userProfile with empty quest progress in case of error
        const characterData = {
          id: fullProfile.id,
          username: fullProfile.username,
          name: fullProfile.username,
          level: 1,
          experience: 0,
          experience_needed: 1000,
          wellness_stats: [
            { icon: "🧘", label: "Exploration", value: 4, color: "#4A90E2" },
            { icon: "💚", label: "Courage", value: 0, color: "#2ECC71" },
            { icon: "🤝", label: "Connection", value: 0, color: "#E74C3C" },
            { icon: "⚖️", label: "Balance", value: 0, color: "#F39C12" }
          ],
          primaryTrait: mappedTrait,
          personalityProfile: fullProfile.personality_profile,
          unlocked_tools: availableCopingTools.map(tool => tool.tool_id) || [],
          coping_tools: availableCopingTools || [],
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
      console.log('🏁 fetchHomeScreenData complete');
    }
  }, [authToken]);

  // Load personality-specific stories
  const loadPersonalityStories = useCallback(async () => {
    if (!primaryTrait) return;
    
    try {
      setIsLoadingStories(true);
      setStoryError(null);
      
      console.log('📚 Loading stories for trait:', primaryTrait);
      console.log('📚 Primary trait type:', typeof primaryTrait);
      console.log('📚 Primary trait normalized:', primaryTrait.toLowerCase());
      
      // Get all available stories from catalog
      const allStories = await apiService.getAvailableStories();
      console.log('📚 All stories loaded:', allStories?.length || 0);
      
      // Check if user is admin for additional debugging
      const userProfile = await apiService.getProfile();
      const isAdmin = userProfile?.username === 'admin';
      if (isAdmin) {
        console.log('👑 ADMIN USER - Additional debugging info:');
        console.log('👑 User profile:', userProfile);
        console.log('👑 Looking for personality type:', primaryTrait);
      }
      
      if (!allStories || allStories.length === 0) {
        console.log('📚 No stories available from catalog');
        setStories([]);
        setFilteredStories([]);
        return;
      }
      
      // Log all stories with their personality_focus for debugging
      console.log('📚 All stories with personality focus:');
      allStories.forEach(story => {
        console.log(`  Story ${story.id}: "${story.title}"`);
        console.log(`    personality_focus: ${JSON.stringify(story.personality_focus)}`);
        console.log(`    personality_focus type: ${typeof story.personality_focus}`);
        console.log(`    personality_focus is array: ${Array.isArray(story.personality_focus)}`);
      });
      
      // Normalize the user's trait for comparison
      const userTraitNormalized = primaryTrait.toLowerCase().trim();
      console.log('📚 Normalized user trait:', userTraitNormalized);
      
      // Filter stories for this personality trait + introduction story
      const personalityStories = allStories.filter((story: any) => {
        // Always include Introduction story (ID 12)
        if (story.id === 12) {
          console.log(`✅ Including Introduction story: ${story.title}`);
          return true;
        }
        
        // Check if story has personality_focus array
        const storyPersonalityFocus = story.personality_focus;
        
        // If no personality_focus or empty array, it's a general story - EXCLUDE it
        if (!storyPersonalityFocus || !Array.isArray(storyPersonalityFocus) || storyPersonalityFocus.length === 0) {
          console.log(`❌ Excluding general story: ${story.title} (no personality focus)`);
          return false;
        }
        
        // Check if any of the story's personality focus matches the user's trait
        const hasMatch = storyPersonalityFocus.some((focus: string) => {
          const storyFocusNormalized = focus.toLowerCase().trim();
          const matches = storyFocusNormalized === userTraitNormalized;
          console.log(`  Checking focus "${focus}" (normalized: "${storyFocusNormalized}") vs user "${userTraitNormalized}": ${matches}`);
          return matches;
        });
        
        if (hasMatch) {
          console.log(`✅ Including personality-matched story: ${story.title} (focus: ${JSON.stringify(storyPersonalityFocus)})`);
          return true;
        } else {
          console.log(`❌ Excluding non-matching story: ${story.title} (focus: ${JSON.stringify(storyPersonalityFocus)})`);
          return false;
        }
      });
      
      console.log(`📚 Found ${personalityStories.length} stories for ${primaryTrait} (excluding general stories except introduction)`);
      console.log('📚 Story titles:', personalityStories.map(s => s.title));
      console.log('📚 Story IDs and focus:', personalityStories.map(s => ({ id: s.id, title: s.title, focus: s.personality_focus })));
      
      // Sort stories: Introduction first (ID 12), then all others
      const sortedStories = personalityStories.sort((a, b) => {
        // Introduction story (ID 12) always comes first
        if (a.id === 12) return -1;
        if (b.id === 12) return 1;
        
        // For all other stories, maintain their original order or sort by ID
        return a.id - b.id;
      });
      
      console.log('📚 Stories after sorting (Introduction first):', sortedStories.map(s => `${s.id}: ${s.title}`));
      
      // Check if we found any stories with matching personality focus
      const personalityMatchedStories = personalityStories.filter(story => 
        story.id !== 12 && // Exclude intro story from this count
        story.personality_focus && 
        Array.isArray(story.personality_focus) && 
        story.personality_focus.length > 0
      );
      
      console.log(`📚 Stories with actual personality matching: ${personalityMatchedStories.length}`);
      
      if (personalityMatchedStories.length === 0) {
        console.log('⚠️ No stories found with matching personality focus!');
        console.log('⚠️ This suggests either:');
        console.log('  1. No stories exist for this personality type in the backend');
        console.log('  2. The personality_focus values in backend don\'t match the user\'s trait');
        console.log('  3. There\'s a case sensitivity or normalization issue');
        
        // Log what personality focuses are actually available
        const availableFoci = new Set();
        allStories.forEach(story => {
          if (story.personality_focus && Array.isArray(story.personality_focus)) {
            story.personality_focus.forEach((focus: string) => availableFoci.add(focus));
          }
        });
        console.log('📚 All available personality_focus values in backend:', Array.from(availableFoci));
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
    if (primaryTrait && !isLoading) {
      console.log("🔄 Primary trait set, loading stories...");
      loadPersonalityStories();
    }
  }, [primaryTrait, isLoading, loadPersonalityStories]);

  // Fetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log("=== Screen focused - fetching data ===");
      console.log("🔄 Force refreshing all data including quest progress");
      
      // Always fetch fresh data when screen focuses
      // This ensures quest progress is always up-to-date
      fetchHomeScreenData();
    }, [fetchHomeScreenData])
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
