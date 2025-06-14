import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { apiBaseUrl } from '../services/apiConfig';

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  strengths: string[];
  growthAreas: string[];
}

const PERSONALITY_TRAITS: Record<string, PersonalityTrait> = {
  Openness: {
    name: 'Openness',
    score: 0,
    description: 'Your tendency to be open to new experiences and ideas',
    strengths: ['Creative thinking', 'Appreciation for art and beauty', 'Curiosity about the world'],
    growthAreas: ['Exploring new perspectives', 'Trying new activities', 'Embracing change']
  },
  Conscientiousness: {
    name: 'Conscientiousness',
    score: 0,
    description: 'Your tendency to be organized, responsible, and goal-oriented',
    strengths: ['Reliability', 'Organization', 'Self-discipline'],
    growthAreas: ['Balancing structure and flexibility', 'Managing time effectively', 'Setting achievable goals']
  },
  Extraversion: {
    name: 'Extraversion',
    score: 0,
    description: 'Your tendency to seek stimulation from the outside world',
    strengths: ['Social confidence', 'Energy in groups', 'Positive outlook'],
    growthAreas: ['Building meaningful connections', 'Finding balance in social energy', 'Developing communication skills']
  },
  Agreeableness: {
    name: 'Agreeableness',
    score: 0,
    description: 'Your tendency to be compassionate and cooperative',
    strengths: ['Empathy', 'Cooperation', 'Trust in others'],
    growthAreas: ['Setting healthy boundaries', 'Balancing others\' needs with your own', 'Developing assertiveness']
  },
  Neuroticism: {
    name: 'Neuroticism',
    score: 0,
    description: 'Your tendency to experience negative emotions',
    strengths: ['Emotional awareness', 'Attention to detail', 'Empathy for others\' struggles'],
    growthAreas: ['Emotional regulation', 'Stress management', 'Building resilience']
  }
};

export default function PersonalityHomeScreen() {
  const { styles, theme } = useTheme();
  const { onboardingState } = useOnboarding();
  const { authToken } = useAuth();
  const [traits, setTraits] = useState<Record<string, PersonalityTrait>>(PERSONALITY_TRAITS);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalityProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to get the personality profile
        const response = await axios.get(`${apiBaseUrl}users/me/`, {
          headers: { Authorization: `Token ${authToken}` }
        });

        const personalityProfile = response.data.personality_profile;
        
        if (personalityProfile) {
          setTraits(prevTraits => {
            const updated = { ...prevTraits };
            updated.Openness.score = personalityProfile.openness;
            updated.Conscientiousness.score = personalityProfile.conscientiousness;
            updated.Extraversion.score = personalityProfile.extraversion;
            updated.Agreeableness.score = personalityProfile.agreeableness;
            updated.Neuroticism.score = personalityProfile.neuroticism;
            return updated;
          });
        } else {
          // If no personality profile exists, try to get survey results
          const surveyResponse = await axios.get(`${apiBaseUrl}surveys/my_survey/`, {
            headers: { Authorization: `Token ${authToken}` }
          });

          const survey = surveyResponse.data;
          if (survey && survey.big_five_scores) {
            setTraits(prevTraits => {
              const updated = { ...prevTraits };
              updated.Openness.score = survey.big_five_scores.openness / 10; // Convert from 0-100 to 0-10
              updated.Conscientiousness.score = survey.big_five_scores.conscientiousness / 10;
              updated.Extraversion.score = survey.big_five_scores.extraversion / 10;
              updated.Agreeableness.score = survey.big_five_scores.agreeableness / 10;
              updated.Neuroticism.score = survey.big_five_scores.neuroticism / 10;
              return updated;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching personality data:', err);
        setError('Failed to load personality data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchPersonalityProfile();
    }
  }, [authToken]);

  const getTraitColor = (score: number) => {
    const hue = (score / 10) * 120; // 0-10 maps to 0-120 (red to green)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const renderTraitCard = (traitName: string) => {
    const trait = traits[traitName];
    const isSelected = selectedTrait === traitName;

    return (
      <TouchableOpacity
        key={traitName}
        style={[
          styles.card,
          {
            borderColor: getTraitColor(trait.score),
            borderWidth: 2,
            backgroundColor: isSelected ? theme.background : theme.card,
            marginBottom: 12
          }
        ]}
        onPress={() => setSelectedTrait(isSelected ? null : traitName)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.subtitle}>{trait.name}</Text>
          <Text style={[styles.text, { color: getTraitColor(trait.score) }]}>
            Score: {trait.score.toFixed(1)}/10
          </Text>
        </View>
        
        {isSelected && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.text}>{trait.description}</Text>
            
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.subtitle, { fontSize: 16 }]}>Your Strengths</Text>
              {trait.strengths.map((strength, idx) => (
                <Text key={idx} style={[styles.text, { marginLeft: 8 }]}>• {strength}</Text>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.subtitle, { fontSize: 16 }]}>Growth Areas</Text>
              {trait.growthAreas.map((area, idx) => (
                <Text key={idx} style={[styles.text, { marginLeft: 8 }]}>• {area}</Text>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.text, { marginTop: 16 }]}>Loading your personality profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.text, { color: theme.notification }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.title}>Your Personality Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.subtitle}>Welcome to Your Journey</Text>
        <Text style={styles.text}>
          Based on your personality assessment, we've created a personalized experience to help you understand yourself better and grow in meaningful ways.
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={[styles.subtitle, { marginBottom: 12 }]}>Your Traits</Text>
        {Object.keys(traits).map(renderTraitCard)}
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.subtitle}>Daily Recommendations</Text>
        <Text style={styles.text}>
          Based on your personality profile, we'll suggest activities and content that align with your unique traits and help you grow in areas you're interested in.
        </Text>
      </View>

      <View style={[styles.card, { marginTop: 12, marginBottom: 24 }]}>
        <Text style={styles.subtitle}>Growth Journey</Text>
        <Text style={styles.text}>
          Track your personal development and explore new aspects of your personality through interactive stories and reflections.
        </Text>
      </View>
    </ScrollView>
  );
} 