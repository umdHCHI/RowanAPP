import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SurveyQuestion } from '../../data/surveyQuestions';

interface QuestionCardProps {
  question: SurveyQuestion;
  onOptionSelect: (optionIdx: number) => void;
  isOptionSelected: (optionIdx: number) => boolean;
  isSubmitting: boolean;
  styles: any;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onOptionSelect, 
  isOptionSelected, 
  isSubmitting, 
  styles 
}) => {
  return (
    <View style={[styles.card, { maxWidth: 400, width: '100%' }]}>
      <Text style={styles.subtitle}>{question.question}</Text>
      {question.options.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.button,
            { 
              alignItems: 'flex-start', 
              backgroundColor: isOptionSelected(idx) ? styles.primary : styles.card, 
              borderColor: styles.border, 
              borderWidth: 1, 
              marginVertical: 4,
              opacity: isSubmitting ? 0.5 : 1
            },
          ]}
          onPress={() => onOptionSelect(idx)}
          disabled={isSubmitting}
        >
          <Text style={[
            styles.text, 
            { color: isOptionSelected(idx) ? '#fff' : styles.tabBarInactive }
          ]}>
            {option.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
