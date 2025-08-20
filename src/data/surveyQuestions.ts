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

export interface SurveyOption {
  text: string;
  value: number;
}

export interface SurveyQuestion {
  question: string;
  trait: string;
  options: SurveyOption[];
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
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
    // Agreeableness - Q12: "Can be cold and aloof"
    question: 'I am someone who can be cold and aloof',
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
    // Open-Mindedness - Q15: "Is sophisticated in art, music, or literature"
    question: 'I am someone who is sophisticated in art, music, or literature',
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

export const TRAIT_DESCRIPTIONS = {
  extraversion: 'Your social energy and assertiveness',
  agreeableness: 'Your compassion and cooperation with others',
  conscientiousness: 'Your organization and self-discipline',
  negativeEmotionality: 'Your emotional sensitivity and stress response',
  openMindedness: 'Your creativity and openness to new experiences'
};
