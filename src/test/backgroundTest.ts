// Test for story background functionality
import { getStoryBackground } from '../screens/characterStory/utils/storyBackgrounds';

// Test the background assignment logic
const testStory1 = { id: 12, title: "Introduction to the Archive" };
const testStory2 = { id: 13, title: "Some Other Story" };
const testStory3 = { id: "12", title: "Another Introduction" };
const testStory4 = { id: 5, title: "introduction story test" };

console.log('Testing background assignment:');
console.log('Story ID 12 (number):', getStoryBackground(testStory1) !== null);
console.log('Story ID "12" (string):', getStoryBackground(testStory3) !== null);
console.log('Title with "introduction":', getStoryBackground(testStory4) !== null);
console.log('Regular story:', getStoryBackground(testStory2) !== null);

export {};
