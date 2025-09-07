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

export interface TraitAverages {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  negativeEmotionality: number;
  openMindedness: number;
}

export const usePersonalitySurvey = () => {
  const { auth } = useMasterState();
  const router = useRouter();
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [traitAverages, setTraitAverages] = useState<TraitAverages | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [currentPrimaryTrait, setCurrentPrimaryTrait] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Authentication check - Updated to allow survey users without character data
  useEffect(() => {
    const checkAuth = async () => {
      // For survey users, we only need authToken and user - characterId is not required
      if (auth.authToken && auth.user) {
        console.log('🔐 Survey auth check passed - user has token and user data');
        setIsAuthLoading(false);
      } else {
        console.log('🔐 Survey auth check - missing requirements:', {
          hasToken: !!auth.authToken,
          hasUser: !!auth.user,
          hasCharacterId: !!auth.characterId
        });
        setTimeout(() => {
          if (!auth.authToken) {
            console.log('🔐 No auth token - redirecting to login');
            router.replace('/(auth)/login');
          } else {
            console.log('🔐 Auth token exists but missing user data - allowing access');
            setIsAuthLoading(false);
          }
        }, 1000);
      }
    };
    
    checkAuth();
  }, [auth.authToken, auth.user, router]); // Removed characterId dependency

  // Calculate trait averages
  const calculateTraitAverages = (answers: SurveyAnswer[]): TraitAverages => {
    const traitSums = {
      extraversion: { total: 0, count: 0 },
      agreeableness: { total: 0, count: 0 },
      conscientiousness: { total: 0, count: 0 },
      negativeEmotionality: { total: 0, count: 0 },
      openMindedness: { total: 0, count: 0 }
    };

    const validAnswers = answers.filter(answer => answer !== undefined);
    
    validAnswers.forEach((answer) => {
      const trait = answer.selected_trait as keyof typeof traitSums;
      traitSums[trait].total += answer.answer_value;
      traitSums[trait].count += 1;
    });

    const averages: Partial<TraitAverages> = {};
    for (const trait in traitSums) {
      const key = trait as keyof TraitAverages;
      if (traitSums[key as keyof typeof traitSums].count > 0) {
        averages[key] = traitSums[key as keyof typeof traitSums].total /
                        traitSums[key as keyof typeof traitSums].count;
      } else {
        averages[key] = 0;
      }
    }
    return averages as TraitAverages;
  };

  // Find dominant trait
  const findDominantTrait = (averages: TraitAverages): keyof TraitAverages => {
    const sorted = Object.entries(averages).sort(([, a], [, b]) => b - a);
    return sorted[0][0] as keyof TraitAverages;
  };

  // Handle option selection
  const handleOptionSelect = (optionIdx: number, question: any) => {
    const responseStartTime = Date.now();
    const selectedOption = question.options[optionIdx];
    
    const newAnswer: SurveyAnswer = {
      question_id: currentQuestion + 1,
      question_text: question.question,
      answer_value: selectedOption.value,
      selected_trait: question.trait,
      response_time_ms: Date.now() - responseStartTime,
    };

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = newAnswer;
    setAnswers(newAnswers);

    // Update trait averages
    const updatedAverages = calculateTraitAverages(newAnswers);
    setTraitAverages(updatedAverages);
    setCurrentPrimaryTrait(findDominantTrait(updatedAverages));
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
    return currentAnswer?.answer_value === question.options[optionIdx].value;
  };

  // Submit survey
  const submitSurvey = async (questions: any[]) => {
    if (answers.length !== questions.length) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const calculatedAverages = calculateTraitAverages(answers);
      const completionTime = Date.now() - startTime.getTime();
      
      // Check if user is admin or test user (same logic as WelcomeScreen)
      const isAdminOrTestUser = auth.isTestUser || auth.user?.username === 'admin';

      let result;
      
      if (isAdminOrTestUser) {
        // Admin/Test users ALWAYS submit via API to get fresh personality data for story filtering
        console.log('👑 Admin/Test user completing survey - submitting via API to update personality profile');
        console.log('Admin/Test user details:', { 
          isTestUser: auth.isTestUser, 
          username: auth.user?.username 
        });
      }
      
      // ALL users (including admin/test) submit via API to get fresh personality data
      console.log('📊 Submitting survey via API for personality profile update...');
      console.log('📊 Survey data preview:', {
        answers_count: answers.length,
        total_questions: questions.length,
        personality_scores: calculatedAverages,
        completion_time_ms: completionTime,
        user_type: isAdminOrTestUser ? 'admin/test' : 'regular'
      });
        
        const comprehensiveSurveyData = {
          survey_version: 'BFI-2-XS',
          answers: answers,
          responses: answers.reduce((acc, answer, index) => {
            acc[index + 1] = answer.answer_value;
            return acc;
          }, {} as Record<number, number>),
          personality_scores: calculatedAverages,
          trait_averages: calculatedAverages,
          primary_trait: findDominantTrait(calculatedAverages),
          completion_time_ms: completionTime,
          start_timestamp: startTime.getTime(),
          end_timestamp: Date.now(),
          total_questions: questions.length,
          questions_answered: answers.length,
          completion_percentage: (answers.length / questions.length) * 100,
          average_completion_time_per_question: completionTime / answers.length,
          
          trait_counts: Object.keys(calculatedAverages).reduce((acc, trait) => {
            acc[trait] = answers.filter(a => a !== undefined && a.selected_trait === trait).length;
            return acc;
          }, {} as Record<string, number>),
          
          response_distribution: {
            strongly_disagree: answers.filter(a => a !== undefined && a.answer_value === 1).length,
            somewhat_disagree: answers.filter(a => a !== undefined && a.answer_value === 2).length,
            neutral: answers.filter(a => a !== undefined && a.answer_value === 3).length,
            somewhat_agree: answers.filter(a => a !== undefined && a.answer_value === 4).length,
            strongly_agree: answers.filter(a => a !== undefined && a.answer_value === 5).length
          },
          
          response_variance: Object.values(calculatedAverages).reduce((sum, avg) => {
            const variance = answers
              .filter(a => a !== undefined && a.selected_trait === Object.keys(calculatedAverages).find(k => calculatedAverages[k as keyof TraitAverages] === avg))
              .reduce((vsum, answer) => vsum + Math.pow(answer.answer_value - avg, 2), 0) / 
              answers.filter(a => a !== undefined && a.selected_trait === Object.keys(calculatedAverages).find(k => calculatedAverages[k as keyof TraitAverages] === avg)).length;
            return sum + variance;
          }, 0) / Object.keys(calculatedAverages).length,
          
          user_agent: 'mobile-app',
          platform: 'react-native',
          timestamp: Date.now(),
          onboarding_path: 'survey',
          app_version: '1.0.0'
        };

      console.log('📤 About to call apiService.submitSurveyData...');
      result = await apiService.submitSurveyData(comprehensiveSurveyData);
      console.log('✅ Survey submission and onboarding completed successfully:', result);

      // Navigate to personality home screen with survey data
      const surveyData = {
        big_five_scores: calculatedAverages,
        primary_trait: findDominantTrait(calculatedAverages),
        survey_id: result?.surveyResult?.id
      };

      router.replace({
        pathname: '/(personality)/personality',
        params: { surveyData: JSON.stringify(surveyData) }
      });
    } catch (err: any) {
      console.error('❌ Survey submission error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack
      });
      
      // Provide user-friendly error messages based on error type
      let userMessage = 'Failed to submit survey. Please try again.';
      if (err.response?.status === 404) {
        userMessage = 'Survey endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        userMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 400) {
        userMessage = `Invalid survey data: ${err.response?.data?.message || 'Please check your responses'}`;
      } else if (err.message?.includes('Network Error')) {
        userMessage = 'Network connection failed. Please check your internet connection.';
      }
      
      setError(userMessage);
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
    traitAverages,
    currentPrimaryTrait,
    isAuthLoading,
    
    // Actions
    handleOptionSelect,
    handleNext,
    handleBack,
    handleSkip,
    submitSurvey,
    isOptionSelected,
    
    // Utilities
    calculateTraitAverages,
    findDominantTrait
  };
};
