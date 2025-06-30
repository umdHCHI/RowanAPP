import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

export class BackendIntegrationTest {
  private authToken: string | null = null;

  async runTests() {
    console.log('🧪 Starting Backend Integration Tests...');
    
    try {
      // Get auth token
      this.authToken = await AsyncStorage.getItem('authToken');
      if (!this.authToken) {
        console.log('❌ No auth token found - skipping authenticated tests');
        return;
      }
      
      console.log('✅ Auth token found, running tests...');
      
      // Test 1: Get available stories
      await this.testGetAvailableStories();
      
      // Test 2: Get story catalog
      await this.testGetStoryCatalog();
      
      // Test 3: Get user story progress
      await this.testGetUserStoryProgress();
      
      // Test 4: Test story completion endpoint
      await this.testStoryCompletion();
      
      console.log('🎉 All backend integration tests completed!');
      
    } catch (error) {
      console.error('❌ Backend integration test failed:', error);
    }
  }

  private async testGetAvailableStories() {
    console.log('📚 Testing: Get Available Stories');
    try {
      const stories = await apiService.getStories();
      console.log(`✅ Available stories: ${stories?.length || 0} stories found`);
      if (stories && stories.length > 0) {
        console.log('📖 Sample story:', {
          id: stories[0].id,
          title: stories[0].title,
          description: stories[0].description?.substring(0, 50) + '...'
        });
      }
    } catch (error: any) {
      console.log(`❌ Get available stories failed: ${error.message}`);
      if (error.response?.status === 404) {
        console.log('ℹ️  Endpoint not found - this means the story app URLs are not included in Django URLconf');
        console.log('🔧 Solution: Add "path(\'api/story/\', include(\'story.urls\'))" to your main Django URLs file');
        console.log('📋 Expected endpoint: GET /api/story/stories/');
      }
    }
  }

  private async testGetStoryCatalog() {
    console.log('📖 Testing: Get Story Catalog');
    try {
      const catalog = await apiService.getNewStoryCatalog();
      console.log(`✅ Story catalog: ${catalog?.length || 0} stories in catalog`);
    } catch (error: any) {
      console.log(`❌ Get story catalog failed: ${error.message}`);
      if (error.response?.status === 404) {
        console.log('ℹ️  Story catalog endpoint not found - router endpoints are disabled in story/urls.py');
        console.log('📋 Expected endpoint: GET /api/story/catalog/');
      }
    }
  }

  private async testGetUserStoryProgress() {
    console.log('📊 Testing: Get User Story Progress');
    try {
      const progress = await apiService.getNewStoryProgress(1); // Test with story ID 1
      console.log('✅ User story progress retrieved:', progress);
    } catch (error: any) {
      console.log(`❌ Get user story progress failed: ${error.message}`);
      if (error.response?.status === 404) {
        console.log('ℹ️  Progress endpoint not found - story app not included in URLconf');
        console.log('📋 Expected endpoint: GET /api/story/progress/');
      }
    }
  }

  private async testStoryCompletion() {
    console.log('🏁 Testing: Story Completion Endpoint');
    try {
      // Test with a dummy story ID
      const result = await apiService.completeNewStory(1, {
        final_rewards: ['Test Reward'],
        skills_learned: ['Test Skill'],
        stat_gains: { awareness: 1 }
      });
      console.log('✅ Story completion test successful:', result);
    } catch (error: any) {
      console.log(`❌ Story completion test failed: ${error.message}`);
      if (error.response?.status === 404) {
        console.log('ℹ️  Story completion endpoint not found - story app not included in URLconf');
        console.log('📋 Expected endpoint: POST /api/story/complete/');
        console.log('🔧 Solution: Add story app URLs to Django main URLconf');
      }
    }
  }

  async testDirectBackendCalls() {
    console.log('🔗 Testing Direct Backend Calls...');
    
    const baseUrl = 'http://localhost:8000/api/'; // Adjust to your Django server URL
    
    try {
      // Test 1: Direct call to available stories
      const storiesResponse = await fetch(`${baseUrl}stories/stories/`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📚 Direct stories endpoint status:', storiesResponse.status);
      if (storiesResponse.ok) {
        const stories = await storiesResponse.json();
        console.log(`✅ Direct call successful: ${stories.length} stories`);
      }
      
      // Test 2: Direct call to progress endpoint
      const progressResponse = await fetch(`${baseUrl}stories/progress/`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Direct progress endpoint status:', progressResponse.status);
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        console.log('✅ Direct progress call successful:', progress);
      }
      
    } catch (error: any) {
      console.log(`❌ Direct backend calls failed: ${error.message}`);
    }
  }
}

// Export for use in components
export const backendTest = new BackendIntegrationTest();

// Test coping tools setup for choice rewards
export const testCopingToolsSetup = async () => {
  try {
    console.log('🔧 Testing coping tools setup for choice rewards...');
    
    // First, let's see what coping tools already exist
    const existingCopingTools = await apiService.get<any[]>('copingTools');
    console.log('Existing coping tools:', existingCopingTools);
    
    // Define the coping tools needed for choice rewards
    const requiredCopingTools = [
      {
        name: "Binder's Quill of Mastery",
        tool_type: "writing",
        subtype: "reflection",
        description: "A quill that writes with the ink of determination, granting clarity in moments of challenge.",
        emoji_icon: "✒️",
        awareness_bonus: 5,
        resilience_bonus: 3,
        connection_bonus: null,
        balance_bonus: null,
        level_required: 1,
        memories_required: null,
        insights_required: null
      },
      {
        name: "Ear Rune of Will",
        tool_type: "protection",
        subtype: "mental_shield",
        description: "A protective rune that shields the mind from overwhelming noise and distractions.",
        emoji_icon: "🛡️",
        awareness_bonus: null,
        resilience_bonus: 5,
        connection_bonus: null,
        balance_bonus: 3,
        level_required: 1,
        memories_required: null,
        insights_required: null
      },
      {
        name: "Guide's Bookmark of Kinship",
        tool_type: "social",
        subtype: "connection",
        description: "A bookmark that opens doors to hidden knowledge and connections with others.",
        emoji_icon: "🔖",
        awareness_bonus: null,
        resilience_bonus: null,
        connection_bonus: 5,
        balance_bonus: 3,
        level_required: 1,
        memories_required: null,
        insights_required: null
      }
    ];
    
    const createdCopingTools: any[] = [];
    
    // Check if each required coping tool exists, create if not
    for (const requiredTool of requiredCopingTools) {
      const existingTool = existingCopingTools.find(tool => tool.name === requiredTool.name);
      
      if (!existingTool) {
        try {
          console.log(`Creating coping tool: ${requiredTool.name}`);
          console.log(`Using endpoint: coping-tools with payload:`, requiredTool);
          
          const newCopingTool = await apiService.post<any>('copingTools', requiredTool);
          console.log(`Created coping tool:`, newCopingTool);
          createdCopingTools.push(newCopingTool);
        } catch (error) {
          console.error(`Failed to create coping tool ${requiredTool.name}:`, error);
          console.error('Error details:', {
            toolName: requiredTool.name,
            endpoint: 'coping-tools',
            payload: requiredTool
          });
          console.log('This might be because:');
          console.log('1. The endpoint requires authentication');
          console.log('2. The coping tool already exists');
          console.log('3. The backend validation failed');
        }
      } else {
        console.log(`Coping tool already exists: ${requiredTool.name} (ID: ${existingTool.id})`);
        createdCopingTools.push(existingTool);
      }
    }
    
    console.log('✅ Coping tools setup complete!');
    console.log('Created/found coping tools:', createdCopingTools);
    
    return createdCopingTools;
  } catch (error) {
    console.error('❌ Failed to setup coping tools:', error);
    throw error;
  }
};

// Function to get coping tool mapping for choice rewards
export const getCopingToolMapping = async () => {
  try {
    console.log('🔍 Getting coping tool mapping...');
    const existingCopingTools = await apiService.get<any[]>('copingTools');
    console.log('📦 Retrieved coping tools from backend:', existingCopingTools);
    
    const copingToolMapping: Record<string, number> = {};
    
    // Map coping tool names to IDs
    existingCopingTools.forEach((tool: any) => {
      console.log(`Checking coping tool: ${tool.name} (ID: ${tool.id})`);
      if (tool.name === "Binder's Quill of Mastery") {
        copingToolMapping['confront'] = tool.id;
        console.log(`✅ Mapped confront -> ${tool.id}`);
      } else if (tool.name === "Ear Rune of Will") {
        copingToolMapping['avoid'] = tool.id;
        console.log(`✅ Mapped avoid -> ${tool.id}`);
      } else if (tool.name === "Guide's Bookmark of Kinship") {
        copingToolMapping['assist'] = tool.id;
        console.log(`✅ Mapped assist -> ${tool.id}`);
      }
    });
    
    console.log('🎯 Final coping tool mapping:', copingToolMapping);
    return copingToolMapping;
  } catch (error) {
    console.error('❌ Failed to get coping tool mapping:', error);
    return {};
  }
};

export async function testStoryEndpoints() {
  console.log('=== Testing Story API Endpoints ===');
  
  try {
    // Test 1: Get story catalog
    console.log('\n1. Testing story catalog endpoint...');
    const catalog = await apiService.getNewStoryCatalog();
    console.log('Story catalog response:', catalog);
    console.log('Number of stories:', Array.isArray(catalog) ? catalog.length : 'Not an array');
    
    if (Array.isArray(catalog) && catalog.length > 0) {
      const firstStory = catalog[0];
      console.log('First story:', firstStory);
      
      // Test 2: Get chapters for the first story
      console.log('\n2. Testing chapters endpoint...');
      const storyId = firstStory.id;
      console.log('Testing with story ID:', storyId);
      
      const chapters = await apiService.getNewStoryChapters(storyId);
      console.log('Chapters response:', chapters);
      
      if (Array.isArray(chapters) && chapters.length > 0) {
        const firstChapter = chapters[0];
        console.log('First chapter:', firstChapter);
        
        // Test 3: Get passages for the first chapter
        console.log('\n3. Testing passages endpoint...');
        const chapterId = firstChapter.id;
        console.log('Testing with chapter ID:', chapterId);
        
        const passages = await apiService.getNewChapterPassages(chapterId);
        console.log('Passages response:', passages);
        
        if (Array.isArray(passages) && passages.length > 0) {
          const firstPassage = passages[0];
          console.log('First passage:', firstPassage);
          
          // Test 4: Get passage content
          console.log('\n4. Testing passage content endpoint...');
          const passageId = firstPassage.passage_id;
          console.log('Testing with passage ID:', passageId);
          
          const passageContent = await apiService.getNewPassageContent(storyId, passageId);
          console.log('Passage content response:', passageContent);
          
          // Test 5: Get story progress
          console.log('\n5. Testing story progress endpoint...');
          const progress = await apiService.getNewStoryProgress(storyId);
          console.log('Story progress response:', progress);
        }
      }
    }
    
    console.log('\n=== Story API Tests Completed ===');
    
  } catch (error: any) {
    console.error('Story API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

// Export for use in other files
export default testStoryEndpoints; 