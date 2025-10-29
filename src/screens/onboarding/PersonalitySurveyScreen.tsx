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
import { createPersonalitySurveyStyles } from '../../styles/screens/personalitySurvey';

export default function PersonalitySurveyScreen() {
  const { theme } = useMasterState();
  const personalitySurveyStyles = createPersonalitySurveyStyles(theme.personalitySurveyTheme);
  
  const [modalVisible, setModalVisible] = useState(true);
  
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

  const handleNextOrSubmit = () => {
    if (currentQuestion === SURVEY_QUESTIONS.length - 1) {
      submitSurvey(SURVEY_QUESTIONS);
    } else {
      handleNext();
    }
  };

  const handleOptionSelectWithContext = (optionIdx: number) => {
    handleOptionSelect(optionIdx, SURVEY_QUESTIONS[currentQuestion]);
  };

  const isOptionSelectedWithContext = (optionIdx: number) => {
    return isOptionSelected(optionIdx, SURVEY_QUESTIONS[currentQuestion]);
  };

  if (isAuthLoading) {
    return <LoadingScreen styles={personalitySurveyStyles} />;
  }

  return (
    <SafeAreaView style={personalitySurveyStyles.container}>
      <SurveyIntroModal
        visible={modalVisible}
        onStart={() => setModalVisible(false)}
        styles={personalitySurveyStyles}
      />

      {!modalVisible && (
        <>
          <SurveyHeader styles={personalitySurveyStyles} />

          <SurveyProgress
            currentQuestion={currentQuestion}
            totalQuestions={SURVEY_QUESTIONS.length}
            styles={personalitySurveyStyles}
          />

          <QuestionCard
            question={SURVEY_QUESTIONS[currentQuestion]}
            onOptionSelect={handleOptionSelectWithContext}
            isOptionSelected={isOptionSelectedWithContext}
            isSubmitting={isSubmitting}
            styles={personalitySurveyStyles}
          />

          <SurveyNavigation
            currentQuestion={currentQuestion}
            totalQuestions={SURVEY_QUESTIONS.length}
            hasAnswer={answers[currentQuestion] !== undefined}
            isSubmitting={isSubmitting}
            onNext={handleNextOrSubmit}
            onSkip={handleSkip}
            styles={personalitySurveyStyles}
          />

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
