// ===== STORY REWARD INTEGRATION GUIDE =====
// This file demonstrates how to integrate the new reward system into StoryScreen
// Works with the actual backend data structure where rewards are in effects field

import { CopingTools } from '../types/personality';
import { Choice, Passage, SavedRewards } from '../types/story';
import { normalizePersonalitySlug } from './personalityFilter';
import {
  applyChoiceRewards,
  applyPassageRewards,
  calculateTotalRewards,
  // New upgrade system imports
  createNotificationFromEffects,
  createUpgradeNotification,
  getQuestInfo,
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
  private userId?: number; // Add userId for personality users
  private processedPassages: Set<string> = new Set(); // Track processed passages to avoid duplicates
  private processedChoices: Set<string> = new Set(); // Track processed choices to avoid duplicates
  private processedQuests: Set<string> = new Set(); // Track processed quests to avoid duplicate rewards
  private newlyAcquiredGear: Set<string> = new Set(); // Track newly acquired gear to avoid duplicate notifications
  private sentNotifications: Set<string> = new Set();
  private processedItems: Set<string> = new Set(); // Track processed items to prevent duplicate notifications
  private playerInventory: string[] = []; // Track player's current inventory
  private storyReplayCount: number = 0; // Track how many times this story has been replayed
  private researchCondition: "character" | "personality"; // Track research condition
  private primaryTrait?: string; // Store personality trait for personality users
  private storyId: string; // Store story ID

  constructor(
    storyId: string,
    showNotification: (message: string, type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest') => void,
    onStoryComplete: (completionData: any) => void,
    apiService: any,
    characterId: number,
    playerInventory: string[] = [],
    storyReplayCount: number = 0,
    researchCondition: "character" | "personality" = "personality",
    userId?: number, // Add userId for personality users
    primaryTrait?: string // Add personality trait for personality users
  ) {
    this.storyId = storyId;
    this.rewardTracker = initializeRewardTracker(storyId);
    this.showNotification = showNotification;
    this.onStoryComplete = onStoryComplete;
    this.apiService = apiService;
    this.characterId = characterId;
    this.playerInventory = playerInventory;
    this.storyReplayCount = storyReplayCount;
    this.researchCondition = researchCondition;
    this.userId = userId;
    this.primaryTrait = primaryTrait;
  }

  // Filter effects based on research condition and personality trait
  private filterEffectsByUserType(effects: any): any {
    console.log('=== FILTERING EFFECTS BY USER TYPE ===');
    console.log('Original effects:', effects);
    console.log('Research condition:', this.researchCondition);
    console.log('Primary trait:', this.primaryTrait);
    
    const filteredEffects = { ...effects };
    
    if (this.researchCondition === "personality") {
      // For personality users, convert character rewards to coping tools
      console.log('Processing effects for personality user');
      
      // Remove resonance (personality users get experience instead)
      if (filteredEffects.resonance) {
        console.log('Filtering out resonance rewards for personality user');
        delete filteredEffects.resonance;
      }
      
      // Convert character items/artifacts to coping tools for personality users
      if (filteredEffects.rewards || filteredEffects.artifacts) {
        console.log('Converting character rewards to coping tools for personality user');
        
        // Combine rewards and artifacts into tools array
        const allItems = [...(filteredEffects.rewards || []), ...(filteredEffects.artifacts || [])];
        console.log('All items to convert:', allItems);
        
        if (allItems.length > 0) {
          // Convert character gear names to coping tool IDs
          const convertedTools = allItems.map((itemName: string) => {
            // Map common gear names to coping tool IDs
            const gearToToolMap: Record<string, string> = {
              'Ancient Scroll': 'mindfulness_meditation',
              'Lens of Gentle Seeing': 'mindful_observation',
              'Notebook of the Wanderer': 'journaling_practice',
              'Compass of Quiet Knowing': 'body_scan',
              'Cloak of True Form': 'self_compassion_break',
              'Wrap of Rooted Memory': 'grounding_technique',
              'Shield of Flexible Boundaries': 'assertive_communication',
              'Mask of Discernment': 'emotional_awareness',
              'Crown of Becoming': 'values_clarification',
              'Helm of the Unmasked': 'authentic_expression',
              'Foundation of Inner Stone': 'progressive_relaxation',
              'Roots of Connection': 'loving_kindness_meditation',
              'Stone of Self-Compassion': 'self_compassion_meditation'
            };
            
            const toolId = gearToToolMap[itemName] || itemName.toLowerCase().replace(/\s+/g, '_');
            console.log(`Converting gear "${itemName}" to coping tool "${toolId}"`);
            return toolId;
          });
          
          // Add converted tools to effects
          filteredEffects.tools = convertedTools;
          console.log('Converted tools:', convertedTools);
        }
        
        // Remove the original rewards and artifacts
        delete filteredEffects.rewards;
        delete filteredEffects.artifacts;
      }
      
      // Filter existing tools by personality trait
      if (filteredEffects.tools) {
        if (this.primaryTrait) {
          console.log('Filtering existing tools by personality trait:', filteredEffects.tools);
          const originalTools = filteredEffects.tools;
          filteredEffects.tools = originalTools.filter((toolId: string) => {
            // Check if this tool belongs to the user's personality type
            const personalityTools = CopingTools[this.primaryTrait as keyof typeof CopingTools];
            if (personalityTools) {
              const toolExists = personalityTools.some((tool: any) => tool.id === toolId);
              if (!toolExists) {
                console.log(`Filtering out tool ${toolId} for personality user with trait ${this.primaryTrait}`);
              } else {
                console.log(`Keeping tool ${toolId} for personality user with trait ${this.primaryTrait}`);
              }
              return toolExists;
            }
            console.log(`Keeping tool ${toolId} (no personality tools found for trait ${this.primaryTrait})`);
            return true; // Keep tools if we can't determine personality mapping
          });
          
          if (filteredEffects.tools.length === 0) {
            console.log('No tools remaining after filtering, deleting tools field');
            delete filteredEffects.tools;
          } else {
            console.log('Tools remaining after filtering:', filteredEffects.tools);
          }
        }
      }
      
      // Filter quests by personality trait
      if (filteredEffects.quests) {
        if (this.primaryTrait) {
          console.log('Filtering quests by personality trait:', filteredEffects.quests);
          const originalQuests = filteredEffects.quests;
          filteredEffects.quests = originalQuests.filter((questId: string) => {
            const questTraitMatch = questId.match(/^(\w+)_\d+$/);
            if (questTraitMatch && this.primaryTrait) {
              const questTrait = questTraitMatch[1];
              const userTrait = this.primaryTrait!.toLowerCase();
              const matches = questTrait.toLowerCase() === userTrait;
              console.log(`Quest filtering: questId=${questId}, questTrait=${questTrait}, userTrait=${userTrait}, matches=${matches}`);
              if (!matches) {
                console.log(`Filtering out quest ${questId} for personality user with trait ${this.primaryTrait}`);
              } else {
                console.log(`Keeping quest ${questId} for personality user with trait ${this.primaryTrait}`);
              }
              return matches;
            }
            console.log(`Keeping quest ${questId} (no trait match pattern)`);
            return true; // Keep quests that don't match the pattern
          });
          
          if (filteredEffects.quests.length === 0) {
            console.log('No quests remaining after filtering, deleting quests field');
            delete filteredEffects.quests;
          } else {
            console.log('Quests remaining after filtering:', filteredEffects.quests);
          }
        } else {
          // Personality users without trait: keep all quests
          console.log('Personality user without trait: keeping all quests');
        }
      }
      
      // Filter quest_progress by personality trait
      if (filteredEffects.quest_progress) {
        if (this.primaryTrait) {
          console.log('Filtering quest_progress by personality trait:', filteredEffects.quest_progress);
          const originalQuestProgress = filteredEffects.quest_progress;
          filteredEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
            const questTraitMatch = questId.match(/^(\w+)_\d+$/);
            if (questTraitMatch && this.primaryTrait) {
              const questTrait = questTraitMatch[1];
              const userTrait = this.primaryTrait!.toLowerCase();
              const matches = questTrait.toLowerCase() === userTrait;
              console.log(`Quest progress filtering: questId=${questId}, questTrait=${questTrait}, userTrait=${userTrait}, matches=${matches}`);
              if (!matches) {
                console.log(`Filtering out quest progress ${questId} for personality user with trait ${this.primaryTrait}`);
              } else {
                console.log(`Keeping quest progress ${questId} for personality user with trait ${this.primaryTrait}`);
              }
              return matches;
            }
            console.log(`Keeping quest progress ${questId} (no trait match pattern)`);
            return true; // Keep quest progress that don't match the pattern
          });
          
          if (filteredEffects.quest_progress.length === 0) {
            console.log('No quest_progress remaining after filtering, deleting quest_progress field');
            delete filteredEffects.quest_progress;
          } else {
            console.log('Quest_progress remaining after filtering:', filteredEffects.quest_progress);
          }
        } else {
          // Personality users without trait: keep all quest progress
          console.log('Personality user without trait: keeping all quest progress');
        }
      }
      
      console.log('Filtered effects for personality user:', filteredEffects);
      return filteredEffects;
    } else {
      // For character users, filter out personality-specific rewards
      console.log('Processing effects for character user');
      
      // Convert experience to resonance for character users
      if (filteredEffects.experience) {
        console.log(`Converting experience ${filteredEffects.experience} to resonance for character user`);
        filteredEffects.resonance = filteredEffects.experience;
        delete filteredEffects.experience;
      }
      
      // Remove tools (character users don't get coping tools)
      if (filteredEffects.tools) {
        console.log('Filtering out tools for character user');
        delete filteredEffects.tools;
      }
      
      // Keep character items, artifacts, and all quests for character users
      console.log('Character user: keeping all items, artifacts, and quests');
      console.log('Filtered effects for character user:', filteredEffects);
      return filteredEffects;
    }
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
      const originalEffects = passage.story_effects || passage.effects;
      console.log('✅ Original passage effects:', originalEffects);
      
      // ✅ FILTER EFFECTS BASED ON USER TYPE AND PERSONALITY TRAIT
      const effects = this.filterEffectsByUserType(originalEffects);
      console.log('✅ Filtered passage effects:', effects);
      
      this.rewardTracker = applyPassageRewards(this.rewardTracker, passage);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ PROCESS UPGRADED GEAR REWARDS (only for filtered effects)
      if (effects.rewards || effects.artifacts) {
        console.log('=== PROCESSING UPGRADED GEAR REWARDS ===');
        await this.processItemRewards(effects, 'passage');
      }
      
      // ✅ SAVE EXPERIENCE AND STATS IMMEDIATELY (only for filtered effects)
      // Experience and stats should be saved immediately so they appear in character data
      if (effects.experience || effects.stats || Object.keys(effects).some(key => ['awareness', 'resilience', 'connection', 'balance'].includes(key))) {
        console.log('=== SAVING EXPERIENCE AND STATS IMMEDIATELY ===');
        await this.saveRewardsToBackend(effects, 'passage');
      }

      // ✅ SEND QUEST COMPLETION EVENTS IMMEDIATELY (only for filtered effects)
      // Quest completion events should be sent immediately so they appear in the quest achievements
      if (effects.quests || effects.quest_progress) {
        console.log('=== SENDING QUEST COMPLETION EVENTS IMMEDIATELY ===');
        await this.sendQuestCompletionEvents(effects, this.storyId, passage.passage_id);
      }
      
      // Show floating notifications for each reward (using filtered effects)
      console.log('=== NOTIFICATION CREATION DEBUG ===');
      console.log('Effects being passed to createNotificationFromEffects:', effects);
      console.log('Effects.rewards exists:', !!effects.rewards);
      console.log('Effects.artifacts exists:', !!effects.artifacts);
      console.log('Effects.rewards value:', effects.rewards);
      console.log('Effects.artifacts value:', effects.artifacts);
      
      const notifications = createNotificationFromEffects(effects, this.researchCondition);
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Created notifications:', notifications);
      console.log('Number of notifications:', notifications.length);
      console.log('Effects that created notifications:', effects);
      console.log('Research condition for notifications:', this.researchCondition);
      console.log('Newly acquired gear:', Array.from(this.newlyAcquiredGear));
      
      // Filter notifications based on user type
      const filteredNotifications = notifications.filter(notification => {
        // Filter based on reward type for each user type
        if (this.researchCondition === "personality") {
          // Personality users should only see:
          // - Experience rewards (not resonance)
          // - Wellness stat gains (awareness, resilience, connection, balance)
          // - Coping tools/skills (but not traditional items/artifacts)
          // - Quest progress (only for their personality trait)
          
          if (notification.type === 'resonance') {
            console.log(`Filtering out resonance notification for personality user: ${notification.message}`);
            return false;
          }
          
          if (notification.type === 'item' || notification.type === 'artifact') {
            // Skip item/artifact notifications - coping tools are handled separately
            console.log(`Filtering out item/artifact notification for personality user: ${notification.message}`);
            return false;
          }
          
          // For quest notifications, only show if they match the user's personality trait
          if (notification.type === 'quest' && this.primaryTrait) {
            const questIdMatch = notification.message.match(/quest_id:\s*(\w+_\d+)/);
            if (questIdMatch) {
              const questId = questIdMatch[1];
              const questTraitMatch = questId.match(/^(\w+)_\d+$/);
              if (questTraitMatch) {
                const questTrait = questTraitMatch[1];
                const matches = questTrait.toLowerCase() === this.primaryTrait.toLowerCase();
                if (!matches) {
                  console.log(`Filtering out quest notification for different personality trait: ${questId} (user trait: ${this.primaryTrait})`);
                  return false;
                }
              }
            }
          }
          
          // Keep experience, stats, skills, and quest notifications (quest already filtered above)
          return ['experience', 'stat', 'skill', 'quest'].includes(notification.type);
          
        } else {
          // Character users should only see:
          // - Resonance rewards (not experience)  
          // - Character stat gains
          // - Traditional items/artifacts/gear
          // - Quest progress
          
          if (notification.type === 'experience') {
            console.log(`Filtering out experience notification for character user: ${notification.message}`);
            return false;
          }
          
          if (notification.type === 'item') {
            // For character users, filter out notifications for gear that wasn't newly acquired
            const itemName = notification.message.replace('Gained ', '').replace('Found ', '').replace('Acquired ', '');
            const isNewlyAcquired = this.newlyAcquiredGear.has(itemName);
            console.log(`Item notification: ${itemName}, Newly acquired: ${isNewlyAcquired}`);
            return isNewlyAcquired;
          }
          
          // Keep resonance, stats, items, artifacts, and quest notifications
          return ['resonance', 'stat', 'item', 'artifact', 'quest'].includes(notification.type);
        }
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
      console.log('✅ Original choice effects:', choice.effects);
      
      // ✅ FILTER EFFECTS BASED ON USER TYPE AND PERSONALITY TRAIT
      const effects = this.filterEffectsByUserType(choice.effects);
      console.log('✅ Filtered choice effects:', effects);
      
      this.rewardTracker = applyChoiceRewards(this.rewardTracker, choice, passageId);
      console.log('Reward tracker updated, total rewards:', this.rewardTracker.rewards.length);
      
      // ✅ PROCESS UPGRADED GEAR REWARDS (only for filtered effects)
      if (effects.rewards || effects.artifacts) {
        console.log('=== PROCESSING UPGRADED GEAR REWARDS ===');
        await this.processItemRewards(effects, 'choice');
      }
      
      // ✅ SAVE EXPERIENCE AND STATS IMMEDIATELY (only for filtered effects)
      // Experience and stats should be saved immediately so they appear in character data
      if (effects.experience || effects.stats || Object.keys(effects).some(key => ['awareness', 'resilience', 'connection', 'balance'].includes(key))) {
        console.log('=== SAVING EXPERIENCE AND STATS IMMEDIATELY ===');
        await this.saveRewardsToBackend(effects, 'choice');
      }

      // ✅ SEND QUEST COMPLETION EVENTS IMMEDIATELY (only for filtered effects)
      // Quest completion events should be sent immediately so they appear in the quest achievements
      if (effects.quests || effects.quest_progress) {
        console.log('=== SENDING QUEST COMPLETION EVENTS IMMEDIATELY ===');
        await this.sendQuestCompletionEvents(effects, this.storyId, passageId);
      }
      
      // Show floating notifications for each reward (using filtered effects)
      const notifications = createNotificationFromEffects(effects, this.researchCondition);
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Created notifications:', notifications);
      console.log('Number of notifications:', notifications.length);
      console.log('Effects that created notifications:', effects);
      console.log('Newly acquired gear:', Array.from(this.newlyAcquiredGear));
      
      // Filter notifications based on user type
      const filteredNotifications = notifications.filter(notification => {
        // Filter based on reward type for each user type
        if (this.researchCondition === "personality") {
          // Personality users should only see:
          // - Experience rewards (not resonance)
          // - Wellness stat gains (awareness, resilience, connection, balance)
          // - Coping tools/skills (but not traditional items/artifacts)
          // - Quest progress (only for their personality trait)
          
          if (notification.type === 'resonance') {
            console.log(`Filtering out resonance notification for personality user: ${notification.message}`);
            return false;
          }
          
          if (notification.type === 'item' || notification.type === 'artifact') {
            // Skip item/artifact notifications - coping tools are handled separately
            console.log(`Filtering out item/artifact notification for personality user: ${notification.message}`);
            return false;
          }
          
          // For quest notifications, only show if they match the user's personality trait
          if (notification.type === 'quest' && this.primaryTrait) {
            const questIdMatch = notification.message.match(/quest_id:\s*(\w+_\d+)/);
            if (questIdMatch) {
              const questId = questIdMatch[1];
              const questTraitMatch = questId.match(/^(\w+)_\d+$/);
              if (questTraitMatch) {
                const questTrait = questTraitMatch[1];
                const matches = questTrait.toLowerCase() === this.primaryTrait.toLowerCase();
                if (!matches) {
                  console.log(`Filtering out quest notification for different personality trait: ${questId} (user trait: ${this.primaryTrait})`);
                  return false;
                }
              }
            }
          }
          
          // Keep experience, stats, skills, and quest notifications (quest already filtered above)
          return ['experience', 'stat', 'skill', 'quest'].includes(notification.type);
          
        } else {
          // Character users should only see:
          // - Resonance rewards (not experience)  
          // - Character stat gains
          // - Traditional items/artifacts/gear
          // - Quest progress
          
          if (notification.type === 'experience') {
            console.log(`Filtering out experience notification for character user: ${notification.message}`);
            return false;
          }
          
          if (notification.type === 'item') {
            // For character users, filter out notifications for gear that wasn't newly acquired
            const itemName = notification.message.replace('Gained ', '').replace('Found ', '').replace('Acquired ', '');
            const isNewlyAcquired = this.newlyAcquiredGear.has(itemName);
            console.log(`Item notification: ${itemName}, Newly acquired: ${isNewlyAcquired}`);
            return isNewlyAcquired;
          }
          
          // Keep resonance, stats, items, artifacts, and quest notifications
          return ['resonance', 'stat', 'item', 'artifact', 'quest'].includes(notification.type);
        }
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

  private async processItemRewards(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
    try {
      console.log('=== PROCESSING ITEM REWARDS ===');
      console.log('Effects:', effects);
      console.log('Source:', source);
      console.log('Research condition:', this.researchCondition);
      console.log('Character ID:', this.characterId);
      console.log('User ID:', this.userId);

      // Process items from effects
      console.log('Checking for rewards field:', effects.rewards);
      console.log('Checking for artifacts field:', effects.artifacts);
      console.log('Effects.rewards exists:', !!effects.rewards);
      console.log('Effects.artifacts exists:', !!effects.artifacts);
      console.log('Condition (effects.rewards || effects.artifacts):', !!(effects.rewards || effects.artifacts));
      
      if (effects.rewards || effects.artifacts) {
        const items = [...(effects.rewards || []), ...(effects.artifacts || [])];
        console.log('Processing items:', items);
        
        for (const itemName of items) {
          try {
            console.log(`=== PROCESSING ITEM: ${itemName} ===`);
            
            if (this.researchCondition === 'character') {
              // Character users get gear (ownership check happens inside this method)
              await this.processCharacterGearReward(itemName);
            } else {
              // Personality users get coping tools (ownership check happens inside this method)
              await this.processPersonalityCopingToolReward(itemName);
            }
            
          } catch (error) {
            console.error(`❌ Failed to process item ${itemName}:`, error);
            this.showNotification(`Failed to process ${itemName}`, 'item');
          }
        }
      } else {
        console.log('No items to process');
      }

      console.log('=== ITEM REWARDS PROCESSED ===');
    } catch (error) {
      console.error('Error processing item rewards:', error);
    }
  }

  private async processCharacterGearReward(itemName: string): Promise<void> {
    console.log(`=== PROCESSING CHARACTER GEAR REWARD: ${itemName} ===`);
    
    // Check if this item has already been processed to prevent duplicate notifications
    if (this.processedItems.has(itemName)) {
      console.log(`⚠️ Item "${itemName}" already processed, skipping to prevent duplicate notifications...`);
      return;
    }
    
    // Mark this item as processed
    this.processedItems.add(itemName);
    
    try {
      // Step 1: Get available gear types from the master gear list
      console.log('Step 1: Fetching available gear types from master list...');
      const availableGearTypes = await this.apiService.getAvailableGearTypes();
      console.log('Available gear types from master list:', availableGearTypes);
      
      // Step 2: Check if the story reward item exists in the master gear list
      const matchingGearType = availableGearTypes.find((gearType: any) => 
        gearType.name?.toLowerCase() === itemName.toLowerCase()
      );
      
      if (!matchingGearType) {
        console.log(`❌ Gear "${itemName}" not found in master gear list, skipping...`);
        return;
      }
      
      console.log(`✅ Found matching gear type in master list: ${matchingGearType.name} (ID: ${matchingGearType.id})`);
      
      // Step 3: Get character's all owned gear (both equipped and unequipped)
      console.log('Step 3: Fetching character\'s all owned gear...');
      const allOwnedGear = await this.apiService.getMyGear();
      console.log('Character all owned gear:', allOwnedGear);
      
      // Step 4: Check if character already owns this gear (equipped or unequipped)
      const alreadyOwnsGear = allOwnedGear?.some((gear: any) => 
        gear?.gear_type?.name?.toLowerCase() === itemName.toLowerCase() ||
        gear?.gear_type?.id === matchingGearType.id
      );
      
      if (alreadyOwnsGear) {
        console.log(`⚠️ Character already owns "${itemName}", skipping reward...`);
        
        // Show notification that reward was skipped
        this.showNotification(
          `You already own ${itemName}. Reward skipped.`,
          'item'
        );
        return;
      }
      
      // Check if character has this gear equipped (for upgrade logic)
      const characterWithGear = await this.apiService.getCharacterWithGear(this.characterId);
      const alreadyEquipped = characterWithGear.equipped_gear?.some((gear: any) => 
        gear?.name?.toLowerCase() === itemName.toLowerCase() ||
        gear?.id === matchingGearType.id
      );
      
      if (alreadyEquipped) {
        console.log(`⚠️ Character already has "${itemName}" equipped, checking for upgrade opportunities...`);
        
        // Check for upgrade opportunities
        const upgradeResult = checkItemOwnershipAndUpgrade(
          itemName, 
          this.playerInventory, 
          this.storyReplayCount
        );
        
        if (upgradeResult && (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0)) {
          console.log('Upgrade opportunity found:', upgradeResult);
          
          // Create upgrade notification
          const upgradeNotification = createUpgradeNotification(upgradeResult.upgrade);
          console.log('Showing upgrade notification:', upgradeNotification);
          
          this.showNotification(
            upgradeNotification.message, 
            upgradeNotification.type
          );
          
          // Save the upgraded item to backend
          await this.saveUpgradedItemToBackend(upgradeResult);
          this.updateLocalInventory(upgradeResult);
        } else {
          console.log('No upgrade opportunity, character already has this gear');
          // Don't show notification for already owned gear without upgrade
        }
        
        return;
      }
      
      // Step 5: Get character's unequipped gear to check full inventory
      console.log('Step 3: Checking character\'s full gear inventory...');
      const myGear = await this.apiService.getMyGear();
      console.log('Character\'s full gear inventory:', myGear);
      
      const alreadyOwned = myGear.some((characterGear: any) => 
        characterGear.gear_type?.id === matchingGearType.id ||
        characterGear.gear_type?.name?.toLowerCase() === itemName.toLowerCase()
      );
      
      if (alreadyOwned) {
        console.log(`⚠️ Character already owns "${itemName}" in inventory, checking for upgrade...`);
        
        // Check for upgrade opportunities
        const upgradeResult = checkItemOwnershipAndUpgrade(
          itemName, 
          this.playerInventory, 
          this.storyReplayCount
        );
        
        if (upgradeResult && (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0)) {
          console.log('Upgrade opportunity found for owned gear:', upgradeResult);
          
          // Create upgrade notification
          const upgradeNotification = createUpgradeNotification(upgradeResult.upgrade);
          this.showNotification(
            upgradeNotification.message, 
            upgradeNotification.type
          );
          
          // Save the upgraded item to backend
          await this.saveUpgradedItemToBackend(upgradeResult);
          this.updateLocalInventory(upgradeResult);
        } else {
          console.log('No upgrade available, gear already owned');
        }
        
        return;
      }
      
      // Step 6: Character doesn't have this gear, acquire it
      console.log(`✅ Character doesn't have "${itemName}", acquiring new gear...`);
      
      try {
        const acquiredGear = await this.apiService.acquireGear(matchingGearType.id);
        console.log(`✅ Successfully acquired new gear: ${itemName}`, acquiredGear);
        
        // Mark as newly acquired for notification purposes
        this.newlyAcquiredGear.add(itemName);
        
        // Show notification for the new gear
        this.showNotification(
          `Acquired ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`, 
          'item'
        );
        
      } catch (gearError: any) {
        console.error(`❌ Failed to acquire new gear ${itemName}:`, gearError);
        
        // Handle specific error cases
        if (gearError.response?.status === 400) {
          console.log('Gear acquisition failed due to validation error, might already exist');
        } else if (gearError.response?.status === 500 && gearError.response?.data?.includes('duplicate key')) {
          console.log('Duplicate key error - gear probably already exists');
          // Don't show error notification for duplicates
        } else {
          this.showNotification(`Failed to acquire ${itemName}`, 'item');
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to process character gear reward ${itemName}:`, error);
      
      // Fallback: Try to save as regular item
      console.log('Falling back to regular item acquisition...');
      
      // Guard against personality-tagged gear during fallback
      if (this.researchCondition === 'personality' && this.primaryTrait) {
        const userSlug = normalizePersonalitySlug(this.primaryTrait);
        // For now, skip fallback for personality users to avoid awarding character gear
        console.log('Skipping fallback item acquisition for personality user:', itemName);
        return; // do not award character gear to personality users
      }
      
      await this.saveRegularItemToBackend(itemName);
    }
  }

  private async processPersonalityCopingToolReward(itemName: string): Promise<void> {
    console.log(`=== PROCESSING PERSONALITY COPING TOOL REWARD: ${itemName} ===`);
    
    // Check if this item has already been processed to prevent duplicate notifications
    if (this.processedItems.has(itemName)) {
      console.log(`⚠️ Item "${itemName}" already processed, skipping to prevent duplicate notifications...`);
      return;
    }
    
    // Mark this item as processed
    this.processedItems.add(itemName);
    
    try {
      // Get available coping tools from the API
      const availableCopingTools = await this.apiService.getAvailableCopingTools();
      console.log('Available coping tools:', availableCopingTools);
      
      // Find the coping tool by name (case-insensitive)
      const matchingTool = availableCopingTools.find((tool: any) => 
        tool.name.toLowerCase() === itemName.toLowerCase()
      );
      
      if (matchingTool) {
        console.log(`✅ Found matching coping tool: ${matchingTool.name}`);
        
        // Check if user already has this coping tool
        try {
          const myTools = await this.apiService.getMyTools();
          console.log('User\'s current coping tools:', myTools);
          
          const alreadyOwnsTool = myTools?.some((tool: any) => 
            tool?.name?.toLowerCase() === itemName.toLowerCase() ||
            tool?.tool_id === matchingTool.tool_id
          );
          
          if (alreadyOwnsTool) {
            console.log(`⚠️ User already owns coping tool "${itemName}", skipping reward...`);
            
            // Show notification that reward was skipped
            this.showNotification(
              `You already have ${matchingTool.name}. Reward skipped.`,
              'skill'
            );
            return;
          }
        } catch (ownershipError) {
          console.warn('Could not check coping tool ownership, proceeding with acquisition:', ownershipError);
        }
        
        // Acquire the coping tool since user doesn't already have it
        try {
          const acquiredTool = await this.apiService.acquireCopingToolByName(matchingTool.name);
          console.log(`✅ Successfully acquired coping tool: ${acquiredTool?.name || matchingTool.name}`);
          
          // Show notification for the successfully acquired coping tool
          this.showNotification(
            `Unlocked ${matchingTool.name}! ${matchingTool.emoji_icon}`, 
            'skill'
          );
          
        } catch (apiError) {
          console.error(`❌ API error while acquiring coping tool "${matchingTool.name}":`, apiError);
          // Still show notification for the coping tool
          this.showNotification(
            `Unlocked ${matchingTool.name}! ${matchingTool.emoji_icon}`, 
            'skill'
          );
        }
        
      } else {
        console.log(`❌ Coping tool "${itemName}" not found in available tools`);
        // Don't show notification for non-existent tools
        return;
      }
      
    } catch (error) {
      console.error(`❌ Failed to process personality coping tool reward ${itemName}:`, error);
      throw error;
    }
  }

  // Save upgraded item to backend
  private async saveUpgradedItemToBackend(upgradeResult: UpgradedEquipmentReward): Promise<void> {
    try {
      console.log('=== SAVING UPGRADED ITEM TO BACKEND ===');
      console.log('Upgrade result:', upgradeResult);
      console.log('Research condition:', this.researchCondition);
      console.log('Character ID:', this.characterId);
      
      // Skip character gear acquisition for personality users
      if (this.researchCondition === 'personality') {
        console.log('🚫 Skipping character gear acquisition for personality user');
        return;
      }
      
      const { upgradedItem, upgrade } = upgradeResult;
      
      // Get available gear types from the master list
      const availableGearTypes = await this.apiService.getAvailableGearTypes();
      console.log('Available gear types from master list:', availableGearTypes);
      
      // Find the gear type by name (case-insensitive)
      const matchingGearType = availableGearTypes.find((gearType: any) => 
        gearType.name?.toLowerCase() === upgradedItem.toLowerCase()
      );
      
      if (!matchingGearType) {
        console.log(`❌ Gear type "${upgradedItem}" not found in master gear list`);
        return;
      }
      
      console.log(`✅ Found matching gear type for upgrade: ${matchingGearType.name} (ID: ${matchingGearType.id})`);
      
      // Check if user already has this gear using the proper endpoints
      const characterWithGear = await this.apiService.getCharacterWithGear(this.characterId);
      const myGear = await this.apiService.getMyGear();
      
      // Check equipped gear
      const alreadyEquipped = characterWithGear.equipped_gear?.some((gear: any) => 
        gear?.name?.toLowerCase() === upgradedItem.toLowerCase() ||
        gear?.id === matchingGearType.id
      );
      
      // Check full inventory
      const alreadyOwned = myGear.some((characterGear: any) => 
        characterGear.gear_type?.id === matchingGearType.id ||
        characterGear.gear_type?.name?.toLowerCase() === upgradedItem.toLowerCase()
      );
      
      if (alreadyEquipped || alreadyOwned) {
        console.log(`⚠️ User already has upgraded gear: ${matchingGearType.name}`);
        
        // For upgrades, show the upgrade notification but don't acquire new gear
        if (upgradeResult.isUpgrade) {
          this.showNotification(
            `${matchingGearType.name} upgraded! ${matchingGearType.emoji_icon || '⬆️'}`, 
            'upgrade'
          );
        } else if (upgrade.statBonus > 0) {
          this.showNotification(
            `${matchingGearType.name} strengthened! +${upgrade.statBonus} stats`, 
            'strengthen'
          );
        }
        
        return;
      }
      
      // User doesn't have this gear, acquire it
      try {
        const gearResult = await this.apiService.acquireGear(matchingGearType.id);
        console.log(`✅ Upgraded gear acquired successfully: ${upgradedItem}`, gearResult);
        
        // Mark as newly acquired for notification purposes
        this.newlyAcquiredGear.add(upgradedItem);
        
        // Show appropriate upgrade notification
        if (upgradeResult.isUpgrade) {
          this.showNotification(
            `Acquired upgraded ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`, 
            'upgrade'
          );
        } else {
          this.showNotification(
            `Acquired ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`, 
            'new'
          );
        }
        
      } catch (gearError: any) {
        console.error(`❌ Failed to acquire upgraded gear ${upgradedItem}:`, gearError);
        
        // Handle specific error cases
        if (gearError.response?.status === 400) {
          console.log('Gear acquisition failed due to validation error');
        } else if (gearError.response?.status === 500 && gearError.response?.data?.includes('duplicate key')) {
          console.log('Duplicate key error - gear already exists');
        } else {
          this.showNotification(`Failed to acquire ${upgradedItem}`, 'item');
        }
      }
      
    } catch (error) {
      console.error('Error saving upgraded item to backend:', error);
    }
  }

  // Save regular item to backend (fallback)
  private async saveRegularItemToBackend(itemName: string): Promise<void> {
    try {
      console.log(`=== SAVING REGULAR ITEM: ${itemName} ===`);
      
      // Skip character gear acquisition for personality users
      if (this.researchCondition === 'personality') {
        console.log('🚫 Skipping character gear acquisition for personality user');
        return;
      }
      
      // Get available gear types from the master list
      const availableGearTypes = await this.apiService.getAvailableGearTypes();
      console.log('Available gear types from master list:', availableGearTypes);
      
      // Find the gear type by name (case-insensitive)
      const matchingGearType = availableGearTypes.find((gearType: any) => 
        gearType.name?.toLowerCase() === itemName.toLowerCase()
      );
      
      if (!matchingGearType) {
        console.log(`❌ Gear type "${itemName}" not found in master gear list`);
        return;
      }
      
      console.log(`✅ Found matching gear type: ${matchingGearType.name} (ID: ${matchingGearType.id})`);
      
      // Check if user already has this gear using proper endpoints
      const characterWithGear = await this.apiService.getCharacterWithGear(this.characterId);
      const myGear = await this.apiService.getMyGear();
      
      // Check equipped gear
      const alreadyEquipped = characterWithGear.equipped_gear?.some((gear: any) => 
        gear?.name?.toLowerCase() === itemName.toLowerCase() ||
        gear?.id === matchingGearType.id
      );
      
      // Check full inventory
      const alreadyOwned = myGear.some((characterGear: any) => 
        characterGear.gear_type?.id === matchingGearType.id ||
        characterGear.gear_type?.name?.toLowerCase() === itemName.toLowerCase()
      );
      
      if (alreadyEquipped || alreadyOwned) {
        console.log(`⚠️ User already has gear: ${matchingGearType.name}`);
        // Don't show notification for already owned gear in fallback
        return;
      }
      
      // Acquire the gear
      try {
        const gearResult = await this.apiService.acquireGear(matchingGearType.id);
        console.log(`✅ Successfully acquired gear: ${gearResult.gear_type?.name || matchingGearType.name}`);
        
        // Mark as newly acquired for notification purposes
        this.newlyAcquiredGear.add(matchingGearType.name);
        
        // Show notification for the successfully acquired gear
        this.showNotification(
          `Acquired ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`, 
          'item'
        );
        
      } catch (apiError: any) {
        console.error(`❌ API error while acquiring gear "${matchingGearType.name}":`, apiError);
        
        // Handle specific error cases
        if (apiError.response?.status === 400) {
          console.log('Gear acquisition failed due to validation error');
        } else if (apiError.response?.status === 500 && apiError.response?.data?.includes('duplicate key')) {
          console.log('Duplicate key error - gear already exists');
        } else {
          this.showNotification(`Failed to acquire ${itemName}`, 'item');
        }
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
            console.log(`Attempting to acquire item: ${itemName}`);
            console.log(`Research condition: ${this.researchCondition}`);
            console.log(`Character ID: ${this.characterId}, User ID: ${this.userId}`);
            
            if (this.researchCondition === "personality" && this.userId) {
              // For personality users, process coping tools
              await this.processPersonalityCopingToolReward(itemName);
            } else if (this.researchCondition === "character" && this.characterId > 0) {
              // For character users, process gear
              await this.processCharacterGearReward(itemName);
            } else {
              console.log(`Skipping item acquisition - invalid conditions: researchCondition=${this.researchCondition}, characterId=${this.characterId}, userId=${this.userId}`);
            }
          } catch (error) {
            console.error(`Failed to acquire item ${itemName}:`, error);
          }
        }
      }

      console.log('=== REWARDS SAVED TO BACKEND ===');
    } catch (error) {
      console.error('Error saving rewards to backend:', error);
      // Don't throw - we still want to show the notification even if saving fails
    }
  }

  // Save quest progress directly to backend
  private async sendQuestCompletionEvents(effects: Record<string, any>, storyId: string, currentPassageId: string): Promise<void> {
    try {
      console.log('=== SAVING QUEST PROGRESS ===');
      console.log('Effects:', effects);
      console.log('Story ID:', storyId);
      console.log('Current passage ID:', currentPassageId);
      console.log('Research condition:', this.researchCondition);
      console.log('Primary trait:', this.primaryTrait);
      console.log('Already processed quests:', Array.from(this.processedQuests));
      
      // Extract quest progress from effects
      const questProgress: Record<string, number> = {};
      
      console.log('Extracting quest progress from effects...');
      
      // Handle quest_progress field (new format)
      if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
        console.log('Found quest_progress array:', effects.quest_progress);
        effects.quest_progress.forEach((questId: string) => {
          questProgress[questId] = (questProgress[questId] || 0) + 1;
          console.log(`Added quest progress for ${questId}: ${questProgress[questId]}`);
        });
      }
      
      // Handle quests field (legacy format)
      if (effects.quests) {
        console.log('Found quests field:', effects.quests);
        if (Array.isArray(effects.quests)) {
          effects.quests.forEach((questId: string) => {
            questProgress[questId] = (questProgress[questId] || 0) + 1;
            console.log(`Added quest progress for ${questId}: ${questProgress[questId]}`);
          });
        } else if (typeof effects.quests === 'string') {
          questProgress[effects.quests] = (questProgress[effects.quests] || 0) + 1;
          console.log(`Added quest progress for ${effects.quests}: ${questProgress[effects.quests]}`);
        }
      }
      
      // Filter quests based on user type
      const filteredQuestProgress: Record<string, number> = {};
      
      for (const [questId, progress] of Object.entries(questProgress)) {
        if (this.researchCondition === 'character') {
          // Character users should NOT get personality-specific quests
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch) {
            console.log(`🚫 Filtering out personality quest ${questId} for character user`);
            continue; // Skip personality-specific quests for character users
          }
          // Keep common quests (those that don't match personality pattern)
          filteredQuestProgress[questId] = progress;
          console.log(`✅ Keeping common quest ${questId} for character user`);
        } else {
          // Personality users get quests that match their trait
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch && this.primaryTrait) {
            const questTrait = questTraitMatch[1];
            const matches = questTrait.toLowerCase() === this.primaryTrait.toLowerCase();
            if (matches) {
              filteredQuestProgress[questId] = progress;
              console.log(`✅ Keeping quest ${questId} for personality user with trait ${this.primaryTrait}`);
            } else {
              console.log(`🚫 Filtering out quest ${questId} for personality user with trait ${this.primaryTrait}`);
            }
          } else {
            // Keep common quests (those that don't match personality pattern)
            filteredQuestProgress[questId] = progress;
            console.log(`✅ Keeping common quest ${questId} for personality user`);
          }
        }
      }
      
      if (Object.keys(filteredQuestProgress).length > 0) {
        console.log('Filtered quest progress to save:', filteredQuestProgress);
        console.log('Research condition:', this.researchCondition);
        console.log('Primary trait:', this.primaryTrait);
        console.log('=== QUEST PROGRESS SAVING DEBUG ===');
        console.log('Effects received by sendQuestCompletionEvents:', effects);
        console.log('Quest progress extracted:', questProgress);
        console.log('Filtered quest progress:', filteredQuestProgress);
        console.log('Number of quests to save:', Object.keys(filteredQuestProgress).length);
        
        try {
          // Save quest progress directly to backend - one call per quest
          for (const [questId, progress] of Object.entries(filteredQuestProgress)) {
            console.log(`=== SAVING QUEST: ${questId} ===`);
            console.log(`Quest ID: ${questId}`);
            console.log(`Progress: ${progress}`);
            console.log(`Story ID: ${this.storyId}`);
            console.log(`Research condition: ${this.researchCondition}`);
            
            await this.apiService.saveQuestProgress({
              storyId: this.storyId,
              questSlug: questId,
              storyVariables: {
                progress: progress,
                source: 'story_passage'
              },
              playerState: {
                quest_progress: { [questId]: progress }
              }
            });
            console.log(`✅ Quest progress saved for ${questId}: ${progress}`);
          }
          console.log('✅ All quest progress saved successfully');
          
          // Show quest completion notifications
          Object.entries(filteredQuestProgress).forEach(([questId, progress]) => {
            const questInfo = getQuestInfo(questId);
            const questTitle = questInfo?.title || questId;
            this.showNotification(`🎯 Quest Progress: ${questTitle}`, 'quest');
          });
          
        } catch (questError) {
          console.error('❌ Failed to save quest progress:', questError);
        }
              } else {
          console.log('No quest progress to save');
          console.log('Quest progress object is empty');
        }
      
    } catch (error) {
      console.error('❌ Failed to save quest progress:', error);
    }
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

/**
 * Test function to verify the new equipment reward system
 * This function tests the proper integration with master gear list and character equipped gear
 */
export async function testEquipmentRewardSystem(apiService: any, characterId: number): Promise<void> {
  console.log('=== TESTING NEW EQUIPMENT REWARD SYSTEM ===');
  
  try {
    // Test 1: Get available gear types from master list
    console.log('\n--- Test 1: Master Gear List ---');
    const availableGearTypes = await apiService.getAvailableGearTypes();
    console.log('Available gear types from master list:', availableGearTypes);
    console.log('Number of available gear types:', availableGearTypes.length);
    
    if (availableGearTypes.length > 0) {
      const firstGear = availableGearTypes[0];
      console.log('First available gear:', firstGear);
      console.log('Gear properties:', Object.keys(firstGear));
    }
    
    // Test 2: Get character's current gear
    console.log('\n--- Test 2: Character Gear Check ---');
    const characterWithGear = await apiService.getCharacterWithGear(characterId);
    console.log('Character equipped_gear array:', characterWithGear.equipped_gear);
    
    const myGear = await apiService.getMyGear();
    console.log('Character full gear inventory:', myGear);
    console.log('Number of owned gear items:', myGear.length);
    
    const equippedGear = await apiService.getEquippedGear();
    console.log('Equipped gear only:', equippedGear);
    console.log('Number of equipped gear items:', equippedGear.length);
    
    // Test 3: Test reward processing logic
    console.log('\n--- Test 3: Reward Processing Logic ---');
    
    // Create a mock story reward manager
    const mockShowNotification = (message: string, type: string) => {
      console.log(`📢 NOTIFICATION: ${message} (${type})`);
    };
    
    const mockOnStoryComplete = (data: any) => {
      console.log('Story completed with data:', data);
    };
    
    const rewardManager = new StoryRewardManager(
      'test-story',
      mockShowNotification,
      mockOnStoryComplete,
      apiService,
      characterId,
      [], // empty inventory
      0,  // no replays
      'character', // character user
      undefined, // no user ID
      undefined  // no primary trait
    );
    
    // Test with some common gear names
    const testGearNames = ['Ancient Scroll', 'Lens of Gentle Seeing', 'Focus Crystal', 'Shield of Resolve'];
    
    for (const gearName of testGearNames) {
      console.log(`\n--- Testing gear reward: ${gearName} ---`);
      
      // Check if this gear exists in the master list
      const matchingGear = availableGearTypes.find((gear: any) => 
        gear.name?.toLowerCase() === gearName.toLowerCase()
      );
      
      if (matchingGear) {
        console.log(`✅ ${gearName} found in master list:`, matchingGear);
        
        // Check if character already has this gear
        const alreadyEquipped = characterWithGear.equipped_gear?.some((gear: any) => 
          gear?.name?.toLowerCase() === gearName.toLowerCase() ||
          gear?.id === matchingGear.id
        );
        
        const alreadyOwned = myGear.some((characterGear: any) => 
          characterGear.gear_type?.id === matchingGear.id ||
          characterGear.gear_type?.name?.toLowerCase() === gearName.toLowerCase()
        );
        
        console.log(`   Already equipped: ${alreadyEquipped}`);
        console.log(`   Already owned: ${alreadyOwned}`);
        
        if (!alreadyEquipped && !alreadyOwned) {
          console.log(`   → Would acquire ${gearName} as new gear`);
        } else {
          console.log(`   → Would check for upgrade opportunities for ${gearName}`);
        }
        
      } else {
        console.log(`❌ ${gearName} NOT found in master list`);
      }
    }
    
    // Test 4: Test reward processing with actual effects
    console.log('\n--- Test 4: Story Effects Processing ---');
    
    const testPassageEffects = {
      experience: 10,
      awareness: 2,
      rewards: ['Ancient Scroll', 'Focus Crystal']
    };
    
    console.log('Test passage effects:', testPassageEffects);
    console.log('Processing test rewards...');
    
    // Test the private method through a mock passage visit
    const mockPassage = {
      id: 1,
      chapter: 1,
      passage_id: 'test-passage',
      content: 'Test passage content',
      passage_type: 'narration' as const,
      speaker: null,
      required_conditions: {},
      story_effects: testPassageEffects,
      mood: '',
      background_music: '',
      background_image: null,
      order: 1,
      choices: []
    };
    
    // This tests the full reward processing pipeline
    await rewardManager.handlePassageVisit(mockPassage);
    
    console.log('✅ Test reward processing completed');
    
  } catch (error: any) {
    console.error('❌ Equipment reward system test failed:', error);
    console.error('Error details:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack || 'No stack trace'
    });
  }
  
  console.log('\n=== EQUIPMENT REWARD SYSTEM TEST COMPLETE ===');
}

/**
 * Debug function to check API endpoints are working correctly
 */
export async function debugEquipmentEndpoints(apiService: any): Promise<void> {
  console.log('=== DEBUGGING EQUIPMENT API ENDPOINTS ===');
  
  try {
    // Test each endpoint individually
    console.log('\n1. Testing gear-types/available endpoint...');
    try {
      const availableGear = await apiService.getAvailableGearTypes();
      console.log('✅ Available gear types:', availableGear?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Failed to get available gear types:', error);
    }
    
    console.log('\n2. Testing character-gear/my_gear endpoint...');
    try {
      const myGear = await apiService.getMyGear();
      console.log('✅ My gear:', myGear?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Failed to get my gear:', error);
    }
    
    console.log('\n3. Testing character-gear/equipped endpoint...');
    try {
      const equippedGear = await apiService.getEquippedGear();
      console.log('✅ Equipped gear:', equippedGear?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Failed to get equipped gear:', error);
    }
    
    console.log('\n4. Testing characters/{id}/ endpoint for equipped_gear...');
    try {
      const character = await apiService.getMyCharacter();
      console.log('✅ Character equipped_gear array:', character.equipped_gear?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Failed to get character with gear:', error);
    }
    
  } catch (error) {
    console.error('❌ Equipment endpoint debugging failed:', error);
  }
  
  console.log('\n=== EQUIPMENT ENDPOINT DEBUGGING COMPLETE ===');
}

// Export the debug function for use in story components
// export { debugRewardDetection } from './rewardsUtils'; // Removed: not exported by rewardsUtils

export function checkItemOwnershipAndUpgrade(itemName: string, playerInventory: string[], storyReplayCount: number): UpgradedEquipmentReward | undefined {
  // Example implementation: check if item is in inventory and if replay count allows upgrade
  const alreadyOwned = playerInventory.some(item => item.toLowerCase() === itemName.toLowerCase());
  const isUpgrade = alreadyOwned && storyReplayCount > 0;
  const upgrade = {
    statBonus: isUpgrade ? storyReplayCount : 0,
    message: isUpgrade ? `Upgraded ${itemName}` : '',
    type: isUpgrade ? 'upgrade' : 'item',
    itemName: itemName,
    currentLevel: isUpgrade ? storyReplayCount : 1,
    newLevel: isUpgrade ? storyReplayCount + 1 : 1,
    rarity: "Common" as "Common" | "Rare" | "Epic" | "Legendary",
    upgradeMessage: isUpgrade ? `Upgraded ${itemName} to level ${storyReplayCount + 1}` : ''
  };
  if (isUpgrade) {
    return {
      originalItem: itemName,
      upgradedItem: itemName,
      isUpgrade,
      upgrade
    };
  }
  return undefined;
}

