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
const { width, height } = Dimensions.get("window");
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

  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    // Load category-specific prompts using the new system
    const loadPrompts = async () => {
      try {
        const completedStoriesArray = Array.from(archive.completedStories);
        await wellness.loadCategoryPrompts(unlockedAreas, completedStoriesArray);
      } catch (error) {
        console.error('Error loading prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();
  }, [visible, unlockedAreas, archive.completedStories, wellness]);

  const handleSave = async () => {
    if (selectedPrompt && passages) {
      try {
        // Show success alert
        Alert.alert(
          "Entry Saved",
          "Your journal entry has been saved to your Codex.",
          [{ text: "OK" }]
        );        // Call the original onSave
        onSave({
          type: selectedType,
          passages,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        // Refresh prompts to potentially get new ones
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
    if (hasPromptForCategory && !selectedPrompt) {
      setSelectedPrompt(currentPrompt);
    } else if (!hasPromptForCategory) {
      setSelectedPrompt(null);
    }
  }, [selectedType, currentPrompt, hasPromptForCategory, selectedPrompt]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={globalStyles.codexModalOverlay}>
        <View style={globalStyles.codexModalpassages}>
          <ImageBackground
            source={parchmentSource}
            style={globalStyles.codexPixelBorder}
            imageStyle={globalStyles.codexTextureOverlay}
          >
            <View style={globalStyles.codexInnerpassages}>
              <View
                style={[
                  globalStyles.codexHeader,
                  { borderBottomColor: theme.theme.archiveBorder },
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

              <View style={globalStyles.codexpassagesContainer}>                <View style={globalStyles.codexPromptSection}>
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

                <View style={globalStyles.codexInputSection}>
                  <Text
                    style={[
                      globalStyles.codexSectionTitle,
                      { color: theme.theme.archiveText },
                    ]}
                  >
                    Your Chronicle
                  </Text>
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
                  )}
                  {selectedPrompt && selectedType === "voice" && (
                    <View style={globalStyles.codexVoicePlaceholder}>
                      <Ionicons
                        name="mic"
                        size={48}
                        color={theme.theme.archiveText}
                      />
                      <Text
                        style={[
                          globalStyles.codexVoiceText,
                          { color: theme.theme.archiveText },
                        ]}
                      >
                        Voice recording coming soon...
                      </Text>
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
