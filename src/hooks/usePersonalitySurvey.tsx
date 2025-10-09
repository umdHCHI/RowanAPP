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

  // Calculate trait averages - Fixed to use correct BFI-2-XS scoring
  const calculateTraitAverages = (answers: SurveyAnswer[]): TraitAverages => {
    const traitSums = {
      extraversion: { total: 0, count: 0 },
      agreeableness: { total: 0, count: 0 },
      conscientiousness: { total: 0, count: 0 },
      negativeEmotionality: { total: 0, count: 0 },
      openMindedness: { total: 0, count: 0 }
    };

    const validAnswers = answers.filter(answer => answer !== undefined);
    
    console.log('📊 Calculating trait averages from answers:', validAnswers.length);
    
    validAnswers.forEach((answer, index) => {
      const trait = answer.selected_trait as keyof typeof traitSums;
      let score = answer.answer_value;
      
      // Apply reverse scoring for BFI-2-XS based on question number
      const questionNum = answer.question_id;
      const isReverseScored = (
        (trait === 'extraversion' && questionNum === 1) ||
        (trait === 'agreeableness' && questionNum === 7) ||
        (trait === 'conscientiousness' && (questionNum === 3 || questionNum === 8)) ||
        (trait === 'negativeEmotionality' && questionNum === 14) ||
        (trait === 'openMindedness' && questionNum === 10)
      );
      
      if (isReverseScored) {
        score = 6 - answer.answer_value; // Reverse score: 1->5, 2->4, 3->3, 4->2, 5->1
        console.log(`📊 Answer ${index + 1}: trait=${trait}, original=${answer.answer_value}, reversed=${score}, question="${answer.question_text}"`);
      } else {
        console.log(`📊 Answer ${index + 1}: trait=${trait}, value=${score}, question="${answer.question_text}"`);
      }
      
      traitSums[trait].total += score;
      traitSums[trait].count += 1;
    });

    const averages: Partial<TraitAverages> = {};
    for (const trait in traitSums) {
      const key = trait as keyof TraitAverages;
      const traitData = traitSums[key as keyof typeof traitSums];
      if (traitData.count > 0) {
        averages[key] = traitData.total / traitData.count;
        console.log(`📊 ${trait}: total=${traitData.total}, count=${traitData.count}, average=${averages[key]}`);
      } else {
        averages[key] = 0;
        console.log(`📊 ${trait}: no answers, average=0`);
      }
    }
    
    console.log('📊 Final trait averages:', averages);
    return averages as TraitAverages;
  };

  // Find dominant trait and convert to personality key
  const findDominantTrait = (averages: TraitAverages): string => {
    const sorted = Object.entries(averages).sort(([, a], [, b]) => b - a);
    const dominantTrait = sorted[0][0] as keyof TraitAverages;
    
    console.log('🎯 Trait averages sorted by score:', sorted);
    console.log('🎯 Dominant trait from survey:', dominantTrait);
    console.log('🎯 Dominant trait score:', averages[dominantTrait]);
    
    // Convert survey trait names to personality key names
    const traitMapping: Record<string, string> = {
      'negativeEmotionality': 'neuroticism',
      'openMindedness': 'openness',
      'agreeableness': 'agreeableness',
      'conscientiousness': 'conscientiousness',
      'extraversion': 'extraversion'
    };
    
    const personalityKey = traitMapping[dominantTrait] || dominantTrait;
    console.log('🎯 Mapped to personality key:', personalityKey);
    
    return personalityKey;
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
        
        // Convert trait averages to standard personality key names for API
        const standardizedScores = {
          extraversion: calculatedAverages.extraversion,
          agreeableness: calculatedAverages.agreeableness,
          conscientiousness: calculatedAverages.conscientiousness,
          neuroticism: calculatedAverages.negativeEmotionality,
          openness: calculatedAverages.openMindedness
        };
        
        const comprehensiveSurveyData = {
          survey_version: 'BFI-2-XS',
          answers: answers.reduce((acc, answer, index) => {
            acc[index + 1] = answer.answer_value;
            return acc;
          }, {} as Record<number, number>),
          responses: answers.reduce((acc, answer, index) => {
            acc[index + 1] = answer.answer_value;
            return acc;
          }, {} as Record<number, number>),
          personality_scores: standardizedScores,
          trait_averages: standardizedScores,
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
      const dominantTrait = findDominantTrait(calculatedAverages);
      console.log('🎯 Survey completion - Dominant trait:', dominantTrait);
      console.log('🎯 Survey completion - Calculated averages:', calculatedAverages);
      
      const surveyData = {
        big_five_scores: standardizedScores,
        primary_trait: dominantTrait,
        survey_id: result?.surveyResult?.id || null
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
      } else if (err.response?.status === 403) {
        userMessage = 'Survey access denied. Please contact support.';
      } else if (err.message?.includes('Network Error')) {
        userMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err.message?.includes('Property') && err.message?.includes("doesn't exist")) {
        userMessage = 'Survey submission completed but encountered a minor issue. You can proceed to the personality section.';
        // For this specific error, we can still navigate to the personality section
        setTimeout(() => {
          router.replace('/(personality)/personality');
        }, 2000);
        return;
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
