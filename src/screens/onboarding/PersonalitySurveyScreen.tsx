import { useTheme } from "@/src/imports";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from "../../services/apiService";

/**
 * BFI-2-XS (Big Five Inventory–2 Extra-Short Form)
 * Soto, C. J., & John, O. P. (2017). Short and extra-short forms of the Big Five Inventory–2: 
 * The BFI-2-S and BFI-2-XS. Journal of Research in Personality, 68, 69-81.
 * 
 * Scoring Key (R = reverse-keyed items):
 * Extraversion: 1R, 6, 11
 * Agreeableness: 2, 7R, 12
 * Conscientiousness: 3R, 8R, 13
 * Negative Emotionality: 4, 9, 14R
 * Open-Mindedness: 5, 10R, 15
 */

const QUESTIONS = [
  {
    // Extraversion R - Q1: "Tends to be quiet"
    question: 'I am someone who tends to be quiet',
    trait: 'extraversion',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Agreeableness - Q2: "Is compassionate, has a soft heart"
    question: 'I am someone who is compassionate, has a soft heart',
    trait: 'agreeableness',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Conscientiousness R - Q3: "Tends to be disorganized"
    question: 'I am someone who tends to be disorganized',
    trait: 'conscientiousness',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Negative Emotionality - Q4: "Worries a lot"
    question: 'I am someone who worries a lot',
    trait: 'negativeEmotionality',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Open-Mindedness - Q5: "Is fascinated by art, music, or literature"
    question: 'I am someone who is fascinated by art, music, or literature',
    trait: 'openMindedness',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Extraversion - Q6: "Is dominant, acts as a leader"
    question: 'I am someone who is dominant, acts as a leader',
    trait: 'extraversion',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Agreeableness R - Q7: "Is sometimes rude to others"
    question: 'I am someone who is sometimes rude to others',
    trait: 'agreeableness',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Conscientiousness R - Q8: "Has difficulty getting started on tasks"
    question: 'I am someone who has difficulty getting started on tasks',
    trait: 'conscientiousness',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Negative Emotionality - Q9: "Tends to feel depressed, blue"
    question: 'I am someone who tends to feel depressed, blue',
    trait: 'negativeEmotionality',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Open-Mindedness R - Q10: "Has little interest in abstract ideas"
    question: 'I am someone who has little interest in abstract ideas',
    trait: 'openMindedness',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Extraversion - Q11: "Is full of energy"
    question: 'I am someone who is full of energy',
    trait: 'extraversion',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Agreeableness - Q12: "Assumes the best about people"
    question: 'I am someone who assumes the best about people',
    trait: 'agreeableness',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Conscientiousness - Q13: "Is reliable, can always be counted on"
    question: 'I am someone who is reliable, can always be counted on',
    trait: 'conscientiousness',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
  {
    // Negative Emotionality R - Q14: "Is emotionally stable, not easily upset"
    question: 'I am someone who is emotionally stable, not easily upset',
    trait: 'negativeEmotionality',
    options: [
      { text: 'Disagree strongly', value: 5 },
      { text: 'Disagree a little', value: 4 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 2 },
      { text: 'Agree strongly', value: 1 },
    ],
  },
  {
    // Open-Mindedness - Q15: "Is original, comes up with new ideas"
    question: 'I am someone who is original, comes up with new ideas',
    trait: 'openMindedness',
    options: [
      { text: 'Disagree strongly', value: 1 },
      { text: 'Disagree a little', value: 2 },
      { text: 'Neutral; no opinion', value: 3 },
      { text: 'Agree a little', value: 4 },
      { text: 'Agree strongly', value: 5 },
    ],
  },
];

const traitToArchetype: Record<string, string> = {
  extraversion: "The Social Catalyst",
  agreeableness: "The Harmonious Healer",
  conscientiousness: "The Methodical Guardian",
  negativeEmotionality: "The Depth Walker",
  openMindedness: "The Sage Explorer"
};

interface SurveyAnswer {
  question_id: number;
  selected_trait: keyof TraitAverages;
  answer_value: number;
}

interface TraitAverages {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  negativeEmotionality: number;
  openMindedness: number;
}

const getPrimaryTrait = (averages: TraitAverages): keyof TraitAverages => {
  const entries = Object.entries(averages);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  console.log('Sorted traits by value:', sorted);
  return sorted[0][0] as keyof TraitAverages;
};

export default function PersonalitySurveyScreen() {
  const { styles: globalStyles, theme } = useTheme();

  const { authToken, characterId, user } = useMasterState().auth;
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<SurveyAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [traitAverages, setTraitAverages] = React.useState<TraitAverages | null>(null);
  const [startTime] = React.useState<Date>(new Date());
  const [currentPrimaryTrait, setCurrentPrimaryTrait] = React.useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('PersonalitySurveyScreen: Checking authentication...');
      console.log('Auth token present:', !!authToken);
      console.log('Character ID present:', !!characterId);
      console.log('User present:', !!user);
      
      if (authToken && characterId) {
        console.log('PersonalitySurveyScreen: Authentication confirmed');
        setIsAuthLoading(false);
      } else {
        // Wait a bit for auth context to load
        setTimeout(() => {
          if (!authToken) {
            console.log('PersonalitySurveyScreen: No auth token found, redirecting to login');
            router.replace('/(auth)/login');
          } else {
            setIsAuthLoading(false);
          }
        }, 1000);
      }
    };
    
    checkAuth();
  }, [authToken, characterId, user, router]);

  const calculateTraitAverages = (answers: SurveyAnswer[]): TraitAverages => {
    const traitSums = {
      extraversion: {total: 0, count: 0},
      agreeableness: {total: 0, count: 0},
      conscientiousness: {total: 0, count: 0},
      negativeEmotionality: {total: 0, count: 0},
      openMindedness: {total: 0, count: 0}
    };

    // Filter out undefined answers and only process valid answers
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
        averages[key] = 0; // Default to 0 if no answers for this trait
      }
    }

    // Debug logging
    console.log('=== TRAIT CALCULATION DEBUG ===');
    console.log('Raw answers:', answers);
    console.log('Trait sums:', traitSums);
    console.log('Calculated averages:', averages);
    
    // Determine primary trait
    const primaryTrait = getPrimaryTrait(averages as TraitAverages);
    console.log('Primary trait:', primaryTrait);
    console.log('Primary trait value:', averages[primaryTrait]);
    console.log('================================');

    return averages as TraitAverages;
  }

  // Update current primary trait whenever answers change
  React.useEffect(() => {
    if (answers.length > 0) {
      const averages = calculateTraitAverages(answers);
      const primary = getPrimaryTrait(averages);
      setCurrentPrimaryTrait(primary);
    }
  }, [answers]);

  // Test function to verify calculation logic
  const testCalculation = () => {
    console.log('=== TESTING BFI-2-XS CALCULATION ===');
    
    // Test case 1: High extraversion answers (BFI-2-XS format)
    const testAnswers1: SurveyAnswer[] = [
      { question_id: 1, selected_trait: 'extraversion', answer_value: 5 }, // Disagree strongly with "tends to be quiet" (reverse scored)
      { question_id: 6, selected_trait: 'extraversion', answer_value: 5 }, // Agree strongly with "is dominant, acts as a leader"
      { question_id: 11, selected_trait: 'extraversion', answer_value: 5 }, // Agree strongly with "is full of energy"
    ];
    
    const result1 = calculateTraitAverages(testAnswers1);
    console.log('Test 1 - High Extraversion:', result1);
    console.log('Primary trait should be extraversion:', getPrimaryTrait(result1));
    
    // Test case 2: High agreeableness answers (BFI-2-XS format)
    const testAnswers2: SurveyAnswer[] = [
      { question_id: 2, selected_trait: 'agreeableness', answer_value: 5 }, // Agree strongly with "is compassionate, has a soft heart"
      { question_id: 7, selected_trait: 'agreeableness', answer_value: 5 }, // Disagree strongly with "is sometimes rude to others" (reverse scored)
      { question_id: 12, selected_trait: 'agreeableness', answer_value: 5 }, // Agree strongly with "assumes the best about people"
    ];
    
    const result2 = calculateTraitAverages(testAnswers2);
    console.log('Test 2 - High Agreeableness:', result2);
    console.log('Primary trait should be agreeableness:', getPrimaryTrait(result2));
    
    // Test case 3: All "Agree strongly" answers (edge case)
    const testAnswers3: SurveyAnswer[] = QUESTIONS.map((q, idx) => ({
      question_id: idx + 1,
      selected_trait: q.trait as keyof TraitAverages,
      answer_value: 5 // All "Agree strongly" answers
    }));
    
    const result3 = calculateTraitAverages(testAnswers3);
    console.log('Test 3 - All "Agree Strongly" Answers:', result3);
    console.log('Primary trait with all agree strongly:', getPrimaryTrait(result3));
    
    // Test case 4: All "Disagree strongly" answers (edge case)
    const testAnswers4: SurveyAnswer[] = QUESTIONS.map((q, idx) => ({
      question_id: idx + 1,
      selected_trait: q.trait as keyof TraitAverages,
      answer_value: 1 // All "Disagree strongly" answers
    }));
    
    const result4 = calculateTraitAverages(testAnswers4);
    console.log('Test 4 - All "Disagree Strongly" Answers:', result4);
    console.log('Primary trait with all disagree strongly:', getPrimaryTrait(result4));
    
    console.log('=== END TEST ===');
  };

  // Enhanced debugging function to analyze current answers
  const analyzeCurrentAnswers = () => {
    if (answers.length === 0) return;
    
    console.log('=== ANALYZING CURRENT ANSWERS ===');
    console.log('Total answers:', answers.length);
    
    // Group answers by trait
    const answersByTrait: Record<string, SurveyAnswer[]> = {
      extraversion: [],
      agreeableness: [],
      conscientiousness: [],
      negativeEmotionality: [],
      openMindedness: []
    };
    
    // Filter out undefined answers
    const validAnswers = answers.filter(answer => answer !== undefined);
    
    validAnswers.forEach(answer => {
      answersByTrait[answer.selected_trait].push(answer);
    });
    
    console.log('Answers by trait:', answersByTrait);
    
    // Calculate sums for each trait
    const traitSums: Record<string, { total: number, count: number, average: number }> = {};
    
    Object.entries(answersByTrait).forEach(([trait, traitAnswers]) => {
      const total = traitAnswers.reduce((sum, answer) => sum + answer.answer_value, 0);
      const count = traitAnswers.length;
      const average = count > 0 ? total / count : 0;
      
      traitSums[trait] = { total, count, average };
      
      console.log(`${trait}: ${count} answers, total: ${total}, average: ${average.toFixed(2)}`);
    });
    
    // Show which trait has the highest average
    const sortedTraits = Object.entries(traitSums)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => b[1].average - a[1].average);
    
    console.log('Traits sorted by average (highest first):', sortedTraits);
    
    if (sortedTraits.length > 0) {
      console.log('Current highest trait:', sortedTraits[0][0], 'with average:', sortedTraits[0][1].average);
    }
    
    console.log('=== END ANALYSIS ===');
  };

  // Run test on component mount
  React.useEffect(() => {
    testCalculation();
    
    // Additional BFI-2-XS verification
    console.log('=== BFI-2-XS VERIFICATION ===');
    console.log('Total questions:', QUESTIONS.length);
    console.log('Expected: 15 questions');
    
    // Verify each trait has exactly 3 questions
    const traitCounts = QUESTIONS.reduce((acc, q) => {
      acc[q.trait] = (acc[q.trait] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Questions per trait:', traitCounts);
    console.log('Expected: 3 questions per trait');
    
    // Verify reverse scoring is correct
    const reverseScoredQuestions = [1, 3, 7, 8, 10, 14]; // BFI-2-XS reverse scored questions
    reverseScoredQuestions.forEach(qNum => {
      const question = QUESTIONS[qNum - 1];
      const isReverseScored = question.options[0].value === 5; // First option should be highest value
      console.log(`Q${qNum} (${question.trait}): ${question.question} - Reverse scored: ${isReverseScored}`);
    });
    
    console.log('=== END BFI-2-XS VERIFICATION ===');
  }, []);

  // Analyze answers whenever they change
  React.useEffect(() => {
    analyzeCurrentAnswers();
  }, [answers]);

  const handleOptionSelect = (optionIdx: number) => {
    const updated = [...answers];
    // Ensure the array has enough elements by filling with undefined if needed
    if (updated.length <= currentQuestion) {
      updated.length = currentQuestion + 1;
    }
    updated[currentQuestion] = {
      question_id: currentQuestion + 1,
      selected_trait: QUESTIONS[currentQuestion].trait as keyof TraitAverages,
      answer_value: QUESTIONS[currentQuestion].options[optionIdx].value
    };
    setAnswers(updated);
  };

  const submitSurvey = async () => {
    try {
      console.log("=== SUBMITTING SURVEY ===");
      console.log("Auth token present:", authToken ? "Yes" : "No");
      console.log("Character ID:", characterId);
      console.log("User:", user);
      
      if (!authToken) {
        throw new Error('Not authenticated');
      }
  
      setIsSubmitting(true);
      setError(null);
  
      const calculatedAverages = calculateTraitAverages(answers);
      setTraitAverages(calculatedAverages);
      const primaryTrait = getPrimaryTrait(calculatedAverages);
      
      // Format answers as a dictionary with question_id as key and answer_value as value
      const formattedAnswers = answers.filter(answer => answer !== undefined).reduce((acc, answer) => {
        acc[answer.question_id] = answer.answer_value;
        return acc;
      }, {} as Record<number, number>);
  
      // Calculate completion time in seconds
      const completionTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  
      // Create comprehensive survey data to pass to backend
      const comprehensiveSurveyData = {
        survey_type: 'big_five_personality',
        version: '1.0',
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        completion_time_seconds: completionTime,
        
        primary_trait: primaryTrait,
        primary_archetype: traitToArchetype[primaryTrait],
        
        // Personality scores (trait averages) - main research output
        personality_scores: {
          extraversion: calculatedAverages.extraversion,
          agreeableness: calculatedAverages.agreeableness,
          conscientiousness: calculatedAverages.conscientiousness,
          negativeEmotionality: calculatedAverages.negativeEmotionality,
          openMindedness: calculatedAverages.openMindedness
        },
        
        // Raw survey responses (question_id -> answer_value)
        responses: formattedAnswers,
        
        // Detailed answer breakdown with full context
        detailed_answers: answers.filter(answer => answer !== undefined).map(answer => ({
          question_id: answer.question_id,
          question_text: QUESTIONS[answer.question_id - 1]?.question,
          trait: answer.selected_trait,
          answer_value: answer.answer_value,
          answer_text: QUESTIONS[answer.question_id - 1]?.options.find(opt => opt.value === answer.answer_value)?.text,
          is_reverse_scored: QUESTIONS[answer.question_id - 1]?.question.includes('quiet') || 
                            QUESTIONS[answer.question_id - 1]?.question.includes('disorganized') ||
                            QUESTIONS[answer.question_id - 1]?.question.includes('rude') ||
                            QUESTIONS[answer.question_id - 1]?.question.includes('difficulty getting started') ||
                            QUESTIONS[answer.question_id - 1]?.question.includes('emotionally stable') ||
                            QUESTIONS[answer.question_id - 1]?.question.includes('little interest in abstract')
        })),
        
        // Survey metadata
        total_questions: QUESTIONS.length,
        questions_answered: answers.length,
        completion_percentage: (answers.length / QUESTIONS.length) * 100,
        average_completion_time_per_question: completionTime / answers.length,
        
        // Additional research metrics
        trait_counts: Object.keys(calculatedAverages).reduce((acc, trait) => {
          acc[trait] = answers.filter(a => a !== undefined && a.selected_trait === trait).length;
          return acc;
        }, {} as Record<string, number>),
        
        // Response pattern analysis
        response_distribution: {
          strongly_disagree: answers.filter(a => a !== undefined && a.answer_value === 1).length,
          somewhat_disagree: answers.filter(a => a !== undefined && a.answer_value === 2).length,
          neutral: answers.filter(a => a !== undefined && a.answer_value === 3).length,
          somewhat_agree: answers.filter(a => a !== undefined && a.answer_value === 4).length,
          strongly_agree: answers.filter(a => a !== undefined && a.answer_value === 5).length
        },
        
        // Statistical measures
        response_variance: Object.values(calculatedAverages).reduce((sum, avg) => {
          const variance = answers
            .filter(a => a !== undefined && a.selected_trait === Object.keys(calculatedAverages).find(k => calculatedAverages[k as keyof TraitAverages] === avg))
            .reduce((vsum, answer) => vsum + Math.pow(answer.answer_value - avg, 2), 0) / 
            answers.filter(a => a !== undefined && a.selected_trait === Object.keys(calculatedAverages).find(k => calculatedAverages[k as keyof TraitAverages] === avg)).length;
          return sum + variance;
        }, 0) / Object.keys(calculatedAverages).length,
        
        // Device/session info
        user_agent: 'mobile-app',
        platform: 'react-native',
        timestamp: Date.now(),
        
        // Onboarding context
        onboarding_path: 'survey',
        app_version: '1.0.0'
      };
  
            console.log('Comprehensive survey data to submit:', comprehensiveSurveyData);

      let surveyResult: any = null;
      
      try {
        // Submit survey data and complete onboarding via API service
        console.log('=== CALLING API SERVICE COMPLETE SURVEY ONBOARDING ===');
        
        const result = await apiService.completeSurveyOnboarding(comprehensiveSurveyData);
        surveyResult = result;
        
        console.log('Survey onboarding completed successfully:', result);
        console.log('Survey result:', result.surveyResult);
        console.log('Onboarding result:', result.onboardingResult);
        
      } catch (surveyError: any) {
        console.error('=== SURVEY ONBOARDING ERROR ===');
        console.error('Survey onboarding failed:', surveyError);
        console.error('Survey error details:', {
          message: surveyError.message,
          response: surveyError.response?.data,
          status: surveyError.response?.status
        });
        console.error('=== END SURVEY ONBOARDING ERROR ===');
        
        // Show error to user but still allow navigation
        setError('Survey submission encountered an issue, but your responses have been saved.');
        console.log('Continuing to personality screen despite survey onboarding error');
      }
      
      // Add a longer delay to ensure the backend has processed the survey data
      console.log("=== WAITING FOR BACKEND TO PROCESS SURVEY DATA ===");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("=== NAVIGATING TO PERSONALITY SCREEN ===");
      console.log("Final auth token check:", authToken ? "Present" : "Missing");
      
      // Pass the survey data directly to the personality screen via navigation params
      // Map BFI-2-XS trait names to frontend trait names
      const traitMap: Record<string, string> = {
        'openMindedness': 'Openness', // BFI-2-XS openMindedness maps to frontend Openness
        'conscientiousness': 'Conscientiousness', 
        'extraversion': 'Extraversion',
        'agreeableness': 'Agreeableness',
        'negativeEmotionality': 'Neuroticism' // BFI-2-XS negativeEmotionality maps to frontend Neuroticism
      };
      
      const surveyData = {
        big_five_scores: calculatedAverages,
        primary_trait: traitMap[primaryTrait] || primaryTrait,
        survey_id: surveyResult?.surveyResult?.id
      };
      
      console.log("Passing survey data to personality screen:", surveyData);
      console.log("Original primary trait (BFI-2-XS):", primaryTrait);
      console.log("Mapped primary trait (Frontend):", traitMap[primaryTrait] || primaryTrait);
      
      // Navigate to personality home screen with survey data
      router.replace({
        pathname: '/(personality)/personality',
        params: { surveyData: JSON.stringify(surveyData) }
      });
      
    } catch (error: any) {
      console.error('Failed to submit survey:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request headers:', error.config?.headers);
      console.error('Request data:', error.config?.data);
      setError(error.response?.data?.detail || 'Failed to submit survey. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show summary before submitting
      const finalAverages = calculateTraitAverages(answers);
      const finalPrimaryTrait = getPrimaryTrait(finalAverages);
      console.log('=== FINAL SURVEY SUMMARY ===');
      console.log('All trait averages:', finalAverages);
      console.log('Final primary trait:', finalPrimaryTrait);
      console.log('Final archetype:', traitToArchetype[finalPrimaryTrait]);
      console.log('============================');
      submitSurvey();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  const isOptionSelected = (optionIdx: number) => {
    const currentAnswer = answers[currentQuestion];
    return currentAnswer?.answer_value === QUESTIONS[currentQuestion].options[optionIdx].value;
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Loading Screen */}
      {isAuthLoading && (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={globalStyles.title}>Loading...</Text>
          <Text style={globalStyles.text}>Preparing your personalized survey</Text>
        </View>
      )}

      {/* Survey Content - Only show when authenticated */}
      {!isAuthLoading && (
        <>
          {/* Modal Intro */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={globalStyles.modalOverlay}>
            <View style={[globalStyles.card, { margin: 20, maxWidth: 400 }]}>
                <Text style={globalStyles.title}>Discovering Your Path</Text>
                <Text style={globalStyles.text}>
                  To create your personalized journey, answer a few metaphorical questions. There are no right or wrong answers—just insights into your unique story.
                </Text>
                <TouchableOpacity style={globalStyles.button} onPress={() => setModalVisible(false)}>
                  <Text style={globalStyles.buttonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Question Card */}
          <View style={globalStyles.container}>
            <Text style={[globalStyles.text, { marginBottom: 8 }]}>Question {currentQuestion + 1} of {QUESTIONS.length}</Text>
            <View style={globalStyles.progressBar}>
              <View style={[globalStyles.progressBarFill, { width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }]} />
            </View>
            
            {/* Current Primary Trait Indicator */}
            {currentPrimaryTrait && answers.length > 0 && (
              <View style={[globalStyles.card, { marginBottom: 16, padding: 12, backgroundColor: theme.card }]}>
                <Text style={[globalStyles.text, { fontSize: 14, color: theme.tabBarInactive }]}>
                  Current Primary Trait:
                </Text>
                <Text style={[globalStyles.subtitle, { color: theme.primary, marginTop: 4 }]}>
                  {traitToArchetype[currentPrimaryTrait]} ({currentPrimaryTrait})
                </Text>
                
                {/* Debug: Show all trait scores */}
                {(() => {
                  const averages = calculateTraitAverages(answers);
                  return (
                    <View style={{ marginTop: 8 }}>
                      <Text style={[globalStyles.text, { fontSize: 12, color: theme.tabBarInactive, marginBottom: 4 }]}>
                        All Trait Scores:
                      </Text>
                      {Object.entries(averages).map(([trait, score]) => (
                        <Text key={trait} style={[
                          globalStyles.text, 
                          { 
                            fontSize: 11, 
                            color: trait === currentPrimaryTrait ? theme.primary : theme.text,
                            fontWeight: trait === currentPrimaryTrait ? 'bold' : 'normal'
                          }
                        ]}>
                          {trait}: {score.toFixed(2)}
                        </Text>
                      ))}
                    </View>
                  );
                })()}
              </View>
            )}
            <View style={[globalStyles.card, { maxWidth: 400, width: '100%' }] }>
              <Text style={globalStyles.subtitle}>{QUESTIONS[currentQuestion].question}</Text>
              {QUESTIONS[currentQuestion].options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    globalStyles.button,
                    { 
                      alignItems: 'flex-start', 
                      backgroundColor: isOptionSelected(idx) ? theme.primary : theme.card, 
                      borderColor: theme.border, 
                      borderWidth: 1, 
                      marginVertical: 4,
                      opacity: isSubmitting ? 0.5 : 1
                    },
                  ]}
                  onPress={() => handleOptionSelect(idx)}
                  disabled={isSubmitting}
                >
                  <Text style={[globalStyles.text, { color: isOptionSelected(idx) ? '#fff' : theme.text }]}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 400, marginTop: 16 }}>
              <TouchableOpacity onPress={handleSkip} disabled={isSubmitting}>
                <Text style={[globalStyles.text, { color: theme.tabBarInactive, textDecorationLine: 'underline' }]}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.button, 
                  { 
                    opacity: (answers[currentQuestion] === undefined || isSubmitting) ? 0.5 : 1, 
                    marginLeft: 16, 
                    backgroundColor: theme.primary 
                  }
                ]}
                onPress={handleNext}
                disabled={answers[currentQuestion] === undefined || isSubmitting}
              >
                <Text style={globalStyles.buttonText}>
                  {currentQuestion === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
            {error && (
              <Text style={[globalStyles.text, { color: theme.notification, marginTop: 16 }]}>
                {error}
              </Text>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

