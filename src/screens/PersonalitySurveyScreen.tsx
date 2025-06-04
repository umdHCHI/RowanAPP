import * as React from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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

export default function PersonalitySurveyScreen() {
  const { styles: globalStyles, theme } = useTheme();
  const [modalVisible, setModalVisible] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<(string | null)[]>(Array(QUESTIONS.length).fill(null));

  const handleOptionSelect = (optionIdx: number) => {
    const updated = [...answers];
    updated[currentQuestion] = QUESTIONS[currentQuestion].options[optionIdx].trait;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setModalVisible(true);
    }
  };

  const handleSkip = () => {
    setModalVisible(false);
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
      <View style={[globalStyles.screenContainer, { alignItems: 'center', justifyContent: 'center' }] }>
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
                { alignItems: 'flex-start', backgroundColor: answers[currentQuestion] === option.trait ? theme.primary : theme.card, borderColor: theme.border, borderWidth: 1, marginVertical: 4 },
              ]}
              onPress={() => handleOptionSelect(idx)}
            >
              <Text style={[globalStyles.text, { color: answers[currentQuestion] === option.trait ? '#fff' : theme.text }]}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 400, marginTop: 16 }}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[globalStyles.text, { color: theme.tabBarInactive, textDecorationLine: 'underline' }]}>Skip for now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, { opacity: !answers[currentQuestion] ? 0.5 : 1, marginLeft: 16, backgroundColor: theme.primary }]}
            onPress={handleNext}
            disabled={!answers[currentQuestion]}
          >
            <Text style={globalStyles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

  
