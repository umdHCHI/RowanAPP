import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMasterState } from '../context/MasterStateContext';
import { apiService } from '../services/apiService';

export interface SurveyAnswer {
  question_id: number;
  question_text: string;
  answer_value: number;
  selected_trait: string;
  response_time_ms: number;
}

export const usePersonalitySurvey = () => {
  const { auth } = useMasterState();
  const router = useRouter();

  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Authentication check - Updated to allow survey users without character data
  useEffect(() => {
    const checkAuth = async () => {
      // For survey users, we only need authToken and user - characterId is not required
      if (auth.authToken && auth.user) {
        setIsAuthLoading(false);
      } else {
        setTimeout(() => {
          if (!auth.authToken) {
            router.replace('/(auth)/login');
          } else {
            setIsAuthLoading(false);
          }
        }, 1000);
      }
    };
    
    checkAuth();
  }, [auth.authToken, auth.user, router]); // Removed characterId dependency

  // Handle option selection
  const handleOptionSelect = (optionIdx: number, question: any) => {
    const responseStartTime = Date.now();

    // Send the raw Likert scale position (1-5), not the pre-reversed value
    // optionIdx 0 = "Disagree strongly" = 1
    // optionIdx 1 = "Disagree a little" = 2
    // optionIdx 2 = "Neutral" = 3
    // optionIdx 3 = "Agree a little" = 4
    // optionIdx 4 = "Agree strongly" = 5
    const likertValue = optionIdx + 1;

    const newAnswer: SurveyAnswer = {
      question_id: currentQuestion + 1,
      question_text: question.question,
      answer_value: likertValue,
      selected_trait: question.trait,
      response_time_ms: Date.now() - responseStartTime,
    };

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = newAnswer;
    setAnswers(newAnswers);
  };

  // Navigation handlers
  const handleNext = () => {
    setCurrentQuestion(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  // Check if option is selected
  const isOptionSelected = (optionIdx: number, question: any) => {
    const currentAnswer = answers[currentQuestion];
    const likertValue = optionIdx + 1;
    return currentAnswer?.answer_value === likertValue;
  };

  // Submit survey
  const submitSurvey = async (questions: any[]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await apiService.getProfile();
      const userId = profile.user?.id ?? profile.id;
      if (!userId) throw new Error('User ID not found.');

      const answersPayload = answers.reduce((acc, answer) => {
        acc[answer.question_id] = answer.answer_value;
        return acc;
      }, {} as Record<number, number>);

      const surveySubmissionPayload = {
        user: userId,
        answers: answersPayload,
        completed: true
      };

      console.log('Submitting survey payload:', surveySubmissionPayload);

      await apiService.submitSurveyData(surveySubmissionPayload);

      // ✅ Navigate to Personality Home after successful submission
      router.replace('/(personality)/personality');
    } catch (err: any) {
      console.error('Survey submission failed:', err, err?.response?.data);
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Survey submission failed. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    currentQuestion,
    answers,
    isSubmitting,
    error,
    isAuthLoading,

    // Actions
    handleOptionSelect,
    handleNext,
    handleBack,
    handleSkip,
    submitSurvey,
    isOptionSelected,
  };
};
