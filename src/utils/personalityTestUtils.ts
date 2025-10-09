/**
 * Utility functions for testing and debugging personality calculations
 */

export interface TestSurveyAnswer {
  selected_trait: string;
  answer_value: number;
  question_text?: string;
}

export interface PersonalityTestResult {
  traitAverages: Record<string, number>;
  dominantTrait: string;
  personalityKey: string;
  sortedTraits: Array<[string, number]>;
}

/**
 * Calculate personality traits from survey answers
 */
export function calculatePersonalityFromAnswers(answers: TestSurveyAnswer[]): PersonalityTestResult {
  const traitSums = {
    extraversion: { total: 0, count: 0 },
    agreeableness: { total: 0, count: 0 },
    conscientiousness: { total: 0, count: 0 },
    negativeEmotionality: { total: 0, count: 0 },
    openMindedness: { total: 0, count: 0 }
  };

  // Calculate sums for each trait
  answers.forEach(answer => {
    const trait = answer.selected_trait as keyof typeof traitSums;
    if (traitSums[trait]) {
      traitSums[trait].total += answer.answer_value;
      traitSums[trait].count += 1;
    }
  });

  // Calculate averages
  const traitAverages = {
    extraversion: traitSums.extraversion.count > 0 ? traitSums.extraversion.total / traitSums.extraversion.count : 0,
    agreeableness: traitSums.agreeableness.count > 0 ? traitSums.agreeableness.total / traitSums.agreeableness.count : 0,
    conscientiousness: traitSums.conscientiousness.count > 0 ? traitSums.conscientiousness.total / traitSums.conscientiousness.count : 0,
    negativeEmotionality: traitSums.negativeEmotionality.count > 0 ? traitSums.negativeEmotionality.total / traitSums.negativeEmotionality.count : 0,
    openMindedness: traitSums.openMindedness.count > 0 ? traitSums.openMindedness.total / traitSums.openMindedness.count : 0
  };

  // Find dominant trait
  const sortedTraits = Object.entries(traitAverages).sort(([, a], [, b]) => b - a);
  const dominantTrait = sortedTraits[0][0];

  // Convert to personality key
  const traitMapping: Record<string, string> = {
    'negativeEmotionality': 'neuroticism',
    'openMindedness': 'openness',
    'agreeableness': 'agreeableness',
    'conscientiousness': 'conscientiousness',
    'extraversion': 'extraversion'
  };

  const personalityKey = traitMapping[dominantTrait] || dominantTrait;

  return {
    traitAverages,
    dominantTrait,
    personalityKey,
    sortedTraits
  };
}

/**
 * Test cases for different personality types
 */
export const PERSONALITY_TEST_CASES = [
  {
    name: "High Openness User",
    description: "Creative, curious, open to new experiences",
    answers: [
      { selected_trait: 'openMindedness', answer_value: 5 },
      { selected_trait: 'openMindedness', answer_value: 5 },
      { selected_trait: 'openMindedness', answer_value: 4 },
      { selected_trait: 'extraversion', answer_value: 2 },
      { selected_trait: 'agreeableness', answer_value: 3 },
      { selected_trait: 'conscientiousness', answer_value: 2 },
      { selected_trait: 'negativeEmotionality', answer_value: 2 }
    ]
  },
  {
    name: "High Neuroticism User",
    description: "Emotionally sensitive, anxious, stress-prone",
    answers: [
      { selected_trait: 'negativeEmotionality', answer_value: 5 },
      { selected_trait: 'negativeEmotionality', answer_value: 5 },
      { selected_trait: 'negativeEmotionality', answer_value: 4 },
      { selected_trait: 'extraversion', answer_value: 1 },
      { selected_trait: 'agreeableness', answer_value: 2 },
      { selected_trait: 'conscientiousness', answer_value: 3 },
      { selected_trait: 'openMindedness', answer_value: 2 }
    ]
  },
  {
    name: "High Extraversion User",
    description: "Social, energetic, outgoing",
    answers: [
      { selected_trait: 'extraversion', answer_value: 5 },
      { selected_trait: 'extraversion', answer_value: 5 },
      { selected_trait: 'extraversion', answer_value: 4 },
      { selected_trait: 'openMindedness', answer_value: 2 },
      { selected_trait: 'agreeableness', answer_value: 3 },
      { selected_trait: 'conscientiousness', answer_value: 2 },
      { selected_trait: 'negativeEmotionality', answer_value: 2 }
    ]
  },
  {
    name: "High Agreeableness User",
    description: "Compassionate, cooperative, trusting",
    answers: [
      { selected_trait: 'agreeableness', answer_value: 5 },
      { selected_trait: 'agreeableness', answer_value: 5 },
      { selected_trait: 'agreeableness', answer_value: 4 },
      { selected_trait: 'extraversion', answer_value: 3 },
      { selected_trait: 'openMindedness', answer_value: 2 },
      { selected_trait: 'conscientiousness', answer_value: 3 },
      { selected_trait: 'negativeEmotionality', answer_value: 2 }
    ]
  },
  {
    name: "High Conscientiousness User",
    description: "Organized, disciplined, goal-oriented",
    answers: [
      { selected_trait: 'conscientiousness', answer_value: 5 },
      { selected_trait: 'conscientiousness', answer_value: 5 },
      { selected_trait: 'conscientiousness', answer_value: 4 },
      { selected_trait: 'extraversion', answer_value: 2 },
      { selected_trait: 'agreeableness', answer_value: 3 },
      { selected_trait: 'openMindedness', answer_value: 2 },
      { selected_trait: 'negativeEmotionality', answer_value: 2 }
    ]
  }
];

/**
 * Run all personality test cases
 */
export function runPersonalityTests(): void {
  console.log('🧪 RUNNING PERSONALITY CALCULATION TESTS');
  console.log('=====================================');

  PERSONALITY_TEST_CASES.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    const result = calculatePersonalityFromAnswers(testCase.answers);
    
    console.log('   📊 Trait Averages:');
    Object.entries(result.traitAverages).forEach(([trait, average]) => {
      console.log(`      ${trait}: ${average.toFixed(2)}`);
    });
    
    console.log('   🎯 Results:');
    console.log(`      Dominant Trait: ${result.dominantTrait}`);
    console.log(`      Personality Key: ${result.personalityKey}`);
    console.log(`      Expected: ${testCase.name.toLowerCase().includes('openness') ? 'openness' : 
                                  testCase.name.toLowerCase().includes('neuroticism') ? 'neuroticism' :
                                  testCase.name.toLowerCase().includes('extraversion') ? 'extraversion' :
                                  testCase.name.toLowerCase().includes('agreeableness') ? 'agreeableness' :
                                  testCase.name.toLowerCase().includes('conscientiousness') ? 'conscientiousness' : 'unknown'}`);
  });

  console.log('\n🧪 PERSONALITY TESTS COMPLETE');
  console.log('=====================================');
}
