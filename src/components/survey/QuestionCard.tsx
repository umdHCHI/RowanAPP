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
      {question.options.map((option, idx) => {
        const selected = isOptionSelected(idx);
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.button,
              { 
                alignItems: 'flex-start', 
                backgroundColor: selected ? 'rgba(56, 139, 211, 0.38)' : 'rgba(30, 41, 59, 0.5)', 
                borderColor: selected ? '#4ee6e6' : 'rgba(255, 255, 255, 0.2)', 
                borderWidth: 2, 
                marginVertical: 4,
                opacity: isSubmitting ? 0.5 : 1,
                shadowColor: selected ? '#4ee6e6' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selected ? 0.3 : 0,
                shadowRadius: 4,
                elevation: selected ? 4 : 0,
              },
            ]}
            onPress={() => onOptionSelect(idx)}
            disabled={isSubmitting}
          >
            <Text style={[
              styles.text, 
              { 
                color: selected ? '#ffffff' : '#9CA3AF',
                fontWeight: selected ? 'bold' : 'normal'
              }
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
