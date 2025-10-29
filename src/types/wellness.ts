import { PersonalityKey } from '../imports';

export interface WellnessAttributesDisplayProps {
  personalityType: PersonalityKey;
  personalityScores?: Record<string, number> | any[]; // Allow both object and array formats
  storyProgress?: any;
  globalStyles: any;
}