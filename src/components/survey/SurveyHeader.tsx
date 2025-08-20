import React from 'react';
import { Text, View } from 'react-native';

interface SurveyHeaderProps {
  styles: any;
}

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({ styles }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Personality Survey</Text>
      <Text style={styles.headerSubtitle}>Discovering Your Path</Text>
    </View>
  );
};
