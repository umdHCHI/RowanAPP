import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../context/MasterStateContext";
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
  unlockedAreas,
}: CodexModalProps) => {
  const { wellness, archive, theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const parchmentSource =
    theme.theme.archiveMode === "dark"
      ? require("../../assets/textures/journal_page-dark.png")
      : require("../../assets/textures/journal_page-light.png");

  const [selectedType, setSelectedType] = useState<
    "journal" | "draw" | "voice"
  >("journal");
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [passages, setpassages] = useState("");
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);

  // Load prompts only when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('🔄 Loading prompts for CodexModal...');
      setLoading(true);
      
      const loadPrompts = async () => {
        try {
          const completedStoriesArray = Array.from(archive.completedStories);
          await wellness.loadCategoryPrompts(unlockedAreas, completedStoriesArray);
          console.log('✅ Prompts loaded successfully');
        } catch (error) {
          console.error('Error loading prompts:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadPrompts();
    }
  }, [visible]); // Only depend on visible state



  const handleSave = async () => {
    if (selectedPrompt && passages) {
      try {
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

        // Call the original onSave
        onSave({
          type: selectedType,
          passages,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        // Refresh prompts to get a new one (since the current one is now inactive)
        const completedStoriesArray = Array.from(archive.completedStories);
        await wellness.loadCategoryPrompts(unlockedAreas, completedStoriesArray);

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
  const currentPrompt = wellness.categoryPrompts[selectedType];
  const hasPromptForCategory = currentPrompt !== null;

  // Set the selected prompt when switching categories
  useEffect(() => {
    console.log(`🔄 Type changed to: ${selectedType}, hasPrompt: ${hasPromptForCategory}`);
    if (hasPromptForCategory && !selectedPrompt) {
      setSelectedPrompt(currentPrompt);
    } else if (!hasPromptForCategory) {
      setSelectedPrompt(null);
    }
  }, [selectedType, hasPromptForCategory]); // Remove currentPrompt dependency

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={!isMobile}
      onRequestClose={onClose}
    >
      <View style={isMobile ? { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' } : globalStyles.codexModalOverlay}>
        <View style={isMobile ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : globalStyles.codexModalpassages}>
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
                    selectedType === "journal" &&
                      globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedType("journal")}
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
                    selectedType === "draw" && globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedType("draw")}
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
                    selectedType === "voice" && globalStyles.codexSelectedType,
                  ]}
                  onPress={() => setSelectedType("voice")}
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
                <View style={isMobile ? { padding: 12, paddingBottom: 0 } : globalStyles.codexPromptSection}>
                  <Text
                    style={[
                      globalStyles.codexSectionTitle,
                      { color: theme.theme.archiveText },
                    ]}
                  >
                    Your Quest
                  </Text>
                  <View style={globalStyles.codexPromptList}>
                    {hasPromptForCategory ? (
                      <TouchableOpacity
                        style={[
                          globalStyles.codexPromptItem,
                          globalStyles.codexSelectedPrompt,
                        ]}
                        onPress={() => setSelectedPrompt(currentPrompt)}
                      >
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { color: theme.theme.archiveText },
                          ]}
                        >
                          {currentPrompt?.text}
                        </Text>
                        <View style={globalStyles.codexPromptMeta}>
                          <Text
                            style={[
                              globalStyles.codexSkillCategory,
                              { color: theme.theme.archiveAccent },
                            ]}
                          >
                            {currentPrompt?.skill_category}
                          </Text>
                          <Text
                            style={[
                              globalStyles.codexDifficulty,
                              { color: theme.theme.archiveSubtext },
                            ]}
                          >
                            {currentPrompt?.difficulty}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={globalStyles.codexPromptItem}>
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { color: theme.theme.archiveSubtext },
                          ]}
                        >
                          {loading 
                            ? "Loading your quest..." 
                            : `No ${selectedType} quest available yet. Explore more stories to unlock new prompts!`                          }
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={isMobile ? { flex: 1, minHeight: 0, minWidth: 0, justifyContent: 'center' } : globalStyles.codexInputSection}>
                  {selectedPrompt && selectedType === "journal" && (
                    <TextInput
                      style={[
                        globalStyles.codexJournalInput,
                        { color: theme.theme.archiveText },
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
                  {selectedPrompt && selectedType === "draw" && (
                    <View style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                      <DrawingCanvas
                        onSave={(paths) => {
                          setDrawingPaths(paths);
                          setpassages(JSON.stringify(paths));
                        }}
                        onCancel={() => {
                          setDrawingPaths([]);
                          setpassages("");
                        }}
                      />
                    </View>
                  )}
                  {selectedPrompt && selectedType === "voice" && (
                    <VoiceMemoRecorder
                      onSave={(audioUri) => {
                        setpassages(audioUri);
                      }}
                      theme={theme.theme}
                    />
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
