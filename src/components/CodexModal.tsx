import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { apiService } from '../services/apiService';
import { CodexModalProps, Prompt } from '../types/journal';
import DrawingCanvas from './DrawingCanvas';

const { width, height } = Dimensions.get('window');

const CodexModal = ({ visible, onClose, onSave, unlockedAreas }: CodexModalProps) => {
  const colorScheme = useColorScheme();
  const parchmentSource =
    colorScheme === 'dark'
      ? require('../../assets/textures/journal_page-dark.png')
      : require('../../assets/textures/journal_page-light.png');

  // Dynamic text color for contrast
  const textColor = colorScheme === 'dark' ? '#F5E6D3' : '#5C4033';
  const borderColor = colorScheme === 'dark' ? '#F5E6D3' : '#8B4513';

  const [selectedType, setSelectedType] = useState<'journal' | 'draw' | 'voice'>('journal');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    
    // Load prompts
    apiService.getJournalPrompts()
      .then(promptsData => {
        setPrompts(promptsData.filter(p => p.is_active));
      })
      .catch(() => {
        setPrompts([]);
      })
      .finally(() => setLoading(false));
  }, [visible]);

  const handleSave = async () => {
    if (selectedPrompt && content) {
      try {
        // Show success alert
        Alert.alert(
          "Entry Saved",
          "Your journal entry has been saved to your Codex.",
          [{ text: "OK" }]
        );

        // Call the original onSave
        onSave({
          type: selectedType,
          content,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        // Clear the form
        setContent('');
        setSelectedPrompt(null);
        setCompletedPrompts(prev => [...prev, selectedPrompt.prompt_id]);
        onClose();
      } catch (error) {
        console.error('Error saving journal entry:', error);
        Alert.alert(
          "Error",
          "There was an error saving your entry. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  // Filter prompts based on completion status
  const filteredPrompts = prompts.filter(p => 
    p.category === selectedType && 
    (unlockedAreas.includes(p.map_area) || p.map_area === 'entrance') &&
    (!completedPrompts.includes(p.prompt_id))
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ImageBackground
            source={parchmentSource}
            style={styles.pixelBorder}
            imageStyle={styles.textureOverlay}
          >
            <View style={styles.innerContent}>
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <Text style={[styles.title, { color: textColor }]}>📖 The Codex</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'journal' && styles.selectedType]}
                  onPress={() => setSelectedType('journal')}
                >
                  <Text style={[styles.typeText, { color: textColor }]}>📝 Journal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'draw' && styles.selectedType]}
                  onPress={() => setSelectedType('draw')}
                >
                  <Text style={[styles.typeText, { color: textColor }]}>🎨 Draw</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'voice' && styles.selectedType]}
                  onPress={() => setSelectedType('voice')}
                >
                  <Text style={[styles.typeText, { color: textColor }]}>🎤 Voice</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.promptSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Choose Your Quest</Text>
                  <ScrollView style={styles.promptList}>
                    {filteredPrompts.map(prompt => (
                      <TouchableOpacity
                        key={prompt.prompt_id}
                        style={[
                          styles.promptItem,
                          selectedPrompt?.prompt_id === prompt.prompt_id && styles.selectedPrompt,
                          completedPrompts.includes(prompt.prompt_id) && styles.completedPrompt
                        ]}
                        onPress={() => setSelectedPrompt(prompt)}
                      >
                        <Text style={[styles.promptText, { color: textColor }]}>{prompt.text}</Text>
                        <View style={styles.promptMeta}>
                          <Text style={[styles.skillCategory, { color: textColor }]}>{prompt.skill_category}</Text>
                          <Text style={[styles.difficulty, { color: textColor }]}>{prompt.difficulty}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Your Chronicle</Text>
                  {selectedPrompt && selectedType === 'journal' && (
                    <TextInput
                      style={[styles.journalInput, { color: textColor }]}
                      multiline
                      placeholder="Write your thoughts here..."
                      placeholderTextColor={colorScheme === 'dark' ? '#e0d6c3' : '#7a5c2e'}
                      value={content}
                      onChangeText={setContent}
                    />
                  )}
                  {selectedPrompt && selectedType === 'draw' && (
                    <DrawingCanvas
                      onSave={(paths) => {
                        setDrawingPaths(paths);
                        setContent(JSON.stringify(paths));
                      }}
                      onCancel={() => {
                        setDrawingPaths([]);
                        setContent('');
                      }}
                    />
                  )}
                  {selectedPrompt && selectedType === 'voice' && (
                    <View style={styles.voicePlaceholder}>
                      <Ionicons name="mic" size={48} color={textColor} />
                      <Text style={[styles.voiceText, { color: textColor }]}>Voice recording coming soon...</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, (!selectedPrompt || !content) && styles.disabledButton, { borderColor, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                onPress={handleSave}
                disabled={!selectedPrompt || !content}
              >
                <Text style={[styles.saveButtonText, { color: textColor }]}>Save to Codex</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  pixelBorder: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#D2B48C',
    backgroundColor: '#F5E6D3',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textureOverlay: {
    opacity: 1,
    resizeMode: 'cover',
    alignSelf: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  innerContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 32,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
    paddingBottom: 10,
  },
  title: {
    color: '#5C4033',
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    textShadowColor: '#D2B48C',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1,
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
    borderWidth: 0,
    backgroundColor: 'transparent',
    width: '30%',
  },
  selectedType: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  typeText: {
    color: '#5C4033',
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  promptSection: {
    flex: 1,
    marginRight: 10,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 10,
  },
  inputSection: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 10,
  },
  sectionTitle: {
    color: '#5C4033',
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#D2B48C',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 0.5,
  },
  promptList: {
    flex: 1,
  },
  promptItem: {
    backgroundColor: 'transparent',
    padding: 15,
    borderWidth: 0,
    marginBottom: 10,
  },
  selectedPrompt: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  promptText: {
    color: '#5C4033',
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  journalInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 15,
    textAlignVertical: 'top',
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
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
    backgroundColor: '#8B4513',
    padding: 15,
    borderWidth: 2,
    borderColor: '#5C4033',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#F5E6D3',
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  voicePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  voiceText: {
    color: '#5C4033',
    fontSize: 18,
    fontFamily: 'serif',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  promptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skillCategory: {
    color: '#8B4513',
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  difficulty: {
    color: '#5C4033',
    fontSize: 14,
    fontFamily: 'serif',
    letterSpacing: 0.3,
  },
  completedPrompt: {
    opacity: 0.5,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default CodexModal; 