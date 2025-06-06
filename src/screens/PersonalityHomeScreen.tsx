import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PersonalityHomeScreen() {
  const { styles, theme } = useTheme();

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.title}>Your Personality Journey</Text>
      
      <View style={styles.card}>
        <Text style={styles.subtitle}>Your Insights</Text>
        <Text style={styles.text}>
          Based on your personality survey, we've curated a personalized experience just for you.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Daily Recommendations</Text>
        <Text style={styles.text}>
          Discover content and activities that align with your personality traits.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Personality Growth</Text>
        <Text style={styles.text}>
          Track your personal development and explore new aspects of your personality.
        </Text>
      </View>
    </ScrollView>
  );
} 