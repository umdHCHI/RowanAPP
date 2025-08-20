import React from 'react';
import { Text, View } from 'react-native';

interface SurveyProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  styles: any;
}

export const SurveyProgress: React.FC<SurveyProgressProps> = ({ 
  currentQuestion, 
  totalQuestions, 
  styles 
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <>
      <Text style={[styles.text, { marginBottom: 8 }]}>
        Question {currentQuestion + 1} of {totalQuestions}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </>
  );
};
