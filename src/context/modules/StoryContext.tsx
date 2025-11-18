// Manages story gameplay state, choices, and rewards

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MentalArtifact } from './types';

export interface StoryContextType {
  currentPassageId: string;
  totalStatGains: { [key: string]: number };
  recentGains: { [key: string]: number };
  showStatGain: boolean;
  unlockedArtifacts: string[];
  learnedSkills: string[];
  showArtifactUnlock: boolean;
  newArtifact: MentalArtifact | null;

  setCurrentPassageId: (id: string) => void;
  setTotalStatGains: (gains: { [key: string]: number }) => void;
  setRecentGains: (gains: { [key: string]: number }) => void;
  setShowStatGain: (show: boolean) => void;
  setUnlockedArtifacts: (artifacts: string[]) => void;
  setLearnedSkills: (skills: string[]) => void;
  setShowArtifactUnlock: (show: boolean) => void;
  setNewArtifact: (artifact: MentalArtifact | null) => void;
  handleChoice: (choice: any) => void;
  resetStoryState: () => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within StoryProvider');
  }
  return context;
};

interface StoryProviderProps {
  children: ReactNode;
  authToken?: string | null;
  onStoryClose?: () => void;
  onSkillLearned?: (skills: string[]) => void;
}

export const StoryProvider: React.FC<StoryProviderProps> = ({
  children,
  authToken,
  onStoryClose,
  onSkillLearned,
}) => {
  const [currentPassageId, setCurrentPassageId] = useState('start');
  const [totalStatGains, setTotalStatGains] = useState<{ [key: string]: number }>({});
  const [recentGains, setRecentGains] = useState<{ [key: string]: number }>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<MentalArtifact | null>(null);

  // ===== CRITICAL: Clear story state when auth changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!authToken) {
      console.log('🧹 [StoryContext] Auth token cleared - resetting all story state');
      setCurrentPassageId('start');
      setTotalStatGains({});
      setRecentGains({});
      setShowStatGain(false);
      setUnlockedArtifacts([]);
      setLearnedSkills([]);
      setShowArtifactUnlock(false);
      setNewArtifact(null);
    }
  }, [authToken]);

  const handleChoice = (choice: any) => {
    const {
      next,
      statEffects,
      skillsLearned,
      artifactUnlock,
      isEnding,
      finalRewards,
      wisdomGained,
    } = choice;

    // Handle stat effects
    if (statEffects) {
      const newRecentGains: { [key: string]: number } = {};

      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains((prev) => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number),
        }));
      });

      setRecentGains(newRecentGains);
      setShowStatGain(true);

      setTimeout(() => setShowStatGain(false), 2000);
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setLearnedSkills((prev) => [...prev, ...skillsLearned]);
      if (onSkillLearned) {
        onSkillLearned(skillsLearned);
      }
    }

    // Handle artifact unlock
    if (artifactUnlock) {
      setShowArtifactUnlock(true);
      setTimeout(() => setShowArtifactUnlock(false), 4000);
    }

    // Check if this is an ending choice
    if (isEnding || (!next && (finalRewards || wisdomGained))) {
      // Don't show alert here - let the screen handler show the completion message
      // This prevents duplicate alerts (StoryContext + PersonalityHomeScreen)
      if (onStoryClose) {
        onStoryClose();
      }
    } else if (next) {
      setTimeout(() => setCurrentPassageId(next), 500);
    }
  };

  const resetStoryState = () => {
    setCurrentPassageId('start');
    setTotalStatGains({});
    setRecentGains({});
    setShowStatGain(false);
    setUnlockedArtifacts([]);
    setLearnedSkills([]);
    setShowArtifactUnlock(false);
    setNewArtifact(null);
  };

  const value: StoryContextType = {
    currentPassageId,
    totalStatGains,
    recentGains,
    showStatGain,
    unlockedArtifacts,
    learnedSkills,
    showArtifactUnlock,
    newArtifact,
    setCurrentPassageId,
    setTotalStatGains,
    setRecentGains,
    setShowStatGain,
    setUnlockedArtifacts,
    setLearnedSkills,
    setShowArtifactUnlock,
    setNewArtifact,
    handleChoice,
    resetStoryState,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};
