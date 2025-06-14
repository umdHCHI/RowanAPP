import axios from 'axios';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { apiBaseUrl } from '../services/apiConfig';

const QUESTIONS = [
  {
    question: 'When you\'re lost in a forest, what do you do first?',
    options: [
      { text: 'Climb a tree to get a better view', trait: 'Openness' },
      { text: 'Follow a well-trodden path', trait: 'Conscientiousness' },
      { text: 'Call out for help', trait: 'Extraversion' },
      { text: 'Wait patiently for rescue', trait: 'Agreeableness' },
    ],
  },
  {
    question: 'If your life was a river, how would you navigate it?',
    options: [
      { text: 'Build a sturdy boat and plan your route', trait: 'Conscientiousness' },
      { text: 'Let the current take you', trait: 'Openness' },
      { text: 'Invite friends to join the journey', trait: 'Extraversion' },
      { text: 'Check the water for danger before moving', trait: 'Neuroticism' },
    ],
  }
];

interface SurveyAnswer {
  question_id: number;
  selected_trait: string;
}

export default function PersonalitySurveyScreen() {
  const { styles: globalStyles, theme } = useTheme();
  const { completeSurvey } = useOnboarding();
  const { authToken } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<SurveyAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleOptionSelect = (optionIdx: number) => {
    const updated = [...answers];
    updated[currentQuestion] = {
      question_id: currentQuestion + 1,
      selected_trait: QUESTIONS[currentQuestion].options[optionIdx].trait
    };
    setAnswers(updated);
  };

  const submitSurvey = async () => {
    try {
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      setIsSubmitting(true);
      setError(null);

      // Format answers as a dictionary with question_id as key and selected_trait as value
      const formattedAnswers = answers.reduce((acc, answer) => {
        acc[answer.question_id] = answer.selected_trait;
        return acc;
      }, {} as Record<number, string>);

      console.log('Submitting survey with data:', {
        survey_type: 'big_five',
        answers: formattedAnswers
      });

      // First check if user is in the correct research group
      const profileResponse = await axios.get(`${apiBaseUrl}users/me/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('User profile data:', profileResponse.data);
      const profile = profileResponse.data.profile;
      console.log('Research group:', profile.research_group);

      if (!profile.research_group) {
        throw new Error('No research group assigned');
      }

      if (profile.research_group.condition !== 'B') {
        throw new Error('You must be in the survey research group to submit the survey');
      }

      // Submit the survey
      const response = await axios.post(
        `${apiBaseUrl}surveys/submit/`,
        {
          survey_type: 'big_five',
          answers: formattedAnswers
        },
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Survey submission response:', response.data);

      // Update onboarding state
      await completeSurvey();
      
      // Navigate to personality home screen
      router.replace('/(personality)');
      
    } catch (error: any) {
      console.error('Failed to submit survey:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request headers:', error.config?.headers);
      console.error('Request data:', error.config?.data);
      setError(error.response?.data?.detail || 'Failed to submit survey. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
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
    return currentAnswer?.selected_trait === QUESTIONS[currentQuestion].options[optionIdx].trait;
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Modal Intro */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
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
                opacity: (!isOptionSelected(0) || isSubmitting) ? 0.5 : 1, 
                marginLeft: 16, 
                backgroundColor: theme.primary 
              }
            ]}
            onPress={handleNext}
            disabled={!isOptionSelected(0) || isSubmitting}
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
    </SafeAreaView>
  );
}

  
