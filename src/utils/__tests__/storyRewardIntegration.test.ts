// ===== STORY REWARD INTEGRATION TEST UTILITIES =====
// Test functions for verifying gear acquisition and reward system functionality

import { Passage } from '../../types/story';
import { StoryRewardManager } from '../storyRewardIntegration';

/**
 * Test function to verify gear acquisition works correctly
 */
export async function testGearAcquisition(apiService: any, characterId: number): Promise<void> {
  console.log('=== TESTING GEAR ACQUISITION ===');
  console.log('Character ID:', characterId);
  
  const testItems = [
    'Ancient Scroll',
    'Clarity Lens of Mindful Sight',
    'Personal Style Cloak'
  ];
  
  for (const itemName of testItems) {
    try {
      console.log(`Testing gear acquisition for: ${itemName}`);
      
      // Get available gear types
      const availableGearTypes = await apiService.getAvailableGearTypes();
      const matchingGear = availableGearTypes.find((gear: any) => 
        gear.name?.toLowerCase() === itemName.toLowerCase()
      );
      
      if (matchingGear) {
        console.log(`✅ Found gear: ${matchingGear.name} (ID: ${matchingGear.id})`);
        
        // Try to acquire the gear
        const result = await apiService.acquireGear(matchingGear.id);
        console.log(`✅ Successfully acquired ${itemName}:`, result);
      } else {
        console.log(`❌ No gear found for ${itemName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to acquire ${itemName}:`, error);
    }
  }
  
  // Test loading the character's gear
  try {
    console.log('\nTesting gear loading...');
    const myGear = await apiService.getMyGear();
    console.log('Character gear:', myGear?.length || 0, 'items');
    
    const equippedGear = await apiService.getEquippedGear();
    console.log('Equipped gear:', equippedGear?.length || 0, 'items');
  } catch (error) {
    console.error('Failed to load gear:', error);
  }
  
  console.log('=== GEAR ACQUISITION TEST COMPLETE ===');
}

/**
 * Test function to verify the equipment reward system
 */
export async function testEquipmentRewardSystem(apiService: any, characterId: number): Promise<void> {
  console.log('=== TESTING EQUIPMENT REWARD SYSTEM ===');
  
  try {
    // Test 1: Get available gear types
    console.log('\n--- Test 1: Master Gear List ---');
    const availableGearTypes = await apiService.getAvailableGearTypes();
    console.log('Available gear types:', availableGearTypes.length);
    
    // Test 2: Get character's current gear
    console.log('\n--- Test 2: Character Gear Check ---');
    const characterWithGear = await apiService.getCharacterWithGear(characterId);
    const myGear = await apiService.getMyGear();
    const equippedGear = await apiService.getEquippedGear();
    
    console.log('Equipped gear:', characterWithGear.equipped_gear?.length || 0);
    console.log('Total gear inventory:', myGear.length);
    console.log('Currently equipped:', equippedGear.length);
    
    // Test 3: Test reward processing with mock manager
    console.log('\n--- Test 3: Reward Processing Logic ---');
    
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
      [],
      0,
      'character',
      undefined,
      undefined
    );
    
    // Test with mock passage
    const testPassageEffects = {
      experience: 10,
      awareness: 2,
      rewards: ['Ancient Scroll', 'Focus Crystal']
    };
    
    const mockPassage: Passage = {
      id: 1,
      chapter: 1,
      passage_id: 'test-passage',
      content: 'Test passage content',
      passage_type: 'narration',
      speaker: null,
      required_conditions: {},
      story_effects: testPassageEffects,
      mood: '',
      background_music: '',
      background_image: null,
      order: 1,
      choices: []
    };
    
    await rewardManager.handlePassageVisit(mockPassage);
    console.log('✅ Test reward processing completed');
    
  } catch (error: any) {
    console.error('❌ Equipment reward system test failed:', error);
  }
  
  console.log('\n=== EQUIPMENT REWARD SYSTEM TEST COMPLETE ===');
}

/**
 * Debug function to check API endpoints
 */
export async function debugEquipmentEndpoints(apiService: any): Promise<void> {
  console.log('=== DEBUGGING EQUIPMENT API ENDPOINTS ===');
  
  try {
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
    
    console.log('\n4. Testing characters/{id}/ endpoint...');
    try {
      const character = await apiService.getMyCharacter();
      console.log('✅ Character equipped_gear:', character.equipped_gear?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Failed to get character with gear:', error);
    }
    
  } catch (error) {
    console.error('❌ Equipment endpoint debugging failed:', error);
  }
  
  console.log('\n=== EQUIPMENT ENDPOINT DEBUGGING COMPLETE ===');
}

