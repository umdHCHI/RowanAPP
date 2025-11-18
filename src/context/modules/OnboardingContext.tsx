// Manages onboarding flow and user assignment

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { Character, UserProfile } from '../../types';

export interface OnboardingContextType {
  isComplete: boolean;
  assignedPath: 'survey' | 'character' | null;
  researchGroup: string | null;
  characterAppearance: Character | undefined;
  isLoading: boolean;

  completeCharacter: () => Promise<void>;
  setAssignedPath: (path: 'survey' | 'character' | null) => void;
  setCharacterAppearance: (appearance: Character) => void;
  resetOnboarding: () => void;
  resetCharacterCreatorToDefaults: () => void;
  setIsLoading: (loading: boolean) => void;
  loadOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
  authToken: string | null;
  isTestUser: boolean;
  backendCharacter: Character | null;
  userProfile: UserProfile | null;
  justCreatedCharacter: React.MutableRefObject<boolean>;
  newlyCreatedCharacter: React.MutableRefObject<Character | null>;
  didHomeScreenInit: React.MutableRefObject<boolean>;
  setBackendCharacter: (char: Character | null) => void;
  onResearchConditionChange: (condition: 'character' | 'survey' | 'unknown') => void;
  onCharacterCreatorReset: () => void;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  authToken,
  isTestUser,
  backendCharacter,
  userProfile,
  justCreatedCharacter,
  newlyCreatedCharacter,
  didHomeScreenInit,
  setBackendCharacter,
  onResearchConditionChange,
  onCharacterCreatorReset,
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [assignedPath, setAssignedPathState] = useState<'survey' | 'character' | null>(null);
  const [researchGroup, setResearchGroup] = useState<string | null>(null);
  const [characterAppearance, setCharacterAppearance] = useState<Character | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // ===== CRITICAL: Clear onboarding state when auth changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!authToken) {
      setIsComplete(false);
      setAssignedPathState(null);
      setResearchGroup(null);
      setCharacterAppearance(undefined);
      setIsLoading(false);
      didHomeScreenInit.current = false;
      justCreatedCharacter.current = false;
      newlyCreatedCharacter.current = null;
    }
  }, [authToken]);

  const setAssignedPath = useCallback(
    (path: 'survey' | 'character' | null) => {
      setAssignedPathState(path);

      if (path === 'character') {
        setResearchGroup('A');
        onResearchConditionChange('character');
      } else if (path === 'survey') {
        setResearchGroup('B');
        onResearchConditionChange('survey');
      } else {
        setResearchGroup(null);
      }
    },
    [onResearchConditionChange]
  );

  const completeCharacter = async () => {
    const updatedProfile = await apiService.completeOnboarding('character');
    setIsComplete(true);
    setAssignedPath('character');
    if (!backendCharacter && !newlyCreatedCharacter.current) {
      const characterData = await apiService.getMyCharacter();
      if (characterData) {
        setBackendCharacter(characterData);
        newlyCreatedCharacter.current = characterData;
      }
    }
  };

  const resetOnboarding = () => {
    setIsComplete(false);
    setAssignedPath(null);
    setCharacterAppearance(undefined);
    didHomeScreenInit.current = false;
    justCreatedCharacter.current = false;

    AsyncStorage.removeItem('characterId').catch(() => {});
  };

  const resetCharacterCreatorToDefaults = () => {
    onCharacterCreatorReset();
    setBackendCharacter(null);
    justCreatedCharacter.current = false;
    newlyCreatedCharacter.current = null;
  };

  const loadOnboardingStatus = useCallback(async () => {
    if (!authToken) {
      return;
    }
      const status = await apiService.checkOnboardingStatus();
      if (status.isOnboarded) {
        setIsComplete(true);

        if (status.completionType) {
          setAssignedPath(status.completionType as 'survey' | 'character');
        } else {
          setIsComplete(false);
          setAssignedPath(null);
        }
      } else {
        setIsComplete(false);
        setAssignedPath(null);
      }    
  }, [authToken, isTestUser]);

  const value: OnboardingContextType = {
    isComplete,
    assignedPath,
    researchGroup,
    characterAppearance,
    isLoading,
    completeCharacter,
    setAssignedPath,
    setCharacterAppearance,
    resetOnboarding,
    resetCharacterCreatorToDefaults,
    setIsLoading,
    loadOnboardingStatus,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
