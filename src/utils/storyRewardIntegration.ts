// ===== STORY REWARD INTEGRATION GUIDE =====
// This file demonstrates how to integrate the new reward system into StoryScreen
// Works with the actual backend data structure where rewards are in effects field

import { getGearMapping, getGearTypeId } from '../assets/equipment';
import { Choice, Passage, SavedRewards } from '../types/story';
import {
    applyChoiceRewards,
    applyPassageRewards,
    calculateTotalRewards,
    createNotificationFromEffects,
    handleStoryCompletionRewards,
    hasChoiceRewards,
    hasPassageRewards,
    initializeRewardTracker,
    StoryRewardTracker
} from './rewardsUtils';

// ===== INTEGRATION EXAMPLE FOR STORYSCREEN =====

export class StoryRewardManager {
  private rewardTracker: StoryRewardTracker;
  private showNotification: (message: string, type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact') => void;
  private onStoryComplete: (completionData: any) => void;
  private apiService: any;
  private characterId: number;
  private processedPassages: Set<string> = new Set(); // Track processed passages to avoid duplicates
  private processedChoices: Set<string> = new Set(); // Track processed choices to avoid duplicates

  constructor(
    storyId: string, 
    showNotification: (message: string, type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact') => void,
    onStoryComplete: (completionData: any) => void,
    apiService: any,
    characterId: number
  ) {
    console.log('=== STORY REWARD MANAGER CONSTRUCTOR ===');
    console.log('Story ID:', storyId);
    console.log('Character ID:', characterId);
    console.log('Character ID type:', typeof characterId);
    console.log('API Service available:', !!apiService);
    
    this.rewardTracker = initializeRewardTracker(storyId);
    this.showNotification = showNotification;
    this.onStoryComplete = onStoryComplete;
    this.apiService = apiService;
    this.characterId = characterId;
    
    console.log('=== STORY REWARD MANAGER INITIALIZED ===');
    console.log('Final character ID:', this.characterId);
    console.log('Final character ID type:', typeof this.characterId);
  }

  // Call this when visiting a passage
  async handlePassageVisit(passage: Passage): Promise<void> {
    console.log('=== HANDLING PASSAGE VISIT ===');
    console.log('Passage ID:', passage.passage_id);
    console.log('Passage story_effects:', passage.story_effects);
    console.log('Has rewards:', hasPassageRewards(passage));
    
    // ✅ Check if this passage has already been processed
    if (this.processedPassages.has(passage.passage_id)) {
      console.log('Passage already processed, skipping:', passage.passage_id);
      return;
    }
    
    if (hasPassageRewards(passage)) {
      console.log('Passage effects:', passage.story_effects);
      this.rewardTracker = applyPassageRewards(this.rewardTracker, passage);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ SAVE GEAR REWARDS IMMEDIATELY (but not stats/experience to avoid double-counting)
      // Gear rewards should be saved immediately so they appear in inventory
      if (passage.story_effects.rewards || passage.story_effects.artifacts) {
        console.log('=== SAVING GEAR REWARDS IMMEDIATELY ===');
        await this.saveGearRewardsToBackend(passage.story_effects, 'passage');
      }
      
      // Show floating notifications for each reward
      const notifications = createNotificationFromEffects(passage.story_effects);
      console.log('Created notifications:', notifications);
      notifications.forEach(notification => {
        this.showNotification(notification.message, notification.type);
      });
    } else {
      console.log('No rewards found in passage');
    }
    
    // Mark this passage as processed
    this.processedPassages.add(passage.passage_id);
  }

  // Call this when making a choice
  async handleChoiceMade(choice: Choice, passageId: string): Promise<void> {
    console.log('=== HANDLING CHOICE MADE ===');
    console.log('Choice ID:', choice.id);
    console.log('Choice effects:', choice.effects);
    console.log('Has rewards:', hasChoiceRewards(choice));
    
    // ✅ Check if this choice has already been processed
    const choiceKey = `${passageId}_choice_${choice.id}`;
    if (this.processedChoices.has(choiceKey)) {
      console.log('Choice already processed, skipping:', choiceKey);
      return;
    }
    
    if (hasChoiceRewards(choice)) {
      console.log('Choice effects:', choice.effects);
      this.rewardTracker = applyChoiceRewards(this.rewardTracker, choice, passageId);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ SAVE GEAR REWARDS IMMEDIATELY (but not stats/experience to avoid double-counting)
      // Gear rewards should be saved immediately so they appear in inventory
      if (choice.effects.rewards || choice.effects.artifacts) {
        console.log('=== SAVING GEAR REWARDS IMMEDIATELY ===');
        await this.saveGearRewardsToBackend(choice.effects, 'choice');
      }
      
      // Show floating notifications for each reward
      const notifications = createNotificationFromEffects(choice.effects);
      console.log('Created notifications:', notifications);
      notifications.forEach(notification => {
        this.showNotification(notification.message, notification.type);
      });
    } else {
      console.log('No rewards found in choice');
    }
    
    // Mark this choice as processed
    this.processedChoices.add(choiceKey);
  }

  // Save rewards to backend using your API endpoints
  private async saveRewardsToBackend(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
    try {
      console.log('=== SAVING REWARDS TO BACKEND ===');
      console.log('Effects:', effects);
      console.log('Source:', source);
      console.log('Character ID:', this.characterId);

      // Save experience gains
      let experienceToSave = 0;
      
      // Check for experience directly in effects
      if (effects.experience) {
        console.log('Processing experience directly:', effects.experience);
        const expValue = typeof effects.experience === 'number' 
          ? effects.experience 
          : parseInt(effects.experience as string, 10);
        
        console.log(`Experience value: ${effects.experience}, Parsed: ${expValue}`);
        
        if (!isNaN(expValue) && expValue > 0) {
          experienceToSave += expValue;
        } else {
          console.log(`Invalid experience value: ${effects.experience}`);
        }
      }
      
      // Check for experience in stats object
      if (effects.stats && effects.stats.experience) {
        console.log('Processing experience from stats:', effects.stats.experience);
        const expValue = typeof effects.stats.experience === 'number' 
          ? effects.stats.experience 
          : parseInt(effects.stats.experience as string, 10);
        
        console.log(`Experience from stats: ${effects.stats.experience}, Parsed: ${expValue}`);
        
        if (!isNaN(expValue) && expValue > 0) {
          experienceToSave += expValue;
        } else {
          console.log(`Invalid experience value from stats: ${effects.stats.experience}`);
        }
      }
      
      // Save total experience
      if (experienceToSave > 0) {
        console.log(`Saving total ${experienceToSave} experience to backend...`);
        const expResult = await this.apiService.gainExperience(
          this.characterId, 
          experienceToSave, 
          `story_${source}`
        );
        console.log('Experience saved:', expResult);
      } else {
        console.log('No experience to save');
      }

      // Save wellness stats
      if (effects.stats) {
        console.log('Processing stats for wellness:', effects.stats);
        const wellnessStats: any = {};
        Object.entries(effects.stats).forEach(([stat, value]) => {
          const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
          console.log(`Stat: ${stat}, Value: ${value}, Parsed: ${numValue}`);
          if (!isNaN(numValue) && numValue > 0) {
            // Map story stats to wellness stats (exclude experience as it's handled separately)
            if (['awareness', 'resilience', 'connection', 'balance'].includes(stat) && stat !== 'experience') {
              wellnessStats[stat] = numValue;
              console.log(`Added wellness stat: ${stat} = ${numValue}`);
            } else {
              console.log(`Skipping non-wellness stat: ${stat}`);
            }
          } else {
            console.log(`Invalid stat value: ${stat} = ${value}`);
          }
        });

        if (Object.keys(wellnessStats).length > 0) {
          console.log('Saving wellness stats to backend:', wellnessStats);
          const wellnessResult = await this.apiService.gainWellness(this.characterId, wellnessStats);
          console.log('Wellness stats saved:', wellnessResult);
        } else {
          console.log('No valid wellness stats to save');
        }
      } else {
        console.log('No stats found in effects');
      }

      // Save gear/items
      if (effects.rewards || effects.artifacts) {
        const items = [...(effects.rewards || []), ...(effects.artifacts || [])];
        for (const itemName of items) {
          try {
            console.log(`Attempting to acquire gear: ${itemName}`);
            // For now, we'll use a simple mapping approach
            // In a real implementation, you'd have a mapping table
            const gearTypeId = this.mapItemNameToGearTypeId(itemName);
            if (gearTypeId) {
              const gearResult = await this.apiService.acquireGear(gearTypeId);
              console.log(`Gear acquired: ${itemName}`, gearResult);
            } else {
              console.log(`No gear type mapping found for: ${itemName}`);
            }
          } catch (error) {
            console.error(`Failed to acquire gear ${itemName}:`, error);
          }
        }
      }

      console.log('=== REWARDS SAVED TO BACKEND ===');
    } catch (error) {
      console.error('Error saving rewards to backend:', error);
      // Don't throw - we still want to show the notification even if saving fails
    }
  }

  // Save only gear rewards to backend immediately (for inventory updates)
  private async saveGearRewardsToBackend(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
    try {
      console.log('=== SAVING GEAR REWARDS TO BACKEND ===');
      console.log('Effects:', effects);
      console.log('Source:', source);
      console.log('Character ID:', this.characterId);

      // Save gear/items only (not stats/experience to avoid double-counting)
      if (effects.rewards || effects.artifacts) {
        const items = [...(effects.rewards || []), ...(effects.artifacts || [])];
        console.log('Processing gear items:', items);
        
        for (const itemName of items) {
          try {
            console.log(`=== ATTEMPTING TO ACQUIRE GEAR: ${itemName} ===`);
            const gearTypeId = this.mapItemNameToGearTypeId(itemName);
            
            if (gearTypeId) {
              console.log(`Calling apiService.acquireGear with gearTypeId: ${gearTypeId}`);
              try {
                const gearResult = await this.apiService.acquireGear(gearTypeId);
                console.log(`✅ Gear acquired successfully: ${itemName}`, gearResult);
                
                // Show notification for successful gear acquisition
                this.showNotification(`Acquired ${itemName}!`, 'item');
              } catch (gearError: any) {
                console.error(`❌ Failed to acquire gear ${itemName}:`, gearError);
                console.error('Gear error details:', {
                  itemName,
                  gearTypeId,
                  error: gearError,
                  response: gearError.response?.data,
                  status: gearError.response?.status
                });
                
                // Show notification for failed acquisition
                this.showNotification(`Failed to acquire ${itemName}`, 'item');
              }
            } else {
              console.log(`❌ No gear type mapping found for: ${itemName}`);
              console.log(`This item will not be added to the character's inventory`);
              
              // Show notification for unmapped item
              this.showNotification(`Found ${itemName} (not equippable)`, 'item');
            }
          } catch (error) {
            console.error(`❌ Failed to acquire gear ${itemName}:`, error);
            
            // Show notification for failed acquisition
            this.showNotification(`Failed to acquire ${itemName}`, 'item');
          }
        }
      } else {
        console.log('No gear items to save');
      }

      console.log('=== GEAR REWARDS SAVED TO BACKEND ===');
    } catch (error) {
      console.error('Error saving gear rewards to backend:', error);
      // Don't throw - we still want to show the notification even if saving fails
    }
  }

  // Map item names to gear type IDs using the gear mapping system
  private mapItemNameToGearTypeId(itemName: string): number | null {
    console.log(`=== MAPPING ITEM NAME TO GEAR TYPE ID ===`);
    console.log(`Item name: ${itemName}`);
    
    // Use the gear mapping system to get the gear type ID
    const gearTypeId = getGearTypeId(itemName);
    
    if (gearTypeId) {
      console.log(`Found gear type ID: ${gearTypeId} for item: ${itemName}`);
      const mapping = getGearMapping(itemName);
      if (mapping) {
        console.log(`Gear mapping details:`, {
          name: mapping.name,
          slot: mapping.slot,
          description: mapping.description,
          statBonuses: mapping.statBonuses,
          emojiIcon: mapping.emojiIcon
        });
      }
    } else {
      console.log(`No gear type mapping found for: ${itemName}`);
    }
    
    return gearTypeId;
  }

  // Call this when story is completed
  async handleStoryCompletion(currentSavedRewards: SavedRewards): Promise<void> {
    console.log('=== HANDLING STORY COMPLETION ===');
    console.log('Reward tracker:', this.rewardTracker);
    console.log('Reward tracker rewards count:', this.rewardTracker.rewards.length);
    console.log('Reward tracker rewards:', this.rewardTracker.rewards);
    
    const { updatedSavedRewards, completionData } = handleStoryCompletionRewards(
      this.rewardTracker, 
      currentSavedRewards
    );
    
    console.log('Updated saved rewards:', updatedSavedRewards);
    console.log('Completion data:', completionData);

    // ✅ FIRST: Save accumulated rewards to backend using individual API calls
    try {
      console.log('=== SAVING ACCUMULATED REWARDS TO BACKEND ===');
      await this.saveAccumulatedRewardsToBackend();
      console.log('=== ACCUMULATED REWARDS SAVED SUCCESSFULLY ===');
    } catch (error) {
      console.error('Error saving accumulated rewards to backend:', error);
      // Continue with story completion even if reward saving fails
    }

    // ✅ SECOND: Send completion data to backend via story completion endpoint
    try {
      console.log('=== CALLING STORY COMPLETION API ===');
      console.log('Story ID:', completionData.storyId);
      console.log('Total stat gains:', completionData.totalStatGains);
      console.log('Final rewards:', completionData.finalRewards);
      console.log('Skills learned:', completionData.skillsLearned);
      console.log('Journal entries:', completionData.journalEntries);
      
      const result = await this.apiService.completeStoryFromEnding(
        completionData.storyId,
        '', // optional: use last passageId if needed
        completionData.totalStatGains,
        completionData.journalEntries,
        completionData.finalRewards,
        completionData.skillsLearned
      );

      console.log('Story complete API result:', result);
      console.log('User profile updated:', result?.user_profile);
      console.log('Rewards earned:', result?.rewards_earned);
      
      // Optional: use result.user_profile to sync local player state here
      // updateUserStore(result.user_profile);
      
    } catch (error) {
      console.error('Error calling story completion API:', error);
      // Still continue with local completion even if API fails
    }
    
    // Call the story completion callback
    this.onStoryComplete(completionData);
    
    // Show completion notification
    const rewardSummary = this.getRewardSummary();
    if (rewardSummary.totalRewards > 0 || rewardSummary.totalStatGains > 0) {
      const rewardText = [];
      if (rewardSummary.totalStatGains > 0) {
        rewardText.push(`${rewardSummary.totalStatGains} stat gains`);
      }
      if (rewardSummary.totalRewards > 0) {
        rewardText.push(`${rewardSummary.totalRewards} items`);
      }
      if (rewardSummary.totalSkills > 0) {
        rewardText.push(`${rewardSummary.totalSkills} skills`);
      }
      
      this.showNotification(`Story completed! Rewards: ${rewardText.join(', ')}`, 'stat');
    }
  }

  // Save all accumulated rewards from the tracker to backend
  private async saveAccumulatedRewardsToBackend(): Promise<void> {
    try {
      console.log('=== SAVING ACCUMULATED REWARDS TO BACKEND ===');
      console.log('Character ID:', this.characterId);
      console.log('Character ID type:', typeof this.characterId);
      console.log('API Service available:', !!this.apiService);
      console.log('Reward tracker:', this.rewardTracker);
      console.log('Reward tracker rewards count:', this.rewardTracker.rewards.length);
      console.log('Reward tracker rewards:', this.rewardTracker.rewards);
      
      const calculatedRewards = calculateTotalRewards(this.rewardTracker);
      console.log('Calculated rewards:', calculatedRewards);
      console.log('Total stat gains:', calculatedRewards.totalStatGains);
      console.log('Final rewards:', calculatedRewards.finalRewards);
      console.log('Skills learned:', calculatedRewards.skillsLearned);

      // Save total experience gains
      if (calculatedRewards.totalStatGains.experience && calculatedRewards.totalStatGains.experience > 0) {
        console.log(`Saving total ${calculatedRewards.totalStatGains.experience} experience to backend...`);
        console.log(`Using character ID: ${this.characterId} (type: ${typeof this.characterId})`);
        
        try {
          const expResult = await this.apiService.gainExperience(
            this.characterId, 
            calculatedRewards.totalStatGains.experience, 
            `story_completion_${this.rewardTracker.storyId}`
          );
          console.log('Total experience saved successfully:', expResult);
        } catch (expError) {
          console.error('Failed to save experience:', expError);
          console.error('Experience error details:', {
            characterId: this.characterId,
            experience: calculatedRewards.totalStatGains.experience,
            source: `story_completion_${this.rewardTracker.storyId}`,
            error: expError
          });
        }
      } else {
        console.log('No experience to save');
      }

      // Save total wellness stats
      const wellnessStats: any = {};
      Object.entries(calculatedRewards.totalStatGains).forEach(([stat, value]) => {
        if (['awareness', 'resilience', 'connection', 'balance'].includes(stat) && value > 0) {
          wellnessStats[stat] = value;
        }
      });

      if (Object.keys(wellnessStats).length > 0) {
        console.log('Saving total wellness stats to backend:', wellnessStats);
        console.log(`Using character ID: ${this.characterId} (type: ${typeof this.characterId})`);
        
        try {
          const wellnessResult = await this.apiService.gainWellness(this.characterId, wellnessStats);
          console.log('Total wellness stats saved successfully:', wellnessResult);
        } catch (wellnessError) {
          console.error('Failed to save wellness stats:', wellnessError);
          console.error('Wellness error details:', {
            characterId: this.characterId,
            wellnessStats,
            error: wellnessError
          });
        }
      } else {
        console.log('No wellness stats to save');
      }

      // ✅ GEAR REWARDS ARE NOW SAVED IMMEDIATELY WHEN EARNED
      // No need to save them again at story completion to avoid double-counting
      if (calculatedRewards.finalRewards.length > 0) {
        console.log('=== GEAR REWARDS ALREADY SAVED IMMEDIATELY ===');
        console.log('Final rewards that were already saved:', calculatedRewards.finalRewards);
        console.log('Gear rewards are saved immediately when earned, not at story completion');
      } else {
        console.log('No gear rewards to process');
      }

      console.log('=== ACCUMULATED REWARDS SAVED TO BACKEND ===');
    } catch (error) {
      console.error('Error saving accumulated rewards to backend:', error);
      console.error('Full error details:', {
        characterId: this.characterId,
        characterIdType: typeof this.characterId,
        apiServiceAvailable: !!this.apiService,
        rewardTracker: this.rewardTracker,
        error: error
      });
    }
  }

  // Get current reward summary
  getRewardSummary() {
    const calculatedRewards = calculateTotalRewards(this.rewardTracker);
    return {
      totalRewards: calculatedRewards.finalRewards.length,
      totalStatGains: Object.keys(calculatedRewards.totalStatGains).length,
      totalSkills: calculatedRewards.skillsLearned.length,
      totalJournalEntries: calculatedRewards.journalEntries.length
    };
  }

  // Get formatted rewards for display
  getFormattedRewards() {
    const calculatedRewards = calculateTotalRewards(this.rewardTracker);
    return {
      statGains: Object.entries(calculatedRewards.totalStatGains).map(([stat, value]) => ({
        stat,
        value
      })),
      items: calculatedRewards.finalRewards,
      skills: calculatedRewards.skillsLearned,
      journalEntries: calculatedRewards.journalEntries
    };
  }

  // Reset tracker (for starting a new story)
  reset(storyId: string): void {
    this.rewardTracker = initializeRewardTracker(storyId);
    this.processedPassages.clear();
    this.processedChoices.clear();
  }
}

// ===== USAGE EXAMPLE IN STORYSCREEN =====

/*
// In your StoryScreen component:

import { StoryRewardManager } from '../utils/storyRewardIntegration';

const StoryScreen = ({ story, onStoryComplete, showNotification }) => {
  const [rewardManager, setRewardManager] = useState(null);
  
  useEffect(() => {
    // Initialize reward manager when story starts
    const manager = new StoryRewardManager(
      story.id.toString(),
      showNotification,
      onStoryComplete
    );
    setRewardManager(manager);
  }, [story.id]);

  const handlePassageLoad = (passage) => {
    // Track passage rewards
    if (rewardManager) {
      rewardManager.handlePassageVisit(passage);
    }
  };

  const handleChoiceSelect = (choice, passageId) => {
    // Track choice rewards
    if (rewardManager) {
      rewardManager.handleChoiceMade(choice, passageId);
    }
  };

  const handleStoryEnd = (currentSavedRewards) => {
    // Complete story with accumulated rewards
    if (rewardManager) {
      rewardManager.handleStoryCompletion(currentSavedRewards);
    }
  };

  // Show current reward progress
  const rewardSummary = rewardManager?.getRewardSummary();
  const formattedRewards = rewardManager?.getFormattedRewards();
};
*/

// ===== BACKEND DATA STRUCTURE EXAMPLES =====

// Example passage with rewards (from your backend)
export const examplePassageWithRewards: Passage = {
  id: 1,
  chapter: 1,
  passage_id: "ca931c47-f9a7-4e53-9ecc-bbe04b5d0403",
  content: "Well, first you should move around. You're just floating there.",
  passage_type: "narration",
  speaker: null,
  required_conditions: {},
  story_effects: {
    stats: {
      experience: 10,
      awareness: 2
    },
    rewards: ["Ancient Scroll"],
    journal_entry: "I learned about movement and awareness."
  },
  mood: "",
  background_music: "",
  background_image: null,
  order: 1,
  choices: []
};

// Example choice with rewards (from your backend)
export const exampleChoiceWithRewards: Choice = {
  id: 631,
  passage: 1,
  text: "If I could I would",
  choice_type: "normal",
  requirements: {},
  effects: {
    stats: {
      experience: 5,
      resilience: 1
    },
    skills: ["Movement Mastery"],
    artifacts: ["Floating Essence"]
  },
  success_passage_id: "",
  failure_passage_id: "",
  required_conditions: {},
  order: 0
};

// ===== INTEGRATION WITH MASTER STATE CONTEXT =====

/*
// In your MasterStateContext, you can integrate like this:

const handleStoryRewardTracker = (rewardTracker: StoryRewardTracker) => {
  const { updatedSavedRewards, completionData } = handleStoryCompletionRewards(
    rewardTracker, 
    currentSavedRewards
  );
  
  // Update your saved rewards
  setSavedRewards(updatedSavedRewards);
  
  // Handle completion data
  if (completionData.totalStatGains.experience) {
    gainExperience(completionData.totalStatGains.experience, `story_${completionData.storyId}`);
  }
  
  // Handle artifacts and skills
  completionData.finalRewards.forEach(reward => {
    handleArtifactUnlock({ 
      name: reward, 
      type: 'story_reward', 
      equipped: false, 
      resonance: 1, 
      description: `Earned from story completion`, 
      rarity: 'Common' 
    });
  });
  
  if (completionData.skillsLearned.length > 0) {
    handleSkillLearned(completionData.skillsLearned);
  }
};
*/

// ===== BACKEND INTEGRATION =====

export async function submitStoryRewardsToBackend(
  rewardTracker: StoryRewardTracker,
  apiService: any
): Promise<any> {
  const { totalStatGains, finalRewards, skillsLearned } = calculateTotalRewards(rewardTracker);
  
  try {
    const result = await apiService.completeStoryFromEnding(
      rewardTracker.storyId,
      '', // passageId - you'll need to provide this
      totalStatGains,
      [], // journalEntries
      finalRewards,
      skillsLearned
    );
    
    console.log('Story rewards submitted to backend:', result);
    return result;
  } catch (error) {
    console.error('Failed to submit story rewards to backend:', error);
    throw error;
  }
}

// ===== UTILITY FUNCTIONS =====

export function createRewardNotification(reward: any): string {
  if (!reward || Object.keys(reward).length === 0) {
    return '';
  }

  const rewardText = Object.entries(reward)
    .map(([stat, value]) => {
      if (typeof value === 'number') {
        return `+${value} ${stat}`;
      } else if (typeof value === 'string') {
        return value;
      }
      return '';
    })
    .filter(text => text.length > 0)
    .join(', ');

  return rewardText;
}

export function validateRewardData(reward: any): boolean {
  if (!reward || typeof reward !== 'object') {
    return false;
  }

  // Check if reward has valid structure
  const hasValidRewards = Object.values(reward).some(value => 
    typeof value === 'number' || typeof value === 'string'
  );

  return hasValidRewards;
} 

// ===== TEST FUNCTION FOR GEAR ACQUISITION =====

/**
 * Test function to verify gear acquisition works correctly
 * This can be called to test if the Ancient Scroll and other gear items are working
 */
export async function testGearAcquisition(apiService: any, characterId: number): Promise<void> {
  console.log('=== TESTING GEAR ACQUISITION ===');
  console.log('Character ID:', characterId);
  
  // Test the Ancient Scroll specifically
  const testItems = [
    'Ancient Scroll',
    'Clarity Lens of Mindful Sight',
    'Personal Style Cloak'
  ];
  
  for (const itemName of testItems) {
    try {
      console.log(`Testing gear acquisition for: ${itemName}`);
      
      // Get the gear type ID
      const gearTypeId = getGearTypeId(itemName);
      console.log(`Gear type ID for ${itemName}:`, gearTypeId);
      
      if (gearTypeId) {
        // Try to acquire the gear
        const result = await apiService.acquireGear(gearTypeId);
        console.log(`✅ Successfully acquired ${itemName}:`, result);
      } else {
        console.log(`❌ No gear type ID found for ${itemName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to acquire ${itemName}:`, error);
    }
  }
  
  // Test loading the character's gear
  try {
    console.log('Testing gear loading...');
    const myGear = await apiService.getMyGear();
    console.log('Character gear:', myGear);
    
    const equippedGear = await apiService.getEquippedGear();
    console.log('Equipped gear:', equippedGear);
  } catch (error) {
    console.error('Failed to load gear:', error);
  }
  
  console.log('=== GEAR ACQUISITION TEST COMPLETE ===');
} 