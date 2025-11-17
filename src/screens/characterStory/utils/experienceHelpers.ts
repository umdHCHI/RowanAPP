import { selectProfileAndCharacter } from './profileHelpers';

export const getExperienceDisplay = (wellness: any) => {
  const homeData = wellness.homeData;
  const { backendCharacter } = selectProfileAndCharacter(homeData);

  const currentExperience = backendCharacter?.experience ?? 100;
  const experienceNeeded = backendCharacter?.experience_needed_for_next_level || backendCharacter?.experience_needed || 1000;
  const progressPercentage = backendCharacter?.experience_progress_percentage ?? 10;

  if (progressPercentage !== undefined) {
    return `${Math.round(progressPercentage)}% (${currentExperience}/${experienceNeeded} Lumens)`;
  } else if (currentExperience !== undefined && experienceNeeded !== undefined) {
    const calculatedPercentage = Math.round((currentExperience / experienceNeeded) * 100);
    return `${calculatedPercentage}% (${currentExperience}/${experienceNeeded} Lumens)`;
  } else {
    return 'Lumens data loading...';
  }
};