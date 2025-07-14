import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../context/MasterStateContext";
import fileUploadService from '../services/fileUploadService';
import { createGlobalStyles } from "../styles/globalStyles";
import { CodexModalProps, JournalPrompt } from "../types";
import DrawingCanvas from "./DrawingCanvas";
import VoiceMemoRecorder from './VoiceMemoRecorder';
const { width, height } = Dimensions.get("window");
const isMobile = width < 600;
const CodexModal = ({
  visible,
  onClose,
  onSave,
  isFullScreen = false,
  selectedType = 'journal',
}: CodexModalProps & { isFullScreen?: boolean }) => {
  const { wellness, archive, theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const parchmentSource =
    theme.theme.archiveMode === "dark"
      ? require("../../assets/textures/journal_page-dark.png")
      : require("../../assets/textures/journal_page-light.png");

  const [selectedTypeState, setSelectedTypeState] = useState<
    "journal" | "draw" | "voice"
  >(selectedType);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [passages, setpassages] = useState("");
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);

  // Update selectedTypeState when selectedType prop changes
  useEffect(() => {
    setSelectedTypeState(selectedType);
  }, [selectedType]);

  // Load prompts only when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('🔄 CodexModal opened');
      console.log('🔄 Current wellness.categoryPrompts:', wellness.categoryPrompts);
      setLoading(true);
      
      const loadPrompts = async () => {
        try {
          // Always refresh prompts when modal opens to ensure we have the latest
          console.log('🔄 Refreshing prompts for modal...');
          const fallbackAreas = ['journal', 'draw', 'voice'];
          const completedStoriesArray = Array.from(archive.completedStories);
          console.log('🔄 Loading with areas:', fallbackAreas);
          console.log('🔄 Completed stories:', completedStoriesArray);
          await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
          console.log('✅ Prompts refreshed successfully');
          console.log('✅ Updated wellness.categoryPrompts:', wellness.categoryPrompts);
        } catch (error) {
          console.warn('Error loading prompts (continuing with empty prompts):', error);
          // Continue with empty prompts rather than failing completely
          // Set loading to false so the UI doesn't hang
        } finally {
          setLoading(false);
        }
      };
      
      loadPrompts();
    }
  }, [visible]); // Remove unlockedAreas dependency



  const handleSave = async () => {
    if (selectedPrompt && passages) {
      try {
        console.log('=== SAVING CODEX ENTRY ===');
        console.log('Selected prompt:', selectedPrompt);
        console.log('Content:', passages);
        console.log('Entry type:', selectedTypeState);

        let contentToSave = passages;
        let entryType = selectedTypeState;

        // Handle file uploads for mobile devices
        if (Platform.OS !== 'web') {
          if (selectedTypeState === 'voice' && passages.startsWith('file://')) {
            try {
              console.log('Uploading audio file to backend...');
              const uploadResult = await fileUploadService.uploadAudioFile(passages, {
                prompt: selectedPrompt.text,
                entry_type: selectedTypeState,
                skill_category: selectedPrompt.skill_category,
                map_area: selectedPrompt.map_area,
                difficulty: selectedPrompt.difficulty,
              });
              contentToSave = uploadResult.file_url;
              console.log('✅ Audio file uploaded successfully:', uploadResult);
            } catch (uploadError) {
              console.error('❌ Failed to upload audio file:', uploadError);
              // Fallback: save the local file path
              contentToSave = passages;
              Alert.alert(
                "Upload Error",
                "Failed to upload audio file to backend. The recording will be saved locally.",
                [{ text: "OK" }]
              );
            }
          } else if (selectedTypeState === 'draw' && drawingPaths.length > 0) {
            try {
              console.log('Uploading drawing data to backend...');
              const uploadResult = await fileUploadService.uploadDrawingData(drawingPaths, {
                prompt: selectedPrompt.text,
                entry_type: selectedTypeState,
                skill_category: selectedPrompt.skill_category,
                map_area: selectedPrompt.map_area,
                difficulty: selectedPrompt.difficulty,
              });
              contentToSave = uploadResult.file_url;
              console.log('✅ Drawing data uploaded successfully:', uploadResult);
            } catch (uploadError) {
              console.error('❌ Failed to upload drawing data:', uploadError);
              // Fallback: save the JSON data directly
              contentToSave = JSON.stringify(drawingPaths);
              Alert.alert(
                "Upload Error",
                "Failed to upload drawing data to backend. The drawing will be saved locally.",
                [{ text: "OK" }]
              );
            }
          }
        }

        // Save to backend first
        try {
          await wellness.createCodexEntry({
            prompt: selectedPrompt.text,
            entry_type: entryType,
            content: contentToSave,
          });
          console.log('✅ Codex entry saved to backend successfully');
        } catch (backendError) {
          console.error('❌ Failed to save to backend:', backendError);
          Alert.alert(
            "Backend Error",
            "Failed to save to backend, but entry will be saved locally.",
            [{ text: "OK" }]
          );
        }

        // Mark the prompt as inactive (completed)
        try {
          await wellness.markPromptInactive(selectedPrompt.prompt_id);
          console.log(`Marked prompt ${selectedPrompt.prompt_id} as inactive`);
        } catch (deactivateError) {
          console.error('Error marking prompt as inactive:', deactivateError);
          // Continue with save even if deactivation fails
        }

        // Show success alert
        Alert.alert(
          "Entry Saved",
          "Your journal entry has been saved to your Codex.",
          [{ text: "OK" }]
        );

        // Call the original onSave for local state updates
        onSave({
          type: selectedTypeState,
          passages,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        // Refresh prompts to get a new one (since the current one is now inactive)
        try {
          const completedStoriesArray = Array.from(archive.completedStories);
          const fallbackAreas = ['journal', 'draw', 'voice'];
          await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
        } catch (refreshError) {
          console.warn('Failed to refresh prompts after saving:', refreshError);
          // Continue even if refresh fails
        }

        // Clear the form
        setpassages("");
        setSelectedPrompt(null);
        setCompletedPrompts((prev) => [...prev, selectedPrompt.prompt_id]);
        onClose();
      } catch (error) {
        console.error("Error saving journal entry:", error);
        Alert.alert(
          "Error",
          "There was an error saving your entry. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };
  // Get the current prompt for the selected type from the category prompts
  const currentPrompt = wellness.categoryPrompts[selectedTypeState];
  const hasPromptForCategory = currentPrompt !== null;

  // Set the selected prompt when switching categories or when prompts are loaded
  useEffect(() => {
    if (hasPromptForCategory) {
      setSelectedPrompt(currentPrompt);
    } else {
      setSelectedPrompt(null);
    }
  }, [selectedTypeState, hasPromptForCategory, wellness.categoryPrompts]); // Add wellness.categoryPrompts dependency

  // Ensure selected prompt is set when modal opens and prompts are available
  useEffect(() => {
    if (visible && !selectedPrompt && hasPromptForCategory) {
      setSelectedPrompt(currentPrompt);
    }
  }, [visible, selectedPrompt, hasPromptForCategory, currentPrompt, selectedTypeState]);

  return (
    <Modal
      visible={visible}
      animationType={isFullScreen ? "none" : "slide"}
      transparent={!isMobile && !isFullScreen}
      onRequestClose={onClose}
    >
      <View style={isFullScreen ? { flex: 1, backgroundColor: '#0a0b0f' } : (isMobile ? { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' } : globalStyles.codexModalOverlay)}>
        <View style={isFullScreen ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : (isMobile ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : globalStyles.codexModalpassages)}>
          <ImageBackground
            source={parchmentSource}
            style={isMobile ? { flex: 1, padding: 0 } : globalStyles.codexPixelBorder}
            imageStyle={globalStyles.codexTextureOverlay}
          >
            <View style={isMobile ? { flex: 1, padding: 0 } : globalStyles.codexInnerpassages}>
              <View
                style={[
                  globalStyles.codexHeader,
                  { borderBottomColor: theme.theme.archiveBorder },
                  isMobile && { paddingTop: 32, paddingHorizontal: 16 },
                ]}
              >
                <Text
                  style={[
                    globalStyles.codexTitle,
                    { color: theme.theme.archiveText },
                  ]}
                >
                  📖 The Codex
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={globalStyles.codexCloseButton}
                >
                  <Ionicons name="close" size={24} color={theme.theme.archiveText} />
                </TouchableOpacity>
              </View>

              <View style={globalStyles.codexTypeSelector}>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    selectedTypeState === "journal" &&
                      globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedTypeState("journal")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { color: theme.theme.archiveText },
                    ]}
                  >
                    📝 Journal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    selectedTypeState === "draw" && globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedTypeState("draw")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { color: theme.theme.archiveText },
                    ]}
                  >
                    🎨 Draw
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    selectedTypeState === "voice" && globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedTypeState("voice")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { color: theme.theme.archiveText },
                    ]}
                  >
                    🎤 Voice
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={isMobile ? { flex: 1, flexDirection: 'column', minHeight: 0 } : globalStyles.codexpassagesContainer}>
                {/* Your Quest Section - Always visible on mobile */}
                <View style={isMobile ? { 
                  padding: 12, 
                  paddingBottom: 8,
                  maxHeight: isMobile ? 200 : undefined, // Limit height on mobile
                  minHeight: isMobile ? 120 : undefined   // Ensure minimum height
                } : globalStyles.codexPromptSection}>
                  <Text
                    style={[
                      globalStyles.codexSectionTitle,
                      { color: theme.theme.archiveText },
                      isMobile && { fontSize: 16, marginBottom: 8 }
                    ]}
                  >
                    Your Quest
                  </Text>
                  <View style={[
                    globalStyles.codexPromptList,
                    isMobile && { maxHeight: 150, overflow: 'hidden' }
                  ]}>
                    {hasPromptForCategory ? (
                      <TouchableOpacity
                        style={[
                          globalStyles.codexPromptItem,
                          globalStyles.codexSelectedPrompt,
                          isMobile && { padding: 8, marginBottom: 4 }
                        ]}
                        onPress={() => setSelectedPrompt(currentPrompt)}
                      >
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { color: theme.theme.archiveText },
                            isMobile && { fontSize: 14, lineHeight: 18 }
                          ]}
                        >
                          {currentPrompt?.text}
                        </Text>
                        <View style={globalStyles.codexPromptMeta}>
                          <Text
                            style={[
                              globalStyles.codexSkillCategory,
                              { color: theme.theme.archiveAccent },
                              isMobile && { fontSize: 12 }
                            ]}
                          >
                            {currentPrompt?.skill_category}
                          </Text>
                          <Text
                            style={[
                              globalStyles.codexDifficulty,
                              { color: theme.theme.archiveSubtext },
                              isMobile && { fontSize: 12 }
                            ]}
                          >
                            {currentPrompt?.difficulty}
                          </Text>
                        </View>
                        {/* Hide difficulty badges on mobile to save space */}
                        {!isMobile && (
                          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: theme.theme.archiveSubtext, fontSize: 10, marginRight: 8 }}>
                              Available difficulties:
                            </Text>
                            {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => {
                              const isAvailable = archive.completedStories.size >= 
                                (difficulty === 'Beginner' ? 0 : 
                                 difficulty === 'Intermediate' ? 3 : 6);
                              return (
                                <View
                                  key={difficulty}
                                  style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    marginRight: 4,
                                    borderRadius: 4,
                                    backgroundColor: isAvailable 
                                      ? theme.theme.archiveAccent 
                                      : 'rgba(255,255,255,0.1)',
                                    opacity: isAvailable ? 1 : 0.3
                                  }}
                                >
                                  <Text style={{
                                    color: isAvailable ? '#fff' : theme.theme.archiveSubtext,
                                    fontSize: 8,
                                    fontWeight: '600'
                                  }}>
                                    {difficulty}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={[
                        globalStyles.codexPromptItem,
                        isMobile && { padding: 8, marginBottom: 4 }
                      ]}>
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { color: theme.theme.archiveSubtext },
                            isMobile && { fontSize: 14, lineHeight: 18 }
                          ]}
                        >
                          {loading 
                            ? "Loading your quest..." 
                            : `No ${selectedTypeState} quest available yet. Explore more stories to unlock new prompts!`                          }
                        </Text>
                        {!loading && (
                          <TouchableOpacity
                            style={{
                              marginTop: 12,
                              padding: 8,
                              backgroundColor: theme.theme.archiveAccent,
                              borderRadius: 6,
                              alignSelf: 'flex-start'
                            }}
                            onPress={() => {
                              // Retry loading prompts
                              const loadPrompts = async () => {
                                setLoading(true);
                                try {
                                  const fallbackAreas = ['journal', 'draw', 'voice'];
                                  const completedStoriesArray = Array.from(archive.completedStories);
                                  await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
                                } catch (error) {
                                  console.warn('Retry failed:', error);
                                } finally {
                                  setLoading(false);
                                }
                              };
                              loadPrompts();
                            }}
                          >
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                              Retry Loading
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* Input Section - Takes remaining space on mobile */}
                <View style={isMobile ? { 
                  flex: 1, 
                  minHeight: 0, 
                  minWidth: 0, 
                  paddingHorizontal: 12,
                  paddingTop: 8
                } : globalStyles.codexInputSection}>
                  {selectedPrompt && selectedTypeState === "journal" && (
                    <TextInput
                      style={[
                        globalStyles.codexJournalInput,
                        { color: theme.theme.archiveText },
                        isMobile && { 
                          flex: 1, 
                          minHeight: 100,
                          fontSize: 14,
                          padding: 12
                        }
                      ]}
                      multiline
                      placeholder="Write your thoughts here..."
                      placeholderTextColor={
                        theme.theme.archiveMode === "dark" ? "#e0d6c3" : "#7a5c2e"
                      }
                      value={passages}
                      onChangeText={setpassages}
                    />
                  )}
                  {selectedPrompt && selectedTypeState === "draw" && (
                    <View style={{ 
                      flex: 1, 
                      minHeight: 0, 
                      minWidth: 0,
                      maxHeight: isMobile ? 300 : undefined // Limit height on mobile
                    }}>
                      <DrawingCanvas
                        onSave={(paths) => {
                          try {
                            setDrawingPaths(paths);
                            setpassages(JSON.stringify(paths));
                          } catch (error) {
                            console.error('Error saving drawing:', error);
                            Alert.alert('Error', 'Failed to save drawing. Please try again.');
                          }
                        }}
                        onCancel={() => {
                          try {
                            setDrawingPaths([]);
                            setpassages("");
                          } catch (error) {
                            console.error('Error canceling drawing:', error);
                          }
                        }}
                      />
                    </View>
                  )}
                  {selectedPrompt && selectedTypeState === "voice" && (
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: isMobile ? 200 : undefined
                    }}>
                      <VoiceMemoRecorder
                        onSave={(audioUri) => {
                          setpassages(audioUri);
                        }}
                        theme={theme.theme}
                      />
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  globalStyles.codexSaveButton,
                  (!selectedPrompt || !passages) &&
                    globalStyles.codexDisabledButton,
                  {
                    borderColor: theme.theme.archiveBorder,
                    backgroundColor:
                      theme.theme.archiveMode === "dark"
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.1)",
                  },
                ]}
                onPress={handleSave}
                disabled={!selectedPrompt || !passages}
              >
                <Text
                  style={[
                    globalStyles.codexSaveButtonText,
                    { color: theme.theme.archiveText },
                  ]}
                >
                  Save to Codex
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

export default CodexModal;
