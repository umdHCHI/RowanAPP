import { PersonalityKey } from '../imports';

export interface WellnessAttributesDisplayProps {
  personalityType: PersonalityKey;
  personalityScores?: Record<string, number> | any[]; // Allow both object and array formats
  storyProgress?: any;
  globalStyles: any;
}

// Type definitions (if ../types/equipment doesn't exist, define them here)
export interface WellnessStats {
  awareness?: number;
  resilience?: number;
  connection?: number;
  balance?: number;
  mindfulness?: number;
  focus?: number;
  confidence?: number;
  empathy?: number;
  organization?: number;
}