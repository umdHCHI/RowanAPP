import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';

interface UseTutorialProps {
  userId?: string;
  authToken?: string;
}

export const useTutorial = ({ userId, authToken }: UseTutorialProps = {}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      // Only check tutorial if user is authenticated
      if (!authToken || !userId) {
        return;
      }

      const tutorialKey = `hasSeenTutorial_${userId}`;
      
      try {
        const tutorialSeen = await AsyncStorage.getItem(tutorialKey);

        if (tutorialSeen === 'true') {
          setHasSeenTutorial(true);
          setTutorialChecked(true);
        } else {
          setHasSeenTutorial(false);
          setTutorialChecked(true);
          // Show tutorial after a brief delay for new users
          setTimeout(() => {
            startTutorial();
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        setTutorialChecked(true);
      }
    };

    checkTutorialStatus();
  }, [authToken, userId]); // Re-check when user changes

  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    
    if (userId) {
      try {
        await AsyncStorage.setItem(`hasSeenTutorial_${userId}`, 'true');
      } catch (error) {
        console.error('Error saving tutorial completion:', error);
      }
    }
  };

  const skipTutorial = async () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    
    if (userId) {
      try {
        await AsyncStorage.setItem(`hasSeenTutorial_${userId}`, 'true');
      } catch (error) {
        console.error('Error saving tutorial skip:', error);
      }
    }
  };

  return {
    showTutorial,
    currentTutorialStep,
    hasSeenTutorial,
    tutorialChecked,
    startTutorial,
    nextTutorialStep,
    previousTutorialStep,
    completeTutorial,
    skipTutorial
  };
};