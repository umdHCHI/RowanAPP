// ===== STORY REWARD INTEGRATION GUIDE =====
// This file demonstrates how to integrate the new reward system into StoryScreen
// Works with the actual backend data structure where rewards are in effects field

import { getEquipmentAssetByName } from '../assets/equipment';
import { Choice, Passage, SavedRewards } from '../types/story';
import {
  applyChoiceRewards,
  applyPassageRewards,
  calculateTotalRewards,
  // New upgrade system imports
  checkItemOwnershipAndUpgrade,
  createNotificationFromEffects,
  createUpgradeNotification,
  getRewardFieldName,
  getRewardType,
  handleStoryCompletionRewards,
  hasChoiceRewards,
  hasPassageRewards,
  initializeRewardTracker,
  StoryRewardTracker,
  UpgradedEquipmentReward
} from './rewardsUtils';

// ===== INTEGRATION EXAMPLE FOR STORYSCREEN =====

export class StoryRewardManager {
  private rewardTracker: StoryRewardTracker;
  private showNotification: (message: string, type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest') => void;
  private onStoryComplete: (completionData: any) => void;
  private apiService: any;
  private characterId: number;
  private processedPassages: Set<string> = new Set(); // Track processed passages to avoid duplicates
  private processedChoices: Set<string> = new Set(); // Track processed choices to avoid duplicates
  private newlyAcquiredGear: Set<string> = new Set(); // Track newly acquired gear to avoid duplicate notifications
  private sentNotifications: Set<string> = new Set();
  private playerInventory: string[] = []; // Track player's current inventory
  private storyReplayCount: number = 0; // Track how many times this story has been replayed
  private researchCondition: "character" | "personality"; // Track research condition

  constructor(
    storyId: string,
    showNotification: (message: string, type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest') => void,
    onStoryComplete: (completionData: any) => void,
    apiService: any,
    characterId: number,
    playerInventory: string[] = [],
    storyReplayCount: number = 0,
    researchCondition: "character" | "personality" = "personality"
  ) {
    this.rewardTracker = initializeRewardTracker(storyId);
    this.showNotification = showNotification;
    this.onStoryComplete = onStoryComplete;
    this.apiService = apiService;
    this.characterId = characterId;
    this.playerInventory = playerInventory;
    this.storyReplayCount = storyReplayCount;
    this.researchCondition = researchCondition;
  }

  // Call this when visiting a passage
  async handlePassageVisit(passage: Passage): Promise<void> {
    console.log('=== HANDLING PASSAGE VISIT ===');
    console.log('Passage ID:', passage.passage_id);
    console.log('Passage story_effects:', passage.story_effects);
    console.log('Passage effects:', passage.effects);
    console.log('Has rewards:', hasPassageRewards(passage));
    console.log('Story_effects type:', typeof passage.story_effects);
    console.log('Story_effects keys:', passage.story_effects ? Object.keys(passage.story_effects) : 'No story_effects');
    console.log('Has quests in story_effects:', passage.story_effects?.quests);
    console.log('Quests type:', typeof passage.story_effects?.quests);
    
    // ✅ Check if this passage has already been processed
    if (this.processedPassages.has(passage.passage_id)) {
      console.log('Passage already processed, skipping:', passage.passage_id);
      return;
    }
    
    if (hasPassageRewards(passage)) {
      // Prioritize story_effects over effects (new format)
      const effects = passage.story_effects || passage.effects;
      console.log('✅ Using passage effects:', effects);
      
      this.rewardTracker = applyPassageRewards(this.rewardTracker, passage);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ PROCESS UPGRADED GEAR REWARDS
      if (effects.rewards || effects.artifacts) {
        console.log('=== PROCESSING UPGRADED GEAR REWARDS ===');
        await this.processUpgradedGearRewards(effects, 'passage');
      }
      
      // ✅ SAVE EXPERIENCE AND STATS IMMEDIATELY
      // Experience and stats should be saved immediately so they appear in character data
      if (effects.experience || effects.stats || Object.keys(effects).some(key => ['awareness', 'resilience', 'connection', 'balance'].includes(key))) {
        console.log('=== SAVING EXPERIENCE AND STATS IMMEDIATELY ===');
        await this.saveRewardsToBackend(effects, 'passage');
      }
      
      // Show floating notifications for each reward
      const notifications = createNotificationFromEffects(effects, this.researchCondition);
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Created notifications:', notifications);
      console.log('Number of notifications:', notifications.length);
      console.log('Effects that created notifications:', effects);
      console.log('Research condition for notifications:', this.researchCondition);
      console.log('Newly acquired gear:', Array.from(this.newlyAcquiredGear));
      
      // Filter out notifications for gear that wasn't newly acquired
      const filteredNotifications = notifications.filter(notification => {
        if (notification.type === 'item') {
          // Extract item name from notification message
          const itemName = notification.message.replace('Gained ', '').replace('Found ', '').replace('Acquired ', '');
          const isNewlyAcquired = this.newlyAcquiredGear.has(itemName);
          console.log(`Item notification: ${itemName}, Newly acquired: ${isNewlyAcquired}`);
          return isNewlyAcquired;
        }
        return true; // Keep all non-item notifications
      });
      
      console.log('Filtered notifications:', filteredNotifications);
      
      filteredNotifications.forEach((notification, index) => {
        console.log(`Showing notification ${index + 1}:`, notification);
        console.log(`🎁 CALLING showNotification: ${notification.message} (${notification.type})`);
        
        // Create a unique key for this notification to prevent duplicates
        const notificationKey = `${notification.message}_${notification.type}`;
        
        if (this.sentNotifications.has(notificationKey)) {
          console.log(`⚠️ Notification already sent, skipping: ${notificationKey}`);
          return;
        }
        
        console.log(`✅ Sending new notification: ${notificationKey}`);
        this.sentNotifications.add(notificationKey);
        this.showNotification(notification.message, notification.type);
      });
      
      console.log('=== END NOTIFICATION DEBUG ===');
    }
    
    // Mark passage as processed
    this.processedPassages.add(passage.passage_id);
  }

  // Call this when making a choice (only if no passage rewards were found)
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
    
    // Process choice rewards if the choice has rewards (regardless of passage processing)
    if (hasChoiceRewards(choice)) {
      console.log('✅ Processing choice rewards:', choice.effects);
      this.rewardTracker = applyChoiceRewards(this.rewardTracker, choice, passageId);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ PROCESS UPGRADED GEAR REWARDS
      if (choice.effects.rewards || choice.effects.artifacts) {
        console.log('=== PROCESSING UPGRADED GEAR REWARDS ===');
        await this.processUpgradedGearRewards(choice.effects, 'choice');
      }
      
      // ✅ SAVE EXPERIENCE AND STATS IMMEDIATELY
      // Experience and stats should be saved immediately so they appear in character data
      if (choice.effects.experience || choice.effects.stats || Object.keys(choice.effects).some(key => ['awareness', 'resilience', 'connection', 'balance'].includes(key))) {
        console.log('=== SAVING EXPERIENCE AND STATS IMMEDIATELY ===');
        await this.saveRewardsToBackend(choice.effects, 'choice');
      }
      
      // Show floating notifications for each reward
      const notifications = createNotificationFromEffects(choice.effects, this.researchCondition);
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Created notifications:', notifications);
      console.log('Number of notifications:', notifications.length);
      console.log('Effects that created notifications:', choice.effects);
      console.log('Newly acquired gear:', Array.from(this.newlyAcquiredGear));
      
      // Filter out notifications for gear that wasn't newly acquired
      const filteredNotifications = notifications.filter(notification => {
        if (notification.type === 'item') {
          // Extract item name from notification message
          const itemName = notification.message.replace('Gained ', '').replace('Found ', '').replace('Acquired ', '');
          const isNewlyAcquired = this.newlyAcquiredGear.has(itemName);
          console.log(`Item notification: ${itemName}, Newly acquired: ${isNewlyAcquired}`);
          return isNewlyAcquired;
        }
        return true; // Keep all non-item notifications
      });
      
      console.log('Filtered notifications:', filteredNotifications);
      
      filteredNotifications.forEach((notification, index) => {
        console.log(`Showing notification ${index + 1}:`, notification);
        console.log(`🎁 CALLING showNotification: ${notification.message} (${notification.type})`);
        
        // Create a unique key for this notification to prevent duplicates
        const notificationKey = `${notification.message}_${notification.type}`;
        
        if (this.sentNotifications.has(notificationKey)) {
          console.log(`⚠️ Notification already sent, skipping: ${notificationKey}`);
          return;
        }
        
        console.log(`✅ Sending new notification: ${notificationKey}`);
        this.sentNotifications.add(notificationKey);
        this.showNotification(notification.message, notification.type);
      });
      
      console.log('=== END NOTIFICATION DEBUG ===');
    }
    
    // Mark choice as processed
    this.processedChoices.add(choiceKey);
  }

  // Process upgraded gear rewards using the new upgrade system
  private async processUpgradedGearRewards(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
    try {
      console.log('=== PROCESSING UPGRADED GEAR REWARDS ===');
      console.log('Effects:', effects);
      console.log('Source:', source);
      console.log('Player inventory:', this.playerInventory);
      console.log('Story replay count:', this.storyReplayCount);

      // Process gear/items with upgrade system
      if (effects.rewards || effects.artifacts) {
        const items = [...(effects.rewards || []), ...(effects.artifacts || [])];
        console.log('Processing gear items:', items);
        
        for (const itemName of items) {
          try {
            console.log(`=== PROCESSING ITEM: ${itemName} ===`);
            
            // Check for upgrade opportunities
            const upgradeResult = checkItemOwnershipAndUpgrade(
              itemName, 
              this.playerInventory, 
              this.storyReplayCount
            );
            
            if (upgradeResult) {
              console.log('Upgrade result:', upgradeResult);
              
              // Create upgrade notification
              const upgradeNotification = createUpgradeNotification(upgradeResult.upgrade);
              console.log('Upgrade notification:', upgradeNotification);
              
              // Show upgrade notification
              this.showNotification(
                upgradeNotification.message, 
                upgradeNotification.type
              );
              
              // Save the upgraded item to backend
              if (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0) {
                await this.saveUpgradedItemToBackend(upgradeResult);
              }
              
              // Update local inventory
              this.updateLocalInventory(upgradeResult);
              
            } else {
              console.log(`No upgrade path found for: ${itemName}`);
              // Fall back to regular item acquisition
              await this.saveRegularItemToBackend(itemName);
            }
            
          } catch (error) {
            console.error(`❌ Failed to process item ${itemName}:`, error);
            this.showNotification(`Failed to process ${itemName}`, 'item');
          }
        }
      } else {
        console.log('No gear items to process');
      }

      console.log('=== UPGRADED GEAR REWARDS PROCESSED ===');
    } catch (error) {
      console.error('Error processing upgraded gear rewards:', error);
    }
  }

  // Save upgraded item to backend
  private async saveUpgradedItemToBackend(upgradeResult: UpgradedEquipmentReward): Promise<void> {
    try {
      console.log('=== SAVING UPGRADED ITEM TO BACKEND ===');
      console.log('Upgrade result:', upgradeResult);
      
      const { upgradedItem, upgrade } = upgradeResult;
      
      // Map the upgraded item name to gear type ID
      const gearTypeId = this.mapItemNameToGearTypeId(upgradedItem);
      
      if (gearTypeId) {
        console.log(`Calling apiService.acquireGear with gearTypeId: ${gearTypeId}`);
        
        try {
          const gearResult = await this.apiService.acquireGear(gearTypeId);
          console.log(`✅ Upgraded gear acquired successfully: ${upgradedItem}`, gearResult);
          
          // Mark as newly acquired for notification purposes
          this.newlyAcquiredGear.add(upgradedItem);
          
          // If this is a stat boost (not a new item), also apply the stat boost
          if (upgrade.statBonus > 0 && !upgradeResult.isUpgrade) {
            console.log(`Applying stat boost: +${upgrade.statBonus} to all stats`);
            // You might want to call a separate API to apply stat boosts
            // await this.apiService.applyStatBoost(this.characterId, upgrade.statBonus);
          }
          
        } catch (gearError: any) {
          console.error(`❌ Failed to acquire upgraded gear ${upgradedItem}:`, gearError);
          this.showNotification(`Failed to acquire ${upgradedItem}`, 'item');
        }
      } else {
        console.log(`❌ No gear type mapping found for upgraded item: ${upgradedItem}`);
        this.showNotification(`Found ${upgradedItem} (not equippable)`, 'item');
      }
      
    } catch (error) {
      console.error('Error saving upgraded item to backend:', error);
    }
  }

  // Save regular item to backend (fallback)
  private async saveRegularItemToBackend(itemName: string): Promise<void> {
    try {
      console.log(`=== SAVING REGULAR ITEM: ${itemName} ===`);
      
      const gearTypeId = this.mapItemNameToGearTypeId(itemName);
      
      if (gearTypeId) {
        const gearResult = await this.apiService.acquireGear(gearTypeId);
        console.log(`✅ Regular gear acquired: ${itemName}`, gearResult);
        this.newlyAcquiredGear.add(itemName);
      } else {
        console.log(`❌ No gear type mapping found for: ${itemName}`);
        this.showNotification(`Found ${itemName} (not equippable)`, 'item');
      }
    } catch (error) {
      console.error(`Failed to save regular item ${itemName}:`, error);
      this.showNotification(`Failed to acquire ${itemName}`, 'item');
    }
  }

  // Update local inventory tracking
  private updateLocalInventory(upgradeResult: UpgradedEquipmentReward): void {
    const { originalItem, upgradedItem, isUpgrade } = upgradeResult;
    
    // Remove original item if it was upgraded
    if (isUpgrade) {
      this.playerInventory = this.playerInventory.filter(item => 
        item.toLowerCase().trim() !== originalItem.toLowerCase().trim()
      );
    }
    
    // Add the new/upgraded item
    if (!this.playerInventory.includes(upgradedItem)) {
      this.playerInventory.push(upgradedItem);
    }
    
    console.log('Updated local inventory:', this.playerInventory);
  }

  // Save rewards to backend using your API endpoints
  private async saveRewardsToBackend(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
    try {
      console.log('=== SAVING REWARDS TO BACKEND ===');
      console.log('Effects:', effects);
      console.log('Source:', source);
      console.log('Character ID:', this.characterId);
      console.log('Research condition:', this.researchCondition);

      // Determine reward type based on research condition
      const rewardType = getRewardType(this.researchCondition);
      const rewardFieldName = getRewardFieldName(this.researchCondition);
      
      console.log(`Using reward type: ${rewardType} (field: ${rewardFieldName})`);

      // Save experience/resonance gains
      let rewardToSave = 0;
      
      // Check for reward directly in effects (new format)
      if (effects[rewardFieldName]) {
        console.log(`Processing ${rewardFieldName} directly:`, effects[rewardFieldName]);
        const rewardValue = typeof effects[rewardFieldName] === 'number' 
          ? effects[rewardFieldName] 
          : parseInt(effects[rewardFieldName] as string, 10);
        
        console.log(`${rewardFieldName} value: ${effects[rewardFieldName]}, Parsed: ${rewardValue}`);
        
        if (!isNaN(rewardValue) && rewardValue > 0) {
          rewardToSave += rewardValue;
        } else {
          console.log(`Invalid ${rewardFieldName} value: ${effects[rewardFieldName]}`);
        }
      }
      
      // Check for reward in stats object (legacy format)
      if (effects.stats && effects.stats[rewardFieldName]) {
        console.log(`Processing ${rewardFieldName} from stats:`, effects.stats[rewardFieldName]);
        const rewardValue = typeof effects.stats[rewardFieldName] === 'number' 
          ? effects.stats[rewardFieldName] 
          : parseInt(effects.stats[rewardFieldName] as string, 10);
        
        console.log(`${rewardFieldName} from stats: ${effects.stats[rewardFieldName]}, Parsed: ${rewardValue}`);
        
        if (!isNaN(rewardValue) && rewardValue > 0) {
          rewardToSave += rewardValue;
        } else {
          console.log(`Invalid ${rewardFieldName} value from stats: ${effects.stats[rewardFieldName]}`);
        }
      }
      
      // Save total reward (only for character users)
      if (rewardToSave > 0 && this.characterId > 0) {
        console.log(`Saving total ${rewardToSave} ${rewardFieldName} to backend...`);
        
        if (rewardType === 'experience') {
          const expResult = await this.apiService.gainExperience(
            this.characterId, 
            rewardToSave, 
            `story_${source}`
          );
          console.log('Experience saved:', expResult);
        } else {
          const resonanceResult = await this.apiService.gainResonance(
            this.characterId, 
            rewardToSave, 
            `story_${source}`
          );
          console.log('Resonance saved:', resonanceResult);
        }
      } else if (rewardToSave > 0 && this.characterId === 0) {
        console.log(`Skipping ${rewardFieldName} save for personality user (no character ID)`);
      } else {
        console.log(`No ${rewardFieldName} to save`);
      }

      // Save wellness stats from direct properties (new format)
      const wellnessStats: any = {};
      
      // Handle direct stat values from story_effects (awareness, connection, etc.)
      Object.entries(effects).forEach(([key, value]) => {
        // Skip non-wellness fields
        if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness', 'experience'].includes(key)) {
          return;
        }
        
        // Handle direct wellness stat values
        const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        console.log(`Direct stat: ${key}, Value: ${value}, Parsed: ${numValue}`);
        
        if (!isNaN(numValue) && numValue > 0) {
          // Map story stats to wellness stats
          if (['awareness', 'resilience', 'connection', 'balance'].includes(key)) {
            wellnessStats[key] = numValue;
            console.log(`Added wellness stat: ${key} = ${numValue}`);
          } else {
            console.log(`Skipping non-wellness stat: ${key}`);
          }
        } else {
          console.log(`Invalid stat value: ${key} = ${value}`);
        }
      });

      // Save wellness stats from stats object (legacy format)
      if (effects.stats) {
        console.log('Processing stats for wellness:', effects.stats);
        Object.entries(effects.stats).forEach(([stat, value]) => {
          const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
          console.log(`Stat: ${stat}, Value: ${value}, Parsed: ${numValue}`);
          if (!isNaN(numValue) && numValue > 0) {
            // Map story stats to wellness stats (exclude experience as it's handled separately)
            if (['awareness', 'resilience', 'connection', 'balance'].includes(stat) && stat !== 'experience') {
              wellnessStats[stat] = (wellnessStats[stat] || 0) + numValue;
              console.log(`Added wellness stat: ${stat} = ${numValue}`);
            } else {
              console.log(`Skipping non-wellness stat: ${stat}`);
            }
          } else {
            console.log(`Invalid stat value: ${stat} = ${value}`);
          }
        });
      } else {
        console.log('No stats found in effects');
      }

      if (Object.keys(wellnessStats).length > 0 && this.characterId > 0) {
        console.log('Saving wellness stats to backend:', wellnessStats);
        const wellnessResult = await this.apiService.gainWellness(this.characterId, wellnessStats);
        console.log('Wellness stats saved:', wellnessResult);
      } else if (Object.keys(wellnessStats).length > 0 && this.characterId === 0) {
        console.log('Skipping wellness stats save for personality user (no character ID)');
      } else {
        console.log('No valid wellness stats to save');
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

  // Map item names to gear type IDs using the proper backend mapping
  private mapItemNameToGearTypeId(itemName: string): number | null {
    console.log(`=== MAPPING ITEM NAME TO GEAR TYPE ID ===`);
    console.log(`Item name: ${itemName}`);
    
    // Import the proper mapping function
    const { getBackendGearTypeId } = require('./rewardsUtils');
    const gearTypeId = getBackendGearTypeId(itemName);
    
    if (gearTypeId) {
      console.log(`Found backend gear type ID: ${gearTypeId} for item: ${itemName}`);
      
      // Get equipment asset info for logging
      const assetInfo = getEquipmentAssetByName(itemName);
      if (assetInfo) {
        console.log(`Equipment asset info:`, {
          displayName: assetInfo.displayName,
          type: assetInfo.type,
          subtype: assetInfo.subtype
        });
      }
    } else {
      console.log(`No backend gear type mapping found for: ${itemName}`);
      console.log(`This item will not be added to the character's inventory`);
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
    this.newlyAcquiredGear.clear(); // Clear newly acquired gear on reset
    this.sentNotifications.clear(); // Clear sent notifications on reset
    this.playerInventory = []; // Clear player inventory on reset
    this.storyReplayCount = 0; // Reset story replay count
  }

  // Debug method to test reward detection
  debugRewards(passage: any, choice?: any): void {
    console.log('=== STORY REWARD MANAGER DEBUG ===');
    console.log('Story ID:', this.rewardTracker.storyId);
    console.log('Character ID:', this.characterId);
    console.log('Processed passages:', Array.from(this.processedPassages));
    console.log('Processed choices:', Array.from(this.processedChoices));
    console.log('Newly acquired gear:', Array.from(this.newlyAcquiredGear)); // Debug newly acquired gear
    console.log('Current reward tracker:', this.rewardTracker);
    
    console.log('=== END STORY REWARD MANAGER DEBUG ===');
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
    awareness: 2,
    connection: 1,
    experience: 10
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
      
      // Create a simple hash-based ID (this is a temporary solution)
      const normalizedName = itemName.toLowerCase().trim();
      let hash = 0;
      for (let i = 0; i < normalizedName.length; i++) {
        const char = normalizedName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const gearTypeId = Math.abs(hash) % 1000 + 1;
      
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

// Export the debug function for use in story components
export { debugRewardDetection } from './rewardsUtils';

