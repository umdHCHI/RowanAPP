import { ResearchConditions } from '../constants/researchConditions';

export const getUserTitle = (userId?: string | number): string => {
  if (!userId) {
    return 'Curator of Hidden Knowledge';
  }

  let hash = 0;
  const userIdStr = String(userId);

  for (let i = 0; i < userIdStr.length; i++) {
    const char = userIdStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const titleIndex = Math.abs(hash) % ResearchConditions.titles.length;
  const selectedTitle = ResearchConditions.titles[titleIndex];

  return selectedTitle;
};