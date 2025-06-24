import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';
import { createGlobalStyles } from '../styles/globalStyles';
import { CodexModalProps, Prompt } from '../types/journal';
import DrawingCanvas from './DrawingCanvas';

const { width, height } = Dimensions.get('window');

const CodexModal = ({ visible, onClose, onSave, unlockedAreas }: CodexModalProps) => {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  
  const parchmentSource =
    theme.archiveMode === 'dark'
      ? require('../../assets/textures/journal_page-dark.png')
      : require('../../assets/textures/journal_page-light.png');

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
      <View style={globalStyles.codexModalOverlay}>
        <View style={globalStyles.codexModalContent}>
          <ImageBackground
            source={parchmentSource}
            style={globalStyles.codexPixelBorder}
            imageStyle={globalStyles.codexTextureOverlay}
          >
            <View style={globalStyles.codexInnerContent}>
              <View style={[globalStyles.codexHeader, { borderBottomColor: theme.archiveBorder }]}>
                <Text style={[globalStyles.codexTitle, { color: theme.archiveText }]}>📖 The Codex</Text>
                <TouchableOpacity onPress={onClose} style={globalStyles.codexCloseButton}>
                  <Ionicons name="close" size={24} color={theme.archiveText} />
                </TouchableOpacity>
              </View>

              <View style={globalStyles.codexTypeSelector}>
                <TouchableOpacity
                  style={[globalStyles.codexTypeButton, selectedType === 'journal' && globalStyles.codexSelectedType]}
                  onPress={() => setSelectedType('journal')}
                >
                  <Text style={[globalStyles.codexTypeText, { color: theme.archiveText }]}>📝 Journal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.codexTypeButton, selectedType === 'draw' && globalStyles.codexSelectedType]}
                  onPress={() => setSelectedType('draw')}
                >
                  <Text style={[globalStyles.codexTypeText, { color: theme.archiveText }]}>🎨 Draw</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.codexTypeButton, selectedType === 'voice' && globalStyles.codexSelectedType]}
                  onPress={() => setSelectedType('voice')}
                >
                  <Text style={[globalStyles.codexTypeText, { color: theme.archiveText }]}>🎤 Voice</Text>
                </TouchableOpacity>
              </View>

              <View style={globalStyles.codexContentContainer}>
                <View style={globalStyles.codexPromptSection}>
                  <Text style={[globalStyles.codexSectionTitle, { color: theme.archiveText }]}>Choose Your Quest</Text>
                  <ScrollView style={globalStyles.codexPromptList}>
                    {filteredPrompts.map(prompt => (
                      <TouchableOpacity
                        key={prompt.prompt_id}
                        style={[
                          globalStyles.codexPromptItem,
                          selectedPrompt?.prompt_id === prompt.prompt_id && globalStyles.codexSelectedPrompt,
                          completedPrompts.includes(prompt.prompt_id) && globalStyles.codexCompletedPrompt
                        ]}
                        onPress={() => setSelectedPrompt(prompt)}
                      >
                        <Text style={[globalStyles.codexPromptText, { color: theme.archiveText }]}>{prompt.text}</Text>
                        <View style={globalStyles.codexPromptMeta}>
                          <Text style={[globalStyles.codexSkillCategory, { color: theme.archiveAccent }]}>{prompt.skill_category}</Text>
                          <Text style={[globalStyles.codexDifficulty, { color: theme.archiveSubtext }]}>{prompt.difficulty}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={globalStyles.codexInputSection}>
                  <Text style={[globalStyles.codexSectionTitle, { color: theme.archiveText }]}>Your Chronicle</Text>
                  {selectedPrompt && selectedType === 'journal' && (
                    <TextInput
                      style={[globalStyles.codexJournalInput, { color: theme.archiveText }]}
                      multiline
                      placeholder="Write your thoughts here..."
                      placeholderTextColor={theme.archiveMode === 'dark' ? '#e0d6c3' : '#7a5c2e'}
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
                    <View style={globalStyles.codexVoicePlaceholder}>
                      <Ionicons name="mic" size={48} color={theme.archiveText} />
                      <Text style={[globalStyles.codexVoiceText, { color: theme.archiveText }]}>Voice recording coming soon...</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  globalStyles.codexSaveButton, 
                  (!selectedPrompt || !content) && globalStyles.codexDisabledButton, 
                  { borderColor: theme.archiveBorder, backgroundColor: theme.archiveMode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }
                ]}
                onPress={handleSave}
                disabled={!selectedPrompt || !content}
              >
                <Text style={[globalStyles.codexSaveButtonText, { color: theme.archiveText }]}>Save to Codex</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

export default CodexModal; 