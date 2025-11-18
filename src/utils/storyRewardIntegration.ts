// ===== STORY REWARD INTEGRATION =====
// Manages story rewards for both character and personality users
// Handles filtering, notifications, and backend synchronization

import {
  GearCache,
  NotificationData,
  StoryRewardTracker,
  UpgradedEquipmentReward
} from '../types/rewards';
import { Choice, Passage, SavedRewards } from '../types/story';
import {
  applyChoiceRewards,
  applyPassageRewards,
  calculateTotalRewards,
  createNotificationFromEffects,
  createUpgradeNotification,
  filterEffectsForCharacterUser,
  filterEffectsForPersonalityUser,
  getQuestInfo,
  getRewardFieldName,
  getRewardType,
  handleStoryCompletionRewards,
  hasChoiceRewards,
  hasPassageRewards,
  initializeRewardTracker
} from './rewardsUtils';

// ===== CONSTANTS =====

const CACHE_DURATION_MS = 5000; // 5 seconds cache for gear data

// ===== STORY REWARD MANAGER =====

export class StoryRewardManager {
  private rewardTracker: StoryRewardTracker;
  private showNotification: (message: string, type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest', icon?: string, iconImage?: any, statName?: string) => void;
  private onStoryComplete: (completionData: any) => void;
  private apiService: any;
  private characterId: number;
  private userId?: number;
  private processedPassages: Set<string> = new Set();
  private processedChoices: Set<string> = new Set();
  private newlyAcquiredGear: Set<string> = new Set();
  private sentNotifications: Set<string> = new Set();
  private processedItems: Set<string> = new Set();
  private playerInventory: string[] = [];
  private storyReplayCount: number = 0;
  private researchCondition: "character" | "personality";
  private primaryTrait?: string;
  private storyId: string;
  private gearCache: GearCache = {};

  constructor(
    storyId: string,
    showNotification: (message: string, type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest', icon?: string, iconImage?: any, statName?: string) => void,
    onStoryComplete: (completionData: any) => void,
    apiService: any,
    characterId: number,
    playerInventory: string[] = [],
    storyReplayCount: number = 0,
    researchCondition: "character" | "personality" = "personality",
    userId?: number,
    primaryTrait?: string
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

  // ===== GEAR CACHING =====

  private isCacheValid(): boolean {
    if (!this.gearCache.timestamp) return false;
    return Date.now() - this.gearCache.timestamp < CACHE_DURATION_MS;
  }

  private async getCachedGearData(): Promise<GearCache> {
    if (this.isCacheValid() && this.gearCache.availableGearTypes) {
      return this.gearCache;
    }

    const [availableGearTypes, myGear, characterWithGear] = await Promise.all([
      this.apiService.getAvailableGearTypes(),
      this.apiService.getMyGear(),
      this.characterId > 0 ? this.apiService.getCharacterWithGear(this.characterId) : Promise.resolve(null)
    ]);

    this.gearCache = {
      availableGearTypes,
      myGear,
      characterWithGear,
      timestamp: Date.now()
    };

    return this.gearCache;
  }

  private clearGearCache(): void {
    this.gearCache = {};
  }

  // ===== FILTERING =====

  private filterEffectsByUserType(effects: any): any {
    if (this.researchCondition === "personality" && this.primaryTrait) {
      return filterEffectsForPersonalityUser(effects, this.primaryTrait);
    } else {
      return filterEffectsForCharacterUser(effects);
    }
  }

  // ===== NOTIFICATION FILTERING =====

  private filterNotifications(notifications: NotificationData[]): NotificationData[] {
    console.log(`🔍 [StoryRewardManager] filterNotifications - filtering ${notifications.length} notifications for ${this.researchCondition} user`);

    return notifications.filter(notification => {
      const notificationKey = `${notification.message}_${notification.type}`;

      if (this.sentNotifications.has(notificationKey)) {
        console.log(`   ⏭️ Already sent: ${notification.message} (type: ${notification.type})`);
        return false;
      }

      const isValid = this.researchCondition === "personality"
        ? this.isValidPersonalityNotification(notification)
        : this.isValidCharacterNotification(notification);

      if (!isValid) {
        console.log(`   ❌ Invalid for ${this.researchCondition} user: ${notification.message} (type: ${notification.type})`);
      } else {
        console.log(`   ✅ Valid: ${notification.message} (type: ${notification.type})`);
      }

      return isValid;
    });
  }

  private isValidPersonalityNotification(notification: NotificationData): boolean {
    if (notification.type === 'lumens' || notification.type === 'item' || notification.type === 'artifact') {
      return false;
    }

    // Quest notifications are already filtered by personality trait in createNotificationFromEffects
    // and filterEffectsForPersonalityUser, so we can allow them through here
    if (notification.type === 'quest') {
      return true;
    }

    return ['experience', 'stat', 'skill'].includes(notification.type);
  }

  private isValidCharacterNotification(notification: NotificationData): boolean {
  if (notification.type === 'lumens') {
    return true;  // Allow lumens for character users
  }

  return ['experience', 'stat', 'item', 'artifact', 'quest'].includes(notification.type);
}

  private displayNotifications(notifications: NotificationData[]): void {
    console.log(`🔔 [StoryRewardManager] displayNotifications called with ${notifications.length} notifications`);

    const validNotifications = this.filterNotifications(notifications);
    console.log(`   ✅ Valid notifications after filtering: ${validNotifications.length}`);

    validNotifications.forEach(notification => {
        const notificationKey = `${notification.message}_${notification.type}`;
        console.log(`   📣 Showing notification: ${notification.message} (type: ${notification.type})`);
        this.sentNotifications.add(notificationKey);
      this.showNotification(
        notification.message,
        notification.type,
        notification.icon,
        notification.iconImage,
        notification.statName
      );
    });
  }

  // ===== GEAR OWNERSHIP CHECKING =====

  private async checkGearOwnership(itemName: string): Promise<{
    alreadyOwns: boolean;
    alreadyEquipped: boolean;
    matchingGearType?: any;
  }> {
    const cache = await this.getCachedGearData();

    if (!cache.availableGearTypes) {
      return { alreadyOwns: false, alreadyEquipped: false };
    }

    const matchingGearType = cache.availableGearTypes.find((gearType: any) =>
      gearType.name?.toLowerCase() === itemName.toLowerCase()
    );

    if (!matchingGearType) {
      return { alreadyOwns: false, alreadyEquipped: false };
    }

    const alreadyEquipped = cache.characterWithGear?.equipped_gear?.some((gear: any) =>
      gear?.name?.toLowerCase() === itemName.toLowerCase() ||
      gear?.id === matchingGearType.id
    ) || false;

    const alreadyOwns = cache.myGear?.some((gear: any) =>
      gear?.gear_type?.name?.toLowerCase() === itemName.toLowerCase() ||
      gear?.gear_type?.id === matchingGearType.id
    ) || false;

    return { alreadyOwns, alreadyEquipped, matchingGearType };
  }

  private async filterOwnedItemsFromEffects(effects: Record<string, any>): Promise<Record<string, any>> {
    const filteredEffects = { ...effects };

    // For character users, filter out owned gear from rewards and artifacts
    if (this.researchCondition === 'character') {
      if (filteredEffects.rewards && Array.isArray(filteredEffects.rewards)) {
        const filteredRewards = [];
        for (const itemName of filteredEffects.rewards) {
          try {
            const { alreadyOwns } = await this.checkGearOwnership(itemName);
            const canUpgrade = alreadyOwns && this.storyReplayCount > 0;

            // Include item if: player doesn't own it OR it can be upgraded
            if (!alreadyOwns || canUpgrade) {
              filteredRewards.push(itemName);
            }
          } catch (error) {
            console.error(`❌ [StoryRewardManager] Error checking gear ownership for ${itemName}:`, error);
            // Include item if ownership check fails (fail open)
            filteredRewards.push(itemName);
          }
        }
        filteredEffects.rewards = filteredRewards;
      }

      if (filteredEffects.artifacts && Array.isArray(filteredEffects.artifacts)) {
        const filteredArtifacts = [];
        for (const itemName of filteredEffects.artifacts) {
          try {
            const { alreadyOwns } = await this.checkGearOwnership(itemName);
            const canUpgrade = alreadyOwns && this.storyReplayCount > 0;

            // Include item if: player doesn't own it OR it can be upgraded
            if (!alreadyOwns || canUpgrade) {
              filteredArtifacts.push(itemName);
            }
          } catch (error) {
            console.error(`❌ [StoryRewardManager] Error checking gear ownership for ${itemName}:`, error);
            // Include item if ownership check fails (fail open)
            filteredArtifacts.push(itemName);
          }
        }
        filteredEffects.artifacts = filteredArtifacts;
      }
    }

    // For personality users, filter out owned coping tools
    if (this.researchCondition === 'personality') {
      if (filteredEffects.tools && Array.isArray(filteredEffects.tools)) {
        try {
          const myTools = await this.apiService.getMyTools();
          const filteredTools = filteredEffects.tools.filter((toolName: string) => {
            // Check by both name AND tool_id since stories may use either format
            const alreadyOwnsTool = myTools?.some((tool: any) =>
              tool?.name?.toLowerCase() === toolName.toLowerCase() ||
              tool?.tool_id === toolName ||
              tool?.tool_id === toolName.toLowerCase()
            );
            return !alreadyOwnsTool;
          });
          filteredEffects.tools = filteredTools;
        } catch (error: any) {
          // 404 is expected for users who don't have the coping tools endpoint set up yet
          if (error.response?.status === 404) {
          } else {
            console.error(`❌ [StoryRewardManager] Error fetching coping tools (${error.response?.status || error.code}):`, error.message);
          }
          // If fetching tools fails (404, etc.), keep all tools in effects (fail open)
          // This is expected for users who don't have coping tools set up yet
        }
      }
    }

    return filteredEffects;
  }

  // ===== PASSAGE & CHOICE HANDLERS =====

  async handlePassageVisit(passage: Passage): Promise<void> {
    console.log(`🔍 [StoryRewardManager] handlePassageVisit called for passage: ${passage.passage_id}`);
    console.log(`   Research condition: ${this.researchCondition}, Primary trait: ${this.primaryTrait}`);

    if (this.processedPassages.has(passage.passage_id)) {
      console.log(`   ⏭️ Passage already processed - skipping`);
      return;
    }

    const hasRewards = hasPassageRewards(passage);
    console.log(`   Has rewards: ${hasRewards}`);

    if (hasRewards) {
      const originalEffects = passage.story_effects || passage.effects;
      console.log(`   📦 Original effects:`, JSON.stringify(originalEffects, null, 2));

      const filteredEffects = this.filterEffectsByUserType(originalEffects);
      console.log(`   🔎 Filtered effects for ${this.researchCondition} user:`, JSON.stringify(filteredEffects, null, 2));

      this.rewardTracker = applyPassageRewards(this.rewardTracker, passage);

      try {
        await this.processEffects(filteredEffects, 'passage', passage.passage_id);
      } catch (error) {
        console.error(`❌ [StoryRewardManager] Error processing effects:`, error);
      }

      // Filter out already-owned items before creating notifications
      try {
        const effectsForNotification = await this.filterOwnedItemsFromEffects(filteredEffects);
        console.log(`   🧹 Effects after filtering owned items:`, JSON.stringify(effectsForNotification, null, 2));

        const notifications = createNotificationFromEffects(effectsForNotification, this.researchCondition, this.primaryTrait);
        console.log(`   🔔 Notifications created (${notifications.length}):`, JSON.stringify(notifications, null, 2));

        this.displayNotifications(notifications);
      } catch (error) {
        console.error(`❌ [StoryRewardManager] Error creating notifications:`, error);
      }
    }

    this.processedPassages.add(passage.passage_id);
    console.log(`   ✅ Passage marked as processed`);
  }

  async handleChoiceMade(choice: Choice, passageId: string): Promise<void> {

    const choiceKey = `${passageId}_choice_${choice.id}`;

    if (this.processedChoices.has(choiceKey)) {
      return;
    }

    const hasRewards = hasChoiceRewards(choice);

    if (hasRewards) {
      const filteredEffects = this.filterEffectsByUserType(choice.effects);

      this.rewardTracker = applyChoiceRewards(this.rewardTracker, choice, passageId);

      await this.processEffects(filteredEffects, 'choice', passageId);

      // Filter out already-owned items before creating notifications
      const effectsForNotification = await this.filterOwnedItemsFromEffects(filteredEffects);
      const notifications = createNotificationFromEffects(effectsForNotification, this.researchCondition, this.primaryTrait);
      this.displayNotifications(notifications);
    } else {
    }

    this.processedChoices.add(choiceKey);
  }

  // ===== REWARD PROCESSING =====

  private async processEffects(effects: Record<string, any>, source: 'passage' | 'choice', passageId: string): Promise<void> {
    if (effects.rewards || effects.artifacts || effects.tools) {
      await this.processItemRewards(effects);
    }
    
    if (effects.experience || effects.stats || this.hasWellnessStats(effects)) {
      await this.saveRewardsToBackend(effects, source);
    }

    if (effects.quests || effects.quest_progress) {
      await this.saveQuestProgress(effects, passageId);
    }
  }

  private hasWellnessStats(effects: Record<string, any>): boolean {
    return Object.keys(effects).some(key =>
      ['awareness', 'exploration', 'resilience', 'courage', 'connection', 'balance', 'fear'].includes(key.toLowerCase())
    );
  }

  private async processItemRewards(effects: Record<string, any>): Promise<void> {
    // Handle both character rewards (rewards/artifacts) and personality tools
    const hasItems = effects.rewards || effects.artifacts || effects.tools;
    if (!hasItems) return;

    // For character users: process rewards and artifacts
    // For personality users: process tools (rewards/artifacts were converted to tools)
    const items = this.researchCondition === 'personality'
      ? [...(effects.tools || [])]
      : [...(effects.rewards || []), ...(effects.artifacts || [])];

    for (const itemName of items) {
      if (this.processedItems.has(itemName)) continue;

      this.processedItems.add(itemName);

      if (this.researchCondition === 'character') {
        await this.acquireCharacterGear(itemName);
        } else {
        await this.acquirePersonalityCopingTool(itemName);
      }
    }
  }

  private async acquireCharacterGear(itemName: string): Promise<void> {
    const { alreadyOwns, matchingGearType } = await this.checkGearOwnership(itemName);

    if (!matchingGearType) return;

    if (alreadyOwns) {
      const upgradeResult = checkItemOwnershipAndUpgrade(itemName, this.playerInventory, this.storyReplayCount);

        if (upgradeResult && (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0)) {
          const upgradeNotification = createUpgradeNotification(upgradeResult.upgrade);
        this.showNotification(upgradeNotification.message, upgradeNotification.type);
        await this.saveUpgradedGear(upgradeResult);
          this.updateLocalInventory(upgradeResult);
        }
        // Don't show "already own" notification - item was either upgraded or silently skipped
        return;
      }

      try {
      await this.apiService.acquireGear(matchingGearType.id);
        this.newlyAcquiredGear.add(itemName);
      this.clearGearCache();
      this.showNotification(`Acquired ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`, 'item');
    } catch (error: any) {
      // Check if it's a duplicate key error (already owns the item)
      if (error.response?.status === 500 && error.response?.data?.includes('duplicate key')) {
        // Silently skip - don't show notification for duplicate items
        return;
      } else {
        this.showNotification(`Failed to acquire ${itemName}`, 'item');
      }
    }
  }

  private async acquirePersonalityCopingTool(itemName: string): Promise<void> {
    try {
      const availableCopingTools = await this.apiService.getAvailableCopingTools();

      // Match by both name AND tool_id since stories may use either format
      const matchingTool = availableCopingTools.find((tool: any) =>
        tool.name.toLowerCase() === itemName.toLowerCase() ||
        tool.tool_id === itemName ||
        tool.tool_id === itemName.toLowerCase()
      );

      if (!matchingTool) {
        console.warn(`❌ [StoryRewardManager] No matching tool found for "${itemName}"`);
        console.warn(`   Available tools:`, availableCopingTools.map((t: any) => ({ name: t.name, tool_id: t.tool_id })));
        return;
      }

      console.log(`✅ [StoryRewardManager] Found matching tool:`, {
        searchTerm: itemName,
        matchedName: matchingTool.name,
        matchedToolId: matchingTool.tool_id
      });

      try {
        const myTools = await this.apiService.getMyTools();
        const alreadyOwnsTool = myTools?.some((tool: any) =>
          tool?.name?.toLowerCase() === itemName.toLowerCase() ||
          tool?.name?.toLowerCase() === matchingTool.name?.toLowerCase() ||
          tool?.tool_id === matchingTool.tool_id ||
          tool?.tool_id === itemName ||
          tool?.tool_id === itemName.toLowerCase()
        );

        if (alreadyOwnsTool) {
          console.log(`⏭️ [StoryRewardManager] User already owns ${matchingTool.name} - skipping notification`);
          return;
        }
      } catch (error: any) {
        // 404 is expected for users who don't have tools yet - continue to acquire
        if (error.response?.status === 404) {
        } else {
          console.error(`❌ [StoryRewardManager] Error checking owned tools:`, error.message);
          throw error; // Re-throw non-404 errors
        }
      }

      await this.apiService.acquireCopingToolByName(matchingTool.name);
      this.showNotification(`Unlocked ${matchingTool.name}! ${matchingTool.emoji_icon}`, 'skill');
    } catch (error: any) {
      if (error.response?.status === 404) {
      } else {
        console.error(`❌ [StoryRewardManager] Failed to acquire coping tool "${itemName}":`, error.message);
      }
    }
  }

  private async saveUpgradedGear(upgradeResult: UpgradedEquipmentReward): Promise<void> {
    if (this.researchCondition === 'personality') return;
      
      const { upgradedItem, upgrade } = upgradeResult;
    const { alreadyOwns, matchingGearType } = await this.checkGearOwnership(upgradedItem);
    
    if (!matchingGearType) return;
    
    if (alreadyOwns) {
      const notificationType = upgradeResult.isUpgrade ? 'upgrade' : 'strengthen';
      const message = upgradeResult.isUpgrade
        ? `${matchingGearType.name} upgraded! ${matchingGearType.emoji_icon || '⬆️'}`
        : `${matchingGearType.name} strengthened! +${upgrade.statBonus} stats`;
      this.showNotification(message, notificationType);
        return;
      }
      
    try {
      await this.apiService.acquireGear(matchingGearType.id);
        this.newlyAcquiredGear.add(upgradedItem);
      this.clearGearCache();
      
      const notificationType = upgradeResult.isUpgrade ? 'upgrade' : 'new';
      const message = upgradeResult.isUpgrade
        ? `Acquired upgraded ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`
        : `Acquired ${matchingGearType.name}! ${matchingGearType.emoji_icon || '🎒'}`;
      
      this.showNotification(message, notificationType);
    } catch (error: any) {
      // Check if it's a duplicate key error (already owns the item)
      if (error.response?.status === 500 && error.response?.data?.includes('duplicate key')) {
        this.showNotification(`You already own ${upgradedItem}. Reward skipped.`, 'item');
      } else {
        this.showNotification(`Failed to acquire ${upgradedItem}`, 'item');
      }
    }
  }

  private updateLocalInventory(upgradeResult: UpgradedEquipmentReward): void {
    const { originalItem, upgradedItem, isUpgrade } = upgradeResult;
    
    if (isUpgrade) {
      this.playerInventory = this.playerInventory.filter(item => 
        item.toLowerCase().trim() !== originalItem.toLowerCase().trim()
      );
    }
    
    if (!this.playerInventory.includes(upgradedItem)) {
      this.playerInventory.push(upgradedItem);
    }
  }

  // ===== BACKEND SAVING =====

  private async saveRewardsToBackend(effects: Record<string, any>, source: 'passage' | 'choice'): Promise<void> {
      const rewardType = getRewardType(this.researchCondition);
      const rewardFieldName = getRewardFieldName(this.researchCondition);

    let totalRewardAmount = 0;

      if (effects[rewardFieldName]) {
      totalRewardAmount += typeof effects[rewardFieldName] === 'number'
          ? effects[rewardFieldName]
        : parseInt(effects[rewardFieldName], 10);
    }

    if (effects.stats?.[rewardFieldName]) {
      totalRewardAmount += typeof effects.stats[rewardFieldName] === 'number'
          ? effects.stats[rewardFieldName]
        : parseInt(effects.stats[rewardFieldName], 10);
    }

    // For personality users without a character, skip character-specific endpoints
    // Their data will be updated via profile refresh instead
    if (totalRewardAmount > 0 && this.characterId > 0) {
      if (rewardType === 'experience') {
        await this.apiService.gainExperience(this.characterId, totalRewardAmount, `story_${source}`);
      } else {
        await this.apiService.gainLumens(this.characterId, totalRewardAmount, `story_${source}`);
      }
    }

    const wellnessStats = this.extractWellnessStats(effects);

    if (Object.keys(wellnessStats).length > 0 && this.characterId > 0) {
      await this.apiService.gainWellness(this.characterId, wellnessStats);
    }
  }

  private extractWellnessStats(effects: Record<string, any>): Record<string, number> {
    const wellnessStats: Record<string, number> = {};
    const wellnessStatKeys = ['awareness', 'exploration', 'resilience', 'courage', 'connection', 'balance', 'fear'];

      Object.entries(effects).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      if (wellnessStatKeys.includes(normalizedKey) && normalizedKey !== 'experience') {
        const numericValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        if (!isNaN(numericValue) && numericValue > 0) {
          // Use normalized lowercase key for consistency
          wellnessStats[normalizedKey] = (wellnessStats[normalizedKey] || 0) + numericValue;
        }
      }
    });

      if (effects.stats) {
        Object.entries(effects.stats).forEach(([stat, value]) => {
        const normalizedStat = stat.toLowerCase();
        if (wellnessStatKeys.includes(normalizedStat) && normalizedStat !== 'experience') {
          const numericValue = typeof value === 'number' ? value : parseInt(value as string, 10);
          if (!isNaN(numericValue) && numericValue > 0) {
            wellnessStats[normalizedStat] = (wellnessStats[normalizedStat] || 0) + numericValue;
          }
        }
      });
    }

    return wellnessStats;
  }

  private async saveQuestProgress(effects: Record<string, any>, passageId: string): Promise<void> {
    const questProgress: Record<string, number> = {};

    if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
      effects.quest_progress.forEach((questId: string) => {
        questProgress[questId] = (questProgress[questId] || 0) + 1;
      });
    }

    if (effects.quests) {
      const questsArray = Array.isArray(effects.quests) ? effects.quests : [effects.quests];
      questsArray.forEach((questId: string) => {
        questProgress[questId] = (questProgress[questId] || 0) + 1;
      });
    }

    const filteredQuestProgress = this.filterQuestProgressByUserType(questProgress);

    if (Object.keys(filteredQuestProgress).length === 0) {
      return;
    }

    for (const [questId, progress] of Object.entries(filteredQuestProgress)) {
      try {
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

        const questInfo = getQuestInfo(questId);
        const questTitle = questInfo?.title || questId;
        this.showNotification(`🎯 Quest Progress: ${questTitle}`, 'quest');
      } catch (error: any) {
        console.error(`❌ [StoryRewardManager] Failed to save quest progress for ${questId}:`, error.message);
        // Continue with other quests even if one fails
      }
    }
  }

  private filterQuestProgressByUserType(questProgress: Record<string, number>): Record<string, number> {
    const filteredProgress: Record<string, number> = {};

    for (const [questId, progress] of Object.entries(questProgress)) {
      if (this.researchCondition === 'character') {
        // Character users can complete ALL quests regardless of personality type
        filteredProgress[questId] = progress;
      } else if (this.researchCondition === 'personality') {
        // Personality users can ONLY complete quests that match their primary trait
        // STRICT VALIDATION: Quest MUST follow the pattern {trait}_{number}
        const questTraitMatch = questId.match(/^([a-zA-Z]+)_(\d+)$/);
        if (questTraitMatch && this.primaryTrait) {
          const [, questTrait] = questTraitMatch;
          const normalizedQuestTrait = questTrait.toLowerCase().trim();
          const normalizedPrimaryTrait = this.primaryTrait.toLowerCase().trim();

          // EXACT match required - no partial matches
          if (normalizedQuestTrait === normalizedPrimaryTrait) {
            filteredProgress[questId] = progress;
          }
        }
      }
    }

    return filteredProgress;
  }

  // ===== STORY COMPLETION =====
  // This is the SINGLE SOURCE OF TRUTH for saving story rewards
  // Screen handlers should ONLY refresh UI, not re-save rewards

  async handleStoryCompletion(currentSavedRewards: SavedRewards): Promise<void> {
    const { updatedSavedRewards, completionData } = handleStoryCompletionRewards(
      this.rewardTracker,
      currentSavedRewards
    );

    // Add automatic quest progress tracking for story-based quests
    if (this.researchCondition === 'personality' && this.primaryTrait) {
      const normalizedTrait = this.primaryTrait.toLowerCase();

      // Define story-based quests for each personality type
      // Each story completion should progress ALL quests for that personality type
      const storyQuests = {
        conscientiousness: ['conscientiousness_1', 'conscientiousness_2', 'conscientiousness_3'],
        openness: ['openness_1', 'openness_2', 'openness_3'],
        extraversion: ['extraversion_1', 'extraversion_2', 'extraversion_3'],
        agreeableness: ['agreeableness_1', 'agreeableness_2', 'agreeableness_3'],
        neuroticism: ['neuroticism_1', 'neuroticism_2', 'neuroticism_3']
      };

      const questsToTrack = storyQuests[normalizedTrait as keyof typeof storyQuests] || [];

      if (questsToTrack.length > 0) {
        // **NEW FIX: Use direct UserQuestProgress endpoint instead of story_variables aggregation**
        // This ensures quest progress is immediately reflected in the backend UserQuestProgress model
        // which is what populates the user profile's quest_progress array

        const batchedQuestProgress: Record<string, number> = {};
        questsToTrack.forEach((questId: string) => {
          batchedQuestProgress[questId] = 1; // Add 1 progress step per quest
        });

        console.log(`💾 [StoryRewardManager] Updating ${questsToTrack.length} quests directly via userQuestProgress endpoint:`, batchedQuestProgress);

        try {
          // Call the new batch update method that directly updates UserQuestProgress records
          const result = await this.apiService.batchUpdateUserQuestProgress(
            batchedQuestProgress,
            this.storyId
          );

          if (result.success) {
            console.log(`✅ [StoryRewardManager] Successfully updated all ${result.successful} quests`);
          } else {
            console.warn(`⚠️ [StoryRewardManager] Quest update completed with ${result.failed} failures`);
          }
        } catch (error: any) {
          console.error(`❌ [StoryRewardManager] Failed to update quest progress:`, error.message);
          // Don't throw - allow story completion to continue even if quest update fails
        }
      }
    }

    // Save all accumulated rewards to backend (experience, wellness, gear, etc.)
    try {
      await this.saveAccumulatedRewards();
    } catch (error: any) {
      console.error(`❌ [StoryRewardManager] Failed to save accumulated rewards:`, error.message);
      // Don't throw - we want the story to complete even if reward saving fails
    }

    // Send final completion event to backend
    try {
      await this.apiService.completeStoryFromEnding(
        completionData.storyId,
        '', // passageId - empty for now as we don't track the final passage ID
        completionData.totalStatGains,
        completionData.journalEntries
      );
    } catch (error: any) {
      console.error(`❌ [StoryRewardManager] Failed to send story completion to backend:`, error.message);
      // Don't throw - we want the UI to show completion even if backend fails
    }

    // Notify screen handler with completion data (for UI updates only)
    this.onStoryComplete(completionData);

    // Show summary notification
    const summary = this.getRewardSummary();
    if (summary.totalRewards > 0 || summary.totalStatGains > 0) {
      const rewardDetails = [];
      if (summary.totalStatGains > 0) rewardDetails.push(`${summary.totalStatGains} stat gains`);
      if (summary.totalRewards > 0) rewardDetails.push(`${summary.totalRewards} items`);
      if (summary.totalSkills > 0) rewardDetails.push(`${summary.totalSkills} skills`);

      this.showNotification(`Story completed! Rewards: ${rewardDetails.join(', ')}`, 'stat');
    }
  }

  private async saveAccumulatedRewards(): Promise<void> {
    console.log(`💾 [StoryRewardManager] saveAccumulatedRewards - Note: Wellness stats already saved per-passage`);

    // NOTE: Wellness stats are already saved incrementally per passage in saveRewardsToBackend()
    // We do NOT re-save them here to avoid sending cumulative totals that exceed backend limits

    const calculatedRewards = calculateTotalRewards(this.rewardTracker);

    // Character users (Research Group A): Only save experience points at completion
    // Wellness stats were already saved incrementally per passage
    if (this.researchCondition === 'character' && this.characterId > 0) {
      // Save experience points (character-only stat) - this is safe to accumulate
      if (calculatedRewards.totalStatGains.experience && calculatedRewards.totalStatGains.experience > 0) {
        try {
          console.log(`💰 [StoryRewardManager] Saving accumulated experience: ${calculatedRewards.totalStatGains.experience}`);
          await this.apiService.gainExperience(
            this.characterId,
            calculatedRewards.totalStatGains.experience,
            `story_completion_${this.rewardTracker.storyId}`
          );
        } catch (error: any) {
          console.error(`❌ [StoryRewardManager] Failed to gain experience:`, error.message);
        }
      }
    }
    // Personality users (Research Group B): Nothing to save at completion
    // All stats (experience, wellness) were already saved incrementally per passage
    else if (this.researchCondition === 'personality' && this.userId) {
      console.log(`✅ [StoryRewardManager] Personality user - all rewards already saved per-passage`);
    } else {
      console.warn(`⚠️ [StoryRewardManager] Unknown research condition or missing user ID - skipping reward save`);
      console.warn(`   Research condition: ${this.researchCondition}, Character ID: ${this.characterId}, User ID: ${this.userId}`);
    }
  }

  // ===== PUBLIC METHODS =====

  getRewardSummary() {
    const calculatedRewards = calculateTotalRewards(this.rewardTracker);
    return {
      totalRewards: calculatedRewards.finalRewards.length,
      totalStatGains: Object.keys(calculatedRewards.totalStatGains).length,
      totalSkills: calculatedRewards.skillsLearned.length,
      totalJournalEntries: calculatedRewards.journalEntries.length
    };
  }

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

  reset(storyId: string): void {
    this.rewardTracker = initializeRewardTracker(storyId);
    this.processedPassages.clear();
    this.processedChoices.clear();
    this.newlyAcquiredGear.clear();
    this.sentNotifications.clear();
    this.processedItems.clear();
    this.playerInventory = [];
    this.storyReplayCount = 0;
    this.clearGearCache();
  }
}

// ===== EXPORTED UTILITY FUNCTIONS =====

export function checkItemOwnershipAndUpgrade(
  itemName: string,
  playerInventory: string[],
  storyReplayCount: number
): UpgradedEquipmentReward | undefined {
  const alreadyOwned = playerInventory.some(item => {
    // Ensure item is a string before calling toLowerCase
    if (typeof item !== 'string') return false;
    return item.toLowerCase() === itemName.toLowerCase();
  });
  const isUpgrade = alreadyOwned && storyReplayCount > 0;
  
  if (isUpgrade) {
  const upgrade = {
      statBonus: storyReplayCount,
      message: `Upgraded ${itemName}`,
      type: 'upgrade' as const,
    itemName: itemName,
      currentLevel: storyReplayCount,
      newLevel: storyReplayCount + 1,
      rarity: "Common" as const,
      upgradeMessage: `Upgraded ${itemName} to level ${storyReplayCount + 1}`
    };
    
    return {
      originalItem: itemName,
      upgradedItem: itemName,
      isUpgrade,
      upgrade
    };
  }
  
  return undefined;
}
