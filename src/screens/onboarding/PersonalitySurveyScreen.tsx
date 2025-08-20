import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import {
  ErrorDisplay,
  LoadingScreen,
  QuestionCard,
  SurveyHeader,
  SurveyIntroModal,
  SurveyNavigation,
  SurveyProgress
} from '../../components/survey';
import { useMasterState } from '../../context/MasterStateContext';
import { SURVEY_QUESTIONS } from '../../data/surveyQuestions';
import { usePersonalitySurvey } from '../../hooks/usePersonalitySurvey';
import { getPersonalitySurveyStyles } from '../../styles/globalStyles';

/**
 * Refactored PersonalitySurveyScreen - Now much cleaner and modular!
 * 
 * This component orchestrates the personality survey flow by:
 * 1. Managing the modal introduction
 * 2. Displaying questions one by one
 * 3. Handling navigation between questions
 * 4. Submitting the final results
 */
export default function PersonalitySurveyScreen() {
  const { theme } = useMasterState();
  const personalitySurveyStyles = getPersonalitySurveyStyles(theme.personalitySurveyTheme);
  
  // Modal state (separate from survey logic)
  const [modalVisible, setModalVisible] = useState(true);
  
  // All survey logic is now in the custom hook
  const {
    currentQuestion,
    answers,
    isSubmitting,
    error,
    isAuthLoading,
    handleOptionSelect,
    handleNext,
    handleSkip,
    submitSurvey,
    isOptionSelected
  } = usePersonalitySurvey();

  // Handle next question or submit
  const handleNextOrSubmit = () => {
    if (currentQuestion === SURVEY_QUESTIONS.length - 1) {
      submitSurvey(SURVEY_QUESTIONS);
    } else {
      handleNext();
    }
  };

  // Enhanced option select with current question context
  const handleOptionSelectWithContext = (optionIdx: number) => {
    handleOptionSelect(optionIdx, SURVEY_QUESTIONS[currentQuestion]);
  };

  // Enhanced option selection check
  const isOptionSelectedWithContext = (optionIdx: number) => {
    return isOptionSelected(optionIdx, SURVEY_QUESTIONS[currentQuestion]);
  };

  // Show loading screen while authenticating
  if (isAuthLoading) {
    return <LoadingScreen styles={personalitySurveyStyles} />;
  }

  return (
    <SafeAreaView style={personalitySurveyStyles.container}>
      {/* Introduction Modal */}
      <SurveyIntroModal
        visible={modalVisible}
        onStart={() => setModalVisible(false)}
        styles={personalitySurveyStyles}
      />

      {/* Main Survey Content */}
      {!modalVisible && (
        <>
          {/* Header */}
          <SurveyHeader styles={personalitySurveyStyles} />

          {/* Progress Indicator */}
          <SurveyProgress
            currentQuestion={currentQuestion}
            totalQuestions={SURVEY_QUESTIONS.length}
            styles={personalitySurveyStyles}
          />

          {/* Question Card */}
          <QuestionCard
            question={SURVEY_QUESTIONS[currentQuestion]}
            onOptionSelect={handleOptionSelectWithContext}
            isOptionSelected={isOptionSelectedWithContext}
            isSubmitting={isSubmitting}
            styles={personalitySurveyStyles}
          />

          {/* Navigation */}
          <SurveyNavigation
            currentQuestion={currentQuestion}
            totalQuestions={SURVEY_QUESTIONS.length}
            hasAnswer={answers[currentQuestion] !== undefined}
            isSubmitting={isSubmitting}
            onNext={handleNextOrSubmit}
            onSkip={handleSkip}
            styles={personalitySurveyStyles}
          />

          {/* Error Display */}
          {error && (
            <ErrorDisplay 
              error={error} 
              styles={personalitySurveyStyles} 
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
