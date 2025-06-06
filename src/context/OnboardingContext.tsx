//contexts for onboarding if the users is allocated for survey or character creator
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type OnboardingPath = 'survey' | 'character' | null;

export interface CharacterAppearance {
  isMasc: boolean;
  skin: number;
  hair: number;
  clothes: number;
  glasses: number;
  eyes: number;
  mouth: number;
}

interface OnboardingState {
  hasCompletedSurvey: boolean;
  hasCompletedCharacter: boolean;
  assignedPath: OnboardingPath;
  characterAppearance: CharacterAppearance | null;
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  completeSurvey: () => void;
  completeCharacter: () => void;
  setAssignedPath: (path: OnboardingPath) => void;
  setCharacterAppearance: (appearance: CharacterAppearance) => void;
  resetOnboarding: () => void;
}

// To test different states, modify these values:
// - For loading state: leave assignedPath as null
// - For survey path: set assignedPath to 'survey'
// - For character path: set assignedPath to 'character'
const defaultState: OnboardingState = {
  hasCompletedSurvey: false,
  hasCompletedCharacter: false,
  assignedPath: "character",
  characterAppearance: null,
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
      hasCompletedSurvey: true,
    }));
  };

  const completeCharacter = () => {
    setOnboardingState(prev => ({
      ...prev,
      hasCompletedCharacter: true,
    }));
  };

  const setAssignedPath = (path: OnboardingPath) => {
    setOnboardingState(prev => ({
      ...prev,
      assignedPath: path,
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

  return (
    <OnboardingContext.Provider
      value={{
        onboardingState,
        completeSurvey,
        completeCharacter,
        setAssignedPath,
        setCharacterAppearance,
        resetOnboarding,
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