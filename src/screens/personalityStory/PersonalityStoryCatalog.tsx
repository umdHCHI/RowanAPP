import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import {
  Alert,
  BlurView,
  Dimensions,
  Icon,
  LinearGradient,
  ScrollView,
  Story,
  Text,
  TouchableOpacity,
  View
} from "../../imports";

// Import archive service for backend operations
import { PersonalityKey } from "../../imports";
import { apiService } from "../../services/apiService";

const { width } = Dimensions.get("window");

// Personality-specific visual themes
const PersonalityThemes = {
  Openness: {
    primary: '#9d4edd',
    secondary: '#f72585',
    accent: '#4cc9f0',
    background: 'rgba(88, 43, 125, 0.03)',
    cardGradient: ['rgba(157, 78, 221, 0.03)', 'rgba(247, 37, 133, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(247, 37, 133, 0.1)', 'rgba(255, 214, 10, 0.1)'],
      Epic: ['rgba(157, 78, 221, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Common: ['rgba(157, 78, 221, 0.1)', 'rgba(166, 99, 204, 0.1)']
    },
    modalTitle: 'Infinite Possibilities Archive',
    modalSubtitle: 'Explore boundless stories that spark imagination and creativity. Each tale opens new dimensions of thought.',
    atmosphereIcon: 'star',
    skillIcon: 'lightbulb',
    actionText: 'Discover',
    cardStyle: 'cosmic'
  },
  Conscientiousness: {
    primary: '#2a9d8f',
    secondary: '#f4a261',
    accent: '#e76f51',
    background: 'rgba(42, 157, 143, 0.05)',
    cardGradient: ['rgba(42, 157, 143, 0.03)', 'rgba(244, 162, 97, 0.02)', 'rgba(231, 111, 81, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(244, 162, 97, 0.1)', 'rgba(231, 111, 81, 0.1)'],
      Epic: ['rgba(42, 157, 143, 0.1)', 'rgba(244, 162, 97, 0.1)'],
      Rare: ['rgba(42, 157, 143, 0.1)', 'rgba(38, 70, 83, 0.1)'],
      Common: ['rgba(38, 70, 83, 0.1)', 'rgba(42, 157, 143, 0.1)']
    },
    modalTitle: 'Methodical Study Archive',
    modalSubtitle: 'Structured wisdom awaits. Each story builds upon proven techniques for systematic personal growth.',
    atmosphereIcon: 'compass',
    skillIcon: 'target',
    actionText: 'Study',
    cardStyle: 'structured'
  },
  Extraversion: {
    primary: '#f72585',
    secondary: '#ffd60a',
    accent: '#4cc9f0',
    background: 'rgba(247, 37, 133, 0.05)',
    cardGradient: ['rgba(247, 37, 133, 0.03)', 'rgba(255, 214, 10, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(255, 214, 10, 0.1)', 'rgba(247, 127, 0, 0.1)'],
      Epic: ['rgba(247, 37, 133, 0.1)', 'rgba(255, 214, 10, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(247, 37, 133, 0.1)'],
      Common: ['rgba(247, 37, 133, 0.1)', 'rgba(76, 201, 240, 0.1)']
    },
    modalTitle: 'Social Connection Archive',
    modalSubtitle: 'Dynamic stories that energize and inspire. Connect with wisdom that amplifies your vibrant spirit.',
    atmosphereIcon: 'zap',
    skillIcon: 'users',
    actionText: 'Connect',
    cardStyle: 'energetic'
  },
  Agreeableness: {
    primary: '#06ffa5',
    secondary: '#ffffb3',
    accent: '#4cc9f0',
    background: 'rgba(4, 72, 47, 0.05)',
    cardGradient: ['rgba(0, 10, 6, 0.03)', 'rgba(106, 106, 74, 0.02)', 'rgba(24, 59, 70, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(255, 255, 179, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Epic: ['rgba(6, 255, 165, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(6, 255, 165, 0.1)'],
      Common: ['rgba(6, 255, 165, 0.1)', 'rgba(76, 201, 240, 0.1)']
    },
    modalTitle: 'Harmony Gardens Archive',
    modalSubtitle: 'Gentle wisdom flows through these stories. Find peace, understanding, and compassionate growth.',
    atmosphereIcon: 'heart',
    skillIcon: 'shield',
    actionText: 'Embrace',
    cardStyle: 'harmonious'
  },
  Neuroticism: {
    primary: '#7209b7',
    secondary: '#a663cc',
    accent: '#4cc9f0',
    background: 'rgba(114, 9, 183, 0.05)',
    cardGradient: ['rgba(114, 9, 183, 0.03)', 'rgba(166, 99, 204, 0.02)', 'rgba(76, 201, 240, 0.03)'],
    rarityColors: {
      Legendary: ['rgba(166, 99, 204, 0.1)', 'rgba(114, 9, 183, 0.1)'],
      Epic: ['rgba(114, 9, 183, 0.1)', 'rgba(76, 201, 240, 0.1)'],
      Rare: ['rgba(76, 201, 240, 0.1)', 'rgba(114, 9, 183, 0.1)'],
      Common: ['rgba(114, 9, 183, 0.1)', 'rgba(166, 99, 204, 0.1)']
    },
    modalTitle: 'Reflection Chambers Archive',
    modalSubtitle: 'Deep wisdom for profound souls. These stories honor your emotional depth and inner complexity.',
    atmosphereIcon: 'moon',
    skillIcon: 'eye',
    actionText: 'Reflect',
    cardStyle: 'introspective'
  }
};

type PersonalityStoryCatalogProps = {
  primaryTrait: PersonalityKey;
  onStorySelect: (story: Story) => void;
  globalStyles: any;
  onStoryRestart?: () => void;
  userPersonalityTrait?: string; // Optional prop to override backend personality trait fetching
};

const PersonalityStoryCatalog = ({
  primaryTrait,
  onStorySelect,
  globalStyles,
  onStoryRestart,
  userPersonalityTrait
}: PersonalityStoryCatalogProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = PersonalityThemes[primaryTrait];

  // Function to restart story progress for testing
  const restartStoryProgress = async () => {
    console.log('=== RESTARTING STORY PROGRESS ===');
    try {
      // Get all available stories
      const allStories = await apiService.getAvailableStories();
      console.log('Found stories to restart:', allStories?.length || 0);
      
      if (allStories && allStories.length > 0) {
        let successCount = 0;
        let failCount = 0;
        
        // Restart each story
        for (const story of allStories) {
          try {
            console.log(`🔄 Restarting story: ${story.id} - ${story.title}`);
            
            // Call the restart endpoint
            const restartResponse = await apiService.restartStory(story.id);
            console.log(`✅ Successfully restarted story ${story.id}:`, restartResponse);
            successCount++;
            
            // Add a small delay to avoid overwhelming the backend
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.warn(`⚠️ Failed to restart story ${story.id}:`, error);
            failCount++;
          }
        }
        
        console.log(`📊 Restart Summary: ${successCount} successful, ${failCount} failed`);
        
        // Clear any cached story progress data
        console.log('🧹 Clearing cached story data...');
        
        // Also try to clear story progress records for each story
        for (const story of allStories) {
          try {
            console.log(`🧹 Clearing progress for story ${story.id}...`);
            // Try to get and clear story progress
            const progressRecords = await apiService.getStoryProgressRecords(story.id.toString());
            console.log(`Found ${progressRecords?.length || 0} progress records for story ${story.id}`);
            
            // If there are progress records, we could potentially delete them
            // For now, just log that we found them
            if (progressRecords && progressRecords.length > 0) {
              console.log(`📝 Progress records found for story ${story.id}:`, progressRecords);
            }
          } catch (progressError) {
            console.warn(`⚠️ Could not check progress for story ${story.id}:`, progressError);
          }
        }
        
        // Clear frontend state by resetting the stories
        console.log('🔄 Clearing frontend story state...');
        setStories([]);
        
        // Force a complete reload by clearing and reloading
        console.log('🔄 Force reloading stories after restart...');
        
        // Clear any cached data in AsyncStorage that might be related to story progress
        let allKeys: readonly string[] = [];
        try {
          allKeys = await AsyncStorage.getAllKeys();
          const storyProgressKeys = allKeys.filter((key: string) => 
            key.includes('story') || 
            key.includes('progress') || 
            key.includes('passage') ||
            key.includes('current') ||
            key.includes('chapter') ||
            key.includes('choice')
          );
          if (storyProgressKeys.length > 0) {
            console.log('🧹 Clearing AsyncStorage keys:', storyProgressKeys);
            await AsyncStorage.multiRemove(storyProgressKeys);
          }
        } catch (storageError) {
          console.warn('⚠️ Could not clear AsyncStorage:', storageError);
        }
        
        // Force a complete state reset
        console.log('🔄 Forcing complete state reset...');
        
        // Clear any story-related state that might be cached
        try {
          // Clear any cached story data
          const storyCacheKeys = allKeys.filter((key: string) => 
            key.includes('storyState') || 
            key.includes('currentPassage') || 
            key.includes('storyProgress') ||
            key.includes('storyEngine')
          );
          if (storyCacheKeys.length > 0) {
            console.log('🧹 Clearing story cache keys:', storyCacheKeys);
            await AsyncStorage.multiRemove(storyCacheKeys);
          }
        } catch (cacheError) {
          console.warn('⚠️ Could not clear story cache:', cacheError);
        }
        
        // Reload the stories to reflect the reset progress
        let userPrimaryTrait: string | null = null;
        
        if (userPersonalityTrait) {
          console.log("Using passed userPersonalityTrait for restart:", userPersonalityTrait);
          userPrimaryTrait = userPersonalityTrait;
        } else {
          console.log("No userPersonalityTrait passed for restart, fetching from backend");
          userPrimaryTrait = await apiService.getUserPrimaryPersonalityTrait();
        }
        
        const effectivePersonalityTrait = userPrimaryTrait || primaryTrait?.toLowerCase();
        
        // Get personality-filtered stories
        let backendStories;
        try {
          backendStories = await apiService.getStoriesByPersonality(effectivePersonalityTrait || undefined, true);
        } catch (personalityError) {
          backendStories = await apiService.getAvailableStories();
        }
        
        if (backendStories && backendStories.length > 0) {
          // Load fresh progress records after restart
          let allProgressRecords: any[] = [];
          try {
            allProgressRecords = await apiService.getStoryProgressRecords('');
            console.log("Fresh progress records after restart:", allProgressRecords?.length || 0);
          } catch (progressError) {
            console.warn("Failed to load fresh progress records:", progressError);
          }
          
          // Update stories with fresh progress data
          const storiesWithFreshProgress = backendStories.map((story: any) => {
            // Find fresh progress for this story
            const storyProgress = allProgressRecords.find((progress: any) => 
              progress.story === story.id || progress.story === parseInt(story.id)
            );
            
            console.log(`Story ${story.id} fresh progress after restart:`, storyProgress);
            
            // Reset exploration to 0 since we just restarted
            const exploration = 0;
            const revelations = 0;
            
            return {
              ...story,
              exploration: exploration,
              revelations: revelations
            };
          });
          
          setStories(storiesWithFreshProgress);
        } else {
          setStories([]);
        }
        
        console.log('✅ All stories restarted and reloaded');
        
        // Notify parent component that restart happened
        if (onStoryRestart) {
          onStoryRestart();
        }
        
        // Show a comprehensive alert with instructions
        alert(`Story restart complete!\n✅ ${successCount} stories restarted successfully\n⚠️ ${failCount} stories failed to restart\n\nIMPORTANT: To see the reset effect:\n1. Close any open story modals\n2. Navigate away from this screen and back\n3. Or refresh the page completely\n\nThe backend has been reset, but you may need to refresh the UI to see the changes.`);
        
      } else {
        console.log('No stories found to restart');
        alert('No stories found to restart');
      }
    } catch (error: any) {
      console.error('❌ Failed to restart stories:', error);
      alert(`Failed to restart stories: ${error?.message || 'Unknown error'}`);
    }
  };

  // Debug function to test personality matching
  const debugPersonalityMatching = async () => {
    console.log('=== DEBUGGING PERSONALITY MATCHING ===');
    try {
      // Use the passed userPersonalityTrait if available, otherwise fetch from backend
      let userPrimaryTrait: string | null = null;
      
      if (userPersonalityTrait) {
        console.log("Using passed userPersonalityTrait for debug:", userPersonalityTrait);
        userPrimaryTrait = userPersonalityTrait;
      } else {
        console.log("No userPersonalityTrait passed for debug, fetching from backend");
        // Get user's primary personality trait
        userPrimaryTrait = await apiService.getUserPrimaryPersonalityTrait();
      }
      
      console.log('User primary trait:', userPrimaryTrait);
      
      // Get all stories
      const allStories = await apiService.getAvailableStories();
      console.log('Total stories available:', allStories?.length || 0);
      
      // Find conscientiousness stories
      const conscientiousnessStories = allStories.filter((story: any) => 
        story.personality_focus && 
        Array.isArray(story.personality_focus) && 
        story.personality_focus.some((focus: string) => 
          focus.toLowerCase().includes('conscientiousness')
        )
      );
      console.log('Conscientiousness stories found:', conscientiousnessStories.length);
      
      // Test each conscientiousness story
      for (const story of conscientiousnessStories) {
        console.log(`\n--- Testing Story ${story.id}: "${story.title}" ---`);
        console.log('Story personality_focus:', story.personality_focus);
        
        if (userPrimaryTrait) {
          const isMatch = await apiService.doesPersonalityMatch(userPrimaryTrait, story.personality_focus);
          console.log(`Match result: ${isMatch}`);
        }
      }
      
      // Test the filtering function
      console.log('\n--- Testing Filtering Function ---');
      const filteredStories = await apiService.getStoriesByPersonality(userPrimaryTrait || undefined, true);
      console.log('Filtered stories count:', filteredStories?.length || 0);
      console.log('Filtered story IDs:', filteredStories.map((s: any) => s.id));
      
      alert(`Debug complete!\nUser trait: ${userPrimaryTrait}\nConscientiousness stories: ${conscientiousnessStories.length}\nFiltered stories: ${filteredStories?.length || 0}\nCheck console for details.`);
      
    } catch (error) {
      console.error('Debug failed:', error);
      alert(`Debug failed: ${error}`);
    }
  };

  // Load stories from backend on mount
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading stories for personality type:", primaryTrait);
        
        // Use the passed userPersonalityTrait if available, otherwise fetch from backend
        let userPrimaryTrait: string | null = null;
        
        if (userPersonalityTrait) {
          console.log("Using passed userPersonalityTrait:", userPersonalityTrait);
          userPrimaryTrait = userPersonalityTrait;
        } else {
          console.log("No userPersonalityTrait passed, fetching from backend");
          // Get user's primary personality trait
          userPrimaryTrait = await apiService.getUserPrimaryPersonalityTrait();
        }
        
        console.log("User primary personality trait:", userPrimaryTrait);
        console.log("User primary personality trait type:", typeof userPrimaryTrait);
        console.log("User primary personality trait length:", userPrimaryTrait?.length);
        
        // For testing: if no personality trait is detected, use the primaryTrait prop
        const effectivePersonalityTrait = userPrimaryTrait || primaryTrait?.toLowerCase();
        console.log("Effective personality trait for filtering:", effectivePersonalityTrait);
        
        // Get personality-filtered stories
        let backendStories;
        try {
          // Use the improved personality filtering
          backendStories = await apiService.getStoriesByPersonality(effectivePersonalityTrait || undefined, true);
          console.log("Personality-filtered stories loaded:", backendStories?.length || 0);
          
          if (backendStories && backendStories.length > 0) {
            console.log("Story details:");
            backendStories.forEach((story: any) => {
              console.log(`- Story ${story.id}: "${story.title}" (personality_focus: ${JSON.stringify(story.personality_focus)})`);
            });
          }
        } catch (personalityError) {
          console.warn("Personality filtering failed, falling back to catalog:", personalityError);
          // Fallback to all stories from catalog
          backendStories = await apiService.getAvailableStories();
          console.log("Fallback catalog stories loaded:", backendStories?.length || 0);
        }
        
        if (backendStories && backendStories.length > 0) {
          // Load all user progress records to calculate exploration for each story
          let allProgressRecords: any[] = [];
          try {
            allProgressRecords = await apiService.getStoryProgressRecords('');
            console.log("Loaded progress records:", allProgressRecords?.length || 0);
          } catch (progressError) {
            console.warn("Progress tracking failed, exploration will be 0:", progressError);
          }
          
          // For stories with chapters, try to load their chapter data with passages
          const storiesWithChapters = await Promise.all(
            backendStories.map(async (story: any) => {
              // Calculate exploration progress for this story
              let exploration = 0;
              let revelations = 0;
              
              try {
                // Find progress for this specific story
                const storyProgress = allProgressRecords.find((progress: any) => 
                  progress.story === story.id || progress.story === parseInt(story.id)
                );
                
                console.log(`Story ${story.id} progress:`, storyProgress);
                
                if (storyProgress) {
                  // Calculate exploration based on passages visited vs total passages
                  if (story.chapter_count && story.chapter_count > 0) {
                    // For chapter-based stories, we need to count total passages across all chapters
                    try {
                      const chapters = await apiService.getChapters(story.id);
                      let totalPassages = 0;
                      
                      if (chapters && chapters.length > 0) {
                        // Count passages in each chapter
                        for (const chapter of chapters) {
                          try {
                            const chapterPassages = await apiService.getChapterPassages(story.id, chapter.id);
                            totalPassages += chapterPassages?.length || 0;
                          } catch (error) {
                            // Failed to count passages for this chapter
                          }
                        }
                      }
                      
                      const visitedPassages = storyProgress.passages_visited_count || 0;
                      exploration = totalPassages > 0 ? Math.round((visitedPassages / totalPassages) * 100) : 0;
                      console.log(`Story ${story.id} exploration: ${visitedPassages}/${totalPassages} = ${exploration}%`);
                    } catch (error) {
                      // Fallback: use progress percentage if available
                      exploration = storyProgress.progress_percentage || 0;
                      console.log(`Story ${story.id} fallback exploration: ${exploration}%`);
                    }
                  } else {
                    // For non-chapter stories, try to get total passages directly
                    try {
                      const storyPassages = await apiService.getStorypassages(story.id);
                      const totalPassages = storyPassages?.passages?.length || 0;
                      const visitedPassages = storyProgress.passages_visited_count || 0;
                      exploration = totalPassages > 0 ? Math.round((visitedPassages / totalPassages) * 100) : 0;
                      console.log(`Story ${story.id} exploration: ${visitedPassages}/${totalPassages} = ${exploration}%`);
                    } catch (error) {
                      // Fallback: use progress percentage if available
                      exploration = storyProgress.progress_percentage || 0;
                      console.log(`Story ${story.id} fallback exploration: ${exploration}%`);
                    }
                  }
                  
                  // Calculate revelations (choices made)
                  revelations = storyProgress.choices_made_count || 0;
                  
                  // If story is completed, set exploration to 100%
                  if (storyProgress.is_completed) {
                    exploration = 100;
                    console.log(`Story ${story.id} is completed, setting exploration to 100%`);
                  }
                } else {
                  console.log(`No progress found for story ${story.id}`);
                }
              } catch (error) {
                console.warn(`Error calculating exploration for story ${story.id}:`, error);
              }
              
              // Load chapter data if story has chapters
              if (story.chapter_count && story.chapter_count > 0) {
                try {
                  console.log(`Loading chapters for story ${story.id} (${story.chapter_count} chapters)`);
                  const chapters = await apiService.getChapters(story.id);
                  console.log(`Loaded ${chapters?.length || 0} chapters for story ${story.id}`);
                  
                  // Load passages for each chapter
                  const chaptersWithPassages = await Promise.all(
                    (chapters || []).map(async (chapter: any) => {
                      try {
                        console.log(`Loading passages for chapter ${chapter.id}`);
                        const passages = await apiService.getChapterPassages(story.id, chapter.id);
                        console.log(`Loaded ${passages?.length || 0} passages for chapter ${chapter.id}`);
                        
                        return {
                          ...chapter,
                          passages: passages || []
                        };
                      } catch (error) {
                        console.warn(`Failed to load passages for chapter ${chapter.id}:`, error);
                        return {
                          ...chapter,
                          passages: []
                        };
                      }
                    })
                  );
                  
                  return {
                    ...story,
                    chapters: chaptersWithPassages,
                    exploration: exploration,
                    revelations: revelations
                  };
                } catch (error) {
                  console.warn(`Failed to load chapters for story ${story.id}:`, error);
                  return {
                    ...story,
                    exploration: exploration,
                    revelations: revelations
                  };
                }
              }
              
              return {
                ...story,
                exploration: exploration,
                revelations: revelations
              };
            })
          );
          
          // Sort stories in custom order: Introduction, The Whispering Stacks (personality variant), Tea with The Curator
          const sortedStories = storiesWithChapters.sort((a, b) => {
            // Custom story ordering by ID: Introduction (12), The Whispering Stacks variants, Tea with The Curator (2)
            const storyOrder = {
              12: 1, // Introduction
              2: 3   // Tea with The Curator
            };
            
            // Handle The Whispering Stacks variants (IDs 21-26)
            let orderA = storyOrder[a.id as keyof typeof storyOrder] || 999;
            let orderB = storyOrder[b.id as keyof typeof storyOrder] || 999;
            
            // If it's a Whispering Stacks variant (title contains "The Whispering Stacks"), give it order 2
            if (a.title && a.title.includes('The Whispering Stacks')) {
              orderA = 2;
            }
            if (b.title && b.title.includes('The Whispering Stacks')) {
              orderB = 2;
            }
            
            return orderA - orderB;
          });
          
          console.log('Stories with chapters and progress loaded:', sortedStories.length);
          setStories(sortedStories);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Failed to load stories from the Archive:", error);
        setError("Failed to load stories from the Archive");
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [primaryTrait, userPersonalityTrait]);
  const getRarityColors = (rarity: string): readonly [string, string] => {
    const colors = theme.rarityColors[rarity as keyof typeof theme.rarityColors] || theme.rarityColors.Common;
    return [colors[0], colors[1]] as const;
  };

  const getRarityGlow = (rarity: string): string => {
    const colors = getRarityColors(rarity);
    return `${colors[0]}40`; // Add transparency
  };

  const getCardStyleOverrides = () => {
    const baseOverrides = {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };

    switch (theme.cardStyle) {
      case 'cosmic':
        return {
          ...baseOverrides,
          borderRadius: 16,
        };
      case 'structured':
        return {
          ...baseOverrides,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: theme.primary,
        };
      case 'energetic':
        return {
          ...baseOverrides,
          borderRadius: 20,
        };
      case 'harmonious':
        return {
          ...baseOverrides,
          borderRadius: 24,
          shadowOpacity: 0.2,
        };
      case 'introspective':
        return {
          ...baseOverrides,
          borderRadius: 12,
          shadowColor: theme.secondary,
          shadowOpacity: 0.4,
        };
      default:
        return baseOverrides;
    }
  };

  const StoryCard = ({ story }: { story: Story }) => {
    const cardOverrides = getCardStyleOverrides();
    
    return (
      <TouchableOpacity
        style={[
          globalStyles.personalityStoryCard, 
          { opacity: story.isLocked ? 0.6 : 1 },
          cardOverrides
        ]}
        onPress={() => !story.isLocked && onStorySelect(story)}
        activeOpacity={story.isLocked ? 1 : 0.8}
        disabled={story.isLocked}
      >
        <LinearGradient
          colors={[theme.cardGradient[0], theme.cardGradient[1]]} 
          style={[globalStyles.personalityStoryCardGradient, { borderRadius: (cardOverrides as any)?.borderRadius }]}
        >
          <BlurView intensity={theme.cardStyle === 'harmonious' ? 8 : 5} style={globalStyles.personalityStoryCardBlur}>
            {/* Personality-specific Rarity Border */}
            <LinearGradient
              colors={getRarityColors(story.rarity || "Common")}
              style={[
                globalStyles.personalityStoryRarityBorder,
                { 
                  borderRadius: (cardOverrides as any).borderRadius,
                  shadowColor: getRarityGlow(story.rarity || "Common"),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1, // Reduce shadow opacity
                  shadowRadius: 2, // Reduce shadow radius
                }
              ]}
            />

            {/* Lock Overlay */}
            {story.isLocked && (
              <View style={globalStyles.personalityStoryLockOverlay}>
                <LinearGradient
                  colors={["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.6)"]}
                  style={globalStyles.personalityStoryLockGradient}
                >
                  <Icon name="lock" size={24} color={theme.primary} />
                  <Text
                    style={[globalStyles.personalityStoryLockText, { color: theme.primary }]}
                  >
                    Level {story.unlockLevel || 1} Required
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Header with Personality Colors */}
            <View style={globalStyles.personalityStoryCardHeader}>
              <View style={globalStyles.personalityStoryTitleSection}>
                <Text style={[globalStyles.personalityStoryCardTitle, { color: theme.primary }]}>
                  {story.title || "Untitled Story"}
                </Text>
                <Text
                  style={[globalStyles.personalityStoryCardCategory, { color: theme.secondary }]}
                >
                  {story.category || "Unknown Category"}
                </Text>
              </View>

              <View style={globalStyles.personalityStoryRarityBadge}>
                <LinearGradient
                  colors={getRarityColors(story.rarity || "Common")}
                  style={globalStyles.personalityStoryRarityBadgeGradient}
                >
                  <Text style={globalStyles.personalityStoryRarityBadgeText}>
                    {story.rarity || "Common"}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Progress Indicator with Personality Colors */}
            {(story.exploration || 0) > 0 && (
              <View style={globalStyles.personalityStoryProgressSection}>
                <View style={globalStyles.personalityStoryProgressHeader}>
                  <Icon name="compass" size={12} color={theme.accent} />
                  <Text
                    style={[
                      globalStyles.personalityStoryProgressLabel,
                      { color: theme.accent },
                    ]}
                  >
                    Exploration: {story.exploration || 0}%
                  </Text>
                </View>
                <View style={globalStyles.personalityStoryProgressBar}>
                  <LinearGradient
                    colors={[theme.accent, theme.primary]}
                    style={[
                      globalStyles.personalityStoryProgressFill,
                      { width: `${story.exploration || 0}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Description */}
            <Text style={[globalStyles.personalityStoryDescription, { color: "#E5E7EB" }]}>
              {story.description || "No description available"}
            </Text>

            {/* Atmosphere with Personality Icon */}
            <View style={globalStyles.personalityStoryAtmosphereContainer}>
              <Icon name={theme.atmosphereIcon} size={10} color={theme.accent} />
              <Text
                style={[globalStyles.personalityStoryAtmosphereText, { color: theme.accent }]}
              >
                ✦ {story.atmosphere || "Mysterious atmosphere"} ✦
              </Text>
            </View>

            {/* Skill Focus Tags with Personality Colors */}
            <View style={globalStyles.personalityStorySkillFocusContainer}>
              <Text
                style={[globalStyles.personalityStorySkillFocusLabel, { color: theme.secondary }]}
              >
                Coping Skills:
              </Text>
              <View style={globalStyles.personalityStorySkillTags}>
                {(story.skillFocus || ["General Wellness"]).slice(0, 2).map((skill, index) => (
                  <View key={index} style={[globalStyles.personalityStorySkillTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}>
                    <Text style={[globalStyles.personalityStorySkillTagText, { color: theme.primary }]}>{skill}</Text>
                  </View>
                ))}
                {(story.skillFocus || []).length > 2 && (
                  <View style={[globalStyles.personalityStorySkillTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}>
                    <Text style={[globalStyles.personalityStorySkillTagText, { color: theme.primary }]}>
                      +{(story.skillFocus || []).length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stat Boosts with Personality Colors */}
            <View style={globalStyles.personalityStoryStatBoostsContainer}>
              <Text
                style={[globalStyles.personalityStoryStatBoostsLabel, { color: theme.secondary }]}
              >
                Strengthens:
              </Text>
              <View style={globalStyles.personalityStoryStatBoostTags}>
                {(story.statBoosts || ["General Growth"]).map((stat, index) => (
                  <View key={index} style={globalStyles.personalityStoryStatBoostTag}>
                    <Icon name={theme.skillIcon} size={8} color={theme.accent} />
                    <Text
                      style={[
                        globalStyles.personalityStoryStatBoostText,
                        { color: theme.accent },
                      ]}
                    >
                      {stat}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Footer Info with Personality Colors */}
            <View style={globalStyles.personalityStoryFooter}>
              <View style={globalStyles.personalityStoryFooterStat}>
                <Icon name="clock" size={12} color={theme.secondary} />
                <Text
                  style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
                >
                  {story.timeToComplete || "10-15 min"}
                </Text>
              </View>
              <View style={globalStyles.personalityStoryFooterStat}>
                <Icon name="key" size={12} color={theme.primary} />
                <Text
                  style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
                >
                  {story.revelations || 1} revelations
                </Text>
              </View>
              <View style={globalStyles.personalityStoryFooterStat}>
                <Icon name="zap" size={12} color={theme.accent} />
                <Text
                  style={[globalStyles.personalityStoryFooterStatText, { color: "#D1D5DB" }]}
                >
                  {story.difficulty || "Intermediate"}
                </Text>
              </View>
            </View>

            {/* Action Button with Personality Styling */}
            {!story.isLocked && (
              <View style={globalStyles.personalityStoryActionButton}>
                <LinearGradient
                  colors={[theme.primary, theme.secondary]}
                  style={[globalStyles.personalityStoryActionButtonGradient, { borderRadius: theme.cardStyle === 'harmonious' ? 16 : 8 }]}
                >
                  <Icon name="book-open" size={14} color="#ffffff" />
                  <Text style={[globalStyles.personalityStoryActionButtonText, { color: "#ffffff" }]}>
                    {(story.exploration || 0) > 0
                      ? `Continue ${theme.actionText}`
                      : `${theme.actionText} Story`}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Loading state with personality colors
  if (isLoading) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Icon
          name="loader"
          size={40}
          color={theme.primary}
          style={{ marginBottom: 16 }}
        />
        <Text style={{ color: "white", fontSize: 18, margin: 20 }}>
          Loading Stories from {theme.modalTitle}...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={globalStyles.personalityCentered}>
        <Icon
          name="alert-circle"
          size={40}
          color="#EF4444"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            color: "white",
            fontSize: 18,
            margin: 20,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setIsLoading(true);
            // Retry loading
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);
          }}
          style={{
            padding: 20,
            backgroundColor: theme.primary,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.personalityStoryCatalogContainer}>
      {/* Header with Personality Theming */}
      <View style={globalStyles.personalityStoryCatalogHeader}>
        <View style={globalStyles.personalityStoryHeaderContent}>
          <Icon name="book" size={24} color={theme.primary} />
          <Text
            style={[
              globalStyles.personalityStoryCatalogTitle,
              { color: theme.primary },
            ]}
          >
            {theme.modalTitle}
          </Text>
        </View>
        <Text
          style={[
            globalStyles.personalityStoryCatalogSubtitle,
            { color: theme.secondary },
          ]}
        >
          {theme.modalSubtitle}
        </Text>
        {/* Restart Story button for testing */}
        <TouchableOpacity
          onPress={restartStoryProgress}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: theme.primary,
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>Restart</Text>
        </TouchableOpacity>
        
        {/* Debug button for testing personality matching */}
        <TouchableOpacity
          onPress={debugPersonalityMatching}
          style={{
            position: 'absolute',
            top: 40,
            right: 10,
            backgroundColor: theme.secondary,
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>Debug</Text>
        </TouchableOpacity>
        
        {/* Debug button for testing story filtering */}
        <TouchableOpacity
          onPress={async () => {
            try {
              const debugInfo = await apiService.debugStoryFiltering();
              console.log('=== PERSONALITY STORY FILTERING DEBUG INFO ===');
              console.log('Total stories:', debugInfo.totalStories);
              console.log('Character stories:', debugInfo.characterStories);
              console.log('Personality stories:', debugInfo.personalityStories);
              console.log('User trait:', debugInfo.userTrait);
              console.log('Character story titles:', debugInfo.characterStoryTitles);
              console.log('Personality story titles:', debugInfo.personalityStoryTitles);
              console.log('All story details:', debugInfo.allStoryDetails);
              Alert.alert(
                'Personality Story Filtering Debug',
                `Total: ${debugInfo.totalStories}\nCharacter: ${debugInfo.characterStories}\nPersonality: ${debugInfo.personalityStories}\nUser Trait: ${debugInfo.userTrait || 'None'}\n\nCheck console for details.`
              );
            } catch (error) {
              console.error('Debug failed:', error);
              Alert.alert('Debug Failed', 'Check console for error details.');
            }
          }}
          style={{
            position: 'absolute',
            top: 70,
            right: 10,
            backgroundColor: theme.primary,
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Story Grid */}
      <ScrollView
        style={globalStyles.personalityStoryScrollView}
        contentContainerStyle={globalStyles.personalityStoryGrid}
        showsVerticalScrollIndicator={false}
      >
        {stories.length > 0 ? (
          stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Icon
              name="book"
              size={40}
              color={theme.primary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: theme.primary,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              No Stories Available
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 14,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              The {theme.modalTitle} is currently empty. Check back later for new
              wisdom to discover.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PersonalityStoryCatalog; 