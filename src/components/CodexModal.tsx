import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DrawingCanvas from './DrawingCanvas';

const { width, height } = Dimensions.get('window');

type Prompt = {
  id: string;
  text: string;
  category: 'journal' | 'draw' | 'voice';
  skillCategory: 'Self-Compassion' | 'Social Connection' | 'Stress Management' | 'Emotional Awareness' | 'Personal Growth';
  mapArea: string; // ID of the map area this prompt is associated with
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

const samplePrompts: Prompt[] = [
  // Entrance Area Prompts (Always Available)
  {
    id: 'entrance-1',
    text: 'Write about a time when you felt overwhelmed and how you handled it.',
    category: 'journal',
    skillCategory: 'Emotional Awareness',
    mapArea: 'entrance',
    difficulty: 'Beginner',
  },
  {
    id: 'entrance-2',
    text: 'Draw a symbol that represents your current emotional state.',
    category: 'draw',
    skillCategory: 'Emotional Awareness',
    mapArea: 'entrance',
    difficulty: 'Beginner',
  },
  {
    id: 'entrance-3',
    text: 'Record a voice memo about what brings you comfort during difficult times.',
    category: 'voice',
    skillCategory: 'Stress Management',
    mapArea: 'entrance',
    difficulty: 'Beginner',
  },

  // Garden Area Prompts
  {
    id: 'garden-1',
    text: 'Write about a coping strategy that has helped you manage stress.',
    category: 'journal',
    skillCategory: 'Stress Management',
    mapArea: 'garden',
    difficulty: 'Beginner',
  },
  {
    id: 'garden-2',
    text: 'Draw your "safe space" - a place where you feel calm and protected.',
    category: 'draw',
    skillCategory: 'Emotional Awareness',
    mapArea: 'garden',
    difficulty: 'Beginner',
  },
  {
    id: 'garden-3',
    text: 'Record a voice memo about a time when you successfully managed a difficult emotion.',
    category: 'voice',
    skillCategory: 'Stress Management',
    mapArea: 'garden',
    difficulty: 'Beginner',
  },

  // Library Area Prompts
  {
    id: 'library-1',
    text: 'Write about a meaningful connection you have with someone in your life.',
    category: 'journal',
    skillCategory: 'Social Connection',
    mapArea: 'library',
    difficulty: 'Beginner',
  },
  {
    id: 'library-2',
    text: 'Draw a memory that brings you joy and connection.',
    category: 'draw',
    skillCategory: 'Personal Growth',
    mapArea: 'library',
    difficulty: 'Beginner',
  },
  {
    id: 'library-3',
    text: 'Record a voice memo about a lesson you learned from a challenging experience.',
    category: 'voice',
    skillCategory: 'Personal Growth',
    mapArea: 'library',
    difficulty: 'Intermediate',
  },

  // Sanctuary Area Prompts
  {
    id: 'sanctuary-1',
    text: 'Write a letter of compassion to yourself about a recent challenge.',
    category: 'journal',
    skillCategory: 'Self-Compassion',
    mapArea: 'sanctuary',
    difficulty: 'Intermediate',
  },
  {
    id: 'sanctuary-2',
    text: 'Draw a representation of your inner strength and resilience.',
    category: 'draw',
    skillCategory: 'Stress Management',
    mapArea: 'sanctuary',
    difficulty: 'Intermediate',
  },
  {
    id: 'sanctuary-3',
    text: 'Record a voice memo about a moment when you showed kindness to yourself.',
    category: 'voice',
    skillCategory: 'Self-Compassion',
    mapArea: 'sanctuary',
    difficulty: 'Intermediate',
  },

  // Archive Area Prompts
  {
    id: 'archive-1',
    text: 'Write about how you have grown from a past challenge.',
    category: 'journal',
    skillCategory: 'Personal Growth',
    mapArea: 'archive',
    difficulty: 'Intermediate',
  },
  {
    id: 'archive-2',
    text: 'Draw a symbol that represents your journey of personal growth.',
    category: 'draw',
    skillCategory: 'Emotional Awareness',
    mapArea: 'archive',
    difficulty: 'Intermediate',
  },
  {
    id: 'archive-3',
    text: 'Record a voice memo about a relationship that has helped you grow.',
    category: 'voice',
    skillCategory: 'Social Connection',
    mapArea: 'archive',
    difficulty: 'Intermediate',
  },

  // Summit Area Prompts
  {
    id: 'summit-1',
    text: 'Write about how you have integrated different coping strategies into your life.',
    category: 'journal',
    skillCategory: 'Personal Growth',
    mapArea: 'summit',
    difficulty: 'Advanced',
  },
  {
    id: 'summit-2',
    text: 'Draw a representation of your highest self - who you aspire to be.',
    category: 'draw',
    skillCategory: 'Self-Compassion',
    mapArea: 'summit',
    difficulty: 'Advanced',
  },
  {
    id: 'summit-3',
    text: 'Record a voice memo about your journey of self-discovery and growth.',
    category: 'voice',
    skillCategory: 'Social Connection',
    mapArea: 'summit',
    difficulty: 'Advanced',
  },
];

type CodexModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: {
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => void;
  unlockedAreas: string[]; // IDs of unlocked map areas
};

const CodexModal = ({ visible, onClose, onSave, unlockedAreas }: CodexModalProps) => {
  const [selectedType, setSelectedType] = useState<'journal' | 'draw' | 'voice'>('journal');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);

  const handleSave = () => {
    if (selectedPrompt && content) {
      onSave({
        type: selectedType,
        content,
        prompt: selectedPrompt.text,
        skillCategory: selectedPrompt.skillCategory,
        mapArea: selectedPrompt.mapArea,
        difficulty: selectedPrompt.difficulty,
      });
      setContent('');
      setSelectedPrompt(null);
      onClose();
    }
  };

  const renderPromptList = () => {
    // Filter prompts based on selected type and unlocked areas
    const filteredPrompts = samplePrompts.filter(p => 
      p.category === selectedType && 
      (unlockedAreas.includes(p.mapArea) || p.mapArea === 'entrance')
    );
    
    return (
      <ScrollView style={styles.promptList}>
        {filteredPrompts.map(prompt => (
          <TouchableOpacity
            key={prompt.id}
            style={[
              styles.promptItem,
              selectedPrompt?.id === prompt.id && styles.selectedPrompt,
            ]}
            onPress={() => setSelectedPrompt(prompt)}
          >
            <Text style={styles.promptText}>{prompt.text}</Text>
            <View style={styles.promptMeta}>
              <Text style={styles.skillCategory}>{prompt.skillCategory}</Text>
              <Text style={styles.difficulty}>{prompt.difficulty}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderContentInput = () => {
    if (!selectedPrompt) return null;

    switch (selectedType) {
      case 'journal':
        return (
          <TextInput
            style={styles.journalInput}
            multiline
            placeholder="Write your thoughts here..."
            placeholderTextColor="#666"
            value={content}
            onChangeText={setContent}
          />
        );
      case 'draw':
        return (
          <DrawingCanvas
            onSave={(paths) => {
              setDrawingPaths(paths);
              setContent(JSON.stringify(paths)); // Store paths as string for now
            }}
            onCancel={() => {
              setDrawingPaths([]);
              setContent('');
            }}
          />
        );
      case 'voice':
        return (
          <View style={styles.voicePlaceholder}>
            <Ionicons name="mic" size={48} color="#4ee6e6" />
            <Text style={styles.voiceText}>Voice recording coming soon...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>The Codex</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, selectedType === 'journal' && styles.selectedType]}
              onPress={() => setSelectedType('journal')}
            >
              <Ionicons name="book" size={24} color="#fff" />
              <Text style={styles.typeText}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, selectedType === 'draw' && styles.selectedType]}
              onPress={() => setSelectedType('draw')}
            >
              <Ionicons name="brush" size={24} color="#fff" />
              <Text style={styles.typeText}>Draw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, selectedType === 'voice' && styles.selectedType]}
              onPress={() => setSelectedType('voice')}
            >
              <Ionicons name="mic" size={24} color="#fff" />
              <Text style={styles.typeText}>Voice</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.promptSection}>
              <Text style={styles.sectionTitle}>Choose a Prompt</Text>
              {renderPromptList()}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Your Response</Text>
              {renderContentInput()}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!selectedPrompt || !content) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!selectedPrompt || !content}
          >
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: '#181A20',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#ffe066',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#23242b',
    width: '30%',
  },
  selectedType: {
    backgroundColor: '#4ee6e6',
  },
  typeText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  promptSection: {
    flex: 1,
    marginRight: 10,
  },
  inputSection: {
    flex: 1,
    marginLeft: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  promptList: {
    flex: 1,
  },
  promptItem: {
    backgroundColor: '#23242b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPrompt: {
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  promptText: {
    color: '#fff',
    fontSize: 14,
  },
  journalInput: {
    flex: 1,
    backgroundColor: '#23242b',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    textAlignVertical: 'top',
  },
  drawContainer: {
    flex: 1,
    backgroundColor: '#23242b',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    flex: 1,
    backgroundColor: '#23242b',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    color: '#666',
    fontSize: 16,
  },
  recordButton: {
    alignItems: 'center',
  },
  recordText: {
    color: '#4ee6e6',
    marginTop: 8,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4ee6e6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voicePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  promptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skillCategory: {
    color: '#4ee6e6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficulty: {
    color: '#ffe066',
    fontSize: 12,
  },
});

export default CodexModal; 