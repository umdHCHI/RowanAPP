//contexts for onboarding if the users is allocated for survey or character creator
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, CharacterAppearance } from '../types/appearance';
type OnboardingPath = 'survey' | 'character' | null;



export type OnboardingState = {
    isComplete: boolean;
  assignedPath: OnboardingPath;
  researchGroup: 'A' | 'B' | null; // 'A' for character, 'B' for survey, null for loading
  characterAppearance?: CharacterAppearance;
  appearance?: Appearance; 
  isLoading: boolean;
};

interface OnboardingContextType {
  onboardingState: OnboardingState;
  setOnboardingState: (updater: (prev: OnboardingState) => OnboardingState) => void;
  completeSurvey: () => void;
  completeCharacter: () => void;
  setAssignedPath: (path: OnboardingPath) => void;
  setCharacterAppearance: (appearance: CharacterAppearance) => void;
  resetOnboarding: () => void;
  setIsLoading: (loading: boolean) => void;
}

// To test different states, modify these values:
// - For loading state: leave assignedPath as null
// - For survey path: set assignedPath to 'survey'
// - For character path: set assignedPath to 'character'
const defaultState: OnboardingState = {
  isComplete: false,
  assignedPath: null, // initially null, can be set to 'survey' or 'character'
  researchGroup: 'A',
  characterAppearance: undefined,
  isLoading: false,
};



const CHARACTER_APPEARANCE_KEY = 'characterAppearance';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultState);

  // Load characterAppearance from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CHARACTER_APPEARANCE_KEY);
        if (stored) {
          setOnboardingState(prev => ({ ...prev, characterAppearance: JSON.parse(stored) }));
        }
      } catch (e) {
        console.warn('Failed to load character appearance from storage', e);
      }
    })();
  }, []);

  const completeSurvey = () => {
    setOnboardingState(prev => ({
      ...prev,
      isComplete: true,
    }));
  };

  const completeCharacter = () => {
    setOnboardingState(prev => ({
      ...prev,
      isComplete: true,
      assignedPath: 'character',
      researchGroup: 'A',
    }));
  };

const setAssignedPath = (path: OnboardingPath) => {
  setOnboardingState(prev => ({
    ...prev,
    assignedPath: path,
    researchGroup:
      path === 'survey'
        ? 'B'
        : path === 'character'
        ? 'A'
        : prev.researchGroup,
  }));
};

  const setCharacterAppearance = (appearance: CharacterAppearance) => {
    setOnboardingState(prev => ({
      ...prev,
      characterAppearance: appearance,
    }));
    AsyncStorage.setItem(CHARACTER_APPEARANCE_KEY, JSON.stringify(appearance)).catch(e => {
      console.warn('Failed to save character appearance to storage', e);
    });
  };

  const resetOnboarding = () => {
    setOnboardingState(defaultState);
    AsyncStorage.removeItem(CHARACTER_APPEARANCE_KEY).catch(() => {});
  };

  const setIsLoading = (loading: boolean) => {
    setOnboardingState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingState,
        setOnboardingState,
        completeSurvey,
        completeCharacter,
        setAssignedPath,
        setCharacterAppearance,
        resetOnboarding,
        setIsLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 