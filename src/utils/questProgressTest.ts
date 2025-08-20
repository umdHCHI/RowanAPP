/**
 * Test utilities for debugging quest progress issues
 * This file contains helper functions to test quest reward processing
 */

import { apiService } from '../services/apiService';

/**
 * Test function to simulate quest completion and verify it's saved correctly
 */
export async function testQuestCompletion(questId: string = 'neuroticism_1', storyId: string = '1'): Promise<void> {
  console.log('=== TESTING QUEST COMPLETION ===');
  console.log(`Quest ID: ${questId}`);
  console.log(`Story ID: ${storyId}`);
  
  try {
    // First, check the current quest progress
    console.log('🔄 Checking current quest progress...');
    const currentProgress = await apiService.getQuestProgress();
    console.log('Current quest progress:', currentProgress);
    console.log(`Current progress for ${questId}:`, currentProgress[questId] || 0);
    
    // Simulate quest completion
    console.log('🎯 Simulating quest completion...');
    await apiService.saveQuestProgress({
      storyId: storyId,
      questSlug: questId,
      storyVariables: {
        progress: 1,
        source: 'test_completion',
        test: true
      },
      playerState: {
        quest_progress: { [questId]: 1 }
      }
    });
    console.log('✅ Quest progress saved');
    
    // Wait a moment for backend processing
    console.log('💤 Waiting 2 seconds for backend processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check the updated quest progress
    console.log('🔄 Checking updated quest progress...');
    const updatedProgress = await apiService.getQuestProgress();
    console.log('Updated quest progress:', updatedProgress);
    console.log(`Updated progress for ${questId}:`, updatedProgress[questId] || 0);
    
    // Verify the quest was saved
    const newProgress = updatedProgress[questId] || 0;
    const previousProgress = currentProgress[questId] || 0;
    
    if (newProgress > previousProgress) {
      console.log('✅ SUCCESS: Quest progress was saved and retrieved correctly!');
      console.log(`Progress increased from ${previousProgress} to ${newProgress}`);
    } else {
      console.log('❌ ISSUE: Quest progress did not increase as expected');
      console.log(`Expected progress > ${previousProgress}, but got ${newProgress}`);
    }
    
  } catch (error) {
    console.error('❌ Error during quest completion test:', error);
  }
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test function to verify quest progress loading
 */
export async function testQuestProgressLoading(): Promise<void> {
  console.log('=== TESTING QUEST PROGRESS LOADING ===');
  
  try {
    console.log('🔄 Loading quest progress from backend...');
    const questProgress = await apiService.getQuestProgress();
    
    console.log('Quest progress result:', questProgress);
    console.log('Quest progress type:', typeof questProgress);
    console.log('Quest progress keys:', Object.keys(questProgress));
    console.log('Number of quests:', Object.keys(questProgress).length);
    
    if (Object.keys(questProgress).length > 0) {
      console.log('Quest progress details:');
      Object.entries(questProgress).forEach(([questId, progress]) => {
        console.log(`  ${questId}: ${progress}`);
      });
    } else {
      console.log('⚠️ No quest progress found');
    }
    
  } catch (error) {
    console.error('❌ Error loading quest progress:', error);
  }
  
  console.log('=== LOADING TEST COMPLETE ===');
}

/**
 * Test function to check if quest rewards are properly filtered for personality users
 */
export function testQuestFiltering(primaryTrait: string, questRewards: string[]): void {
  console.log('=== TESTING QUEST FILTERING ===');
  console.log(`Primary trait: ${primaryTrait}`);
  console.log(`Quest rewards: ${questRewards}`);
  
  const filteredQuests = questRewards.filter((questId: string) => {
    const questTraitMatch = questId.match(/^(\w+)_\d+$/);
    if (questTraitMatch) {
      const questTrait = questTraitMatch[1];
      const userTrait = primaryTrait.toLowerCase();
      const matches = questTrait.toLowerCase() === userTrait;
      console.log(`Quest filtering: questId=${questId}, questTrait=${questTrait}, userTrait=${userTrait}, matches=${matches}`);
      return matches;
    }
    console.log(`Keeping quest ${questId} (no trait match pattern)`);
    return true;
  });
  
  console.log(`Filtered quests: ${filteredQuests}`);
  console.log(`Original count: ${questRewards.length}, Filtered count: ${filteredQuests.length}`);
  
  console.log('=== FILTERING TEST COMPLETE ===');
}

/**
 * Helper function to run all quest tests
 */
export async function runAllQuestTests(primaryTrait: string = 'Neuroticism', questId: string = 'neuroticism_1'): Promise<void> {
  console.log('🧪 RUNNING ALL QUEST TESTS 🧪');
  
  // Test quest filtering
  testQuestFiltering(primaryTrait, [questId, 'openness_1', 'conscientiousness_1']);
  
  // Test quest progress loading
  await testQuestProgressLoading();
  
  // Test quest completion
  await testQuestCompletion(questId);
  
  // Test quest progress loading again to see the changes
  await testQuestProgressLoading();
  
  console.log('🏁 ALL QUEST TESTS COMPLETE 🏁');
}
