import { forestBackground, hauntedLibraryBackground } from '../../../assets';

/**
 * Gets the background image for a story based on its ID and properties
 * @param story - The story object
 * @returns The appropriate background image asset
 */
export const getStoryBackground = (story: any) => {
  // Introduction story (ID 12) gets forest background
  if (story.id === 12 || story.id === '12' || story.title?.toLowerCase().includes('introduction')) {
    return forestBackground;
  }

  // If story has a specific background set, use that
  if (story.backgroundImage) {
    return story.backgroundImage;
  }

  // Default to haunted library background for all other stories
  return hauntedLibraryBackground;
};

/**
 * Sets custom backgrounds for specific stories
 * You can expand this function to assign different backgrounds to different story types
 */
export const assignStoryBackgrounds = (stories: any[]) => {
  return stories.map(story => ({
    ...story,
    backgroundImage: getStoryBackground(story)
  }));
};
