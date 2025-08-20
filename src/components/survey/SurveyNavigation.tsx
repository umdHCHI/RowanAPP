import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SurveyNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  hasAnswer: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onSkip: () => void;
  styles: any;
}

export const SurveyNavigation: React.FC<SurveyNavigationProps> = ({ 
  currentQuestion,
  totalQuestions,
  hasAnswer,
  isSubmitting,
  onNext,
  onSkip,
  styles 
}) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      width: '100%', 
      maxWidth: 400, 
      marginTop: 16 
    }}>
      <TouchableOpacity onPress={onSkip} disabled={isSubmitting}>
        <Text style={[
          styles.text, 
          { 
            color: styles.tabBarInactive, 
            textDecorationLine: 'underline' 
          }
        ]}>
          Skip for now
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button, 
          { 
            opacity: (!hasAnswer || isSubmitting) ? 0.5 : 1, 
            marginLeft: 16, 
            backgroundColor: styles.primary 
          }
        ]}
        onPress={onNext}
        disabled={!hasAnswer || isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isLastQuestion ? 'Submit' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
